import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readJson = async (relativePath: string) => JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));

interface PolicyFixture {
  id: string;
  outcome: string;
  status: string;
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

test('所有种子规则都可追溯，已验证规则至少连接一个已验证官方来源', async () => {
  const registry = await readJson('../data/official-source-registry.json');
  const policies = await readJson('../data/policies.seed.json');
  const sourceIds = new Set(registry.sources.map((source: { id: string }) => source.id));
  const verifiedSourceIds = new Set(registry.sources.filter((source: { status: string }) => source.status === 'verified').map((source: { id: string }) => source.id));
  for (const rule of policies.rules) {
    assert.ok(rule.sourceIds.length > 0);
    assert.ok(rule.evidenceLocator.length > 0);
    assert.ok(rule.evidenceExcerpt.length > 0);
    assert.ok(rule.checkedAt <= rule.reviewDueAt);
    for (const sourceId of rule.sourceIds) assert.ok(sourceIds.has(sourceId), `${rule.id} references ${sourceId}`);
    if (rule.status === 'verified') assert.ok(rule.sourceIds.some((sourceId: string) => verifiedSourceIds.has(sourceId)), `${rule.id} has no verified source`);
  }
});

test('来源发现状态不被误写成规则已验证', async () => {
  const registry = await readJson('../data/official-source-registry.json');
  const reachable = registry.sources.filter((source: { status: string }) => source.status === 'reachable');
  const blocked = registry.sources.filter((source: { status: string }) => source.status === 'blocked');
  assert.ok(reachable.length >= 8);
  assert.equal(blocked.length, 5);
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

test('泰国规则把 60 天免签与 TDAC 要求同时保留', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const thailand = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'th');
  assert.equal(thailand.length, 3);
  for (const rule of thailand) {
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'visa_free', 60]);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('TDAC') || condition.includes('Thailand Digital Arrival Card')));
  }
});

test('马来西亚按港澳证件类型拆分停留期与签证要求', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const byId = new Map<string, PolicyFixture>((policies.rules as PolicyFixture[]).map((rule) => [rule.id, rule]));
  assert.deepEqual([byId.get('my-cn-prc-ordinary-tourism-visa-exemption')!.outcome, byId.get('my-cn-prc-ordinary-tourism-visa-exemption')!.maxStayDays], ['visa_free', 30]);
  assert.deepEqual([byId.get('my-hk-hksar-tourism-visa-exemption')!.outcome, byId.get('my-hk-hksar-tourism-visa-exemption')!.maxStayDays], ['visa_free', 90]);
  assert.deepEqual([byId.get('my-mo-macao-sar-tourism-visa-exemption')!.outcome, byId.get('my-mo-macao-sar-tourism-visa-exemption')!.maxStayDays], ['visa_free', 30]);
  assert.equal(byId.get('my-hk-document-of-identity-tourism')!.outcome, 'visa_required');
  assert.deepEqual([byId.get('my-mo-macao-travel-permit-tourism')!.outcome, byId.get('my-mo-macao-travel-permit-tourism')!.maxStayDays], ['visa_free', 14]);
});

test('印度尼西亚区分中国普通护照 B1 落地签与港澳 A1 免签', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const byId = new Map<string, PolicyFixture>((policies.rules as PolicyFixture[]).map((rule) => [rule.id, rule]));
  assert.deepEqual([byId.get('id-cn-prc-ordinary-tourism-b1-voa')!.outcome, byId.get('id-cn-prc-ordinary-tourism-b1-voa')!.maxStayDays], ['visa_on_arrival', 30]);
  assert.deepEqual([byId.get('id-hk-hksar-tourism-a1-exemption')!.outcome, byId.get('id-hk-hksar-tourism-a1-exemption')!.maxStayDays], ['visa_free', null]);
  assert.deepEqual([byId.get('id-mo-macao-sar-tourism-a1-exemption')!.outcome, byId.get('id-mo-macao-sar-tourism-a1-exemption')!.maxStayDays], ['visa_free', null]);
});

test('越南与菲律宾在官方页面受阻时保持 draft REVIEW', async () => {
  const policies = await readJson('../data/policies.seed.json');
  for (const destination of ['vn', 'ph']) {
    const rules = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === destination);
    assert.equal(rules.length, 3);
    for (const rule of rules) assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['draft', 'manual_review', null]);
  }
});

test('柬埔寨 Visa T 保留电子签、护照有效期与 e-Arrival 要求', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const cambodia = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'kh');
  assert.equal(cambodia.length, 3);
  for (const rule of cambodia) {
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'visa_required', 30]);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('e-Arrival')));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('6 个月')));
  }
});

test('老挝电子签对中国与港澳特区护照保留 30 天和指定口岸限制', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const laos = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'la');
  assert.equal(laos.length, 3);
  for (const rule of laos) {
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'visa_required', 30]);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('指定') && condition.includes('口岸')));
  }
});

test('缅甸电子签区分护照与旅行证并限制入境口岸', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const myanmar = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'mm');
  assert.equal(myanmar.length, 3);
  for (const rule of myanmar) {
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'visa_required', 28]);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('旅行证件') && condition.includes('不获接受')));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('海港')));
  }
});

test('文莱港澳护照为 14 天免签而中国普通护照保持 REVIEW', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const byId = new Map<string, PolicyFixture>((policies.rules as PolicyFixture[]).map((rule) => [rule.id, rule]));
  assert.deepEqual([byId.get('bn-hk-hksar-tourism-visa-waiver')!.outcome, byId.get('bn-hk-hksar-tourism-visa-waiver')!.maxStayDays], ['visa_free', 14]);
  assert.deepEqual([byId.get('bn-mo-macao-sar-tourism-visa-waiver')!.outcome, byId.get('bn-mo-macao-sar-tourism-visa-waiver')!.maxStayDays], ['visa_free', 14]);
  assert.deepEqual([byId.get('bn-cn-prc-ordinary-tourism-review')!.status, byId.get('bn-cn-prc-ordinary-tourism-review')!.outcome], ['draft', 'manual_review']);
});

test('东帝汶三类护照均保留落地签、30 天与全口岸条件', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const timorLeste = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'tl');
  assert.equal(timorLeste.length, 3);
  for (const rule of timorLeste) {
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'visa_on_arrival', 30]);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('航空') && condition.includes('陆路') && condition.includes('海路')));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('USD 30')));
  }
});

test('印度目标证件不在当前 eVisa 名单时不推断普通签证结论', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const india = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'in');
  assert.equal(india.length, 3);
  for (const rule of india) assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['draft', 'manual_review', null]);
});

test('斯里兰卡三类护照均需 ETA 且保留 30 天双次入境', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const sriLanka = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'lk');
  assert.equal(sriLanka.length, 3);
  for (const rule of sriLanka) {
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'eta_required', 30]);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('两次入境')));
  }
  assert.ok(sriLanka.find((rule: PolicyFixture) => rule.documentType === 'ordinary_passport')!.conditions.some((condition: string) => condition.includes('免费')));
});

test('尼泊尔官方落地签页 404 时保持 REVIEW', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const nepal = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'np');
  assert.equal(nepal.length, 3);
  for (const rule of nepal) assert.deepEqual([rule.status, rule.outcome], ['draft', 'manual_review']);
});

test('孟加拉国通用 MRV 说明不被误写成国籍政策', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const bangladesh = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'bd');
  assert.equal(bangladesh.length, 3);
  for (const rule of bangladesh) assert.deepEqual([rule.status, rule.outcome], ['draft', 'manual_review']);
});

test('马尔代夫三类护照均为落地签并保留 IMUGA 申报', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const maldives = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'mv');
  assert.equal(maldives.length, 3);
  for (const rule of maldives) {
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'visa_on_arrival', null]);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('IMUGA')));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('不输出具体天数')));
  }
});

test('中东第一批保留签证产品、证件边界与人工复核状态', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const byId = new Map<string, PolicyFixture>((policies.rules as PolicyFixture[]).map((rule) => [rule.id, rule]));
  for (const destination of ['qa', 'sa', 'bh']) {
    const rules = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === destination);
    assert.equal(rules.length, 3);
    assert.ok(rules.every((rule: PolicyFixture) => rule.status === 'verified'));
    assert.ok(rules.every((rule: PolicyFixture) => rule.conditions.length >= 2));
  }
  assert.deepEqual([byId.get('qa-cn-prc-ordinary-tourism-voa')!.outcome, byId.get('qa-cn-prc-ordinary-tourism-voa')!.maxStayDays], ['visa_on_arrival', null]);
  assert.deepEqual([byId.get('sa-cn-prc-ordinary-tourism-evisa')!.outcome, byId.get('sa-cn-prc-ordinary-tourism-evisa')!.maxStayDays], ['visa_required', 90]);
  assert.equal(byId.get('sa-hk-hksar-tourism-evisa')!.conditions.some((condition: string) => condition.includes('Hong Kong')), true);
  const oman = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'om');
  assert.equal(oman.length, 3);
  assert.deepEqual([byId.get('om-cn-prc-ordinary-tourism-review')!.status, byId.get('om-cn-prc-ordinary-tourism-review')!.outcome, byId.get('om-cn-prc-ordinary-tourism-review')!.maxStayDays], ['verified', 'visa_required', 30]);
  assert.deepEqual([byId.get('om-hk-hksar-tourism-review')!.status, byId.get('om-hk-hksar-tourism-review')!.outcome, byId.get('om-hk-hksar-tourism-review')!.maxStayDays], ['verified', 'visa_required', 30]);
  assert.deepEqual([byId.get('om-mo-macao-sar-tourism-review')!.status, byId.get('om-mo-macao-sar-tourism-review')!.outcome, byId.get('om-mo-macao-sar-tourism-review')!.maxStayDays], ['draft', 'manual_review', null]);
  assert.ok(byId.get('om-cn-prc-ordinary-tourism-review')!.conditions.some((condition: string) => condition.includes('26A')));
  assert.ok(byId.get('om-mo-macao-sar-tourism-review')!.conditions.some((condition: string) => condition.includes('未返回')));
  const jordan = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'jo');
  assert.equal(jordan.length, 3);
  for (const rule of jordan) {
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['draft', 'manual_review', null]);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('电子签')));
  }
});

test('土耳其规则区分中国普通、香港特区与澳门特区护照免签期限', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const turkey = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'tr');
  assert.equal(turkey.length, 3);
  const byType = new Map(turkey.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.outcome, byType.get('ordinary_passport')!.maxStayDays], ['visa_free', 90]);
  assert.deepEqual([byType.get('hksar_passport')!.outcome, byType.get('hksar_passport')!.maxStayDays], ['visa_free', 90]);
  assert.deepEqual([byType.get('macao_sar_passport')!.outcome, byType.get('macao_sar_passport')!.maxStayDays], ['visa_free', 30]);
  assert.ok(turkey.every((rule: PolicyFixture) => rule.conditions.some((condition: string) => condition.includes('6 个月'))));
});

test('埃及电子签资格表只确认中国路线，港澳名单缺席保持 REVIEW', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const egypt = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'eg');
  assert.equal(egypt.length, 3);
  const byType = new Map(egypt.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome], ['verified', 'visa_required']);
  assert.equal(byType.get('ordinary_passport')!.maxStayDays, null);
  for (const documentType of ['hksar_passport', 'macao_sar_passport']) {
    assert.deepEqual([byType.get(documentType)!.status, byType.get(documentType)!.outcome], ['draft', 'manual_review']);
    assert.ok(byType.get(documentType)!.conditions.some((condition: string) => condition.includes('名单缺席')));
  }
});

test('墨西哥按中国普通、香港和澳门特区护照区分路线', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const mexico = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'mx');
  assert.equal(mexico.length, 3);
  const byType = new Map(mexico.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.outcome, byType.get('ordinary_passport')!.maxStayDays], ['visa_required', null]);
  for (const documentType of ['hksar_passport', 'macao_sar_passport']) {
    assert.deepEqual([byType.get(documentType)!.outcome, byType.get(documentType)!.maxStayDays], ['visa_free', 90]);
    assert.ok(byType.get(documentType)!.conditions.some((condition: string) => condition.includes('护照')));
  }
});

test('巴西按中国普通、香港和澳门特区护照区分路线', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const brazil = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'br');
  assert.equal(brazil.length, 3);
  const byType = new Map(brazil.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.outcome, byType.get('ordinary_passport')!.maxStayDays], ['visa_required', null]);
  for (const documentType of ['hksar_passport', 'macao_sar_passport']) {
    assert.deepEqual([byType.get(documentType)!.outcome, byType.get(documentType)!.maxStayDays], ['visa_free', 90]);
    assert.ok(byType.get(documentType)!.conditions.some((condition: string) => condition.includes('旅行证') || condition.includes('身份书')));
  }
});

test('秘鲁保留中国第三国签证例外、香港免签与澳门 REVIEW', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const peru = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'pe');
  assert.equal(peru.length, 3);
  const byType = new Map(peru.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome], ['verified', 'visa_required']);
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('6 个月') && condition.includes('申根')));
  assert.deepEqual([byType.get('hksar_passport')!.outcome, byType.get('hksar_passport')!.maxStayDays], ['visa_free', null]);
  assert.deepEqual([byType.get('macao_sar_passport')!.status, byType.get('macao_sar_passport')!.outcome], ['draft', 'manual_review']);
});

test('哥伦比亚保留中国条件免签、香港短期免签与澳门 REVIEW', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const colombia = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'co');
  assert.equal(colombia.length, 3);
  const byType = new Map(colombia.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome], ['verified', 'visa_required']);
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('美国或申根')));
  assert.deepEqual([byType.get('hksar_passport')!.outcome, byType.get('hksar_passport')!.maxStayDays], ['visa_free', 90]);
  assert.deepEqual([byType.get('macao_sar_passport')!.status, byType.get('macao_sar_passport')!.outcome], ['draft', 'manual_review']);
});

test('智利区分中国条件免签与港澳特区护照停留期', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const chile = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'cl');
  assert.equal(chile.length, 3);
  const byType = new Map(chile.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome], ['verified', 'visa_required']);
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('加拿大或美国') && condition.includes('6 个月')));
  assert.deepEqual([byType.get('hksar_passport')!.outcome, byType.get('hksar_passport')!.maxStayDays], ['visa_free', 90]);
  assert.deepEqual([byType.get('macao_sar_passport')!.outcome, byType.get('macao_sar_passport')!.maxStayDays], ['visa_free', 30]);
});

test('阿根廷区分中国普通护照签证与港澳普通游客路线', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const argentina = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'ar');
  assert.equal(argentina.length, 3);
  const byType = new Map(argentina.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome], ['verified', 'visa_required']);
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('Visa EEUU') && condition.includes('Green CARD')));
  assert.deepEqual([byType.get('hksar_passport')!.outcome, byType.get('hksar_passport')!.maxStayDays], ['visa_free', null]);
  assert.deepEqual([byType.get('macao_sar_passport')!.outcome, byType.get('macao_sar_passport')!.maxStayDays], ['visa_free', null]);
});

test('乌拉圭官方领事页不足以给出三类护照结论时保留 REVIEW', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const uruguay = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'uy');
  assert.equal(uruguay.length, 3);
  assert.ok(uruguay.every((rule: PolicyFixture) => rule.status === 'draft' && rule.outcome === 'manual_review' && rule.maxStayDays === null));
  assert.ok(uruguay.every((rule: PolicyFixture) => rule.conditions.some((condition: string) => condition.includes('内政部'))));
});

test('厄瓜多尔确认中国普通护照需签证并保留港澳特区护照 REVIEW', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const ecuador = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'ec');
  assert.equal(ecuador.length, 3);
  const byType = new Map(ecuador.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome], ['verified', 'visa_required']);
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('República Popular China')));
  for (const documentType of ['hksar_passport', 'macao_sar_passport']) {
    assert.deepEqual([byType.get(documentType)!.status, byType.get(documentType)!.outcome, byType.get(documentType)!.maxStayDays], ['draft', 'manual_review', null]);
    assert.ok(byType.get(documentType)!.conditions.some((condition: string) => condition.includes('不能把') && condition.includes('自动套')));
  }
});
