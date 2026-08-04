const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('studio', {
  getInitialState: () => ipcRenderer.invoke('app:initial-state'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  getAccountBalance: (candidateKey = '') => ipcRenderer.invoke('account:balance', candidateKey),
  chooseWorkspace: () => ipcRenderer.invoke('dialog:workspace'),
  chooseAttachments: () => ipcRenderer.invoke('dialog:attachments'),
  saveSession: (session) => ipcRenderer.invoke('sessions:save', session),
  saveSessionActivity: (id, activityHtml) => ipcRenderer.invoke('sessions:activity-save', { id, activityHtml }),
  archiveSession: (id, archived) => ipcRenderer.invoke('sessions:archive', { id, archived }),
  deleteSession: (id) => ipcRenderer.invoke('sessions:delete', id),
  listFiles: (workspace) => ipcRenderer.invoke('files:list', workspace),
  previewFile: (path) => ipcRenderer.invoke('files:preview', path),
  openFile: (path) => ipcRenderer.invoke('files:open', path),
  revealFile: (path) => ipcRenderer.invoke('files:reveal', path),
  openExternal: (url) => ipcRenderer.invoke('shell:external', url),
  copyText: (text) => ipcRenderer.invoke('clipboard:write', text),
  readClipboardText: () => ipcRenderer.invoke('clipboard:read'),
  createPreviewUrl: (payload) => ipcRenderer.invoke('preview:url', payload),
  createMediaUrl: (payload) => ipcRenderer.invoke('media:url', payload),
  startTask: (payload) => ipcRenderer.invoke('task:start', payload),
  stopTask: (taskId) => ipcRenderer.invoke('task:stop', taskId),
  updateTaskPermission: (taskId, permissionMode) => ipcRenderer.invoke('task:permission-mode', { taskId, permissionMode }),
  onTaskEvent: (callback) => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('task:event', listener)
    return () => ipcRenderer.removeListener('task:event', listener)
  },
})
