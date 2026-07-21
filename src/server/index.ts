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
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import crypto from 'node:crypto'
import {createRequire} from 'node:module'
import {buildChoices, download, ensureYtDlp, findFfmpeg, probe} from '../lib/ytdlp.js'
import {saveDownloadHistory} from '../lib/history.js'
import {startTelegramBot} from './telegram.js'
import {HTML} from './ui.js'
import {ChoiceDTO, Job, JobStatus, ProgressDTO, jobs, makeId, notifyListeners} from './jobs.js'
import {handleStreamFile, listMediaFiles, resolveSafePath} from './gallery.js'

const VERSION: string = createRequire(import.meta.url)('../../package.json').version

const PORT = Number(process.env['PORT'] ?? 3000)
const HOST = process.env['HOST'] ?? '0.0.0.0'
const OUT_DIR = process.env['OUT_DIR'] ?? path.join(os.homedir(), 'Downloads')
const BASIC_AUTH = process.env['BASIC_AUTH'] // "user:pass"
const AUTH_PASSWORD = process.env['AUTH_PASSWORD'] ?? (BASIC_AUTH ? (BASIC_AUTH.split(':')[1] ?? BASIC_AUTH) : undefined)
const AUTH_SECRET = crypto.randomBytes(16).toString('hex')

// ── auth helper ──────────────────────────────────────────────────────────────

function getExpectedToken(): string {
  if (!AUTH_PASSWORD) return ''
  return crypto.createHash('sha256').update(`${AUTH_PASSWORD}:${AUTH_SECRET}`).digest('hex')
}

function parseCookies(req: http.IncomingMessage): Record<string, string> {
  const list: Record<string, string> = {}
  const rc = req.headers['cookie']
  if (rc) {
    for (const cookie of rc.split(';')) {
      const parts = cookie.split('=')
      const name = parts.shift()?.trim()
      if (name) {
        list[name] = decodeURIComponent(parts.join('=').trim())
      }
    }
  }
  return list
}

function isAuthEnabled(): boolean {
  return Boolean(AUTH_PASSWORD)
}

function checkAuth(req: http.IncomingMessage): boolean {
  if (!isAuthEnabled()) return true

  // 1. Check session cookie
  const cookies = parseCookies(req)
  const token = cookies['yoinks_session']
  if (token && token === getExpectedToken()) return true

  // 2. Check HTTP Basic Auth
  const header = req.headers['authorization'] ?? ''
  if (header.startsWith('Basic ')) {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8')
    if (BASIC_AUTH && decoded === BASIC_AUTH) return true
    const parts = decoded.split(':')
    const pass = parts[1] ?? parts[0]
    if (pass === AUTH_PASSWORD) return true
  }

  return false
}

function unauthorized(res: http.ServerResponse, req?: http.IncomingMessage): void {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  // Only send WWW-Authenticate for direct browser page/HTML requests to allow native basic auth
  // Avoid WWW-Authenticate for SSE event streams or API calls to prevent browser EventSource hangs/popups
  const isSseOrApi = req && (req.headers.accept?.includes('text/event-stream') || req.url?.startsWith('/api/'))
  if (BASIC_AUTH && !isSseOrApi) {
    headers['WWW-Authenticate'] = 'Basic realm="yoinks"'
  }
  res.writeHead(401, headers)
  res.end(JSON.stringify({error: 'Unauthorized'}))
}

// ── cached ytdlp binary path ─────────────────────────────────────────────────

let ytdlpBin = ''

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

async function readBody(req: http.IncomingMessage, maxBytes = 1_048_576): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let buf = ''
    let length = 0
    req.on('data', (chunk: unknown) => {
      const chunkBuf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
      length += chunkBuf.length
      if (length > maxBytes) {
        req.destroy()
        reject(new Error('Payload too large'))
        return
      }
      buf += chunkBuf.toString('utf8')
    })
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
  const url = req.url ?? '/'
  const method = req.method ?? 'GET'

  // Public Auth Routes
  if (method === 'GET' && url === '/api/auth/check') {
    return jsonOk(res, {
      authEnabled: isAuthEnabled(),
      authenticated: checkAuth(req),
    })
  }

  if (method === 'POST' && url === '/api/auth/login') {
    const body = (await readBody(req)) as {password?: string}
    const inputPass = body.password?.trim()
    if (!isAuthEnabled()) {
      return jsonOk(res, {ok: true, message: 'Auth is not enabled'})
    }
    if (inputPass && (inputPass === AUTH_PASSWORD || (BASIC_AUTH && inputPass === BASIC_AUTH.split(':')[1]))) {
      const token = getExpectedToken()
      res.writeHead(200, {
        'Set-Cookie': `yoinks_session=${token}; Path=/; HttpOnly; SameSite=Lax`,
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ok: true}))
      return
    }
    return jsonErr(res, 'Invalid password or PIN', 401)
  }

  if (method === 'POST' && url === '/api/auth/logout') {
    res.writeHead(200, {
      'Set-Cookie': 'yoinks_session=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'Content-Type': 'application/json',
    })
    res.end(JSON.stringify({ok: true}))
    return
  }

  if (!checkAuth(req)) return unauthorized(res, req)

  // Auto-set session cookie if client logged in via Basic Auth header
  if (isAuthEnabled() && req.headers['authorization']?.startsWith('Basic ') && !parseCookies(req)['yoinks_session']) {
    res.setHeader('Set-Cookie', `yoinks_session=${getExpectedToken()}; Path=/; HttpOnly; SameSite=Lax`)
  }

  // Serve UI
  if (method === 'GET' && (url === '/' || url === '/index.html')) {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
    res.end(HTML)
    return
  }

  // GET /api/files — list downloaded media files
  if (method === 'GET' && url === '/api/files') {
    try {
      const files = await listMediaFiles(OUT_DIR, OUT_DIR)
      // Sort newest first
      files.sort((a, b) => b.mtime - a.mtime)
      return jsonOk(res, {files, outDir: OUT_DIR})
    } catch (err) {
      return jsonErr(res, err instanceof Error ? err.message : String(err), 500)
    }
  }

  const parsedUrl = new URL(url, `http://${req.headers.host || 'localhost'}`)

  // GET /api/files/download — download/export a file
  if (method === 'GET' && parsedUrl.pathname === '/api/files/download') {
    try {
      const queryPath = parsedUrl.searchParams.get('path')
      if (!queryPath) return jsonErr(res, 'path parameter is required', 400)

      const resolved = resolveSafePath(OUT_DIR, queryPath)
      if (!resolved) {
        return jsonErr(res, 'Access denied: Path traversal attempt', 403)
      }

      if (!fs.existsSync(resolved)) {
        return jsonErr(res, 'File not found', 404)
      }

      const filename = path.basename(resolved)
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      })
      fs.createReadStream(resolved).pipe(res)
      return
    } catch (err) {
      return jsonErr(res, err instanceof Error ? err.message : String(err), 500)
    }
  }

  // GET /api/files/stream — stream/play a file
  if (method === 'GET' && parsedUrl.pathname === '/api/files/stream') {
    try {
      const queryPath = parsedUrl.searchParams.get('path')
      if (!queryPath) return jsonErr(res, 'path parameter is required', 400)

      const resolved = resolveSafePath(OUT_DIR, queryPath)
      if (!resolved) {
        return jsonErr(res, 'Access denied: Path traversal attempt', 403)
      }

      if (!fs.existsSync(resolved)) {
        return jsonErr(res, 'File not found', 404)
      }

      const ext = path.extname(resolved).toLowerCase()
      handleStreamFile(req, res, resolved, ext)
      return
    } catch (err) {
      return jsonErr(res, err instanceof Error ? err.message : String(err), 500)
    }
  }

  // DELETE /api/files — delete a file
  if (method === 'DELETE' && parsedUrl.pathname === '/api/files') {
    try {
      const queryPath = parsedUrl.searchParams.get('path')
      if (!queryPath) return jsonErr(res, 'path parameter is required', 400)

      const resolved = resolveSafePath(OUT_DIR, queryPath)
      if (!resolved) {
        return jsonErr(res, 'Access denied: Path traversal attempt', 403)
      }

      if (!fs.existsSync(resolved)) {
        return jsonErr(res, 'File not found', 404)
      }

      await fsPromises.unlink(resolved)
      return jsonOk(res, {ok: true, message: 'File deleted successfully'})
    } catch (err) {
      return jsonErr(res, err instanceof Error ? err.message : String(err), 500)
    }
  }

  // POST /api/jobs — create a job (probe phase)
  if (method === 'POST' && url === '/api/jobs') {
    let body: {url?: string}
    try {
      body = (await readBody(req)) as {url?: string}
    } catch (err) {
      if (err instanceof Error && err.message === 'Payload too large') {
        return jsonErr(res, 'Payload too large', 413)
      }
      return jsonErr(res, 'Invalid request body', 400)
    }
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

    let body: {choiceIndex?: number; outDir?: string; subfolder?: string; embedChapters?: boolean}
    try {
      body = (await readBody(req)) as {choiceIndex?: number; outDir?: string; subfolder?: string; embedChapters?: boolean}
    } catch (err) {
      if (err instanceof Error && err.message === 'Payload too large') {
        return jsonErr(res, 'Payload too large', 413)
      }
      return jsonErr(res, 'Invalid request body', 400)
    }

    const status = job.status as Extract<JobStatus, {phase: 'picking'}>
    const choiceIndex = Number(body.choiceIndex ?? 0)
    let outDir = sanitizeOutDir(body.outDir)
    if (body.subfolder) {
      const cleanedSub = body.subfolder.trim().replace(/^[\/\\]+|[\/\\]+$/g, '')
      if (cleanedSub) {
        outDir = path.join(outDir, cleanedSub)
      }
    }

    if (choiceIndex < 0 || choiceIndex >= status.choices.length) {
      return jsonErr(res, 'invalid choiceIndex')
    }

    jsonOk(res, {ok: true})
    void runDownload(job, choiceIndex, outDir, Boolean(body.embedChapters))
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

async function runDownload(job: Job, choiceIndex: number, outDir: string, embedChapters = false): Promise<void> {
  const jobWithData = job as Job & {
    infoJsonPath?: string
    choices?: ReturnType<typeof buildChoices>
  }
  const choice = jobWithData.choices![choiceIndex]!
  const choiceArgs = [...choice.args]
  if (embedChapters) {
    choiceArgs.push('--embed-chapters', '--embed-metadata')
  }
  const finalizedChoice = { ...choice, args: choiceArgs }

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
        choice: finalizedChoice,
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
      let fileSize: number | undefined
      try {
        const stat = await fsPromises.stat(filepath)
        fileSize = stat.size
      } catch {}
      void saveDownloadHistory({
        title: job.urls.length > 1 ? path.basename(filepath) : ((job.status as any).title ?? path.basename(filepath)),
        url: currentUrl,
        filepath,
        size: fileSize,
      })
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
    if (err instanceof Error && err.message === 'Payload too large') {
      if (!res.headersSent) {
        jsonErr(res, 'Payload too large', 413)
      }
      return
    }
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

  // Start Telegram bot (non-blocking, runs alongside HTTP server)
  startTelegramBot().catch(err => {
    console.error('[telegram] Bot failed to start:', err)
  })
})

process.on('SIGTERM', () => server.close())
process.on('SIGINT', () => server.close())
