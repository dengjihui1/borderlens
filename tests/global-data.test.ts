import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readJson = async (relativePath: string) => JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));

interface PolicyFixture {
  id: string;
  outcome: string;
  maxStayDays: number | null;
  conditions: string[];
  documentType: string;
  destinationJurisdictionId?: string;
  destinationPolicyZoneId?: string;
}

test('联合国 M49 目录包含全球法域且代码唯一', async () => {
  const catalog = await readJson('../data/countries.un-m49.json');
  assert.equal(catalog.count, 248);
  assert.equal(new Set(catalog.territories.map((item: { iso2: string }) => item.iso2)).size, 248);
  assert.ok(catalog.territories.some((item: { iso2: string; nameEn: string }) => item.iso2 === 'JP' && item.nameEn === 'Japan'));
});

test('所有已验证种子规则都连接到已注册官方来源', async () => {
  const registry = await readJson('../data/official-source-registry.json');
  const policies = await readJson('../data/policies.seed.json');
  const sourceIds = new Set(registry.sources.map((source: { id: string }) => source.id));
  for (const rule of policies.rules) {
    assert.equal(rule.status, 'verified');
    assert.ok(rule.sourceIds.length > 0);
    assert.ok(rule.evidenceLocator.length > 0);
    assert.ok(rule.evidenceExcerpt.length > 0);
    assert.ok(rule.checkedAt <= rule.reviewDueAt);
    for (const sourceId of rule.sourceIds) assert.ok(sourceIds.has(sourceId), `${rule.id} references ${sourceId}`);
  }
});

test('来源发现状态不被误写成规则已验证', async () => {
  const registry = await readJson('../data/official-source-registry.json');
  const reachable = registry.sources.filter((source: { status: string }) => source.status === 'reachable');
  const blocked = registry.sources.filter((source: { status: string }) => source.status === 'blocked');
  assert.ok(reachable.length >= 4);
  assert.equal(blocked.length, 2);
});

test('申根作为政策区域建模，当前成员范围不混入爱尔兰与塞浦路斯', async () => {
  const zones = await readJson('../data/policy-zones.json');
  const schengen = zones.zones.find((zone: { id: string }) => zone.id === 'eu-schengen');
  assert.equal(schengen.members.length, 29);
  assert.ok(schengen.members.includes('bg'));
  assert.ok(schengen.members.includes('ro'));
  assert.ok(!schengen.members.includes('ie'));
  assert.ok(!schengen.members.includes('cy'));
});

test('新西兰规则区分港澳护照与中国护照的澳大利亚例外', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const byId = new Map<string, PolicyFixture>((policies.rules as PolicyFixture[]).map((rule) => [rule.id, rule]));
  assert.deepEqual(
    [byId.get('nz-hk-hksar-tourism-visa-waiver')!.outcome, byId.get('nz-hk-hksar-tourism-visa-waiver')!.maxStayDays],
    ['eta_required', 90],
  );
  assert.deepEqual(
    [byId.get('nz-mo-macao-sar-tourism-visa-waiver')!.outcome, byId.get('nz-mo-macao-sar-tourism-visa-waiver')!.maxStayDays],
    ['eta_required', 90],
  );
  assert.equal(byId.get('nz-cn-prc-ordinary-tourism-exception-review')!.outcome, 'manual_review');
});

test('申根短期规则保留 90/180 与护照类型边界', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const rules = policies.rules.filter((rule: { destinationPolicyZoneId?: string }) => rule.destinationPolicyZoneId === 'eu-schengen');
  assert.equal(rules.length, 3);
  assert.equal(rules.find((rule: { documentType: string }) => rule.documentType === 'ordinary_passport').outcome, 'visa_required');
  for (const documentType of ['hksar_passport', 'macao_sar_passport']) {
    const rule = rules.find((item: { documentType: string }) => item.documentType === documentType);
    assert.equal(rule.outcome, 'visa_free');
    assert.equal(rule.maxStayDays, 90);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('180')));
  }
});

test('新加坡普通护照免签不能被身份书或旅行证继承', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const singapore = policies.rules.filter((rule: { destinationJurisdictionId?: string }) => rule.destinationJurisdictionId === 'sg');
  for (const documentType of ['ordinary_passport', 'hksar_passport', 'macao_sar_passport']) {
    const rule = singapore.find((item: { documentType: string }) => item.documentType === documentType);
    assert.equal(rule.outcome, 'visa_free');
    assert.equal(rule.maxStayDays, 30);
  }
  assert.equal(singapore.find((rule: { documentType: string }) => rule.documentType === 'hksar_document_of_identity').outcome, 'visa_required');
  assert.equal(singapore.find((rule: { documentType: string }) => rule.documentType === 'macao_sar_travel_permit').outcome, 'visa_required');
});

test('澳大利亚与英国规则保留电子许可和普通签证差异', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const byId = new Map<string, PolicyFixture>((policies.rules as PolicyFixture[]).map((rule) => [rule.id, rule]));
  assert.equal(byId.get('au-hk-hksar-tourism-eta-601')!.outcome, 'eta_required');
  assert.equal(byId.get('au-cn-prc-ordinary-tourism-visa-route')!.outcome, 'visa_required');
  assert.equal(byId.get('gb-cn-prc-ordinary-tourism')!.outcome, 'visa_required');
  assert.equal(byId.get('gb-hk-hksar-tourism')!.outcome, 'eta_required');
  assert.equal(byId.get('gb-mo-macao-sar-tourism')!.outcome, 'eta_required');
});

test('韩国规则区分港澳特区护照、普通护照与香港签证身份书', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const byId = new Map<string, PolicyFixture>((policies.rules as PolicyFixture[]).map((rule) => [rule.id, rule]));
  assert.deepEqual([byId.get('kr-hk-hksar-tourism-keta')!.outcome, byId.get('kr-hk-hksar-tourism-keta')!.maxStayDays], ['eta_required', 90]);
  assert.deepEqual([byId.get('kr-mo-macao-sar-tourism-keta')!.outcome, byId.get('kr-mo-macao-sar-tourism-keta')!.maxStayDays], ['eta_required', 90]);
  assert.equal(byId.get('kr-cn-prc-ordinary-tourism')!.outcome, 'visa_required');
  assert.equal(byId.get('kr-hk-document-of-identity-tourism')!.outcome, 'visa_required');
});

test('阿联酋规则保留落地签和预先签证差异', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const byId = new Map<string, PolicyFixture>((policies.rules as PolicyFixture[]).map((rule) => [rule.id, rule]));
  assert.deepEqual([byId.get('ae-cn-prc-ordinary-tourism-voa')!.outcome, byId.get('ae-cn-prc-ordinary-tourism-voa')!.maxStayDays], ['visa_on_arrival', 30]);
  assert.deepEqual([byId.get('ae-hk-hksar-tourism-voa')!.outcome, byId.get('ae-hk-hksar-tourism-voa')!.maxStayDays], ['visa_on_arrival', 30]);
  assert.equal(byId.get('ae-mo-macao-sar-tourism-advance-visa')!.outcome, 'visa_required');
});

test('中国内地非中国籍港澳永久居民通行证规则限制为短期用途', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const permitRules = policies.rules.filter((rule: PolicyFixture) => rule.documentType === 'mainland_travel_permit_non_chinese');
  assert.equal(permitRules.length, 2);
  for (const rule of permitRules) {
    assert.equal(rule.outcome, 'visa_free');
    assert.equal(rule.maxStayDays, 90);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('不得') && condition.includes('工作')));
  }
});

test('美国 VWP 规则不把中国及港澳证件误判为 ESTA', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const unitedStates = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'us');
  assert.equal(unitedStates.length, 3);
  for (const rule of unitedStates) assert.equal(rule.outcome, 'visa_required');
});

test('加拿大规则按航空、陆路与海路区分香港特区护照', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const canada = policies.rules.filter((rule: PolicyFixture & { borderMode: string }) => rule.destinationJurisdictionId === 'ca');
  assert.equal(canada.find((rule: PolicyFixture) => rule.documentType === 'ordinary_passport')!.outcome, 'visa_required');
  assert.equal(canada.find((rule: PolicyFixture) => rule.documentType === 'macao_sar_passport')!.outcome, 'visa_required');
  const hksar = canada.filter((rule: PolicyFixture) => rule.documentType === 'hksar_passport');
  assert.equal(hksar.find((rule: { borderMode: string }) => rule.borderMode === 'air')!.outcome, 'eta_required');
  assert.equal(hksar.find((rule: { borderMode: string }) => rule.borderMode === 'land')!.outcome, 'visa_free');
  assert.equal(hksar.find((rule: { borderMode: string }) => rule.borderMode === 'sea')!.outcome, 'visa_free');
});
