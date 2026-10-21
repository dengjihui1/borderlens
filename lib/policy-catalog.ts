import { isPolicyRuleCurrent } from './policy-freshness.ts';

export interface CatalogRule {
  id: string;
  destinationJurisdictionId?: string;
  destinationPolicyZoneId?: string;
  documentIssuerJurisdictionId: string;
  documentType: string;
  purpose: string;
  borderMode: string;
  status: string;
  outcome: string;
  checkedAt: string;
  reviewDueAt: string;
  effectiveUntil?: string;
  maxStayDays: number | null;
  maxStayMonths?: number;
  maxStayDaysPerVisaYear?: number;
  visaProductName?: string | null;
  conditions: string[];
  sourceIds: string[];
  evidenceLocator: string;
  evidenceExcerpt: string;
}

export interface CatalogSource {
  id: string;
  title: string;
  url: string;
  status: string;
}

export const documentNames: Record<string, string> = {
  ordinary_passport: '中国普通护照',
  hksar_passport: '香港特区护照',
  macao_sar_passport: '澳门特区护照',
  home_return_permit: '港澳居民来往内地通行证（中国籍）',
  hksar_document_of_identity: '香港签证身份书',
  macao_sar_travel_permit: '澳门特区旅行证',
  mainland_travel_permit_non_chinese: '港澳居民来往内地通行证（非中国籍）',
};
export const purposeNames: Record<string, string> = { tourism: '短期旅游', business: '商务', 'study-work': '学习 / 工作', other: '其他 / 指定通行证路线' };
export const modeNames: Record<string, string> = { any: '交通方式不限（仍须核对口岸条件）', air: '航空', land: '陆路', sea: '海路' };
const outcomeNames: Record<string, string> = { visa_free: '免签路线', visa_required: '需取得适用签证', eta_required: '需取得电子旅行许可', visa_on_arrival: '可按条件申请落地签' };
const regions = new Intl.DisplayNames(['zh-Hans'], { type: 'region' });

export function destinationName(id: string) {
  if (id === 'eu-schengen') return '申根政策区（不自动映射成员国）';
  if (id === 'cn') return '中国内地';
  if (id === 'hk') return '中国香港';
  if (id === 'mo') return '中国澳门';
  return /^[a-z]{2}$/i.test(id) ? regions.of(id.toUpperCase()) ?? id : id;
}

export function documentKey(rule: CatalogRule) {
  return `${rule.documentIssuerJurisdictionId}:${rule.documentType}`;
}

export type ReviewReason = 'evidence_pending' | 'expired' | 'conditional_review';
export const reviewReasonNames: Record<ReviewReason, string> = {
  evidence_pending: '证据不足、冲突或记录不完整',
  expired: '已过复核期限或日期无效',
  conditional_review: '证据有效，但个体条件仍需人工核验',
};

export function buildPolicyCatalog(rules: CatalogRule[], sources: CatalogSource[], now = new Date()) {
  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  return rules.map((rule) => {
    const linkedSources = rule.sourceIds.map((id) => sourceMap.get(id)).filter((source): source is CatalogSource => Boolean(source));
    const complete = rule.sourceIds.length > 0 && linkedSources.length === rule.sourceIds.length
      && linkedSources.some((source) => source.status === 'verified')
      && rule.evidenceLocator.trim().length > 0 && rule.evidenceExcerpt.trim().length > 0;
    const current = isPolicyRuleCurrent(rule, now);
    const reason: ReviewReason | null = rule.status !== 'verified' || !complete
      ? 'evidence_pending'
      : !current ? 'expired'
        : rule.outcome === 'manual_review' ? 'conditional_review'
          : !outcomeNames[rule.outcome] ? 'evidence_pending' : null;
    const stay: string[] = [];
    if (rule.maxStayMonths !== undefined) stay.push(`最多 ${rule.maxStayMonths} 个日历月（不折算为天数）`);
    else if (rule.maxStayDays !== null) stay.push(`停留上限字段：${rule.maxStayDays} 天；单次、滚动窗口等口径见下列条件`);
    else stay.push('单次停留期限未确认；以获批许可与官方条件为准');
    if (rule.maxStayDaysPerVisaYear !== undefined) stay.push(`每个签证年度累计最多 ${rule.maxStayDaysPerVisaYear} 天，不是单次许可`);
    return {
      id: rule.id,
      destinationId: rule.destinationJurisdictionId ?? rule.destinationPolicyZoneId ?? '',
      destinationName: destinationName(rule.destinationJurisdictionId ?? rule.destinationPolicyZoneId ?? ''),
      documentKey: documentKey(rule),
      documentName: `${documentNames[rule.documentType] ?? rule.documentType} · ${destinationName(rule.documentIssuerJurisdictionId)}`,
      purpose: rule.purpose,
      borderMode: rule.borderMode,
      checkedAt: rule.checkedAt,
      reviewDueAt: rule.reviewDueAt,
      effectiveUntil: rule.effectiveUntil,
      evidenceCurrent: current && complete,
      status: reason === null ? 'current' as const : 'review' as const,
      reason,
      sources: linkedSources,
      // Do not serialize historical conclusions into the page, even inside collapsed details.
      conclusion: reason === null ? { label: outcomeNames[rule.outcome], product: rule.visaProductName, stay } : null,
      evidence: current && complete ? { conditions: rule.conditions, locator: rule.evidenceLocator, excerpt: rule.evidenceExcerpt } : null,
    };
  });
}

export type CatalogEntry = ReturnType<typeof buildPolicyCatalog>[number];
export type CatalogFilters = Record<'document' | 'destination' | 'purpose' | 'mode' | 'state', string>;
export const emptyFilters: CatalogFilters = { document: '', destination: '', purpose: '', mode: '', state: '' };

export function filterPolicyCatalog(entries: CatalogEntry[], filters: CatalogFilters) {
  return entries.filter((entry) => (!filters.document || entry.documentKey === filters.document)
    && (!filters.destination || entry.destinationId === filters.destination)
    && (!filters.purpose || entry.purpose === filters.purpose)
    && (!filters.mode || entry.borderMode === 'any' || entry.borderMode === filters.mode)
    && (!filters.state || entry.status === filters.state));
}

export function parseCatalogFilters(params: Record<string, string | string[] | undefined>, documentKeys: string[], destinationIds: string[]) {
  const allowed: Record<keyof CatalogFilters, string[]> = {
    document: documentKeys, destination: destinationIds, purpose: Object.keys(purposeNames), mode: ['air', 'land', 'sea'], state: ['current', 'review'],
  };
  const filters = { ...emptyFilters };
  const errors: string[] = [];
  for (const key of Object.keys(allowed) as Array<keyof CatalogFilters>) {
    const value = params[key];
    if (value === undefined || value === '') continue;
    if (typeof value !== 'string' || !allowed[key].includes(value)) errors.push(key);
    else filters[key] = value;
  }
  return { filters, errors };
}

export function getReviewQueue(entries: CatalogEntry[]) {
  const priority = { evidence_pending: 0, expired: 1, conditional_review: 2 };
  return entries.filter((entry) => entry.reason !== null).sort((a, b) => (
    priority[a.reason!] - priority[b.reason!]
    || a.reviewDueAt.localeCompare(b.reviewDueAt)
    || a.id.localeCompare(b.id)
  ));
}

export function getCatalogPage(entries: CatalogEntry[], rawPage: string | string[] | undefined, pageSize = 12) {
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const page = rawPage === undefined || rawPage === '' ? 1 : typeof rawPage === 'string' && /^[1-9]\d*$/.test(rawPage) ? Number(rawPage) : NaN;
  const invalid = !Number.isSafeInteger(page) || page < 1 || page > totalPages;
  return { entries: invalid ? [] : entries.slice((page - 1) * pageSize, page * pageSize), page, totalPages, invalid };
}
