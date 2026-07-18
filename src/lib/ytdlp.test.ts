import assert from 'node:assert/strict'
import test from 'node:test'
import {embedChaptersArgs, cleanYtDlpError, toNumber} from './ytdlp.js'

test('embedChaptersArgs returns expected flags', () => {
  assert.deepEqual(embedChaptersArgs(), ['--embed-chapters', '--embed-metadata'])
})

test('toNumber parses various input formats correctly', () => {
  assert.equal(toNumber('123'), 123)
  assert.equal(toNumber('123.45'), 123.45)
  assert.equal(toNumber(undefined), undefined)
  assert.equal(toNumber(''), undefined)
  assert.equal(toNumber('NA'), undefined)
  assert.equal(toNumber('None'), undefined)
  assert.equal(toNumber('invalid-number'), undefined)
})

test('cleanYtDlpError extracts message from stderr logs', () => {
  const stderr1 = 'ERROR: [youtube] video is private\nSome other log line'
  assert.equal(cleanYtDlpError(stderr1), 'video is private')

  const stderr2 = 'ERROR: Sign in to confirm your age\nAnother warning'
  assert.equal(cleanYtDlpError(stderr2), 'Sign in to confirm your age')

  const stderr3 = 'Something went wrong without error suffix'
  assert.equal(cleanYtDlpError(stderr3), '')

  const stderr4 = ''
  assert.equal(cleanYtDlpError(stderr4), '')

  const stderr5 = 'ERROR: [warning] custom error format [with tags]\nERROR: [another] final error message'
  assert.equal(cleanYtDlpError(stderr5), 'final error message')
})
