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
  assert.equal(isPolicyRuleCurrent(dueToday, new Date('2026-10-21T23:59:59.999Z')), true);
  assert.equal(isPolicyRuleCurrent(dueToday, new Date('2026-10-22T00:00:00Z')), false);
});

test('临时政策按韩国时区到期，即使复核期限更晚也不能继续使用', () => {
  const temporary = { ...current, reviewDueAt: '2027-01-15', effectiveUntil: '2026-12-31T23:59:59.999+09:00' };
  assert.equal(isPolicyRuleCurrent(temporary, new Date('2026-12-31T14:59:59.999Z')), true);
  assert.equal(isPolicyRuleCurrent(temporary, new Date('2026-12-31T15:00:00Z')), false);
  assert.equal(isPolicyRuleCurrent({ ...temporary, effectiveUntil: 'invalid' }, now), false);
  assert.equal(isPolicyRuleCurrent({ ...temporary, reviewDueAt: '2026-10-20' }, now), false);
});

test('同一批次在后续请求时重新计算，临时豁免到期后隐藏确定结论', () => {
  const temporary = { ...current, reviewDueAt: '2027-01-15', effectiveUntil: '2026-12-31T23:59:59.999+09:00' };
  const before = summarizePolicyBatch([temporary], '临时免 K-ETA', new Date('2026-12-31T14:59:59Z'));
  const after = summarizePolicyBatch([temporary], '临时免 K-ETA', new Date('2026-12-31T15:00:00Z'));
  assert.equal(before.verifiedRuleCount, 1);
  assert.equal(after.verifiedRuleCount, 0);
  assert.match(after.note, /已过期或待复核/);
  assert.ok(!after.note.includes('临时免 K-ETA'));
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

test('未来核验日期、无效日历日期和缺少时区的临时截止均不能成为当前结论', () => {
  assert.equal(isPolicyRuleCurrent({ ...current, checkedAt: '2026-10-22' }, now), false);
  assert.equal(isPolicyRuleCurrent({ ...current, checkedAt: '2026-02-30' }, now), false);
  assert.equal(isPolicyRuleCurrent({ ...current, reviewDueAt: '2026-11-31' }, now), false);
  assert.equal(isPolicyRuleCurrent({ ...current, effectiveUntil: '2026-12-31T23:59:59' }, now), false);
});
