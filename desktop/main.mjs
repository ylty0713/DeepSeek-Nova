import { app, BrowserWindow, clipboard, dialog, ipcMain, safeStorage, shell } from 'electron'
import { spawn } from 'node:child_process'
import {
  existsSync,
  createReadStream,
  mkdirSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { createServer } from 'node:http'
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { approvalStrategyForMode, isPermissionDenialMessage, isPermissionMode } from './approval-policy.mjs'

const desktopDir = dirname(fileURLToPath(import.meta.url))
const packageMetadata = (() => {
  try { return JSON.parse(readFileSync(join(desktopDir, 'package.json'), 'utf8')) }
  catch { return {} }
})()
const studioVariant = packageMetadata.studioVariant === 'custom' ? 'custom' : 'standard'
const packageDir = app.isPackaged ? process.resourcesPath : resolve(desktopDir, '..')
const launcherPath = process.env.DEEPSEEK_NOVA_RUNTIME_ADAPTER
  ? resolve(process.env.DEEPSEEK_NOVA_RUNTIME_ADAPTER)
  : join(packageDir, 'runtime-adapter.mjs')
const rendererDir = join(desktopDir, 'renderer')
const initialWorkspace = app.isPackaged ? join(app.getPath('documents'), 'DeepSeek Nova') : packageDir

const defaultSettings = {
  workspace: initialWorkspace,
  model: 'deepseek-v4-pro[1m]',
  flashModel: 'deepseek-v4-flash',
  effort: 'max',
  permissionMode: 'plan',
  language: 'zh-CN',
  theme: 'system',
  density: 'comfortable',
  skillsEnabled: {},
}

let mainWindow
let storePath
let store = { settings: { ...defaultSettings }, sessions: [] }
const runningTasks = new Map()
let previewServer
let previewPort = 0
const previewRoots = new Map()
let activePreviewRoot = ''

function loadStore() {
  storePath = join(app.getPath('userData'), 'workspace-state.json')
  try {
    const saved = JSON.parse(readFileSync(storePath, 'utf8'))
    store = {
      settings: { ...defaultSettings, ...(saved.settings || {}) },
      sessions: Array.isArray(saved.sessions) ? saved.sessions : [],
    }
  } catch {
    store = { settings: { ...defaultSettings }, sessions: [] }
  }
  if (!isDirectory(store.settings.workspace)) {
    try { mkdirSync(store.settings.workspace, { recursive: true }) } catch { /* UI will surface inaccessible workspaces. */ }
  }
}

function saveStore() {
  mkdirSync(dirname(storePath), { recursive: true })
  writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8')
}

function decryptApiKey() {
  const encrypted = store.settings.apiKeyEncrypted
  if (!encrypted || !safeStorage.isEncryptionAvailable()) return ''
  try {
    return safeStorage.decryptString(Buffer.from(encrypted, 'base64'))
  } catch {
    return ''
  }
}

function publicSettings() {
  const { apiKeyEncrypted, ...settings } = store.settings
  return {
    ...settings,
    apiKeyConfigured: Boolean(
      decryptApiKey() || process.env.DEEPSEEK_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN,
    ),
  }
}

const previewMimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.htm', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.png', 'image/png'], ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'], ['.gif', 'image/gif'], ['.webp', 'image/webp'],
  ['.bmp', 'image/bmp'], ['.avif', 'image/avif'], ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'], ['.woff2', 'font/woff2'],
  ['.ttf', 'font/ttf'], ['.otf', 'font/otf'], ['.mp4', 'video/mp4'],
  ['.m4v', 'video/mp4'], ['.webm', 'video/webm'], ['.mov', 'video/quicktime'],
  ['.ogv', 'video/ogg'], ['.mp3', 'audio/mpeg'], ['.m4a', 'audio/mp4'],
  ['.aac', 'audio/aac'], ['.ogg', 'audio/ogg'], ['.wav', 'audio/wav'], ['.flac', 'audio/flac'],
  ['.pdf', 'application/pdf'],
  ['.txt', 'text/plain; charset=utf-8'], ['.xml', 'application/xml; charset=utf-8'],
])

function pathWithin(rootPath, candidatePath) {
  const relation = relative(resolve(rootPath), resolve(candidatePath))
  return relation === '' || (!relation.startsWith('..') && !isAbsolute(relation))
}

function servePreviewRequest(request, response) {
  try {
    const parsed = new URL(request.url || '/', 'http://127.0.0.1')
    const segments = parsed.pathname.split('/').filter(Boolean)
    const requestKind = segments[0]
    const tokenizedRequest = ['preview', 'media'].includes(requestKind) && Boolean(segments[1])
    const mediaRequest = requestKind === 'media'
    const rootPath = tokenizedRequest ? previewRoots.get(segments[1]) : activePreviewRoot
    if (!rootPath) {
      response.writeHead(404).end('Preview expired')
      return
    }
    const relativePath = segments.slice(tokenizedRequest ? 2 : 0).map((segment) => decodeURIComponent(segment)).join('/')
    let targetPath = resolve(rootPath, relativePath || 'index.html')
    if (!pathWithin(rootPath, targetPath)) {
      response.writeHead(403).end('Outside preview workspace')
      return
    }
    if (isDirectory(targetPath)) targetPath = join(targetPath, 'index.html')
    if (!isFile(targetPath)) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Preview file not found')
      return
    }
    targetPath = realpathSync(targetPath)
    if (!pathWithin(rootPath, targetPath)) {
      response.writeHead(403).end('Outside preview workspace')
      return
    }
    const contentType = previewMimeTypes.get(extname(targetPath).toLowerCase()) || 'application/octet-stream'
    const stat = statSync(targetPath)
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Cross-Origin-Resource-Policy': mediaRequest ? 'cross-origin' : 'same-origin',
      'X-Content-Type-Options': 'nosniff',
      'Accept-Ranges': 'bytes',
    }
    const rangeMatch = mediaRequest && request.headers.range?.match(/^bytes=(\d*)-(\d*)$/)
    if (rangeMatch) {
      const suffixLength = !rangeMatch[1] && rangeMatch[2] ? Number(rangeMatch[2]) : 0
      const start = suffixLength ? Math.max(0, stat.size - suffixLength) : Number(rangeMatch[1] || 0)
      const end = Math.min(stat.size - 1, rangeMatch[2] && !suffixLength ? Number(rangeMatch[2]) : stat.size - 1)
      if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start > end || start >= stat.size) {
        response.writeHead(416, { ...headers, 'Content-Range': `bytes */${stat.size}` }).end()
        return
      }
      response.writeHead(206, {
        ...headers,
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Content-Length': end - start + 1,
      })
      if (request.method === 'HEAD') response.end()
      else createReadStream(targetPath, { start, end }).on('error', () => response.destroy()).pipe(response)
      return
    }
    response.writeHead(200, { ...headers, 'Content-Length': stat.size })
    if (request.method === 'HEAD') response.end()
    else createReadStream(targetPath).on('error', () => response.destroy()).pipe(response)
  } catch {
    response.writeHead(400).end('Invalid preview request')
  }
}

function ensurePreviewServer() {
  if (previewServer?.listening && previewPort) return Promise.resolve(previewPort)
  return new Promise((resolvePort, reject) => {
    previewServer = createServer(servePreviewRequest)
    previewServer.once('error', reject)
    previewServer.listen(0, '127.0.0.1', () => {
      previewServer.removeListener('error', reject)
      previewPort = previewServer.address()?.port || 0
      resolvePort(previewPort)
    })
  })
}

async function createPreviewUrl(filePath, workspace) {
  const rootPath = realpathSync(isDirectory(workspace) ? resolve(workspace) : resolve(store.settings.workspace))
  const unresolvedTarget = resolve(String(filePath || ''))
  const targetPath = isFile(unresolvedTarget) ? realpathSync(unresolvedTarget) : unresolvedTarget
  if (!pathWithin(rootPath, targetPath) || !isFile(targetPath) || !['.html', '.htm'].includes(extname(targetPath).toLowerCase())) {
    throw new Error('只能预览当前工作区内的 HTML 文件。')
  }
  await ensurePreviewServer()
  const token = randomUUID().replaceAll('-', '')
  previewRoots.set(token, rootPath)
  activePreviewRoot = rootPath
  while (previewRoots.size > 16) previewRoots.delete(previewRoots.keys().next().value)
  const relativePath = relative(rootPath, targetPath).split(/[\\/]/).map(encodeURIComponent).join('/')
  return {
    url: `http://127.0.0.1:${previewPort}/preview/${token}/${relativePath}?v=${Date.now()}`,
    path: targetPath,
    name: basename(targetPath),
    relativePath: relative(rootPath, targetPath),
  }
}

const mediaExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.avif',
  '.mp4', '.m4v', '.webm', '.mov', '.ogv',
  '.mp3', '.m4a', '.aac', '.ogg', '.wav', '.flac',
  '.pdf',
])

async function createMediaUrl(filePath, workspace) {
  const rootPath = realpathSync(isDirectory(workspace) ? resolve(workspace) : resolve(store.settings.workspace))
  const unresolvedTarget = resolve(String(filePath || ''))
  const targetPath = isFile(unresolvedTarget) ? realpathSync(unresolvedTarget) : unresolvedTarget
  const extension = extname(targetPath).toLowerCase()
  if (!pathWithin(rootPath, targetPath) || !isFile(targetPath) || !mediaExtensions.has(extension)) {
    throw new Error('只能展示当前工作区内受支持的媒体文件。')
  }
  await ensurePreviewServer()
  const token = randomUUID().replaceAll('-', '')
  previewRoots.set(token, rootPath)
  while (previewRoots.size > 128) previewRoots.delete(previewRoots.keys().next().value)
  const relativePath = relative(rootPath, targetPath).split(/[\\/]/).map(encodeURIComponent).join('/')
  const type = contentTypeFromExtension(extension)
  return {
    url: `http://127.0.0.1:${previewPort}/media/${token}/${relativePath}?v=${Date.now()}`,
    path: targetPath,
    name: basename(targetPath),
    relativePath: relative(rootPath, targetPath),
    type,
    size: statSync(targetPath).size,
  }
}

function contentTypeFromExtension(extension) {
  const mimeType = previewMimeTypes.get(extension) || 'application/octet-stream'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'file'
}

async function getDeepSeekBalance(candidateKey = '') {
  const apiKey = String(candidateKey || '').trim()
    || decryptApiKey()
    || process.env.DEEPSEEK_API_KEY
    || process.env.ANTHROPIC_AUTH_TOKEN
    || ''
  if (!apiKey) throw new Error('请先配置并保存 DeepSeek API Key。')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)
  try {
    const response = await fetch('https://api.deepseek.com/user/balance', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    })
    let payload = null
    try { payload = await response.json() } catch { payload = null }
    if (!response.ok) {
      const statusMessages = {
        401: 'API Key 无效或已失效。',
        402: '账户余额不足。',
        429: '查询过于频繁，请稍后再试。',
      }
      throw new Error(statusMessages[response.status] || payload?.error?.message || `额度查询失败（HTTP ${response.status}）。`)
    }
    return {
      isAvailable: Boolean(payload?.is_available),
      balances: Array.isArray(payload?.balance_infos)
        ? payload.balance_infos.map((item) => ({
          currency: String(item?.currency || ''),
          totalBalance: String(item?.total_balance || '0'),
          grantedBalance: String(item?.granted_balance || '0'),
          toppedUpBalance: String(item?.topped_up_balance || '0'),
        }))
        : [],
      checkedAt: new Date().toISOString(),
    }
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('额度查询超时，请检查网络后重试。')
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

function isDirectory(path) {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

function isFile(path) {
  try {
    return statSync(path).isFile()
  } catch {
    return false
  }
}

function deleteBackendSessionFiles(sessionId) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId || '')) return []
  const projectsRoot = resolve(app.getPath('home'), '.claude', 'projects')
  if (!isDirectory(projectsRoot)) return []
  const removed = []
  const targetFile = `${sessionId}.jsonl`.toLowerCase()

  function walk(current, depth = 0) {
    if (depth > 8) return
    let entries
    try { entries = readdirSync(current, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      const path = resolve(current, entry.name)
      if (!path.startsWith(`${projectsRoot}\\`)) continue
      if (entry.isDirectory()) {
        if (entry.name.toLowerCase() === sessionId.toLowerCase()) {
          rmSync(path, { recursive: true, force: true })
          removed.push(path)
        } else {
          walk(path, depth + 1)
        }
      } else if (entry.isFile() && entry.name.toLowerCase() === targetFile) {
        rmSync(path, { force: true })
        removed.push(path)
      }
    }
  }

  walk(projectsRoot)
  return removed
}

function walkFiles(rootPath, options = {}) {
  const {
    depth = 5,
    maxEntries = 600,
    includeHidden = false,
  } = options
  let count = 0
  const ignored = new Set([
    '.git',
    '.svn',
    'node_modules',
    'dist',
    'build',
    '.next',
    '.cache',
    '__pycache__',
    'restored-source',
  ])

  function walk(current, level) {
    if (level > depth || count >= maxEntries) return []
    let entries
    try {
      entries = readdirSync(current, { withFileTypes: true })
    } catch {
      return []
    }

    return entries
      .filter((entry) => !ignored.has(entry.name))
      .filter((entry) => includeHidden || !entry.name.startsWith('.'))
      .sort((a, b) => {
        if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
        return a.name.localeCompare(b.name, 'zh-CN')
      })
      .flatMap((entry) => {
        if (count >= maxEntries) return []
        count += 1
        const fullPath = join(current, entry.name)
        if (entry.isDirectory()) {
          return [{
            name: entry.name,
            path: fullPath,
            type: 'directory',
            children: walk(fullPath, level + 1),
          }]
        }
        if (!entry.isFile()) return []
        let size = 0
        try { size = statSync(fullPath).size } catch {}
        return [{ name: entry.name, path: fullPath, type: 'file', size }]
      })
  }

  return walk(rootPath, 0)
}

const diffableExtensions = new Set([
  '.txt', '.md', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.jsonc',
  '.css', '.scss', '.html', '.xml', '.yml', '.yaml', '.toml', '.ini', '.env',
  '.py', '.rs', '.go', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.php',
  '.rb', '.sh', '.ps1', '.cmd', '.bat', '.sql', '.csv', '.gitignore',
])

function splitDiffLines(text = '') {
  if (!text) return []
  const lines = String(text).replace(/\r\n/g, '\n').split('\n')
  if (lines.at(-1) === '') lines.pop()
  return lines
}

function lineChangeStats(beforeText = '', afterText = '') {
  const beforeLines = splitDiffLines(beforeText)
  const afterLines = splitDiffLines(afterText)
  let start = 0
  while (start < beforeLines.length && start < afterLines.length && beforeLines[start] === afterLines[start]) start += 1
  let beforeEnd = beforeLines.length
  let afterEnd = afterLines.length
  while (beforeEnd > start && afterEnd > start && beforeLines[beforeEnd - 1] === afterLines[afterEnd - 1]) {
    beforeEnd -= 1
    afterEnd -= 1
  }
  const removed = beforeLines.slice(start, beforeEnd)
  const added = afterLines.slice(start, afterEnd)
  const location = {
    startLine: start + 1,
    endLine: Math.max(start + 1, start + Math.max(added.length, 1)),
  }
  if (!removed.length || !added.length) return { additions: added.length, deletions: removed.length, ...location }

  if (removed.length * added.length <= 2_000_000) {
    let previous = new Uint32Array(added.length + 1)
    for (const oldLine of removed) {
      const current = new Uint32Array(added.length + 1)
      for (let index = 1; index <= added.length; index += 1) {
        current[index] = oldLine === added[index - 1]
          ? previous[index - 1] + 1
          : Math.max(previous[index], current[index - 1])
      }
      previous = current
    }
    const common = previous[added.length]
    return { additions: added.length - common, deletions: removed.length - common, ...location }
  }
  return { additions: added.length, deletions: removed.length, ...location }
}

function compactChangeBlock(beforeText = '', afterText = '', baseLine = 1) {
  const beforeLines = splitDiffLines(beforeText)
  const afterLines = splitDiffLines(afterText)
  let start = 0
  while (start < beforeLines.length && start < afterLines.length && beforeLines[start] === afterLines[start]) start += 1
  let beforeEnd = beforeLines.length
  let afterEnd = afterLines.length
  while (beforeEnd > start && afterEnd > start && beforeLines[beforeEnd - 1] === afterLines[afterEnd - 1]) {
    beforeEnd -= 1
    afterEnd -= 1
  }
  return {
    startLine: Math.max(1, baseLine + start),
    oldText: beforeLines.slice(start, beforeEnd).join('\n').slice(0, 240000),
    newText: afterLines.slice(start, afterEnd).join('\n').slice(0, 240000),
  }
}

function snapshotText(path, size) {
  if (size > 1024 * 1024) return null
  const extension = extname(path).toLowerCase()
  if (extension && !diffableExtensions.has(extension)) return null
  try {
    const text = readFileSync(path, 'utf8')
    return text.includes('\0') ? null : text
  } catch {
    return null
  }
}

function snapshotWorkspace(rootPath) {
  const snapshot = new Map()
  const ignored = new Set(['.git', 'node_modules', 'restored-source', '.next', 'dist', 'build'])
  let count = 0
  let capturedTextBytes = 0

  function walk(current, level) {
    if (level > 8 || count > 5000) return
    let entries
    try { entries = readdirSync(current, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      if (count > 5000 || ignored.has(entry.name)) continue
      const path = join(current, entry.name)
      if (entry.isDirectory()) walk(path, level + 1)
      else if (entry.isFile()) {
        count += 1
        try {
          const stat = statSync(path)
          const content = capturedTextBytes + stat.size <= 16 * 1024 * 1024
            ? snapshotText(path, stat.size)
            : null
          if (typeof content === 'string') capturedTextBytes += stat.size
          snapshot.set(path, {
            fingerprint: `${stat.mtimeMs}:${stat.size}`,
            content,
          })
        } catch {}
      }
    }
  }

  if (isDirectory(rootPath)) walk(rootPath, 0)
  return snapshot
}

function changedFiles(before, after, workspace) {
  return [...after.entries()]
    .filter(([path, entry]) => before.get(path)?.fingerprint !== entry.fingerprint)
    .map(([path, entry]) => {
      const previous = before.get(path)
      const stats = typeof entry.content === 'string'
        ? lineChangeStats(typeof previous?.content === 'string' ? previous.content : '', entry.content)
        : { additions: 0, deletions: 0 }
      const changes = typeof entry.content === 'string'
        ? [compactChangeBlock(typeof previous?.content === 'string' ? previous.content : '', entry.content)]
        : []
      return { path, name: basename(path), relativePath: relative(workspace, path), ...stats, changes }
    })
    .slice(0, 100)
}

function scanSkills() {
  const roots = [
    join(app.getPath('home'), '.claude', 'skills'),
    join(app.getPath('home'), '.codex', 'skills'),
    join(app.getPath('home'), '.codex', 'plugins', 'cache'),
  ]
  const found = new Map()
  let visited = 0

  function frontmatterValue(text, key) {
    const raw = text.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim() || ''
    if (
      raw.length >= 2 &&
      ((raw.startsWith('"') && raw.endsWith('"')) ||
        (raw.startsWith("'") && raw.endsWith("'")))
    ) {
      return raw.slice(1, -1)
    }
    return raw
  }

  function walk(current, level, source) {
    if (level > 7 || visited > 12000 || !existsSync(current)) return
    let entries
    try { entries = readdirSync(current, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      if (visited > 12000 || ['node_modules', '.git'].includes(entry.name)) continue
      visited += 1
      const path = join(current, entry.name)
      if (entry.isDirectory()) {
        walk(path, level + 1, source)
      } else if (entry.isFile() && entry.name === 'SKILL.md') {
        try {
          const text = readFileSync(path, 'utf8')
          const name = frontmatterValue(text, 'name') || basename(dirname(path))
          const description = frontmatterValue(text, 'description') || '本地 Skill'
          if (!found.has(name)) found.set(name, { name, description, path, source })
        } catch {}
      }
    }
  }

  for (const root of roots) {
    const source = root.includes(`${join('.claude', 'skills')}`) ? 'DeepSeek Nova' : 'Codex'
    walk(root, 0, source)
  }
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name))
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 900,
    minWidth: 1040,
    minHeight: 680,
    show: false,
    backgroundColor: '#f8fafd',
    title: 'DeepSeek Nova',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#f8fafd',
      symbolColor: '#596576',
      height: 42,
    },
    webPreferences: {
      preload: join(desktopDir, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true,
    },
  })

  mainWindow.loadFile(join(rendererDir, 'index.html'))
  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => { mainWindow = null })
}

app.on('web-contents-created', (_event, contents) => {
  contents.on('will-attach-webview', (event, webPreferences, params) => {
    delete webPreferences.preload
    webPreferences.nodeIntegration = false
    webPreferences.contextIsolation = true
    webPreferences.sandbox = true
    try {
      const url = new URL(params.src)
      if (!['http:', 'https:'].includes(url.protocol)) event.preventDefault()
    } catch {
      event.preventDefault()
    }
  })

  contents.on('did-attach-webview', (_event, guest) => {
    guest.setWindowOpenHandler(({ url }) => {
      try { guest.loadURL(url) } catch {}
      return { action: 'deny' }
    })
  })
})

app.whenReady().then(() => {
  loadStore()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  for (const task of runningTasks.values()) task.child.kill()
  previewServer?.close()
})

ipcMain.handle('app:initial-state', () => ({
  settings: publicSettings(),
  sessions: store.sessions,
  skills: scanSkills(),
  packageVersion: packageMetadata.version || '2.1.88',
  studioVariant,
}))

ipcMain.handle('settings:save', (_event, nextSettings) => {
  const allowed = ['workspace', 'model', 'flashModel', 'effort', 'permissionMode', 'language', 'theme', 'density', 'skillsEnabled']
  for (const key of allowed) {
    if (Object.hasOwn(nextSettings, key)) store.settings[key] = nextSettings[key]
  }
  if (typeof nextSettings.apiKey === 'string' && nextSettings.apiKey.trim()) {
    if (!safeStorage.isEncryptionAvailable()) throw new Error('系统安全存储暂不可用，密钥未保存。')
    store.settings.apiKeyEncrypted = safeStorage.encryptString(nextSettings.apiKey.trim()).toString('base64')
  }
  if (nextSettings.clearApiKey) delete store.settings.apiKeyEncrypted
  saveStore()
  return publicSettings()
})

ipcMain.handle('account:balance', (_event, candidateKey) => getDeepSeekBalance(candidateKey))

ipcMain.handle('dialog:workspace', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择工作目录',
    defaultPath: isDirectory(store.settings.workspace) ? store.settings.workspace : packageDir,
    properties: ['openDirectory', 'createDirectory'],
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('dialog:attachments', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '添加上下文文件',
    defaultPath: isDirectory(store.settings.workspace) ? store.settings.workspace : packageDir,
    properties: ['openFile', 'multiSelections'],
  })
  if (result.canceled) return []
  return result.filePaths.map((path) => {
    const stat = statSync(path)
    return { path, name: basename(path), size: stat.size, extension: extname(path).slice(1) }
  })
})

ipcMain.handle('sessions:save', (_event, session) => {
  const normalized = {
    id: session.id || randomUUID(),
    title: String(session.title || '新会话').slice(0, 80),
    workspace: session.workspace || store.settings.workspace,
    createdAt: session.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: Boolean(session.archived),
    claudeSessionId: typeof session.claudeSessionId === 'string' ? session.claudeSessionId : randomUUID(),
    backendSessionStarted: Boolean(session.backendSessionStarted),
    tokenUsage: Math.max(0, Math.floor(Number(session.tokenUsage) || 0)),
    activityHtml: String(session.activityHtml || '').slice(0, 2000000),
    queuedMessages: (Array.isArray(session.queuedMessages) ? session.queuedMessages : []).slice(0, 3).map((item) => ({
      id: typeof item?.id === 'string' ? item.id : randomUUID(),
      prompt: String(item?.prompt || '').slice(0, 100000),
      createdAt: item?.createdAt || new Date().toISOString(),
      attachments: (Array.isArray(item?.attachments) ? item.attachments : []).slice(0, 20).map((attachment) => ({
        path: String(attachment?.path || ''),
        name: String(attachment?.name || '').slice(0, 260),
        size: Math.max(0, Number(attachment?.size) || 0),
        extension: String(attachment?.extension || '').slice(0, 20),
      })).filter((attachment) => attachment.path),
    })).filter((item) => item.prompt.trim()),
    messages: Array.isArray(session.messages) ? session.messages.slice(-100) : [],
  }
  const index = store.sessions.findIndex((item) => item.id === normalized.id)
  if (index === -1) store.sessions.unshift(normalized)
  else store.sessions[index] = normalized
  saveStore()
  return normalized
})

ipcMain.handle('sessions:archive', (_event, { id, archived }) => {
  const session = store.sessions.find((item) => item.id === id)
  if (session) {
    session.archived = Boolean(archived)
    session.updatedAt = new Date().toISOString()
    saveStore()
  }
  return store.sessions
})

ipcMain.handle('sessions:activity-save', (_event, { id, activityHtml }) => {
  const session = store.sessions.find((item) => item.id === id)
  if (!session) return false
  session.activityHtml = String(activityHtml || '').slice(0, 2000000)
  saveStore()
  return true
})

ipcMain.handle('sessions:delete', (_event, id) => {
  const session = store.sessions.find((item) => item.id === id)
  if (!session) return { sessions: store.sessions, removedRecords: 0 }
  const removedFiles = deleteBackendSessionFiles(session.claudeSessionId)
  store.sessions = store.sessions.filter((item) => item.id !== id)
  saveStore()
  return { sessions: store.sessions, removedRecords: removedFiles.length }
})

ipcMain.handle('files:list', (_event, workspace) => {
  const root = isDirectory(workspace) ? resolve(workspace) : store.settings.workspace
  return { root, entries: walkFiles(root) }
})

ipcMain.handle('files:preview', (_event, path) => {
  if (!isFile(path)) throw new Error('文件不存在。')
  const stat = statSync(path)
  const extension = extname(path).toLowerCase()
  const imageTypes = new Map([
    ['.png', 'image/png'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'],
    ['.gif', 'image/gif'], ['.webp', 'image/webp'], ['.bmp', 'image/bmp'],
  ])
  const videoExtensions = new Set(['.mp4', '.m4v', '.webm', '.mov', '.ogv'])
  const audioExtensions = new Set(['.mp3', '.m4a', '.aac', '.ogg', '.wav', '.flac'])
  if (imageTypes.has(extension) && stat.size <= 12 * 1024 * 1024) {
    return {
      type: 'image', path, name: basename(path), size: stat.size,
      dataUrl: `data:${imageTypes.get(extension)};base64,${readFileSync(path).toString('base64')}`,
    }
  }
  if (videoExtensions.has(extension)) return { type: 'video', path, name: basename(path), size: stat.size }
  if (audioExtensions.has(extension)) return { type: 'audio', path, name: basename(path), size: stat.size }
  if (extension === '.pdf') return {
    type: 'pdf', path, name: basename(path), size: stat.size,
    dataUrl: stat.size <= 24 * 1024 * 1024 ? `data:application/pdf;base64,${readFileSync(path).toString('base64')}` : '',
  }

  const textExtensions = new Set([
    '.txt', '.md', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.jsonc',
    '.css', '.scss', '.html', '.xml', '.yml', '.yaml', '.toml', '.ini', '.env',
    '.py', '.rs', '.go', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.php',
    '.rb', '.sh', '.ps1', '.cmd', '.bat', '.sql', '.csv', '.log', '.gitignore',
  ])
  if ((textExtensions.has(extension) || !extension) && stat.size <= 2 * 1024 * 1024) {
    return { type: 'text', path, name: basename(path), size: stat.size, content: readFileSync(path, 'utf8') }
  }
  return { type: 'unsupported', path, name: basename(path), size: stat.size, extension }
})

ipcMain.handle('files:open', async (_event, path) => {
  if (!isFile(path) && !isDirectory(path)) throw new Error('路径不存在。')
  const error = await shell.openPath(path)
  if (error) throw new Error(error)
  return true
})

ipcMain.handle('files:reveal', (_event, path) => {
  if (!existsSync(path)) throw new Error('路径不存在。')
  shell.showItemInFolder(path)
  return true
})

ipcMain.handle('shell:external', (_event, url) => {
  const parsed = new URL(url)
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('不支持的链接。')
  return shell.openExternal(parsed.href)
})

ipcMain.handle('clipboard:write', (_event, text) => {
  clipboard.writeText(String(text || '').slice(0, 100000))
  return true
})

ipcMain.handle('clipboard:read', () => clipboard.readText().slice(0, 100000))

ipcMain.handle('preview:url', (_event, payload = {}) => createPreviewUrl(payload.path, payload.workspace))
ipcMain.handle('media:url', (_event, payload = {}) => createMediaUrl(payload.path, payload.workspace))

function toolEditStats(toolName, input = {}) {
  if (toolName === 'Edit') return lineChangeStats(input.old_string || '', input.new_string || '')
  if (toolName === 'MultiEdit') {
    return (Array.isArray(input.edits) ? input.edits : []).reduce((total, edit) => {
      const stats = lineChangeStats(edit.old_string || '', edit.new_string || '')
      return {
        additions: total.additions + stats.additions,
        deletions: total.deletions + stats.deletions,
        startLine: total.startLine || stats.startLine,
        endLine: stats.endLine || total.endLine,
      }
    }, { additions: 0, deletions: 0, startLine: 1, endLine: 1 })
  }
  if (toolName === 'Write') return lineChangeStats('', input.content || '')
  if (toolName === 'NotebookEdit') return lineChangeStats(input.old_source || '', input.new_source || input.source || '')
  return { additions: 0, deletions: 0 }
}

function editFocusText(toolName, input = {}) {
  let source = ''
  if (toolName === 'Edit') source = input.new_string || input.old_string || ''
  else if (toolName === 'MultiEdit') {
    const edits = Array.isArray(input.edits) ? input.edits : []
    source = edits.at(-1)?.new_string || edits.at(-1)?.old_string || ''
  } else if (toolName === 'Write') source = input.content || ''
  else if (toolName === 'NotebookEdit') source = input.new_source || input.source || input.old_source || ''
  return String(source).replace(/\r\n/g, '\n').slice(0, 1600)
}

function editChangeBlocks(toolName, input = {}, filePath = '') {
  const pairs = []
  if (toolName === 'Edit') pairs.push([input.old_string || '', input.new_string || ''])
  else if (toolName === 'MultiEdit') {
    for (const edit of Array.isArray(input.edits) ? input.edits : []) pairs.push([edit.old_string || '', edit.new_string || ''])
  } else if (toolName === 'Write') pairs.push(['', input.content || ''])
  else if (toolName === 'NotebookEdit') pairs.push([input.old_source || '', input.new_source || input.source || ''])
  return pairs.map(([oldText, newText]) => {
    const baseLine = toolName === 'Write'
      ? 1
      : editAbsoluteStartLine('Edit', { old_string: oldText, new_string: newText }, filePath, 1)
    return compactChangeBlock(oldText, newText, baseLine)
  }).filter((change) => change.oldText || change.newText)
}

function projectedEditContent(toolName, input = {}, filePath = '') {
  if (toolName === 'Write') return String(input.content || '').slice(0, 2 * 1024 * 1024)
  if (!filePath || !isFile(filePath)) return ''
  try {
    if (statSync(filePath).size > 2 * 1024 * 1024) return ''
    let content = readFileSync(filePath, 'utf8')
    const applyPair = (oldText = '', newText = '') => {
      if (!oldText) return
      if (content.includes(oldText)) content = content.replace(oldText, newText)
    }
    if (toolName === 'Edit') applyPair(input.old_string || '', input.new_string || '')
    else if (toolName === 'MultiEdit') {
      for (const edit of Array.isArray(input.edits) ? input.edits : []) applyPair(edit.old_string || '', edit.new_string || '')
    } else if (toolName === 'NotebookEdit') applyPair(input.old_source || '', input.new_source || input.source || '')
    return content.slice(0, 2 * 1024 * 1024)
  } catch {
    return ''
  }
}

function editAbsoluteStartLine(toolName, input = {}, filePath = '', fallback = 1) {
  if (!filePath || toolName === 'Write' || !isFile(filePath)) return Math.max(1, fallback)
  let needle = ''
  if (toolName === 'Edit') needle = input.old_string || input.new_string || ''
  else if (toolName === 'MultiEdit') {
    const edits = Array.isArray(input.edits) ? input.edits : []
    needle = edits.at(-1)?.old_string || edits.at(-1)?.new_string || ''
  } else if (toolName === 'NotebookEdit') needle = input.old_source || input.new_source || input.source || ''
  if (!needle) return Math.max(1, fallback)
  try {
    if (statSync(filePath).size > 2 * 1024 * 1024) return Math.max(1, fallback)
    const content = readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n')
    const index = content.indexOf(String(needle).replace(/\r\n/g, '\n'))
    return index < 0 ? Math.max(1, fallback) : content.slice(0, index).split('\n').length
  } catch {
    return Math.max(1, fallback)
  }
}

function taskLabel(toolName, input = {}, workspace = '') {
  const rawPath = input.file_path || input.path || input.notebook_path || ''
  const displayPath = rawPath
    ? (workspace && rawPath.startsWith(workspace) ? relative(workspace, rawPath) : basename(rawPath))
    : ''
  const absoluteFilePath = rawPath ? (isAbsolute(rawPath) ? resolve(rawPath) : resolve(workspace, rawPath)) : ''
  const readExtension = extname(absoluteFilePath || rawPath).toLowerCase()
  const imageReadExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.avif'])
  const viewType = toolName === 'Read' && imageReadExtensions.has(readExtension)
    ? 'image'
    : (toolName === 'Read' && readExtension === '.pdf' ? 'pdf' : '')
  const labels = {
    Edit: ['edit', `编辑 ${displayPath || '文件'}`],
    MultiEdit: ['edit', `编辑 ${displayPath || '多个文件'}`],
    Write: ['edit', `创建 ${displayPath || '文件'}`],
    NotebookEdit: ['edit', `编辑 ${displayPath || 'Notebook'}`],
    Read: viewType ? ['view', `查看 ${displayPath || (viewType === 'pdf' ? 'PDF' : '图像')}`] : ['read', `读取 ${displayPath || '文件'}`],
    Glob: ['search', '查找文件'],
    Grep: ['search', '搜索代码'],
    Bash: ['command', input.description || '运行命令'],
    WebFetch: ['browser', '读取网页'],
    WebSearch: ['browser', '搜索网页'],
    Task: ['agent', input.description || '启动子任务'],
    TodoWrite: ['plan', '更新任务计划'],
    AskUserQuestion: ['approval', '等待你的选择'],
    SendUserMessage: ['message', input.message || input.text || '汇报当前进度'],
  }
  const [kind, label] = labels[toolName] || ['tool', `运行 ${toolName || '工具'}`]
  const detail = toolName === 'Bash'
    ? String(input.command || '').slice(0, 220)
    : displayPath
  const isEdit = kind === 'edit'
  const isView = kind === 'view'
  const isRead = kind === 'read'
  const filePath = (isEdit || isView || isRead) && rawPath ? absoluteFilePath : ''
  const stats = toolEditStats(toolName, input)
  if (isEdit) {
    const relativeStartLine = stats.startLine || 1
    const blockStartLine = editAbsoluteStartLine(toolName, input, filePath, 1)
    stats.startLine = blockStartLine + relativeStartLine - 1
    stats.endLine = Math.max(stats.startLine, stats.startLine + Math.max(stats.additions, 1) - 1)
  }
  return {
    kind,
    label,
    detail,
    ...stats,
    ...(isEdit ? { filePath, focusText: editFocusText(toolName, input), changes: editChangeBlocks(toolName, input, filePath), previewContent: projectedEditContent(toolName, input, filePath) } : {}),
    ...(isView ? { filePath, viewType } : {}),
    ...(isRead ? { filePath } : {}),
  }
}

function previewPathFromCommand(command = '', workspace = '') {
  const source = String(command).trim()
  if (!source || !workspace) return ''
  const opensBrowser = /(?:^|[;&|]\s*)(?:cmd(?:\.exe)?\s+\/c\s+)?(?:start|explorer(?:\.exe)?|open|xdg-open)\b/i.test(source)
  if (!opensBrowser) return ''

  const candidates = []
  const htmlPathPattern = /"([^"]+\.html?)"|'([^']+\.html?)'|([^\s;&|]+\.html?)/gi
  for (const match of source.matchAll(htmlPathPattern)) candidates.push(match[1] || match[2] || match[3] || '')
  for (let candidate of candidates) {
    candidate = candidate.trim().replace(/^file:\/\//i, '')
    try { candidate = decodeURIComponent(candidate) } catch {}
    const absolutePath = resolve(workspace, candidate)
    if (pathWithin(workspace, absolutePath) && isFile(absolutePath)) return absolutePath
  }
  return ''
}

function approvedToolRule(operation = {}) {
  const toolName = /^[A-Za-z][A-Za-z0-9]*$/.test(String(operation.tool_name || ''))
    ? String(operation.tool_name)
    : ''
  if (!toolName) return ''
  const input = operation.tool_input && typeof operation.tool_input === 'object' ? operation.tool_input : {}
  if (toolName === 'Bash' && input.command) return `Bash(${String(input.command)})`
  const filePath = input.file_path || input.path || input.notebook_path
  if (filePath && ['Read', 'Write', 'Edit', 'MultiEdit', 'NotebookEdit'].includes(toolName)) {
    return `${toolName}(${String(filePath)})`
  }
  if (toolName === 'WebFetch' && input.url) {
    try { return `WebFetch(domain:${new URL(String(input.url)).hostname})` } catch {}
  }
  return toolName
}

function operationSignature(toolName = '', toolInput = {}) {
  try { return `${String(toolName)}:${JSON.stringify(toolInput || {})}` }
  catch { return `${String(toolName)}:${String(toolInput || '')}` }
}

function createNovaStreamParser(emit, workspace, permissionMode = 'default', deniedOperation = null) {
  let activePermissionMode = permissionMode
  const deniedOperationSignature = deniedOperation
    ? operationSignature(deniedOperation.tool_name, deniedOperation.tool_input)
    : ''
  let buffer = ''
  let accumulatedText = ''
  let finalCandidateText = ''
  let explicitResultText = ''
  let canRenderFinalMarkdown = false
  let currentMessageSawPartialText = false
  const seenTools = new Set()
  const terminalTools = new Set()
  const toolDetails = new Map()
  const streamedTools = new Map()
  const seenApprovals = new Set()
  const pendingPermissionDenials = new Map()
  const messageUsage = new Map()
  let currentMessageId = ''
  let emittedUsage = 0

  function usageTokenCount(usage = {}) {
    return [
      usage.input_tokens,
      usage.output_tokens,
      usage.cache_creation_input_tokens,
      usage.cache_read_input_tokens,
    ].reduce((total, value) => total + Math.max(0, Number(value) || 0), 0)
  }

  function emitUsage(tokens) {
    const next = Math.max(emittedUsage, Math.floor(Number(tokens) || 0))
    if (next === emittedUsage) return
    emittedUsage = next
    emit({ type: 'usage', tokens: emittedUsage })
  }

  function rememberMessageUsage(messageId, usage = {}) {
    const id = messageId || currentMessageId || 'current'
    const total = usageTokenCount(usage)
    if (!total) return
    messageUsage.set(id, Math.max(messageUsage.get(id) || 0, total))
    emitUsage([...messageUsage.values()].reduce((sum, value) => sum + value, 0))
  }

  function emitText(text, finalCandidate = canRenderFinalMarkdown) {
    if (!text) return
    accumulatedText += text
    finalCandidateText += text
    emit({ type: 'text', text, messageId: currentMessageId || 'message:current', finalCandidate })
  }

  function emitApproval(toolId, input = {}) {
    const questions = Array.isArray(input.questions) ? input.questions : []
    for (const [index, question] of questions.entries()) {
      const approvalId = `${toolId || 'question'}:${index}`
      if (seenApprovals.has(approvalId)) continue
      seenApprovals.add(approvalId)
      emit({
        type: 'approval',
        approvalId,
        kind: 'question',
        groupId: toolId || 'question',
        questionIndex: index,
        questionCount: questions.length,
        question: question.question || '请选择下一步',
        multiSelect: Boolean(question.multiSelect),
        options: (question.options || []).map((option) => ({
          label: option.label || String(option),
          description: option.description || '',
        })),
      })
    }
  }

  function toolResultText(content) {
    if (typeof content === 'string') return content
    if (Array.isArray(content)) {
      return content.map((item) => {
        if (typeof item === 'string') return item
        return item?.text || item?.content || item?.message || ''
      }).filter(Boolean).join('\n')
    }
    if (!content) return ''
    try { return JSON.stringify(content) } catch { return String(content) }
  }

  function permissionDeniedResult(block = {}) {
    if (!block.is_error) return false
    return isPermissionDenialMessage(toolResultText(block.content))
  }

  function normalizedPermissionDenial(denial = {}) {
    const remembered = toolDetails.get(denial.tool_use_id) || {}
    const toolName = denial.tool_name || remembered.name || '操作'
    const toolInput = denial.tool_input || denial.input || remembered.input || {}
    return {
      tool_use_id: denial.tool_use_id || '',
      tool_name: toolName,
      tool_input: toolInput,
      strategy: denial.strategy || permissionStrategy(toolName, toolInput),
    }
  }

  function permissionStrategy(toolName = '', toolInput = {}) {
    if (deniedOperationSignature && operationSignature(toolName, toolInput) === deniedOperationSignature) return 'blocked'
    return approvalStrategyForMode(activePermissionMode, toolName)
  }

  function rememberPermissionDenial(denial = {}) {
    const normalized = normalizedPermissionDenial(denial)
    if (normalized.strategy === 'blocked') return null
    const key = normalized.tool_use_id || `${normalized.tool_name}:${JSON.stringify(normalized.tool_input)}`
    pendingPermissionDenials.set(key, normalized)
    return normalized
  }

  function emitPermissionCard(denials = []) {
    const pending = denials.filter((item) => item?.strategy !== 'auto' && item?.strategy !== 'blocked')
    if (!pending.length) return false
    let emitted = false
    for (const denial of pending) {
      const approvalId = `permission:${denial.tool_use_id || denial.tool_name || 'operation'}`
      if (seenApprovals.has(approvalId)) continue
      seenApprovals.add(approvalId)
      emit({
        type: 'approval',
        approvalId,
        kind: 'permission',
        denials: [denial],
        question: `DeepSeek Nova 需要权限才能继续执行 ${denial.tool_name || '操作'}`,
        options: [
          { label: '批准并继续', value: 'allow', description: '只批准当前这一项操作。' },
          { label: '暂不允许', value: 'deny', description: '只跳过当前这一项操作。' },
        ],
      })
      emitted = true
    }
    return emitted
  }

  function emitTool(tool, isUpdate = false) {
    if (!tool?.name) return
    finalCandidateText = ''
    canRenderFinalMarkdown = false
    const stepId = tool.id || `${tool.name}:${JSON.stringify(tool.input || {})}`
    const rememberedTool = toolDetails.get(stepId)
    const wasSeen = seenTools.has(stepId)
    seenTools.add(stepId)
    const nextInput = tool.input || {}
    const previousInputSize = JSON.stringify(rememberedTool?.input || {}).length
    const nextInputSize = JSON.stringify(nextInput).length
    const progress = !rememberedTool?.progress || nextInputSize > previousInputSize
      ? taskLabel(tool.name, nextInput, workspace)
      : rememberedTool.progress
    toolDetails.set(stepId, { name: tool.name, input: nextInputSize >= previousInputSize ? nextInput : rememberedTool.input, progress })
    emit({
      type: 'progress',
      stepId,
      status: 'running',
      ...progress,
      update: isUpdate || wasSeen,
    })
    if (tool.name === 'AskUserQuestion') emitApproval(stepId, tool.input || {})
  }

  function handlePayload(payload) {
    if (!payload || typeof payload !== 'object') return

    if (payload.type === 'system' && payload.subtype === 'init') {
      return
    }

    if (payload.type === 'stream_event') {
      const event = payload.event || {}
      if (event.type === 'message_start') {
        const nextMessageId = event.message?.id || currentMessageId || `message:${messageUsage.size + 1}`
        if (nextMessageId !== currentMessageId) currentMessageSawPartialText = false
        currentMessageId = nextMessageId
        rememberMessageUsage(currentMessageId, event.message?.usage || {})
      }
      if (event.type === 'message_delta') rememberMessageUsage(currentMessageId, event.usage || {})
      if (event.type === 'content_block_start' && event.content_block?.type === 'tool_use') {
        streamedTools.set(event.index, { tool: event.content_block, partialJson: '' })
        emitTool(event.content_block)
      }
      if (event.type === 'content_block_delta' && event.delta?.type === 'input_json_delta') {
        const streamed = streamedTools.get(event.index)
        if (streamed) streamed.partialJson += event.delta.partial_json || ''
      }
      if (event.type === 'content_block_stop') {
        const streamed = streamedTools.get(event.index)
        if (streamed) {
          try {
            emitTool({ ...streamed.tool, input: JSON.parse(streamed.partialJson || '{}') }, true)
          } catch {}
          streamedTools.delete(event.index)
        }
      }
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        currentMessageSawPartialText = true
        emitText(event.delta.text || '')
      }
      return
    }

    if (payload.type === 'assistant') {
      const nextMessageId = payload.message?.id || currentMessageId || `message:${messageUsage.size + 1}`
      if (nextMessageId !== currentMessageId) currentMessageSawPartialText = false
      currentMessageId = nextMessageId
      rememberMessageUsage(currentMessageId, payload.message?.usage || payload.usage || {})
      const blocks = Array.isArray(payload.message?.content) ? payload.message.content : []
      for (const block of blocks) {
        if (block?.type === 'tool_use') emitTool(block, true)
        if (block?.type === 'text' && !currentMessageSawPartialText) emitText(block.text || '')
      }
      return
    }

    if (payload.type === 'user') {
      const blocks = Array.isArray(payload.message?.content) ? payload.message.content : []
      for (const block of blocks) {
        if (block?.type === 'tool_result' && block.tool_use_id) {
          finalCandidateText = ''
          canRenderFinalMarkdown = true
          const remembered = toolDetails.get(block.tool_use_id) || {}
          const deniedByPermission = permissionDeniedResult(block)
          const strategy = deniedByPermission ? permissionStrategy(remembered.name, remembered.input) : 'none'
          const requiresContinuation = deniedByPermission && strategy !== 'blocked'
          terminalTools.add(block.tool_use_id)
          emit({ type: 'progress', stepId: block.tool_use_id, ...(remembered.progress || {}), status: requiresContinuation ? 'awaitingApproval' : (block.is_error ? 'error' : 'done'), update: true })
          if (requiresContinuation) {
            const denial = rememberPermissionDenial({
              tool_use_id: block.tool_use_id,
              tool_name: remembered.name || '操作',
              tool_input: remembered.input || {},
              strategy,
            })
            if (strategy === 'manual') emitPermissionCard([denial])
          }
        }
      }
      return
    }

    if (payload.type === 'result') {
      emitUsage(Math.max(emittedUsage, usageTokenCount(payload.usage || {})))
      if (typeof payload.result === 'string' && payload.result.trim()) explicitResultText = payload.result.trim()
      if (!accumulatedText && typeof payload.result === 'string') emitText(payload.result, true)
      const denials = Array.isArray(payload.permission_denials) ? payload.permission_denials : []
      for (const denial of denials) {
        const normalized = normalizedPermissionDenial(denial)
        if (normalized.tool_use_id && !terminalTools.has(normalized.tool_use_id)) {
          const remembered = toolDetails.get(normalized.tool_use_id) || {}
          terminalTools.add(normalized.tool_use_id)
          emit({
            type: 'progress',
            stepId: normalized.tool_use_id,
            ...(remembered.progress || {}),
            status: normalized.strategy === 'blocked' ? 'error' : 'awaitingApproval',
            update: true,
          })
        }
        rememberPermissionDenial(normalized)
      }
      const allDenials = [...pendingPermissionDenials.values()]
      const deniedToolIds = new Set(denials.map((item) => item.tool_use_id).filter(Boolean))
      for (const [stepId, remembered] of toolDetails.entries()) {
        if (terminalTools.has(stepId) || deniedToolIds.has(stepId)) continue
        terminalTools.add(stepId)
        emit({ type: 'progress', stepId, ...(remembered.progress || {}), status: 'done', update: true })
      }
      if (allDenials.length) {
        const remainingDenials = []
        for (const denial of allDenials) {
          const remembered = toolDetails.get(denial.tool_use_id) || {}
          const toolName = denial.tool_name || remembered.name || ''
          const toolInput = denial.tool_input || denial.input || remembered.input || {}
          const previewPath = toolName === 'Bash' ? previewPathFromCommand(toolInput.command, workspace) : ''
          if (!previewPath) {
            remainingDenials.push(denial)
            continue
          }
          emit({
            type: 'preview',
            path: previewPath,
            relativePath: relative(workspace, previewPath),
            source: 'permission-intercepted',
          })
          pendingPermissionDenials.delete(denial.tool_use_id)
          emit({
            type: 'progress',
            stepId: denial.tool_use_id || `preview:${previewPath}`,
            status: 'done',
            kind: 'browser',
            label: '已在右侧打开预览',
            detail: relative(workspace, previewPath),
            update: true,
          })
        }
        if (!remainingDenials.length) return
        if (activePermissionMode === 'bypassPermissions') {
          for (const denial of remainingDenials) {
            const key = denial.tool_use_id || `${denial.tool_name}:${JSON.stringify(denial.tool_input || {})}`
            pendingPermissionDenials.delete(key)
          }
          emit({
            type: 'progress',
            stepId: `permission-policy:${remainingDenials.map((item) => item.tool_use_id || item.tool_name).join(':')}`,
            status: 'error',
            kind: 'approval',
            label: '完全访问受系统策略限制',
            detail: '该操作无法由应用在后台放行。',
          })
          return
        }
        emitPermissionCard(remainingDenials)
      }
    }
  }

  function handleLine(line) {
    const trimmed = line.trim()
    if (!trimmed) return
    try {
      handlePayload(JSON.parse(trimmed))
    } catch {
      emit({ type: 'diagnostic', text: line })
    }
  }

  return {
    push(chunk) {
      buffer += chunk.toString()
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() || ''
      for (const line of lines) handleLine(line)
    },
    flush() {
      if (buffer) handleLine(buffer)
      buffer = ''
      return accumulatedText
    },
    getText() {
      return accumulatedText
    },
    getFinalText() {
      return explicitResultText || finalCandidateText.trim()
    },
    getUsage() {
      return emittedUsage
    },
    hasPendingApproval() {
      return pendingPermissionDenials.size > 0
    },
    getPendingApprovals() {
      return [...pendingPermissionDenials.values()]
    },
    getApprovalStrategy() {
      return [...pendingPermissionDenials.values()].some((item) => item.strategy === 'manual') ? 'manual' : 'auto'
    },
    getPermissionMode() {
      return activePermissionMode
    },
    setPermissionMode(nextMode) {
      if (!isPermissionMode(nextMode)) return
      activePermissionMode = nextMode
      for (const [key, denial] of pendingPermissionDenials.entries()) {
        const strategy = permissionStrategy(denial.tool_name, denial.tool_input)
        if (strategy === 'blocked') pendingPermissionDenials.delete(key)
        else pendingPermissionDenials.set(key, { ...denial, strategy })
      }
    },
  }
}

ipcMain.handle('task:start', (_event, payload) => {
  const taskId = typeof payload.taskId === 'string' && /^[a-f0-9-]{20,}$/i.test(payload.taskId) ? payload.taskId : randomUUID()
  const workspace = isDirectory(payload.workspace) ? resolve(payload.workspace) : store.settings.workspace
  const apiKey = decryptApiKey() || process.env.DEEPSEEK_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || ''
  const effort = ['low', 'medium', 'high', 'max'].includes(payload.effort) ? payload.effort : store.settings.effort
  const permissionMode = isPermissionMode(payload.permissionMode)
    ? payload.permissionMode
    : store.settings.permissionMode
  const attachments = Array.isArray(payload.attachments) ? payload.attachments.filter((item) => isFile(item.path)) : []
  const attachmentContext = attachments.length
    ? `\n\n用户附加了以下本地文件，请将它们作为任务上下文：\n${attachments.map((item) => `- ${item.path}`).join('\n')}`
    : ''
  const disabledSkills = Object.entries(store.settings.skillsEnabled || {})
    .filter(([, enabled]) => enabled === false)
    .map(([name]) => name)
  const skillInstruction = disabledSkills.length
    ? `本次任务不要调用这些已在桌面设置中关闭的 Skill：${disabledSkills.join('、')}`
    : ''
  const responseLanguageInstruction = store.settings.language === 'en-US'
    ? '所有面向用户的计划、阶段汇报、操作说明和最终回复必须使用自然、清晰的英文；即使工具输入或来源使用其他语言，也要用英文汇报'
    : '所有面向用户的计划、阶段汇报、操作说明和最终回复必须使用简体中文；即使工具输入、搜索词、网页内容或来源是英文，也不要改用英文汇报'
  const planLanguage = store.settings.language === 'en-US' ? '英文' : '中文'
  const desktopInstruction = `你的产品身份是 DeepSeek Nova，一款由 DeepSeek 模型驱动的桌面智能编程助手。你运行在 DeepSeek Nova 桌面应用中。不要使用底层兼容运行时、协议提供方或第三方 SDK 的名称自称；这些实现细节不代表你的产品身份。用户询问你是谁时，应直接说明自己是 DeepSeek Nova。${responseLanguageInstruction}。代码、命令、文件名、URL 和无法准确翻译的专有名词可以保留原文。每次收到新的任务或用户追加、修改要求时，在调用任何工具前必须先用一段完整自然的${planLanguage}说明自己将如何处理：说明将采用的能力或 Skill、准备检查什么、主要实现阶段、关键体验或技术目标，以及最后如何验证；要把整条执行思路一次讲完整，不能只说“我先看看”或拆成多句零碎预告。计划说明使用自然的第一人称句式，例如“我会……”。开始执行后，仅在目标或实现方向发生明显变化时再主动补充一段新的改动说明，不要逐条复述工具调用。不要等到全部工具执行完才第一次回复。任务完成后再给出独立的最终答案。创建或编辑 HTML、CSS、JavaScript 等网页文件后，应用会自动在右侧浏览器提供本地预览。不要为了预览页面执行 start、explorer.exe、cmd.exe、open、xdg-open 或调用系统默认浏览器，也不要为此请求权限；除非用户明确要求在外部浏览器打开。应用能够直接展示当前工作区内的图片、视频和音频：当你合法获取、下载或生成媒体文件后，将它保存在工作区并在最终回复中简短说明，应用会自动以内联媒体胶卷显示；不要再声称模型或应用不支持图片、视频预览。不要下载需要绕过登录、DRM 或版权限制的媒体。`
  const approvedOperation = payload.approvedOperation && typeof payload.approvedOperation === 'object' ? payload.approvedOperation : null
  const deniedOperation = payload.deniedOperation && typeof payload.deniedOperation === 'object' ? payload.deniedOperation : null
  const approvedRule = approvedOperation ? approvedToolRule(approvedOperation) : ''
  const deniedRule = deniedOperation ? approvedToolRule(deniedOperation) : ''
  const cliPermissionMode = approvedOperation ? 'bypassPermissions' : permissionMode
  const singleApprovalInstruction = approvedOperation
    ? `这是一次单项审批续跑。用户只批准了下面这一项操作：${JSON.stringify(approvedOperation).slice(0, 12000)}。你只能执行这一项工具操作；不得顺带执行任何其他工具调用，也不得把同批次的其他待审批操作视为已批准。完成这一项后立即停止工具调用并简短汇报，等待应用继续调度。`
    : ''
  const singleDenialInstruction = deniedOperation
    ? `用户已经明确拒绝下面这项操作：${JSON.stringify(deniedOperation).slice(0, 12000)}。不得再次请求、重试或换一种等价命令执行它；请跳过该操作，采用不需要这项权限的替代方案继续任务。如果没有可行替代方案，直接说明限制。`
    : ''
  const history = !payload.resumeSession && Array.isArray(payload.history)
    ? payload.history.slice(-24)
    : []
  const historyContext = history.length
    ? `你正在继续一个已有的桌面会话。以下是此前对话记录，请保持上下文连续，不要声称这是第一次对话：\n${history.map((message) => `${message.role === 'assistant' ? 'Assistant' : 'User'}: ${String(message.content || '').slice(0, 8000)}`).join('\n\n')}\n\n当前用户消息：\n`
    : ''
  const prompt = `${historyContext}${String(payload.prompt || '').trim()}${attachmentContext}`
  if (!prompt.trim()) throw new Error('任务内容不能为空。')

  const claudeSessionId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.claudeSessionId || '')
    ? payload.claudeSessionId
    : randomUUID()

  const args = [
    launcherPath,
    '-p', prompt,
    '--output-format', 'stream-json',
    '--include-partial-messages',
    '--verbose',
    '--effort', effort,
    '--permission-mode', cliPermissionMode,
  ]
  if (payload.resumeSession) args.push('--resume', claudeSessionId)
  else args.push('--session-id', claudeSessionId)
  if (cliPermissionMode === 'bypassPermissions') args.push('--allow-dangerously-skip-permissions')
  if (approvedOperation?.tool_name && approvedRule) {
    args.push('--tools', String(approvedOperation.tool_name))
  }
  if (deniedOperation?.tool_name && deniedRule) {
    args.push('--disallowedTools', deniedRule)
  }
  args.push('--append-system-prompt', [desktopInstruction, skillInstruction, singleApprovalInstruction, singleDenialInstruction].filter(Boolean).join('\n'))

  const childEnv = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    DEEPSEEK_MODEL: payload.model || store.settings.model,
    CLAUDE_CODE_EFFORT_LEVEL: effort,
    NO_COLOR: '1',
  }
  if (apiKey) childEnv.DEEPSEEK_API_KEY = apiKey
  const before = snapshotWorkspace(workspace)
  const child = spawn(process.execPath, args, {
    cwd: workspace,
    env: childEnv,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const emit = (event) => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('task:event', { taskId, ...event })
  }
  const parser = createNovaStreamParser(emit, workspace, cliPermissionMode, deniedOperation)
  runningTasks.set(taskId, { child, workspace, before, parser })
  emit({ type: 'started', workspace, claudeSessionId, resumed: Boolean(payload.resumeSession), timestamp: new Date().toISOString() })
  child.stdout.on('data', (chunk) => parser.push(chunk))
  child.stderr.on('data', (chunk) => emit({ type: 'diagnostic', text: chunk.toString() }))
  child.on('error', (error) => emit({ type: 'error', message: error.message }))
  child.on('exit', (code, signal) => {
    const task = runningTasks.get(taskId)
    const responseText = parser.flush()
    const finalResponseText = parser.getFinalText()
    const after = snapshotWorkspace(workspace)
    const files = changedFiles(task?.before || before, after, workspace)
    emit({
      type: 'finished',
      code,
      signal,
      files,
      responseText,
      finalResponseText,
      usageTokens: parser.getUsage(),
      awaitingApproval: parser.hasPendingApproval(),
      pendingApprovals: parser.getPendingApprovals(),
      approvalStrategy: parser.getApprovalStrategy(),
      permissionMode: parser.getPermissionMode(),
      claudeSessionId,
      timestamp: new Date().toISOString(),
    })
    runningTasks.delete(taskId)
  })
  return { taskId }
})

ipcMain.handle('task:stop', (_event, taskId) => {
  const task = runningTasks.get(taskId)
  if (!task) return false
  task.child.kill()
  return true
})

ipcMain.handle('task:permission-mode', (_event, { taskId, permissionMode }) => {
  if (!isPermissionMode(permissionMode)) return false
  const task = runningTasks.get(taskId)
  if (!task) return false
  task.permissionMode = permissionMode
  task.parser?.setPermissionMode(permissionMode)
  return true
})
