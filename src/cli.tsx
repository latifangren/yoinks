import React from 'react'
import {createRequire} from 'node:module'
import os from 'node:os'
import path from 'node:path'
import {render} from 'ink'
import {App, type Outcome} from './app.js'
import {captureFrames} from './lib/click-map.js'
import {parseArgs} from './lib/args.js'
import {readClipboard} from './lib/clipboard.js'
import {isProbablyUrl} from './lib/platforms.js'
import {buildChoices, download, ensureYtDlp, findFfmpeg, probe, updateYtDlp} from './lib/ytdlp.js'

// read at runtime from the shipped package.json so npm version bumps
// can't drift from a hardcoded constant
const VERSION: string = createRequire(import.meta.url)('../package.json').version

const HELP = `
  yoinks — yoink any video. paste. yoink. done.

  Usage
    $ yoinks [url]

  Examples
    $ yoinks https://youtu.be/dQw4w9WgXcQ
    $ yoinks https://x.com/user/status/123456
    $ yoinks                 (prompts for a url)

  Options
    --theme <mode>     use auto, light, or dark for this run
    -o, --output <dir> save downloads to <dir> instead of ~/Downloads
    --best             download best video quality directly (no picker)
    --mp3              download best audio quality directly (no picker)
    --embed-chapters   embed chapter markers and metadata
    --update           self-update yt-dlp binary
    -h, --help         show this help
    -v, --version      show version

  Downloads are saved to ~/Downloads.
  Powered by yt-dlp — YouTube, X, Instagram, Threads, TikTok & 1800+ sites.
`

const args = parseArgs(process.argv.slice(2))

if (args.error) {
  console.error(`yoinks: ${args.error}\nTry “yoinks --help” for usage.`)
  process.exit(1)
}

if (args.help) {
  console.log(HELP)
  process.exit(0)
}

if (args.version) {
  console.log(VERSION)
  process.exit(0)
}

// ── --update mode ──────────────────────────────────────────────────────────────

if (args.update) {
  const ytdlp = await ensureYtDlp(() => {})
  try {
    const result = await updateYtDlp(ytdlp)
    console.log(result)
    process.exit(0)
  } catch (error) {
    console.error('yoinks: yt-dlp update failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// ── --best / --mp3 non-interactive mode ───────────────────────────────────────

if (args.best || args.mp3) {
  const url = args.initialUrl
  if (!url) {
    console.error('yoinks: a url is required with --best or --mp3')
    process.exit(1)
  }

  try {
    const ytdlp = await ensureYtDlp(() => {})
    const ffmpegLocation = await findFfmpeg()
    const {info} = await probe(ytdlp, url)

    const choices = buildChoices(info)
    const choice = args.mp3
      ? choices.find(c => c.kind === 'audio') ?? choices[choices.length - 1]!
      : choices[0]!

    if (args.embedChapters) {
      choice.args.push('--embed-chapters', '--embed-metadata')
    }

    console.error(`yoinks: downloading ${choice.label} …`)

    const handlers = {
      onProgress: (progress: {downloadedBytes: number; totalBytes?: number; speed?: number; eta?: number}) => {
        const pct = progress.totalBytes
          ? ` ${Math.round((progress.downloadedBytes / progress.totalBytes) * 100)}%`
          : ''
        const speed = progress.speed ? ` ${(progress.speed / 1024 / 1024).toFixed(1)}MiB/s` : ''
        console.error(`\ryoinks:${pct}${speed}   `)
      },
      onProcessing: () => {
        console.error('\ryoinks: processing…')
      },
    }

    const filepath = await download({ytdlp, ffmpegLocation, url, choice, outDir: args.outDir ?? path.join(os.homedir(), 'Downloads')}, handlers)
    console.error('\ryoinks: done ✓')
    console.log(filepath)
    process.exit(0)
  } catch (error) {
    console.error('\ryoinks: download failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// ── Interactive (Ink TUI) mode ────────────────────────────────────────────────

const initialUrl = args.initialUrl
const initialThemeMode = args.themeMode ?? 'auto'

const isTTY = Boolean(process.stdout.isTTY)

// no url given — offer the clipboard url (⇥ to paste) when it already holds one
let clipboardUrl: string | undefined
if (!initialUrl && isTTY) {
  const clipped = readClipboard().trim()
  // reject multi-line clipboard content — new URL() silently strips newlines
  if (clipped && !/\s/.test(clipped) && isProbablyUrl(clipped)) clipboardUrl = clipped
}
const enterAltScreen = () => process.stdout.write('\x1b[?1049h\x1b[H')
// also switch mouse tracking off — a crash can skip React effect cleanup
const leaveAltScreen = () => process.stdout.write('\x1b[?1006l\x1b[?1000l\x1b[?1049l')

if (isTTY) {
  enterAltScreen()
  process.on('exit', leaveAltScreen)
  // restore the terminal BEFORE a crash prints, or the stack trace is
  // wiped along with the alternate screen and the app looks like it
  // silently quit
  for (const event of ['uncaughtException', 'unhandledRejection'] as const) {
    process.on(event, (error: unknown) => {
      leaveAltScreen()
      console.error(error)
      process.exit(1)
    })
  }
}

let outcome: Outcome = {}
const {waitUntilExit} = render(
  <App
    initialUrl={initialUrl}
    clipboardUrl={clipboardUrl}
    initialThemeMode={initialThemeMode}
    outDir={args.outDir}
    embedChapters={args.embedChapters}
    onOutcome={result => (outcome = result)}
  />,
  // keep a copy of every frame so clicks can be hit-tested against it
  {stdout: captureFrames(process.stdout)},
)

await waitUntilExit()

if (isTTY) leaveAltScreen()
if (outcome.filepath) {
  console.log(`✓ yoinked → ${outcome.filepath}`)
}
