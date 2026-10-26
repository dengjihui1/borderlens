import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildPolicyCatalog } from '../lib/policy-catalog.ts';
import { documentLabel, journeyError, journeyText, localePath, outcomeLabel, placeLabel, stayLabel } from '../lib/locale.ts';

test('language paths preserve page and filters without changing the rule key', () => {
  assert.equal(localePath('en', '/policies', '?destination=jp&state=review'), '/en/policies?destination=jp&state=review');
  assert.equal(localePath('zh', '/en/policies', '?destination=jp'), '/policies?destination=jp');
  assert.equal(localePath('zh', '/en'), '/');
  assert.equal(placeLabel('jp', 'en'), 'Japan');
  assert.match(documentLabel('hk:hksar_passport', 'en'), /HKSAR passport.*Hong Kong/);
});

test('English summaries stay cautious and unrecognised source notes remain visibly original', () => {
  assert.equal(outcomeLabel('免签路线', 'en'), 'Visa-free route');
  assert.match(stayLabel('每个签证年度累计最多 90 天，不是单次许可', 'en'), /per visa year.*not per entry/);
  assert.match(journeyText('空侧转机不适用访客入境规则；机场、航站楼、行李直挂、联程票及过境签须专门核验。', 'en'), /transit-visa/);
  assert.match(journeyText('未经审校的新提示', 'en'), /^Original-language note:/);
  assert.match(journeyError('第 2 段：必须选择实际携带的证件。', 'en'), /^Leg 2: Select a document/);
});

test('all current structured stay lines have an explicit English interpretation', () => {
  const policies = JSON.parse(readFileSync(new URL('../data/policies.seed.json', import.meta.url), 'utf8'));
  const sources = JSON.parse(readFileSync(new URL('../data/official-source-registry.json', import.meta.url), 'utf8'));
  const entries = buildPolicyCatalog(policies.rules, sources.sources, new Date('2026-10-26T12:00:00Z'));
  for (const entry of entries) for (const line of entry.conclusion?.stay ?? []) {
    assert.ok(!stayLabel(line, 'en').startsWith('Original stay note:'), `${entry.id}: ${line}`);
  }
});
