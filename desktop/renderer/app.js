const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => [...document.querySelectorAll(selector)]

const iconPaths = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
  copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  paste: '<path d="M9 5h6M9 3h6v4H9z"/><path d="M7 5H5v16h14V5h-2"/>',
  chat: '<path d="M5 5.5h14v10H9l-4 3v-13Z"/>',
  archive: '<path d="M4 7h16M6 7v12h12V7M3 4h18v3H3zM10 11h4"/>',
  undo: '<path d="M9 8H4V3"/><path d="M4.5 7.5A8 8 0 1 1 6 18"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
  folder: '<path d="M3.5 6.5h6l2-2h9v15h-17z"/>',
  'folder-open': '<path d="M4 18.5V5h5l2 2h9v4"/><path d="M4 18.5h14.5l2.5-8H7z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.95 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.53-1H3v-4h.08A1.7 1.7 0 0 0 4.6 8.95a1.7 1.7 0 0 0-.34-1.88L4.2 7l2.83-2.83.06.06A1.7 1.7 0 0 0 8.95 4.6 1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 1.03 1.53 1.7 1.7 0 0 0 1.88-.34l.06-.06L19.8 7l-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'panel-left-close': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16m8-5-3-3 3-3"/>',
  'panel-left-open': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16m5-5 3-3-3-3"/>',
  'panel-right-close': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M16 4v16m-8-5 3-3-3-3"/>',
  'panel-right-open': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M16 4v16m-3-5-3-3 3-3"/>',
  code: '<path d="m9 7-5 5 5 5m6-10 5 5-5 5m-2-13-2 16"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  sparkles: '<path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2zM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8zM19 14l.7 1.7 1.8.8-1.8.7L19 19l-.7-1.8-1.8-.7 1.8-.8z"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  'arrow-up': '<path d="m6 11 6-6 6 6M12 5v14"/>',
  plane: '<path d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z"/>',
  paperclip: '<path d="m9 12 5-5a3 3 0 1 1 4 4l-7 7a5 5 0 0 1-7-7l7-7"/>',
  wallet: '<path d="M4 6.5V5a2 2 0 0 1 2-2h11v3.5M4 6.5h15a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.5a2 2 0 0 1 1-2Z"/><path d="M16 11h5v5h-5a2.5 2.5 0 0 1 0-5Z"/><circle cx="16.5" cy="13.5" r=".5"/>',
  hash: '<path d="M9 3 7 21M17 3l-2 18M4 9h16M3 15h16"/>',
  activity: '<path d="M4 12h3l2-5 4 10 2-5h5"/>',
  file: '<path d="M6 3h8l4 4v14H6zM14 3v5h4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  refresh: '<path d="M20 6v5h-5M4 18v-5h5"/><path d="M6.1 8.3A7.5 7.5 0 0 1 19.7 11M4.3 13A7.5 7.5 0 0 0 17.9 15.7"/>',
  external: '<path d="M14 5h5v5M19 5 10 14M19 13v6H5V5h6"/>',
  'arrow-left': '<path d="m15 18-6-6 6-6"/>',
  'arrow-right': '<path d="m9 18 6-6-6-6"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  brain: '<path d="M9 5a3 3 0 0 0-5 2.2A3 3 0 0 0 4 13a3 3 0 0 0 5 3M15 5a3 3 0 0 1 5 2.2A3 3 0 0 1 20 13a3 3 0 0 1-5 3M9 4v16M15 4v16M9 9H7M15 9h2M9 15H7M15 15h2"/>',
  palette: '<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h5a4 4 0 0 0 4-4c0-3.3-4-6-9-6Z"/><circle cx="7.5" cy="9" r=".8"/><circle cx="10" cy="6" r=".8"/><circle cx="15" cy="7" r=".8"/>',
  terminal: '<path d="m5 7 4 4-4 4M11 16h8"/>',
  edit: '<path d="m4 20 4.5-1 10-10-3.5-3.5-10 10zM13.5 7l3.5 3.5"/>',
  bot: '<rect x="5" y="7" width="14" height="12" rx="3"/><path d="M12 3v4M8.5 12h.01M15.5 12h.01M9 16h6"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  message: '<path d="M4 5h16v12H8l-4 3z"/>',
  play: '<path d="m9 7 8 5-8 5z"/>',
  music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="1"/>',
  warning: '<path d="M12 3 2.5 20h19zM12 9v4M12 17h.01"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.2 2.2c-1.2.8-1.7 1.2-1.7 2.8M12 17h.01"/>',
  eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
  image: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="m5.5 17 4.2-4.3 3.1 3 2.1-2.2 3.6 3.5"/>',
  zap: '<path d="M13.5 2 5 13h6l-.5 9L19 10h-6z"/>',
  'shield-check': '<path d="M12 3 20 6v5c0 5-3.3 8.5-8 10-4.7-1.5-8-5-8-10V6z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
  dot: '<circle cx="12" cy="12" r="4"/>',
}

function icon(name, className = '') {
  const paths = iconPaths[name] || iconPaths.dot
  return `<svg class="ui-icon${className ? ` ${className}` : ''}" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`
}

function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((element) => {
    element.innerHTML = icon(element.dataset.icon)
  })
}

const elements = {
  appLayout: $('#appLayout'),
  leftSidebar: $('#leftSidebar'),
  rightSidebar: $('#rightSidebar'),
  newTaskButton: $('#newTaskButton'),
  sessionSearch: $('#sessionSearch'),
  sessionList: $('#sessionList'),
  activeCount: $('#activeCount'),
  archiveCount: $('#archiveCount'),
  workspaceName: $('#workspaceName'),
  workspacePath: $('#workspacePath'),
  workspaceCard: $('#workspaceCard'),
  composerWorkspace: $('#composerWorkspace'),
  composerWorkspaceName: $('#composerWorkspaceName'),
  currentTaskTitle: $('#currentTaskTitle'),
  currentTaskMeta: $('#currentTaskMeta'),
  taskStatusDot: $('#taskStatusDot'),
  headerModel: $('#headerModel'),
  headerEffort: $('#headerEffort'),
  titlebarContext: $('#titlebarContext'),
  conversation: $('#conversation'),
  welcome: $('#welcome'),
  welcomeLogo: $('#welcomeLogo'),
  welcomeLead: $('#welcomeLead'),
  messages: $('#messages'),
  composer: $('#composer'),
  promptInput: $('#promptInput'),
  attachButton: $('#attachButton'),
  attachmentStrip: $('#attachmentStrip'),
  messageQueue: $('#messageQueue'),
  sendButton: $('#sendButton'),
  modeButton: $('#modeButton'),
  modeLabel: $('#modeLabel'),
  permissionMenu: $('#permissionMenu'),
  tokenOdometer: $('#tokenOdometer'),
  livePill: $('#livePill'),
  activityTimeline: $('#activityTimeline'),
  fileTree: $('#fileTree'),
  filePanelResizer: $('#filePanelResizer'),
  previewPane: $('#previewPane'),
  filesRootName: $('#filesRootName'),
  settingsModal: $('#settingsModal'),
  settingsPanelTitle: $('#settingsPanelTitle'),
  settingsPanelSubtitle: $('#settingsPanelSubtitle'),
  settingsApiKey: $('#settingsApiKey'),
  settingsWorkspace: $('#settingsWorkspace'),
  settingsPermission: $('#settingsPermission'),
  settingsModel: $('#settingsModel'),
  settingsFlashModel: $('#settingsFlashModel'),
  settingsEffort: $('#settingsEffort'),
  settingsDensity: $('#settingsDensity'),
  settingsLanguage: $('#settingsLanguage'),
  skillsList: $('#skillsList'),
  skillsEnabledCount: $('#skillsEnabledCount'),
  skillsSearch: $('#skillsSearch'),
  settingsSaveStatus: $('#settingsSaveStatus'),
  tokenQuotaPanel: $('#tokenQuotaPanel'),
  tokenQuotaStatus: $('#tokenQuotaStatus'),
  tokenQuotaList: $('#tokenQuotaList'),
  tokenQuotaCheckedAt: $('#tokenQuotaCheckedAt'),
  refreshTokenQuota: $('#refreshTokenQuota'),
  toast: $('#toast'),
  browserView: $('#browserView'),
  browserUrl: $('#browserUrl'),
  browserPreviewBadge: $('#browserPreviewBadge'),
  browserLoadStatus: $('#browserLoadStatus'),
  deleteConfirm: $('#deleteConfirm'),
  deleteConfirmText: $('#deleteConfirmText'),
  cancelDelete: $('#cancelDelete'),
  confirmDelete: $('#confirmDelete'),
}

const welcomeVariants = ['ember', 'mint', 'lilac', 'sky', 'gold', 'rose']
const welcomePhraseSets = {
  'zh-CN': {
    morning: ['早上好，又是新的一天。', '早上好，今天想先从什么开始？', '早上好，有什么需要随时告诉我。', '早上好，我可以为你做些什么？'],
    noon: ['中午好，忙了一上午，接下来交给我吧。', '中午好，有什么需要随时告诉我。', '中午好，想先处理哪件事？', '中午好，我可以为你做些什么？'],
    afternoon: ['下午好，今天想推进哪件事？', '下午好，有什么需要随时告诉我。', '下午好，我可以为你做些什么？', '下午好，把下一件事交给我吧。'],
    evening: ['晚上好，今天还有什么想完成？', '晚上好，有什么需要随时告诉我。', '晚上好，我可以为你做些什么？', '晚上好，我们把剩下的事情整理好吧。'],
    late: ['夜深了，记得早点休息。', '夜深了，早点休息，明天再继续吧。', '夜深了，尽量不要熬夜工作。'],
  },
  'en-US': {
    morning: ['A new day, ready when you are.', 'What would you like to start with?', 'Tell me whenever you need a hand.', 'What can I help you with?'],
    noon: ['Let me take it from here.', 'Tell me whenever you need a hand.', 'What should we tackle first?', 'What can I help you with?'],
    afternoon: ['What would you like to move forward?', 'Tell me whenever you need a hand.', 'What can I help you with?', 'Send the next task my way.'],
    evening: ['Anything else you want to finish today?', 'Tell me whenever you need a hand.', 'What can I help you with?', 'Let’s wrap up what remains.'],
    late: ['Remember to get some rest.', 'Get some rest—we can continue tomorrow.', 'Try not to work too late.'],
  },
}

const namedWelcomePhraseSets = {
  'zh-CN': {
    morning: ['早上好，巫标红。今天想从哪里开始？', '又是新的一天，有什么新想法吗？', '早上好。准备好开始今天的任务了吗？'],
    noon: ['中午好，有什么事都交给我吧。', '中午好，这次想先推进哪件事？', '中午好，接下来让我们继续。'],
    afternoon: ['下午好，巫标红。', '下午好，我可以为你做些什么？', '下午好。有什么需要我接手的？'],
    evening: ['晚上好，巫标红。今天还有什么想完成？', '晚上好，有什么需要随时告诉我。', '晚上好，我可以为你做些什么？'],
    late: ['夜深了，巫标红。记得早点休息。', '今天先到这里，明天继续吧。', '夜深了，剩下的事情可以留给明天。'],
  },
  'en-US': welcomePhraseSets['en-US'],
}

function activeWelcomePhraseSets() {
  return state.studioVariant === 'custom' ? namedWelcomePhraseSets : welcomePhraseSets
}

const state = {
  settings: null,
  studioVariant: 'standard',
  settingsBeforeEdit: null,
  skills: [],
  sessions: [],
  historyView: 'active',
  currentSession: null,
  attachments: [],
  runningTasks: new Map(),
  activeInspector: 'activity',
  selectedFile: null,
  pendingDeleteSession: null,
  welcomeCursor: Math.floor(Math.random() * 6) - 1,
  accountBalance: null,
  displayedTokens: 0,
  previewPath: '',
  previewUrlPrefix: '',
  previewAutoActive: false,
  previewTimer: null,
  settingsSource: null,
  settingsClosing: false,
  messageQueues: new Map(),
  activitySaveTimers: new Map(),
}

const translations = {
  'zh-CN': {
    newTask: '新建任务', searchSessions: '搜索会话', sessions: '会话', archived: '已归档', currentWorkspace: '当前工作区', settings: '设置',
    used: '已使用', promptPlaceholder: '交给 DeepSeek Nova 一个任务…', addFiles: '添加文件', composerNote: 'Enter 发送 · Shift + Enter 换行 · Esc 停止任务',
    activity: '进程', files: '文件', browser: '浏览器', taskActivity: '任务进程', selectFilePreview: '选择文件进行预览', filePreviewHint: '单击预览，双击用本地应用打开。',
    starterUnderstand: '理解代码库', starterUnderstandHint: '分析架构、依赖与入口', starterFix: '修复一个问题', starterFixHint: '定位原因并验证修改', starterBuild: '构建新功能', starterBuildHint: '从需求到可运行代码',
    general: '常规', modelReasoning: '模型与推理', skillManagement: 'Skill 管理', appearance: '外观', apiKeyDescription: '使用 Windows 安全存储加密保存在本机。',
    accountQuota: '账户额度', accountQuotaDescription: '通过 DeepSeek 官方接口查询账户当前可用余额。', defaultWorkspace: '默认工作区', defaultWorkspaceDescription: '新会话将在这个目录中运行。',
    executionMode: '执行模式', executionModeDescription: '控制代理是否可以直接修改工作区。', languageTitle: '系统语言', languageDescription: '选择客户端界面使用的语言。',
    primaryModel: '主模型', primaryModelDescription: '处理对话、规划和复杂编码任务。', fastModel: '快速模型', fastModelDescription: '用于轻量任务和子代理。', reasoningEffort: '推理强度', reasoningEffortDescription: '更高强度通常会花费更多时间与 Token。',
    theme: '主题', themeDescription: '选择工作台的颜色外观。', interfaceDensity: '界面密度', interfaceDensityDescription: '调整列表和控件之间的空间。', cancel: '取消', saveSettings: '保存设置',
    quotaNotChecked: '尚未查询', quotaCheckHint: '点击右侧按钮获取最新额度', viewQuota: '查看额度', quotaNote: '显示 DeepSeek 官方返回的总余额、充值余额和赠金额度。', choose: '选择…', enabled: '已启用', skillsDescription: '管理代理可使用的本地 Skill。设置会应用到之后创建的任务。', searchSkills: '搜索 Skill', deleteConversationTitle: '删除这个会话？', deleteConversationDescription: '会话将从历史记录中移除，对应的 DeepSeek Nova 本地会话记录也会一并清理。此操作无法撤销。', deleteConversation: '删除会话',
    queued: '队列中', delete: '删除', edit: '编辑', guide: '停止当前任务并发送', queueLimit: '消息队列最多保留 3 条。', send: '发送', addToQueue: '加入队列', stopTask: '停止任务', running: '运行中', idle: '待命',
    guidePending: '正在停止当前任务并发送所选消息。',
    askInChat: '在聊天中询问', copy: '复制', paste: '粘贴', selectAll: '全选', searchInBrowser: '在浏览器中搜索',
    localWorkbench: '本地工作台', newTaskTitle: '新任务', notStarted: '尚未开始 · 本地运行', runningLocal: '正在运行 · 本地代理', taskEnded: '任务已结束。', savedLocal: '已保存到本机',
    noActivity: '还没有运行记录', taskRunning: '任务正在运行', activityHint: '发送任务后，这里会显示代理进程、输出和文件变更。', activityRunningHint: '详细过程会继续显示在这里。', noArchivedSessions: '还没有归档的会话。', noSessionsYet: '会话会在发送第一条任务后出现在这里。', archive: '归档', unarchive: '移出归档', deleteConversation: '删除会话',
  },
  'en-US': {
    newTask: 'New task', searchSessions: 'Search conversations', sessions: 'Conversations', archived: 'Archived', currentWorkspace: 'Current workspace', settings: 'Settings',
    used: 'Used', promptPlaceholder: 'Give DeepSeek Nova a task…', addFiles: 'Add files', composerNote: 'Enter to send · Shift + Enter for a new line · Esc to stop',
    activity: 'Activity', files: 'Files', browser: 'Browser', taskActivity: 'Task activity', selectFilePreview: 'Select a file to preview', filePreviewHint: 'Click to preview; double-click to open locally.',
    starterUnderstand: 'Understand the codebase', starterUnderstandHint: 'Analyze architecture, dependencies, and entry points', starterFix: 'Fix an issue', starterFixHint: 'Find the cause and verify the fix', starterBuild: 'Build a feature', starterBuildHint: 'From requirements to working code',
    general: 'General', modelReasoning: 'Models & reasoning', skillManagement: 'Skill management', appearance: 'Appearance', apiKeyDescription: 'Encrypted with Windows secure storage and saved locally.',
    accountQuota: 'Account quota', accountQuotaDescription: 'Check the current available balance through the official DeepSeek API.', defaultWorkspace: 'Default workspace', defaultWorkspaceDescription: 'New conversations run in this folder.',
    executionMode: 'Execution mode', executionModeDescription: 'Control whether the agent can modify the workspace directly.', languageTitle: 'System language', languageDescription: 'Choose the language used by the desktop interface.',
    primaryModel: 'Primary model', primaryModelDescription: 'Handles conversations, planning, and complex coding tasks.', fastModel: 'Fast model', fastModelDescription: 'Used for lightweight tasks and subagents.', reasoningEffort: 'Reasoning effort', reasoningEffortDescription: 'Higher effort usually takes more time and tokens.',
    theme: 'Theme', themeDescription: 'Choose the workbench color theme.', interfaceDensity: 'Interface density', interfaceDensityDescription: 'Adjust spacing between lists and controls.', cancel: 'Cancel', saveSettings: 'Save settings',
    quotaNotChecked: 'Not checked', quotaCheckHint: 'Use the button to fetch the latest quota', viewQuota: 'View quota', quotaNote: 'Shows the total, topped-up, and promotional balances returned by DeepSeek.', choose: 'Choose…', enabled: 'Enabled', skillsDescription: 'Manage local Skills available to the agent. Changes apply to future tasks.', searchSkills: 'Search Skills', deleteConversationTitle: 'Delete this conversation?', deleteConversationDescription: 'The conversation and its local DeepSeek Nova session record will be removed. This cannot be undone.', deleteConversation: 'Delete conversation',
    queued: 'Queued', delete: 'Delete', edit: 'Edit', guide: 'Stop current task and send', queueLimit: 'The message queue can hold up to 3 items.', send: 'Send', addToQueue: 'Add to queue', stopTask: 'Stop task', running: 'Running', idle: 'Idle',
    guidePending: 'Stopping the current task and sending the selected message.',
    askInChat: 'Ask in chat', copy: 'Copy', paste: 'Paste', selectAll: 'Select all', searchInBrowser: 'Search in browser',
    localWorkbench: 'Local workbench', newTaskTitle: 'New task', notStarted: 'Not started · Local', runningLocal: 'Running · Local agent', taskEnded: 'Task ended.', savedLocal: 'Saved locally',
    noActivity: 'No activity yet', taskRunning: 'Task is running', activityHint: 'Task progress, output, and file changes will appear here.', activityRunningHint: 'Detailed progress will continue here.', noArchivedSessions: 'No archived conversations yet.', noSessionsYet: 'Conversations appear here after you send the first task.', archive: 'Archive', unarchive: 'Remove from archive', deleteConversation: 'Delete conversation',
  },
}

const effortLabelSets = {
  'zh-CN': { low: '低', medium: '中', high: '高', max: '极致' },
  'en-US': { low: 'Low', medium: 'Medium', high: 'High', max: 'Max' },
}
const permissionLabelSets = {
  'zh-CN': { plan: '规划模式', default: '审批时询问', acceptEdits: '自动编辑', bypassPermissions: '完全访问' },
  'en-US': { plan: 'Plan mode', default: 'Ask for approval', acceptEdits: 'Auto-edit', bypassPermissions: 'Full access' },
}
const settingsMetaSets = {
  'zh-CN': { general: ['常规', '工作区、密钥和执行权限'], model: ['模型与推理', '选择模型并调整思考深度'], skills: ['Skill 管理', '管理代理可以调用的本地能力'], appearance: ['外观', '主题、密度和显示偏好'] },
  'en-US': { general: ['General', 'Workspace, credentials, and execution permissions'], model: ['Models & reasoning', 'Choose models and reasoning depth'], skills: ['Skill management', 'Manage local capabilities available to the agent'], appearance: ['Appearance', 'Theme, density, and display preferences'] },
}

function language() {
  return state.settings?.language === 'en-US' ? 'en-US' : 'zh-CN'
}

function t(key) {
  return translations[language()][key] || translations['zh-CN'][key] || key
}

function effortLabels() {
  return effortLabelSets[language()]
}

function permissionLabels() {
  return permissionLabelSets[language()]
}

function settingsMeta() {
  return settingsMetaSets[language()]
}

function applyLanguage(nextLanguage = language()) {
  const resolved = nextLanguage === 'en-US' ? 'en-US' : 'zh-CN'
  if (state.settings) state.settings.language = resolved
  document.documentElement.lang = resolved
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = translations[resolved][element.dataset.i18n] || element.textContent })
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => { element.placeholder = translations[resolved][element.dataset.i18nPlaceholder] || element.placeholder })
  const permissions = permissionLabelSets[resolved]
  const permissionOptionCopy = resolved === 'en-US'
    ? { plan: 'Plan mode · Read only', default: 'Default mode', acceptEdits: 'Automatically accept edits', bypassPermissions: 'Full access · Allow in background' }
    : { plan: '规划模式 · 只读', default: '默认模式', acceptEdits: '自动接受编辑', bypassPermissions: '完全访问 · 后台默认允许' }
  elements.settingsPermission?.querySelectorAll('option').forEach((option) => { option.textContent = permissionOptionCopy[option.value] })
  elements.settingsLanguage?.querySelector('[value="zh-CN"]')?.replaceChildren(resolved === 'en-US' ? 'Simplified Chinese' : '简体中文')
  elements.settingsLanguage?.querySelector('[value="en-US"]')?.replaceChildren('English')
  if (elements.settingsLanguage) elements.settingsLanguage.value = resolved
  const permissionMenuCopy = resolved === 'en-US'
    ? { plan: ['Plan mode', 'Analyze and plan without making changes'], default: ['Ask for approval', 'Confirm operations when permission is needed'], acceptEdits: ['Auto-edit', 'Approve file edits; ask for other operations'], bypassPermissions: ['Full access', 'Allow in the background without approval prompts'] }
    : { plan: ['规划模式', '只分析与规划，不执行修改'], default: ['审批时询问', '需要权限时由你确认'], acceptEdits: ['自动编辑', '文件修改自动通过，其他操作询问'], bypassPermissions: ['完全访问', '后台默认允许，不再弹出审批提示'] }
  elements.permissionMenu?.querySelectorAll('[data-permission-mode]').forEach((button) => {
    const copy = permissionMenuCopy[button.dataset.permissionMode]
    button.querySelector('strong').textContent = copy[0]
    button.querySelector('small').textContent = copy[1]
  })
  const effortCopy = resolved === 'en-US'
    ? { low: ['Low', 'Faster'], medium: ['Medium', 'Balanced'], high: ['High', 'Deep'], max: ['Max', 'Strongest'] }
    : { low: ['低', '更快'], medium: ['中', '均衡'], high: ['高', '深入'], max: ['极致', '最强'] }
  elements.settingsEffort?.querySelectorAll('[data-effort]').forEach((button) => {
    const copy = effortCopy[button.dataset.effort]
    button.childNodes[0].nodeValue = copy[0]
    button.querySelector('small').textContent = copy[1]
  })
  const themeCopy = resolved === 'en-US' ? { light: 'Light', dark: 'Dark', system: 'System' } : { light: '浅色', dark: '深色', system: '跟随系统' }
  document.querySelectorAll('#themeOptions [data-theme]').forEach((button) => { button.querySelector('strong').textContent = themeCopy[button.dataset.theme] })
  const densityCopy = resolved === 'en-US' ? { comfortable: 'Comfortable', compact: 'Compact' } : { comfortable: '舒适', compact: '紧凑' }
  elements.settingsDensity?.querySelectorAll('option').forEach((option) => { option.textContent = densityCopy[option.value] })
  const starterPrompts = resolved === 'en-US'
    ? { understand: 'Analyze the current project, summarize its architecture, and identify the highest-priority improvements.', fix: 'Inspect the current project for errors and risks, then safely fix the issues you can verify.', build: 'Build a practical new feature that matches the current project style and add the necessary tests.' }
    : { understand: '分析当前项目，概括架构并指出最值得优先改进的部分。', fix: '检查当前项目的错误和潜在风险，修复能安全确认的问题。', build: '根据当前项目风格实现一个实用的新功能，并补充必要测试。' }
  document.querySelectorAll('[data-starter]').forEach((button) => { button.dataset.prompt = starterPrompts[button.dataset.starter] })
  elements.modeLabel.textContent = permissions[state.settings?.permissionMode] || permissions.default
  document.querySelectorAll('.stage-summary').forEach((row) => {
    const summaryEvent = { kind: row.dataset.phase, status: row.dataset.stageStatus, detail: row.dataset.stageName, viewType: row.dataset.viewType }
    const label = stageSummaryTitle(summaryEvent, resolved)
    row.querySelectorAll('strong').forEach((strong) => { strong.textContent = label })
  })
  const activeSettingsPanel = document.querySelector('.settings-nav-item.active')?.dataset.settings || 'general'
  if (elements.settingsPanelTitle) elements.settingsPanelTitle.textContent = settingsMetaSets[resolved][activeSettingsPanel][0]
  if (elements.settingsPanelSubtitle) elements.settingsPanelSubtitle.textContent = settingsMetaSets[resolved][activeSettingsPanel][1]
  if (state.currentSession && ['新任务', 'New task'].includes(state.currentSession.title)) {
    state.currentSession.title = translations[resolved].newTaskTitle
    elements.currentTaskTitle.textContent = state.currentSession.title
    if (!(state.currentSession.messages || []).length) elements.currentTaskMeta.textContent = translations[resolved].notStarted
  }
  renderMessageQueue()
  syncWorkspaceUI()
  syncModelUI()
  renderSessions()
  if (state.currentSession) setRunning(Boolean(runningContextForSession()))
  if (state.currentSession && !elements.welcome.hidden) showNextWelcome()
}

function basename(path = '') {
  return path.split(/[\\/]/).filter(Boolean).pop() || path
}

function formatSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(bytes > 10240 ? 0 : 1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

function formatTime(value) {
  const date = new Date(value)
  return date.toLocaleTimeString(language(), { hour: '2-digit', minute: '2-digit' })
}

function escapeText(value) {
  const div = document.createElement('div')
  div.textContent = String(value ?? '')
  return div.innerHTML
}

function showToast(message) {
  elements.toast.textContent = message
  elements.toast.classList.add('show')
  clearTimeout(showToast.timer)
  showToast.timer = setTimeout(() => elements.toast.classList.remove('show'), 2800)
}

const textSelection = { text: '', target: null, contextMenu: null }

function selectedText() {
  const selection = window.getSelection()
  return selection && !selection.isCollapsed ? selection.toString().trim() : ''
}

function positionFloating(element, x, y) {
  element.style.left = `${Math.max(8, x)}px`
  element.style.top = `${Math.max(8, y)}px`
  requestAnimationFrame(() => {
    const rect = element.getBoundingClientRect()
    element.style.left = `${Math.max(8, Math.min(x, innerWidth - rect.width - 8))}px`
    element.style.top = `${Math.max(8, Math.min(y, innerHeight - rect.height - 8))}px`
  })
}

function hideTextContextMenu() {
  textSelection.contextMenu?.remove()
  textSelection.contextMenu = null
}

function insertSelectedTextIntoPrompt() {
  const text = textSelection.text.trim()
  if (!text) return
  const quoted = text.split(/\r?\n/).map((line) => `> ${line}`).join('\n')
  const start = elements.promptInput.selectionStart ?? elements.promptInput.value.length
  const end = elements.promptInput.selectionEnd ?? start
  const before = elements.promptInput.value.slice(0, start)
  const after = elements.promptInput.value.slice(end)
  const spacerBefore = before && !before.endsWith('\n') ? '\n\n' : ''
  const spacerAfter = after && !after.startsWith('\n') ? '\n\n' : ''
  const insertion = `${spacerBefore}${quoted}\n\n${spacerAfter}`
  elements.promptInput.value = `${before}${insertion}${after}`
  const cursor = before.length + insertion.length
  elements.promptInput.setSelectionRange(cursor, cursor)
  resizePrompt()
  elements.promptInput.focus()
  hideTextContextMenu()
}

function selectAllFromTarget(target) {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    target.select()
    textSelection.text = target.value
    return
  }
  const container = target.closest('.assistant-response, .user-bubble, .code-preview, .activity-timeline, .preview-pane, .setting-copy') || elements.conversation
  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(container)
  selection.removeAllRanges()
  selection.addRange(range)
  textSelection.text = selection.toString().trim().slice(0, 20000)
}

function searchSelectedText() {
  const query = textSelection.text.trim()
  if (!query) return
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query.slice(0, 1000))}`
  state.previewAutoActive = false
  elements.browserPreviewBadge.hidden = true
  elements.browserLoadStatus.hidden = true
  setInspector('browser')
  elements.browserUrl.value = url
  elements.browserView.loadURL(url)
  hideTextContextMenu()
}

async function pasteIntoEditable(target) {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) || target.readOnly || target.disabled) return
  const clipboardText = String(await window.studio.readClipboardText() || '').slice(0, 100000)
  if (!clipboardText) return
  const start = target.selectionStart ?? target.value.length
  const end = target.selectionEnd ?? start
  target.value = `${target.value.slice(0, start)}${clipboardText}${target.value.slice(end)}`
  const cursor = start + clipboardText.length
  target.setSelectionRange(cursor, cursor)
  target.dispatchEvent(new Event('input', { bubbles: true }))
  if (target === elements.promptInput) resizePrompt()
  target.focus()
  hideTextContextMenu()
}

async function showTextContextMenu(event) {
  if (event.target.closest('webview, .text-context-menu')) return
  const selection = selectedText()
  const editable = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement
  if (!selection && !editable && !event.target.closest('.assistant-response, .user-bubble, .code-preview, .activity-timeline, .preview-pane')) return
  event.preventDefault()
  textSelection.text = (selection || (editable ? event.target.value.slice(event.target.selectionStart, event.target.selectionEnd) : '')).trim().slice(0, 20000)
  textSelection.target = event.target
  hideTextContextMenu()
  const canPaste = editable && !event.target.readOnly && !event.target.disabled
  const clipboardText = canPaste ? String(await window.studio.readClipboardText().catch(() => '') || '') : ''
  const menu = document.createElement('div')
  menu.className = 'text-context-menu'
  menu.setAttribute('role', 'menu')
  menu.innerHTML = `
    ${textSelection.text ? `<button type="button" class="context-ask" data-action="ask">${icon('message')}<span>${t('askInChat')}</span></button><span class="context-menu-separator"></span>` : ''}
    <button type="button" data-action="copy"${textSelection.text ? '' : ' disabled'}>${icon('copy')}<span>${t('copy')}</span><kbd>Ctrl C</kbd></button>
    ${editable ? `<button type="button" data-action="paste"${clipboardText ? '' : ' disabled'}>${icon('paste')}<span>${t('paste')}</span><kbd>Ctrl V</kbd></button>` : ''}
    <button type="button" data-action="select-all">${icon('list')}<span>${t('selectAll')}</span><kbd>Ctrl A</kbd></button>
    <span class="context-menu-separator"></span>
    <button type="button" data-action="search"${textSelection.text ? '' : ' disabled'}>${icon('search')}<span>${t('searchInBrowser')}</span></button>
  `
  menu.querySelector('[data-action="ask"]')?.addEventListener('click', insertSelectedTextIntoPrompt)
  menu.querySelector('[data-action="copy"]').addEventListener('click', async () => {
    if (textSelection.text) await window.studio.copyText(textSelection.text)
    hideTextContextMenu()
  })
  menu.querySelector('[data-action="paste"]')?.addEventListener('click', () => pasteIntoEditable(textSelection.target))
  menu.querySelector('[data-action="select-all"]').addEventListener('click', () => {
    selectAllFromTarget(textSelection.target)
    hideTextContextMenu()
  })
  menu.querySelector('[data-action="search"]').addEventListener('click', searchSelectedText)
  document.body.append(menu)
  textSelection.contextMenu = menu
  positionFloating(menu, event.clientX, event.clientY)
}

function renderMarkdown(target, markdown = '') {
  const source = String(markdown ?? '')
  if (!window.marked || !window.DOMPurify) {
    target.textContent = source
    return
  }
  const html = window.marked.parse(source, { gfm: true, breaks: true })
  target.innerHTML = window.DOMPurify.sanitize(html)
  target.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault()
      const href = link.href
      if (/^https?:\/\//i.test(href)) window.studio.openExternal(href)
    })
  })
}

function setAssistantText(turn, value) {
  if (!turn) return
  turn.rawText = String(value ?? '')
  renderMarkdown(turn.text, turn.rawText)
}

function applyTheme(theme) {
  const resolved = theme === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme
  document.documentElement.dataset.theme = resolved
  document.documentElement.dataset.density = state.settings?.density || 'comfortable'
}

function syncWorkspaceUI() {
  const workspace = state.settings.workspace
  const name = basename(workspace)
  elements.workspaceName.textContent = name
  elements.workspacePath.textContent = workspace
  elements.composerWorkspaceName.textContent = name
  elements.titlebarContext.textContent = `${name} · ${t('localWorkbench')}`
  elements.filesRootName.textContent = name
}

function syncModelUI() {
  const model = state.settings.model || 'DeepSeek'
  elements.headerModel.textContent = model
    .replace('deepseek-', '')
    .replace('[1m]', ' · 1M')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
  elements.headerEffort.textContent = effortLabels()[state.settings.effort] || state.settings.effort
  const permissionMode = permissionLabels()[state.settings.permissionMode] ? state.settings.permissionMode : 'default'
  elements.modeLabel.textContent = permissionLabels()[permissionMode]
  elements.modeButton.dataset.mode = permissionMode
  elements.modeButton.title = permissionMode === 'bypassPermissions' ? '完全访问已开启 · 后台默认允许' : '选择审批模式'
  elements.permissionMenu.querySelectorAll('[data-permission-mode]').forEach((button) => {
    const active = button.dataset.permissionMode === permissionMode
    button.classList.toggle('active', active)
    button.setAttribute('aria-checked', String(active))
  })
}

function togglePermissionMenu(force) {
  const opening = force ?? elements.permissionMenu.hidden
  if (opening === !elements.permissionMenu.hidden) return
  elements.permissionMenu.hidden = !opening
  elements.modeButton.setAttribute('aria-expanded', String(opening))
  if (opening && !motionReduced()) {
    elements.permissionMenu.animate([
      { opacity: 0, transform: 'translateY(7px) scale(.96)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ], { duration: 170, easing: 'cubic-bezier(.2,.8,.2,1)' })
  }
}

async function choosePermissionMode(permissionMode) {
  if (!permissionLabels()[permissionMode]) {
    togglePermissionMenu(false)
    return
  }
  if (permissionMode === state.settings.permissionMode) {
    const runningContext = runningContextForSession()
    if (permissionMode === 'bypassPermissions' && runningContext) await continuePendingPermissionsWithFullAccess(runningContext)
    togglePermissionMenu(false)
    return
  }
  const previousMode = state.settings.permissionMode
  state.settings.permissionMode = permissionMode
  syncModelUI()
  togglePermissionMenu(false)
  try {
    state.settings = await window.studio.saveSettings(state.settings)
    const runningContext = runningContextForSession()
    if (runningContext) {
      await window.studio.updateTaskPermission(runningContext.taskId, permissionMode)
      if (permissionMode === 'bypassPermissions') await continuePendingPermissionsWithFullAccess(runningContext)
    }
    elements.settingsPermission.value = state.settings.permissionMode
    syncModelUI()
    showToast(runningContext
      ? (language() === 'en-US' ? `Current task switched to ${permissionLabels()[permissionMode]}.` : `当前任务已切换为${permissionLabels()[permissionMode]}。`)
      : (language() === 'en-US' ? `Switched to ${permissionLabels()[permissionMode]}.` : (permissionMode === 'bypassPermissions' ? '完全访问已开启，后台将默认允许操作。' : `已切换为${permissionLabels()[permissionMode]}。`)))
  } catch (error) {
    state.settings.permissionMode = previousMode
    syncModelUI()
    showToast(language() === 'en-US' ? `Switch failed: ${error.message}` : `切换失败：${error.message}`)
  }
}

function resizePrompt() {
  elements.promptInput.style.height = 'auto'
  elements.promptInput.style.height = `${Math.min(elements.promptInput.scrollHeight, 160)}px`
  syncComposerAction()
}

function runningContextForSession(sessionId = state.currentSession?.id) {
  if (!sessionId) return null
  return [...state.runningTasks.values()].find((context) => context.sessionId === sessionId) || null
}

function isSessionRunning(sessionId) {
  return Boolean(runningContextForSession(sessionId))
}

function queueForSession(sessionId = state.currentSession?.id) {
  if (!sessionId) return []
  if (!state.messageQueues.has(sessionId)) {
    const source = state.currentSession?.id === sessionId
      ? state.currentSession
      : (state.sessions.find((session) => session.id === sessionId) || runningContextForSession(sessionId)?.session)
    state.messageQueues.set(sessionId, structuredClone(Array.isArray(source?.queuedMessages) ? source.queuedMessages : []))
  }
  return state.messageQueues.get(sessionId)
}

function syncQueuedMessages(sessionId) {
  const queuedMessages = structuredClone(queueForSession(sessionId))
  if (state.currentSession?.id === sessionId) state.currentSession.queuedMessages = structuredClone(queuedMessages)
  const context = runningContextForSession(sessionId)
  if (context?.session) context.session.queuedMessages = structuredClone(queuedMessages)
  state.sessions = state.sessions.map((session) => session.id === sessionId ? { ...session, queuedMessages: structuredClone(queuedMessages) } : session)
  if (state.currentSession?.id === sessionId) renderMessageQueue()
}

function renderMessageQueue() {
  elements.messageQueue.replaceChildren()
  for (const item of queueForSession()) {
    const row = document.createElement('div')
    row.className = 'queue-item'
    row.dataset.queueId = item.id
    row.innerHTML = `
      <span class="queue-status">${t('queued')}</span>
      <span class="queue-message" title="${escapeText(item.prompt)}">${escapeText(item.prompt)}</span>
      <span class="queue-actions">
        <button type="button" class="queue-action delete" data-queue-action="delete" title="${t('delete')}">${icon('trash')}</button>
        <button type="button" class="queue-action edit" data-queue-action="edit" title="${t('edit')}">${icon('edit')}</button>
        <button type="button" class="queue-action guide" data-queue-action="guide" title="${t('guide')}">${icon('plane')}</button>
      </span>`
    elements.messageQueue.append(row)
  }
}

function takeQueuedMessage(messageId, sessionId = state.currentSession?.id) {
  const queue = queueForSession(sessionId)
  const index = queue.findIndex((item) => item.id === messageId)
  if (index < 0) return null
  const [item] = queue.splice(index, 1)
  syncQueuedMessages(sessionId)
  return item
}

function deleteQueuedMessage(messageId) {
  takeQueuedMessage(messageId)
}

function editQueuedMessage(messageId) {
  const item = takeQueuedMessage(messageId)
  if (!item) return
  elements.promptInput.value = item.prompt
  state.attachments = structuredClone(item.attachments || [])
  renderAttachments()
  resizePrompt()
  elements.promptInput.focus()
}

function enqueueCurrentMessage() {
  const prompt = elements.promptInput.value.trim()
  if (!prompt) {
    elements.promptInput.focus()
    return false
  }
  const queue = queueForSession()
  if (queue.length >= 3) {
    showToast(t('queueLimit'))
    return false
  }
  queue.push({ id: crypto.randomUUID(), prompt, attachments: structuredClone(state.attachments), createdAt: new Date().toISOString() })
  elements.promptInput.value = ''
  state.attachments = []
  resizePrompt()
  renderAttachments()
  syncQueuedMessages(state.currentSession.id)
  elements.promptInput.focus()
  return true
}

async function guideQueuedMessage(messageId) {
  const sessionId = state.currentSession?.id
  const context = runningContextForSession(sessionId)
  if (context?.guidedQueuedMessage) {
    showToast(t('guidePending'))
    return
  }
  const item = takeQueuedMessage(messageId, sessionId)
  if (!item) return
  if (!context) {
    submitTask({ prompt: item.prompt, attachments: item.attachments, fromQueue: true })
    return
  }
  context.guidedQueuedMessage = item
  await window.studio.stopTask(context.taskId)
}

function takeNextQueuedMessage(sessionId) {
  const queue = queueForSession(sessionId)
  if (!queue.length) return null
  const [item] = queue.splice(0, 1)
  syncQueuedMessages(sessionId)
  return item
}

function startQueuedMessage(item, sessionId) {
  if (!item) return
  if (state.currentSession?.id !== sessionId || runningContextForSession(sessionId)) {
    queueForSession(sessionId).unshift(item)
    syncQueuedMessages(sessionId)
    return
  }
  submitTask({ prompt: item.prompt, attachments: item.attachments || [], fromQueue: true })
}

function stashCurrentActivity() {
  const context = runningContextForSession()
  if (!context?.activityRoot) return
  while (elements.activityTimeline.firstChild) context.activityRoot.append(elements.activityTimeline.firstChild)
}

function activityTimelineForContext(context = null) {
  return context && state.currentSession?.id !== context.sessionId ? context.activityRoot : elements.activityTimeline
}

function syncActivityHtml(sessionId, activityHtml) {
  if (state.currentSession?.id === sessionId) state.currentSession.activityHtml = activityHtml
  const context = runningContextForSession(sessionId)
  if (context?.session) context.session.activityHtml = activityHtml
  state.sessions = state.sessions.map((session) => session.id === sessionId ? { ...session, activityHtml } : session)
}

function activityHtmlSnapshot(timeline) {
  if (!timeline) return ''
  const clone = timeline.cloneNode(true)
  clone.querySelectorAll('.activity-view-preview img, .activity-view-preview iframe').forEach((media) => media.removeAttribute('src'))
  return clone.innerHTML
}

function scheduleActivityPersistence(context = null) {
  const sessionId = context?.sessionId || state.currentSession?.id
  if (!sessionId || context?.deleted) return
  clearTimeout(state.activitySaveTimers.get(sessionId))
  const timer = setTimeout(async () => {
    state.activitySaveTimers.delete(sessionId)
    if (context?.deleted) return
    const timeline = activityTimelineForContext(context)
    const activityHtml = activityHtmlSnapshot(timeline)
    syncActivityHtml(sessionId, activityHtml)
    await window.studio.saveSessionActivity(sessionId, activityHtml).catch(() => false)
  }, 180)
  state.activitySaveTimers.set(sessionId, timer)
}

function rebuildHistoricalActivity(session) {
  const container = document.createElement('div')
  const append = (iconMarkup, title, details, status = '', step = null) => {
    const row = document.createElement('div')
    row.className = 'activity-event'
    if (step?.stepId) row.dataset.stepId = step.stepId
    if (step?.kind) row.dataset.kind = step.kind
    row.innerHTML = `<span class="event-icon ${status}">${iconMarkup}</span><div class="event-body"><strong>${escapeText(title)}</strong><p>${escapeText(details)}</p><time>${formatTime(session.updatedAt)}</time></div>`
    container.append(row)
  }
  for (const message of session.messages || []) {
    if (message.role !== 'assistant') continue
    for (const report of message.stageReports || []) {
      const text = typeof report === 'string' ? report : report?.text
      if (text) append(icon('message'), language() === 'en-US' ? 'Agent update' : '智能体汇报', text)
    }
    for (const step of message.workSteps || []) {
      if (step.kind === 'session' || step.stepId === 'session:init') continue
      append(progressIcon(step.kind), step.kind === 'view' ? viewStageTitle({ ...step, status: 'done' }) : (step.label || (language() === 'en-US' ? 'Task step' : '任务阶段')), step.detail || '', step.status === 'error' ? 'error' : 'done', step)
    }
    if (message.content) append(icon('check'), language() === 'en-US' ? 'Final answer' : '最终结论', String(message.content).slice(0, 1400), 'done')
  }
  return container.innerHTML
}

function restoreActivityViewPreviews(session) {
  const viewSteps = (session?.messages || []).flatMap((message) => message.workSteps || []).filter((step) => step.kind === 'view' && step.filePath)
  for (const step of viewSteps) {
    const row = [...elements.activityTimeline.querySelectorAll('.activity-event')].find((candidate) => candidate.dataset.stepId === step.stepId)
    if (!row) continue
    const surface = ensureActivityViewSurface(row, step)
    window.studio.previewFile(step.filePath)
      .then((snapshot) => renderViewDocumentWindow(surface, snapshot, step, session.workspace || state.settings.workspace))
      .catch(() => viewPreviewUnavailable(surface, step))
  }
}

function restoreSessionActivity(session, context = null) {
  elements.activityTimeline.replaceChildren()
  if (context?.activityRoot?.childNodes.length) {
    while (context.activityRoot.firstChild) elements.activityTimeline.append(context.activityRoot.firstChild)
    restoreActivityViewPreviews(session)
    return
  }
  if (session?.activityHtml) {
    elements.activityTimeline.innerHTML = session.activityHtml
    restoreActivityViewPreviews(session)
    return
  }
  const rebuilt = session?.messages?.length ? rebuildHistoricalActivity(session) : ''
  if (rebuilt) {
    elements.activityTimeline.innerHTML = rebuilt
    restoreActivityViewPreviews(session)
    syncActivityHtml(session.id, rebuilt)
    window.studio.saveSessionActivity(session.id, rebuilt).catch(() => false)
    return
  }
  elements.activityTimeline.innerHTML = `<div class="empty-inspector"><span>${icon('activity')}</span><strong>${context ? t('taskRunning') : t('noActivity')}</strong><p>${context ? t('activityRunningHint') : t('activityHint')}</p></div>`
}

function setRunning(running) {
  elements.taskStatusDot.classList.toggle('running', running)
  elements.livePill.classList.toggle('running', running)
  elements.livePill.innerHTML = `<i></i> ${running ? t('running') : t('idle')}`
  elements.promptInput.disabled = false
  syncComposerAction()
  if (running) elements.currentTaskMeta.textContent = t('runningLocal')
}

function syncComposerAction() {
  const runningContext = runningContextForSession()
  const running = Boolean(runningContext)
  const hasPrompt = Boolean(elements.promptInput.value.trim())
  const answeringQuestion = Boolean(running && hasPrompt && runningContext.activeApprovalEvent?.kind === 'question')
  const shouldStop = running && !hasPrompt
  elements.sendButton.classList.toggle('stop-ready', shouldStop)
  elements.sendButton.classList.toggle('queue-ready', running && hasPrompt && !answeringQuestion)
  elements.sendButton.classList.toggle('answer-ready', answeringQuestion)
  elements.sendButton.setAttribute('aria-label', shouldStop ? t('stopTask') : (answeringQuestion ? '回答并继续' : (running ? t('addToQueue') : t('send'))))
  elements.sendButton.innerHTML = icon(shouldStop ? 'stop' : 'arrow-up')
}

function showNextWelcome() {
  const hour = new Date().getHours()
  let period = 'evening'
  const greetings = language() === 'en-US'
    ? { late: 'It’s late. ', morning: 'Good morning. ', noon: 'Good afternoon. ', afternoon: 'Good afternoon. ', evening: 'Good evening. ' }
    : { late: '夜深了，', morning: '早上好，', noon: '中午好，', afternoon: '下午好，', evening: '晚上好，' }
  if (hour >= 23 || hour < 5) period = 'late'
  else if (hour < 11) period = 'morning'
  else if (hour < 13) period = 'noon'
  else if (hour < 18) period = 'afternoon'
  const phrases = activeWelcomePhraseSets()[language()][period]
  state.welcomeCursor = (state.welcomeCursor + 1) % phrases.length
  elements.welcome.dataset.variant = welcomeVariants[(hour + state.welcomeCursor) % welcomeVariants.length]
  const phrase = phrases[state.welcomeCursor]
  elements.welcomeLead.textContent = language() === 'zh-CN' ? phrase : `${greetings[period]}${phrase}`
  elements.welcome.classList.remove('welcome-refresh')
  void elements.welcome.offsetWidth
  elements.welcome.classList.add('welcome-refresh')
}

let welcomeAnimationRevision = 0
let welcomeAnimationPending = false

function startWelcomeAnimation() {
  const logo = elements.welcomeLogo
  const source = logo?.dataset.src
  if (!logo || !source) return
  if (document.visibilityState !== 'visible') {
    welcomeAnimationPending = true
    logo.removeAttribute('src')
    return
  }
  welcomeAnimationPending = false
  logo.removeAttribute('src')
  void logo.offsetWidth
  welcomeAnimationRevision += 1
  logo.src = `${source}?play=${welcomeAnimationRevision}`
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && welcomeAnimationPending) startWelcomeAnimation()
})

function newSession() {
  stashCurrentActivity()
  state.currentSession = {
    id: crypto.randomUUID(),
    claudeSessionId: crypto.randomUUID(),
    backendSessionStarted: false,
    title: t('newTaskTitle'),
    workspace: state.settings.workspace,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
    tokenUsage: 0,
    queuedMessages: [],
    messages: [],
  }
  state.messageQueues.set(state.currentSession.id, [])
  state.attachments = []
  elements.messages.replaceChildren()
  elements.activityTimeline.innerHTML = `<div class="empty-inspector"><span>${icon('activity')}</span><strong>${t('noActivity')}</strong><p>${t('activityHint')}</p></div>`
  elements.welcome.hidden = false
  startWelcomeAnimation()
  showNextWelcome()
  elements.currentTaskTitle.textContent = t('newTaskTitle')
  elements.currentTaskMeta.textContent = t('notStarted')
  renderTokenUsage(0, false)
  elements.promptInput.value = ''
  renderAttachments()
  renderMessageQueue()
  renderSessions()
  setRunning(false)
  resizePrompt()
  elements.promptInput.focus()
}

function groupLabel(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = Math.round((startToday - startDate) / 86400000)
  if (language() === 'en-US') {
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return 'This week'
    return 'Earlier'
  }
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff < 7) return '本周'
  return '更早'
}

function renderSessions() {
  const query = elements.sessionSearch.value.trim().toLowerCase()
  const archived = state.historyView === 'archived'
  const sessions = state.sessions
    .filter((session) => Boolean(session.archived) === archived)
    .filter((session) => !query || session.title.toLowerCase().includes(query))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  elements.activeCount.textContent = state.sessions.filter((item) => !item.archived).length
  elements.archiveCount.textContent = state.sessions.filter((item) => item.archived).length
  elements.sessionList.replaceChildren()

  if (!sessions.length) {
    const empty = document.createElement('div')
    empty.className = 'empty-history'
    empty.textContent = archived ? t('noArchivedSessions') : t('noSessionsYet')
    elements.sessionList.append(empty)
    return
  }

  let lastGroup = ''
  for (const session of sessions) {
    const group = groupLabel(session.updatedAt)
    if (group !== lastGroup) {
      const label = document.createElement('div')
      label.className = 'session-group-label'
      label.textContent = group
      elements.sessionList.append(label)
      lastGroup = group
    }

    const row = document.createElement('div')
    const running = isSessionRunning(session.id)
    row.className = `session-item${state.currentSession?.id === session.id ? ' active' : ''}${running ? ' running' : ''}`
    row.innerHTML = `
      <span class="session-icon">${running ? `<span class="session-running-ring" aria-label="${t('taskRunning')}"></span>` : icon(session.archived ? 'archive' : 'chat')}</span>
      <span class="session-copy"><strong>${escapeText(session.title)}</strong><small>${formatTime(session.updatedAt)} · ${escapeText(basename(session.workspace))}</small></span>
      <span class="session-actions">
        <button class="archive-session" aria-label="${session.archived ? t('unarchive') : t('archive')}" title="${session.archived ? t('unarchive') : t('archive')}">${icon(session.archived ? 'undo' : 'archive')}</button>
        <button class="delete-session" aria-label="${t('deleteConversation')}" title="${t('deleteConversation')}">${icon('trash')}</button>
      </span>
    `
    row.addEventListener('click', (event) => {
      if (event.target.closest('.session-actions')) return
      loadSession(session)
    })
    row.querySelector('.archive-session').addEventListener('click', async () => {
      const nextArchived = !session.archived
      state.sessions = await window.studio.archiveSession(session.id, nextArchived)
      if (state.currentSession?.id === session.id) state.currentSession.archived = nextArchived
      const runningContext = runningContextForSession(session.id)
      if (runningContext) runningContext.session.archived = nextArchived
      renderSessions()
      showToast(session.archived ? '会话已移出归档。' : '会话已归档。')
    })
    row.querySelector('.delete-session').addEventListener('click', () => openDeleteConfirm(session))
    elements.sessionList.append(row)
  }
}

function openDeleteConfirm(session) {
  state.pendingDeleteSession = session
  elements.deleteConfirmText.textContent = language() === 'en-US'
    ? `“${session.title}” and its local DeepSeek Nova session record will be removed. This cannot be undone.`
    : `“${session.title}”将从历史记录中移除，对应的 DeepSeek Nova 本地会话记录也会一并清理。此操作无法撤销。`
  elements.deleteConfirm.hidden = false
  requestAnimationFrame(() => elements.confirmDelete.focus())
}

function closeDeleteConfirm() {
  elements.deleteConfirm.hidden = true
  state.pendingDeleteSession = null
}

async function confirmSessionDeletion() {
  const session = state.pendingDeleteSession
  if (!session) return
  elements.confirmDelete.disabled = true
  elements.confirmDelete.textContent = language() === 'en-US' ? 'Deleting…' : '正在删除…'
  try {
    const runningContext = runningContextForSession(session.id)
    if (runningContext) {
      runningContext.deleted = true
      await window.studio.stopTask(runningContext.taskId)
    }
    const result = await window.studio.deleteSession(session.id)
    clearTimeout(state.activitySaveTimers.get(session.id))
    state.activitySaveTimers.delete(session.id)
    state.messageQueues.delete(session.id)
    state.sessions = result.sessions
    const deletedCurrentSession = state.currentSession?.id === session.id
    closeDeleteConfirm()
    if (deletedCurrentSession) newSession()
    else renderSessions()
    showToast(language() === 'en-US'
      ? (result.removedRecords ? 'Conversation and local record deleted.' : 'Conversation deleted; no local record was found.')
      : (result.removedRecords ? '会话及其本地记录已删除。' : '会话已删除；没有找到对应的本地记录。'))
  } catch (error) {
    showToast(language() === 'en-US' ? `Delete failed: ${error.message}` : `删除失败：${error.message}`)
  } finally {
    elements.confirmDelete.disabled = false
    elements.confirmDelete.textContent = t('deleteConversation')
  }
}

function loadSession(session) {
  stashCurrentActivity()
  state.currentSession = structuredClone(session)
  if (!state.messageQueues.has(session.id)) state.messageQueues.set(session.id, structuredClone(session.queuedMessages || []))
  if (session.workspace && session.workspace !== state.settings.workspace) {
    state.settings.workspace = session.workspace
    syncWorkspaceUI()
    loadFiles()
  }
  elements.messages.replaceChildren()
  elements.welcome.hidden = Boolean(session.messages?.length)
  if (!elements.welcome.hidden) startWelcomeAnimation()
  if (!state.currentSession.claudeSessionId) state.currentSession.claudeSessionId = crypto.randomUUID()
  if (typeof state.currentSession.backendSessionStarted !== 'boolean') state.currentSession.backendSessionStarted = false
  for (const message of session.messages || []) addMessage(message.role, message.content, message.files || message.attachments || [], message)
  const runningContext = runningContextForSession(session.id)
  if (runningContext?.turn?.article) elements.messages.append(runningContext.turn.article)
  restoreSessionActivity(session, runningContext)
  renderTokenUsage(runningContext ? runningContext.baseTokens + runningContext.usageTokens : sessionTokenUsage(state.currentSession), false)
  elements.currentTaskTitle.textContent = session.title
  elements.currentTaskMeta.textContent = `${formatTime(session.updatedAt)} · ${basename(session.workspace)}`
  renderSessions()
  setRunning(Boolean(runningContext))
  renderMessageQueue()
  elements.conversation.scrollTop = elements.conversation.scrollHeight
}

function formatDuration(milliseconds = 0) {
  const totalSeconds = Math.max(1, Math.round(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`
}

function sessionTokenUsage(session = null) {
  if (Number.isFinite(session?.tokenUsage)) return Math.max(0, Math.floor(session.tokenUsage))
  return (session?.messages || []).reduce((total, message) => total + (Number(message.usageTokens) || 0), 0)
}

function renderTokenUsage(value = 0, animate = true) {
  const next = Math.max(0, Math.floor(Number(value) || 0))
  const previous = state.displayedTokens
  const shouldAnimate = animate && next >= previous && next !== previous
  const nextDigits = String(next)
  const previousDigits = String(previous).padStart(nextDigits.length, '0').slice(-nextDigits.length)
  const fragment = document.createDocumentFragment()

  for (let index = 0; index < nextDigits.length; index += 1) {
    if (index > 0 && (nextDigits.length - index) % 3 === 0) {
      const separator = document.createElement('span')
      separator.className = 'token-separator'
      separator.textContent = ','
      fragment.append(separator)
    }
    const digit = document.createElement('span')
    digit.className = 'token-digit'
    const oldValue = previousDigits[index]
    const newValue = nextDigits[index]
    if (shouldAnimate && oldValue !== newValue) {
      digit.classList.add('rolling')
      digit.style.setProperty('--roll-delay', `${index * 24}ms`)
      digit.innerHTML = `<span class="token-digit-track"><span>${oldValue}</span><span>${newValue}</span></span>`
    } else {
      digit.textContent = newValue
    }
    fragment.append(digit)
  }

  elements.tokenOdometer.replaceChildren(fragment)
  elements.tokenOdometer.setAttribute('aria-label', `${next} Token`)
  state.displayedTokens = next
}

function renderRollingInteger(target, value, prefix = '', animate = true) {
  const next = Math.max(0, Math.floor(Number(value) || 0))
  const previous = Math.max(0, Math.floor(Number(target.dataset.value) || 0))
  const nextDigits = String(next)
  const previousDigits = String(previous).padStart(nextDigits.length, '0').slice(-nextDigits.length)
  const fragment = document.createDocumentFragment()
  const sign = document.createElement('span')
  sign.className = 'edit-count-sign'
  sign.textContent = prefix
  fragment.append(sign)
  for (let index = 0; index < nextDigits.length; index += 1) {
    const digit = document.createElement('span')
    digit.className = 'edit-count-digit'
    const oldValue = previousDigits[index]
    const newValue = nextDigits[index]
    if (animate && previous !== next && oldValue !== newValue) {
      digit.classList.add('rolling')
      digit.style.setProperty('--roll-delay', `${index * 24}ms`)
      digit.innerHTML = `<span class="edit-count-digit-track"><span>${oldValue}</span><span>${newValue}</span></span>`
    } else {
      digit.textContent = newValue
    }
    fragment.append(digit)
  }
  target.replaceChildren(fragment)
  target.dataset.value = String(next)
}

function renderEditLineStats(target, additions = 0, deletions = 0, animate = true) {
  const added = Math.max(0, Number(additions) || 0)
  const removed = Math.max(0, Number(deletions) || 0)
  target.hidden = !added && !removed
  if (target.hidden) {
    target.replaceChildren()
    return
  }
  let addedTarget = target.querySelector('.edit-count-added')
  let removedTarget = target.querySelector('.edit-count-removed')
  if (!addedTarget) {
    addedTarget = document.createElement('span')
    addedTarget.className = 'edit-count edit-count-added diff-added'
    target.append(addedTarget)
  }
  if (!removedTarget) {
    removedTarget = document.createElement('span')
    removedTarget.className = 'edit-count edit-count-removed diff-removed'
    target.append(removedTarget)
  }
  addedTarget.hidden = !added
  removedTarget.hidden = !removed
  if (added) renderRollingInteger(addedTarget, added, '+', animate)
  if (removed) renderRollingInteger(removedTarget, removed, '-', animate)
  target.setAttribute('aria-label', `${added} lines added, ${removed} lines removed`)
}

function completedTurnStatus(durationMs) {
  return `<span>${language() === 'en-US' ? 'Processed' : '已处理'} ${formatDuration(durationMs)}</span><span class="collapse-chevron">${icon('chevron-right')}</span>`
}

function setTurnProcessCollapsed(turn, collapsed) {
  if (!turn) return
  turn.body.classList.toggle('process-collapsed', collapsed)
  turn.status.setAttribute('aria-expanded', String(!collapsed))
  turn.status.setAttribute('aria-label', collapsed ? '展开任务过程' : '收起任务过程')
}

function toggleTurnProcess(turn) {
  if (!turn?.status.classList.contains('done')) return
  setTurnProcessCollapsed(turn, !turn.body.classList.contains('process-collapsed'))
}

function showThinking(turn) {
  if (!turn || !turn.status.classList.contains('thinking')) return
  turn.status.classList.remove('pending-thinking')
  turn.status.innerHTML = '<span class="thinking-orb"><i></i><i></i><i></i></span><span class="thinking-label">Thinking</span>'
}

const stagePhaseCopySets = {
  'zh-CN': { edit: '正在编辑文件', view: '正在查看图像', read: '正在查看项目', search: '正在查找关键信息', command: '正在运行命令', browser: '正在检查页面', agent: '正在协调任务', plan: '正在规划下一步', approval: '等待你的确认', message: '正在整理阶段结果', complete: '阶段处理完成', default: '正在处理任务' },
  'en-US': { edit: 'Editing content', view: 'Viewing image', read: 'Understanding the project', search: 'Finding relevant information', command: 'Running command', browser: 'Checking the page', agent: 'Coordinating tasks', plan: 'Planning the next step', approval: 'Waiting for your confirmation', message: 'Preparing a progress update', complete: 'Stage complete', default: 'Working on the task' },
}

function editStageTitle(event = {}, locale = language()) {
  const fileName = basename(event.detail || event.filePath || '')
  const stateCopy = locale === 'en-US'
    ? { done: 'Edited', error: 'Edit failed', awaitingApproval: 'Waiting to edit', running: 'Editing' }
    : { done: '已编辑', error: '编辑失败', awaitingApproval: '等待批准编辑', running: '正在编辑' }
  const prefix = stateCopy[event.status] || stateCopy.running
  return fileName ? `${prefix} ${fileName}` : (locale === 'en-US' ? `${prefix} file` : `${prefix}文件`)
}

function viewStageTitle(event = {}, locale = language()) {
  const fileName = basename(event.detail || event.filePath || '')
  const completed = event.status === 'done'
  const failed = event.status === 'error'
  const awaiting = event.status === 'awaitingApproval'
  if (locale === 'en-US') {
    if (completed) return fileName ? `Viewed ${fileName}` : 'Viewed file'
    if (failed) return fileName ? `View failed ${fileName}` : 'View failed'
    if (awaiting) return fileName ? `Waiting to view ${fileName}` : 'Waiting to view'
    return event.viewType === 'pdf' ? 'Viewing PDF' : 'Viewing image'
  }
  if (completed) return fileName ? `已查看 ${fileName}` : '已查看文件'
  if (failed) return fileName ? `查看失败 ${fileName}` : '查看失败'
  if (awaiting) return fileName ? `等待批准查看 ${fileName}` : '等待批准查看'
  return event.viewType === 'pdf' ? '正在查看 PDF' : '正在查看图像'
}

function readStageTitle(event = {}, locale = language()) {
  const fileName = basename(event.detail || event.filePath || '')
  if (locale === 'en-US') {
    if (event.status === 'done') return fileName ? `Viewed ${fileName}` : 'Viewed project'
    if (event.status === 'error') return fileName ? `View failed ${fileName}` : 'Project view failed'
    if (event.status === 'awaitingApproval') return fileName ? `Waiting to view ${fileName}` : 'Waiting to view project'
    return 'Viewing project'
  }
  if (event.status === 'done') return fileName ? `已查看 ${fileName}` : '已查看项目'
  if (event.status === 'error') return fileName ? `查看失败 ${fileName}` : '查看项目失败'
  if (event.status === 'awaitingApproval') return fileName ? `等待批准查看 ${fileName}` : '等待批准查看项目'
  return '正在查看项目'
}

function commandStageTitle(event = {}, locale = language()) {
  const command = String(event.detail || event.command || event.label || '').replace(/\s+/g, ' ').trim()
  const stateCopy = locale === 'en-US'
    ? { done: 'Ran', error: 'Run failed', awaitingApproval: 'Waiting to run', running: 'Running' }
    : { done: '已运行', error: '运行失败', awaitingApproval: '等待批准运行', running: '正在运行' }
  const prefix = stateCopy[event.status] || stateCopy.running
  return command ? `${prefix} ${command}` : (locale === 'en-US' ? `${prefix} command` : `${prefix}命令`)
}

function stageSummaryRowKey(event = {}) {
  const phase = event.kind || 'default'
  if (event.rowKey) return event.rowKey
  return event.stepId ? `${phase}:${event.stepId}` : phase
}

function stageSummaryTitle(event = {}, locale = language()) {
  const phase = event.kind || 'default'
  if (phase === 'edit') return editStageTitle(event, locale)
  if (phase === 'view') return viewStageTitle(event, locale)
  if (phase === 'read') return readStageTitle(event, locale)
  if (phase === 'command') return commandStageTitle(event, locale)
  return stagePhaseCopySets[locale][phase] || stagePhaseCopySets[locale].default
}

const groupedStagePhases = new Set(['edit', 'command', 'view', 'read', 'search', 'browser', 'agent'])

function stageSummaryMarkup(phase, title) {
  const summaryContent = `<span class="stage-summary-icon">${progressIcon(phase)}</span><strong>${escapeText(title)}</strong>`
  return `<span class="stage-summary-visual"><span class="stage-summary-layer stage-summary-base">${summaryContent}</span><span class="stage-summary-layer stage-summary-shimmer" aria-hidden="true">${summaryContent}</span></span>`
}

function stageGroupRows(group) {
  return [...(group?.querySelector('.stage-group-items')?.children || [])].filter((row) => row.classList.contains('stage-summary'))
}

function stageGroupTitle(group, locale = language()) {
  const phase = group?.dataset.phase || 'default'
  const rows = stageGroupRows(group)
  const count = rows.length
  if (locale === 'en-US') {
    if (phase === 'edit') return `Edited ${count} files`
    if (phase === 'command') return `Ran ${count} commands`
    if (phase === 'view') return `Viewed ${count} files`
    if (phase === 'read') return `Read ${count} project items`
    if (phase === 'search') return `Completed ${count} searches`
    if (phase === 'browser') return `Checked ${count} pages`
    if (phase === 'agent') return `Coordinated ${count} tasks`
    return `Completed ${count} steps`
  }
  if (phase === 'edit') return `编辑了文件 · ${count} 个`
  if (phase === 'command') return `运行了命令 · ${count} 个`
  if (phase === 'view') {
    const viewTypes = new Set(rows.map((row) => row.dataset.viewType).filter(Boolean))
    return `${viewTypes.size === 1 && viewTypes.has('image') ? '查看了图像' : '查看了文件'} · ${count} 个`
  }
  if (phase === 'read') return `查看了项目 · ${count} 项`
  if (phase === 'search') return `查找了内容 · ${count} 次`
  if (phase === 'browser') return `检查了页面 · ${count} 次`
  if (phase === 'agent') return `协调了任务 · ${count} 项`
  return `处理了阶段 · ${count} 项`
}

function updateStageGroup(group) {
  if (!group) return null
  const header = group.querySelector('.stage-group-header')
  const title = stageGroupTitle(group)
  header.querySelectorAll('strong').forEach((strong) => { strong.textContent = title })
  group.dataset.count = String(stageGroupRows(group).length)
  return header
}

function createStageGroup(turn, phase, firstRow, secondRow) {
  const group = document.createElement('section')
  group.className = 'stage-group'
  group.dataset.phase = phase
  const header = document.createElement('div')
  header.className = 'stage-group-header'
  header.dataset.phase = phase
  header.innerHTML = `${stageSummaryMarkup(phase, '')}<button type="button" class="stage-group-toggle" aria-expanded="false" title="${language() === 'en-US' ? 'Show grouped steps' : '展开同类阶段'}">${icon('chevron-right')}</button>`
  const items = document.createElement('div')
  items.className = 'stage-group-items'
  items.hidden = true
  firstRow.before(group)
  group.append(header, items)
  items.append(firstRow, secondRow)
  header.querySelector('.stage-group-toggle').addEventListener('click', (event) => {
    const button = event.currentTarget
    const expanded = button.getAttribute('aria-expanded') !== 'true'
    button.setAttribute('aria-expanded', String(expanded))
    items.hidden = !expanded
    group.classList.toggle('group-expanded', expanded)
  })
  updateStageGroup(group)
  return group
}

function compactCompletedStageRow(turn, row, phase) {
  if (!turn?.stageTimeline || !row || !groupedStagePhases.has(phase) || row.dataset.stageStatus !== 'done') return row
  const currentGroup = row.closest('.stage-group')
  if (currentGroup) return updateStageGroup(currentGroup)
  const previous = row.previousElementSibling
  if (previous?.classList.contains('stage-group') && previous.dataset.phase === phase) {
    previous.querySelector('.stage-group-items').append(row)
    return updateStageGroup(previous)
  }
  if (previous?.classList.contains('stage-summary') && previous.dataset.phase === phase && previous.dataset.stageStatus === 'done') {
    return updateStageGroup(createStageGroup(turn, phase, previous, row))
  }
  return row
}

function ensureCommandSummaryControl(row, event = {}) {
  if (!row) return
  let tools = row.querySelector('.stage-command-tools')
  if (!tools) {
    tools = document.createElement('span')
    tools.className = 'stage-command-tools'
    tools.innerHTML = `<button type="button" class="stage-command-toggle" aria-expanded="false" title="${language() === 'en-US' ? 'Show full command' : '展开完整命令'}">${icon('chevron-right')}</button>`
    tools.querySelector('.stage-command-toggle').addEventListener('click', (clickEvent) => {
      const button = clickEvent.currentTarget
      const expanded = button.getAttribute('aria-expanded') !== 'true'
      button.setAttribute('aria-expanded', String(expanded))
      row.classList.toggle('command-expanded', expanded)
    })
    row.append(tools)
  }
  const commandText = commandStageTitle(event)
  requestAnimationFrame(() => {
    const title = row.querySelector('.stage-summary-base strong')
    const needsToggle = commandText.length > 72 || Boolean(title && title.scrollWidth > title.clientWidth + 1)
    tools.hidden = !needsToggle
    if (!needsToggle) {
      row.classList.remove('command-expanded')
      tools.querySelector('.stage-command-toggle').setAttribute('aria-expanded', 'false')
    }
  })
}

function markLatestStageItem(turn, row, type) {
  if (!turn?.stageTimeline) return
  elements.messages.querySelectorAll('.latest-stage-summary').forEach((item) => item.classList.remove('latest-stage-summary'))
  turn.latestStageItemType = type
  if (type === 'summary' && turn.status.classList.contains('thinking') && row) {
    void row.offsetWidth
    row.classList.add('latest-stage-summary')
  }
}

function updateStageSummary(turn, event = {}) {
  if (!turn?.stageTimeline) return
  const phase = event.kind || 'default'
  const rowKey = stageSummaryRowKey(event)
  const title = stageSummaryTitle(event)
  turn.progress.classList.add('visible')
  let row = turn.stageSummaryRows.get(rowKey)
  if (!row) {
    row = document.createElement('div')
    row.className = 'stage-summary'
    row.dataset.phase = phase
    row.dataset.rowKey = rowKey
    if (event.stepId) row.dataset.stepId = event.stepId
    row.innerHTML = stageSummaryMarkup(phase, title)
    turn.stageTimeline.append(row)
    turn.stageSummaryRows.set(rowKey, row)
    const summaryData = { kind: phase, title, rowKey, stepId: event.stepId || '' }
    row.summaryData = summaryData
    turn.stageSummaryData.push(summaryData)
    turn.progressOrder.push({ type: 'summary', kind: phase, rowKey, stepId: event.stepId || '' })
  }
  row.dataset.stageStatus = event.status || row.dataset.stageStatus || 'running'
  row.dataset.stageName = event.detail || event.filePath || row.dataset.stageName || ''
  row.dataset.stageLabel = event.label || row.dataset.stageLabel || ''
  row.dataset.viewType = event.viewType || row.dataset.viewType || ''
  row.classList.toggle('command-stage', phase === 'command')
  const displayedEvent = { ...event, status: row.dataset.stageStatus, detail: row.dataset.stageName, label: row.dataset.stageLabel, viewType: row.dataset.viewType }
  row.querySelectorAll('strong').forEach((strong) => { strong.textContent = stageSummaryTitle(displayedEvent) })
  if (row.summaryData) {
    row.summaryData.title = stageSummaryTitle(displayedEvent)
    row.summaryData.status = row.dataset.stageStatus
    row.summaryData.detail = row.dataset.stageName
    row.summaryData.label = row.dataset.stageLabel
    row.summaryData.filePath = event.filePath || row.summaryData.filePath || ''
    row.summaryData.viewType = row.dataset.viewType
  }
  if (phase === 'command') ensureCommandSummaryControl(row, displayedEvent)
  const visibleRow = compactCompletedStageRow(turn, row, phase)
  markLatestStageItem(turn, visibleRow, 'summary')
  return row
}

function scrollEditWindowToFocus(surface) {
  const viewport = surface?.querySelector('.edit-code-scroll')
  const focus = surface?.querySelector('.edit-code-line.is-focus')
  if (!viewport || !focus || !viewport.clientHeight) return
  viewport.scrollTop = Math.max(0, focus.offsetTop - (viewport.clientHeight - focus.offsetHeight) / 2)
}

function renderEditCodeWindow(surface, snapshot, step = {}) {
  if (!surface) return
  const headerName = surface.querySelector('.edit-preview-name')
  const headerMeta = surface.querySelector('.edit-preview-meta')
  const viewport = surface.querySelector('.edit-code-scroll')
  headerName.textContent = snapshot?.name || basename(step.filePath || step.detail || '') || (language() === 'en-US' ? 'Edited file' : '编辑文件')
  viewport.replaceChildren()
  if (!snapshot || snapshot.type !== 'text') {
    headerMeta.textContent = ''
    const unavailable = document.createElement('div')
    unavailable.className = 'edit-preview-unavailable'
    unavailable.textContent = language() === 'en-US' ? 'The file content is not available yet.' : '文件内容暂时不可预览。'
    viewport.append(unavailable)
    return
  }
  const normalized = String(snapshot.content || '').replace(/\r\n/g, '\n')
  const lines = normalized.split('\n')
  const diff = editDiffPlan(normalized, step)
  const focusLine = diff.focusLine
  headerMeta.textContent = `${focusLine} / ${Math.max(1, lines.length)}`
  const fragment = document.createDocumentFragment()
  const appendDeletedRows = (lineNumber) => {
    for (const group of diff.deletedBefore.get(lineNumber) || []) {
      group.lines.forEach((line, index) => {
        fragment.append(createEditCodeLine(line, group.startLine + index, 'deleted', group.focus && index === 0))
      })
    }
  }
  lines.forEach((line, index) => {
    const lineNumber = index + 1
    appendDeletedRows(lineNumber)
    fragment.append(createEditCodeLine(line, lineNumber, diff.addedLines.has(lineNumber) ? 'added' : '', diff.focusType === 'added' && lineNumber === focusLine))
  })
  appendDeletedRows(lines.length + 1)
  viewport.append(fragment)
  requestAnimationFrame(() => scrollEditWindowToFocus(surface))
}

function previewDiffLines(text = '') {
  if (!text) return []
  const lines = String(text).replace(/\r\n/g, '\n').split('\n')
  if (lines.at(-1) === '') lines.pop()
  return lines
}

function editDiffPlan(content = '', step = {}) {
  const source = String(content).replace(/\r\n/g, '\n')
  const addedLines = new Set()
  const deletedBefore = new Map()
  const changes = Array.isArray(step.changes) ? step.changes : []
  let focusLine = locateEditLine(source, step)
  let focusType = 'added'
  changes.forEach((change, changeIndex) => {
    const newText = String(change.newText || '').replace(/\r\n/g, '\n')
    const oldLines = previewDiffLines(change.oldText)
    const newLines = previewDiffLines(newText)
    const foundIndex = newText ? source.indexOf(newText) : -1
    const startLine = foundIndex >= 0
      ? source.slice(0, foundIndex).split('\n').length
      : Math.max(1, Number(change.startLine) || Number(step.startLine) || focusLine)
    newLines.forEach((_line, index) => addedLines.add(startLine + index))
    if (oldLines.length) {
      const groups = deletedBefore.get(startLine) || []
      groups.push({ lines: oldLines, startLine, focus: changeIndex === changes.length - 1 && !newLines.length })
      deletedBefore.set(startLine, groups)
    }
    if (changeIndex === changes.length - 1) {
      focusLine = startLine
      focusType = newLines.length ? 'added' : 'deleted'
    }
  })
  if (!changes.length) {
    const count = Math.max(1, Number(step.additions) || 1)
    for (let index = 0; index < count; index += 1) addedLines.add(focusLine + index)
  }
  return { addedLines, deletedBefore, focusLine, focusType }
}

function createEditCodeLine(text, lineNumber, tone = '', focused = false) {
  const row = document.createElement('div')
  row.className = `edit-code-line${tone ? ` is-${tone}` : ''}${focused ? ' is-focus' : ''}`
  const marker = document.createElement('span')
  marker.className = 'edit-code-marker'
  marker.textContent = tone === 'added' ? '+' : (tone === 'deleted' ? '-' : '')
  const number = document.createElement('span')
  number.className = 'edit-code-line-number'
  number.textContent = String(lineNumber)
  const code = document.createElement('code')
  code.textContent = text || ' '
  row.append(marker, number, code)
  return row
}

function locateEditLine(content = '', step = {}) {
  const source = String(content).replace(/\r\n/g, '\n')
  const focusText = String(step.focusText || '').replace(/\r\n/g, '\n')
  let index = focusText ? source.indexOf(focusText) : -1
  if (index < 0 && focusText) {
    const anchor = focusText.split('\n').map((line) => line.trim()).find(Boolean)
    if (anchor) index = source.split('\n').findIndex((line) => line.trim() === anchor)
    if (index >= 0) return index + 1
  }
  if (index >= 0) return source.slice(0, index).split('\n').length
  return Math.max(1, Math.min(Number(step.startLine) || 1, source.split('\n').length || 1))
}

function ensureStageEditSurface(turn, step) {
  const row = turn?.stageSummaryRows?.get(stageSummaryRowKey(step))
    || [...(turn?.stageSummaryRows?.values() || [])].findLast((candidate) => candidate.dataset.phase === 'edit')
  if (!row) return null
  row.classList.add('has-edit-surface')
  let tools = row.querySelector('.stage-edit-tools')
  let surface = row.querySelector('.stage-edit-preview')
  if (!tools) {
    tools = document.createElement('span')
    tools.className = 'stage-edit-tools'
    tools.innerHTML = `<span class="stage-edit-stats"></span><button type="button" class="stage-edit-toggle" aria-expanded="false" title="${language() === 'en-US' ? 'Show edited file' : '展开编辑内容'}">${icon('chevron-right')}</button>`
    surface = document.createElement('section')
    surface.className = 'stage-edit-preview'
    surface.hidden = true
    surface.innerHTML = `<header><span class="edit-preview-name"></span><span class="edit-preview-meta"></span></header><div class="edit-code-scroll"></div>`
    tools.querySelector('.stage-edit-toggle').addEventListener('click', (event) => {
      const button = event.currentTarget
      const expanded = button.getAttribute('aria-expanded') !== 'true'
      button.setAttribute('aria-expanded', String(expanded))
      surface.hidden = !expanded
      row.classList.toggle('edit-expanded', expanded)
      requestAnimationFrame(() => scrollEditWindowToFocus(surface))
    })
    row.append(tools, surface)
  }
  const previewReady = Boolean(step.filePath || typeof step.previewContent === 'string' && step.previewContent.length)
  const completed = step.status === 'done'
  tools.hidden = !completed
  tools.querySelector('.stage-edit-toggle').hidden = !completed || !previewReady
  if (!completed || !previewReady) {
    surface.hidden = true
    row.classList.remove('edit-expanded')
    tools.querySelector('.stage-edit-toggle').setAttribute('aria-expanded', 'false')
  }
  renderEditLineStats(tools.querySelector('.stage-edit-stats'), step.additions, step.deletions)
  return surface
}

function ensureStageViewSurface(turn, step) {
  const row = turn?.stageSummaryRows?.get(stageSummaryRowKey(step))
    || [...(turn?.stageSummaryRows?.values() || [])].findLast((candidate) => candidate.dataset.phase === 'view')
  if (!row) return null
  row.classList.add('has-view-surface')
  let tools = row.querySelector('.stage-view-tools')
  let surface = row.querySelector('.stage-view-preview')
  if (!tools) {
    tools = document.createElement('span')
    tools.className = 'stage-view-tools'
    tools.innerHTML = `<button type="button" class="stage-view-toggle" aria-expanded="false" title="${language() === 'en-US' ? 'Show viewed file' : '展开查看内容'}">${icon('chevron-right')}</button>`
    surface = document.createElement('section')
    surface.className = 'stage-view-preview'
    surface.hidden = true
    surface.innerHTML = `<header><span class="view-preview-name"></span><span class="view-preview-meta"></span></header><div class="view-preview-body"></div>`
    tools.querySelector('.stage-view-toggle').addEventListener('click', (event) => {
      const button = event.currentTarget
      const expanded = button.getAttribute('aria-expanded') !== 'true'
      button.setAttribute('aria-expanded', String(expanded))
      surface.hidden = !expanded
      row.classList.toggle('view-expanded', expanded)
    })
    row.append(tools, surface)
  }
  surface.dataset.filePath = step.filePath || surface.dataset.filePath || ''
  const completed = step.status === 'done'
  const previewReady = Boolean(step.filePath)
  tools.hidden = !completed || !previewReady
  if (!completed || !previewReady) {
    surface.hidden = true
    row.classList.remove('view-expanded')
    tools.querySelector('.stage-view-toggle').setAttribute('aria-expanded', 'false')
  }
  return surface
}

function viewPreviewUnavailable(surface, step) {
  if (!surface) return
  surface.querySelector('.view-preview-name').textContent = basename(step.filePath || step.detail || '') || (language() === 'en-US' ? 'Viewed file' : '查看文件')
  surface.querySelector('.view-preview-meta').textContent = ''
  const body = surface.querySelector('.view-preview-body')
  body.replaceChildren()
  const unavailable = document.createElement('div')
  unavailable.className = 'view-preview-unavailable'
  unavailable.textContent = language() === 'en-US' ? 'Preview is not available.' : '暂时无法预览该文件。'
  body.append(unavailable)
}

async function renderViewDocumentWindow(surface, snapshot, step, workspace = state.settings.workspace) {
  if (!surface) return false
  const generation = (Number(surface.dataset.renderGeneration) || 0) + 1
  surface.dataset.renderGeneration = String(generation)
  surface.dataset.filePath = step.filePath || surface.dataset.filePath || ''
  const name = snapshot?.name || basename(step.filePath || step.detail || '')
  surface.classList.toggle('is-image', snapshot?.type === 'image')
  surface.classList.toggle('is-pdf', snapshot?.type === 'pdf' || step.viewType === 'pdf')
  surface.querySelector('.view-preview-name').textContent = name || (language() === 'en-US' ? 'Viewed file' : '查看文件')
  surface.querySelector('.view-preview-meta').textContent = snapshot?.type === 'pdf' || step.viewType === 'pdf' ? 'PDF' : (language() === 'en-US' ? 'IMAGE' : '图像')
  const body = surface.querySelector('.view-preview-body')
  body.replaceChildren()
  if (snapshot?.type === 'image' && snapshot.dataUrl) {
    const image = document.createElement('img')
    image.src = snapshot.dataUrl
    image.alt = name
    image.loading = 'lazy'
    image.title = language() === 'en-US' ? 'Open full-size preview' : '点击查看大图'
    image.addEventListener('click', () => openMediaViewer([{
      type: 'image',
      url: snapshot.dataUrl,
      name,
      relativePath: name,
      path: step.filePath || snapshot.path || '',
      size: snapshot.size || 0,
    }], 0))
    body.append(image)
    return true
  }
  if (snapshot?.type === 'pdf' && step.filePath) {
    try {
      const sourceUrl = snapshot.dataUrl || (await window.studio.createMediaUrl({ path: step.filePath, workspace })).url
      if (surface.dataset.renderGeneration !== String(generation)) return false
      const frame = document.createElement('iframe')
      frame.src = `${sourceUrl}#page=1&toolbar=0&navpanes=0`
      frame.title = name
      frame.loading = 'lazy'
      body.append(frame)
      return true
    } catch {}
  }
  viewPreviewUnavailable(surface, step)
  return false
}

function typeStageReport(turn, row, text) {
  const content = row.querySelector('.stage-report-text')
  row.targetText = text
  turn.progress.classList.add('visible')
  if (row.classList.contains('typing')) return
  row.classList.add('typing')
  const tick = () => {
    const target = row.targetText || ''
    const shown = Math.min(target.length, Number(row.displayedLength) || 0)
    if (shown < target.length) {
      const remaining = target.length - shown
      const step = remaining > 80 ? 3 : (remaining > 36 ? 2 : 1)
      row.displayedLength = Math.min(target.length, shown + step)
      content.textContent = target.slice(0, row.displayedLength)
      row.typingTimer = setTimeout(tick, 16)
      return
    }
    row.classList.remove('typing')
    renderMarkdown(content, target)
  }
  tick()
}

function completeStageReportTyping(turn) {
  for (const row of turn.reportRows.values()) {
    clearTimeout(row.typingTimer)
    cancelAnimationFrame(row.markdownFrame || 0)
    row.classList.remove('typing')
    row.displayedLength = (row.targetText || '').length
    renderMarkdown(row.querySelector('.stage-report-text'), row.targetText || '')
  }
}

function renderStageReportMarkdown(turn, row, text) {
  clearTimeout(row.typingTimer)
  cancelAnimationFrame(row.markdownFrame || 0)
  row.classList.remove('typing')
  row.targetText = text
  row.displayedLength = text.length
  turn.progress.classList.add('visible')
  row.markdownFrame = requestAnimationFrame(() => {
    row.markdownFrame = 0
    renderMarkdown(row.querySelector('.stage-report-text'), row.targetText || '')
  })
}

function upsertStageReport(turn, event = {}) {
  if (!turn || !event.text) return
  const messageId = event.messageId || 'message:current'
  let row = turn.reportRows.get(messageId)
  if (!row) {
    row = document.createElement('div')
    row.className = 'stage-report'
    const content = document.createElement('div')
    content.className = 'stage-report-text'
    row.append(content)
    turn.stageTimeline.append(row)
    turn.reportRows.set(messageId, row)
    turn.messageOrder.push(messageId)
    turn.messageTexts.set(messageId, '')
    turn.progressOrder.push({ type: 'report', messageId })
  }
  markLatestStageItem(turn, row, 'report')
  const text = `${turn.messageTexts.get(messageId) || ''}${event.text}`
  turn.messageTexts.set(messageId, text)
  turn.rawText = turn.messageOrder.map((id) => turn.messageTexts.get(id) || '').filter(Boolean).join('\n\n')
  if (event.instant || event.finalCandidate) {
    renderStageReportMarkdown(turn, row, text)
  } else {
    typeStageReport(turn, row, text)
  }
}

function demoteFinalCandidate(context) {
  const messageId = context?.finalCandidateMessageId
  if (!messageId) return
  context.finalCandidateMessageId = ''
}

function presentFinalCandidate(context, event) {
  const messageId = event.messageId || 'message:current'
  if (context.finalCandidateMessageId && context.finalCandidateMessageId !== messageId) demoteFinalCandidate(context)
  upsertStageReport(context.turn, event)
  context.finalCandidateMessageId = messageId
}

function restoreStageReports(turn, reports = [], summaries = [], progressOrder = []) {
  const normalizedReports = reports.map((report, index) => typeof report === 'string'
    ? { messageId: `history:${index}`, text: report }
    : { messageId: report?.messageId || `history:${index}`, text: report?.text || '' })
  const normalizedSummaries = Array.isArray(summaries) ? summaries : (summaries ? [summaries] : [])
  const reportMap = new Map(normalizedReports.map((report) => [report.messageId, report]))
  const restoredReports = new Set()
  const restoredSummaries = new Set()
  for (const item of Array.isArray(progressOrder) ? progressOrder : []) {
    if (item?.type === 'report' && reportMap.has(item.messageId)) {
      const report = reportMap.get(item.messageId)
      if (report.text) upsertStageReport(turn, { messageId: report.messageId, text: report.text, instant: true })
      restoredReports.add(item.messageId)
    }
    if (item?.type === 'summary') {
      const summaryIndex = normalizedSummaries.findIndex((summary, index) => !restoredSummaries.has(index)
        && (item.stepId ? summary?.stepId === item.stepId : (item.rowKey ? summary?.rowKey === item.rowKey : (summary?.kind || 'default') === item.kind)))
      if (summaryIndex >= 0) {
        const summary = normalizedSummaries[summaryIndex]
        updateStageSummary(turn, { ...summary, kind: summary.kind || item.kind || 'default' })
        restoredSummaries.add(summaryIndex)
      }
    }
  }
  for (const report of normalizedReports) {
    if (restoredReports.has(report.messageId)) continue
    const text = typeof report === 'string' ? report : report?.text
    if (!text) continue
    upsertStageReport(turn, { messageId: report.messageId, text, instant: true })
  }
  normalizedSummaries.forEach((summary, index) => {
    if (restoredSummaries.has(index)) return
    if (summary?.kind || summary?.title) updateStageSummary(turn, { ...summary, kind: summary.kind || 'default' })
  })
}

function addMessage(role, content = '', files = [], metadata = {}) {
  const article = document.createElement('article')
  article.className = `message ${role}`

  if (role === 'user') {
    const stack = document.createElement('div')
    stack.className = 'user-message-stack'
    if (files.length) {
      const attachments = document.createElement('div')
      attachments.className = 'user-message-files'
      attachments.setAttribute('aria-label', language() === 'en-US' ? 'Uploaded files' : '已上传文件')
      for (const file of files) {
        const card = document.createElement('button')
        card.type = 'button'
        card.className = 'user-message-file'
        card.title = file.path || file.name || ''
        card.innerHTML = `${icon('file')}<span class="user-message-file-copy"><strong>${escapeText(file.name || basename(file.path))}</strong><small>${formatSize(file.size)}</small></span>`
        card.addEventListener('click', () => file.path && previewFile(file.path, true))
        card.addEventListener('dblclick', () => file.path && window.studio.openFile(file.path))
        attachments.append(card)
      }
      stack.append(attachments)
    }
    const bubble = document.createElement('div')
    bubble.className = 'user-bubble'
    bubble.textContent = content
    stack.append(bubble)
    article.append(stack)
    elements.messages.append(article)
    return { article, text: bubble, body: stack }
  }

  const body = document.createElement('div')
  body.className = 'agent-turn'
  const status = document.createElement('div')
  status.className = `turn-status${metadata.running ? ' thinking pending-thinking' : ' done'}`
  status.innerHTML = metadata.running ? '' : completedTurnStatus(metadata.durationMs || 1000)
  const progress = document.createElement('div')
  progress.className = 'progress-updates'
  const stageTimeline = document.createElement('div')
  stageTimeline.className = 'stage-timeline'
  progress.append(stageTimeline)
  const text = document.createElement('div')
  text.className = 'assistant-response'
  const approvals = document.createElement('div')
  approvals.className = 'approval-stack'
  body.append(status, progress, text, approvals)
  article.append(body)
  elements.messages.append(article)

  const restoredWorkSteps = structuredClone(Array.isArray(metadata.workSteps) ? metadata.workSteps : [])
  const turn = { article, text, body, status, progress, stageTimeline, stageSummary: stageTimeline, stageReports: stageTimeline, approvals, stageSummaryRows: new Map(), reportRows: new Map(), messageTexts: new Map(), messageOrder: [], stageSummaryData: [], progressOrder: [], workSteps: restoredWorkSteps, rawText: '', thinkingTimer: null }
  status.addEventListener('click', () => toggleTurnProcess(turn))
  status.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleTurnProcess(turn)
    }
  })
  if (metadata.running) turn.thinkingTimer = setTimeout(() => showThinking(turn), 500)
  setAssistantText(turn, content)
  restoreStageReports(turn, metadata.stageReports || [], metadata.stageSummaries || metadata.stageSummary, metadata.progressOrder || [])
  if (!metadata.stageReports?.length && metadata.workSteps?.length) {
    for (const step of metadata.workSteps) {
      if (step.kind === 'session' || step.stepId === 'session:init' || step.label === '会话已连接') continue
      updateStageSummary(turn, step)
    }
  }
  const restoredEditSteps = restoredWorkSteps.filter((step) => step.kind === 'edit')
  restoredEditSteps.forEach((restoredEditStep, editIndex) => {
    const restoredFile = files.find((file) => file.path === restoredEditStep.filePath)
      || files.find((file) => restoredEditStep.detail && String(file.relativePath || file.name || '').replace(/\\/g, '/').endsWith(String(restoredEditStep.detail).replace(/\\/g, '/')))
      || (files.length === restoredEditSteps.length ? files[editIndex] : (files.length === 1 ? files[0] : null))
    if (restoredFile) {
      restoredEditStep.filePath ||= restoredFile.path
      restoredEditStep.detail ||= restoredFile.relativePath || restoredFile.name
      restoredEditStep.additions ||= Number(restoredFile.additions) || 0
      restoredEditStep.deletions ||= Number(restoredFile.deletions) || 0
      restoredEditStep.startLine ||= Number(restoredFile.startLine) || 1
      if (!restoredEditStep.changes?.length && restoredFile.changes?.length) restoredEditStep.changes = restoredFile.changes
    }
    updateStageSummary(turn, restoredEditStep)
    const surface = ensureStageEditSurface(turn, restoredEditStep)
    if (restoredEditStep.previewContent) {
      renderEditCodeWindow(surface, { type: 'text', name: basename(restoredEditStep.filePath || restoredEditStep.detail || ''), content: restoredEditStep.previewContent }, restoredEditStep)
    } else if (restoredEditStep.filePath) {
      window.studio.previewFile(restoredEditStep.filePath)
        .then((snapshot) => renderEditCodeWindow(surface, snapshot, restoredEditStep))
        .catch(() => renderEditCodeWindow(surface, null, restoredEditStep))
    }
  })
  const restoredViewSteps = restoredWorkSteps.filter((step) => step.kind === 'view' && step.filePath)
  restoredViewSteps.forEach((restoredViewStep) => {
    const surface = ensureStageViewSurface(turn, restoredViewStep)
    window.studio.previewFile(restoredViewStep.filePath)
      .then((snapshot) => renderViewDocumentWindow(surface, snapshot, restoredViewStep, metadata.workspace || state.currentSession?.workspace || state.settings.workspace))
      .catch(() => viewPreviewUnavailable(surface, restoredViewStep))
  })
  if (files.length) appendChangedFiles(body, files)
  if (!metadata.running) {
    status.tabIndex = 0
    status.setAttribute('role', 'button')
    setTurnProcessCollapsed(turn, true)
  }
  return turn
}

function setTurnComplete(turn, durationMs) {
  if (!turn) return
  completeStageReportTyping(turn)
  clearTimeout(turn.thinkingTimer)
  turn.thinkingTimer = null
  turn.status.className = 'turn-status done'
  turn.status.innerHTML = completedTurnStatus(durationMs)
  turn.status.tabIndex = 0
  turn.status.setAttribute('role', 'button')
  if (turn.stageSummaryData.length) updateStageSummary(turn, { kind: 'complete' })
  setTurnProcessCollapsed(turn, true)
}

function progressIcon(kind) {
  const name = ({ edit: 'edit', view: 'image', read: 'file', search: 'search', command: 'terminal', browser: 'globe', agent: 'bot', plan: 'list', approval: 'help', message: 'message', complete: 'check', session: 'chat' })[kind] || 'dot'
  return icon(name)
}

function renderDiffStats(target, additions, deletions, label = '已编辑：') {
  const added = Math.max(0, Number(additions) || 0)
  const removed = Math.max(0, Number(deletions) || 0)
  target.hidden = !added && !removed
  target.innerHTML = target.hidden
    ? ''
    : `<span>${label}</span><b class="diff-added">+${added}</b><b class="diff-removed">-${removed}</b>`
}

function recordWorkStep(turn, event) {
  if (!turn || !event.stepId) return null
  let saved = turn.workSteps.find((step) => step.stepId === event.stepId)
  if (!saved) {
    turn.workSteps.push({ stepId: event.stepId, kind: event.kind || 'tool', label: event.label || '正在处理', detail: event.detail || '', additions: event.additions || 0, deletions: event.deletions || 0, filePath: event.filePath || '', viewType: event.viewType || '', focusText: event.focusText || '', changes: event.changes || [], previewContent: event.previewContent || '', startLine: event.startLine || 1, endLine: event.endLine || 1, status: event.status || '' })
    saved = turn.workSteps.at(-1)
  }
  if (event.kind) saved.kind = event.kind
  if (event.label) saved.label = event.label
  if (event.detail !== undefined) saved.detail = event.detail
  if (event.additions !== undefined) saved.additions = event.additions
  if (event.deletions !== undefined) saved.deletions = event.deletions
  if (event.filePath !== undefined) saved.filePath = event.filePath
  if (event.viewType !== undefined) saved.viewType = event.viewType
  if (event.focusText !== undefined) saved.focusText = event.focusText
  if (event.changes !== undefined) saved.changes = event.changes
  if (event.previewContent !== undefined) saved.previewContent = event.previewContent
  if (event.startLine !== undefined) saved.startLine = event.startLine
  if (event.endLine !== undefined) saved.endLine = event.endLine
  if (event.status !== undefined) saved.status = event.status
  if (saved.kind === 'session' && /^[0-9a-f-]{36}$/i.test(saved.detail || '')) saved.detail = '上下文已同步'
  if (saved.kind !== 'session') {
    updateStageSummary(turn, saved)
    if (saved.kind === 'edit') ensureStageEditSurface(turn, saved)
    if (saved.kind === 'view') ensureStageViewSurface(turn, saved)
  }
  return saved
}

const imageMediaExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.avif'])
const videoMediaExtensions = new Set(['.mp4', '.m4v', '.webm', '.mov', '.ogv'])
const audioMediaExtensions = new Set(['.mp3', '.m4a', '.aac', '.ogg', '.wav', '.flac'])

function mediaTypeForFile(path = '') {
  const extension = fileExtension(path)
  if (imageMediaExtensions.has(extension)) return 'image'
  if (videoMediaExtensions.has(extension)) return 'video'
  if (audioMediaExtensions.has(extension)) return 'audio'
  return ''
}

function appendChangedFileChips(container, files) {
  if (!files.length) return
  const list = document.createElement('div')
  list.className = 'changed-files'
  for (const file of files) {
    const chip = document.createElement('button')
    chip.className = 'changed-file'
    chip.title = '单击预览，双击在文件夹中显示'
    chip.innerHTML = `<span>${icon('file')}</span><span class="changed-file-name">${escapeText(file.relativePath || file.name)}</span><span class="changed-file-diff"></span>`
    renderDiffStats(chip.querySelector('.changed-file-diff'), file.additions, file.deletions, '')
    chip.addEventListener('click', () => previewFile(file.path, true))
    chip.addEventListener('dblclick', () => window.studio.revealFile(file.path))
    list.append(chip)
  }
  container.append(list)
}

function mediaCardVisual(item) {
  if (item.type === 'image') {
    const image = document.createElement('img')
    image.src = item.url
    image.alt = item.name
    image.loading = 'lazy'
    image.draggable = false
    return image
  }
  if (item.type === 'video') {
    const video = document.createElement('video')
    video.src = item.url
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    return video
  }
  const audio = document.createElement('div')
  audio.className = 'media-audio-art'
  audio.innerHTML = `${icon('music')}<i></i><i></i><i></i><i></i>`
  return audio
}

function setupMediaRail(shell, count) {
  const viewport = shell.querySelector('.media-rail-viewport')
  const previous = shell.querySelector('.media-rail-prev')
  const next = shell.querySelector('.media-rail-next')
  const countLabel = next.querySelector('.media-more-count')
  let currentIndex = 0

  const metrics = () => {
    const card = viewport.querySelector('.media-card')
    if (!card) return { step: 1, visible: 1, maxIndex: 0 }
    const gap = Number.parseFloat(getComputedStyle(viewport.querySelector('.media-rail-track')).columnGap) || 7
    const step = card.getBoundingClientRect().width + gap
    const visible = Math.max(1, Math.floor((viewport.clientWidth + gap) / step))
    return { step, visible, maxIndex: Math.max(0, count - visible) }
  }

  const update = () => {
    const { step, visible, maxIndex } = metrics()
    currentIndex = Math.max(0, Math.min(maxIndex, Math.round(viewport.scrollLeft / step)))
    const hiddenAfter = Math.max(0, count - currentIndex - visible)
    previous.disabled = currentIndex === 0
    next.disabled = hiddenAfter === 0
    previous.setAttribute('aria-hidden', String(previous.disabled))
    next.setAttribute('aria-hidden', String(next.disabled))
    countLabel.textContent = `+${hiddenAfter}`
    next.setAttribute('aria-label', hiddenAfter ? `向右查看更多媒体，还有 ${hiddenAfter} 个` : '已显示全部媒体')
  }

  const move = (direction) => {
    const { step, maxIndex } = metrics()
    currentIndex = Math.max(0, Math.min(maxIndex, currentIndex + direction))
    viewport.scrollTo({ left: currentIndex * step, behavior: motionReduced() ? 'auto' : 'smooth' })
    setTimeout(update, motionReduced() ? 0 : 240)
  }

  previous.addEventListener('click', () => move(-1))
  next.addEventListener('click', () => move(1))
  viewport.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true })
  const observer = new ResizeObserver(update)
  observer.observe(viewport)
  requestAnimationFrame(update)
}

async function renderMediaRail(container, files, workspace = state.settings.workspace) {
  const shell = document.createElement('section')
  shell.className = 'media-rail-shell loading'
  shell.setAttribute('aria-label', `媒体文件，共 ${files.length} 个`)
  shell.innerHTML = `
    <button type="button" class="media-rail-nav media-rail-prev" aria-label="向左查看媒体" disabled>${icon('chevron-left')}</button>
    <div class="media-rail-viewport"><div class="media-rail-track"></div></div>
    <button type="button" class="media-rail-nav media-rail-next" aria-label="向右查看更多媒体">
      <span class="media-more-count">+${files.length}</span><span class="media-more-arrow">${icon('chevron-right')}</span>
    </button>
  `
  container.append(shell)
  const track = shell.querySelector('.media-rail-track')
  const loadedItems = await Promise.all(files.map(async (file) => {
    try {
      return await window.studio.createMediaUrl({ path: file.path, workspace })
    } catch {
      return null
    }
  }))

  const mediaItems = loadedItems.filter(Boolean)
  loadedItems.forEach((item, index) => {
    if (!item) return
    const file = files[index]
    const card = document.createElement('article')
    card.className = `media-card ${item.type}`
    card.tabIndex = 0
    card.setAttribute('role', 'button')
    card.setAttribute('aria-label', `预览 ${item.name}`)
    const visual = document.createElement('div')
    visual.className = 'media-card-visual'
    visual.append(mediaCardVisual(item))
    if (item.type === 'video') visual.insertAdjacentHTML('beforeend', `<span class="media-play-badge">${icon('play')}</span>`)
    if (item.type !== 'image') visual.insertAdjacentHTML('beforeend', `<span class="media-type-badge">${item.type === 'video' ? 'VIDEO' : 'AUDIO'}</span>`)
    const name = document.createElement('span')
    name.className = 'media-card-name'
    name.textContent = file.relativePath || item.name
    const reveal = document.createElement('button')
    reveal.type = 'button'
    reveal.className = 'media-card-reveal'
    reveal.title = '在文件夹中显示'
    reveal.setAttribute('aria-label', `在文件夹中显示 ${item.name}`)
    reveal.innerHTML = icon('folder-open')
    reveal.addEventListener('click', (event) => {
      event.stopPropagation()
      window.studio.revealFile(item.path)
    })
    const mediaIndex = mediaItems.indexOf(item)
    const open = () => openMediaViewer(mediaItems, mediaIndex)
    card.addEventListener('click', open)
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        open()
      }
    })
    card.append(visual, name, reveal)
    track.append(card)
  })
  shell.classList.remove('loading')
  const count = track.children.length
  if (!count) {
    shell.remove()
    appendChangedFileChips(container, files)
    return
  }
  shell.setAttribute('aria-label', `媒体文件，共 ${count} 个`)
  setupMediaRail(shell, count)
}

function closeMediaViewer() {
  const lightbox = document.querySelector('.media-lightbox')
  if (!lightbox) return false
  lightbox.querySelectorAll('video, audio').forEach((media) => media.pause())
  lightbox.remove()
  return true
}

function openMediaViewer(items, initialIndex = 0) {
  closeMediaViewer()
  if (!Array.isArray(items) || !items.length) return
  let currentIndex = Math.max(0, Math.min(initialIndex, items.length - 1))
  const lightbox = document.createElement('div')
  lightbox.className = 'media-lightbox'
  lightbox.innerHTML = `
    <div class="media-lightbox-dialog" role="dialog" aria-modal="true" aria-label="媒体预览">
      <div class="media-lightbox-stage"></div>
      <button class="media-lightbox-nav media-lightbox-prev" aria-label="上一个媒体">${icon('chevron-left')}</button>
      <button class="media-lightbox-nav media-lightbox-next" aria-label="下一个媒体">${icon('chevron-right')}</button>
      <footer><div><strong></strong><small></small></div><span class="media-lightbox-actions"><button class="media-lightbox-reveal">${icon('folder-open')} 在文件夹中显示</button><button class="media-lightbox-open">${icon('external')} 本地打开</button></span></footer>
      <button class="media-lightbox-close" aria-label="关闭预览">${icon('close')}</button>
    </div>
  `
  const stage = lightbox.querySelector('.media-lightbox-stage')
  const previous = lightbox.querySelector('.media-lightbox-prev')
  const next = lightbox.querySelector('.media-lightbox-next')
  const title = lightbox.querySelector('footer strong')
  const details = lightbox.querySelector('footer small')

  const renderCurrent = () => {
    const item = items[currentIndex]
    stage.querySelectorAll('video, audio').forEach((media) => media.pause())
    stage.replaceChildren()
    if (item.type === 'image') {
      const image = document.createElement('img')
      image.src = item.url
      image.alt = item.name
      stage.append(image)
    } else if (item.type === 'video') {
      const video = document.createElement('video')
      video.src = item.url
      video.controls = true
      video.autoplay = true
      video.playsInline = true
      stage.append(video)
    } else {
      const audioWrap = document.createElement('div')
      audioWrap.className = 'media-lightbox-audio'
      audioWrap.innerHTML = `${icon('music')}<strong>${escapeText(item.name)}</strong>`
      const audio = document.createElement('audio')
      audio.src = item.url
      audio.controls = true
      audio.autoplay = true
      audioWrap.append(audio)
      stage.append(audioWrap)
    }
    title.textContent = item.name
    details.textContent = `${item.relativePath} · ${formatSize(item.size)} · ${currentIndex + 1}/${items.length}`
    previous.disabled = currentIndex === 0
    next.disabled = currentIndex === items.length - 1
    lightbox.querySelector('.media-lightbox-reveal').onclick = () => window.studio.revealFile(item.path)
    lightbox.querySelector('.media-lightbox-open').onclick = () => window.studio.openFile(item.path)
  }
  const move = (delta) => {
    const nextIndex = Math.max(0, Math.min(currentIndex + delta, items.length - 1))
    if (nextIndex === currentIndex) return
    currentIndex = nextIndex
    renderCurrent()
  }
  lightbox.querySelector('.media-lightbox-close').addEventListener('click', closeMediaViewer)
  previous.addEventListener('click', () => move(-1))
  next.addEventListener('click', () => move(1))
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
  })
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeMediaViewer() })
  document.body.append(lightbox)
  renderCurrent()
  requestAnimationFrame(() => lightbox.classList.add('visible'))
  lightbox.querySelector('.media-lightbox-close').focus()
}

function appendChangedFiles(container, files, workspace = state.settings.workspace) {
  const mediaFiles = files.filter((file) => mediaTypeForFile(file.path))
  const otherFiles = files.filter((file) => !mediaTypeForFile(file.path))
  if (mediaFiles.length) renderMediaRail(container, mediaFiles, workspace)
  appendChangedFileChips(container, otherFiles)
}

function renderAttachments() {
  elements.attachmentStrip.replaceChildren()
  for (const attachment of state.attachments) {
    const chip = document.createElement('div')
    chip.className = 'attachment-chip'
    chip.title = attachment.path
    chip.innerHTML = `<b>${icon('file')}</b><span>${escapeText(attachment.name)}</span><small>${formatSize(attachment.size)}</small><button title="移除" aria-label="移除">${icon('close')}</button>`
    chip.addEventListener('dblclick', () => window.studio.openFile(attachment.path))
    chip.querySelector('button').addEventListener('click', () => {
      state.attachments = state.attachments.filter((item) => item.path !== attachment.path)
      renderAttachments()
    })
    elements.attachmentStrip.append(chip)
  }
}

async function chooseAttachments() {
  const selected = await window.studio.chooseAttachments()
  const known = new Set(state.attachments.map((item) => item.path))
  state.attachments.push(...selected.filter((item) => !known.has(item.path)))
  renderAttachments()
  if (selected.length) showToast(`已添加 ${selected.length} 个文件。`)
}

function addActivity(icon, title, details, status = '', timestamp = new Date(), context = null) {
  const timeline = activityTimelineForContext(context)
  if (timeline.querySelector('.empty-inspector')) timeline.replaceChildren()
  const event = document.createElement('div')
  event.className = 'activity-event'
  event.innerHTML = `
    <span class="event-icon ${status}">${icon}</span>
    <div class="event-body"><strong>${escapeText(title)}</strong><p>${escapeText(details)}</p><time>${formatTime(timestamp)}</time></div>
  `
  timeline.append(event)
  if (timeline === elements.activityTimeline) timeline.scrollTop = timeline.scrollHeight
  scheduleActivityPersistence(context)
  return event
}

function upsertActivityProgress(event, context) {
  const activitySteps = context?.activitySteps || new Map()
  let row = activitySteps.get(event.stepId)
  if (!row) {
    row = addActivity(progressIcon(event.kind), event.label || '正在处理', event.detail || '', '', new Date(), context)
    activitySteps.set(event.stepId, row)
  }
  row.dataset.stepId = event.stepId || row.dataset.stepId || ''
  row.dataset.kind = event.kind || row.dataset.kind || ''
  const iconElement = row.querySelector('.event-icon')
  const title = row.querySelector('strong')
  const detail = row.querySelector('p')
  if (event.kind === 'view') title.textContent = viewStageTitle(event)
  else if (event.kind === 'read') title.textContent = readStageTitle(event)
  else if (event.kind === 'command') title.textContent = commandStageTitle(event)
  else if (event.kind === 'edit') title.textContent = editStageTitle(event)
  else if (event.label) title.textContent = event.label
  if (event.detail !== undefined) detail.textContent = event.detail || ''
  if (event.status === 'done') {
    iconElement.innerHTML = icon('check')
    iconElement.className = 'event-icon done'
  } else if (event.status === 'error') {
    iconElement.innerHTML = icon('warning')
    iconElement.className = 'event-icon error'
  } else if (event.status === 'awaitingApproval') {
    iconElement.innerHTML = icon('help')
    iconElement.className = 'event-icon awaiting-approval'
  } else {
    iconElement.innerHTML = progressIcon(event.kind)
    iconElement.className = 'event-icon'
  }
  scheduleActivityPersistence(context)
  return row
}

function ensureActivityEditSurface(row, step) {
  if (!row) return null
  row.classList.add('edit-activity-event')
  const body = row.querySelector('.event-body')
  let titleLine = body.querySelector('.event-title-line')
  if (!titleLine) {
    titleLine = document.createElement('div')
    titleLine.className = 'event-title-line'
    const title = body.querySelector(':scope > strong')
    title.before(titleLine)
    titleLine.append(title)
    const stats = document.createElement('span')
    stats.className = 'event-edit-stats'
    titleLine.append(stats)
  }
  renderEditLineStats(titleLine.querySelector('.event-edit-stats'), step.additions, step.deletions)
  let surface = body.querySelector('.activity-edit-preview')
  if (!surface) {
    surface = document.createElement('section')
    surface.className = 'activity-edit-preview'
    surface.innerHTML = `<header><span class="edit-preview-name"></span><span class="edit-preview-meta"></span></header><div class="edit-code-scroll"></div>`
    renderEditCodeWindow(surface, null, step)
    body.append(surface)
  }
  return surface
}

function ensureActivityViewSurface(row, step) {
  if (!row) return null
  row.classList.add('view-activity-event')
  const body = row.querySelector('.event-body')
  let surface = body.querySelector('.activity-view-preview')
  if (!surface) {
    surface = document.createElement('section')
    surface.className = 'activity-view-preview'
    surface.innerHTML = `<header><span class="view-preview-name"></span><span class="view-preview-meta"></span></header><div class="view-preview-body"></div>`
    viewPreviewUnavailable(surface, step)
    body.append(surface)
  }
  surface.dataset.filePath = step.filePath || surface.dataset.filePath || ''
  return surface
}

function scheduleEditPreview(context, step, activityRow, immediate = false) {
  if (!context || step?.kind !== 'edit' || (!step.filePath && !step.previewContent)) return Promise.resolve(false)
  context.editPreviewTimers ||= new Map()
  context.editPreviewGenerations ||= new Map()
  clearTimeout(context.editPreviewTimers.get(step.stepId))
  const generation = (context.editPreviewGenerations.get(step.stepId) || 0) + 1
  context.editPreviewGenerations.set(step.stepId, generation)
  const summarySurface = ensureStageEditSurface(context.turn, step)
  const activitySurface = ensureActivityEditSurface(activityRow, step)
  const projectedSnapshot = step.previewContent
    ? { type: 'text', name: basename(step.filePath || step.detail || ''), content: step.previewContent }
    : null
  if (projectedSnapshot) {
    renderEditCodeWindow(summarySurface, projectedSnapshot, step)
    renderEditCodeWindow(activitySurface, projectedSnapshot, step)
  }
  return new Promise((resolve) => {
    const timer = setTimeout(async () => {
      const snapshot = step.filePath ? await window.studio.previewFile(step.filePath).catch(() => null) : null
      if (!context.deleted && context.editPreviewGenerations.get(step.stepId) === generation) {
        if (snapshot?.type === 'text' || !projectedSnapshot) {
          renderEditCodeWindow(summarySurface, snapshot, step)
          renderEditCodeWindow(activitySurface, snapshot, step)
        }
        scheduleActivityPersistence(context)
      }
      resolve(Boolean(snapshot?.type === 'text' || projectedSnapshot))
    }, immediate ? 0 : (step.status === 'done' ? 60 : 140))
    context.editPreviewTimers.set(step.stepId, timer)
  })
}

function scheduleViewPreview(context, step, activityRow) {
  if (!context || step?.kind !== 'view' || !step.filePath) return Promise.resolve(false)
  context.viewPreviewGenerations ||= new Map()
  const generation = (context.viewPreviewGenerations.get(step.stepId) || 0) + 1
  context.viewPreviewGenerations.set(step.stepId, generation)
  const summarySurface = ensureStageViewSurface(context.turn, step)
  const activitySurface = ensureActivityViewSurface(activityRow, step)
  return window.studio.previewFile(step.filePath)
    .then(async (snapshot) => {
      if (context.deleted || context.viewPreviewGenerations.get(step.stepId) !== generation) return false
      const results = await Promise.all([
        renderViewDocumentWindow(summarySurface, snapshot, step, context.session.workspace),
        renderViewDocumentWindow(activitySurface, snapshot, step, context.session.workspace),
      ])
      scheduleActivityPersistence(context)
      return results.some(Boolean)
    })
    .catch(() => {
      viewPreviewUnavailable(summarySurface, step)
      viewPreviewUnavailable(activitySurface, step)
      scheduleActivityPersistence(context)
      return false
    })
}

function renderApprovalCard(context, event) {
  const turn = context?.turn
  if (!turn || turn.approvals.querySelector(`[data-approval-id="${event.approvalId}"]`)) return null
  const card = document.createElement('section')
  card.className = 'approval-card'
  card.dataset.approvalId = event.approvalId
  card.dataset.approvalKind = event.kind || 'question'
  const heading = document.createElement('div')
  heading.className = 'approval-heading'
  const pendingCount = Math.max(0, (context.approvalQueue?.length || 1) - 1)
  const headingCopy = event.kind === 'permission'
    ? (context.approvalHistory?.length ? '下一项审批' : '需要你的批准')
    : (context.approvalHistory?.length ? '待补充选择' : '需要你的选择')
  heading.innerHTML = `<span>${icon(event.kind === 'permission' ? 'warning' : 'help')}</span><div><span class="approval-title-line"><strong>${headingCopy}</strong>${pendingCount ? `<small>后续 ${pendingCount} 项</small>` : ''}</span><p>${escapeText(event.question)}</p></div>`
  const actions = document.createElement('div')
  actions.className = 'approval-actions'
  for (const option of event.options || []) {
    const button = document.createElement('button')
    button.innerHTML = `<strong>${escapeText(option.label)}</strong>${option.description ? `<small>${escapeText(option.description)}</small>` : ''}`
    button.addEventListener('click', () => handleApprovalChoice(context, event, option, card))
    actions.append(button)
  }
  card.append(heading, actions)
  if (event.kind === 'question') card.insertAdjacentHTML('beforeend', '<p class="approval-custom-hint">也可以直接在下方输入框中描述你的答案。</p>')
  turn.approvals.append(card)
  elements.conversation.scrollTop = elements.conversation.scrollHeight
  return card
}

function setActiveApprovalEnabled(context, enabled) {
  const card = context?.turn?.approvals?.querySelector('.approval-card.active-approval:not(.resolved)')
  card?.querySelectorAll('button').forEach((button) => { button.disabled = !enabled })
  card?.classList.toggle('approval-paused', !enabled)
}

function showNextApproval(context, enabled = !context?.resumingApproval) {
  if (!context || context.activeApprovalEvent) return context?.activeApprovalEvent || null
  const event = context.approvalQueue?.[0]
  if (!event) {
    context.pendingApprovalEvent = null
    return null
  }
  context.activeApprovalEvent = event
  context.pendingApprovalEvent = event
  const card = renderApprovalCard(context, event)
  card?.classList.add('active-approval')
  setActiveApprovalEnabled(context, enabled)
  return event
}

function queueApprovalEvent(context, event) {
  if (!context || !event?.approvalId) return false
  context.approvalQueue ||= []
  context.approvalIds ||= new Set()
  context.approvalHistory ||= []
  if (context.approvalIds.has(event.approvalId)) return false
  context.approvalIds.add(event.approvalId)
  context.approvalQueue.push({ ...event, answered: false })
  showNextApproval(context)
  return true
}

function advanceApprovalQueue(context, event) {
  if (!context) return
  context.approvalHistory ||= []
  context.approvalHistory.push(event.approvalId)
  context.approvalQueue = (context.approvalQueue || []).filter((item) => item.approvalId !== event.approvalId)
  context.activeApprovalEvent = null
  context.pendingApprovalEvent = null
  showNextApproval(context, false)
}

function addApprovalCard(turnOrContext, event) {
  const context = turnOrContext?.turn
    ? turnOrContext
    : { turn: turnOrContext, approvalQueue: [], approvalIds: new Set(), approvalHistory: [], activeApprovalEvent: null, resumingApproval: false }
  queueApprovalEvent(context, event)
  return context.turn?.approvals?.querySelector(`[data-approval-id="${event.approvalId}"]`) || null
}

function approvedOperationFromEvent(event = {}) {
  const denial = Array.isArray(event.denials) ? event.denials[0] : null
  if (!denial) return null
  return {
    tool_use_id: denial.tool_use_id || '',
    tool_name: denial.tool_name || '操作',
    tool_input: denial.tool_input || denial.input || {},
  }
}

function resolvePermissionQueueForFullAccess(context) {
  if (!context) return 0
  context.approvalHistory ||= []
  const permissionEvents = (context.approvalQueue || []).filter((event) => event.kind === 'permission')
  if (!permissionEvents.length) return 0
  for (const event of permissionEvents) {
    if (!context.approvalHistory.includes(event.approvalId)) context.approvalHistory.push(event.approvalId)
    const card = context.turn?.approvals?.querySelector(`[data-approval-id="${event.approvalId}"]`)
    if (!card) continue
    card.classList.add('resolved')
    card.classList.remove('active-approval', 'approval-paused')
    card.querySelectorAll('button').forEach((button) => { button.disabled = true })
    if (!card.querySelector('.approval-result')) card.insertAdjacentHTML('beforeend', '<p class="approval-result">已切换为完全访问，后台继续</p>')
  }
  context.approvalQueue = (context.approvalQueue || []).filter((event) => event.kind !== 'permission')
  if (context.activeApprovalEvent?.kind === 'permission') {
    context.activeApprovalEvent = null
    context.pendingApprovalEvent = null
  }
  showNextApproval(context, false)
  return permissionEvents.length
}

async function continuePendingPermissionsWithFullAccess(context) {
  const count = resolvePermissionQueueForFullAccess(context)
  if (!count || context.resumingApproval) return false
  context.awaitingApproval = Boolean(context.activeApprovalEvent)
  context.pendingApprovalResponse = {
    prompt: '已切换为完全访问。请直接继续当前任务并处理刚才受阻的操作，不要再次请求相同权限；如果操作受到不可绕过的系统安全策略限制，只汇报一次限制并继续可执行的部分。',
    permissionMode: 'bypassPermissions',
    kind: 'permission',
    approvedOperation: null,
    deniedOperation: null,
  }
  if (context.backendExited) await resumeTaskAfterApproval(context, context.pendingApprovalResponse)
  else await window.studio.stopTask(context.taskId)
  return true
}

async function handleApprovalChoice(context, event, option, card, { textAnswer = false } = {}) {
  if (card.classList.contains('resolved')) return
  card.classList.add('resolved')
  card.classList.remove('active-approval')
  card.querySelectorAll('button').forEach((button) => { button.disabled = true })
  const selectedLabel = option.label || '继续'
  card.insertAdjacentHTML('beforeend', `<p class="approval-result">${textAnswer ? '已补充' : '已选择'}：${escapeText(selectedLabel)}</p>`)

  let prompt
  let permissionMode = state.settings.permissionMode
  let approvedOperation = null
  let deniedOperation = null
  const permissionAllowed = event.kind === 'permission'
    && (option.value === 'allow' || (!option.value && /^(?:批准|允许|继续)/.test(selectedLabel)))
  if (event.kind === 'permission') {
    if (permissionAllowed) {
      permissionMode = 'default'
      approvedOperation = approvedOperationFromEvent(event)
      prompt = `我只批准当前这一项操作：${JSON.stringify(approvedOperation || {}).slice(0, 10000)}。只执行这一项，完成后立即停止其他工具调用并汇报；其他待审批操作仍需逐项询问。`
    } else {
      deniedOperation = approvedOperationFromEvent(event)
      prompt = `不要执行当前这一项操作：${JSON.stringify(deniedOperation || {}).slice(0, 10000)}。只跳过这一项，其他待审批操作仍需逐项询问。`
    }
  } else {
    prompt = `关于“${event.question}”，我的回答是：“${selectedLabel}${option.description ? `（${option.description}）` : ''}”。先应用这一项答案继续当前任务；其他待补充问题不要自行替我选择。`
  }

  advanceApprovalQueue(context, event)
  if (context) {
    context.awaitingApproval = false
    context.pendingApprovalResponse = { prompt, permissionMode, kind: event.kind, approvedOperation, deniedOperation }
  }
  const approvalAccepted = permissionAllowed
  const approvalDenied = event.kind === 'permission' && !permissionAllowed
  addActivity(
    icon(approvalAccepted ? 'check' : (approvalDenied ? 'stop' : 'help')),
    approvalAccepted ? '已批准，正在继续' : (approvalDenied ? '已拒绝，正在跳过' : '已选择，正在继续'),
    selectedLabel,
    approvalAccepted ? 'done' : '',
    new Date(),
    context,
  )
  if (context?.backendExited) await resumeTaskAfterApproval(context, context.pendingApprovalResponse)
  else if (context) await window.studio.stopTask(context.taskId)
}

async function answerActiveQuestionWithText(context, answer) {
  const event = context?.activeApprovalEvent
  if (!event || event.kind !== 'question') return false
  const card = context.turn?.approvals?.querySelector(`[data-approval-id="${event.approvalId}"]`)
  if (!card || card.classList.contains('resolved')) return false
  addMessage('user', answer)
  context.session.messages.push({ role: 'user', content: answer })
  await handleApprovalChoice(context, event, { label: answer, value: 'custom' }, card, { textAnswer: true })
  return true
}

async function resumeTaskAfterApproval(context, response, startTask = window.studio.startTask) {
  if (!context || context.resumingApproval || !response?.prompt || context.deleted) return false
  context.resumingApproval = true
  const previousTaskId = context.taskId
  const taskId = crypto.randomUUID()
  state.runningTasks.delete(previousTaskId)
  context.taskId = taskId
  context.backendExited = false
  context.awaitingApproval = false
  context.pendingApprovalEvent = context.activeApprovalEvent || null
  context.pendingApprovalResponse = null
  context.deferredFinishEvent = null
  context.usageOffset = context.usageTokens
  context.activityOutput = null
  context.approvedOperationInFlight = response.approvedOperation || null
  context.deniedOperationInFlight = response.deniedOperation || null
  state.runningTasks.set(taskId, context)
  if (state.currentSession?.id === context.sessionId) {
    setRunning(true)
    elements.currentTaskMeta.textContent = '正在继续 · 已批准'
  }
  try {
    const result = await startTask({
      taskId,
      prompt: response.prompt,
      attachments: [],
      workspace: context.session.workspace || state.settings.workspace,
      model: state.settings.model,
      effort: state.settings.effort,
      permissionMode: response.permissionMode || state.settings.permissionMode,
      approvedOperation: response.approvedOperation || null,
      deniedOperation: response.deniedOperation || null,
      claudeSessionId: context.session.claudeSessionId,
      resumeSession: true,
      history: [],
    })
    if (result.taskId !== taskId) throw new Error('任务标识不一致')
    context.session.backendSessionStarted = true
    context.resumingApproval = false
    return true
  } catch (error) {
    context.resumingApproval = false
    state.runningTasks.delete(taskId)
    setAssistantText(context.turn, `继续任务失败：${error.message}`)
    setTurnComplete(context.turn, Date.now() - context.startedAt)
    if (state.currentSession?.id === context.sessionId) setRunning(false)
    renderSessions()
    return false
  }
}

async function submitTask(options = {}) {
  const existingContext = runningContextForSession()
  if (existingContext) {
    if (!options.silent && !options.fromQueue) {
      const typedAnswer = elements.promptInput.value.trim()
      if (typedAnswer && existingContext.activeApprovalEvent?.kind === 'question') {
        elements.promptInput.value = ''
        resizePrompt()
        await answerActiveQuestionWithText(existingContext, typedAnswer)
      } else if (typedAnswer) enqueueCurrentMessage()
      else await window.studio.stopTask(existingContext.taskId)
    }
    return
  }
  const internalPrompt = typeof options.prompt === 'string'
  const silent = options.silent === true
  const fromQueue = options.fromQueue === true
  const prompt = (internalPrompt ? options.prompt : elements.promptInput.value).trim()
  if (!prompt) {
    elements.promptInput.focus()
    return
  }
  if (!state.settings.apiKeyConfigured) {
    openSettings('general')
    showToast('请先在设置中配置 DeepSeek API Key。')
    return
  }
  if (!state.currentSession) newSession()

  const session = state.currentSession
  const previousMessages = structuredClone(session.messages || [])
  elements.welcome.hidden = true
  const taskAttachments = silent
    ? []
    : structuredClone(Array.isArray(options.attachments) ? options.attachments : state.attachments)
  if (!silent) {
    addMessage('user', prompt, taskAttachments)
    session.messages.push({ role: 'user', content: prompt, attachments: taskAttachments })
    if (['新任务', 'New task'].includes(session.title)) session.title = prompt.length > 32 ? `${prompt.slice(0, 32)}…` : prompt
  }
  session.workspace = state.settings.workspace
  elements.currentTaskTitle.textContent = session.title
  if (!silent && !fromQueue) {
    elements.promptInput.value = ''
    resizePrompt()
  }
  const assistant = addMessage('assistant', '', [], { running: true })
  const taskId = crypto.randomUUID()
  const context = {
    taskId,
    sessionId: session.id,
    session,
    turn: assistant,
    startedAt: Date.now(),
    baseTokens: sessionTokenUsage(session),
    usageTokens: 0,
    activityOutput: null,
    activitySteps: new Map(),
    activityRoot: document.createElement('div'),
    lastDiagnostic: '',
    interceptedPreview: null,
    pendingApprovalResponse: null,
    pendingApprovalEvent: null,
    approvalQueue: [],
    approvalIds: new Set(),
    approvalHistory: [],
    activeApprovalEvent: null,
    awaitingApproval: false,
    backendExited: false,
    resumingApproval: false,
    deferredFinishEvent: null,
    usageOffset: 0,
    accumulatedFiles: [],
    finalCandidateMessageId: '',
    deleted: false,
  }
  state.runningTasks.set(taskId, context)
  renderTokenUsage(context.baseTokens, false)
  setInspector('activity')
  setRunning(true)
  renderSessions()
  addActivity(icon('play'), language() === 'en-US' ? 'Start DeepSeek Nova' : '启动 DeepSeek Nova', `${state.settings.model} · ${effortLabels()[state.settings.effort]} · ${basename(state.settings.workspace)}`, '', new Date(), context)
  elements.conversation.scrollTop = elements.conversation.scrollHeight

  try {
    const result = await window.studio.startTask({
      taskId,
      prompt,
      attachments: taskAttachments,
      workspace: state.settings.workspace,
      model: state.settings.model,
      effort: state.settings.effort,
      permissionMode: options.permissionMode || state.settings.permissionMode,
      claudeSessionId: session.claudeSessionId,
      resumeSession: Boolean(session.backendSessionStarted),
      history: session.backendSessionStarted ? [] : previousMessages,
    })
    if (result.taskId !== taskId) throw new Error('任务标识不一致')
    session.backendSessionStarted = true
    context.session = await window.studio.saveSession(session)
    if (state.currentSession?.id === context.sessionId) state.currentSession = context.session
    if (!state.sessions.some((item) => item.id === context.sessionId)) state.sessions.unshift(context.session)
    else state.sessions = state.sessions.map((item) => item.id === context.sessionId ? context.session : item)
    renderSessions()
    if (!silent && !fromQueue) {
      state.attachments = []
      renderAttachments()
    }
  } catch (error) {
    setAssistantText(assistant, `启动失败：${error.message}`)
    setTurnComplete(assistant, Date.now() - context.startedAt)
    state.runningTasks.delete(taskId)
    if (state.currentSession?.id === context.sessionId) setRunning(false)
    renderSessions()
  }
}

function handleTaskEvent(event) {
  const context = state.runningTasks.get(event.taskId)
  if (!context) return
  const isCurrent = state.currentSession?.id === context.sessionId

  if (event.type === 'started') {
    if (isCurrent) elements.currentTaskMeta.textContent = `运行中 · ${basename(event.workspace)}`
    setActiveApprovalEnabled(context, true)
    return
  }

  if (event.type === 'usage') {
    context.usageTokens = Math.max(context.usageTokens, (context.usageOffset || 0) + Math.floor(Number(event.tokens) || 0))
    if (isCurrent) renderTokenUsage(context.baseTokens + context.usageTokens)
    return
  }

  if (event.type === 'preview') {
    context.interceptedPreview = event
    updateStageSummary(context.turn, { kind: 'browser' })
    if (isCurrent) openHtmlPreview(event.path)
    return
  }

  if (event.type === 'text') {
    if (event.finalCandidate) presentFinalCandidate(context, event)
    else upsertStageReport(context.turn, event)
    if (!context.activityOutput) {
      context.activityOutput = addActivity(icon('message'), '正在组织回复', event.text.slice(-900), '', new Date(), context)
    } else {
      const output = context.activityOutput.querySelector('p')
      output.textContent = `${output.textContent}${event.text}`.slice(-1400)
      scheduleActivityPersistence(context)
      if (isCurrent) elements.activityTimeline.scrollTop = elements.activityTimeline.scrollHeight
    }
    if (isCurrent) elements.conversation.scrollTop = elements.conversation.scrollHeight
    return
  }

  if (event.type === 'progress') {
    demoteFinalCandidate(context)
    const savedStep = recordWorkStep(context.turn, event)
    const activityRow = upsertActivityProgress({ ...savedStep, ...event }, context)
    scheduleEditPreview(context, savedStep, activityRow)
    scheduleViewPreview(context, savedStep, activityRow)
    if (isCurrent) elements.conversation.scrollTop = elements.conversation.scrollHeight
    return
  }

  if (event.type === 'approval') {
    context.awaitingApproval = true
    updateStageSummary(context.turn, { kind: 'approval' })
    queueApprovalEvent(context, event)
    addActivity(icon('help'), event.kind === 'permission' ? '等待批准' : '等待选择', event.question, '', new Date(), context)
    if (isCurrent) {
      elements.livePill.innerHTML = '<i></i> 等待批准'
      elements.currentTaskMeta.textContent = '等待批准 · 任务已暂停'
    }
    return
  }

  if (event.type === 'diagnostic') {
    context.lastDiagnostic = `${context.lastDiagnostic}${event.text}`.slice(-4000)
    return
  }

  if (event.type === 'error') {
    addActivity(icon('warning'), '运行错误', event.message, 'error', new Date(), context)
    context.lastDiagnostic = event.message
    return
  }

  if (event.type === 'finished') finishTask(event, context)
}

function finalTaskAnswer(event = {}) {
  return String(event.finalResponseText || '').trim() || t('taskEnded')
}

async function reconcileFinishedEditPreviews(context, files = []) {
  const changedFiles = Array.isArray(files) ? files.filter((file) => file?.path) : []
  const editSteps = (context.turn?.workSteps || []).filter((step) => step.kind === 'edit')
  if (!changedFiles.length || !editSteps.length) return
  const jobs = []
  editSteps.forEach((step, index) => {
    const normalizedDetail = String(step.detail || '').replace(/\\/g, '/').toLowerCase()
    const file = changedFiles.find((candidate) => candidate.path === step.filePath)
      || changedFiles.find((candidate) => normalizedDetail && String(candidate.relativePath || candidate.name || '').replace(/\\/g, '/').toLowerCase().endsWith(normalizedDetail))
      || (changedFiles.length === 1 ? changedFiles[0] : changedFiles[Math.min(index, changedFiles.length - 1)])
    if (!file) return
    const genericLabel = !step.detail || /(?:文件|file)$/i.test(step.label || '')
    const saved = recordWorkStep(context.turn, {
      ...step,
      filePath: file.path,
      detail: file.relativePath || file.name,
      label: genericLabel ? `${Number(file.deletions) ? '编辑' : '创建'} ${file.relativePath || file.name}` : step.label,
      additions: Number(file.additions) || 0,
      deletions: Number(file.deletions) || 0,
      startLine: Number(file.startLine) || Number(step.startLine) || 1,
      endLine: Number(file.endLine) || Number(step.endLine) || 1,
      changes: Array.isArray(file.changes) && file.changes.length ? file.changes : step.changes,
      status: 'done',
    })
    const activityRow = upsertActivityProgress(saved, context)
    jobs.push(scheduleEditPreview(context, saved, activityRow, true))
  })
  await Promise.all(jobs)
}

async function finishTask(event, context) {
  if (!state.runningTasks.has(context.taskId)) return
  const isCurrent = state.currentSession?.id === context.sessionId
  context.usageTokens = Math.max(context.usageTokens, (context.usageOffset || 0) + Math.floor(Number(event.usageTokens) || 0))
  context.accumulatedFiles = mergeTaskFiles(context.accumulatedFiles, event.files)
  const hasUnansweredApproval = Boolean(context.activeApprovalEvent && !context.activeApprovalEvent.answered)
  const completedApprovedOperation = context.approvedOperationInFlight || null
  context.approvedOperationInFlight = null
  if (completedApprovedOperation && !event.awaitingApproval && !hasUnansweredApproval) {
    context.backendExited = true
    context.awaitingApproval = false
    context.deferredFinishEvent = event
    await reconcileFinishedEditPreviews(context, event.files)
    context.pendingApprovalResponse = {
      kind: 'continuation',
      permissionMode: state.settings.permissionMode,
      approvedOperation: null,
      prompt: '刚才单独批准的操作已经执行完毕。请基于该操作的实际结果继续原任务；后续如果还有需要权限的操作，仍按当前审批模式逐项处理。',
    }
    scheduleActivityPersistence(context)
    await resumeTaskAfterApproval(context, context.pendingApprovalResponse)
    return
  }
  const waitingForApproval = Boolean(event.awaitingApproval || context.awaitingApproval || context.pendingApprovalResponse || hasUnansweredApproval)
  if (waitingForApproval) {
    context.backendExited = true
    context.awaitingApproval = true
    context.deferredFinishEvent = event
    await reconcileFinishedEditPreviews(context, event.files)
    if (event.approvalStrategy === 'auto' && !context.pendingApprovalResponse && !hasUnansweredApproval) {
      const editOnly = event.permissionMode === 'acceptEdits'
      context.pendingApprovalResponse = {
        kind: 'permission',
        permissionMode: event.permissionMode || state.settings.permissionMode,
        prompt: editOnly
          ? '继续执行刚才按照“自动编辑”规则放行的文件修改，然后继续当前任务。其他需要额外权限的操作仍然必须询问我。'
          : '继续执行刚才按照“完全访问”规则放行的受阻操作，然后继续当前任务。',
      }
    }
    if (event.approvalStrategy !== 'auto' && Array.isArray(event.pendingApprovals) && event.pendingApprovals.length) {
      for (const denial of event.pendingApprovals) {
        const fallbackApproval = {
          taskId: context.taskId,
          type: 'approval',
          approvalId: `permission:${denial.tool_use_id || denial.tool_name || crypto.randomUUID()}`,
          kind: 'permission',
          denials: [denial],
          question: `DeepSeek Nova 需要权限才能继续执行 ${denial.tool_name || '操作'}`,
          options: [
            { label: '批准并继续', value: 'allow', description: '只批准当前这一项操作。' },
            { label: '暂不允许', value: 'deny', description: '只跳过当前这一项操作。' },
          ],
        }
        queueApprovalEvent(context, fallbackApproval)
      }
    }
    if (isCurrent && event.approvalStrategy !== 'auto') {
      renderTokenUsage(context.baseTokens + context.usageTokens)
      elements.livePill.innerHTML = '<i></i> 等待批准'
      elements.currentTaskMeta.textContent = '等待批准 · 任务已暂停'
      syncComposerAction()
    }
    scheduleActivityPersistence(context)
    if (context.pendingApprovalResponse) await resumeTaskAfterApproval(context, context.pendingApprovalResponse)
    return
  }
  const durationMs = Date.now() - (context.startedAt || Date.now())
  const allStageReports = (context.turn?.messageOrder || []).map((messageId) => ({ messageId, text: context.turn.messageTexts.get(messageId) || '' })).filter((report) => report.text.trim())
  const output = finalTaskAnswer(event)
  const stageReports = [...allStageReports]
  const finalReportIndex = stageReports.findLastIndex((report) => report.text.trim() === output)
  if (finalReportIndex >= 0) {
    const [finalReport] = stageReports.splice(finalReportIndex, 1)
    context.turn.reportRows.get(finalReport.messageId)?.remove()
  }
  setAssistantText(context.turn, output)
  if (isCurrent) renderTokenUsage(context.baseTokens + context.usageTokens)
  const finalFiles = context.accumulatedFiles
  await reconcileFinishedEditPreviews(context, finalFiles)
  setTurnComplete(context.turn, durationMs)
  if (finalFiles.length) {
    appendChangedFiles(context.turn.body, finalFiles, context.session.workspace)
    addActivity(icon('check'), `修改了 ${finalFiles.length} 个文件`, finalFiles.map((file) => file.relativePath).join('\n'), 'done', event.timestamp, context)
    if (isCurrent) scheduleWebPreview(finalFiles)
  }
  addActivity(
    icon(event.code === 0 ? 'check' : (event.signal ? 'stop' : 'warning')),
    event.signal ? '任务已停止' : (event.code === 0 ? '任务完成' : '进程已退出'),
    event.signal ? `信号：${event.signal}` : `退出代码：${event.code ?? '未知'}`,
    event.code === 0 ? 'done' : (event.signal ? '' : 'error'),
    event.timestamp,
    context,
  )
  if (isCurrent) {
    elements.livePill.innerHTML = event.code === 0 ? '<i></i> 已完成' : '<i></i> 待命'
    elements.currentTaskMeta.textContent = `${event.code === 0 ? '已完成' : '已停止'} · ${formatTime(event.timestamp)}`
  }
  context.session.messages.push({
    role: 'assistant',
    content: output,
    files: finalFiles,
    durationMs,
    usageTokens: context.usageTokens,
    workSteps: context.turn?.workSteps || [],
    stageReports,
    stageSummaries: context.turn?.stageSummaryData || [],
    progressOrder: context.turn?.progressOrder || [],
  })
  context.session.tokenUsage = context.baseTokens + context.usageTokens
  context.session.queuedMessages = structuredClone(queueForSession(context.sessionId))
  context.session.activityHtml = activityHtmlSnapshot(isCurrent ? elements.activityTimeline : context.activityRoot)
  const guidedQueuedMessage = context.guidedQueuedMessage || null
  state.runningTasks.delete(context.taskId)
  if (!context.deleted) {
    context.session = await window.studio.saveSession(context.session)
    state.sessions = state.sessions.map((item) => item.id === context.sessionId ? context.session : item)
    if (isCurrent) state.currentSession = context.session
  }
  if (isCurrent) setRunning(false)
  renderSessions()
  if (isCurrent) renderMessageQueue()
  if (isCurrent && !context.deleted) {
    await loadFiles()
    elements.promptInput.focus()
    const nextQueuedMessage = guidedQueuedMessage || takeNextQueuedMessage(context.sessionId)
    if (nextQueuedMessage) setTimeout(() => startQueuedMessage(nextQueuedMessage, context.sessionId), 0)
  }
}

function mergeTaskFiles(current = [], incoming = []) {
  const merged = new Map()
  for (const file of [...(current || []), ...(incoming || [])]) {
    if (!file?.path) continue
    const previous = merged.get(file.path)
    merged.set(file.path, previous ? {
      ...previous,
      ...file,
      additions: Math.max(Number(previous.additions) || 0, Number(file.additions) || 0),
      deletions: Math.max(Number(previous.deletions) || 0, Number(file.deletions) || 0),
    } : file)
  }
  return [...merged.values()]
}

const webPreviewExtensions = new Set([
  '.html', '.htm', '.css', '.js', '.mjs', '.jsx', '.ts', '.tsx',
  '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2', '.ttf',
])

function fileExtension(path = '') {
  const match = String(path).toLowerCase().match(/(\.[a-z0-9]+)$/)
  return match?.[1] || ''
}

function preferredHtmlFile(files = []) {
  return files
    .filter((file) => ['.html', '.htm'].includes(fileExtension(file.path)))
    .sort((first, second) => {
      const firstIndex = /^index\.html?$/i.test(first.name || '') ? 0 : 1
      const secondIndex = /^index\.html?$/i.test(second.name || '') ? 0 : 1
      return firstIndex - secondIndex || String(first.relativePath || '').split(/[\\/]/).length - String(second.relativePath || '').split(/[\\/]/).length
    })[0]
}

function showBrowserLoadStatus(message = '正在更新预览', tone = 'loading') {
  elements.browserLoadStatus.dataset.tone = tone
  elements.browserLoadStatus.querySelector('span:last-child').textContent = message
  elements.browserLoadStatus.hidden = false
  clearTimeout(showBrowserLoadStatus.timer)
  if (tone !== 'loading') showBrowserLoadStatus.timer = setTimeout(() => { elements.browserLoadStatus.hidden = true }, 1800)
}

function isPreviewUrl(url = '') {
  return Boolean(state.previewUrlPrefix && String(url).startsWith(state.previewUrlPrefix))
}

async function openHtmlPreview(path, { switchPanel = true } = {}) {
  if (!path) return
  try {
    showBrowserLoadStatus(state.previewPath ? '正在刷新本地预览' : '正在打开本地预览')
    const preview = await window.studio.createPreviewUrl({ path, workspace: state.settings.workspace })
    const parsed = new URL(preview.url)
    const changedEntry = state.previewPath !== preview.path
    state.previewPath = preview.path
    state.previewUrlPrefix = `${parsed.origin}/`
    state.previewAutoActive = true
    elements.browserPreviewBadge.hidden = false
    elements.browserUrl.value = `本地预览 · ${preview.relativePath}`
    if (changedEntry) addActivity(icon('globe'), '打开本地预览', preview.relativePath, 'done')
    if (switchPanel) setInspector('browser')
    await elements.browserView.loadURL(preview.url)
  } catch (error) {
    showBrowserLoadStatus(`预览失败：${error.message}`, 'error')
    addActivity(icon('warning'), '本地预览失败', error.message, 'error')
  }
}

function scheduleWebPreview(files = []) {
  const htmlFile = preferredHtmlFile(files)
  const changedWebAsset = files.some((file) => webPreviewExtensions.has(fileExtension(file.path)))
  if (!htmlFile && !(changedWebAsset && state.previewAutoActive && state.previewPath)) return
  clearTimeout(state.previewTimer)
  state.previewTimer = setTimeout(() => {
    openHtmlPreview(htmlFile?.path || state.previewPath, { switchPanel: Boolean(htmlFile) || state.activeInspector === 'browser' })
  }, 280)
}

function motionReduced() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches
}

function setSidebarCollapsed(side, collapsed) {
  const className = `${side}-collapsed`
  const isCollapsed = elements.appLayout.classList.contains(className)
  if (isCollapsed === collapsed) return
  elements.appLayout.classList.add('layout-animating')
  elements.appLayout.classList.toggle(className, collapsed)
  clearTimeout(setSidebarCollapsed.timer)
  setSidebarCollapsed.timer = setTimeout(() => elements.appLayout.classList.remove('layout-animating'), motionReduced() ? 20 : 340)
}

function setInspector(panel) {
  const previousPanel = state.activeInspector
  state.activeInspector = panel
  $$('.inspector-tab').forEach((button) => button.classList.toggle('active', button.dataset.panel === panel))
  $$('.inspector-panel').forEach((item) => item.classList.remove('active'))
  const nextPanel = $(`#${panel}Panel`)
  nextPanel.classList.add('active')
  setSidebarCollapsed('right', false)
  if (panel === 'files') {
    loadFiles()
    requestAnimationFrame(() => {
      const savedSplit = Number(localStorage.getItem('deepseek-nova:file-tree-height'))
      const browser = elements.filePanelResizer?.closest('.file-browser')
      if (savedSplit > 0 && browser?.clientHeight) setFilePanelSplit(browser, savedSplit, false)
    })
  }
  if (previousPanel !== panel && !motionReduced()) {
    const order = ['activity', 'files', 'browser']
    const direction = order.indexOf(panel) >= order.indexOf(previousPanel) ? 1 : -1
    nextPanel.animate([
      { opacity: 0, transform: `translateX(${direction * 12}px)` },
      { opacity: 1, transform: 'translateX(0)' },
    ], { duration: 210, easing: 'cubic-bezier(.2,.8,.2,1)' })
  }
}

function makeTreeNode(entry, depth = 0) {
  const wrapper = document.createElement('div')
  const row = document.createElement('div')
  row.className = `tree-row ${entry.type}`
  row.style.paddingLeft = `${7 + depth * 14}px`
  row.title = entry.path
  const size = entry.type === 'file' ? `<span class="tree-size">${formatSize(entry.size)}</span>` : ''
  row.innerHTML = `
    <span class="tree-chevron">${entry.type === 'directory' ? icon('chevron-down') : ''}</span>
    <span class="file-glyph">${icon(entry.type === 'directory' ? 'folder' : 'file')}</span>
    <span class="tree-name">${escapeText(entry.name)}</span>${size}
  `
  wrapper.append(row)
  if (entry.type === 'directory') {
    const children = document.createElement('div')
    children.className = 'tree-children'
    for (const child of entry.children || []) children.append(makeTreeNode(child, depth + 1))
    wrapper.append(children)
    row.addEventListener('click', () => {
      children.classList.toggle('collapsed')
      row.querySelector('.tree-chevron').innerHTML = icon(children.classList.contains('collapsed') ? 'chevron-right' : 'chevron-down')
    })
    row.addEventListener('dblclick', () => window.studio.openFile(entry.path))
  } else {
    row.addEventListener('click', () => previewFile(entry.path))
    row.addEventListener('dblclick', () => window.studio.openFile(entry.path))
  }
  return wrapper
}

async function loadFiles() {
  try {
    const result = await window.studio.listFiles(state.settings.workspace)
    elements.fileTree.replaceChildren()
    for (const entry of result.entries) elements.fileTree.append(makeTreeNode(entry))
    if (!result.entries.length) elements.fileTree.innerHTML = '<div class="empty-history">目录为空或无法读取。</div>'
  } catch (error) {
    elements.fileTree.innerHTML = `<div class="empty-history">${escapeText(error.message)}</div>`
  }
}

async function previewFile(path, openInspector = false) {
  try {
    if (openInspector) setInspector('files')
    state.selectedFile = path
    const preview = await window.studio.previewFile(path)
    const content = document.createElement('div')
    content.className = 'preview-content'
    const header = document.createElement('div')
    header.className = 'preview-header'
    const htmlPreviewButton = ['.html', '.htm'].includes(fileExtension(path))
      ? `<button class="icon-btn browser-open" title="在右侧浏览器预览">${icon('globe')}</button>`
      : ''
    header.innerHTML = `<span>${icon('file')}</span><strong>${escapeText(preview.name)}</strong>${htmlPreviewButton}<button class="icon-btn reveal" title="在文件夹中显示">${icon('folder-open')}</button><button class="icon-btn open" title="用本地应用打开">${icon('external')}</button>`
    header.querySelector('.browser-open')?.addEventListener('click', () => openHtmlPreview(path))
    header.querySelector('.reveal').addEventListener('click', () => window.studio.revealFile(path))
    header.querySelector('.open').addEventListener('click', () => window.studio.openFile(path))
    const body = document.createElement('div')
    body.className = 'preview-body'
    if (preview.type === 'text') {
      const pre = document.createElement('pre')
      pre.className = 'code-preview'
      pre.textContent = preview.content
      body.append(pre)
    } else if (preview.type === 'image') {
      const imageWrap = document.createElement('div')
      imageWrap.className = 'image-preview'
      const image = document.createElement('img')
      image.src = preview.dataUrl
      image.alt = preview.name
      imageWrap.append(image)
      body.append(imageWrap)
    } else if (preview.type === 'pdf') {
      const sourceUrl = preview.dataUrl || (await window.studio.createMediaUrl({ path, workspace: state.settings.workspace })).url
      const pdfWrap = document.createElement('div')
      pdfWrap.className = 'pdf-preview'
      const frame = document.createElement('iframe')
      frame.src = `${sourceUrl}#page=1&toolbar=0&navpanes=0`
      frame.title = preview.name
      pdfWrap.append(frame)
      body.append(pdfWrap)
    } else if (preview.type === 'video' || preview.type === 'audio') {
      const media = await window.studio.createMediaUrl({ path, workspace: state.settings.workspace })
      const mediaWrap = document.createElement('div')
      mediaWrap.className = `file-media-preview ${preview.type}`
      if (preview.type === 'video') {
        const video = document.createElement('video')
        video.src = media.url
        video.controls = true
        video.playsInline = true
        video.preload = 'metadata'
        mediaWrap.append(video)
      } else {
        mediaWrap.innerHTML = `${icon('music')}<strong>${escapeText(preview.name)}</strong>`
        const audio = document.createElement('audio')
        audio.src = media.url
        audio.controls = true
        audio.preload = 'metadata'
        mediaWrap.append(audio)
      }
      body.append(mediaWrap)
    } else {
      body.innerHTML = `<div class="unsupported-preview"><span>${icon('file')}</span><strong>${escapeText(preview.name)}</strong><p>${formatSize(preview.size)} · 暂不支持内嵌预览</p><p>请点击右上角按钮用本地应用打开。</p></div>`
    }
    content.append(header, body)
    elements.previewPane.replaceChildren(content)
    $$('.tree-row').forEach((row) => row.classList.toggle('selected', row.title === path))
  } catch (error) {
    showToast(`无法预览：${error.message}`)
  }
}

function renderSkills(filter = '') {
  const query = filter.trim().toLowerCase()
  const list = state.skills.filter((skill) => !query || `${skill.name} ${skill.description}`.toLowerCase().includes(query))
  elements.skillsList.replaceChildren()
  for (const skill of list) {
    const enabled = state.settings.skillsEnabled[skill.name] !== false
    const row = document.createElement('div')
    row.className = 'skill-row'
    row.innerHTML = `
      <span class="skill-icon">${icon('sparkles')}</span>
      <span class="skill-copy"><strong>${escapeText(skill.name)}</strong><small>${escapeText(skill.description)} · ${skill.source}</small></span>
      <button class="switch ${enabled ? 'on' : ''}" role="switch" aria-checked="${enabled}" title="${enabled ? '关闭' : '启用'}"></button>
    `
    row.querySelector('.switch').addEventListener('click', (event) => {
      const next = event.currentTarget.getAttribute('aria-checked') !== 'true'
      state.settings.skillsEnabled[skill.name] = next
      event.currentTarget.classList.toggle('on', next)
      event.currentTarget.setAttribute('aria-checked', String(next))
      updateSkillCount()
    })
    elements.skillsList.append(row)
  }
  if (!list.length) elements.skillsList.innerHTML = '<div class="empty-history">没有找到匹配的 Skill。</div>'
  updateSkillCount()
}

function updateSkillCount() {
  elements.skillsEnabledCount.textContent = state.skills.filter((skill) => state.settings.skillsEnabled[skill.name] !== false).length
}

function formatBalanceAmount(value, currency) {
  const amount = Number.parseFloat(value)
  if (!Number.isFinite(amount)) return `${value} ${currency}`.trim()
  try {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency', currency: currency === 'CNY' ? 'CNY' : 'USD',
      minimumFractionDigits: 2, maximumFractionDigits: 4,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`.trim()
  }
}

function renderAccountBalance(data = null) {
  elements.tokenQuotaList.replaceChildren()
  elements.tokenQuotaPanel.dataset.status = data ? (data.isAvailable ? 'available' : 'unavailable') : 'idle'
  elements.tokenQuotaStatus.textContent = data ? (data.isAvailable ? '账户额度可用' : '账户额度不足') : '尚未查询'
  elements.tokenQuotaCheckedAt.textContent = data
    ? `更新于 ${new Date(data.checkedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
    : '点击右侧按钮获取最新额度'

  for (const balance of data?.balances || []) {
    const item = document.createElement('div')
    item.className = 'token-balance-item'
    const total = document.createElement('div')
    const currency = document.createElement('small')
    currency.textContent = balance.currency || '余额'
    const amount = document.createElement('strong')
    amount.textContent = formatBalanceAmount(balance.totalBalance, balance.currency)
    total.append(currency, amount)
    const details = document.createElement('p')
    details.textContent = `充值 ${formatBalanceAmount(balance.toppedUpBalance, balance.currency)} · 赠金 ${formatBalanceAmount(balance.grantedBalance, balance.currency)}`
    item.append(total, details)
    elements.tokenQuotaList.append(item)
  }
  if (data && !data.balances?.length) {
    const empty = document.createElement('p')
    empty.className = 'quota-empty'
    empty.textContent = '官方接口未返回可显示的余额明细。'
    elements.tokenQuotaList.append(empty)
  }
}

async function refreshAccountBalance() {
  const candidateKey = elements.settingsApiKey.value.trim()
  elements.refreshTokenQuota.disabled = true
  elements.refreshTokenQuota.innerHTML = `${icon('refresh')}查询中…`
  elements.refreshTokenQuota.classList.add('loading')
  elements.tokenQuotaPanel.dataset.status = 'loading'
  elements.tokenQuotaStatus.textContent = '正在连接 DeepSeek…'
  elements.tokenQuotaCheckedAt.textContent = '正在获取最新账户额度'
  try {
    state.accountBalance = await window.studio.getAccountBalance(candidateKey)
    renderAccountBalance(state.accountBalance)
  } catch (error) {
    state.accountBalance = null
    elements.tokenQuotaPanel.dataset.status = 'error'
    elements.tokenQuotaStatus.textContent = '额度查询失败'
    elements.tokenQuotaCheckedAt.textContent = error.message
    elements.tokenQuotaList.replaceChildren()
  } finally {
    elements.refreshTokenQuota.disabled = false
    elements.refreshTokenQuota.innerHTML = `${icon('refresh')}重新查询`
    elements.refreshTokenQuota.classList.remove('loading')
  }
}

function settingsMotionGeometry(source) {
  const modal = $('.settings-modal')
  const modalRect = modal.getBoundingClientRect()
  const sourceRect = source?.isConnected ? source.getBoundingClientRect() : null
  if (!sourceRect) return { x: 0, y: 16, scaleX: .94, scaleY: .94 }
  return {
    x: sourceRect.left + sourceRect.width / 2 - (modalRect.left + modalRect.width / 2),
    y: sourceRect.top + sourceRect.height / 2 - (modalRect.top + modalRect.height / 2),
    scaleX: Math.max(.06, Math.min(.28, sourceRect.width / modalRect.width)),
    scaleY: Math.max(.04, Math.min(.18, sourceRect.height / modalRect.height)),
  }
}

function playSettingsMotion(opening, source) {
  if (motionReduced()) return Promise.resolve()
  const modal = $('.settings-modal')
  const geometry = settingsMotionGeometry(source)
  const compact = `translate(${geometry.x}px, ${geometry.y}px) scale(${geometry.scaleX}, ${geometry.scaleY})`
  const expanded = 'translate(0, 0) scale(1, 1)'
  modal.getAnimations().forEach((animation) => animation.cancel())
  elements.settingsModal.getAnimations().forEach((animation) => animation.cancel())
  const panelAnimation = modal.animate(opening ? [
    { opacity: .15, transform: compact, borderRadius: '18px' },
    { opacity: 1, transform: expanded, borderRadius: '15px' },
  ] : [
    { opacity: 1, transform: expanded, borderRadius: '15px' },
    { opacity: 0, transform: compact, borderRadius: '18px' },
  ], {
    duration: opening ? 330 : 230,
    easing: opening ? 'cubic-bezier(.16,1,.3,1)' : 'cubic-bezier(.4,0,1,1)',
    fill: 'both',
  })
  const backdropAnimation = elements.settingsModal.animate(opening
    ? [{ opacity: 0, backdropFilter: 'blur(0)' }, { opacity: 1, backdropFilter: 'blur(5px)' }]
    : [{ opacity: 1, backdropFilter: 'blur(5px)' }, { opacity: 0, backdropFilter: 'blur(0)' }], {
    duration: opening ? 220 : 180,
    easing: 'ease',
    fill: 'both',
  })
  return Promise.allSettled([panelAnimation.finished, backdropAnimation.finished])
}

function openSettings(panel = 'general', source = null) {
  if (!elements.settingsModal.hidden) {
    if (source) state.settingsSource = source
    switchSettingsPanel(panel)
    return
  }
  state.settingsBeforeEdit = structuredClone(state.settings)
  state.settingsSource = source
  state.settingsClosing = false
  elements.settingsApiKey.value = ''
  elements.settingsApiKey.placeholder = state.settings.apiKeyConfigured
    ? (language() === 'en-US' ? 'Configured · Leave blank to keep it' : '已配置 · 留空保持不变')
    : 'sk-…'
  elements.settingsWorkspace.value = state.settings.workspace
  elements.settingsPermission.value = state.settings.permissionMode
  elements.settingsModel.value = state.settings.model
  elements.settingsFlashModel.value = state.settings.flashModel
  elements.settingsDensity.value = state.settings.density
  elements.settingsLanguage.value = language()
  elements.settingsSaveStatus.textContent = ''
  renderAccountBalance(state.accountBalance)
  syncSettingsChoices()
  switchSettingsPanel(panel)
  elements.settingsModal.hidden = false
  requestAnimationFrame(() => playSettingsMotion(true, state.settingsSource))
}

async function closeSettings(revert = false) {
  if (elements.settingsModal.hidden || state.settingsClosing) return
  state.settingsClosing = true
  if (revert && state.settingsBeforeEdit) {
    state.settings = state.settingsBeforeEdit
    applyTheme(state.settings.theme)
    applyLanguage(state.settings.language)
  }
  await playSettingsMotion(false, state.settingsSource)
  elements.settingsModal.hidden = true
  state.settingsBeforeEdit = null
  state.settingsSource = null
  state.settingsClosing = false
}

function switchSettingsPanel(panel) {
  const previous = $('.settings-pane.active')
  const next = $(`.settings-pane[data-pane="${panel}"]`)
  if (!next) return
  $$('.settings-nav-item').forEach((button) => button.classList.toggle('active', button.dataset.settings === panel))
  $$('.settings-pane').forEach((pane) => pane.classList.toggle('active', pane.dataset.pane === panel))
  elements.settingsPanelTitle.textContent = settingsMeta()[panel][0]
  elements.settingsPanelSubtitle.textContent = settingsMeta()[panel][1]
  if (panel === 'skills') renderSkills(elements.skillsSearch.value)
  if (previous && previous !== next && !motionReduced()) {
    const order = ['general', 'model', 'skills', 'appearance']
    const previousName = previous.dataset.pane
    const direction = order.indexOf(panel) >= order.indexOf(previousName) ? 1 : -1
    next.animate([
      { opacity: 0, transform: `translateX(${direction * 10}px)` },
      { opacity: 1, transform: 'translateX(0)' },
    ], { duration: 190, easing: 'cubic-bezier(.2,.8,.2,1)' })
    $('.settings-content > header')?.animate([
      { opacity: .55, transform: `translateY(${direction * 3}px)` },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 170, easing: 'ease-out' })
  }
}

function syncSettingsChoices() {
  $$('#settingsEffort button').forEach((button) => button.classList.toggle('active', button.dataset.effort === state.settings.effort))
  $$('#themeOptions button').forEach((button) => button.classList.toggle('active', button.dataset.theme === state.settings.theme))
}

async function saveSettings() {
  const previousPermissionMode = state.settings.permissionMode
  state.settings.workspace = elements.settingsWorkspace.value
  state.settings.permissionMode = elements.settingsPermission.value
  state.settings.model = elements.settingsModel.value.trim() || 'deepseek-v4-pro[1m]'
  state.settings.flashModel = elements.settingsFlashModel.value.trim() || 'deepseek-v4-flash'
  state.settings.density = elements.settingsDensity.value
  state.settings.language = elements.settingsLanguage.value
  const apiKey = elements.settingsApiKey.value.trim()
  try {
    state.settings = await window.studio.saveSettings({
      ...state.settings,
      ...(apiKey ? { apiKey } : {}),
    })
    applyTheme(state.settings.theme)
    applyLanguage(state.settings.language)
    syncWorkspaceUI()
    syncModelUI()
    const runningContext = runningContextForSession()
    if (runningContext && state.settings.permissionMode !== previousPermissionMode) {
      await window.studio.updateTaskPermission(runningContext.taskId, state.settings.permissionMode)
    }
    if (runningContext && state.settings.permissionMode === 'bypassPermissions') {
      await continuePendingPermissionsWithFullAccess(runningContext)
    }
    await loadFiles()
    elements.settingsSaveStatus.textContent = t('savedLocal')
    setTimeout(() => closeSettings(false), 450)
  } catch (error) {
    elements.settingsSaveStatus.textContent = error.message
  }
}

function initializeResizer(handle, side) {
  handle.addEventListener('pointerdown', (event) => {
    event.preventDefault()
    handle.setPointerCapture(event.pointerId)
    handle.classList.add('dragging')
    const startX = event.clientX
    const property = side === 'left' ? '--left-width' : '--right-width'
    const initial = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(property))
    const move = (moveEvent) => {
      const delta = moveEvent.clientX - startX
      const next = side === 'left' ? initial + delta : initial - delta
      const clamped = Math.max(side === 'left' ? 210 : 300, Math.min(side === 'left' ? 380 : 620, next))
      document.documentElement.style.setProperty(property, `${clamped}px`)
    }
    const up = () => {
      handle.classList.remove('dragging')
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', up)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', up)
  })
}

function setFilePanelSplit(browser, pixels, persist = true) {
  const available = Math.max(0, browser.clientHeight - 7)
  const clamped = Math.max(90, Math.min(Math.max(90, available - 120), Number(pixels) || available * .42))
  browser.style.setProperty('--file-tree-height', `${clamped}px`)
  elements.filePanelResizer.setAttribute('aria-valuemin', '90')
  elements.filePanelResizer.setAttribute('aria-valuemax', String(Math.max(90, available - 120)))
  elements.filePanelResizer.setAttribute('aria-valuenow', String(Math.round(clamped)))
  if (persist) localStorage.setItem('deepseek-nova:file-tree-height', String(Math.round(clamped)))
}

function initializeFilePanelResizer() {
  const handle = elements.filePanelResizer
  const browser = handle?.closest('.file-browser')
  if (!handle || !browser) return
  const saved = Number(localStorage.getItem('deepseek-nova:file-tree-height'))
  if (saved > 0) requestAnimationFrame(() => setFilePanelSplit(browser, saved, false))
  handle.addEventListener('pointerdown', (event) => {
    event.preventDefault()
    handle.setPointerCapture(event.pointerId)
    handle.classList.add('dragging')
    const startY = event.clientY
    const initial = elements.fileTree.getBoundingClientRect().height
    const move = (moveEvent) => setFilePanelSplit(browser, initial + moveEvent.clientY - startY, false)
    const up = () => {
      handle.classList.remove('dragging')
      setFilePanelSplit(browser, elements.fileTree.getBoundingClientRect().height, true)
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', up)
      handle.removeEventListener('pointercancel', up)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', up)
    handle.addEventListener('pointercancel', up)
  })
  handle.addEventListener('keydown', (event) => {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const delta = event.key === 'ArrowUp' ? -16 : 16
    setFilePanelSplit(browser, elements.fileTree.getBoundingClientRect().height + delta, true)
  })
}

function normalizeBrowserUrl(value) {
  const trimmed = value.trim()
  if (!trimmed) return 'https://www.bing.com'
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.includes('.') && !trimmed.includes(' ')) return `https://${trimmed}`
  return `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`
}

function wireEvents() {
  document.addEventListener('contextmenu', showTextContextMenu)
  document.addEventListener('mousedown', (event) => {
    if (event.target.closest('.text-context-menu')) return
    hideTextContextMenu()
  })
  window.addEventListener('blur', hideTextContextMenu)
  elements.newTaskButton.addEventListener('click', newSession)
  elements.sessionSearch.addEventListener('input', renderSessions)
  $$('.history-tab').forEach((button) => button.addEventListener('click', () => {
    state.historyView = button.dataset.view
    $$('.history-tab').forEach((item) => item.classList.toggle('active', item === button))
    renderSessions()
  }))
  elements.composer.addEventListener('submit', (event) => { event.preventDefault(); submitTask() })
  elements.messageQueue.addEventListener('click', (event) => {
    const button = event.target.closest('[data-queue-action]')
    const row = button?.closest('.queue-item')
    if (!button || !row) return
    if (button.dataset.queueAction === 'delete') deleteQueuedMessage(row.dataset.queueId)
    if (button.dataset.queueAction === 'edit') editQueuedMessage(row.dataset.queueId)
    if (button.dataset.queueAction === 'guide') guideQueuedMessage(row.dataset.queueId)
  })
  elements.promptInput.addEventListener('input', resizePrompt)
  elements.promptInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submitTask() }
  })
  elements.attachButton.addEventListener('click', chooseAttachments)
  elements.modeButton.addEventListener('click', (event) => {
    event.stopPropagation()
    togglePermissionMenu()
  })
  elements.permissionMenu.querySelectorAll('[data-permission-mode]').forEach((button) => button.addEventListener('click', () => choosePermissionMode(button.dataset.permissionMode)))
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.permission-picker')) togglePermissionMenu(false)
  })
  elements.workspaceCard.addEventListener('click', (event) => openSettings('general', event.currentTarget))
  elements.composerWorkspace.addEventListener('click', (event) => openSettings('general', event.currentTarget))
  $('#openSettings').addEventListener('click', (event) => openSettings('general', event.currentTarget))
  $('#quickModelButton').addEventListener('click', (event) => openSettings('model', event.currentTarget))
  elements.refreshTokenQuota.addEventListener('click', refreshAccountBalance)
  elements.cancelDelete.addEventListener('click', closeDeleteConfirm)
  elements.confirmDelete.addEventListener('click', confirmSessionDeletion)
  elements.deleteConfirm.addEventListener('click', (event) => {
    if (event.target === elements.deleteConfirm) closeDeleteConfirm()
  })

  $('#collapseLeft').addEventListener('click', () => setSidebarCollapsed('left', true))
  $('#expandLeft').addEventListener('click', () => setSidebarCollapsed('left', false))
  $('#collapseRight').addEventListener('click', () => setSidebarCollapsed('right', true))
  $('#expandRight').addEventListener('click', () => setSidebarCollapsed('right', false))
  initializeResizer($('#leftResizer'), 'left')
  initializeResizer($('#rightResizer'), 'right')
  initializeFilePanelResizer()

  $$('.inspector-tab').forEach((button) => button.addEventListener('click', () => setInspector(button.dataset.panel)))
  $('#refreshFiles').addEventListener('click', loadFiles)
  $('#revealWorkspace').addEventListener('click', () => window.studio.openFile(state.settings.workspace))

  $$('.starter-card').forEach((button) => button.addEventListener('click', () => {
    elements.promptInput.value = button.dataset.prompt
    resizePrompt()
    elements.promptInput.focus()
  }))

  $$('.settings-nav-item').forEach((button) => button.addEventListener('click', () => switchSettingsPanel(button.dataset.settings)))
  $('#closeSettings').addEventListener('click', () => closeSettings(true))
  $('#cancelSettings').addEventListener('click', () => closeSettings(true))
  $('#saveSettings').addEventListener('click', saveSettings)
  elements.settingsModal.addEventListener('click', (event) => { if (event.target === elements.settingsModal) closeSettings(true) })
  $('#toggleSettingsKey').addEventListener('click', (event) => {
    const hidden = elements.settingsApiKey.type === 'password'
    elements.settingsApiKey.type = hidden ? 'text' : 'password'
    event.currentTarget.textContent = language() === 'en-US' ? (hidden ? 'Hide' : 'Show') : (hidden ? '隐藏' : '显示')
  })
  $('#chooseWorkspace').addEventListener('click', async () => {
    const workspace = await window.studio.chooseWorkspace()
    if (workspace) elements.settingsWorkspace.value = workspace
  })
  $$('#settingsEffort button').forEach((button) => button.addEventListener('click', () => {
    state.settings.effort = button.dataset.effort
    syncSettingsChoices()
  }))
  $$('#themeOptions button').forEach((button) => button.addEventListener('click', () => {
    state.settings.theme = button.dataset.theme
    applyTheme(state.settings.theme)
    syncSettingsChoices()
  }))
  elements.skillsSearch.addEventListener('input', () => renderSkills(elements.skillsSearch.value))
  elements.settingsLanguage.addEventListener('change', () => {
    state.settings.language = elements.settingsLanguage.value
    applyLanguage(state.settings.language)
    switchSettingsPanel('general')
  })

  elements.browserUrl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const url = normalizeBrowserUrl(elements.browserUrl.value)
      state.previewAutoActive = false
      elements.browserPreviewBadge.hidden = true
      elements.browserLoadStatus.hidden = true
      elements.browserView.loadURL(url)
      elements.browserUrl.blur()
    }
  })
  $('#browserBack').addEventListener('click', () => elements.browserView.canGoBack() && elements.browserView.goBack())
  $('#browserForward').addEventListener('click', () => elements.browserView.canGoForward() && elements.browserView.goForward())
  $('#browserReload').addEventListener('click', () => {
    if (state.previewAutoActive && state.previewPath) openHtmlPreview(state.previewPath, { switchPanel: false })
    else elements.browserView.reload()
  })
  $('#browserExternal').addEventListener('click', () => window.studio.openExternal(elements.browserView.getURL()))
  const syncBrowserAddress = (event) => {
    if (state.previewAutoActive && isPreviewUrl(event.url)) {
      elements.browserPreviewBadge.hidden = false
      elements.browserUrl.value = `本地预览 · ${state.previewPath.split(/[\\/]/).pop()}`
    } else {
      state.previewAutoActive = false
      elements.browserPreviewBadge.hidden = true
      elements.browserUrl.value = event.url
    }
  }
  elements.browserView.addEventListener('did-navigate', syncBrowserAddress)
  elements.browserView.addEventListener('did-navigate-in-page', syncBrowserAddress)
  elements.browserView.addEventListener('did-stop-loading', () => {
    if (!state.previewAutoActive) return
    showBrowserLoadStatus('预览已更新', 'done')
  })
  elements.browserView.addEventListener('did-fail-load', (event) => {
    if (event.errorCode === -3) return
    showBrowserLoadStatus(`加载失败：${event.errorDescription || '未知错误'}`, 'error')
  })

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault(); newSession()
    }
    if ((event.ctrlKey || event.metaKey) && event.key === ',') {
      event.preventDefault(); openSettings('general')
    }
    if (event.key === 'Escape') {
      if (textSelection.contextMenu) {
        hideTextContextMenu()
        return
      }
      if (closeMediaViewer()) return
      if (!elements.permissionMenu.hidden) togglePermissionMenu(false)
      else if (!elements.deleteConfirm.hidden) closeDeleteConfirm()
      else if (!elements.settingsModal.hidden) closeSettings(true)
      else {
        const runningContext = runningContextForSession()
        if (runningContext) window.studio.stopTask(runningContext.taskId)
      }
    }
  })
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.settings.theme === 'system') applyTheme('system')
  })
}

async function initialize() {
  try {
    hydrateIcons()
    const initial = await window.studio.getInitialState()
    state.studioVariant = initial.studioVariant === 'custom' ? 'custom' : 'standard'
    state.settings = initial.settings
    state.sessions = initial.sessions
    state.skills = initial.skills
    $('#settingsVersion').textContent = `DeepSeek Nova ${initial.packageVersion}`
    applyTheme(state.settings.theme)
    applyLanguage(state.settings.language)
    syncWorkspaceUI()
    syncModelUI()
    wireEvents()
    window.studio.onTaskEvent(handleTaskEvent)
    renderSessions()
    renderSkills()
    newSession()
    await loadFiles()
  } catch (error) {
    document.body.innerHTML = `<div class="empty-inspector"><strong>桌面应用初始化失败</strong><p>${escapeText(error.message)}</p></div>`
  }
}

initialize()
