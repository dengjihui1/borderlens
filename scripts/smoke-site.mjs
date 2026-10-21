import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const origin = new URL(process.argv[2] ?? 'http://127.0.0.1:4179');
if (!['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname) || origin.protocol !== 'http:') throw new Error('Smoke checks accept only a local HTTP preview; do not bypass production authentication');
const policies = JSON.parse(await readFile(new URL('../data/policies.seed.json', import.meta.url), 'utf8'));
const qaId = policies.rules.find((rule) => rule.destinationJurisdictionId === 'qa').id;
const checks = [
  { path: '/', text: ['逐段演示规则已过期，历史结论已隐藏', '查询全部已录入证件规则'] },
  { path: '/coverage', text: ['Phase 69', '各组规则的当前状态'] },
  { path: '/policies', text: ['已有规则，真正查得到。', '下一页'], cards: 12 },
  { path: '/policies?page=12', text: ['上一页'], cards: 11 },
  { path: '/policies?destination=jp&document=hk%3Ahksar_passport', text: ['当前证据有效', 'id="jp-hk-hksar-tourism-short-stay"'], cards: 1 },
  { path: '/policies?destination=bd&document=hk%3Ahksar_passport', text: ['证据不足、冲突或记录不完整', 'id="bd-hk-hksar-tourism-review"'], cards: 1, noText: ['查看官方证据定位与摘录'] },
  { path: '/policies?destination=qa', text: ['已过复核期限或日期无效', `id="${qaId}"`], cards: 3, noText: ['查看官方证据定位与摘录'] },
  { path: '/policies?destination=nz&document=cn%3Aordinary_passport', text: ['证据有效，但个体条件仍需人工核验', 'REVIEW'], cards: 1 },
  { path: '/policies?purpose=study-work', text: ['这组条件尚无受控规则'], cards: 0 },
  { path: '/policies?document=hk%3Ahksar_document_of_identity&destination=jp', text: ['这组条件尚无受控规则'], cards: 0 },
  { path: '/policies?mode=rocket', text: ['筛选参数无效或重复'], cards: 0 },
  { path: '/policies?document=hk%3Ahksar_passport&document=cn%3Aordinary_passport', text: ['筛选参数无效或重复'], cards: 0 },
  { path: '/policies?page=9999', text: ['筛选参数无效或重复'], cards: 0 },
];
for (const check of checks) {
  const response = await fetch(new URL(check.path, origin), { signal: AbortSignal.timeout(20000) });
  const html = await response.text();
  assert.equal(response.status, 200, check.path);
  for (const text of check.text) assert.ok(html.includes(text), `${check.path}: missing ${text}`);
  for (const text of check.noText ?? []) assert.ok(!html.includes(text), `${check.path}: unexpected ${text}`);
  if (check.cards !== undefined) assert.equal(html.split('class="policy-card"').length - 1, check.cards, `${check.path}: card count`);
  if (check.path.startsWith('/policies') || check.path === '/coverage') assert.match(response.headers.get('cache-control') ?? '', /no-store/);
  console.log(`PASS ${check.path}`);
}
console.log(`${checks.length} production Worker smoke checks passed`);
