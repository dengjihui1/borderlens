import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { buildPolicyCatalog, type CatalogRule } from '../lib/policy-catalog.ts';
import { evaluateCatalogJourney, validateCatalogJourney, type CatalogJourney, type JourneyLeg } from '../lib/journey-catalog.ts';

const now = new Date('2026-10-21T12:00:00Z');
const sources = [{ id: 'official', title: 'Official', url: 'https://example.gov/', status: 'verified' }];
const rule: CatalogRule = {
  id: 'jp-hk-test', destinationJurisdictionId: 'jp', documentIssuerJurisdictionId: 'hk', documentType: 'hksar_passport',
  purpose: 'tourism', borderMode: 'any', status: 'verified', outcome: 'visa_free', checkedAt: '2026-10-21', reviewDueAt: '2026-11-20',
  maxStayDays: 90, conditions: ['OFFICIAL_CONDITION'], sourceIds: ['official'], evidenceLocator: 'Official table', evidenceExcerpt: 'OFFICIAL_EXCERPT',
};
const options = { destinations: ['hk', 'mo', 'cn', 'jp', 'gb', 'fr', 'eu-schengen'], documents: ['hk:hksar_passport', 'cn:ordinary_passport', 'hk:hksar_document_of_identity', 'mo:home_return_permit'] };
const leg: JourneyLeg = { destination: 'jp', document: 'hk:hksar_passport', purpose: 'tourism', mode: 'air', entry: 'entry', basis: 'visit', date: '2026-10-22', port: '' };
const input: CatalogJourney = { origin: 'hk', documents: ['hk:hksar_passport'], documentsValid: true, legs: [leg] };
const run = (value: unknown = input, rules: CatalogRule[] = [rule], at = now) => evaluateCatalogJourney(value, buildPolicyCatalog(rules, sources, now), options, at);

test('完整库逐段匹配但不把当前免签规则当全程 READY', () => {
  const result = run().result!;
  assert.equal(result.currentLegs, 1);
  assert.equal(result.steps[0].policies[0].conclusion!.label, '免签路线');
  assert.equal(result.status, 'review');
  assert.match(result.steps[0].tasks.join(' '), /出境要求/);
});

test('逐段证件明确匹配，身份证明或另一份护照不能继承待遇', () => {
  for (const key of ['cn:ordinary_passport', 'hk:hksar_document_of_identity']) {
    const result = run({ ...input, documents: [key], legs: [{ ...leg, document: key }] }).result!;
    assert.equal(result.currentLegs, 0);
    assert.equal(result.steps[0].policies.length, 0);
  }
  assert.equal(run({ ...input, documents: ['cn:ordinary_passport'] }).result, null);
});

test('空侧和未知入境节点不套用旅游免签，后续段仍独立查询', () => {
  for (const entry of ['airside', 'unknown']) {
    const result = run({ ...input, legs: [{ ...leg, destination: 'hk', entry }, leg], origin: 'gb' }).result!;
    assert.equal(result.steps[0].policies.length, 0);
    assert.equal(result.steps[1].policies.length, 1);
    assert.equal(result.steps[1].from, 'hk');
    assert.equal(result.status, 'review');
  }
});

test('居民和公民返境不冒用访客签证或电子许可，返程显式保留', () => {
  for (const basis of ['residence', 'citizen']) {
    const result = run({ ...input, origin: 'gb', legs: [leg, { ...leg, destination: 'gb', basis }] }, [rule, { ...rule, id: 'gb', destinationJurisdictionId: 'gb', outcome: 'eta_required' }]).result!;
    assert.equal(result.steps.length, 2);
    assert.equal(result.steps[1].policies.length, 0);
    assert.match(result.steps[1].reason, /不套用访客/);
  }
});

test('过期、draft 和缺证据记录不会把历史产品或摘录带入行程结果', () => {
  for (const fixture of [{ ...rule, reviewDueAt: '2026-10-20' }, { ...rule, status: 'draft' }, { ...rule, sourceIds: ['missing'] }]) {
    const result = run(input, [{ ...fixture, visaProductName: 'SECRET_OLD_PRODUCT' }]).result!;
    assert.equal(result.steps[0].policies[0].conclusion, null);
    assert.equal(result.steps[0].policies[0].evidence, null);
    assert.doesNotMatch(JSON.stringify(result), /SECRET_OLD_PRODUCT|OFFICIAL_CONDITION|OFFICIAL_EXCERPT/);
  }
});

test('超出复核窗口的计划日期不显示当前结论，但保留官方入口', () => {
  const result = run({ ...input, legs: [{ ...leg, date: '2026-11-21' }] }).result!;
  const policy = result.steps[0].policies[0];
  assert.equal(policy.conclusion, null);
  assert.equal(policy.evidence, null);
  assert.equal(policy.sources[0].url, sources[0].url);
  assert.match(policy.journeyReviewNote!, /不能覆盖计划抵达日期/);
  assert.equal(result.steps[0].status, 'review');
});

test('临时政策按具体时区截止，抵达日按 UTC 日终保守处理', () => {
  const temporary = { ...rule, effectiveUntil: '2026-10-22T23:59:59+09:00' };
  assert.equal(run(input, [temporary]).result!.currentLegs, 0);
  assert.equal(run({ ...input, legs: [{ ...leg, date: '2026-10-21' }] }, [temporary]).result!.currentLegs, 1);
});

test('打开的页面跨过复核截止后重新计算，不继续用旧版序列化结论', () => {
  const entries = buildPolicyCatalog([rule], sources, now);
  const result = evaluateCatalogJourney({ ...input, legs: [{ ...leg, date: '2026-11-21' }] }, entries, options, new Date('2026-11-21T01:00:00Z')).result!;
  assert.equal(result.steps[0].policies[0].conclusion, null);
  assert.equal(result.steps[0].policies[0].evidence, null);
});

test('manual_review 的当前条件可读，但不产生确定结论', () => {
  const result = run(input, [{ ...rule, outcome: 'manual_review' }]).result!;
  assert.equal(result.steps[0].status, 'review');
  assert.equal(result.steps[0].policies[0].conclusion, null);
  assert.deepEqual(result.steps[0].policies[0].evidence?.conditions, rule.conditions);
});

test('多个适用规则结论冲突时不自动选择较宽松待遇', () => {
  const result = run(input, [rule, { ...rule, id: 'conflicting', outcome: 'visa_required' }]).result!;
  assert.equal(result.steps[0].status, 'review');
  assert.match(result.steps[0].reason, /交叠且结论不同/);
  assert.ok(result.steps[0].policies.every((entry) => entry.conclusion === null && entry.evidence === null));
});

test('用途、交通方式、具体国家与政策区不被放宽匹配', () => {
  assert.equal(run({ ...input, legs: [{ ...leg, purpose: 'business' }] }).result!.currentLegs, 0);
  assert.equal(run(input, [{ ...rule, borderMode: 'land' }]).result!.currentLegs, 0);
  const zone = { ...rule, destinationJurisdictionId: undefined, destinationPolicyZoneId: 'eu-schengen' };
  assert.equal(run({ ...input, legs: [{ ...leg, destination: 'fr' }] }, [zone]).result!.currentLegs, 0);
  assert.equal(run({ ...input, legs: [{ ...leg, destination: 'eu-schengen' }] }, [zone]).result!.currentLegs, 1);
});

test('未确认全程有效或未知口岸不会变为已准备，备注不是自动口岸资格', () => {
  const result = run({ ...input, documentsValid: false, legs: [{ ...leg, port: 'Example Airport' }] }).result!;
  assert.equal(result.status, 'review');
  assert.match(result.steps[0].tasks.join(' '), /尚未确认所有证件/);
  assert.match(result.steps[0].tasks.join(' '), /系统尚未验证该口岸/);
});

test('无效日期、倒序、空/超长路线、同站和非法字段一律拒绝', () => {
  const invalid: unknown[] = [null, {}, { ...input, origin: 'unknown' }, { ...input, origin: 'eu-schengen' },
    { ...input, documents: [] }, { ...input, documents: ['hk:hksar_passport', 'hk:hksar_passport'] },
    { ...input, documentsValid: 'true' }, { ...input, legs: [] }, { ...input, legs: Array(9).fill(leg) },
    { ...input, legs: [{ ...leg, date: '2026-02-30' }] }, { ...input, legs: [{ ...leg, date: '2026-10-20' }] },
    { ...input, legs: [{ ...leg, destination: 'hk' }] }, { ...input, extra: true },
    { ...input, legs: [{ ...leg, purpose: ['tourism'] }] }, { ...input, legs: [{ ...leg, mode: ['air'] }] },
    { ...input, legs: [{ ...leg, entry: ['entry'] }] }, { ...input, legs: [{ ...leg, basis: ['visit'] }] },
    { ...input, legs: [{ ...leg, mode: 'sea', entry: 'airside' }] }, { ...input, legs: [{ ...leg, port: 'a'.repeat(81) }] },
    { ...input, legs: [{ ...leg, port: 'line\nbreak' }] }, { ...input, legs: [{ ...leg, destination: 'jp', unexpected: true }] },
    { ...input, legs: [leg, { ...leg, destination: 'gb', date: '2026-10-21' }] },
  ];
  for (const fixture of invalid) {
    const evaluation = run(fixture);
    assert.ok(evaluation.errors.length > 0, JSON.stringify(fixture));
    assert.equal(evaluation.result, null);
  }
  assert.ok(validateCatalogJourney(input, options, new Date('invalid')).length);
});

test('日历月和年度累计照原口径显示，不按后续节点推算个人停留许可', () => {
  const result = run(input, [{ ...rule, maxStayDays: null, maxStayMonths: 3, maxStayDaysPerVisaYear: 150 }]).result!;
  const stay = result.steps[0].policies[0].conclusion!.stay.join(' ');
  assert.match(stay, /3 个日历月/);
  assert.match(stay, /150 天，不是单次许可/);
  assert.doesNotMatch(stay, /90 天/);
});

test('真实库支持多证件逐段与回乡证 manual review，无需维护第二套路线规则', async () => {
  const readJson = async (path: string) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
  const [policies, registry] = await Promise.all([readJson('../data/policies.seed.json'), readJson('../data/official-source-registry.json')]);
  const entries = buildPolicyCatalog(policies.rules, registry.sources, now);
  const result = evaluateCatalogJourney({ ...input, documents: ['hk:hksar_passport', 'mo:home_return_permit'], legs: [leg, { ...leg, destination: 'cn', document: 'mo:home_return_permit', purpose: 'other', mode: 'land' }] }, entries, options, now).result!;
  assert.equal(result.steps[0].policies[0].id, 'jp-hk-hksar-tourism-short-stay');
  assert.equal(result.steps[1].policies[0].reason, 'conditional_review');
  assert.equal(result.steps[1].status, 'review');
  assert.equal(result.status, 'review');
});
