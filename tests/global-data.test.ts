import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import type { CatalogRule } from '../lib/policy-catalog.ts';
import { isPolicyRuleCurrent } from '../lib/policy-freshness.ts';

const readJson = async (relativePath: string) => JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));

type PolicyFixture = CatalogRule;

test('Phase 72 仅智利哥伦比亚秘鲁九条续期，哥斯达黎加历史校正不续期', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const fresh = (policies.rules as PolicyFixture[]).filter((rule) => ['cl', 'co', 'pe'].includes(rule.destinationJurisdictionId ?? ''));
  assert.equal(fresh.length, 9);
  for (const rule of fresh) assert.deepEqual([rule.checkedAt, rule.reviewDueAt], ['2026-10-21', '2026-11-20']);
  const historical = (policies.rules as PolicyFixture[]).filter((rule) => rule.destinationJurisdictionId === 'cr');
  assert.equal(historical.length, 3);
  for (const rule of historical) {
    assert.deepEqual([rule.checkedAt, rule.reviewDueAt], ['2026-09-11', '2026-10-11']);
    assert.ok(rule.conditions.some((line) => line.includes('60 个工作日') && line.includes('180 个自然日')));
    assert.ok(rule.conditions.some((line) => line.includes('未成年人') && line.includes('受限签证委员会')));
  }
});

test('智利官方数据端点和注释必须与国籍行一起使用，零费用不是免签', async () => {
  const registry = await readJson('../data/official-source-registry.json');
  const policies = await readJson('../data/policies.seed.json');
  for (const id of ['cl-minrel-visa-data', 'cl-minrel-visa-notes']) assert.ok(registry.sources.some((source: { id: string; status: string }) => source.id === id && source.status === 'verified'));
  const chile = (policies.rules as PolicyFixture[]).filter((rule) => rule.destinationJurisdictionId === 'cl');
  for (const rule of chile) assert.ok(rule.sourceIds.includes('cl-minrel-visa-data') && rule.sourceIds.includes('cl-minrel-visa-notes'));
  const china = chile.find((rule) => rule.documentType === 'ordinary_passport')!;
  assert.equal(china.maxStayDays, 90);
  assert.ok(china.conditions.some((line) => line.includes('费用字段为 0 不等于免签')));
  assert.equal(chile.find((rule) => rule.documentType === 'macao_sar_passport')!.maxStayDays, 30);
});

test('Phase 70 当前官方证据续期八条路线并保留内地通行证的操作边界', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const rules = (policies.rules as PolicyFixture[]).filter((rule) => ['qa', 'om'].includes(rule.destinationJurisdictionId ?? '')
    || rule.documentType === 'mainland_travel_permit_non_chinese');
  assert.equal(rules.length, 8);
  for (const rule of rules) {
    assert.equal(rule.checkedAt, '2026-10-21');
    assert.equal(rule.reviewDueAt, '2026-11-20');
    assert.equal(rule.status, 'verified');
  }
  for (const rule of rules.filter((rule) => rule.destinationJurisdictionId === 'cn')) {
    assert.equal(rule.maxStayDays, 90);
    assert.ok(rule.conditions.some((line) => line.includes('非中国籍') && line.includes('有效通行证')));
    assert.ok(rule.conditions.some((line) => line.includes('住宿') && line.includes('指纹') && line.includes('不会自动延长')));
    assert.ok(rule.conditions.some((line) => line.includes('工作、学习') && line.includes('新闻采访')));
  }
});

test('不机械续期受阻路线；沙特及巴林按当前官方证据更新', async () => {
  const policies = await readJson('../data/policies.seed.json');
  for (const rule of (policies.rules as PolicyFixture[]).filter((rule) => rule.destinationJurisdictionId === 'bh')) {
    assert.deepEqual([rule.outcome, rule.checkedAt, rule.reviewDueAt], ['visa_on_arrival', '2026-10-21', '2026-11-20']);
  }
  const saudiHongKong = (policies.rules as PolicyFixture[]).find((rule) => rule.id === 'sa-hk-hksar-tourism-evisa')!;
  assert.equal(saudiHongKong.outcome, 'visa_on_arrival');
  assert.equal(saudiHongKong.maxStayDays, 90);
  assert.deepEqual([saudiHongKong.checkedAt, saudiHongKong.reviewDueAt], ['2026-10-21', '2026-11-20']);
  assert.deepEqual(saudiHongKong.sourceIds, ['hk-immd-saudi-visa-on-arrival', 'hk-immd-visa-free-list-2026-10-16']);
  assert.ok(saudiHongKong.conditions.some((line) => line.includes('6 个指定口岸')));
  assert.ok(saudiHongKong.conditions.some((line) => line.includes('单次') && line.includes('30 天') && line.includes('多次') && line.includes('90 天')));
  const saudiChina = (policies.rules as PolicyFixture[]).find((rule) => rule.id === 'sa-cn-prc-ordinary-tourism-evisa')!;
  assert.deepEqual([saudiChina.outcome, saudiChina.maxStayDays, saudiChina.checkedAt, saudiChina.reviewDueAt], ['visa_required', 90, '2026-10-21', '2026-11-20']);
  assert.ok(saudiChina.conditions.some((line) => line.includes('不据此声称电子签是唯一办理方式')));
  assert.ok(saudiChina.sourceIds.includes('sa-tourist-visa-regulation'));
  const saudiMacao = (policies.rules as PolicyFixture[]).find((rule) => rule.id === 'sa-mo-macao-sar-tourism-evisa')!;
  assert.deepEqual([saudiMacao.outcome, saudiMacao.maxStayDays, saudiMacao.checkedAt, saudiMacao.reviewDueAt], ['visa_on_arrival', 90, '2026-10-21', '2026-11-20']);
  assert.ok(saudiMacao.conditions.some((line) => line.includes('落地签或在线 eVisa')));
  assert.ok(saudiMacao.sourceIds.includes('mo-dsi-saudi-visa-route'));
  const registry = await readJson('../data/official-source-registry.json');
  for (const sourceId of saudiHongKong.sourceIds) assert.ok(registry.sources.some((source: { id: string; status: string }) => source.id === sourceId && source.status === 'verified'));
  for (const sourceId of saudiChina.sourceIds) assert.ok(registry.sources.some((source: { id: string; status: string }) => source.id === sourceId && source.status === 'verified'));
  for (const sourceId of saudiMacao.sourceIds) assert.ok(registry.sources.some((source: { id: string; status: string }) => source.id === sourceId && source.status === 'verified'));
  const conflicts = (policies.rules as PolicyFixture[]).filter((rule) => rule.status === 'draft');
  assert.equal(conflicts.length, 3);
  assert.ok(conflicts.every((rule) => rule.outcome === 'manual_review'));
});

test('Phase 71 复核拉美十二条及中国籍回乡证两条，回乡证仍为人工核验', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const registry = await readJson('../data/official-source-registry.json');
  const rules = (policies.rules as PolicyFixture[]).filter((rule) => ['mx', 'py', 'bo', 'br'].includes(rule.destinationJurisdictionId ?? '') || rule.documentType === 'home_return_permit');
  assert.equal(rules.length, 14);
  for (const rule of rules) {
    assert.equal(rule.checkedAt, '2026-10-21');
    assert.equal(rule.reviewDueAt, '2026-11-20');
  }
  for (const rule of rules.filter((rule) => rule.documentType === 'home_return_permit')) {
    assert.equal(rule.outcome, 'manual_review');
    assert.deepEqual(rule.sourceIds, ['cn-nia-mainland-travel-permit']);
    assert.ok(rule.conditions.some((line) => line.includes('符合申领条件不等于已持证')));
  }
  const source = registry.sources.find((source: { id: string }) => source.id === 'cn-nia-mainland-travel-permit');
  assert.equal(source.url, 'https://www.nia.gov.cn/n741445/n741604/n1787219/n1795772/c1792480/content.html');
  assert.match(source.notes, /gatjm.json/);
});

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
  assert.ok(reachable.length >= 7);
  assert.ok(blocked.some((source: { id: string }) => source.id === 'cr-dgme-visas'));
  for (const id of ['ae-mofa-shanghai-visas', 'us-dhs-vwp-countries', 'us-cbp-esta', 'in-cgihk-visa-fee-schedule']) {
    assert.ok(blocked.some((source: { id: string }) => source.id === id));
  }
  assert.equal(registry.sources.find((source: { id: string }) => source.id === 'us-state-vwp').status, 'verified');
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
    ['eta_required', null],
  );
  assert.deepEqual(
    [byId.get('nz-mo-macao-sar-tourism-visa-waiver')!.outcome, byId.get('nz-mo-macao-sar-tourism-visa-waiver')!.maxStayDays],
    ['eta_required', null],
  );
  assert.equal(byId.get('nz-cn-prc-ordinary-tourism-exception-review')!.outcome, 'manual_review');
  assert.equal(byId.get('nz-hk-hksar-tourism-visa-waiver')!.maxStayMonths, 3);
  assert.equal(byId.get('nz-mo-macao-sar-tourism-visa-waiver')!.maxStayMonths, 3);
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
  assert.equal(byId.get('au-hk-hksar-tourism-eta-601')!.maxStayDays, null);
  assert.equal(byId.get('au-hk-hksar-tourism-eta-601')!.maxStayMonths, 3);
  assert.ok(byId.get('au-hk-hksar-tourism-eta-601')!.conditions.some((condition) => condition.includes('日历月') && condition.includes('身份书')));
  assert.equal(byId.get('au-cn-prc-ordinary-tourism-visa-route')!.outcome, 'visa_required');
  assert.equal(byId.get('gb-cn-prc-ordinary-tourism')!.outcome, 'visa_required');
  assert.equal(byId.get('gb-hk-hksar-tourism')!.outcome, 'eta_required');
  assert.equal(byId.get('gb-mo-macao-sar-tourism')!.outcome, 'eta_required');
});

test('韩国港澳护照的临时 K-ETA 豁免不扩展到普通护照或香港签证身份书', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const byId = new Map<string, PolicyFixture>((policies.rules as PolicyFixture[]).map((rule) => [rule.id, rule]));
  for (const id of ['kr-hk-hksar-tourism-keta', 'kr-mo-macao-sar-tourism-keta']) {
    const rule = byId.get(id)!;
    assert.deepEqual([rule.outcome, rule.maxStayDays], ['visa_free', 90]);
    assert.equal(rule.effectiveUntil, '2026-12-31T23:59:59.999+09:00');
    assert.ok(rule.conditions.some((condition) => condition.includes('自愿') && condition.includes('不能写成必办')));
    assert.ok(rule.conditions.some((condition) => condition.includes('韩国时间之后') && condition.includes('重新核对')));
  }
  const china = byId.get('kr-cn-prc-ordinary-tourism')!;
  assert.deepEqual([china.outcome, china.checkedAt, china.reviewDueAt], ['visa_required', '2026-10-21', '2026-11-20']);
  const identityDocument = byId.get('kr-hk-document-of-identity-tourism')!;
  assert.deepEqual([identityDocument.outcome, identityDocument.checkedAt, identityDocument.reviewDueAt], ['visa_required', '2026-10-21', '2026-11-20']);
});

test('阿联酋按当前外交部卡片核验，澳门官方来源冲突必须 REVIEW', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const byId = new Map<string, PolicyFixture>((policies.rules as PolicyFixture[]).map((rule) => [rule.id, rule]));
  for (const id of ['ae-cn-prc-ordinary-tourism-voa', 'ae-hk-hksar-tourism-voa']) {
    const rule = byId.get(id)!;
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'visa_free', null]);
    assert.ok(rule.conditions.some((condition) => condition.includes('未给出') && condition.includes('不沿用')));
  }
  const macao = byId.get('ae-mo-macao-sar-tourism-advance-visa')!;
  assert.deepEqual([macao.status, macao.outcome, macao.maxStayDays], ['draft', 'manual_review', null]);
  assert.ok(macao.conditions.some((condition) => condition.includes('当前阿联酋外交部卡片') && condition.includes('澳门政府记录')));
  assert.ok(macao.sourceIds.includes('mo-govmo-uae-visa-free-notice'));
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
  for (const rule of canada) {
    assert.ok(rule.conditions.some((condition: string) => condition.includes('美国永久居民') && condition.includes('加拿大公民')));
  }
  const sea = hksar.find((rule: { borderMode: string }) => rule.borderMode === 'sea')!;
  assert.ok(sea.conditions.some((condition: string) => condition.includes('Saint-Pierre-et-Miquelon') && condition.includes('邮轮除外') && condition.includes('eTA')));
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
  for (const id of ['id-hk-hksar-tourism-a1-exemption', 'id-mo-macao-sar-tourism-a1-exemption']) {
    const rule = byId.get(id)!;
    assert.deepEqual([rule.outcome, rule.maxStayDays], ['visa_free', 30]);
    assert.ok(rule.conditions.some((condition) => condition.includes('不能延期')));
    assert.ok(rule.conditions.some((condition) => condition.includes('6 个月') && condition.includes('票据')));
  }
});

test('越南官方电子签接口与菲律宾 eVisa 政策确认中国普通护照路线', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const vietnam = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'vn');
  assert.equal(vietnam.length, 3);
  const byType = new Map<string, PolicyFixture>(vietnam.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome, byType.get('ordinary_passport')!.maxStayDays], ['verified', 'visa_required', 90]);
  assert.equal(byType.get('ordinary_passport')!.visaProductName, 'Vietnam e-Visa');
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('CHN') && condition.includes('EVISA')));
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('指定的国际边境口岸')));
  for (const documentType of ['hksar_passport', 'macao_sar_passport']) {
    assert.deepEqual([byType.get(documentType)!.status, byType.get(documentType)!.outcome, byType.get(documentType)!.maxStayDays], ['verified', 'visa_required', 90]);
    assert.equal(byType.get(documentType)!.visaProductName, 'Vietnam e-Visa');
    assert.ok(byType.get(documentType)!.conditions.some((condition: string) => condition.includes('明确包含') && condition.includes('passport holders')));
    assert.ok(byType.get(documentType)!.conditions.some((condition: string) => condition.includes('Chinese e-passport holders')));
    assert.ok(byType.get(documentType)!.sourceIds.includes('vn-immigration-evisa-nationality-list'));
  }

  const philippines = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'ph');
  assert.equal(philippines.length, 3);
  const philippinesByType = new Map<string, PolicyFixture>(philippines.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([philippinesByType.get('ordinary_passport')!.status, philippinesByType.get('ordinary_passport')!.outcome, philippinesByType.get('ordinary_passport')!.maxStayDays], ['verified', 'visa_free', 14]);
  assert.ok(philippinesByType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('2026 年 1 月 16 日') && condition.includes('非延期')));
  assert.ok(philippinesByType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('马尼拉') && condition.includes('宿务')));
  assert.ok(philippinesByType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('第三国') && condition.includes('过境签')));
  for (const documentType of ['hksar_passport', 'macao_sar_passport']) {
    assert.deepEqual([philippinesByType.get(documentType)!.status, philippinesByType.get(documentType)!.outcome, philippinesByType.get(documentType)!.maxStayDays], ['verified', 'visa_free', 14]);
    assert.ok(philippinesByType.get(documentType)!.conditions.some((condition: string) => condition.includes('9A') && condition.includes('14 天')));
  }
});

test('蒙古官方电子签系统将中国、香港和澳门列入免签名单但不补填停留期限', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const mongolia = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'mn');
  assert.equal(mongolia.length, 3);
  for (const rule of mongolia) {
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'visa_free', null]);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('未给出') && condition.includes('最长停留天数')));
  }
});

test('柬埔寨 Visa T 保留电子签、护照有效期与 e-Arrival 要求', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const cambodia = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'kh');
  assert.equal(cambodia.length, 3);
  for (const rule of cambodia) {
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'visa_required', 30]);
    assert.deepEqual([rule.checkedAt, rule.reviewDueAt], ['2026-10-21', '2026-11-20']);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('e-Arrival')));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('6 个月')));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('2026-10-15') && condition.includes('已过期')));
  }
});

test('巴林当前官方落地签与在线签证名单共同支持中港澳三类路线', async () => {
  const registry = await readJson('../data/official-source-registry.json');
  const policies = await readJson('../data/policies.seed.json');
  const online = registry.sources.find((item: { id: string }) => item.id === 'bh-npra-online-visa-countries');
  const arrival = registry.sources.find((item: { id: string }) => item.id === 'bh-npra-onarrival-visa-countries');
  assert.deepEqual([online.status, online.checkedAt, online.nextReviewAt], ['verified', '2026-10-21', '2026-11-20']);
  assert.deepEqual([arrival.status, arrival.checkedAt, arrival.nextReviewAt], ['verified', '2026-10-21', '2026-11-20']);
  const bahrain = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'bh');
  assert.equal(bahrain.length, 3);
  for (const rule of bahrain) {
    assert.deepEqual([rule.status, rule.outcome, rule.checkedAt, rule.reviewDueAt], ['verified', 'visa_on_arrival', '2026-10-21', '2026-11-20']);
    assert.ok(rule.sourceIds.includes('bh-npra-online-visa-countries') && rule.sourceIds.includes('bh-npra-onarrival-visa-countries'));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('按条件') && condition.includes('具体资格')));
    assert.equal(rule.maxStayDays, null);
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

test('缅甸电子签与航空落地签分开建模并执行试行期限门禁', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const myanmar = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'mm');
  assert.equal(myanmar.length, 6);
  const byId = new Map<string, PolicyFixture>(myanmar.map((rule: PolicyFixture) => [rule.id, rule]));
  for (const id of ['mm-cn-prc-ordinary-tourism-evisa', 'mm-hk-hksar-tourism-evisa', 'mm-mo-macao-sar-tourism-evisa']) {
    const rule = byId.get(id)!;
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'visa_required', 28]);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('旅行证件') && condition.includes('不获接受')));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('海港')));
  }
  const chineseVoa = byId.get('mm-cn-prc-ordinary-tourism-voa')!;
  const hongKongVoa = byId.get('mm-hk-hksar-tourism-voa')!;
  const macaoVoa = byId.get('mm-mo-macao-sar-tourism-voa')!;
  assert.deepEqual([chineseVoa.borderMode, chineseVoa.outcome, chineseVoa.maxStayDays, chineseVoa.effectiveUntil], ['air', 'visa_on_arrival', 30, '2027-08-29T23:59:59+06:30']);
  assert.deepEqual([hongKongVoa.borderMode, hongKongVoa.outcome, hongKongVoa.maxStayDays, hongKongVoa.effectiveUntil], ['air', 'visa_on_arrival', 30, '2027-03-10T23:59:59+06:30']);
  assert.equal(isPolicyRuleCurrent(chineseVoa, new Date('2026-10-21T12:00:00Z')), true);
  assert.equal(isPolicyRuleCurrent(hongKongVoa, new Date('2026-10-21T12:00:00Z')), true);
  assert.equal(isPolicyRuleCurrent(macaoVoa, new Date('2026-10-21T12:00:00Z')), false);
});

test('文莱中国普通及港澳特区护照均为 D3 14 天免签', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const byId = new Map<string, PolicyFixture>((policies.rules as PolicyFixture[]).map((rule) => [rule.id, rule]));
  assert.deepEqual([byId.get('bn-hk-hksar-tourism-visa-waiver')!.outcome, byId.get('bn-hk-hksar-tourism-visa-waiver')!.maxStayDays], ['visa_free', 14]);
  assert.deepEqual([byId.get('bn-mo-macao-sar-tourism-visa-waiver')!.outcome, byId.get('bn-mo-macao-sar-tourism-visa-waiver')!.maxStayDays], ['visa_free', 14]);
  assert.deepEqual([byId.get('bn-cn-prc-ordinary-tourism-review')!.status, byId.get('bn-cn-prc-ordinary-tourism-review')!.outcome, byId.get('bn-cn-prc-ordinary-tourism-review')!.maxStayDays], ['verified', 'visa_free', 14]);
});

test('东帝汶三类护照均保留落地签、30 天与全口岸条件', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const timorLeste = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'tl');
  assert.equal(timorLeste.length, 3);
  for (const rule of timorLeste) {
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'visa_on_arrival', 30]);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('航空') && condition.includes('陆路') && condition.includes('海路')));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('USD 30')));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('拒绝入境') && condition.includes('提前申请')));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('USD 100') && condition.includes('USD 50') && condition.includes('担保')));
  }
});

test('印度官方来源确认中国普通与港澳特区护照旅游签证路线', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const india = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'in');
  assert.equal(india.length, 3);
  const byType = new Map<string, PolicyFixture>(india.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome, byType.get('ordinary_passport')!.maxStayDays], ['verified', 'visa_required', null]);
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('中国身份证')));
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('Tourist Visa')));
  for (const documentType of ['hksar_passport', 'macao_sar_passport']) {
    assert.deepEqual([byType.get(documentType)!.status, byType.get(documentType)!.outcome, byType.get(documentType)!.maxStayDays], ['verified', 'visa_required', null]);
    assert.ok(byType.get(documentType)!.sourceIds.includes('in-cgihk-tourist-visa'));
    assert.ok(byType.get(documentType)!.sourceIds.includes('in-boi-entry-visa-requirement'));
    assert.ok(!byType.get(documentType)!.sourceIds.includes('in-cgihk-visa-fee-schedule'));
    assert.ok(byType.get(documentType)!.sourceIds.includes('in-cgihk-general-info'));
    assert.equal(byType.get(documentType)!.visaProductName, 'Indian Tourist Visa');
    assert.ok(byType.get(documentType)!.conditions.some((condition: string) => condition.includes('180 天')));
    assert.ok(byType.get(documentType)!.conditions.some((condition: string) => condition.includes('不沿用旧金额') && condition.includes('停留天数')));
  }
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

test('尼泊尔中国及 HKSAR 护照需免费签证，澳门走官方落地签申请路线', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const nepal = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'np');
  assert.equal(nepal.length, 3);
  const byType = new Map<string, PolicyFixture>(nepal.map((rule: PolicyFixture) => [rule.documentType, rule]));
  for (const documentType of ['ordinary_passport', 'hksar_passport']) {
    assert.deepEqual([byType.get(documentType)!.status, byType.get(documentType)!.outcome, byType.get(documentType)!.maxStayDays], ['verified', 'visa_required', null]);
    assert.ok(byType.get(documentType)!.conditions.some((condition: string) => condition.includes('需签证') && condition.includes('免费')));
  }
  assert.deepEqual([byType.get('macao_sar_passport')!.status, byType.get('macao_sar_passport')!.outcome, byType.get('macao_sar_passport')!.maxStayDays], ['verified', 'visa_on_arrival', null]);
  assert.ok(byType.get('macao_sar_passport')!.sourceIds.includes('np-nepaliport-on-arrival'));
  assert.ok(byType.get('macao_sar_passport')!.sourceIds.includes('np-immigration-tourist-countries-api'));
  for (const rule of nepal) {
    assert.equal(rule.maxStayDays, null);
    assert.equal(rule.maxStayDaysPerVisaYear, 150);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('签证年度') && condition.includes('150 天')));
  }
  assert.ok(byType.get('macao_sar_passport')!.conditions.some((condition: string) => condition.includes('MAC') && condition.includes('blacklisted')));
  assert.ok(byType.get('macao_sar_passport')!.conditions.some((condition: string) => condition.includes('不等于自动签发') && condition.includes('停留天数')));
});

test('孟加拉国中国普通护照落地签有直接证据，港澳费用行不能证明必须预先办签', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const bangladesh = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'bd');
  assert.equal(bangladesh.length, 3);
  const byType = new Map<string, PolicyFixture>(bangladesh.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome, byType.get('ordinary_passport')!.maxStayDays], ['verified', 'visa_on_arrival', 30]);
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('中国') && condition.includes('30 天')));
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('500 美元') && condition.includes('返程票')));
  for (const documentType of ['hksar_passport', 'macao_sar_passport']) {
    assert.deepEqual([byType.get(documentType)!.status, byType.get(documentType)!.outcome, byType.get(documentType)!.maxStayDays], ['draft', 'manual_review', null]);
    assert.ok(byType.get(documentType)!.conditions.some((condition: string) => condition.includes('China') && condition.includes('不能推出必须预先办签')));
    assert.ok(byType.get(documentType)!.sourceIds.includes('bd-hk-visa-fees'));
  }
  assert.ok(byType.get('hksar_passport')!.evidenceExcerpt.includes('Hong Kong'));
  assert.ok(byType.get('macao_sar_passport')!.evidenceExcerpt.includes('Macau'));
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
  assert.deepEqual([byId.get('qa-cn-prc-ordinary-tourism-voa')!.outcome, byId.get('qa-cn-prc-ordinary-tourism-voa')!.maxStayDays], ['visa_free', null]);
  for (const rule of (policies.rules as PolicyFixture[]).filter((rule) => rule.destinationJurisdictionId === 'qa')) {
    assert.equal(rule.outcome, 'visa_free');
    assert.equal(rule.maxStayDays, null);
    assert.match(rule.evidenceLocator, new RegExp(`A1-3/${rule.documentIssuerJurisdictionId}`));
    assert.match(rule.evidenceExcerpt, /Enter visa-free OR apply now for a Hayya A1/);
    assert.ok(rule.conditions.some((line) => line.includes('可选') && line.includes('不是')));
    assert.ok(!JSON.stringify(rule).includes('QAR 100'));
  }
  assert.deepEqual([byId.get('sa-cn-prc-ordinary-tourism-evisa')!.outcome, byId.get('sa-cn-prc-ordinary-tourism-evisa')!.maxStayDays], ['visa_required', 90]);
  assert.deepEqual([byId.get('sa-hk-hksar-tourism-evisa')!.outcome, byId.get('sa-hk-hksar-tourism-evisa')!.maxStayDays], ['visa_on_arrival', 90]);
  assert.ok(byId.get('sa-hk-hksar-tourism-evisa')!.conditions.some((condition: string) => condition.includes('6 个指定口岸')));
  assert.deepEqual([byId.get('sa-mo-macao-sar-tourism-evisa')!.outcome, byId.get('sa-mo-macao-sar-tourism-evisa')!.reviewDueAt], ['visa_on_arrival', '2026-11-20']);
  const oman = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'om');
  assert.equal(oman.length, 3);
  assert.deepEqual([byId.get('om-cn-prc-ordinary-tourism-review')!.status, byId.get('om-cn-prc-ordinary-tourism-review')!.outcome, byId.get('om-cn-prc-ordinary-tourism-review')!.maxStayDays], ['verified', 'visa_free', 14]);
  assert.deepEqual([byId.get('om-hk-hksar-tourism-review')!.status, byId.get('om-hk-hksar-tourism-review')!.outcome, byId.get('om-hk-hksar-tourism-review')!.maxStayDays], ['verified', 'visa_free', 14]);
  assert.deepEqual([byId.get('om-mo-macao-sar-tourism-review')!.status, byId.get('om-mo-macao-sar-tourism-review')!.outcome, byId.get('om-mo-macao-sar-tourism-review')!.maxStayDays], ['verified', 'visa_free', 14]);
  assert.ok(byId.get('om-cn-prc-ordinary-tourism-review')!.conditions.some((condition: string) => condition.includes('不能证明必须预先办签')));
  assert.ok(byId.get('om-mo-macao-sar-tourism-review')!.conditions.some((condition: string) => condition.includes('第一组') && condition.includes('14 天')));
  for (const rule of oman as PolicyFixture[]) {
    assert.deepEqual(rule.sourceIds, ['om-fm-entry-visas']);
    assert.equal(rule.maxStayDays, 14);
    assert.ok(rule.conditions.some((condition) => condition.includes('6 个月') && condition.includes('健康保险') && condition.includes('资金')));
    assert.ok(rule.conditions.some((condition) => condition.includes('不可延期') && condition.includes('不能转换')));
  }
  const jordan = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'jo');
  assert.equal(jordan.length, 3);
  for (const rule of jordan) {
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'visa_on_arrival', null]);
    assert.ok(rule.sourceIds.includes('jo-visitjordan-visas'));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('40 JOD') && condition.includes('抵达')));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('没有给出') && condition.includes('停留天数')));
  }
  const jordanHksar = byId.get('jo-hk-hksar-tourism-review')!;
  assert.ok(jordanHksar.conditions.some((condition: string) => condition.includes('香港特区普通护照')));
});

test('土耳其规则区分中国普通、香港特区与澳门特区护照免签期限', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const turkey = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'tr');
  assert.equal(turkey.length, 3);
  const byType = new Map<string, PolicyFixture>(turkey.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.outcome, byType.get('ordinary_passport')!.maxStayDays], ['visa_free', 90]);
  assert.deepEqual([byType.get('hksar_passport')!.outcome, byType.get('hksar_passport')!.maxStayDays], ['visa_free', 90]);
  assert.deepEqual([byType.get('macao_sar_passport')!.outcome, byType.get('macao_sar_passport')!.maxStayDays], ['visa_free', 30]);
  assert.ok(turkey.every((rule: PolicyFixture) => rule.conditions.some((condition: string) => condition.includes('6 个月'))));
});

test('埃及按中国普通、香港和澳门特区护照区分旅游路线', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const egypt = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'eg');
  assert.equal(egypt.length, 3);
  const byType = new Map<string, PolicyFixture>(egypt.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome], ['verified', 'visa_required']);
  assert.equal(byType.get('ordinary_passport')!.maxStayDays, null);
  assert.deepEqual([byType.get('hksar_passport')!.status, byType.get('hksar_passport')!.outcome, byType.get('hksar_passport')!.maxStayDays], ['verified', 'visa_free', 90]);
  assert.ok(byType.get('hksar_passport')!.sourceIds.includes('hk-gov-egypt-visa-free-90'));
  assert.ok(byType.get('hksar_passport')!.sourceIds.includes('hk-immd-visa-free-arrival-list'));
  assert.ok(byType.get('hksar_passport')!.conditions.some((condition: string) => condition.includes('香港特区普通护照')));
  assert.deepEqual([byType.get('macao_sar_passport')!.status, byType.get('macao_sar_passport')!.outcome, byType.get('macao_sar_passport')!.maxStayDays], ['verified', 'visa_free', 90]);
  assert.ok(byType.get('macao_sar_passport')!.sourceIds.includes('mo-yearbook-2025-visa-treatment'));
  assert.ok(byType.get('macao_sar_passport')!.conditions.some((condition: string) => condition.includes('澳门旅行证不适用')));
});

test('墨西哥按中国普通、香港和澳门特区护照区分路线', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const mexico = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'mx');
  assert.equal(mexico.length, 3);
  const byType = new Map<string, PolicyFixture>(mexico.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.outcome, byType.get('ordinary_passport')!.maxStayDays], ['visa_required', null]);
  assert.ok(byType.get('ordinary_passport')!.sourceIds.includes('mx-consulate-hk-visa-exemptions'));
  assert.ok(byType.get('ordinary_passport')!.conditions.some((line) => line.includes('不适用独立免签例外')));
  assert.ok(byType.get('ordinary_passport')!.conditions.some((line) => line.includes('有效多次入境') && line.includes('180 天')));
  for (const documentType of ['hksar_passport', 'macao_sar_passport']) {
    assert.deepEqual([byType.get(documentType)!.outcome, byType.get(documentType)!.maxStayDays], ['visa_free', 90]);
    assert.ok(byType.get(documentType)!.conditions.some((condition: string) => condition.includes('护照')));
  }
});

test('巴西按中国普通、香港和澳门特区护照区分路线', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const brazil = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'br');
  assert.equal(brazil.length, 3);
  const byType = new Map<string, PolicyFixture>(brazil.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.outcome, byType.get('ordinary_passport')!.maxStayDays], ['visa_required', null]);
  for (const documentType of ['hksar_passport', 'macao_sar_passport']) {
    assert.deepEqual([byType.get(documentType)!.outcome, byType.get(documentType)!.maxStayDays], ['visa_free', 90]);
    assert.ok(byType.get(documentType)!.conditions.some((condition: string) => condition.includes('旅行证') || condition.includes('身份书')));
  }
});

test('秘鲁区分中国第三国签证例外、香港免签与澳门需旅游签证', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const peru = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'pe');
  assert.equal(peru.length, 3);
  const byType = new Map<string, PolicyFixture>(peru.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome], ['verified', 'visa_required']);
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('6 个月') && condition.includes('申根')));
  assert.deepEqual([byType.get('hksar_passport')!.outcome, byType.get('hksar_passport')!.maxStayDays], ['visa_free', 90]);
  assert.ok(byType.get('ordinary_passport')!.conditions.some((line) => line.includes('永久居留')));
  assert.ok(byType.get('macao_sar_passport')!.conditions.some((line) => line.includes('太平洋联盟') && line.includes('独立例外')));
  assert.deepEqual([byType.get('macao_sar_passport')!.status, byType.get('macao_sar_passport')!.outcome, byType.get('macao_sar_passport')!.maxStayDays], ['verified', 'visa_required', null]);
  assert.ok(byType.get('macao_sar_passport')!.conditions.some((condition: string) => condition.includes('Macao') && condition.includes('SI')));
  assert.ok(byType.get('macao_sar_passport')!.sourceIds.includes('pe-mre-ordinary-passport-visa-table'));
});

test('哥伦比亚区分中国条件免签、香港短期免签与澳门需签证', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const colombia = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'co');
  assert.equal(colombia.length, 3);
  const byType = new Map<string, PolicyFixture>(colombia.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome], ['verified', 'visa_required']);
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('美国或申根')));
  assert.deepEqual([byType.get('hksar_passport')!.outcome, byType.get('hksar_passport')!.maxStayDays], ['visa_free', null]);
  assert.ok(byType.get('hksar_passport')!.conditions.some((line) => line.includes('少于 90 天') && line.includes('不把严格小于')));
  for (const documentType of ['ordinary_passport', 'macao_sar_passport']) assert.ok(byType.get(documentType)!.conditions.some((line) => line.includes('永久居留') && line.includes('安第斯共同体')));
  assert.deepEqual([byType.get('macao_sar_passport')!.status, byType.get('macao_sar_passport')!.outcome, byType.get('macao_sar_passport')!.maxStayDays], ['verified', 'visa_required', null]);
  assert.ok(byType.get('macao_sar_passport')!.conditions.some((condition: string) => condition.includes('旅游、参加活动、商务或过境')));
  assert.ok(byType.get('macao_sar_passport')!.sourceIds.includes('co-hk-consulate-visa-faq'));
});

test('智利区分中国条件免签与港澳特区护照停留期', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const chile = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'cl');
  assert.equal(chile.length, 3);
  const byType = new Map<string, PolicyFixture>(chile.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome], ['verified', 'visa_required']);
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('加拿大或美国') && condition.includes('6 个月')));
  assert.deepEqual([byType.get('hksar_passport')!.outcome, byType.get('hksar_passport')!.maxStayDays], ['visa_free', 90]);
  assert.deepEqual([byType.get('macao_sar_passport')!.outcome, byType.get('macao_sar_passport')!.maxStayDays], ['visa_free', 30]);
});

test('阿根廷区分中国普通护照签证与港澳普通游客路线', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const argentina = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'ar');
  assert.equal(argentina.length, 3);
  const byType = new Map<string, PolicyFixture>(argentina.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome], ['verified', 'visa_required']);
  const china = byType.get('ordinary_passport')!;
  assert.ok(china.sourceIds.includes('ar-resolution-316-2025'));
  assert.ok(china.sourceIds.includes('ar-dnm-ave'));
  assert.ok(china.conditions.some((condition: string) => condition.includes('相同') && condition.includes('美国签证') && condition.includes('30 天')));
  assert.ok(china.conditions.some((condition: string) => condition.includes('Green Card') && condition.includes('不把') && condition.includes('普遍')));
  assert.deepEqual([byType.get('hksar_passport')!.outcome, byType.get('hksar_passport')!.maxStayDays], ['visa_free', 90]);
  assert.ok(byType.get('hksar_passport')!.sourceIds.includes('hk-immd-visa-free-list-2026-10-16'));
  assert.ok(byType.get('hksar_passport')!.conditions.some((condition: string) => condition.includes('合并') && condition.includes('90 天')));
  assert.deepEqual([byType.get('macao_sar_passport')!.outcome, byType.get('macao_sar_passport')!.maxStayDays], ['visa_free', 30]);
  assert.ok(byType.get('macao_sar_passport')!.sourceIds.includes('ar-macao-visa-waiver-2019'));
  assert.ok(byType.get('macao_sar_passport')!.sourceIds.includes('mo-dsi-macao-passport-visa-list'));
  assert.ok(byType.get('macao_sar_passport')!.conditions.some((condition: string) => condition.includes('中国籍') && condition.includes('澳门居住') && condition.includes('30 天')));
});

test('乌拉圭内政部官方签证制度表核验中国及港澳普通护照路线', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const uruguay = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'uy');
  assert.equal(uruguay.length, 3);
  const byType = new Map<string, PolicyFixture>(uruguay.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome, byType.get('ordinary_passport')!.maxStayDays], ['verified', 'visa_required', null]);
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('Carrasco') && condition.includes('Montevideo')));
  assert.deepEqual([byType.get('hksar_passport')!.status, byType.get('hksar_passport')!.outcome, byType.get('hksar_passport')!.maxStayDays], ['verified', 'visa_free', null]);
  assert.ok(byType.get('hksar_passport')!.conditions.some((condition: string) => condition.includes('HKSAR') && condition.includes('OVERSEAS')));
  assert.deepEqual([byType.get('macao_sar_passport')!.status, byType.get('macao_sar_passport')!.outcome, byType.get('macao_sar_passport')!.maxStayDays], ['verified', 'visa_free', null]);
  assert.ok(byType.get('macao_sar_passport')!.conditions.some((condition: string) => condition.includes('脚注 (11)')));
});

test('厄瓜多尔区分中国普通护照签证与港澳特区护照 90 天免签', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const ecuador = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'ec');
  assert.equal(ecuador.length, 3);
  const byType = new Map<string, PolicyFixture>(ecuador.map((rule: PolicyFixture) => [rule.documentType, rule]));
  assert.deepEqual([byType.get('ordinary_passport')!.status, byType.get('ordinary_passport')!.outcome], ['verified', 'visa_required']);
  assert.ok(byType.get('ordinary_passport')!.conditions.some((condition: string) => condition.includes('República Popular China')));
  assert.deepEqual([byType.get('hksar_passport')!.status, byType.get('hksar_passport')!.outcome, byType.get('hksar_passport')!.maxStayDays], ['verified', 'visa_free', 90]);
  assert.ok(byType.get('hksar_passport')!.sourceIds.includes('hk-gov-ecuador-visa-free-90'));
  assert.ok(byType.get('hksar_passport')!.sourceIds.includes('hk-immd-visa-free-arrival-list'));
  assert.ok(byType.get('hksar_passport')!.conditions.some((condition: string) => condition.includes('HKSAR 护照') && condition.includes('免签') && condition.includes('90 天')));
  assert.deepEqual([byType.get('macao_sar_passport')!.status, byType.get('macao_sar_passport')!.outcome, byType.get('macao_sar_passport')!.maxStayDays], ['verified', 'visa_free', 90]);
  assert.ok(byType.get('macao_sar_passport')!.sourceIds.includes('mo-yearbook-2025-visa-treatment'));
  assert.ok(byType.get('macao_sar_passport')!.conditions.some((condition: string) => condition.includes('Ecuador') && condition.includes('90 天')));
  assert.ok(byType.get('macao_sar_passport')!.conditions.some((condition: string) => condition.includes('澳门旅行证') && condition.includes('不扩展')));
});

test('全库保留结构化路线及有明确原因的人工复核记录', async () => {
  const registry = await readJson('../data/official-source-registry.json');
  const policies = await readJson('../data/policies.seed.json');
  assert.equal(registry.sources.length, 126);
  assert.equal(policies.rules.length, 146);
  assert.equal(policies.rules.filter((rule: PolicyFixture) => rule.status === 'verified').length, 143);
  assert.deepEqual(policies.rules.filter((rule: PolicyFixture) => rule.status !== 'verified').map((rule: PolicyFixture) => rule.id).sort(), ['ae-mo-macao-sar-tourism-advance-visa', 'bd-hk-hksar-tourism-review', 'bd-mo-macao-sar-tourism-review']);
  assert.equal(registry.sources.filter((source: { id: string }) => source.id === 'hk-gov-ecuador-visa-free-90').length, 1);
});

test('巴拉圭官方使馆页确认三类普通护照均需出发前签证', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const paraguay = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'py');
  assert.equal(paraguay.length, 3);
  for (const rule of paraguay) {
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'visa_required', null]);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('出发前') && condition.includes('签证')));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('6 个月') && condition.includes('不是要求所有旅客到日本办理')));
  }
  assert.ok(paraguay.every((rule: PolicyFixture) => rule.conditions.some((condition: string) => condition.includes('不扩展')) || rule.documentType === 'ordinary_passport'));
});

test('玻利维亚官方使馆页确认三类普通护照属于 Tourist Visa Group II', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const bolivia = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'bo');
  assert.equal(bolivia.length, 3);
  for (const rule of bolivia) {
    assert.deepEqual([rule.status, rule.outcome, rule.maxStayDays], ['verified', 'visa_required', null]);
    assert.ok(rule.conditions.some((condition: string) => condition.includes('Group II')));
    assert.ok(rule.conditions.some((condition: string) => condition.includes('六个月')));
  }
});

test('哥斯达黎加官方公报核验中国及港澳普通护照领事签证路线', async () => {
  const policies = await readJson('../data/policies.seed.json');
  const costaRica = policies.rules.filter((rule: PolicyFixture) => rule.destinationJurisdictionId === 'cr');
  assert.equal(costaRica.length, 3);
  assert.ok(costaRica.every((rule: PolicyFixture) => rule.status === 'verified' && rule.outcome === 'visa_required' && rule.maxStayDays === null));
  assert.ok(costaRica.every((rule: PolicyFixture) => rule.sourceIds.includes('cr-gaceta-directrices-2025')));
  assert.ok(costaRica.every((rule: PolicyFixture) => rule.conditions.some((condition: string) => condition.includes('领事签证'))));
  assert.ok(costaRica.every((rule: PolicyFixture) => rule.conditions.some((condition: string) => condition.includes('美国/加拿大') && condition.includes('申根'))));
  assert.ok(costaRica.find((rule: PolicyFixture) => rule.documentType === 'ordinary_passport')!.conditions.some((condition: string) => condition.includes('北京或上海') && condition.includes('30 天')));
  assert.ok(costaRica.find((rule: PolicyFixture) => rule.documentType === 'hksar_passport')!.conditions.some((condition: string) => condition.includes('有效英国护照')));
  assert.ok(costaRica.find((rule: PolicyFixture) => rule.documentType === 'macao_sar_passport')!.conditions.some((condition: string) => condition.includes('有效葡萄牙护照')));
});
