import { strict as assert } from 'node:assert'
import { approvalStrategyForMode, isPermissionDenialMessage, isPermissionMode, permissionModes } from '../approval-policy.mjs'

assert.deepEqual(permissionModes, ['plan', 'default', 'acceptEdits', 'bypassPermissions'])
for (const mode of permissionModes) assert.equal(isPermissionMode(mode), true)
assert.equal(isPermissionMode('unknown'), false)

assert.equal(approvalStrategyForMode('plan', 'Read'), 'blocked')
assert.equal(approvalStrategyForMode('plan', 'Write'), 'blocked')
assert.equal(approvalStrategyForMode('default', 'Write'), 'manual')
assert.equal(approvalStrategyForMode('default', 'Bash'), 'manual')
assert.equal(approvalStrategyForMode('acceptEdits', 'Write'), 'auto')
assert.equal(approvalStrategyForMode('acceptEdits', 'Edit'), 'auto')
assert.equal(approvalStrategyForMode('acceptEdits', 'NotebookEdit'), 'auto')
assert.equal(approvalStrategyForMode('acceptEdits', 'Bash'), 'manual')
assert.equal(approvalStrategyForMode('bypassPermissions', 'Write'), 'auto')
assert.equal(approvalStrategyForMode('bypassPermissions', 'Bash'), 'auto')

for (const message of [
  'This command requires approval',
  "The agent requested permissions to write to index.html but you haven't granted it yet.",
  'This Bash command contains multiple operations. The following parts require approval.',
  'Output redirection to this path was blocked by the current policy.',
  'The operation was blocked because it is outside the allowed working directories.',
]) assert.equal(isPermissionDenialMessage(message), true, message)

for (const message of [
  'Command contains brace expansion that could alter command parsing',
  'Command contains $() command substitution',
  'Exit code 127',
]) assert.equal(isPermissionDenialMessage(message), false, message)

console.log(JSON.stringify({ status: 'passed', permissionModes }, null, 2))
