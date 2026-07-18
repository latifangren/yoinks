import {isThemeMode, type ThemeMode} from '../theme.js'

export type CliArgs = {
  help: boolean
  version: boolean
  initialUrl?: string
  themeMode?: ThemeMode
  outDir?: string
  best: boolean
  mp3: boolean
  embedChapters: boolean
  update: boolean
  error?: string
}

export function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = {help: false, version: false, best: false, mp3: false, embedChapters: false, update: false}
  const positional: string[] = []

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!
    if (arg === '-h' || arg === '--help') {
      result.help = true
    } else if (arg === '-v' || arg === '--version') {
      result.version = true
    } else if (arg === '--theme') {
      const value = args[++index]
      if (!value) return {...result, error: '--theme needs a value: auto, light, or dark'}
      if (!isThemeMode(value)) return {...result, error: `unknown theme “${value}” — use auto, light, or dark`}
      result.themeMode = value
    } else if (arg.startsWith('--theme=')) {
      const value = arg.slice('--theme='.length)
      if (!isThemeMode(value)) return {...result, error: `unknown theme “${value}” — use auto, light, or dark`}
      result.themeMode = value
    } else if (arg === '-o' || arg === '--output') {
      const value = args[++index]
      if (!value) return {...result, error: `${arg} needs a directory path`}
      result.outDir = value
    } else if (arg.startsWith('--output=')) {
      result.outDir = arg.slice('--output='.length)
      if (!result.outDir) return {...result, error: '--output needs a directory path'}
    } else if (arg === '--best') {
      result.best = true
    } else if (arg === '--mp3') {
      result.mp3 = true
    } else if (arg === '--embed-chapters') {
      result.embedChapters = true
    } else if (arg === '--update') {
      result.update = true
    } else if (arg.startsWith('-')) {
      return {...result, error: `unknown option “${arg}”`}
    } else {
      positional.push(arg)
    }
  }

  if (positional.length > 1) return {...result, error: 'expected a single url'}
  result.initialUrl = positional[0]
  return result
}
