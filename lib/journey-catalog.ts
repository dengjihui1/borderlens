import { destinationName, documentNames, emptyFilters, filterPolicyCatalog, type CatalogEntry } from './policy-catalog.ts';
import { isPolicyRuleCurrent } from './policy-freshness.ts';

export interface JourneyLeg {
  destination: string;
  document: string;
  purpose: 'tourism' | 'business' | 'study-work' | 'other';
  mode: 'air' | 'land' | 'sea';
  entry: 'entry' | 'airside' | 'unknown';
  basis: 'visit' | 'residence' | 'citizen';
  date: string;
  port: string;
}

export interface CatalogJourney {
  origin: string;
  documents: string[];
  documentsValid: boolean;
  legs: JourneyLeg[];
}

export interface JourneyOptions {
  destinations: string[];
  documents: string[];
}

type JourneyPolicy = CatalogEntry & { journeyReviewNote?: string };

const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const hasOnly = (value: Record<string, unknown>, keys: string[]) => Object.keys(value).every((key) => keys.includes(key));
const allowedValue = (value: unknown, values: string[]) => typeof value === 'string' && values.includes(value);
const containsControl = (value: string) => {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 32 || code === 127) return true;
  }
  return false;
};
const validDay = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

export function validateCatalogJourney(raw: unknown, options: JourneyOptions, now = new Date()): string[] {
  if (!Number.isFinite(now.getTime())) return ['核验时间无效，请刷新页面。'];
  if (!isObject(raw) || !hasOnly(raw, ['origin', 'documents', 'documentsValid', 'legs'])) return ['行程字段无效。'];
  const errors: string[] = [];
  if (typeof raw.origin !== 'string' || !options.destinations.includes(raw.origin) || raw.origin === 'eu-schengen') errors.push('请选择实际出发国家或地区。');
  if (!Array.isArray(raw.documents) || raw.documents.length < 1 || raw.documents.length > 12
    || !raw.documents.every((key) => typeof key === 'string' && options.documents.includes(key))
    || new Set(raw.documents).size !== raw.documents.length) errors.push('请选择实际携带的证件，不要重复或添加未支持的证件。');
  if (typeof raw.documentsValid !== 'boolean') errors.push('证件有效期确认字段无效。');
  if (!Array.isArray(raw.legs) || raw.legs.length < 1 || raw.legs.length > 8) return [...errors, '行程须包含 1 至 8 个边境节点。'];
  let previous = raw.origin;
  let previousDay = now.toISOString().slice(0, 10);
  for (const [index, leg] of raw.legs.entries()) {
    const prefix = `第 ${index + 1} 段：`;
    if (!isObject(leg) || !hasOnly(leg, ['destination', 'document', 'purpose', 'mode', 'entry', 'basis', 'date', 'port'])) {
      errors.push(`${prefix}字段无效。`);
      continue;
    }
    if (typeof leg.destination !== 'string' || !options.destinations.includes(leg.destination) || leg.destination === previous) errors.push(`${prefix}请选择与上一站不同的目的地。`);
    if (typeof leg.document !== 'string' || !options.documents.includes(leg.document) || !Array.isArray(raw.documents) || !raw.documents.includes(leg.document)) errors.push(`${prefix}必须选择实际携带的证件。`);
    if (!allowedValue(leg.purpose, ['tourism', 'business', 'study-work', 'other'])) errors.push(`${prefix}旅行目的无效。`);
    if (!allowedValue(leg.mode, ['air', 'land', 'sea'])) errors.push(`${prefix}交通方式无效。`);
    if (!allowedValue(leg.entry, ['entry', 'airside', 'unknown']) || (leg.entry === 'airside' && leg.mode !== 'air')) errors.push(`${prefix}入境或空侧转机设置无效。`);
    if (!allowedValue(leg.basis, ['visit', 'residence', 'citizen'])) errors.push(`${prefix}入境依据无效。`);
    if (!validDay(leg.date) || leg.date < previousDay) errors.push(`${prefix}请填写不早于今天及上一段的有效日期。`);
    else previousDay = leg.date;
    if (typeof leg.port !== 'string' || leg.port.length > 80 || containsControl(leg.port)) errors.push(`${prefix}口岸备注须为 80 字以内的普通文字。`);
    previous = leg.destination;
  }
  return errors;
}

export function journeyDocumentName(key: string) {
  const [issuer, type] = key.split(':');
  return `${documentNames[type] ?? type} · ${destinationName(issuer)}`;
}

// Re-evaluate even sanitized server entries: an open tab can outlive the evidence window.
function viewForDate(entry: CatalogEntry, now: Date, arrivalDate: string): JourneyPolicy {
  const validity = { status: entry.evidenceCurrent ? 'verified' : 'draft', checkedAt: entry.checkedAt, reviewDueAt: entry.reviewDueAt, effectiveUntil: entry.effectiveUntil };
  const current = isPolicyRuleCurrent(validity, now);
  const coversArrival = current && isPolicyRuleCurrent(validity, new Date(`${arrivalDate}T23:59:59.999Z`));
  if (coversArrival) return entry;
  return { ...entry, evidenceCurrent: false, status: 'review', reason: current ? 'expired' : entry.reason ?? 'expired', conclusion: null, evidence: null,
    journeyReviewNote: current ? '证据窗口不能覆盖计划抵达日期，请在出发前重新核验。' : undefined };
}

export function evaluateCatalogJourney(raw: unknown, entries: CatalogEntry[], options: JourneyOptions, now = new Date()) {
  const errors = validateCatalogJourney(raw, options, now);
  if (errors.length) return { errors, result: null };
  const input = raw as CatalogJourney;
  let from = input.origin;
  const steps = input.legs.map((leg, index) => {
    const fromId = from;
    from = leg.destination;
    const title = `${destinationName(fromId)} → ${destinationName(leg.destination)}`;
    const tasks = ['另行确认出发地出境要求、承运人查验，以及本段所用证件与订票信息一致。'];
    if (!input.documentsValid) tasks.push('尚未确认所有证件在全程有效；先核对有效期和换发需求。');
    tasks.push('护照剩余有效期、空白页、历史停留累计及口岸资格须逐条核对，不能只看证件尚未过期。');
    let reason = '';
    let policies: JourneyPolicy[] = [];
    if (leg.entry === 'airside') reason = '空侧转机不适用访客入境规则；机场、航站楼、行李直挂、联程票及过境签须专门核验。';
    else if (leg.entry === 'unknown') reason = '是否入境尚不确定；先向航空公司确认行李、换航站楼及重新值机安排，不套用免签结论。';
    else if (leg.basis !== 'visit') reason = '本段按居民或公民身份返回；返境权利及实际证件须专门核验，不套用访客签证或 ETA 规则。';
    else {
      policies = filterPolicyCatalog(entries, { ...emptyFilters, document: leg.document, destination: leg.destination, purpose: leg.purpose, mode: leg.mode })
        .map((entry) => viewForDate(entry, now, leg.date));
      const conflicts = new Set(policies.filter((entry) => entry.conclusion).map((entry) => entry.conclusion!.label)).size > 1;
      if (conflicts) {
        policies = policies.map((entry) => ({ ...entry, status: 'review', reason: 'evidence_pending', conclusion: null, evidence: null }));
        reason = '多条规则的适用范围交叠且结论不同；不能自动选择较宽松待遇，本段保留 REVIEW。';
      }
      else if (!policies.length) reason = '这组实际证件、目的地、用途和交通方式尚无受控规则；无结果不代表免签或禁止入境。';
      else if (policies.some((entry) => !entry.conclusion)) reason = '存在到期、证据不足、个体条件未决或不能覆盖计划日期的规则；本段保留 REVIEW。';
      else reason = '已找到当前短期访问规则；仍须满足下列全部条件，不代表已获签证、登机或入境许可。';
    }
    if (!leg.port.trim()) tasks.push('尚未填写实际口岸；请核对该规则是否仅适用于指定机场、陆路或海港。');
    else tasks.push(`口岸备注“${leg.port.trim()}”仅用于自查，系统尚未验证该口岸支持本路线。`);
    if (leg.destination === 'eu-schengen') tasks.push('政策区不是具体口岸；须确认实际成员国及入境安排，系统未沿用过期成员映射。');
    if (policies.some((entry) => entry.conclusion && /签证|电子旅行许可/.test(entry.conclusion.label) && entry.conclusion.label !== '免签路线')) {
      tasks.push('核对已持有的签证或许可及独立豁免；尚未具备适用文件时，按官方流程办理。系统不会代办或自动认定已获批。');
    }
    return { index, from: fromId, title, leg, status: policies.length > 0 && policies.every((entry) => entry.conclusion) ? 'conditions' as const : 'review' as const, reason, policies, tasks };
  });
  const currentLegs = steps.filter((step) => step.status === 'conditions').length;
  return { errors, result: {
    status: 'review' as const,
    generatedAt: now.toISOString(),
    currentLegs,
    headline: `${steps.length} 个节点已拆解，${currentLegs} 段找到当前访问规则`,
    summary: '全程仍需复核：规则条件、出境要求和个人资格未被自动验证。没有 READY 或通关保证；返程转机须逐段显式添加。',
    steps,
  } };
}

export type CatalogJourneyResult = NonNullable<ReturnType<typeof evaluateCatalogJourney>['result']>;
