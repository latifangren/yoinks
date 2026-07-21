import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

export type HistoryRecord = {
  title: string
  url: string
  filepath: string
  size?: number
  timestamp?: number
}

const HISTORY_DIR = path.join(os.homedir(), '.yoinks')
const HISTORY_FILE = path.join(HISTORY_DIR, 'history.json')
const CLI_HISTORY_FILE = path.join(os.homedir(), '.config', 'yoinks', 'history.json')
const LIMIT = 50

/** Prepend a URL (deduped, capped) for CLI input history and persist. */
export function loadHistory(): string[] {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(CLI_HISTORY_FILE, 'utf8'))
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string') : []
  } catch {
    return []
  }
}

/** Prepend a url (deduped, capped) and persist. Returns the new list. */
export function addToHistory(url: string): string[] {
  const next = [url, ...loadHistory().filter(entry => entry !== url)].slice(0, LIMIT)
  try {
    fs.mkdirSync(path.dirname(CLI_HISTORY_FILE), {recursive: true})
    fs.writeFileSync(CLI_HISTORY_FILE, `${JSON.stringify(next, null, 2)}\n`)
  } catch {
    // history is a nicety — never let it break a download
  }
  return next
}

/** Persistent download history helper appending records to ~/.yoinks/history.json (max 100). */
export async function saveDownloadHistory(record: HistoryRecord): Promise<void> {
  try {
    await fsPromises.mkdir(HISTORY_DIR, {recursive: true})
    let history: HistoryRecord[] = []
    try {
      const content = await fsPromises.readFile(HISTORY_FILE, 'utf8')
      history = JSON.parse(content) as HistoryRecord[]
      if (!Array.isArray(history)) history = []
    } catch {
      history = []
    }

    const entry: HistoryRecord = {
      ...record,
      timestamp: record.timestamp ?? Date.now(),
    }

    history.unshift(entry)
    if (history.length > 100) {
      history = history.slice(0, 100)
    }

    await fsPromises.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8')
  } catch {
    // non-fatal best-effort persistence
  }
}

export async function getDownloadHistory(): Promise<HistoryRecord[]> {
  try {
    const content = await fsPromises.readFile(HISTORY_FILE, 'utf8')
    const history = JSON.parse(content) as HistoryRecord[]
    return Array.isArray(history) ? history : []
  } catch {
    return []
  }
}
