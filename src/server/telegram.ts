/**
 * yoinks Telegram Bot
 *
 * Long-polling bot that accepts URLs, downloads via yt-dlp, sends files back.
 * Runs alongside the HTTP server in the same process.
 *
 * Environment variables:
 *   TELEGRAM_BOT_TOKEN     — Bot token from @BotFather (required)
 *   TELEGRAM_ALLOWED_USERS — Comma-separated Telegram user IDs (optional, empty = allow all)
 */

import {openAsBlob} from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import {probe, buildChoices, download, ensureYtDlp, findFfmpeg} from '../lib/ytdlp.js'
import {saveDownloadHistory} from '../lib/history.js'

const BOT_TOKEN = process.env['TELEGRAM_BOT_TOKEN']
const ALLOWED_USERS = (process.env['TELEGRAM_ALLOWED_USERS'] ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
const API = `https://api.telegram.org/bot${BOT_TOKEN}`
const OUT_DIR = process.env['OUT_DIR'] ?? '/downloads'

type TelegramMessage = {
  message_id: number
  from?: {id: number; first_name?: string; username?: string}
  chat: {id: number; type: string}
  text?: string
  date: number
}

type CallbackQuery = {
  id: string
  data?: string
  message?: {
    message_id: number
    chat: {id: number}
  }
}

type Update = {
  update_id: number
  message?: TelegramMessage
  callback_query?: CallbackQuery
}

// ── Telegram API helpers ──────────────────────────────────────────────────────

async function api(method: string, body?: Record<string, unknown>): Promise<any> {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!data.ok) throw new Error(`Telegram API ${method} failed: ${JSON.stringify(data)}`)
  return data.result
}

async function sendMessage(chatId: number, text: string, replyTo?: number, replyMarkup?: any): Promise<TelegramMessage> {
  return await api('sendMessage', {
    chat_id: chatId,
    text,
    reply_to_message_id: replyTo,
    parse_mode: 'HTML',
    reply_markup: replyMarkup,
  })
}

async function answerCallbackQuery(callbackId: string): Promise<void> {
  await api('answerCallbackQuery', {callback_query_id: callbackId})
}

async function editMessageText(chatId: number, messageId: number, text: string, replyMarkup?: any): Promise<void> {
  await api('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    reply_markup: replyMarkup,
  })
}

async function sendDocument(chatId: number, filePath: string, caption?: string): Promise<void> {
  const stat = await fs.stat(filePath)
  if (stat.size > 50 * 1024 * 1024) {
    await sendMessage(
      chatId,
      `⚠️ File too large for Telegram (${formatBytes(stat.size)}). Max: 50MB.\n\nDownload from WebUI: http://localhost:3000`,
    )
    return
  }

  const form = new FormData()
  form.append('chat_id', String(chatId))
  const blob = await openAsBlob(filePath)
  form.append('document', blob, path.basename(filePath))
  if (caption) form.append('caption', caption)

  const res = await fetch(`${API}/sendDocument`, {method: 'POST', body: form})
  const data = await res.json()
  if (!data.ok) throw new Error(`sendDocument failed: ${JSON.stringify(data)}`)
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function formatProgressBar(percent: number, length = 10): string {
  const filled = Math.max(0, Math.min(length, Math.round((percent / 100) * length)))
  const empty = length - filled
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`
}

function formatSpeed(bps?: number): string {
  if (!bps) return ''
  const mb = bps / 1024 / 1024
  if (mb >= 1) return `${mb.toFixed(1)} MB/s`
  const kb = bps / 1024
  return `${kb.toFixed(0)} KB/s`
}

function formatEta(seconds?: number): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  if (m > 0) return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  return `${String(s).padStart(2, '0')}s`
}

function createThrottledProgressUpdater(chatId: number, messageId: number, title: string, label: string) {
  let lastEditTime = 0
  let timer: NodeJS.Timeout | null = null
  let latestText = ''

  const flush = async () => {
    if (!latestText) return
    lastEditTime = Date.now()
    try {
      await editMessageText(chatId, messageId, latestText)
    } catch {}
  }

  return {
    onProgress: (p: {downloadedBytes: number; totalBytes?: number; speed?: number; eta?: number}) => {
      const pct = p.totalBytes && p.totalBytes > 0 ? Math.round((p.downloadedBytes / p.totalBytes) * 100) : undefined
      const bar = pct !== undefined ? formatProgressBar(pct) : '[██████████]'
      const pctStr = pct !== undefined ? `${pct}%` : `${formatBytes(p.downloadedBytes)}`
      const speedStr = formatSpeed(p.speed)
      const etaStr = formatEta(p.eta)
      
      const stats = [pctStr, speedStr, etaStr ? `ETA ${etaStr}` : ''].filter(Boolean).join(' · ')
      latestText = `📥 Downloading: <b>${escapeHtml(title)}</b>\nFormat: ${escapeHtml(label)}\n\n${bar} ${stats}`

      const now = Date.now()
      if (now - lastEditTime >= 1500) {
        if (timer) { clearTimeout(timer); timer = null }
        void flush()
      } else if (!timer) {
        timer = setTimeout(() => {
          timer = null
          void flush()
        }, 1500 - (now - lastEditTime))
      }
    },
    onProcessing: () => {
      latestText = `⚙️ Processing & converting: <b>${escapeHtml(title)}</b>`
      const now = Date.now()
      if (now - lastEditTime >= 1500) {
        if (timer) { clearTimeout(timer); timer = null }
        void flush()
      } else if (!timer) {
        timer = setTimeout(() => {
          timer = null
          void flush()
        }, 1500 - (now - lastEditTime))
      }
    },
    stop: () => {
      if (timer) { clearTimeout(timer); timer = null }
    }
  }
}

function isAllowed(userId: number): boolean {
  if (ALLOWED_USERS.length === 0) return true
  return ALLOWED_USERS.includes(String(userId))
}

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"]+/gi
  return (text.match(urlRegex) ?? [])
}

// ── Pending downloads (waiting for quality selection) ──────────────────────────

type PendingDownload = {
  chatId: number
  url: string
  info: any
  choices: any[]
  replyTo: number
  ytdlpBin: string
}

const pendingDownloads = new Map<string, PendingDownload>()

// ── URL processing ────────────────────────────────────────────────────────────

function buildQualityKeyboard(pendingId: string, choices: any[]): any {
  const buttons: any[][] = []

  // Group choices by effective resolution (min of width/height for vertical videos)
  const resolutions = new Map<number, any[]>()
  for (const choice of choices) {
    const heightMatch = choice.label.match(/(\d+)p/)
    const height = heightMatch ? parseInt(heightMatch[1]) : 0
    // For YouTube Shorts (vertical), height in label is the longer dimension
    // Use a reasonable cap: treat anything > 1080 as 1080p equivalent
    const effectiveRes = height > 1080 ? 1080 : height
    if (!resolutions.has(effectiveRes)) resolutions.set(effectiveRes, [])
    resolutions.get(effectiveRes)!.push(choice)
  }

  // Sort resolutions descending
  const sortedHeights = Array.from(resolutions.keys()).sort((a, b) => b - a)

  // Add video quality buttons (limit to 1080p and below)
  for (const height of sortedHeights) {
    if (height === 0 || height > 1080) continue
    const videoChoices = resolutions.get(height)!
    // Pick best video choice (highest bitrate)
    const bestVideo = videoChoices.reduce((a, b) => {
      const bitrateA = parseInt(a.label.match(/~?(\d+)k/)?.[1] ?? '0')
      const bitrateB = parseInt(b.label.match(/~?(\d+)k/)?.[1] ?? '0')
      return bitrateA > bitrateB ? a : b
    })
    const index = choices.indexOf(bestVideo)
    buttons.push([{text: `🎥 ${height}p`, callback_data: `quality:${pendingId}:${index}`}])
  }

  // Add expanded audio-only options
  buttons.push([
    {text: `🎵 MP3`, callback_data: `audio:${pendingId}:mp3`},
    {text: `🎵 M4A`, callback_data: `audio:${pendingId}:m4a`},
    {text: `🎵 Opus`, callback_data: `audio:${pendingId}:opus`},
  ])

  return buttons.length > 1 ? {inline_keyboard: buttons} : null
}

async function handleUrl(chatId: number, url: string, replyTo: number): Promise<void> {
  let ytdlpBin = ''
  try {
    await sendMessage(chatId, '🔄 Checking yt-dlp…', replyTo)
    ytdlpBin = await ensureYtDlp(() => {}, undefined)

    await sendMessage(chatId, '🔍 Fetching video info…', replyTo)
    const {info} = await probe(ytdlpBin, url)
    const choices = buildChoices(info)

    if (choices.length === 0) {
      await sendMessage(chatId, '❌ No downloadable formats found.', replyTo)
      return
    }

    const pendingId = Math.random().toString(36).slice(2, 10)
    // Try to build quality keyboard
    const keyboard = buildQualityKeyboard(pendingId, choices)

    if (keyboard) {
      // YouTube-like site with resolution options — show selector
      pendingDownloads.set(pendingId, {chatId, url, info, choices, replyTo, ytdlpBin})

      await sendMessage(
        chatId,
        `📥 <b>${escapeHtml(info.title ?? 'Unknown')}</b>\n\nSelect quality:`,
        replyTo,
        keyboard,
      )

      // Auto-expire after 5 minutes
      setTimeout(() => pendingDownloads.delete(pendingId), 5 * 60 * 1000)
    } else {
      // Non-YouTube site (TikTok, Instagram, etc.) — download best format directly
      const bestChoice = choices[0]!
      const statusMsg = await sendMessage(
        chatId,
        `📥 Downloading: <b>${escapeHtml(info.title ?? 'Unknown')}</b>\nFormat: ${escapeHtml(bestChoice.label)}`,
        replyTo,
      )

      const updater = createThrottledProgressUpdater(
        chatId,
        statusMsg.message_id,
        info.title ?? 'Unknown',
        bestChoice.label,
      )

      const ffmpegLocation = await findFfmpeg()
      let filepath = ''
      try {
        filepath = await download(
          {ytdlp: ytdlpBin, ffmpegLocation, url, choice: bestChoice, outDir: OUT_DIR},
          updater,
        )
      } finally {
        updater.stop()
      }

      let fileSize: number | undefined
      try {
        const stat = await fs.stat(filepath)
        fileSize = stat.size
      } catch {}

      void saveDownloadHistory({
        title: info.title ?? path.basename(filepath),
        url,
        filepath,
        size: fileSize,
      })

      await sendDocument(chatId, filepath, `✅ ${escapeHtml(info.title ?? path.basename(filepath))}`)
      await sendMessage(chatId, `💾 Saved locally: ${path.basename(filepath)}`, replyTo)
    }

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    await sendMessage(chatId, `❌ Download failed:\n<code>${escapeHtml(msg)}</code>`, replyTo)
  }
}

async function handleCallbackQuery(callback: CallbackQuery): Promise<void> {
  if (!callback.data || !callback.message) return
  if (!isAllowed(callback.message.chat.id)) return

  await answerCallbackQuery(callback.id)

  const [action, pendingId, value] = callback.data.split(':')
  if (!pendingId) return

  const pending = pendingDownloads.get(pendingId)
  if (pending) {
    pendingDownloads.delete(pendingId)
  }

  if (!pending) {
    await editMessageText(
      callback.message.chat.id,
      callback.message.message_id,
      '❌ No pending download found. Send a new URL.',
    )
    return
  }

  if (action === 'quality') {
    const choiceIndex = parseInt(value ?? '')
    if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= pending.choices.length) {
      await editMessageText(
        callback.message.chat.id,
        callback.message.message_id,
        '❌ Invalid choice.',
      )
      return
    }

    const choice = pending.choices[choiceIndex]!
    const updater = createThrottledProgressUpdater(
      callback.message.chat.id,
      callback.message.message_id,
      pending.info.title ?? 'Unknown',
      choice.label,
    )

    try {
      const ffmpegLocation = await findFfmpeg()
      let filepath = ''
      try {
        filepath = await download(
          {ytdlp: pending.ytdlpBin, ffmpegLocation, url: pending.url, choice, outDir: OUT_DIR},
          updater,
        )
      } finally {
        updater.stop()
      }

      let fileSize: number | undefined
      try {
        const stat = await fs.stat(filepath)
        fileSize = stat.size
      } catch {}

      void saveDownloadHistory({
        title: pending.info.title ?? path.basename(filepath),
        url: pending.url,
        filepath,
        size: fileSize,
      })

      await sendDocument(
        callback.message.chat.id,
        filepath,
        `✅ ${escapeHtml(pending.info.title ?? path.basename(filepath))}`,
      )
      await sendMessage(callback.message.chat.id, `💾 Saved locally: ${path.basename(filepath)}`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      await sendMessage(callback.message.chat.id, `❌ Download failed:\n<code>${escapeHtml(msg)}</code>`)
    }

  } else if (action === 'audio') {
    const format = value === 'm4a' ? 'm4a' : value === 'opus' ? 'opus' : 'mp3'
    const label = `Audio (${format.toUpperCase()})`
    const updater = createThrottledProgressUpdater(
      callback.message.chat.id,
      callback.message.message_id,
      pending.info.title ?? 'Unknown',
      label,
    )

    try {
      const ffmpegLocation = await findFfmpeg()
      const audioChoice = {
        label,
        kind: 'audio' as const,
        args: ['-x', '--audio-format', format, '--audio-quality', '0'],
      }

      let filepath = ''
      try {
        filepath = await download(
          {ytdlp: pending.ytdlpBin, ffmpegLocation, url: pending.url, choice: audioChoice, outDir: OUT_DIR},
          updater,
        )
      } finally {
        updater.stop()
      }

      let fileSize: number | undefined
      try {
        const stat = await fs.stat(filepath)
        fileSize = stat.size
      } catch {}

      void saveDownloadHistory({
        title: pending.info.title ?? path.basename(filepath),
        url: pending.url,
        filepath,
        size: fileSize,
      })

      await sendDocument(
        callback.message.chat.id,
        filepath,
        `🎵 ${escapeHtml(pending.info.title ?? path.basename(filepath))}`,
      )
      await sendMessage(callback.message.chat.id, `💾 Saved locally: ${path.basename(filepath)}`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      await sendMessage(callback.message.chat.id, `❌ Audio extraction failed:\n<code>${escapeHtml(msg)}</code>`)
    }
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Message handler ───────────────────────────────────────────────────────────

async function handleMessage(msg: TelegramMessage): Promise<void> {
  if (!msg.text || !msg.from) return

  if (!isAllowed(msg.from.id)) {
    await sendMessage(msg.chat.id, '⛔ Unauthorized.', msg.message_id)
    return
  }

  const urls = extractUrls(msg.text)
  if (urls.length === 0) {
    await sendMessage(
      msg.chat.id,
      'Send me a video URL to download.\n\nSupported: YouTube, X, Instagram, TikTok, Threads & 1800+ sites.\n\nYou can also choose quality before downloading.',
      msg.message_id,
    )
    return
  }

  for (const url of urls) {
    await handleUrl(msg.chat.id, url, msg.message_id)
  }
}

// ── Polling loop ──────────────────────────────────────────────────────────────

export async function startTelegramBot(): Promise<void> {
  if (!BOT_TOKEN) {
    console.log('[telegram] TELEGRAM_BOT_TOKEN not set — bot disabled')
    return
  }

  console.log('[telegram] Starting bot…')
  let offset = 0

  while (true) {
    try {
      const updates: Update[] = await api('getUpdates', {
        offset,
        timeout: 30,
        allowed_updates: ['message', 'callback_query'],
      })

      for (const update of updates) {
        offset = update.update_id + 1
        if (update.message) {
          handleMessage(update.message).catch(err => {
            console.error('[telegram] handleMessage error:', err)
          })
        }
        if (update.callback_query) {
          handleCallbackQuery(update.callback_query).catch(err => {
            console.error('[telegram] handleCallbackQuery error:', err)
          })
        }
      }
    } catch (error) {
      console.error('[telegram] Polling error:', error)
      await new Promise(r => setTimeout(r, 5000))
    }
  }
}
