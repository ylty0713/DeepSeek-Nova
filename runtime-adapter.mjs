#!/usr/bin/env node

import { spawn } from 'node:child_process'

const runtimeCommand = String(process.env.DEEPSEEK_NOVA_RUNTIME_COMMAND || '').trim()

if (!runtimeCommand) {
  console.error('Runtime adapter is not configured.')
  console.error('This public repository intentionally does not redistribute a third-party agent runtime.')
  console.error('Set DEEPSEEK_NOVA_RUNTIME_COMMAND to a runtime you are licensed to use, or implement the adapter described in RUNTIME_ADAPTER.md.')
  process.exit(2)
}

const child = spawn(runtimeCommand, process.argv.slice(2), {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
  windowsHide: true,
  shell: process.platform === 'win32',
})

child.once('error', (error) => {
  console.error(`Unable to start the configured runtime adapter: ${error.message}`)
  process.exitCode = 1
})

child.once('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exitCode = code ?? 1
})
