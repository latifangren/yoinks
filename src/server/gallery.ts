import http from 'node:http'
import path from 'node:path'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'

export function resolveSafePath(baseDir: string, queryPath: string): string | null {
  const root = path.resolve(baseDir)
  const resolved = path.resolve(root, queryPath)
  if (resolved === root || resolved.startsWith(root + path.sep)) {
    return resolved
  }
  return null
}

export async function listMediaFiles(dir: string, baseDir: string, depth = 0): Promise<Array<{
  name: string
  relPath: string
  size: number
  mtime: number
  ext: string
  type: 'video' | 'audio' | 'other'
}>> {
  if (depth > 4) return []
  let results: any[] = []
  try {
    const entries = await fsPromises.readdir(dir, {withFileTypes: true})
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.')) continue
        const subFiles = await listMediaFiles(fullPath, baseDir, depth + 1)
        results = results.concat(subFiles)
      } else if (entry.isFile()) {
        if (entry.name.startsWith('.')) continue
        if (entry.name.endsWith('.part') || entry.name.endsWith('.ytdl') || entry.name.endsWith('.temp')) continue
        
        const ext = path.extname(entry.name).toLowerCase()
        const videoExts = ['.mp4', '.mkv', '.webm', '.avi', '.mov', '.flv', '.m4v']
        const audioExts = ['.mp3', '.m4a', '.wav', '.ogg', '.opus', '.flac', '.aac']
        
        let type: 'video' | 'audio' | 'other' = 'other'
        if (videoExts.includes(ext)) {
          type = 'video'
        } else if (audioExts.includes(ext)) {
          type = 'audio'
        }
        
        try {
          const stats = await fsPromises.stat(fullPath)
          const relPath = path.relative(baseDir, fullPath)
          results.push({
            name: entry.name,
            relPath,
            size: stats.size,
            mtime: stats.mtimeMs,
            ext,
            type,
          })
        } catch (e) {}
      }
    }
  } catch (e) {}
  return results
}

export function handleStreamFile(req: http.IncomingMessage, res: http.ServerResponse, filePath: string, ext: string): void {
  try {
    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    const range = req.headers.range

    let contentType = 'application/octet-stream'
    if (ext === '.mp4') contentType = 'video/mp4'
    else if (ext === '.webm') contentType = 'video/webm'
    else if (ext === '.mkv') contentType = 'video/x-matroska'
    else if (ext === '.mp3') contentType = 'audio/mpeg'
    else if (ext === '.m4a') contentType = 'audio/mp4'
    else if (ext === '.wav') contentType = 'audio/wav'
    else if (ext === '.ogg') contentType = 'audio/ogg'
    else if (ext === '.opus') contentType = 'audio/ogg'

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0]!, 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      
      if (start >= fileSize) {
        res.writeHead(416, {
          'Content-Range': `bytes */${fileSize}`,
          'Content-Type': contentType
        })
        res.end()
        return
      }

      const chunksize = (end - start) + 1
      const file = fs.createReadStream(filePath, {start, end})
      req.on('close', () => file.destroy())
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      })
      file.pipe(res)
    } else {
      const file = fs.createReadStream(filePath)
      req.on('close', () => file.destroy())

      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
      })
      file.pipe(res)
    }
  } catch (err) {
    res.writeHead(500)
    res.end('Error streaming file: ' + (err instanceof Error ? err.message : String(err)))
  }
}
