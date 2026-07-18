/**
 * yoinks WebUI server
 *
 * Starts an HTTP server that serves a single-page UI and exposes a
 * small REST+SSE API so the UI can probe URLs, pick formats, and
 * stream download progress — all without touching the Ink/TTY CLI.
 *
 * Environment variables:
 *   PORT          — listening port (default 3000)
 *   OUT_DIR       — output directory (default ~/Downloads)
 *   BASIC_AUTH    — optional "user:pass" to enable HTTP Basic Auth
 *   HOST          — bind address (default 0.0.0.0 for LAN access)
 */

import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import {createRequire} from 'node:module'
import {buildChoices, download, ensureYtDlp, findFfmpeg, probe} from '../lib/ytdlp.js'

const VERSION: string = createRequire(import.meta.url)('../../package.json').version

const PORT = Number(process.env['PORT'] ?? 3000)
const HOST = process.env['HOST'] ?? '0.0.0.0'
const OUT_DIR = process.env['OUT_DIR'] ?? path.join(os.homedir(), 'Downloads')
const BASIC_AUTH = process.env['BASIC_AUTH'] // "user:pass"

// ── auth helper ──────────────────────────────────────────────────────────────

function checkAuth(req: http.IncomingMessage): boolean {
  if (!BASIC_AUTH) return true
  const header = req.headers['authorization'] ?? ''
  if (!header.startsWith('Basic ')) return false
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8')
  return decoded === BASIC_AUTH
}

function unauthorized(res: http.ServerResponse): void {
  res.writeHead(401, {
    'WWW-Authenticate': 'Basic realm="yoinks"',
    'Content-Type': 'text/plain',
  })
  res.end('Unauthorized')
}

// ── in-memory job registry ───────────────────────────────────────────────────

type JobStatus =
  | {phase: 'probing'; status: string}
  | {phase: 'picking'; title: string; uploader?: string; duration?: number; choices: ChoiceDTO[]}
  | {phase: 'downloading'; choiceLabel: string; progress?: ProgressDTO; processing: boolean}
  | {phase: 'done'; filepath: string}
  | {phase: 'error'; message: string}

type ChoiceDTO = {index: number; label: string; kind: 'video' | 'audio'}
type ProgressDTO = {
  downloadedBytes: number
  totalBytes?: number
  speed?: number
  eta?: number
  part: number
  totalParts: number
  percent?: number
}

type Job = {
  id: string
  url: string
  urls: string[]
  status: JobStatus
  abort: AbortController
  /** SSE listeners waiting for status updates */
  listeners: Array<(data: string) => void>
}

const jobs = new Map<string, Job>()

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function notifyListeners(job: Job): void {
  const data = JSON.stringify(job.status)
  for (const fn of job.listeners) fn(data)
  // clean up done/error jobs after a grace period
  if (job.status.phase === 'done' || job.status.phase === 'error') {
    setTimeout(() => jobs.delete(job.id), 60_000)
  }
}

// ── cached ytdlp binary path ─────────────────────────────────────────────────

let ytdlpBin = ''

// ── HTML UI ──────────────────────────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>yoinks ${VERSION}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:#0f0f11;color:#e4e4e7;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:2rem 1rem}
h1{font-size:2rem;font-weight:800;letter-spacing:-.03em;margin-bottom:.25rem}
.sub{color:#71717a;font-size:.85rem;margin-bottom:2rem}
.card{background:#18181b;border:1px solid #27272a;border-radius:.75rem;padding:1.5rem;width:100%;max-width:560px}
label{display:block;font-size:.8rem;color:#a1a1aa;margin-bottom:.4rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em}
input[type=text],input[type=url]{width:100%;background:#09090b;border:1px solid #3f3f46;border-radius:.5rem;padding:.65rem .85rem;color:#e4e4e7;font-size:1rem;outline:none;transition:border-color .15s}
input[type=text]:focus,input[type=url]:focus{border-color:#6366f1}
.row{display:flex;gap:.75rem;margin-bottom:1rem;align-items:stretch}
.row>div{flex:1}
.row button{flex-shrink:0;padding:.6rem 1.5rem;font-size:1rem}
button{background:#6366f1;color:#fff;border:none;border-radius:.5rem;padding:.6rem 1.2rem;font-size:.9rem;font-weight:600;cursor:pointer;transition:background .15s}
button:hover{background:#5255d9}
button:disabled{background:#3f3f46;cursor:default;color:#71717a}
.choices{margin-top:1rem;display:flex;flex-direction:column;gap:.5rem}
.choice-btn{background:#27272a;color:#e4e4e7;text-align:left;border-radius:.5rem;padding:.6rem 1rem;font-size:.9rem;transition:background .15s}
.choice-btn:hover{background:#3f3f46}
.choice-btn.audio{border-left:3px solid #6366f1}
.choice-btn.video{border-left:3px solid #22d3ee}
.progress-wrap{margin-top:1rem}
.prog-label{font-size:.85rem;color:#a1a1aa;margin-bottom:.4rem}
.prog-bar-bg{background:#27272a;border-radius:9999px;height:8px;overflow:hidden}
.prog-bar{background:#6366f1;height:100%;border-radius:9999px;transition:width .3s}
.meta{font-size:.75rem;color:#71717a;margin-top:.35rem}
.done-box{margin-top:1rem;background:#052e16;border:1px solid #166534;border-radius:.5rem;padding:.75rem 1rem}
.done-box h3{color:#4ade80;font-size:.9rem;margin-bottom:.25rem}
.done-path{font-family:monospace;font-size:.78rem;color:#86efac;word-break:break-all}
.err-box{margin-top:1rem;background:#2d0a0a;border:1px solid #7f1d1d;border-radius:.5rem;padding:.75rem 1rem;font-size:.85rem;color:#f87171}
.outdir-hint{font-size:.72rem;color:#52525b;margin-top:.3rem}
#status-text{font-size:.85rem;color:#a1a1aa;margin-top:.75rem;min-height:1.2em}
</style>
</head>
<body>
<h1>yoinks</h1>
<p class="sub">yoink any video. paste. yoink. done. &nbsp;·&nbsp; v${VERSION}</p>
<div class="card" id="app">
  <div>
    <label for="url-input">Video URL(s) <span style="font-size:0.7rem;color:#71717a;text-transform:none">(Newlines/commas for playlists/batch)</span></label>
    <div class="row">
      <div>
        <textarea id="url-input" rows="3" placeholder="https://youtube.com/watch?v=&#10;https://x.com/status/&#10;..." autocomplete="off" spellcheck="false" style="width:100%;background:#09090b;border:1px solid #3f3f46;border-radius:.5rem;padding:.65rem .85rem;color:#e4e4e7;font-size:1rem;outline:none;transition:border-color .15s;resize:vertical;font-family:monospace;"></textarea>
      </div>
      <button id="probe-btn" onclick="startProbe()">Probe</button>
    </div>
    <div>
      <label for="outdir-input">Output directory</label>
      <input id="outdir-input" type="text" value="/downloads" placeholder="/downloads"/>
      <p class="outdir-hint">Inside Docker this maps to your host directory (see docker-compose.yml)</p>
    </div>
  </div>
  <p id="status-text"></p>
  <div id="choices-area"></div>
  <div id="progress-area"></div>
  <div id="result-area"></div>
</div>
<script>
let jobId = null
let eventSource = null

function setStatus(msg){document.getElementById('status-text').textContent = msg}
function clearAreas(){
  document.getElementById('choices-area').innerHTML=''
  document.getElementById('progress-area').innerHTML=''
  document.getElementById('result-area').innerHTML=''
}

async function startProbe(){
  const url = document.getElementById('url-input').value.trim()
  if(!url){setStatus('Please paste a URL.');return}
  clearAreas()
  setStatus('Probing…')
  if(eventSource){eventSource.close();eventSource=null}
  document.getElementById('probe-btn').disabled=true
  try{
    const res = await fetch('/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})})
    if(!res.ok){const e=await res.json();setStatus('Error: '+(e.error||res.status));document.getElementById('probe-btn').disabled=false;return}
    const {jobId:id,count}=await res.json()
    jobId=id
    listenJob(id)
  }catch(e){setStatus('Network error: '+e.message);document.getElementById('probe-btn').disabled=false}
}

function listenJob(id){
  eventSource=new EventSource('/api/jobs/'+id+'/events')
  eventSource.onmessage=e=>{
    const s=JSON.parse(e.data)
    handleStatus(s,id)
  }
  eventSource.onerror=()=>{setStatus('Connection lost.');document.getElementById('probe-btn').disabled=false}
}

function handleStatus(s,id){
  if(s.phase==='probing'){
    setStatus(s.status)
  } else if(s.phase==='picking'){
    setStatus('')
    renderChoices(s,id)
  } else if(s.phase==='downloading'){
    setStatus('')
    renderProgress(s)
  } else if(s.phase==='done'){
    setStatus('')
    renderDone(s.filepath)
    document.getElementById('probe-btn').disabled=false
    if(eventSource){eventSource.close();eventSource=null}
  } else if(s.phase==='error'){
    setStatus('')
    renderError(s.message)
    document.getElementById('probe-btn').disabled=false
    if(eventSource){eventSource.close();eventSource=null}
  }
}

function renderChoices(s,id){
  const area=document.getElementById('choices-area')
  let html='<div style="margin-top:.75rem"><p style="font-size:.85rem;color:#a1a1aa;margin-bottom:.5rem"><strong style="color:#e4e4e7">'+esc(s.title)+'</strong>'
  if(s.uploader)html+=' &nbsp;·&nbsp; '+esc(s.uploader)
  html+='</p><div class="choices">'
  for(const c of s.choices){
    html+='<button class="choice-btn '+c.kind+'" onclick="startDownload(\\'' +id+'\\','+c.index+')">'+esc(c.label)+'</button>'
  }
  html+='</div></div>'
  area.innerHTML=html
}

function renderProgress(s){
  const area=document.getElementById('progress-area')
  const pct=s.progress&&s.progress.totalBytes?Math.round(s.progress.downloadedBytes/s.progress.totalBytes*100):null
  let meta=''
  if(s.processing){meta='⚙ processing…'}
  else if(s.progress){
    // If we're performing a batch download, enhance label to reflect total parts
    if(s.progress.totalParts > 1) {
      meta += '[Part ' + (s.progress.part + 1) + '/' + s.progress.totalParts + '] '
    }
    if(s.progress.speed)meta+=fmtSpeed(s.progress.speed)+'  '
    if(s.progress.eta)meta+=fmtEta(s.progress.eta)+' left  '
    if(pct!==null)meta+=pct+'%'
  }
  area.innerHTML='<div class="progress-wrap"><p class="prog-label">'+esc(s.choiceLabel)+'</p><div class="prog-bar-bg"><div class="prog-bar" style="width:'+(pct??0)+'%"></div></div><p class="meta">'+meta+'</p></div>'
}

function renderDone(fp){
  document.getElementById('progress-area').innerHTML=''
  document.getElementById('result-area').innerHTML='<div class="done-box"><h3>✓ Yoinked!</h3><p class="done-path">'+esc(fp)+'</p></div>'
}

function renderError(msg){
  document.getElementById('choices-area').innerHTML=''
  document.getElementById('progress-area').innerHTML=''
  document.getElementById('result-area').innerHTML='<div class="err-box">✗ '+esc(msg)+'</div>'
}

async function startDownload(id,choiceIndex){
  const outDir=document.getElementById('outdir-input').value.trim()||'/downloads'
  document.getElementById('choices-area').innerHTML=''
  document.getElementById('result-area').innerHTML=''
  setStatus('Starting download…')
  await fetch('/api/jobs/'+id+'/download',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({choiceIndex,outDir})})
}

function esc(s){if(!s)return '';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function fmtSpeed(bps){const k=bps/1024;if(k<1024)return k.toFixed(0)+'KB/s';return (k/1024).toFixed(1)+'MB/s'}
function fmtEta(s){const m=Math.floor(s/60);const ss=Math.floor(s%60);return m>0?m+'m '+ss+'s':ss+'s'}
</script>
</body>
</html>`

// ── JSON helpers ─────────────────────────────────────────────────────────────

function jsonOk(res: http.ServerResponse, body: unknown, status = 200): void {
  const data = JSON.stringify(body)
  res.writeHead(status, {'Content-Type': 'application/json'})
  res.end(data)
}

function jsonErr(res: http.ServerResponse, message: string, status = 400): void {
  res.writeHead(status, {'Content-Type': 'application/json'})
  res.end(JSON.stringify({error: message}))
}

async function readBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let buf = ''
    req.on('data', (chunk: unknown) => (buf += String(chunk)))
    req.on('end', () => {
      try {
        resolve(JSON.parse(buf))
      } catch {
        resolve({})
      }
    })
    req.on('error', reject)
  })
}

function parseUrlList(text: string): string[] {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0)
  // single-line: comma separated
  if (lines.length === 1 && lines[0]!.includes(',')) {
    return lines[0]!.split(',').map(u => u.trim()).filter(Boolean)
  }
  return lines
}

// ── route handler ─────────────────────────────────────────────────────────────

async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  if (!checkAuth(req)) return unauthorized(res)

  const url = req.url ?? '/'
  const method = req.method ?? 'GET'

  // Serve UI
  if (method === 'GET' && (url === '/' || url === '/index.html')) {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
    res.end(HTML)
    return
  }

  // POST /api/jobs — create a job (probe phase)
  if (method === 'POST' && url === '/api/jobs') {
    const body = (await readBody(req)) as {url?: string}
    const videoUrl = body.url?.trim()
    if (!videoUrl) return jsonErr(res, 'url is required')

    const id = makeId()
    const abort = new AbortController()
    const urls = parseUrlList(videoUrl)
    const job: Job = {
      id,
      url: videoUrl,
      urls,
      status: {phase: 'probing', status: urls.length > 1 ? `probing first of ${urls.length} URLs…` : 'warming up…'},
      abort,
      listeners: [],
    }
    jobs.set(id, job)
    jsonOk(res, {jobId: id, count: urls.length}, 201)

    // Run probe asynchronously
    void runProbe(job)
    return
  }

  // GET /api/jobs/:id/events — SSE stream
  const sseMatch = /^\/api\/jobs\/([a-z0-9]+)\/events$/.exec(url)
  if (method === 'GET' && sseMatch) {
    const job = jobs.get(sseMatch[1]!)
    if (!job) return jsonErr(res, 'job not found', 404)

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    // Send current status immediately
    res.write(`data: ${JSON.stringify(job.status)}\n\n`)

    const send = (data: string) => {
      res.write(`data: ${data}\n\n`)
    }
    job.listeners.push(send)

    req.on('close', () => {
      job.listeners = job.listeners.filter(fn => fn !== send)
    })
    return
  }

  // POST /api/jobs/:id/download — start download
  const dlMatch = /^\/api\/jobs\/([a-z0-9]+)\/download$/.exec(url)
  if (method === 'POST' && dlMatch) {
    const job = jobs.get(dlMatch[1]!)
    if (!job) return jsonErr(res, 'job not found', 404)
    if (job.status.phase !== 'picking') return jsonErr(res, 'job not in picking phase')

    const body = (await readBody(req)) as {choiceIndex?: number; outDir?: string}
    const status = job.status as Extract<JobStatus, {phase: 'picking'}>
    const choiceIndex = Number(body.choiceIndex ?? 0)
    const outDir = sanitizeOutDir(body.outDir)

    if (choiceIndex < 0 || choiceIndex >= status.choices.length) {
      return jsonErr(res, 'invalid choiceIndex')
    }

    jsonOk(res, {ok: true})
    void runDownload(job, choiceIndex, outDir)
    return
  }

  res.writeHead(404)
  res.end('Not found')
}

function sanitizeOutDir(raw?: string): string {
  if (!raw) return OUT_DIR
  // In Docker the UI sends the container-side path from <input> which is
  // preset to /downloads. Let callers override via the input field.
  // We just resolve it, no further validation — server runs trusted LAN.
  return path.resolve(raw)
}

// ── probe logic ───────────────────────────────────────────────────────────────

async function runProbe(job: Job): Promise<void> {
  const update = (s: JobStatus) => {
    job.status = s
    notifyListeners(job)
  }

  try {
    if (!ytdlpBin) {
      ytdlpBin = await ensureYtDlp(
        msg => update({phase: 'probing', status: msg}),
        job.abort.signal,
      )
    } else {
      update({phase: 'probing', status: 'fetching video info…'})
    }
    if (job.abort.signal.aborted) return

    update({phase: 'probing', status: 'fetching video info…'})
    // Probe the first URL in the batch to present format choices
    const firstUrl = job.urls[0]
    if (!firstUrl) throw new Error('No URLs to probe.')
    const {info, infoJsonPath} = await probe(ytdlpBin, firstUrl, job.abort.signal)
    if (job.abort.signal.aborted) return

    const choices = buildChoices(info)
    // Stash infoJsonPath on the job for the download phase
    ;(job as Job & {infoJsonPath?: string}).infoJsonPath = infoJsonPath

    update({
      phase: 'picking',
      title: job.urls.length > 1 ? `Batch download: ${job.urls.length} files` : info.title,
      uploader: job.urls.length > 1 ? undefined : info.uploader,
      duration: job.urls.length > 1 ? undefined : info.duration,
      choices: choices.map((c, i) => ({index: i, label: c.label, kind: c.kind})),
    })
    // Also stash choices array for download phase
    ;(job as Job & {choices?: ReturnType<typeof buildChoices>}).choices = choices
  } catch (error) {
    if (job.abort.signal.aborted) return
    update({phase: 'error', message: error instanceof Error ? error.message : String(error)})
  }
}

// ── download logic ────────────────────────────────────────────────────────────

async function runDownload(job: Job, choiceIndex: number, outDir: string): Promise<void> {
  const jobWithData = job as Job & {
    infoJsonPath?: string
    choices?: ReturnType<typeof buildChoices>
  }
  const choice = jobWithData.choices![choiceIndex]!

  const update = (s: JobStatus) => {
    job.status = s
    notifyListeners(job)
  }

  update({phase: 'downloading', choiceLabel: choice.label, processing: false})

  try {
    const ffmpegLocation = await findFfmpeg()
    const lastFilepaths: string[] = []

    for (let uIdx = 0; uIdx < job.urls.length; uIdx++) {
      if (job.abort.signal.aborted) return
      const currentUrl = job.urls[uIdx]!
      
      const base = {
        ytdlp: ytdlpBin,
        ffmpegLocation,
        url: currentUrl,
        choice,
        outDir,
      }

      const handlers = {
        onProgress: (progress: {
          downloadedBytes: number
          totalBytes?: number
          speed?: number
          eta?: number
          part: number
          totalParts: number
        }) => {
          update({
            phase: 'downloading',
            choiceLabel: job.urls.length > 1 
              ? `Downloading item ${uIdx + 1} of ${job.urls.length}…` 
              : choice.label,
            processing: false,
            progress: {
              ...progress,
              part: uIdx,
              totalParts: job.urls.length,
              percent: progress.totalBytes
                ? Math.round((progress.downloadedBytes / progress.totalBytes) * 100)
                : undefined,
            },
          })
        },
        onProcessing: () => {
          update({
            phase: 'downloading', 
            choiceLabel: job.urls.length > 1 
              ? `Processing item ${uIdx + 1} of ${job.urls.length}…` 
              : choice.label, 
            processing: true,
            progress: {
              downloadedBytes: 0,
              part: uIdx,
              totalParts: job.urls.length,
            }
          })
        },
      }

      let filepath: string
      try {
        // Reuse cached info JSON ONLY for the first URL if batch
        const useCache = uIdx === 0 && jobWithData.infoJsonPath
        filepath = await download(
          {...base, infoJsonPath: useCache ? jobWithData.infoJsonPath : undefined},
          handlers,
          job.abort.signal,
        )
      } catch (error) {
        if (job.abort.signal.aborted) throw error
        // retry with fresh extraction (expired URLs)
        update({
          phase: 'downloading',
          choiceLabel: job.urls.length > 1 ? `Retrying item ${uIdx + 1}…` : choice.label,
          processing: false
        })
        filepath = await download(base, handlers, job.abort.signal)
      }
      lastFilepaths.push(filepath)
    }

    update({
      phase: 'done',
      filepath: job.urls.length > 1 
        ? `${job.urls.length} files saved to ${outDir}` 
        : lastFilepaths[0] || outDir
    })
  } catch (error) {
    if (job.abort.signal.aborted) return
    update({phase: 'error', message: error instanceof Error ? error.message : String(error)})
  }
}

// ── server bootstrap ──────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch(err => {
    console.error('[yoinks-server] unhandled error:', err)
    if (!res.headersSent) {
      res.writeHead(500)
      res.end('Internal server error')
    }
  })
})

server.listen(PORT, HOST, () => {
  const addresses: string[] = []
  // Print LAN addresses for easy copy-paste
  const ifaces = os.networkInterfaces()
  for (const list of Object.values(ifaces)) {
    for (const iface of list ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(`http://${iface.address}:${PORT}`)
      }
    }
  }
  console.log(`\nyoinks WebUI v${VERSION}`)
  console.log(`  Local:   http://localhost:${PORT}`)
  for (const addr of addresses) {
    console.log(`  Network: ${addr}`)
  }
  console.log(`  Output:  ${OUT_DIR}`)
  if (BASIC_AUTH) console.log(`  Auth:    basic auth enabled`)
  console.log()
})

process.on('SIGTERM', () => server.close())
process.on('SIGINT', () => server.close())
