import assert from 'node:assert/strict'
import test from 'node:test'
import {parseArgs} from './args.js'
import {isThemeMode, nextThemeMode, themeFor} from '../theme.js'

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

test('returns all-false defaults when no args are given', () => {
  assert.deepEqual(parseArgs([]), {
    help: false,
    version: false,
    best: false,
    mp3: false,
    embedChapters: false,
    update: false,
    initialUrl: undefined,
  })
})

// ---------------------------------------------------------------------------
// --help / --version
// ---------------------------------------------------------------------------

test('parses -h and --help', () => {
  assert.equal(parseArgs(['-h']).help, true)
  assert.equal(parseArgs(['--help']).help, true)
})

test('parses -v and --version', () => {
  assert.equal(parseArgs(['-v']).version, true)
  assert.equal(parseArgs(['--version']).version, true)
})

// ---------------------------------------------------------------------------
// --best
// ---------------------------------------------------------------------------

test('--best flag sets best:true, leaves others false', () => {
  const r = parseArgs(['--best'])
  assert.equal(r.best, true)
  assert.equal(r.mp3, false)
  assert.equal(r.embedChapters, false)
  assert.equal(r.update, false)
  assert.equal(r.error, undefined)
})

// ---------------------------------------------------------------------------
// --mp3
// ---------------------------------------------------------------------------

test('--mp3 flag sets mp3:true, leaves others false', () => {
  const r = parseArgs(['--mp3'])
  assert.equal(r.mp3, true)
  assert.equal(r.best, false)
  assert.equal(r.embedChapters, false)
  assert.equal(r.update, false)
  assert.equal(r.error, undefined)
})

// ---------------------------------------------------------------------------
// --embed-chapters
// ---------------------------------------------------------------------------

test('--embed-chapters flag sets embedChapters:true', () => {
  const r = parseArgs(['--embed-chapters'])
  assert.equal(r.embedChapters, true)
  assert.equal(r.best, false)
  assert.equal(r.error, undefined)
})

// ---------------------------------------------------------------------------
// --update
// ---------------------------------------------------------------------------

test('--update flag sets update:true', () => {
  const r = parseArgs(['--update'])
  assert.equal(r.update, true)
  assert.equal(r.best, false)
  assert.equal(r.error, undefined)
})

// ---------------------------------------------------------------------------
// -o / --output
// ---------------------------------------------------------------------------

test('-o <dir> parses the output directory', () => {
  const r = parseArgs(['-o', '/tmp/videos'])
  assert.equal(r.outDir, '/tmp/videos')
  assert.equal(r.error, undefined)
})

test('--output <dir> (spaced) parses the output directory', () => {
  const r = parseArgs(['--output', '/home/user/media'])
  assert.equal(r.outDir, '/home/user/media')
  assert.equal(r.error, undefined)
})

test('--output=<dir> (equals-style) parses the output directory', () => {
  const r = parseArgs(['--output=/home/user/media'])
  assert.equal(r.outDir, '/home/user/media')
  assert.equal(r.error, undefined)
})

test('-o without a value returns an error containing "needs a directory path"', () => {
  const r = parseArgs(['-o'])
  assert.match(r.error ?? '', /needs a directory path/)
})

test('--output without a value returns an error containing "needs a directory path"', () => {
  const r = parseArgs(['--output'])
  assert.match(r.error ?? '', /needs a directory path/)
})

test('--output= (empty equals-style) returns an error containing "needs a directory path"', () => {
  const r = parseArgs(['--output='])
  assert.match(r.error ?? '', /needs a directory path/)
})

// ---------------------------------------------------------------------------
// Combinations
// ---------------------------------------------------------------------------

test('--best with a url sets both best and initialUrl', () => {
  const r = parseArgs(['--best', 'https://youtu.be/abc123'])
  assert.equal(r.best, true)
  assert.equal(r.initialUrl, 'https://youtu.be/abc123')
  assert.equal(r.error, undefined)
})

test('--mp3 -o <dir> <url> parses all three', () => {
  const r = parseArgs(['--mp3', '-o', '/tmp/vids', 'https://example.com/v'])
  assert.equal(r.mp3, true)
  assert.equal(r.outDir, '/tmp/vids')
  assert.equal(r.initialUrl, 'https://example.com/v')
  assert.equal(r.error, undefined)
})

test('--best --embed-chapters --update <url> all flags together', () => {
  const r = parseArgs(['--best', '--embed-chapters', '--update', 'https://example.com/v'])
  assert.equal(r.best, true)
  assert.equal(r.mp3, false)
  assert.equal(r.embedChapters, true)
  assert.equal(r.update, true)
  assert.equal(r.initialUrl, 'https://example.com/v')
  assert.equal(r.error, undefined)
})

test('all new flags together with -o', () => {
  const r = parseArgs(['--best', '--mp3', '--embed-chapters', '--update', '-o', '/dl', 'https://x.com/v'])
  assert.equal(r.best, true)
  assert.equal(r.mp3, true)
  assert.equal(r.embedChapters, true)
  assert.equal(r.update, true)
  assert.equal(r.outDir, '/dl')
  assert.equal(r.initialUrl, 'https://x.com/v')
  assert.equal(r.error, undefined)
})

// ---------------------------------------------------------------------------
// error cases
// ---------------------------------------------------------------------------

test('unknown option returns an error', () => {
  assert.match(parseArgs(['--wat']).error ?? '', /unknown option/)
})

test('two positional args returns a single-url error', () => {
  assert.match(parseArgs(['one', 'two']).error ?? '', /single url/)
})

test('--theme without value returns an error', () => {
  assert.match(parseArgs(['--theme']).error ?? '', /needs a value/)
})

test('--theme with invalid value returns an error', () => {
  assert.match(parseArgs(['--theme', 'sepia']).error ?? '', /unknown theme/)
})

// ---------------------------------------------------------------------------
// --theme spaced / equals
// ---------------------------------------------------------------------------

test('parses a url and a spaced theme option without confusing the value for the url', () => {
  assert.deepEqual(parseArgs(['--theme', 'light', 'https://example.com/video']), {
    help: false,
    version: false,
    themeMode: 'light',
    initialUrl: 'https://example.com/video',
    best: false,
    mp3: false,
    embedChapters: false,
    update: false,
  })
})

test('parses an equals-style theme option after the url', () => {
  assert.deepEqual(parseArgs(['https://example.com/video', '--theme=dark']), {
    help: false,
    version: false,
    themeMode: 'dark',
    initialUrl: 'https://example.com/video',
    best: false,
    mp3: false,
    embedChapters: false,
    update: false,
  })
})

// ---------------------------------------------------------------------------
// Theme helpers (isThemeMode / nextThemeMode / themeFor)
// ---------------------------------------------------------------------------

test('recognizes only supported modes and cycles through all of them', () => {
  assert.equal(isThemeMode('auto'), true)
  assert.equal(isThemeMode('light'), true)
  assert.equal(isThemeMode('dark'), true)
  assert.equal(isThemeMode('sepia'), false)
  assert.equal(nextThemeMode('auto'), 'light')
  assert.equal(nextThemeMode('light'), 'dark')
  assert.equal(nextThemeMode('dark'), 'auto')
})

test('auto delegates to terminal colors while forced modes own the full surface', () => {
  assert.deepEqual(themeFor('auto'), {
    mode: 'auto',
    primary: undefined,
    gray: undefined,
    dark: undefined,
    background: undefined,
    dimSecondary: true,
    inverseButton: true,
  })

  assert.equal(themeFor('light').background, '#ffffff')
  assert.equal(themeFor('light').primary, '#18181b')
  assert.equal(themeFor('dark').background, '#18181b')
  assert.equal(themeFor('dark').primary, '#ffffff')
})
