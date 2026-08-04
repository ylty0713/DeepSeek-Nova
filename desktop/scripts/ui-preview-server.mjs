import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const root = join(import.meta.dirname, '..')
const port = Number(process.env.UI_PREVIEW_PORT || 4310)
const mediaFiles = [1, 2, 3].map((index) => ({
  path: `D:\\Demo\\image-${index}.png`,
  relativePath: `media/image-${index}.png`,
  name: `image-${index}.png`,
  size: 24000 + index,
}))

const mockStudio = `
(() => {
  let taskListener = () => {};
  let sessions = [{
    id: 'media-session', claudeSessionId: 'media-backend', backendSessionStarted: true,
    title: '媒体预览示例', workspace: 'D:\\\\Demo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), archived: false, tokenUsage: 128,
    messages: [{ role: 'user', content: '展示找到的媒体' }, { role: 'assistant', content: '已整理好媒体预览。', files: ${JSON.stringify(mediaFiles)}, durationMs: 2200 }]
  }];
  const finishTimers = new Map();
  window.studio = {
    getInitialState: async () => ({ settings: { workspace: 'D:\\\\Demo', model: 'deepseek-v4-pro[1m]', flashModel: '', effort: 'high', permissionMode: 'default', theme: 'light', density: 'comfortable', skillsEnabled: {}, apiKeyConfigured: true }, sessions, skills: [], packageVersion: '2.1.88' }),
    onTaskEvent: (callback) => { taskListener = callback; return () => {}; },
    saveSettings: async (settings) => ({ ...settings, apiKeyConfigured: true }),
    saveSession: async (session) => { sessions = [session, ...sessions.filter((item) => item.id !== session.id)]; return structuredClone(session); },
    archiveSession: async (id, archived) => sessions.map((item) => item.id === id ? { ...item, archived } : item),
    deleteSession: async (id) => ({ sessions: sessions.filter((item) => item.id !== id), removedRecords: 1 }),
    chooseAttachments: async () => [], chooseWorkspace: async () => 'D:\\\\Demo', listFiles: async () => [], previewFile: async () => ({ type: 'text', content: '' }),
    openFile: async () => true, revealFile: async () => true, openExternal: async () => true, createPreviewUrl: async () => ({ url: 'about:blank' }),
    createMediaUrl: async ({ path }) => { const name = path.split('\\\\').pop(); const hue = Number((name.match(/\\d+/) || [1])[0]) * 70; const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="hsl('+hue+' 55% 45%)"/><circle cx="400" cy="220" r="120" fill="rgba(255,255,255,.3)"/><text x="400" y="430" text-anchor="middle" fill="white" font-size="54">'+name+'</text></svg>'; return { path, relativePath: 'media/'+name, name, size: 24000, type: 'image', url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) }; },
    startTask: async (payload) => { const id = payload.taskId; queueMicrotask(() => taskListener({ taskId: id, type: 'started', workspace: payload.workspace })); setTimeout(() => taskListener({ taskId: id, type: 'progress', stepId: 'demo', kind: 'edit', label: '正在编辑界面', detail: 'renderer/app.js', additions: 12, deletions: 3 }), 700); const timer = setTimeout(() => taskListener({ taskId: id, type: 'finished', code: 0, timestamp: new Date().toISOString(), responseText: '任务已经完成。', usageTokens: 256, files: [] }), 20000); finishTimers.set(id, timer); return { taskId: id }; },
    stopTask: async (id) => { clearTimeout(finishTimers.get(id)); taskListener({ taskId: id, type: 'finished', signal: 'SIGTERM', timestamp: new Date().toISOString(), responseText: '任务已停止。', usageTokens: 48, files: [] }); return true; },
    updateTaskPermission: async () => true,
    getAccountBalance: async () => ({ isAvailable: true, balanceInfos: [] }),
  };
})();
`

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' }

createServer(async (request, response) => {
  try {
    if (request.url === '/mock-studio.js') {
      response.writeHead(200, { 'Content-Type': mime['.js'] })
      response.end(mockStudio)
      return
    }
    const requestPath = request.url === '/' ? '/renderer/index.html' : request.url.split('?')[0]
    const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, '')
    const filePath = join(root, safePath)
    let content = await readFile(filePath)
    if (requestPath.endsWith('index.html')) {
      content = Buffer.from(content.toString('utf8').replace('<script src="app.js"></script>', '<script src="/mock-studio.js"></script><script src="app.js"></script>'))
    }
    response.writeHead(200, { 'Content-Type': mime[extname(filePath)] || 'application/octet-stream' })
    response.end(content)
  } catch {
    response.writeHead(404)
    response.end('Not found')
  }
}).listen(port, '127.0.0.1', () => console.log(`UI preview: http://127.0.0.1:${port}`))
