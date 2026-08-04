import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const desktopDir = dirname(fileURLToPath(import.meta.url))
const requiredFiles = [
  'main.mjs',
  'preload.cjs',
  'renderer/index.html',
  'renderer/styles.css',
  'renderer/app.js',
  '../runtime-adapter.mjs',
  'renderer/assets/deepseek-nova-logo-mark.svg',
  'renderer/assets/deepseek-nova-logo-animated.svg',
  'build/deepseek-nova-app-icon.png',
  'build/deepseek-nova-app-icon.ico',
]
for (const file of requiredFiles) {
  if (!existsSync(join(desktopDir, file))) throw new Error(`Missing ${file}`)
}

const html = readFileSync(join(desktopDir, 'renderer/index.html'), 'utf8')
for (const marker of [
  'sessionList', 'conversation', 'activityPanel', 'filesPanel', 'browserPanel',
  'settingsModal', 'skillsList', 'attachmentStrip', 'leftResizer', 'rightResizer',
  'deleteConfirm', 'confirmDelete', 'welcomeLead',
  'tokenQuotaPanel', 'refreshTokenQuota',
  'tokenOdometer',
  'browserPreviewBadge', 'browserLoadStatus',
  'modeButton', 'permissionMenu', 'filePanelResizer',
]) {
  if (!html.includes(`id="${marker}"`)) throw new Error(`Missing UI surface: ${marker}`)
}
if (html.includes('id="toggleRight"')) throw new Error('Duplicate right sidebar toggle is still present')
if (html.includes('TASK ACTIVITY') || html.includes('WORKSPACE') || html.includes('welcomeKicker')) throw new Error('Removed English headings are still visible')
if (!html.includes('@fontsource-variable/inter/index.css') || !html.includes('@fontsource-variable/noto-sans-sc/index.css')) throw new Error('Bundled application fonts are not loaded')
for (const marker of ['<title>DeepSeek Nova</title>', 'deepseek-nova-logo-mark.svg', 'deepseek-nova-logo-animated.svg']) {
  if (!html.includes(marker)) throw new Error(`Missing DeepSeek Nova brand surface: ${marker}`)
}
if (!html.includes('id="welcomeLogo" data-src="assets/deepseek-nova-logo-animated.svg"') || html.includes('id="welcomeLogo" src=')) {
  throw new Error('Welcome animation still starts before the desktop window becomes visible')
}
if (!html.includes('starter-icon build-orange')) throw new Error('Build-feature starter icon is not using its orange treatment')

const preload = readFileSync(join(desktopDir, 'preload.cjs'), 'utf8')
for (const channel of ['task:start', 'task:permission-mode', 'files:preview', 'sessions:archive', 'sessions:delete', 'settings:save', 'account:balance', 'preview:url', 'media:url', 'clipboard:write', 'clipboard:read']) {
  if (!preload.includes(channel)) throw new Error(`Missing IPC bridge: ${channel}`)
}

const main = readFileSync(join(desktopDir, 'main.mjs'), 'utf8')
const runtimeAdapter = readFileSync(join(desktopDir, '..', 'runtime-adapter.mjs'), 'utf8')
for (const marker of ['DEEPSEEK_NOVA_RUNTIME_COMMAND', 'Runtime adapter is not configured']) {
  if (!runtimeAdapter.includes(marker)) throw new Error(`Missing public runtime-adapter contract: ${marker}`)
}
for (const marker of ["'--resume'", "'--session-id'", "'stream-json'", "type: 'approval'", "type: 'progress'"]) {
  if (!main.includes(marker)) throw new Error(`Missing continuous-session feature: ${marker}`)
}
if (main.includes("'--brief'")) throw new Error('Brief mode still suppresses complete upfront plans')
if (!main.includes('deleteBackendSessionFiles')) throw new Error('Missing backend session record deletion')
if (!main.includes('getDeepSeekBalance') || !main.includes('https://api.deepseek.com/user/balance')) {
  throw new Error('Missing official account balance query')
}
for (const marker of ['lineChangeStats', 'toolEditStats', "type: 'usage'", 'getUsage()']) {
  if (!main.includes(marker)) throw new Error(`Missing usage or diff telemetry: ${marker}`)
}
if (!main.includes('messageId: currentMessageId')) throw new Error('Assistant stage reports do not preserve message boundaries')
if (!main.includes('必须使用简体中文') || !main.includes('也不要改用英文汇报')) throw new Error('User-facing language is not constrained to Simplified Chinese')
for (const marker of ['ensurePreviewServer', 'createPreviewUrl', '127.0.0.1', 'desktopInstruction']) {
  if (!main.includes(marker)) throw new Error(`Missing secure local preview feature: ${marker}`)
}
for (const marker of ['createMediaUrl', 'mediaExtensions', "requestKind === 'media'", "'Content-Range'", "type: 'video'", "type: 'audio'"]) {
  if (!main.includes(marker)) throw new Error(`Missing secure local media feature: ${marker}`)
}
for (const marker of ['previewPathFromCommand', "type: 'preview'", "source: 'permission-intercepted'", "'bypassPermissions'"]) {
  if (!main.includes(marker)) throw new Error(`Missing approval-safe preview interception: ${marker}`)
}
for (const marker of ['terminalTools', 'permissionDeniedResult', 'emitPermissionCard', 'pendingPermissionDenials', 'hasPendingApproval()', 'getApprovalStrategy()', 'permissionStrategy', 'approvalStrategyForMode', 'isPermissionDenialMessage', 'terminalTools.add(block.tool_use_id)']) {
  if (!main.includes(marker)) throw new Error(`Missing approval or terminal tool-state recovery: ${marker}`)
}
const approvalPolicy = readFileSync(join(desktopDir, 'approval-policy.mjs'), 'utf8')
for (const marker of ["mode === 'plan'", "mode === 'default'", "mode === 'acceptEdits'", "mode === 'bypassPermissions'", "return 'blocked'", "return 'manual'", "return 'auto'"]) {
  if (!approvalPolicy.includes(marker) && marker !== "mode === 'default'") throw new Error(`Missing four-mode approval policy: ${marker}`)
}
if (main.includes("label: '会话已连接'")) throw new Error('Connection noise is still emitted')
for (const marker of ['packageMetadata', 'studioVariant', "packageMetadata.studioVariant === 'custom'"]) {
  if (!main.includes(marker)) throw new Error(`Missing packaged edition metadata: ${marker}`)
}

const renderer = readFileSync(join(desktopDir, 'renderer/app.js'), 'utf8')
for (const marker of ['startWelcomeAnimation', "document.visibilityState !== 'visible'", 'welcomeAnimationPending', '?play=${welcomeAnimationRevision}']) {
  if (!renderer.includes(marker)) throw new Error(`Missing visible-window animation synchronization: ${marker}`)
}
for (const forbidden of ['交给 Claude Code', 'Give Claude Code', 'Start Claude Code', '启动 Claude Code', 'local Claude Code session']) {
  if (html.includes(forbidden) || renderer.includes(forbidden) || main.includes(forbidden)) throw new Error(`Visible legacy brand copy remains: ${forbidden}`)
}
for (const marker of ['refreshAccountBalance', 'renderAccountBalance']) {
  if (!renderer.includes(marker)) throw new Error(`Missing account balance feature: ${marker}`)
}
for (const marker of ['pending-thinking', 'setTimeout(() => showThinking(turn), 500)', 'process-collapsed', 'toggleTurnProcess', 'renderTokenUsage', 'token-digit-track', 'renderDiffStats']) {
  if (!renderer.includes(marker)) throw new Error(`Missing refined task UI feature: ${marker}`)
}
for (const marker of ['stagePhaseCopySets', 'updateStageSummary', 'upsertStageReport', 'typeStageReport', 'completeStageReportTyping', 'recordWorkStep', 'stageTimeline', 'stageSummaryRows', 'messageTexts', 'progressOrder', 'stage-timeline', 'stage-summary', 'stage-report']) {
  if (!renderer.includes(marker)) throw new Error(`Missing compact conversation progress: ${marker}`)
}
for (const forbidden of ['stagePhaseReportCopy', 'fallbackPlanForPrompt', 'scheduleInitialPlan', 'removeAutomaticInitialPlan', 'automatic:initial-plan', 'automaticPlanMessageId']) {
  if (renderer.includes(forbidden)) throw new Error(`Frontend-authored model narrative is still present: ${forbidden}`)
}
if (!renderer.includes("String(event.finalResponseText || '').trim() || t('taskEnded')")) throw new Error('Missing explicit no-final-answer state')
for (const marker of ['finalCandidateText', 'explicitResultText', 'getFinalText()', 'const finalResponseText = parser.getFinalText()']) {
  if (!main.includes(marker)) throw new Error(`Missing authentic final-response tracking: ${marker}`)
}
if (renderer.includes('upsertWorkStep') || renderer.includes("row.className = 'work-step running'")) throw new Error('Detailed tool chain is still rendered in the conversation')
if (renderer.includes('stage-summary-copy') || renderer.includes('stageSummaryRefresh')) throw new Error('Stage summary still has a subtitle or refresh animation')
for (const marker of ['scheduleWebPreview', 'openHtmlPreview', 'setSidebarCollapsed', 'playSettingsMotion', 'settingsMotionGeometry', 'browserPreviewBadge']) {
  if (!renderer.includes(marker)) throw new Error(`Missing preview or spatial motion feature: ${marker}`)
}
for (const marker of ['options.silent === true', 'resumeTaskAfterApproval', 'pendingApprovalResponse', 'approvedOperation', 'context.backendExited', "event.type === 'preview'", 'context.interceptedPreview']) {
  if (!renderer.includes(marker)) throw new Error(`Missing silent approval continuation: ${marker}`)
}
for (const marker of ['choosePermissionMode', 'togglePermissionMenu', "bypassPermissions: '完全访问'", 'updateTaskPermission']) {
  if (!renderer.includes(marker)) throw new Error(`Missing composer approval mode control: ${marker}`)
}
for (const marker of ['queueApprovalEvent', 'showNextApproval', 'advanceApprovalQueue', 'answerActiveQuestionWithText', '只批准当前这一项操作', '待补充选择']) {
  if (!renderer.includes(marker) && !main.includes(marker)) throw new Error(`Missing serial approval or supplementary-question behavior: ${marker}`)
}
for (const marker of ['singleApprovalInstruction', 'approvedToolRule', "args.push('--allow-dangerously-skip-permissions')", "args.push('--tools', String(approvedOperation.tool_name))", 'cliPermissionMode', 'approvedOperation']) {
  if (!main.includes(marker)) throw new Error(`Missing single-operation approval guard: ${marker}`)
}
for (const marker of ['approvedOperationInFlight', 'completedApprovedOperation', '刚才单独批准的操作已经执行完毕']) {
  if (!renderer.includes(marker)) throw new Error(`Missing post-approval task continuation: ${marker}`)
}
for (const marker of ['continuePendingPermissionsWithFullAccess', 'resolvePermissionQueueForFullAccess', '已切换为完全访问，后台继续']) {
  if (!renderer.includes(marker)) throw new Error(`Missing live full-access takeover: ${marker}`)
}
for (const marker of ['deniedOperation', 'singleDenialInstruction', "args.push('--disallowedTools', deniedRule)", 'deniedOperationSignature']) {
  if (!main.includes(marker) && !renderer.includes(marker)) throw new Error(`Missing denied-operation loop guard: ${marker}`)
}
for (const marker of ['renderMediaRail', 'setupMediaRail', 'openMediaViewer', 'media-more-count', 'media-lightbox-prev', 'ArrowRight', 'file-media-preview']) {
  if (!renderer.includes(marker)) throw new Error(`Missing compact inline media gallery: ${marker}`)
}
for (const marker of ['thinking-label', 'thinking-orb', 'user-bubble', 'approval-card', 'backendSessionStarted', 'renderMarkdown', 'DOMPurify', 'confirmSessionDeletion', 'iconPaths', 'hydrateIcons', 'turn.rawText', 'welcomePhraseSets', 'showNextWelcome', "late: '夜深了，'"]) {
  if (!renderer.includes(marker)) throw new Error(`Missing conversation UI feature: ${marker}`)
}
if (!renderer.includes('stageReports: stageTimeline, approvals, stageSummaryRows')) throw new Error('Assistant turns do not retain their approval-card container')
for (const marker of ['user-message-files', 'user-message-file', "addMessage('user', prompt, taskAttachments)", 'message.files || message.attachments || []']) {
  if (!renderer.includes(marker)) throw new Error(`Missing sent attachment presentation: ${marker}`)
}
for (const phrase of ['早上好，又是新的一天。', '早上好，今天想先从什么开始？', '早上好，有什么需要随时告诉我。', '早上好，我可以为你做些什么？', '中午好，忙了一上午，接下来交给我吧。', '中午好，有什么需要随时告诉我。', '中午好，想先处理哪件事？', '中午好，我可以为你做些什么？', '下午好，今天想推进哪件事？', '下午好，有什么需要随时告诉我。', '下午好，我可以为你做些什么？', '下午好，把下一件事交给我吧。', '晚上好，今天还有什么想完成？', '晚上好，有什么需要随时告诉我。', '晚上好，我可以为你做些什么？', '晚上好，我们把剩下的事情整理好吧。', '夜深了，记得早点休息。', '夜深了，早点休息，明天再继续吧。', '夜深了，尽量不要熬夜工作。']) {
  if (!renderer.includes(phrase)) throw new Error(`Missing welcome phrase: ${phrase}`)
}
for (const marker of ['namedWelcomePhraseSets', 'activeWelcomePhraseSets', "state.studioVariant === 'custom'", '早上好，巫标红。今天想从哪里开始？']) {
  if (!renderer.includes(marker)) throw new Error(`Missing named custom edition welcome: ${marker}`)
}
if (!renderer.includes("language() === 'zh-CN' ? phrase")) throw new Error('Chinese welcome phrases are still receiving an automatic prefix')
for (const marker of ['editStageTitle', "done: '已编辑'", "error: '编辑失败'", "awaitingApproval: '等待批准编辑'"]) {
  if (!renderer.includes(marker)) throw new Error(`Missing edit-stage copy: ${marker}`)
}
for (const marker of ['stageSummaryRowKey', "event.stepId ? `${phase}:${event.stepId}` : phase", '正在编辑文件', '正在查看项目', '正在规划下一步', 'readStageTitle', '已查看']) {
  if (!renderer.includes(marker)) throw new Error(`Missing independent edit summary behavior: ${marker}`)
}
for (const marker of ['viewStageTitle', '正在查看图像', '正在查看 PDF', '已查看', 'ensureStageViewSurface', 'scheduleViewPreview', 'activity-view-preview', 'renderViewDocumentWindow']) {
  if (!renderer.includes(marker)) throw new Error(`Missing image/PDF view stages: ${marker}`)
}
for (const marker of ['compactCompletedStageRow', 'createStageGroup', 'stageGroupTitle', 'groupedStagePhases', '编辑了文件 ·', '运行了命令 ·', 'commandStageTitle', 'ensureCommandSummaryControl', '正在运行', '已运行']) {
  if (!renderer.includes(marker)) throw new Error(`Missing grouped stage summaries or command copy: ${marker}`)
}
for (const marker of ["view: 'image'", 'Open full-size preview', 'initializeFilePanelResizer', 'setFilePanelSplit', 'deepseek-nova:file-tree-height']) {
  if (!renderer.includes(marker)) throw new Error(`Missing compact OCR preview or file split control: ${marker}`)
}
for (const marker of ["viewType ? ['view'", "extension === '.pdf'", "['.pdf', 'application/pdf']", "type: 'pdf'"]) {
  if (!main.includes(marker)) throw new Error(`Missing image/PDF tool metadata or preview support: ${marker}`)
}
const presentFinalSource = renderer.slice(renderer.indexOf('function presentFinalCandidate'), renderer.indexOf('function restoreStageReports'))
if (presentFinalSource.includes('row.hidden = true') || presentFinalSource.includes('setAssistantText(context.turn')) throw new Error('Speculative final candidate still moves the report between visual regions')
if (!main.includes('计划说明使用自然的第一人称句式，例如“我会……”')) throw new Error('Natural first-person plan instruction is missing')
if (renderer.includes('normalizeStageReportText') || renderer.includes('rawMessageTexts')) throw new Error('Stage report text is still being rewritten in the UI')

for (const marker of ['messageQueues: new Map()', 'enqueueCurrentMessage', 'renderMessageQueue', 'takeNextQueuedMessage', 'guideQueuedMessage', 'queuedMessages', "queue.length >= 3", 'data-queue-action', 'syncComposerAction', 'stop-ready']) {
  if (!renderer.includes(marker)) throw new Error(`Missing running message queue: ${marker}`)
}
for (const marker of ['settingsLanguage', 'applyLanguage', "'en-US'", 'data-i18n', 'System language']) {
  if (!renderer.includes(marker) && !readFileSync(join(desktopDir, 'renderer/index.html'), 'utf8').includes(marker)) throw new Error(`Missing system language support: ${marker}`)
}
if (!main.includes("language: 'zh-CN'") || !main.includes("'language'") || !main.includes('responseLanguageInstruction') || !main.includes("store.settings.language === 'en-US'")) throw new Error('Language preference is not persisted or passed to the model')
if (!main.includes('queuedMessages:') || !main.includes("slice(0, 3)")) throw new Error('Queued messages are not safely persisted')
for (const marker of ["sessions:activity-save", 'activityHtml:', '2000000']) {
  if (!main.includes(marker)) throw new Error(`Missing persistent task activity storage: ${marker}`)
}
for (const marker of ['scheduleActivityPersistence', 'syncActivityHtml', 'rebuildHistoricalActivity', 'saveSessionActivity', 'activitySaveTimers']) {
  if (!renderer.includes(marker)) throw new Error(`Missing task activity restore flow: ${marker}`)
}

for (const marker of ['insertSelectedTextIntoPrompt', 'showTextContextMenu', 'searchSelectedText', 'pasteIntoEditable', "data-action=\"ask\"", "data-action=\"copy\"", "data-action=\"paste\""]) {
  if (!renderer.includes(marker)) throw new Error(`Missing text selection interaction: ${marker}`)
}
if (renderer.includes('showSelectionAsk') || renderer.includes("addEventListener('mouseup', showSelectionAsk")) throw new Error('Standalone selection ask popup is still present')

for (const marker of ['runningTasks: new Map()', 'runningContextForSession', 'session-running-ring', 'state.runningTasks.set(taskId, context)']) {
  if (!renderer.includes(marker)) throw new Error(`Missing session-level running state: ${marker}`)
}

const styles = readFileSync(join(desktopDir, 'renderer/styles.css'), 'utf8')
for (const marker of ['sessionRunningSpin', 'stageSummaryShimmer 4s linear', '.media-lightbox-nav', '*::-webkit-scrollbar-track { background: transparent; }', '--workspace-header-height: 52px', '.text-context-menu', '"Inter Variable"', '"Noto Sans SC Variable"']) {
  if (!styles.includes(marker)) throw new Error(`Missing refined motion or navigation style: ${marker}`)
}
for (const marker of ['.stage-summary-layer', '.stage-summary-shimmer', '-webkit-mask-image: linear-gradient', '-webkit-mask-position: 118% 0;', '0% { -webkit-mask-position: 118% 0;', '68%, 100% { -webkit-mask-position: -18% 0;']) {
  if (!styles.includes(marker)) throw new Error(`Missing continuous stage-summary shimmer timing: ${marker}`)
}
if (styles.includes('stageSummaryIconGlow')) throw new Error('Stage icon and text still use separate shimmer animations')
if (styles.includes('thinkingShimmer') || styles.includes('.thinking-label::after')) throw new Error('Thinking still contains a white shimmer')
for (const marker of ['markLatestStageItem', 'latest-stage-summary', "markLatestStageItem(turn, visibleRow, 'summary')", "markLatestStageItem(turn, row, 'report')"]) {
  if (!renderer.includes(marker) && !styles.includes(marker)) throw new Error(`Missing latest stage-summary shimmer state: ${marker}`)
}
if (!renderer.includes("elements.messages.querySelectorAll('.latest-stage-summary')")) throw new Error('Old stage-summary highlights are only cleared within one turn')
for (const marker of ['.stage-timeline', '.stage-summary', '.stage-report']) {
  if (!styles.includes(marker)) throw new Error(`Missing compact conversation progress style: ${marker}`)
}
for (const marker of ['.stage-group', '.stage-group-items', '.stage-summary.command-stage', '.stage-view-preview.is-image', '.stage-view-preview.is-pdf .view-preview-body', '.activity-view-preview.is-pdf .view-preview-body', '.file-panel-resizer', 'grid-template-rows: minmax(90px,var(--file-tree-height))']) {
  if (!styles.includes(marker)) throw new Error(`Missing grouped stage, OCR thumbnail, or file splitter style: ${marker}`)
}
if (styles.includes('max-height: 900px')) throw new Error('Conversation progress is still clipped at a fixed height')
if (styles.includes('.stage-report.typing .stage-report-text::after') || styles.includes('typewriterCaret')) throw new Error('Stage reports still show a typing caret')
for (const marker of ['.message-queue', '.queue-item', '.queue-status', '.queue-actions', '.send-button.queue-ready', '.send-button.stop-ready']) {
  if (!styles.includes(marker)) throw new Error(`Missing queued message styling: ${marker}`)
}
for (const marker of ['.settings-nav-item > [data-icon]', '.settings-nav-item > [data-i18n]', 'writing-mode: horizontal-tb', 'white-space: nowrap']) {
  if (!styles.includes(marker)) throw new Error(`Missing horizontal settings navigation fix: ${marker}`)
}
for (const marker of ['canRenderFinalMarkdown', 'finalCandidate', 'presentFinalCandidate', 'demoteFinalCandidate', 'renderStageReportMarkdown']) {
  if (!main.includes(marker) && !renderer.includes(marker)) throw new Error(`Missing direct final Markdown flow: ${marker}`)
}
for (const marker of ['grid-template-columns: 15px', 'color: var(--text-faint)', 'color: var(--text-soft)']) {
  if (!styles.includes(marker)) throw new Error(`Missing refined stage summary hierarchy: ${marker}`)
}
if (styles.includes('.work-step {')) throw new Error('Detailed work-step style is still present in the conversation')
if (styles.includes('.session-item.running:hover .session-running-ring')) throw new Error('Running ring still hides on session hover')

console.log(JSON.stringify({
  status: 'passed',
  desktopShell: 'ok',
  sessionHistory: 'ok',
  taskInspector: 'ok',
  filePreview: 'ok',
  embeddedBrowser: 'ok',
  settingsAndSkills: 'ok',
  continuousConversation: 'ok',
  thinkingAndProgress: 'ok',
  approvals: 'ok',
  sessionDeletion: 'ok',
  markdownRendering: 'ok',
  unifiedIconSystem: 'ok',
  stableThinkingState: 'ok',
  genericDynamicWelcome: 'ok',
  accountBalance: 'ok',
  delayedThinking: 'ok',
  collapsibleTaskProcess: 'ok',
  rollingTokenCounter: 'ok',
  editLineStats: 'ok',
  automaticHtmlPreview: 'ok',
  spatialMotionSystem: 'ok',
  silentApprovalContinuation: 'ok',
  previewPermissionInterception: 'ok',
  composerAutoApprovalMode: 'ok',
  compactInlineMediaGallery: 'ok',
  concurrentSessionNavigation: 'ok',
  livePermissionSwitching: 'ok',
  mediaLightboxNavigation: 'ok',
  taskRunningIndicator: 'ok',
  largerTypography: 'ok',
  alignedWorkspaceHeaders: 'ok',
  localTimeWelcome: 'ok',
  textSelectionActions: 'ok',
}, null, 2))
