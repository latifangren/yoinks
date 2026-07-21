import assert from 'node:assert/strict'
import test from 'node:test'
import {saveDownloadHistory, getDownloadHistory} from './history.js'

test('saveDownloadHistory saves and retrieves download records', async () => {
  const record = {
    title: 'Test Video',
    url: 'https://example.com/watch?v=123',
    filepath: '/tmp/test.mp4',
    size: 1024567,
  }

  await saveDownloadHistory(record)
  const history = await getDownloadHistory()
  assert.ok(history.length >= 1)
  assert.equal(history[0]?.title, 'Test Video')
  assert.equal(history[0]?.url, 'https://example.com/watch?v=123')
  assert.equal(history[0]?.filepath, '/tmp/test.mp4')
  assert.equal(history[0]?.size, 1024567)
})
