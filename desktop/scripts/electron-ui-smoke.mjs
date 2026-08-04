import { spawn } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const electron = join(root, 'node_modules', 'electron', 'dist', 'electron.exe')
const port = 9337
const packagedExecutable = process.env.UI_SMOKE_EXECUTABLE
const executable = packagedExecutable || electron
const profilePath = process.env.UI_SMOKE_PROFILE || join(root, 'build', packagedExecutable ? 'ui-smoke-profile' : 'ui-smoke-profile-dev')
const args = packagedExecutable
  ? [`--remote-debugging-port=${port}`, `--user-data-dir=${profilePath}`]
  : [root, `--remote-debugging-port=${port}`, `--user-data-dir=${profilePath}`]
const child = spawn(executable, args, { cwd: root, windowsHide: true, stdio: 'ignore' })

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
let socket

try {
  let page
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${port}/json`).then((response) => response.json())
      page = targets.find((target) => target.type === 'page' && target.url.includes('renderer/index.html'))
      if (page) break
    } catch {}
    await delay(150)
  }
  if (!page) throw new Error('Electron renderer did not become ready')

  socket = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  let requestId = 0
  const pending = new Map()
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.method === 'Runtime.consoleAPICalled') {
      const values = (message.params?.args || []).map((item) => item.value ?? item.description).filter(Boolean)
      if (values[0]?.startsWith?.('[ui-smoke]')) console.log(...values)
    }
    if (!message.id || !pending.has(message.id)) return
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) reject(new Error(message.error.message))
    else resolve(message.result)
  })
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++requestId
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) {
      const description = result.exceptionDetails.exception?.description || result.exceptionDetails.exception?.value || result.exceptionDetails.text
      throw new Error(`${description}\n${JSON.stringify(result.exceptionDetails, null, 2)}`)
    }
    return result.result.value
  }

  await send('Runtime.enable')
  await send('Page.enable')
  await evaluate(`new Promise((resolve) => document.readyState === 'complete' ? setTimeout(resolve, 500) : addEventListener('load', () => setTimeout(resolve, 500), { once: true }))`)
  if (process.env.UI_SMOKE_QUICK === '1') {
    const quickResult = await evaluate(`({
      title: document.title,
      brand: document.querySelector('.titlebar-brand')?.textContent.trim(),
      logo: document.querySelector('.titlebar-logo')?.getAttribute('src'),
      welcomeLogo: document.querySelector('.welcome-logo')?.getAttribute('src'),
      accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
      activeVariant: state.studioVariant,
      workspace: state.settings.workspace,
    })`)
    const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    const screenshotPath = join(root, 'build', 'ui-brand-check.png')
    await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'))
    console.log(JSON.stringify({ status: 'passed', ...quickResult, screenshotPath }, null, 2))
  } else {
  const result = await evaluate(`(async () => {
    console.info('[ui-smoke] started');
    state.settings.language = 'zh-CN';
    applyLanguage('zh-CN');
    const originalSession = state.currentSession;
    originalSession.title = '正在运行的任务';
    const savedOriginalSession = await window.studio.saveSession(originalSession);
    Object.assign(originalSession, savedOriginalSession);
    if (!state.sessions.some((item) => item.id === originalSession.id)) state.sessions.unshift(originalSession);
    const mockTurn = addMessage('assistant', '', [], { running: true });
    state.runningTasks.set('ui-smoke-running-task', { taskId: 'ui-smoke-running-task', sessionId: originalSession.id, session: originalSession, turn: mockTurn, startedAt: Date.now(), baseTokens: 0, usageTokens: 0, activitySteps: new Map() });
    renderSessions();
    setRunning(true);
    elements.promptInput.value = '';
    resizePrompt();
    const emptyRunningAction = {
      stopStyle: elements.sendButton.classList.contains('stop-ready'),
      stopIcon: Boolean(elements.sendButton.querySelector('rect')),
      label: elements.sendButton.getAttribute('aria-label'),
    };
    elements.promptInput.value = '追加到队列的消息';
    resizePrompt();
    const filledRunningAction = {
      queueStyle: elements.sendButton.classList.contains('queue-ready'),
      sendIcon: Boolean(elements.sendButton.querySelector('path')),
      label: elements.sendButton.getAttribute('aria-label'),
    };
    elements.promptInput.value = '';
    resizePrompt();
    const runningComposerAction = { emptyRunningAction, filledRunningAction };
    const modeEnabledDuringRun = !elements.modeButton.disabled;
    const ringCount = document.querySelectorAll('.session-item.running .session-running-ring').length;
    const ringAnimation = getComputedStyle(document.querySelector('.session-running-ring')).animationName;
    const thinkingTurn = addMessage('assistant', '', [], { running: true });
    await new Promise((resolve) => setTimeout(resolve, 620));
    const thinkingLabel = thinkingTurn.status.querySelector('.thinking-label');
    const thinkingStyle = getComputedStyle(thinkingLabel, '::after');
    const thinkingShimmerRemoved = thinkingStyle.content === 'none' && thinkingStyle.animationName === 'none';
    const progressContext = state.runningTasks.get('ui-smoke-running-task');
    const detailedProgressBefore = elements.activityTimeline.querySelectorAll('.activity-event').length;
    const staleTurn = addMessage('assistant', '', [], { running: true });
    clearTimeout(staleTurn.thinkingTimer);
    recordWorkStep(staleTurn, { stepId: 'smoke:stale-plan', kind: 'plan', label: '旧的规划阶段', status: 'running' });
    upsertStageReport(thinkingTurn, { messageId: 'smoke:summary', text: '我会先检查相关结构，' });
    upsertStageReport(thinkingTurn, { messageId: 'smoke:summary', text: '再集中修改界面。' });
    recordWorkStep(thinkingTurn, { stepId: 'smoke:plan', kind: 'plan', label: '规划修改方向', status: 'running' });
    const latestPlanShimmers = thinkingTurn.stageTimeline.querySelector('[data-phase="plan"]').classList.contains('latest-stage-summary');
    const staleSummaryHighlightCleared = !staleTurn.stageTimeline.querySelector('.latest-stage-summary')
      && elements.messages.querySelectorAll('.latest-stage-summary').length === 1;
    staleTurn.article.remove();
    recordWorkStep(thinkingTurn, { stepId: 'smoke:read', kind: 'read', label: '读取项目结构', detail: 'renderer/app.js', status: 'running' });
    upsertActivityProgress({ stepId: 'smoke:read', kind: 'read', label: '读取项目结构', detail: 'renderer/app.js', status: 'running' }, progressContext);
    recordWorkStep(thinkingTurn, { stepId: 'smoke:edit', kind: 'edit', label: '编辑界面', detail: 'renderer/app.js', status: 'running' });
    upsertActivityProgress({ stepId: 'smoke:edit', kind: 'edit', label: '编辑界面', detail: 'renderer/app.js', status: 'running' }, progressContext);
    const existingEditSummary = thinkingTurn.stageSummary.querySelector('[data-phase="edit"]');
    const earlyEditSurface = existingEditSummary.querySelector('.stage-edit-preview');
    const prematureEmptyPreviewHidden = earlyEditSurface.hidden && existingEditSummary.querySelector('.stage-edit-toggle').hidden && !earlyEditSurface.querySelector('.edit-preview-unavailable');
    const existingEditIndex = [...thinkingTurn.stageTimeline.children].indexOf(existingEditSummary);
    upsertStageReport(thinkingTurn, { messageId: 'smoke:update', text: '核心交互已经调整，正在检查最终表现。' });
    const reportStopsSummaryShimmer = !thinkingTurn.stageTimeline.querySelector('.latest-stage-summary');
    const editIndexAfterNewReport = [...thinkingTurn.stageTimeline.children].indexOf(existingEditSummary);
    recordWorkStep(thinkingTurn, { stepId: 'smoke:browser', kind: 'browser', label: '检查页面', status: 'running' });
    const browserSummaryRow = thinkingTurn.stageTimeline.querySelector('[data-step-id="smoke:browser"]');
    recordWorkStep(thinkingTurn, { stepId: 'smoke:edit', kind: 'edit', label: '编辑界面', detail: 'renderer/app.js', status: 'done' });
    const latestUpdatedSummaryShimmers = thinkingTurn.stageTimeline.querySelector('[data-phase="edit"]').classList.contains('latest-stage-summary')
      && thinkingTurn.stageTimeline.querySelectorAll('.latest-stage-summary').length === 1;
    const latestSummaryRow = thinkingTurn.stageTimeline.querySelector('[data-phase="edit"]');
    const editFilePath = ${JSON.stringify(join(root, 'renderer', 'app.js'))};
    recordWorkStep(thinkingTurn, { stepId: 'smoke:edit', kind: 'edit', label: 'Editing renderer/app.js', detail: 'renderer/app.js', filePath: editFilePath, additions: 127, deletions: 8, previewContent: 'projected content', status: 'running' });
    const runningEditControlsHidden = latestSummaryRow.querySelector('.stage-edit-tools').hidden
      && getComputedStyle(latestSummaryRow.querySelector('.stage-edit-tools')).display === 'none'
      && getComputedStyle(latestSummaryRow.querySelector('.stage-edit-toggle')).display === 'none'
      && latestSummaryRow.querySelector('strong').textContent === '正在编辑 app.js';
    const savedEditStep = recordWorkStep(thinkingTurn, { stepId: 'smoke:edit', kind: 'edit', label: 'Editing renderer/app.js', detail: 'renderer/app.js', filePath: editFilePath, focusText: 'function renderDiffStats', additions: 127, deletions: 8, changes: [{ startLine: 1400, oldText: 'function renderDiffStats(target, additions, deletions, oldLabel) {', newText: 'function renderDiffStats(target, additions, deletions' }], previewContent: 'function renderDiffStats(target, additions, deletions\\nprojected preview line', status: 'done' });
    const editActivityRow = upsertActivityProgress({ ...savedEditStep, status: 'done' }, progressContext);
    const editPreviewContext = { ...progressContext, turn: thinkingTurn };
    scheduleEditPreview(editPreviewContext, savedEditStep, editActivityRow);
    const stageEditToggle = latestSummaryRow.querySelector('.stage-edit-toggle');
    const projectedPreviewAppearsBeforeDiskRefresh = latestSummaryRow.querySelectorAll('.edit-code-line').length >= 2 && !latestSummaryRow.querySelector('.edit-preview-unavailable');
    const defaultEditPreviewCollapsed = stageEditToggle.getAttribute('aria-expanded') === 'false' && latestSummaryRow.querySelector('.stage-edit-preview').hidden;
    const toolsLeftBeforeExpand = latestSummaryRow.querySelector('.stage-edit-tools').getBoundingClientRect().left;
    const statsBeforeRoll = latestSummaryRow.querySelector('.stage-edit-stats').textContent;
    renderEditLineStats(latestSummaryRow.querySelector('.stage-edit-stats'), 128, 9);
    const lineCountRollsPerDigit = latestSummaryRow.querySelectorAll('.edit-count-digit.rolling').length > 0;
    await new Promise((resolve) => setTimeout(resolve, 360));
    stageEditToggle.click();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const stageEditSurface = latestSummaryRow.querySelector('.stage-edit-preview');
    const activityEditSurface = editActivityRow.querySelector('.activity-edit-preview');
    const liveEditPreview = {
      onlyLineCounts: /^\\+127-8$/.test(statsBeforeRoll.replace(/\\s/g, '')),
      lineCountRollsPerDigit,
      prematureEmptyPreviewHidden,
      projectedPreviewAppearsBeforeDiskRefresh,
      runningEditControlsHidden,
      defaultCollapsed: defaultEditPreviewCollapsed,
      expandsOnDemand: !stageEditSurface.hidden && stageEditToggle.getAttribute('aria-expanded') === 'true',
      controlsStayFixed: Math.abs(latestSummaryRow.querySelector('.stage-edit-tools').getBoundingClientRect().left - toolsLeftBeforeExpand) < 1,
      fixedMaximumWidth: Math.abs(stageEditSurface.getBoundingClientRect().width - 650) < 1,
      summaryTextPreserved: Boolean(latestSummaryRow.querySelector('strong')?.textContent.trim()) && latestSummaryRow.querySelector('strong').getBoundingClientRect().width > 40,
      fullFileLoaded: stageEditSurface.querySelectorAll('.edit-code-line').length > 1000,
      activeLineHighlighted: Boolean(stageEditSurface.querySelector('.edit-code-line.is-focus')),
      addedLinesAreGreen: Boolean(stageEditSurface.querySelector('.edit-code-line.is-added')) && getComputedStyle(stageEditSurface.querySelector('.edit-code-line.is-added')).backgroundColor !== 'rgba(0, 0, 0, 0)',
      deletedContentIsRed: stageEditSurface.querySelector('.edit-code-line.is-deleted')?.textContent.includes('oldLabel') && getComputedStyle(stageEditSurface.querySelector('.edit-code-line.is-deleted')).backgroundColor !== 'rgba(0, 0, 0, 0)',
      autoScrolledToEdit: stageEditSurface.querySelector('.edit-code-scroll').scrollTop > 0,
      activityWindowVisible: Boolean(activityEditSurface) && getComputedStyle(activityEditSurface).height === '154px',
      activityUsesSameFocus: Boolean(activityEditSurface?.querySelector('.edit-code-line.is-focus')),
    };
    const latestShimmerStyle = getComputedStyle(latestSummaryRow.querySelector('.stage-summary-shimmer'));
    const latestShimmerAnimation = latestSummaryRow.querySelector('.stage-summary-shimmer').getAnimations().find((animation) => animation.animationName === 'stageSummaryShimmer');
    latestShimmerAnimation.pause();
    latestShimmerAnimation.currentTime = 0;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const shimmerStartPosition = getComputedStyle(latestSummaryRow.querySelector('.stage-summary-shimmer')).webkitMaskPosition;
    latestShimmerAnimation.currentTime = 2720;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const shimmerEndPosition = getComputedStyle(latestSummaryRow.querySelector('.stage-summary-shimmer')).webkitMaskPosition;
    const baseIconStyle = getComputedStyle(latestSummaryRow.querySelector('.stage-summary-base .stage-summary-icon'));
    const baseTextStyle = getComputedStyle(latestSummaryRow.querySelector('.stage-summary-base strong'));
    const iconRect = latestSummaryRow.querySelector('.stage-summary-base .ui-icon').getBoundingClientRect();
    const textRect = latestSummaryRow.querySelector('.stage-summary-base strong').getBoundingClientRect();
    const browserIconRect = browserSummaryRow.querySelector('.stage-summary-base .ui-icon').getBoundingClientRect();
    const browserTextRect = browserSummaryRow.querySelector('.stage-summary-base strong').getBoundingClientRect();
    const measuredShimmerDuration = latestShimmerStyle.animationDuration === '4s';
    const measuredShimmerTiming = latestShimmerStyle.animationTimingFunction === 'linear';
    const measuredUnifiedShimmer = latestShimmerStyle.animationName === 'stageSummaryShimmer' && baseIconStyle.animationName === 'none' && baseTextStyle.animationName === 'none';
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const rowsBeforeRepeatedPlan = thinkingTurn.stageTimeline.querySelectorAll('[data-phase="plan"]').length;
    recordWorkStep(thinkingTurn, { stepId: 'smoke:plan-return', kind: 'plan', label: '再次规划', status: 'running' });
    recordWorkStep(thinkingTurn, { stepId: 'smoke:plan-return', kind: 'plan', label: '再次规划', status: 'done' });
    const repeatedPlanRows = [...thinkingTurn.stageTimeline.querySelectorAll('[data-phase="plan"]')];
    const reportColors = [...thinkingTurn.stageReports.querySelectorAll('.stage-report')].map((row) => getComputedStyle(row).color);
    const listedPhases = [...thinkingTurn.stageSummary.querySelectorAll('.stage-summary')].map((row) => row.dataset.phase);
    const compactConversationProgress = {
      allPhaseSummariesListed: ['plan', 'read', 'edit', 'browser'].every((phase) => listedPhases.includes(phase)),
      repeatedPhaseAppendsBelow: repeatedPlanRows.length === rowsBeforeRepeatedPlan + 1
        && repeatedPlanRows.at(-1).dataset.stepId === 'smoke:plan-return',
      sameStepUpdatesInPlace: repeatedPlanRows.filter((row) => row.dataset.stepId === 'smoke:plan-return').length === 1,
      summaryHasNoSubtitle: !thinkingTurn.stageSummary.querySelector('small'),
      existingSummaryStayedInPlace: existingEditIndex === editIndexAfterNewReport,
      interleavedTimeline: [...thinkingTurn.stageTimeline.children].map((row) => row.classList.contains('stage-report') ? 'report' : row.dataset.phase).join(',') === 'report,plan,read,edit,report,browser,plan',
      summariesRemainVisibleWhileTyping: getComputedStyle(existingEditSummary).display !== 'none',
      summaryUpdatedForEdit: thinkingTurn.stageSummary.querySelector('[data-phase="edit"] strong')?.textContent === '已编辑 app.js',
      reportCount: thinkingTurn.stageReports.querySelectorAll('.stage-report').length === 2,
      streamedReportMerged: thinkingTurn.stageReports.firstElementChild.textContent.includes('我会先检查相关结构，再集中修改界面。'),
      reportColorsUnified: new Set(reportColors).size === 1,
      typewriterCompleted: !thinkingTurn.stageReports.querySelector('.typing'),
      noDetailedToolChain: !thinkingTurn.progress.querySelector('.work-step'),
      detailedProgressKeptRight: elements.activityTimeline.querySelectorAll('.activity-event').length - detailedProgressBefore === 2,
      latestPlanShimmers,
      staleSummaryHighlightCleared,
      reportStopsSummaryShimmer,
      latestUpdatedSummaryShimmers,
      latestShimmerDuration: measuredShimmerDuration,
      latestShimmerIsLinear: measuredShimmerTiming,
      shimmerFullyExitsText: shimmerStartPosition.startsWith('118%') && shimmerEndPosition.startsWith('-18%'),
      unifiedShimmerLayer: measuredUnifiedShimmer,
      iconTextCentersAligned: Math.abs((iconRect.top + iconRect.height / 2) - (textRect.top + textRect.height / 2)) < .6,
      browserIconTextCentersAligned: Math.abs((browserIconRect.top + browserIconRect.height / 2) - (browserTextRect.top + browserTextRect.height / 2)) < .6,
    };
    const completedHighlightTurn = addMessage('assistant', '', [], { running: true });
    clearTimeout(completedHighlightTurn.thinkingTimer);
    recordWorkStep(completedHighlightTurn, { stepId: 'smoke:complete-plan', kind: 'plan', label: '完成前的规划', status: 'running' });
    setTurnComplete(completedHighlightTurn, 1200);
    compactConversationProgress.completionClearsAllShimmers = !elements.messages.querySelector('.latest-stage-summary');
    completedHighlightTurn.article.remove();
    const independentEditTurn = addMessage('assistant', '', [], { running: true });
    clearTimeout(independentEditTurn.thinkingTimer);
    recordWorkStep(independentEditTurn, { stepId: 'independent:edit-1', kind: 'edit', status: 'running' });
    const unnamedRunningEditHasNoGap = independentEditTurn.stageTimeline.querySelector('[data-step-id="independent:edit-1"] strong')?.textContent === '正在编辑文件';
    recordWorkStep(independentEditTurn, { stepId: 'independent:edit-1', kind: 'edit', detail: 'index.html', additions: 12, deletions: 3, status: 'done' });
    recordWorkStep(independentEditTurn, { stepId: 'independent:edit-2', kind: 'edit', status: 'running' });
    const independentRows = [...independentEditTurn.stageTimeline.querySelectorAll('[data-phase="edit"]')];
    const independentEditSummaries = {
      unnamedRunningEditHasNoGap,
      completedEditPersists: independentRows[0]?.querySelector('strong')?.textContent === '已编辑 index.html',
      nextEditUsesNewRow: independentRows.length === 2 && independentRows[1]?.querySelector('strong')?.textContent === '正在编辑文件',
      completedControlsVisibleOnly: !independentRows[0]?.querySelector('.stage-edit-tools')?.hidden && independentRows[1]?.querySelector('.stage-edit-tools')?.hidden,
    };
    const commandTurn = addMessage('assistant', '', [], { running: true });
    clearTimeout(commandTurn.thinkingTimer);
    const commandStateText = 'ls -la "C:/Users/Clodius/Documents/DeepSeek Nova" 2>/dev/null && echo "----" && ls -la "C:/Users/Clodius/Documents/DeepSeek Nova"';
    recordWorkStep(commandTurn, { stepId: 'smoke:command-state', kind: 'command', detail: commandStateText, status: 'running' });
    const commandStateRow = commandTurn.stageTimeline.querySelector('[data-step-id="smoke:command-state"]');
    const commandWasRunning = commandStateRow.querySelector('strong').textContent.startsWith('正在运行 ');
    recordWorkStep(commandTurn, { stepId: 'smoke:command-state', kind: 'command', detail: commandStateText, status: 'done' });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const commandToggle = commandStateRow.querySelector('.stage-command-toggle');
    const commandRowBefore = commandStateRow.getBoundingClientRect();
    const commandIconBefore = commandStateRow.querySelector('.stage-summary-base .stage-summary-icon').getBoundingClientRect();
    const commandToolsBefore = commandStateRow.querySelector('.stage-command-tools').getBoundingClientRect();
    commandToggle.click();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const commandRowAfter = commandStateRow.getBoundingClientRect();
    const commandIconAfter = commandStateRow.querySelector('.stage-summary-base .stage-summary-icon').getBoundingClientRect();
    const commandToolsAfter = commandStateRow.querySelector('.stage-command-tools').getBoundingClientRect();
    const commandActivity = upsertActivityProgress({ stepId: 'smoke:command-state', kind: 'command', detail: commandStateText, status: 'done' }, progressContext);
    const commandCompletion = {
      runningLabelShown: commandWasRunning,
      completedLabelShown: commandStateRow.querySelector('strong').textContent.startsWith('已运行 '),
      rightPanelCompletedLabel: commandActivity.querySelector('strong').textContent.startsWith('已运行 '),
      awaitingApprovalLabel: commandStageTitle({ kind: 'command', detail: 'echo approval', status: 'awaitingApproval' }).startsWith('等待批准运行 '),
      failureLabel: commandStageTitle({ kind: 'command', detail: 'bad-command', status: 'error' }).startsWith('运行失败 '),
      editAwaitingApprovalLabel: editStageTitle({ kind: 'edit', detail: 'index.html', status: 'awaitingApproval' }) === '等待批准编辑 index.html',
      editFailureLabel: editStageTitle({ kind: 'edit', detail: 'index.html', status: 'error' }) === '编辑失败 index.html',
      iconStaysOnFirstLine: Math.abs((commandIconAfter.top - commandRowAfter.top) - (commandIconBefore.top - commandRowBefore.top)) < 1,
      toggleStaysOnFirstLine: Math.abs((commandToolsAfter.top - commandRowAfter.top) - (commandToolsBefore.top - commandRowBefore.top)) < 1,
    };
    commandTurn.article.remove();
    const readTurn = addMessage('assistant', '', [], { running: true });
    clearTimeout(readTurn.thinkingTimer);
    const runningRead = { stepId: 'smoke:read-state', kind: 'read', detail: 'src/main.js', filePath: 'D:/Demo/src/main.js', status: 'running' };
    recordWorkStep(readTurn, runningRead);
    const readStateRow = readTurn.stageTimeline.querySelector('[data-step-id="smoke:read-state"]');
    const readActivity = upsertActivityProgress(runningRead, progressContext);
    const readRunningCopy = readStateRow.querySelector('strong').textContent;
    const completedRead = { ...runningRead, status: 'done' };
    recordWorkStep(readTurn, completedRead);
    upsertActivityProgress(completedRead, progressContext);
    const readCompletion = {
      runningCopy: readRunningCopy === '正在查看项目',
      completedWithFileName: readStateRow.querySelector('strong').textContent === '已查看 main.js',
      rightPanelCompletedWithFileName: readActivity.querySelector('strong').textContent === '已查看 main.js',
    };
    readTurn.article.remove();
    const approvalTurn = addMessage('assistant', '', [], { running: true });
    clearTimeout(approvalTurn.thinkingTimer);
    addApprovalCard(approvalTurn, { approvalId: 'smoke:permission', kind: 'permission', question: 'DeepSeek Nova 需要权限才能继续执行 Bash', options: [{ label: '批准并继续', value: 'allow', description: '继续执行操作。' }, { label: '暂不允许', value: 'deny', description: '跳过该操作。' }] });
    const approvalPresentation = {
      cardVisible: getComputedStyle(approvalTurn.approvals.querySelector('.approval-card')).display !== 'none',
      choicesVisible: approvalTurn.approvals.querySelectorAll('.approval-actions button').length === 2,
      primarySecondaryDifference: parseFloat(getComputedStyle(approvalTurn.approvals.querySelector('.approval-heading strong')).fontSize)
        - parseFloat(getComputedStyle(approvalTurn.approvals.querySelector('.approval-heading p')).fontSize) === 1,
    };
    approvalTurn.article.remove();
    const makeApprovalContext = (taskId, turn) => ({
      taskId,
      sessionId: originalSession.id,
      session: originalSession,
      turn,
      startedAt: Date.now(),
      baseTokens: 0,
      usageTokens: 0,
      usageOffset: 0,
      activitySteps: new Map(),
      activityRoot: document.createElement('div'),
      approvalQueue: [],
      approvalIds: new Set(),
      approvalHistory: [],
      activeApprovalEvent: null,
      pendingApprovalResponse: null,
      pendingApprovalEvent: null,
      awaitingApproval: true,
      backendExited: false,
      resumingApproval: false,
      accumulatedFiles: [],
      deleted: false,
    });
    const serialTurn = addMessage('assistant', '', [], { running: true });
    clearTimeout(serialTurn.thinkingTimer);
    const serialContext = makeApprovalContext('serial-approval-task', serialTurn);
    const permissionEvents = [1, 2, 3].map((index) => ({
      approvalId: 'permission:tool-' + index,
      kind: 'permission',
      question: 'DeepSeek Nova 需要权限才能继续执行 Bash ' + index,
      denials: [{ tool_use_id: 'tool-' + index, tool_name: 'Bash', tool_input: { command: 'echo ' + index } }],
      options: [
        { label: '批准并继续', value: 'allow', description: '只批准当前这一项操作。' },
        { label: '暂不允许', value: 'deny', description: '只跳过当前这一项操作。' },
      ],
    }));
    permissionEvents.forEach((event) => queueApprovalEvent(serialContext, event));
    const firstPermissionCard = serialTurn.approvals.querySelector('.approval-card');
    const initiallyVisiblePermissionCards = serialTurn.approvals.querySelectorAll('.approval-card:not(.resolved)').length;
    await handleApprovalChoice(serialContext, serialContext.activeApprovalEvent, permissionEvents[0].options[0], firstPermissionCard);
    const serialPermissionApprovals = {
      onlyOneCardInitially: initiallyVisiblePermissionCards === 1,
      onlyFirstApproved: serialTurn.approvals.querySelectorAll('.approval-card.resolved').length === 1,
      secondShownAfterFirst: serialTurn.approvals.querySelectorAll('.approval-card').length === 2
        && serialContext.activeApprovalEvent?.approvalId === 'permission:tool-2',
      thirdStillQueued: serialContext.approvalQueue.length === 2
        && !serialTurn.approvals.querySelector('[data-approval-id="permission:tool-3"]'),
      exactApprovedOperation: serialContext.pendingApprovalResponse?.approvedOperation?.tool_use_id === 'tool-1',
      remainingApprovalsNotGranted: serialContext.pendingApprovalResponse?.prompt.includes('其他待审批操作仍需逐项询问'),
      nextCardWaitsForResume: [...serialTurn.approvals.querySelectorAll('.active-approval button')].every((button) => button.disabled),
    };
    serialContext.resumingApproval = true;
    await continuePendingPermissionsWithFullAccess(serialContext);
    serialPermissionApprovals.fullAccessClearsManualQueue = serialContext.approvalQueue.length === 0
      && !serialContext.activeApprovalEvent
      && serialTurn.approvals.querySelectorAll('.approval-card.resolved').length === 2;
    serialPermissionApprovals.fullAccessDoesNotCreateAnotherCard = serialTurn.approvals.querySelectorAll('.approval-card').length === 2;
    serialTurn.article.remove();
    const deniedTurn = addMessage('assistant', '', [], { running: true });
    clearTimeout(deniedTurn.thinkingTimer);
    const deniedContext = makeApprovalContext('denied-operation-task', deniedTurn);
    const deniedEvent = {
      approvalId: 'permission:denied-tool',
      kind: 'permission',
      question: 'DeepSeek Nova 需要权限才能继续执行 Bash',
      denials: [{ tool_use_id: 'denied-tool', tool_name: 'Bash', tool_input: { command: 'echo denied' } }],
      options: [{ label: '批准并继续', value: 'allow' }, { label: '暂不允许', value: 'deny' }],
    };
    queueApprovalEvent(deniedContext, deniedEvent);
    await handleApprovalChoice(deniedContext, deniedContext.activeApprovalEvent, deniedEvent.options[1], deniedTurn.approvals.querySelector('.approval-card'));
    const deniedOperationGuard = {
      exactOperationRecorded: deniedContext.pendingApprovalResponse?.deniedOperation?.tool_use_id === 'denied-tool',
      continuesInCurrentMode: deniedContext.pendingApprovalResponse?.permissionMode === state.settings.permissionMode,
      promptForbidsOperation: deniedContext.pendingApprovalResponse?.prompt.includes('不要执行当前这一项操作'),
    };
    deniedTurn.article.remove();
    const questionTurn = addMessage('assistant', '', [], { running: true });
    clearTimeout(questionTurn.thinkingTimer);
    const questionContext = makeApprovalContext('supplementary-question-task', questionTurn);
    const questionEvents = [
      ['question:category', '奢侈品网站的具体品类是什么？', ['综合精品店', '腕表珠宝']],
      ['question:function', '网站的功能定位是什么？', ['品牌展示型', '电商型']],
      ['question:existing', '如何处理当前目录下的简历网站文件？', ['替换覆盖', '保留并存']],
    ].map(([approvalId, question, choices]) => ({
      approvalId,
      kind: 'question',
      question,
      options: choices.map((label) => ({ label, value: label })),
    }));
    questionEvents.forEach((event) => queueApprovalEvent(questionContext, event));
    const messagesBeforeTypedAnswer = elements.messages.children.length;
    const sessionMessagesBeforeTypedAnswer = originalSession.messages.length;
    await answerActiveQuestionWithText(questionContext, '这是我的自定义说明');
    const supplementaryQuestions = {
      onlyOneQuestionInitially: questionTurn.approvals.querySelectorAll('.approval-card.resolved').length === 1
        && questionTurn.approvals.querySelectorAll('.approval-card').length === 2,
      remainingQuestionsPending: questionContext.approvalQueue.length === 2
        && questionContext.activeApprovalEvent?.approvalId === 'question:function',
      customComposerAnswerAccepted: elements.messages.children.length === messagesBeforeTypedAnswer + 1
        && originalSession.messages.at(-1)?.content === '这是我的自定义说明',
      noAutomaticAnswers: questionTurn.approvals.querySelectorAll('.approval-card.resolved').length === 1,
      pendingAnswerPromptPreserved: questionContext.pendingApprovalResponse?.prompt.includes('其他待补充问题不要自行替我选择'),
      customAnswerHintVisible: Boolean(questionTurn.approvals.querySelector('.active-approval .approval-custom-hint')),
    };
    while (originalSession.messages.length > sessionMessagesBeforeTypedAnswer) originalSession.messages.pop();
    elements.messages.lastElementChild?.remove();
    questionTurn.article.remove();
    const pausedTurn = addMessage('assistant', '', [], { running: true });
    clearTimeout(pausedTurn.thinkingTimer);
    const pausedContext = {
      taskId: 'ui-smoke-paused-task', sessionId: originalSession.id, session: originalSession, turn: pausedTurn,
      startedAt: Date.now(), baseTokens: 0, usageTokens: 0, usageOffset: 0, activitySteps: new Map(),
      activityRoot: document.createElement('div'), pendingApprovalResponse: null, pendingApprovalEvent: null,
      awaitingApproval: false, backendExited: false, accumulatedFiles: [], deleted: false,
    };
    state.runningTasks.set(pausedContext.taskId, pausedContext);
    handleTaskEvent({ taskId: pausedContext.taskId, type: 'progress', stepId: 'approval:command', kind: 'command', detail: 'echo protected', status: 'awaitingApproval' });
    handleTaskEvent({ taskId: pausedContext.taskId, type: 'approval', approvalId: 'approval:lifecycle', kind: 'permission', question: 'DeepSeek Nova 需要权限才能继续执行 Bash', options: [{ label: '批准并继续', value: 'allow' }, { label: '暂不允许', value: 'deny' }] });
    await finishTask({ taskId: pausedContext.taskId, type: 'finished', code: 0, awaitingApproval: true, pendingApprovals: [{ tool_name: 'Bash' }], finalResponseText: '', files: [], usageTokens: 12 }, pausedContext);
    const pauseKeepsContext = state.runningTasks.get('ui-smoke-paused-task') === pausedContext;
    const noFalseTaskEnded = !pausedTurn.text.textContent.includes('任务已结束') && !pausedTurn.status.classList.contains('done');
    const waitingStageVisible = pausedTurn.stageTimeline.querySelector('[data-step-id="approval:command"] strong')?.textContent.startsWith('等待批准运行 ');
    const sameTurn = pausedContext.turn;
    const resumed = await resumeTaskAfterApproval(pausedContext, { prompt: '继续刚才批准的操作', permissionMode: 'bypassPermissions', kind: 'permission' }, async (payload) => ({ taskId: payload.taskId }));
    const approvalLifecycle = {
      pauseKeepsContext,
      noFalseTaskEnded,
      approvalCardVisible: Boolean(pausedTurn.approvals.querySelector('.approval-card')),
      waitingStageVisible,
      resumedSameTurn: resumed && pausedContext.turn === sameTurn && state.runningTasks.get(pausedContext.taskId) === pausedContext,
      resumeUsesSameSession: pausedContext.sessionId === originalSession.id && pausedContext.backendExited === false,
    };
    console.info('[ui-smoke] approval lifecycle complete');
    state.runningTasks.delete(pausedContext.taskId);
    pausedTurn.article.remove();
    independentEditTurn.article.remove();
    const groupedTurn = addMessage('assistant', '', [], { running: true });
    clearTimeout(groupedTurn.thinkingTimer);
    recordWorkStep(groupedTurn, { stepId: 'group:edit-1', kind: 'edit', detail: 'check-disk.ps1', additions: 23, status: 'done' });
    recordWorkStep(groupedTurn, { stepId: 'group:edit-2', kind: 'edit', detail: 'check-user.ps1', additions: 12, status: 'done' });
    const firstEditGroup = groupedTurn.stageTimeline.querySelector('.stage-group[data-phase="edit"]');
    upsertStageReport(groupedTurn, { messageId: 'group:barrier', text: '接下来处理另一组文件。', instant: true });
    recordWorkStep(groupedTurn, { stepId: 'group:edit-3', kind: 'edit', detail: 'check-appdata.ps1', additions: 12, status: 'done' });
    recordWorkStep(groupedTurn, { stepId: 'group:edit-4', kind: 'edit', detail: 'check-cache.ps1', additions: 8, status: 'done' });
    const editGroups = groupedTurn.stageTimeline.querySelectorAll('.stage-group[data-phase="edit"]');
    const firstGroupToggle = firstEditGroup.querySelector('.stage-group-toggle');
    const firstGroupItems = firstEditGroup.querySelector('.stage-group-items');
    const groupDefaultCollapsed = firstGroupToggle.getAttribute('aria-expanded') === 'false' && firstGroupItems.hidden;
    firstGroupToggle.click();
    const longCommand = 'powershell -NoProfile -Command "Get-ChildItem -Recurse -File | Where-Object Length -gt 1000000 | Select-Object FullName,Length"';
    recordWorkStep(groupedTurn, { stepId: 'group:command-1', kind: 'command', detail: longCommand, status: 'done' });
    const commandRow = groupedTurn.stageTimeline.querySelector('[data-step-id="group:command-1"]');
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const groupedStageSummaries = {
      consecutiveEditsGrouped: firstEditGroup?.querySelector('.stage-group-header strong')?.textContent === '编辑了文件 · 2 个'
        && firstGroupItems.querySelectorAll(':scope > .stage-summary').length === 2,
      groupCollapsedByDefault: groupDefaultCollapsed,
      groupExpandsOnDemand: firstGroupToggle.getAttribute('aria-expanded') === 'true' && !firstGroupItems.hidden,
      reportBreaksGrouping: editGroups.length === 2
        && [...groupedTurn.stageTimeline.children].some((row) => row.classList.contains('stage-report')),
      editDetailsAndStatsKept: firstGroupItems.textContent.includes('已编辑 check-disk.ps1')
        && firstGroupItems.querySelector('[data-step-id="group:edit-1"] .stage-edit-stats')?.getAttribute('aria-label') === '23 lines added, 0 lines removed',
      commandUsesRealCopy: commandRow.querySelector('strong').textContent.startsWith('已运行 powershell -NoProfile'),
      longCommandCollapsed: !commandRow.querySelector('.stage-command-tools').hidden
        && commandRow.querySelector('.stage-command-toggle').getAttribute('aria-expanded') === 'false',
      progressHasNoHeightClip: getComputedStyle(groupedTurn.progress).maxHeight === 'none'
        && getComputedStyle(groupedTurn.progress).overflow === 'visible',
    };
    groupedTurn.article.remove();
    const viewTurn = addMessage('assistant', '', [], { running: true });
    clearTimeout(viewTurn.thinkingTimer);
    const viewPath = ${JSON.stringify(join(root, 'build', 'app-icon.png'))};
    const runningViewStep = recordWorkStep(viewTurn, { stepId: 'smoke:view-image', kind: 'view', detail: 'build/app-icon.png', filePath: viewPath, viewType: 'image', status: 'running' });
    const runningViewRow = viewTurn.stageTimeline.querySelector('[data-step-id="smoke:view-image"]');
    const runningViewCopy = runningViewRow.querySelector('strong').textContent;
    const runningViewControlsHidden = runningViewRow.querySelector('.stage-view-tools').hidden;
    const viewContext = { turn: viewTurn, session: { workspace: ${JSON.stringify(root)} }, sessionId: 'smoke-view-session', activityRoot: document.createElement('div'), activitySteps: new Map(), deleted: false };
    viewContext.activityRoot.className = 'activity-timeline';
    viewContext.activityRoot.style.cssText = 'position:fixed;left:-10000px;top:0;width:340px;height:500px;';
    document.body.append(viewContext.activityRoot);
    const viewActivityRow = upsertActivityProgress(runningViewStep, viewContext);
    await scheduleViewPreview(viewContext, runningViewStep, viewActivityRow);
    const completedViewStep = recordWorkStep(viewTurn, { ...runningViewStep, status: 'done' });
    upsertActivityProgress(completedViewStep, viewContext);
    await scheduleViewPreview(viewContext, completedViewStep, viewActivityRow);
    const viewToggle = runningViewRow.querySelector('.stage-view-toggle');
    const viewSurface = runningViewRow.querySelector('.stage-view-preview');
    const viewPreviewStages = {
      runningCopy: runningViewCopy === '正在查看图像',
      completedCopyIncludesName: runningViewRow.querySelector('strong').textContent === '已查看 app-icon.png',
      controlsOnlyAfterCompletion: runningViewControlsHidden && !runningViewRow.querySelector('.stage-view-tools').hidden,
      collapsedByDefault: viewSurface.hidden && viewToggle.getAttribute('aria-expanded') === 'false',
      imagePreparedWhileRunning: Boolean(viewSurface.querySelector('img')),
      activityPreviewVisible: Boolean(viewActivityRow.querySelector('.activity-view-preview img'))
        && getComputedStyle(viewActivityRow.querySelector('.activity-view-preview')).height === '180px',
    };
    viewToggle.click();
    viewPreviewStages.expandsOnDemand = !viewSurface.hidden && viewToggle.getAttribute('aria-expanded') === 'true';
    viewPreviewStages.compactImageThumbnail = viewSurface.classList.contains('is-image')
      && viewSurface.getBoundingClientRect().width <= 211
      && viewSurface.getBoundingClientRect().height <= 139;
    viewPreviewStages.imageUsesGraphicIcon = progressIcon('view') === icon('image');
    viewSurface.querySelector('img').click();
    viewPreviewStages.thumbnailOpensFullPreview = Boolean(document.querySelector('.media-lightbox'));
    closeMediaViewer();
    const pdfViewPath = ${JSON.stringify(join(root, '..', '..', 'DeepSeek-Nova-使用说明.pdf'))};
    const pdfViewStep = recordWorkStep(viewTurn, { stepId: 'smoke:view-pdf', kind: 'view', detail: 'DeepSeek-Nova-使用说明.pdf', filePath: pdfViewPath, viewType: 'pdf', status: 'running' });
    const pdfViewRow = viewTurn.stageTimeline.querySelector('[data-step-id="smoke:view-pdf"]');
    viewPreviewStages.pdfRunningCopy = pdfViewRow.querySelector('strong').textContent === '正在查看 PDF';
    const pdfActivityRow = upsertActivityProgress(pdfViewStep, viewContext);
    await scheduleViewPreview(viewContext, pdfViewStep, pdfActivityRow);
    const completedPdfViewStep = recordWorkStep(viewTurn, { ...pdfViewStep, status: 'done' });
    upsertActivityProgress(completedPdfViewStep, viewContext);
    await scheduleViewPreview(viewContext, completedPdfViewStep, pdfActivityRow);
    viewPreviewStages.pdfCompletedCopy = pdfViewRow.querySelector('strong').textContent === '已查看 DeepSeek-Nova-使用说明.pdf';
    viewPreviewStages.externalPdfPrepared = pdfViewRow.querySelector('.stage-view-preview iframe')?.src.startsWith('data:application/pdf;base64,') === true
      && pdfActivityRow.querySelector('.activity-view-preview iframe')?.src.startsWith('data:application/pdf;base64,') === true;
    viewPreviewStages.singlePdfScrollbar = getComputedStyle(pdfViewRow.querySelector('.stage-view-preview .view-preview-body')).overflow === 'hidden'
      && getComputedStyle(pdfActivityRow.querySelector('.activity-view-preview .view-preview-body')).overflow === 'hidden';
    viewContext.activityRoot.remove();
    viewTurn.article.remove();
    console.info('[ui-smoke] previews complete');
    addActivity(icon('check'), '持久化进程测试', '这条记录应在重新读取本地状态后仍然存在', 'done', new Date(), progressContext);
    await new Promise((resolve) => setTimeout(resolve, 260));
    const persistedState = await window.studio.getInitialState();
    const persistedActivitySession = persistedState.sessions.find((session) => session.id === originalSession.id);
    const persistedActivityProbe = document.createElement('div');
    persistedActivityProbe.innerHTML = persistedActivitySession?.activityHtml || '';
    const activityPersistence = {
      savedDuringRun: Boolean(persistedActivitySession?.activityHtml?.includes('持久化进程测试')),
      restorableAfterRestart: persistedActivityProbe.querySelectorAll('.activity-event').length >= 3,
      storedInsideSession: Object.hasOwn(persistedActivitySession || {}, 'activityHtml'),
      removedWithConversation: false,
    };
    const silentTurn = addMessage('assistant', '', [], { running: true });
    await new Promise((resolve) => setTimeout(resolve, 1160));
    const authenticNarrativeOnly = {
      noAutomaticReportAfterSilence: !silentTurn.stageReports.querySelector('.stage-report'),
      noAutomaticPlanPhase: !silentTurn.stageSummary.querySelector('[data-phase="plan"]'),
      explicitMissingFinalAnswer: finalTaskAnswer({}) === '任务已结束。',
      realFinalAnswerPreserved: finalTaskAnswer({ finalResponseText: '模型返回的最终答案。' }) === '模型返回的最终答案。',
    };
    const directFinalTurn = addMessage('assistant', '', [], { running: true });
    clearTimeout(directFinalTurn.thinkingTimer);
    const directFinalContext = { turn: directFinalTurn, finalCandidateMessageId: '' };
    presentFinalCandidate(directFinalContext, { messageId: 'smoke:final', text: '**最终结果**\\n\\n已经直接渲染。', finalCandidate: true });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const hiddenCandidateRow = directFinalTurn.reportRows.get('smoke:final');
    const directFinalMarkdown = {
      renderedImmediately: Boolean(hiddenCandidateRow.querySelector('strong')) && !hiddenCandidateRow.textContent.includes('**'),
      keptInTimelineUntilFinish: !hiddenCandidateRow.hidden && directFinalTurn.text.matches(':empty'),
      stableBeforeNextTool: hiddenCandidateRow.parentElement === directFinalTurn.stageTimeline,
      noTypewriter: !hiddenCandidateRow.classList.contains('typing'),
    };
    demoteFinalCandidate(directFinalContext);
    directFinalMarkdown.demotesWithoutMoving = !hiddenCandidateRow.hidden
      && hiddenCandidateRow.parentElement === directFinalTurn.stageTimeline
      && !directFinalTurn.text.textContent;
    directFinalTurn.article.remove();
    clearTimeout(silentTurn.thinkingTimer);
    silentTurn.article.remove();
    newSession();
    const queueSession = state.currentSession;
    const queueTurn = addMessage('assistant', '', [], { running: true });
    state.runningTasks.set('ui-smoke-queue-task', { taskId: 'ui-smoke-queue-task', sessionId: queueSession.id, session: queueSession, turn: queueTurn, startedAt: Date.now(), baseTokens: 0, usageTokens: 0, activitySteps: new Map() });
    for (const prompt of ['第一条等待消息', '第二条等待消息内容比较长，用于检查超出可用宽度后会自动显示省略号', '第三条等待消息']) {
      elements.promptInput.value = prompt;
      enqueueCurrentMessage();
    }
    elements.promptInput.value = '第四条不应进入队列';
    const fourthAccepted = enqueueCurrentMessage();
    const queueRows = [...elements.messageQueue.querySelectorAll('.queue-item')];
    const firstQueueId = queueRows[0].dataset.queueId;
    const secondQueueId = queueRows[1].dataset.queueId;
    const thirdQueueId = queueRows[2].dataset.queueId;
    const queuedMessageEllipsis = getComputedStyle(queueRows[1].querySelector('.queue-message')).textOverflow;
    const queueRects = queueRows.map((row) => row.getBoundingClientRect());
    deleteQueuedMessage(thirdQueueId);
    editQueuedMessage(firstQueueId);
    await guideQueuedMessage(secondQueueId);
    const queueContext = state.runningTasks.get('ui-smoke-queue-task');
    const runningMessageQueue = {
      cappedAtThree: queueRows.length === 3 && fourthAccepted === false,
      cardsStackAboveComposer: elements.messageQueue.nextElementSibling === elements.composer,
      cardsUseEvenOverlap: queueRects.slice(1).every((rect, index) => queueRects[index].bottom > rect.top)
        && Math.abs((queueRects[0].bottom - queueRects[1].top) - (queueRects[1].bottom - queueRects[2].top)) < 1,
      messageEllipsis: queuedMessageEllipsis === 'ellipsis',
      allActionsPresent: queueRows.every((row) => ['delete','edit','guide'].every((action) => row.querySelector('[data-queue-action="'+action+'"]'))),
      editReturnsText: elements.promptInput.value === '第一条等待消息',
      guidePrioritized: queueContext.guidedQueuedMessage?.prompt.startsWith('第二条等待消息'),
      queueEmptyAfterActions: queueForSession(queueSession.id).length === 0,
    };
    clearTimeout(queueTurn.thinkingTimer);
    queueTurn.article.remove();
    state.runningTasks.delete('ui-smoke-queue-task');
    state.settings.language = 'en-US';
    applyLanguage('en-US');
    const englishSystemLanguage = {
      persistedControl: elements.settingsLanguage.value === 'en-US',
      mainNavigationTranslated: document.querySelector('#newTaskButton [data-i18n="newTask"]').textContent === 'New task',
      composerTranslated: elements.promptInput.placeholder === 'Give DeepSeek Nova a task…',
      settingsTranslated: document.querySelector('[data-i18n="languageTitle"]').textContent === 'System language',
      dynamicStatusTranslated: finalTaskAnswer({}) === 'Task ended.',
    };
    state.settings.language = 'zh-CN';
    applyLanguage('zh-CN');
    const taskCountBeforeNewSession = state.runningTasks.size;
    newSession();
    const canCreateNewSession = state.currentSession.id !== originalSession.id && state.runningTasks.size === taskCountBeforeNewSession;
    const headerHeights = { task: document.querySelector('.task-header').getBoundingClientRect().height, inspector: document.querySelector('.inspector-tabs').getBoundingClientRect().height };
    setSidebarCollapsed('left', true);
    await new Promise((resolve) => setTimeout(resolve, 360));
    const collapsedLeftPadding = parseFloat(getComputedStyle(document.querySelector('.task-header')).paddingLeft);
    setSidebarCollapsed('left', false);
    setSidebarCollapsed('right', true);
    await new Promise((resolve) => setTimeout(resolve, 360));
    const collapsedRightPadding = parseFloat(getComputedStyle(document.querySelector('.task-header')).paddingRight);
    setSidebarCollapsed('right', false);
    await new Promise((resolve) => setTimeout(resolve, 360));
    setInspector('files');
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const fileBrowser = elements.filePanelResizer.closest('.file-browser');
    const splitBefore = elements.fileTree.getBoundingClientRect().height;
    setFilePanelSplit(fileBrowser, splitBefore + 36, false);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const filePanelSplit = {
      draggableSeparatorPresent: getComputedStyle(elements.filePanelResizer).cursor === 'row-resize',
      changesPanelRatio: elements.fileTree.getBoundingClientRect().height > splitBefore + 30,
      previewKeepsMinimumHeight: elements.previewPane.getBoundingClientRect().height >= 120,
      exposesAccessibleValue: Number(elements.filePanelResizer.getAttribute('aria-valuenow')) > 0,
    };
    setInspector('activity');
    const hour = new Date().getHours();
    const expectedPeriod = hour >= 23 || hour < 5 ? 'late' : hour < 11 ? 'morning' : hour < 13 ? 'noon' : hour < 18 ? 'afternoon' : 'evening';
    const welcomeStyle = getComputedStyle(elements.welcome.querySelector('h2'));
    const welcomeState = { localTime: activeWelcomePhraseSets()['zh-CN'][expectedPeriod].includes(elements.welcomeLead.textContent), singleLine: welcomeStyle.whiteSpace === 'nowrap', regularWeight: Number(welcomeStyle.fontWeight) <= 400, extrasRemoved: !elements.welcome.querySelector('.overline, .welcome-text, .welcome-hint') };
    const selectionSample = document.createElement('p');
    selectionSample.className = 'assistant-response';
    selectionSample.textContent = '这是一段用于选择测试的文字';
    elements.messages.append(selectionSample);
    const selectionRange = document.createRange();
    selectionRange.selectNodeContents(selectionSample);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(selectionRange);
    selectionSample.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 420, clientY: 360 }));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const standaloneAskAbsent = !document.querySelector('.selection-ask, [data-floating-selection-ask]');
    selectionSample.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 430, clientY: 370 }));
    await new Promise((resolve) => setTimeout(resolve, 30));
    const contextMenuText = document.querySelector('.text-context-menu')?.textContent || '';
    const askInContextMenu = contextMenuText.includes('在聊天中询问');
    document.querySelector('.text-context-menu [data-action="ask"]')?.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const selectionInserted = elements.promptInput.value.includes('> 这是一段用于选择测试的文字');
    const textSelectionActions = { standaloneAskAbsent, askInContextMenu, selectionInserted, copy: contextMenuText.includes('复制'), selectAll: contextMenuText.includes('全选'), search: contextMenuText.includes('在浏览器中搜索') };
    hideTextContextMenu();
    await window.studio.copyText('剪贴板粘贴测试');
    elements.promptInput.value = '开头 结尾';
    elements.promptInput.setSelectionRange(3, 3);
    elements.promptInput.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 440, clientY: 740 }));
    await new Promise((resolve) => setTimeout(resolve, 30));
    const inputMenuText = document.querySelector('.text-context-menu')?.textContent || '';
    const pasteButtonShown = inputMenuText.includes('粘贴');
    document.querySelector('.text-context-menu [data-action="paste"]')?.click();
    await new Promise((resolve) => setTimeout(resolve, 30));
    const inputPaste = { shown: pasteButtonShown, insertedAtCursor: elements.promptInput.value === '开头 剪贴板粘贴测试结尾' };
    console.info('[ui-smoke] interaction checks complete');
    openSettings('general');
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const settingsNavLabel = document.querySelector('.settings-nav-item [data-i18n="modelReasoning"]');
    const settingsNavigationLayout = {
      horizontalWritingMode: getComputedStyle(settingsNavLabel).writingMode === 'horizontal-tb',
      noWrapping: getComputedStyle(settingsNavLabel).whiteSpace === 'nowrap',
      usableLabelWidth: settingsNavLabel.getBoundingClientRect().width > 30 && settingsNavLabel.getBoundingClientRect().height < 24,
      navKeepsColumnWidth: document.querySelector('.settings-nav').getBoundingClientRect().width >= 190,
    };
    await closeSettings(true);
    const media = [1,2,3].map((number) => ({ name: 'preview-'+number+'.svg', relativePath: 'media/preview-'+number+'.svg', path: 'D:/Demo/preview-'+number+'.svg', size: 1024 * number, type: 'image', url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560"><rect width="100%" height="100%" fill="hsl('+(number*75)+' 48% 42%)"/><circle cx="450" cy="250" r="140" fill="rgba(255,255,255,.28)"/><text x="450" y="485" text-anchor="middle" font-family="sans-serif" font-size="58" fill="white">Preview '+number+'</text></svg>') }));
    openMediaViewer(media, 1);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const lightbox = document.querySelector('.media-lightbox');
    const mediaNavigation = {
      previous: Boolean(lightbox.querySelector('.media-lightbox-prev')),
      next: Boolean(lightbox.querySelector('.media-lightbox-next')),
      counter: lightbox.querySelector('footer small').textContent,
      previousEnabled: !lightbox.querySelector('.media-lightbox-prev').disabled,
      nextEnabled: !lightbox.querySelector('.media-lightbox-next').disabled,
    };
    closeMediaViewer();
    const sentAttachmentTurn = addMessage('user', '请结合附件继续处理。', [{ name: '需求说明.pdf', path: 'D:/Demo/需求说明.pdf', size: 1536 }]);
    const sentAttachmentStack = sentAttachmentTurn.article.querySelector('.user-message-stack');
    const sentAttachmentCard = sentAttachmentStack.querySelector('.user-message-file');
    const sentAttachmentPresentation = {
      shownAboveBubble: sentAttachmentStack.firstElementChild.classList.contains('user-message-files')
        && sentAttachmentStack.lastElementChild.classList.contains('user-bubble'),
      fileMetadataVisible: sentAttachmentCard.textContent.includes('需求说明.pdf') && sentAttachmentCard.textContent.includes('1.5 KB'),
      alignedWithBubble: getComputedStyle(sentAttachmentStack).alignItems === 'flex-end'
        && getComputedStyle(sentAttachmentStack.querySelector('.user-message-files')).justifyContent === 'flex-end',
      opensAsControl: sentAttachmentCard.tagName === 'BUTTON' && sentAttachmentCard.type === 'button',
    };
    sentAttachmentTurn.article.remove();
    newSession();
    elements.welcome.hidden = true;
    addMessage('user', '把聊天区的完整任务链改成阶段摘要，右侧继续保留详细进度。');
    const visualTurn = addMessage('assistant', '', [], { running: true });
    clearTimeout(visualTurn.thinkingTimer);
    showThinking(visualTurn);
    upsertStageReport(visualTurn, { messageId: 'visual:summary', text: '我会精简聊天区的信息层级，把完整执行记录留在右侧。' });
    recordWorkStep(visualTurn, { stepId: 'visual:edit', kind: 'edit', label: '调整进度展示', status: 'running' });
    upsertStageReport(visualTurn, { messageId: 'visual:update', text: '阶段摘要已经更新，正在检查折叠状态和最终结论。' });
    recordWorkStep(visualTurn, { stepId: 'visual:edit', kind: 'edit', label: '调整进度展示', status: 'running' });
    await new Promise((resolve) => setTimeout(resolve, 1200));
    queueForSession().push(
      { id: 'visual-queue-1', prompt: '把右侧预览的间距再调整得更紧凑一些', attachments: [], createdAt: new Date().toISOString() },
      { id: 'visual-queue-2', prompt: '完成后检查英文界面的主要菜单和设置项', attachments: [], createdAt: new Date().toISOString() },
    );
    renderMessageQueue();
    const bundledFonts = getComputedStyle(document.body).fontFamily.includes('Inter Variable') && getComputedStyle(document.body).fontFamily.includes('Noto Sans SC Variable');
    const fontsLoaded = document.fonts.check('16px "Inter Variable"', 'Studio') && document.fonts.check('16px "Noto Sans SC Variable"', '界面字体');
    const stageSummaryStyle = getComputedStyle(visualTurn.stageSummary.querySelector('.stage-summary-layer'));
    const stageReportStyle = getComputedStyle(visualTurn.stageReports.firstElementChild);
    const assistantResponseStyle = getComputedStyle(visualTurn.text);
    const compactStageStyle = {
      columnGap: stageSummaryStyle.columnGap,
      iconWidth: getComputedStyle(visualTurn.stageSummary.querySelector('.ui-icon')).width,
      taskReportUsesAssistantSize: stageReportStyle.fontSize === assistantResponseStyle.fontSize && stageReportStyle.fontSize === '12px',
      taskReportUsesAssistantColor: stageReportStyle.color === assistantResponseStyle.color,
    };
    const activityEventProbe = document.createElement('div');
    activityEventProbe.className = 'activity-event';
    activityEventProbe.innerHTML = '<span class="event-icon"><svg class="ui-icon"></svg></span><div class="event-body"><strong>Sample event</strong><p>Sample detail</p><time>10:30</time></div>';
    elements.activityTimeline.append(activityEventProbe);
    const fileRowProbe = document.createElement('div');
    fileRowProbe.className = 'tree-row';
    fileRowProbe.innerHTML = '<span class="tree-chevron"><svg class="ui-icon"></svg></span><span class="file-glyph"><svg class="ui-icon"></svg></span><span class="tree-name">sample.txt</span><span class="tree-size">1 KB</span>';
    document.querySelector('#filesPanel').append(fileRowProbe);
    const rightPanelScale = {
      activityHeading: getComputedStyle(document.querySelector('#activityPanel .panel-heading h3')).fontSize === '13px',
      activityStatus: getComputedStyle(elements.livePill).fontSize === '9.5px',
      activityText: getComputedStyle(activityEventProbe.querySelector('.event-body strong')).fontSize === '12px'
        && getComputedStyle(activityEventProbe.querySelector('.event-body p')).fontSize === '11px'
        && getComputedStyle(activityEventProbe.querySelector('.event-body time')).fontSize === '10px',
      activityIcon: getComputedStyle(activityEventProbe.querySelector('.event-icon')).width === '27px'
        && getComputedStyle(activityEventProbe.querySelector('.event-icon .ui-icon')).width === '15px',
      filesHeading: getComputedStyle(document.querySelector('#filesPanel .files-toolbar h3')).fontSize === '13px',
      filesText: getComputedStyle(fileRowProbe).fontSize === '11px'
        && getComputedStyle(fileRowProbe.querySelector('.tree-size')).fontSize === '10px',
      filesIcon: getComputedStyle(fileRowProbe.querySelector('.file-glyph .ui-icon')).width === '15px',
    };
    console.info('[ui-smoke] finishing');
    activityEventProbe.remove();
    fileRowProbe.remove();
    await window.studio.deleteSession(originalSession.id);
    const afterActivityDelete = await window.studio.getInitialState();
    activityPersistence.removedWithConversation = !afterActivityDelete.sessions.some((session) => session.id === originalSession.id);
    return { modeEnabledDuringRun, runningComposerAction, ringCount, ringAnimation, thinkingShimmerRemoved, compactConversationProgress, liveEditPreview, independentEditSummaries, commandCompletion, readCompletion, approvalPresentation, serialPermissionApprovals, deniedOperationGuard, supplementaryQuestions, approvalLifecycle, groupedStageSummaries, viewPreviewStages, filePanelSplit, activityPersistence, authenticNarrativeOnly, directFinalMarkdown, runningMessageQueue, englishSystemLanguage, settingsNavigationLayout, compactStageStyle, rightPanelScale, sentAttachmentPresentation, canCreateNewSession, taskCountBeforeNewSession, headerHeights, collapsedLeftPadding, collapsedRightPadding, welcomeState, textSelectionActions, inputPaste, mediaNavigation, bodyFont: getComputedStyle(document.body).fontSize, bundledFonts, fontsLoaded, welcomePhraseCount: Object.values(welcomePhraseSets['zh-CN']).flat().length === 19, namedWelcomePhraseCount: Object.values(namedWelcomePhraseSets['zh-CN']).flat().length === 15, activeVariant: state.studioVariant };
  })()`)

  const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  const screenshotPath = join(root, 'build', 'ui-regression.png')
  await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'))
  console.log(JSON.stringify({ status: 'passed', ...result, screenshotPath }, null, 2))
  }
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.close()
  child.kill()
}
