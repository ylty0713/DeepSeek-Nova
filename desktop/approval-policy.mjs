export const permissionModes = Object.freeze(['plan', 'default', 'acceptEdits', 'bypassPermissions'])

const editTools = new Set(['write', 'edit', 'multiedit', 'notebookedit'])

export function isPermissionMode(value) {
  return permissionModes.includes(value)
}

export function approvalStrategyForMode(mode, toolName = '') {
  if (mode === 'plan') return 'blocked'
  if (mode === 'bypassPermissions') return 'auto'
  if (mode === 'acceptEdits' && editTools.has(String(toolName).toLowerCase())) return 'auto'
  return 'manual'
}

export function isPermissionDenialMessage(message = '') {
  return /(?:permission\s+(?:denied|required)|approval\s+(?:required|denied)|requires?\s+(?:user\s+)?approval|requires?\s+approval|requested\s+permissions?[\s\S]{0,240}?(?:haven['’]?t|have\s+not)\s+granted|(?:parts?|operations?)\s+require\s+approval|(?:command|operation|output\s+redirection)[\s\S]{0,160}?was\s+blocked|blocked[\s\S]{0,180}?allowed\s+working\s+directories|权限(?:不足|被拒绝|受限)|需要(?:用户)?(?:批准|审批|授权)|未获(?:批准|授权))/i.test(String(message))
}
