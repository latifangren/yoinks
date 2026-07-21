export type JobStatus =
  | {phase: 'probing'; status: string}
  | {phase: 'picking'; title: string; uploader?: string; duration?: number; choices: ChoiceDTO[]}
  | {phase: 'downloading'; choiceLabel: string; progress?: ProgressDTO; processing: boolean}
  | {phase: 'done'; filepath: string}
  | {phase: 'error'; message: string}

export type ChoiceDTO = {index: number; label: string; kind: 'video' | 'audio'}
export type ProgressDTO = {
  downloadedBytes: number
  totalBytes?: number
  speed?: number
  eta?: number
  part: number
  totalParts: number
  percent?: number
}

export type Job = {
  id: string
  url: string
  urls: string[]
  status: JobStatus
  abort: AbortController
  /** SSE listeners waiting for status updates */
  listeners: Array<(data: string) => void>
}

export const jobs = new Map<string, Job>()

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function notifyListeners(job: Job): void {
  const data = JSON.stringify(job.status)
  for (const fn of job.listeners) fn(data)
  // clean up done/error jobs after a grace period
  if (job.status.phase === 'done' || job.status.phase === 'error') {
    setTimeout(() => jobs.delete(job.id), 60_000)
  }
}
