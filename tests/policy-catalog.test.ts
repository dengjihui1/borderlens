import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { buildPolicyCatalog, emptyFilters, filterPolicyCatalog, getCatalogPage, getReviewQueue, parseCatalogFilters, type CatalogRule } from '../lib/policy-catalog.ts';

const now = new Date('2026-10-21T12:00:00Z');
const rule: CatalogRule = {
  id: 'test-hk', destinationJurisdictionId: 'jp', documentIssuerJurisdictionId: 'hk', documentType: 'hksar_passport',
  purpose: 'tourism', borderMode: 'any', status: 'verified', outcome: 'visa_free', checkedAt: '2026-10-21', reviewDueAt: '2026-11-20',
  maxStayDays: 90, conditions: ['仅限测试范围'], sourceIds: ['official'], evidenceLocator: 'Official table', evidenceExcerpt: 'Official evidence',
};
const sources = [{ id: 'official', title: 'Official', url: 'https://example.gov/', status: 'verified' }];

test('过期和 draft 记录不输出历史结论、产品、期限或证据摘录', () => {
  for (const fixture of [{ ...rule, reviewDueAt: '2026-10-20' }, { ...rule, status: 'draft' }]) {
    const [entry] = buildPolicyCatalog([{ ...fixture, visaProductName: 'HISTORICAL_PRODUCT' }], sources, now);
    assert.equal(entry.status, 'review');
    assert.equal(entry.conclusion, null);
    assert.equal(entry.evidence, null);
    assert.ok(!JSON.stringify(entry).includes('HISTORICAL_PRODUCT'));
    assert.equal(entry.sources[0].url, sources[0].url);
  }
});

test('当前 manual_review 仍进复核队列，不被 verified 状态误升为确定结论', () => {
  const [entry] = buildPolicyCatalog([{ ...rule, outcome: 'manual_review' }], sources, now);
  assert.equal(entry.evidenceCurrent, true);
  assert.equal(entry.reason, 'conditional_review');
  assert.equal(entry.conclusion, null);
  assert.deepEqual(entry.evidence?.conditions, rule.conditions);
  assert.equal(getReviewQueue([entry]).length, 1);
});

test('缺失来源、未验证来源、未知 outcome 与缺失摘录均 fail closed', () => {
  for (const [fixture, registry] of [
    [{ ...rule, sourceIds: ['missing'] }, sources], [rule, [{ ...sources[0], status: 'reachable' }]],
    [{ ...rule, outcome: 'unknown' }, sources], [{ ...rule, evidenceExcerpt: '' }, sources],
  ] as Array<[CatalogRule, typeof sources]>) {
    assert.equal(buildPolicyCatalog([fixture], [...registry], now)[0].conclusion, null);
  }
});

test('交通方式筛选保留 any 规则但不把陆路例外套用至航空', () => {
  const entries = buildPolicyCatalog([rule, { ...rule, id: 'land', borderMode: 'land' }], sources, now);
  assert.deepEqual(filterPolicyCatalog(entries, { ...emptyFilters, mode: 'air' }).map((entry) => entry.id), ['test-hk']);
  assert.equal(filterPolicyCatalog(entries, { ...emptyFilters, mode: 'land' }).length, 2);
});

test('证件签发地和类型同时匹配，不继承身份或其他目的待遇', () => {
  const entries = buildPolicyCatalog([rule, { ...rule, id: 'doi', documentType: 'hksar_document_of_identity' }], sources, now);
  assert.equal(filterPolicyCatalog(entries, { ...emptyFilters, document: 'hk:hksar_document_of_identity' })[0].id, 'doi');
  assert.equal(filterPolicyCatalog(entries, { ...emptyFilters, document: 'mo:hksar_passport' }).length, 0);
  assert.equal(filterPolicyCatalog(entries, { ...emptyFilters, purpose: 'study-work' }).length, 0);
});

test('申根不凭过期成员映射自动拓展到法国等单一目的地', () => {
  const entries = buildPolicyCatalog([{ ...rule, destinationJurisdictionId: undefined, destinationPolicyZoneId: 'eu-schengen' }], sources, now);
  assert.equal(filterPolicyCatalog(entries, { ...emptyFilters, destination: 'fr' }).length, 0);
  assert.equal(filterPolicyCatalog(entries, { ...emptyFilters, destination: 'eu-schengen' }).length, 1);
});

test('无效或重复筛选参数必须报错，不能悄悄放宽查询', () => {
  for (const params of [{ document: 'bad' }, { document: ['hk:hksar_passport', 'bad'] }, { mode: 'rocket' }]) {
    assert.ok(parseCatalogFilters(params, ['hk:hksar_passport'], ['jp']).errors.length > 0);
  }
  assert.deepEqual(parseCatalogFilters({ destination: 'jp' }, ['hk:hksar_passport'], ['jp']).filters, { ...emptyFilters, destination: 'jp' });
});

test('日历月与签证年度累计不伪装成单次天数', () => {
  const entries = buildPolicyCatalog([
    { ...rule, maxStayDays: null, maxStayMonths: 3 },
    { ...rule, id: 'annual', maxStayDays: null, maxStayDaysPerVisaYear: 150 },
  ], sources, now);
  assert.match(entries[0].conclusion!.stay.join(' '), /3 个日历月/);
  assert.ok(!entries[0].conclusion!.stay.join(' ').includes('90'));
  assert.match(entries[1].conclusion!.stay.join(' '), /不是单次许可/);
});

test('复核队列按证据问题、到期、个体条件排序且稳定', () => {
  const entries = buildPolicyCatalog([
    { ...rule, id: 'manual', outcome: 'manual_review' }, { ...rule, id: 'expired', reviewDueAt: '2026-10-20' },
    { ...rule, id: 'draft', status: 'draft' }, rule,
  ], sources, now);
  assert.deepEqual(getReviewQueue(entries).map((entry) => entry.id), ['draft', 'expired', 'manual']);
});

test('真实库 143 条全部可查；77 证据有效不等于 77 个自动结论', async () => {
  const readJson = async (path: string) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
  const [policies, registry] = await Promise.all([readJson('../data/policies.seed.json'), readJson('../data/official-source-registry.json')]);
  const entries = buildPolicyCatalog(policies.rules, registry.sources, now);
  assert.equal(entries.length, 143);
  assert.equal(entries.filter((entry) => entry.evidenceCurrent).length, 77);
  assert.equal(entries.filter((entry) => entry.conclusion).length, 76);
  assert.equal(getReviewQueue(entries).length, 67);
  assert.equal(entries.find((entry) => entry.id === 'bd-hk-hksar-tourism-review')!.evidence, null);
  assert.equal(buildPolicyCatalog(policies.rules, registry.sources, new Date('2026-11-21T00:00:00Z')).filter((entry) => entry.conclusion).length, 0);
});

test('分页覆盖全部记录，不重复、不丢失，错误页码不退回宽泛结果', () => {
  const entries = buildPolicyCatalog(Array.from({ length: 25 }, (_, index) => ({ ...rule, id: `row-${index}` })), sources, now);
  const pages = ['1', '2', '3'].map((page) => getCatalogPage(entries, page));
  assert.deepEqual(pages.map((page) => page.entries.length), [12, 12, 1]);
  assert.equal(new Set(pages.flatMap((page) => page.entries.map((entry) => entry.id))).size, 25);
  for (const page of ['0', '-1', '4', '1.5', 'Infinity', ['1', '2']]) {
    assert.equal(getCatalogPage(entries, page).invalid, true);
    assert.deepEqual(getCatalogPage(entries, page).entries, []);
  }
});
