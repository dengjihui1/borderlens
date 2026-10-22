import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const origin = new URL(process.argv[2] ?? 'http://127.0.0.1:4179');
if (!['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname) || origin.protocol !== 'http:') throw new Error('Smoke checks accept only a local HTTP preview; do not bypass production authentication');
const policies = JSON.parse(await readFile(new URL('../data/policies.seed.json', import.meta.url), 'utf8'));
const bhId = policies.rules.find((rule) => rule.destinationJurisdictionId === 'bh').id;
const checks = [
  { path: '/', text: ['把证件和行程，逐段对上。', '生成逐段自查清单', '添加返程目的地', '仅当前页面，不保存'] },
  { path: '/demo', text: ['逐段演示规则已过期，历史结论已隐藏', '查询全部已录入证件规则'] },
  { path: '/coverage', text: ['Phase 86', '当前有效的受控规则', '各组规则的当前状态'] },
  { path: '/policies', text: ['已有规则，真正查得到。', '下一页'], cards: 12 },
  { path: '/policies?page=12', text: ['上一页', '下一页'], cards: 12 },
  { path: '/policies?page=13', text: ['上一页'], cards: 3 },
  { path: '/policies?destination=la&document=cn%3Aordinary_passport', text: ['la-cn-prc-ordinary-tourism-voa', 'USD 20', '磨丁铁路口岸'], cards: 2 },
  { path: '/policies?destination=jp&document=hk%3Ahksar_passport', text: ['当前证据有效', 'id="jp-hk-hksar-tourism-short-stay"'], cards: 1 },
  { path: '/policies?destination=bd&document=hk%3Ahksar_passport', text: ['证据不足、冲突或记录不完整', 'id="bd-hk-hksar-tourism-review"'], cards: 1, noText: ['查看官方证据定位与摘录'] },
  { path: '/policies?destination=bh', text: ['可按条件申请落地签', 'eVisa or visa on arrival', `id="${bhId}"`], cards: 3 },
  { path: '/policies?destination=qa', text: ['免签路线', '可选申请路线', '至少还有 3 个月'], cards: 3, noText: ['QAR 100'] },
  { path: '/policies?destination=om', text: ['免签路线', '最多 14 天', '不可延期'], cards: 3, noText: ['26A/26B'] },
  { path: '/policies?destination=jo', text: ['当前证据有效', '可按条件申请落地签', '40 JOD', '复核截止', '停留天数'], cards: 3, noText: ['最多 14 天'] },
  { path: '/policies?destination=mm&document=cn%3Aordinary_passport&mode=air', text: ['mm-cn-prc-ordinary-tourism-evisa', 'mm-cn-prc-ordinary-tourism-voa', '可按条件申请落地签'], cards: 2 },
  { path: '/policies?destination=mm&document=mo%3Amacao_sar_passport&mode=air', text: ['mm-mo-macao-sar-tourism-evisa', 'mm-mo-macao-sar-tourism-voa', '已过复核期限或日期无效'], cards: 2 },
  { path: '/policies?destination=cn&document=hk%3Amainland_travel_permit_non_chinese', text: ['当前证据有效', '每次停留不超过 90 日', '依法登记住宿'], cards: 1 },
  { path: '/policies?destination=cn&document=hk%3Ahome_return_permit', text: ['证据有效，但个体条件仍需人工核验', '符合申领条件不等于已持证'], cards: 1, noText: ['已过复核期限或日期无效'] },
  { path: '/policies?destination=mx&document=cn%3Aordinary_passport', text: ['不适用独立免签例外', '有效多次入境', '180 天'], cards: 1 },
  { path: '/policies?destination=br', text: ['Visitor Visa', '免签路线'], cards: 3 },
  { path: '/policies?destination=bo', text: ['Group II', '六个月'], cards: 3 },
  { path: '/policies?destination=py', text: ['出发前取得签证', '6 个月'], cards: 3 },
  { path: '/policies?destination=cl', text: ['费用字段为 0 不等于免签', '30 天'], cards: 3 },
  { path: '/policies?destination=pe', text: ['永久居留', '最多 90 天', 'Macao'], cards: 3 },
  { path: '/policies?destination=co', text: ['安第斯共同体', '少于 90 天'], cards: 3 },
  { path: '/policies?destination=cr', text: ['当前证据有效', '60 个工作日', '受限签证委员会', '查看官方证据定位与摘录'], cards: 3, noText: ['已过复核期限或日期无效'] },
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
  if (check.path.startsWith('/policies') || check.path === '/coverage' || check.path === '/') assert.match(response.headers.get('cache-control') ?? '', /no-store/);
  console.log(`PASS ${check.path}`);
}
console.log(`${checks.length} production Worker smoke checks passed`);
