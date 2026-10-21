import assert from 'node:assert/strict';
import test from 'node:test';
import { isPolicyRuleCurrent, summarizePolicyBatch } from '../lib/policy-freshness.ts';

const now = new Date('2026-10-21T12:00:00Z');
const current = { status: 'verified', reviewDueAt: '2026-11-20' };
const stale = { status: 'verified', reviewDueAt: '2026-10-20' };
const historicalConclusion = '历史确定结论：免签 90 天';

test('当前有效性仅接受 verified 且未到期的规则，截止日按 UTC 当日结束', () => {
  assert.equal(isPolicyRuleCurrent(current, now), true);
  assert.equal(isPolicyRuleCurrent(stale, now), false);
  assert.equal(isPolicyRuleCurrent({ ...current, status: 'draft' }, now), false);
  assert.equal(isPolicyRuleCurrent({ ...current, reviewDueAt: 'invalid' }, now), false);
  const dueToday = { ...current, reviewDueAt: '2026-10-21' };
  assert.equal(isPolicyRuleCurrent(dueToday, new Date('2026-10-21T23:59:59Z')), true);
  assert.equal(isPolicyRuleCurrent(dueToday, new Date('2026-10-22T00:00:00Z')), false);
});

test('全部有效时覆盖率卡片才显示已核验结论', () => {
  assert.deepEqual(summarizePolicyBatch([current], historicalConclusion, now), {
    verifiedRuleCount: 1, reviewRuleCount: 0, note: historicalConclusion,
  });
});

test('过期或混合批次不再展示覆盖全部证件的旧确定结论', () => {
  for (const rules of [[stale], [current, stale], [current, { ...current, status: 'draft' }]]) {
    const summary = summarizePolicyBatch(rules, historicalConclusion, now);
    assert.equal(summary.reviewRuleCount, 1);
    assert.equal(summary.verifiedRuleCount, rules.length - 1);
    assert.match(summary.note, /已过期或待复核/);
    assert.ok(!summary.note.includes(historicalConclusion));
  }
});

test('空批次不会因为没有过期项而展示确定结论', () => {
  const summary = summarizePolicyBatch([], historicalConclusion, now);
  assert.equal(summary.verifiedRuleCount, 0);
  assert.match(summary.note, /暂不提供当前签证结论/);
  assert.ok(!summary.note.includes(historicalConclusion));
});
