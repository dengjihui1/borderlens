import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateJourney, isRuleDataStale, type JourneyInput } from '../lib/rules.ts';

const base: JourneyInput = {
  document: 'hksar-passport', origin: 'hong-kong', transit: '', destination: 'japan',
  purpose: 'tourism', transitEntry: 'no', extras: ['hk-id'], documentsValid: true, includeReturn: false,
};

test('HKSAR Passport 前往日本短期旅游进入受控免签分支', () => {
  const result = evaluateJourney(base, new Date('2026-09-08'));
  assert.equal(result.status, 'ready');
  assert.match(result.steps[0].summary, /免签/);
  assert.ok(result.steps[0].sources.some((source) => source.url.includes('mofa.go.jp')));
});

test('中国普通护照不能继承港澳身份的日本免签待遇', () => {
  const result = evaluateJourney({ ...base, document: 'prc-passport' });
  assert.equal(result.status, 'action');
  assert.match(result.steps[0].summary, /不能继承/);
});

test('香港居民进入内地缺少回乡证时给出明确动作', () => {
  const result = evaluateJourney({ ...base, destination: 'mainland-china', extras: ['hk-id'] });
  assert.equal(result.status, 'action');
  assert.ok(result.steps[0].actions.some((item) => item.includes('回乡证')));
});

test('澳门居民证件齐全时仍保留口岸级人工核验', () => {
  const result = evaluateJourney({ ...base, document: 'macao-passport', origin: 'macao', destination: 'mainland-china', extras: ['macao-id', 'home-return-permit'] });
  assert.equal(result.status, 'review');
  assert.match(result.steps[0].summary, /口岸/);
});

test('转机是否入境未知会阻止 clean result', () => {
  const result = evaluateJourney({ ...base, transit: 'hong-kong', origin: 'united-kingdom', transitEntry: 'unknown' });
  assert.equal(result.status, 'review');
  assert.match(result.steps[0].summary, /尚未确认/);
});

test('规则核验超过 30 天会标记 stale', () => {
  assert.equal(isRuleDataStale('2026-09-08', new Date('2026-10-09T00:00:01Z')), true);
  assert.equal(isRuleDataStale('2026-09-08', new Date('2026-10-08T00:00:00Z')), false);
});

test('未确认全程有效时任何分支都不能降级成 review 或 ready', () => {
  const result = evaluateJourney({ ...base, origin: 'macao', destination: 'mainland-china', extras: ['macao-id', 'home-return-permit'], documentsValid: false });
  assert.equal(result.status, 'action');
  assert.equal(result.steps[0].status, 'action');
});
