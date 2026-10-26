import { documentNames, modeNames, purposeNames, reviewReasonNames, type ReviewReason } from './policy-catalog.ts';

export type Locale = 'zh' | 'en';

const englishDocuments: Record<string, string> = {
  ordinary_passport: 'Chinese ordinary passport',
  hksar_passport: 'HKSAR passport',
  macao_sar_passport: 'Macao SAR passport',
  home_return_permit: 'Mainland Travel Permit for Hong Kong and Macao Residents (Chinese nationals)',
  hksar_document_of_identity: 'HKSAR Document of Identity',
  macao_sar_travel_permit: 'Macao SAR Travel Permit',
  mainland_travel_permit_non_chinese: 'Mainland Travel Permit for Hong Kong and Macao Residents (non-Chinese nationals)',
};

const englishPurposes: Record<string, string> = { tourism: 'Short-term tourism', business: 'Business', 'study-work': 'Study / work', other: 'Other / specified permit route' };
const englishModes: Record<string, string> = { any: 'Any mode (check port restrictions)', air: 'Air', land: 'Land', sea: 'Sea' };
const englishOutcomes: Record<string, string> = {
  '免签路线': 'Visa-free route',
  '需取得适用签证': 'Applicable visa required',
  '需取得电子旅行许可': 'Electronic travel authorisation required',
  '可按条件申请落地签': 'Visa on arrival may be available, subject to conditions',
};
const englishReviewReasons: Record<ReviewReason, string> = {
  evidence_pending: 'Evidence incomplete, conflicting or pending',
  expired: 'Review deadline passed or date invalid',
  conditional_review: 'Evidence current; individual eligibility needs manual review',
};

export function localePath(locale: Locale, path: string, query = '') {
  const canonical = path.replace(/^\/en(?=\/|$)/, '') || '/';
  return `${locale === 'en' ? '/en' : ''}${canonical === '/' ? '' : canonical}${query}` || '/';
}

export function placeLabel(id: string, locale: Locale) {
  if (id === 'eu-schengen') return locale === 'en' ? 'Schengen policy area (no automatic country mapping)' : '申根政策区（不自动映射成员国）';
  if (locale === 'en') {
    if (id === 'cn') return 'Mainland China';
    if (id === 'hk') return 'Hong Kong SAR, China';
    if (id === 'mo') return 'Macao SAR, China';
    return /^[a-z]{2}$/i.test(id) ? new Intl.DisplayNames(['en'], { type: 'region' }).of(id.toUpperCase()) ?? id : id;
  }
  if (id === 'cn') return '中国内地';
  if (id === 'hk') return '中国香港';
  if (id === 'mo') return '中国澳门';
  return /^[a-z]{2}$/i.test(id) ? new Intl.DisplayNames(['zh-Hans'], { type: 'region' }).of(id.toUpperCase()) ?? id : id;
}

export function documentLabel(key: string, locale: Locale) {
  const [issuer, type] = key.split(':');
  return `${locale === 'en' ? englishDocuments[type] ?? type : documentNames[type] ?? type} · ${placeLabel(issuer, locale)}`;
}

export function purposeLabel(key: string, locale: Locale) { return locale === 'en' ? englishPurposes[key] ?? key : purposeNames[key] ?? key; }
export function modeLabel(key: string, locale: Locale) { return locale === 'en' ? englishModes[key] ?? key : modeNames[key] ?? key; }
export function outcomeLabel(label: string, locale: Locale) { return locale === 'en' ? englishOutcomes[label] ?? label : label; }
export function reviewReasonLabel(reason: ReviewReason, locale: Locale) { return locale === 'en' ? englishReviewReasons[reason] : reviewReasonNames[reason]; }

export function stayLabel(line: string, locale: Locale) {
  if (locale === 'zh') return line;
  let match = /^最多 (\d+) 个日历月（不折算为天数）$/.exec(line);
  if (match) return `Up to ${match[1]} calendar months (not converted to days)`;
  match = /^停留上限字段：(\d+) 天；单次、滚动窗口等口径见下列条件$/.exec(line);
  if (match) return `Recorded stay limit: ${match[1]} days; see the original conditions for single-entry or rolling-period rules`;
  match = /^每个签证年度累计最多 (\d+) 天，不是单次许可$/.exec(line);
  if (match) return `Up to ${match[1]} days per visa year in total, not per entry`;
  if (line === '单次停留期限未确认；以获批许可与官方条件为准') return 'Per-entry stay not confirmed; check the granted permission and official conditions';
  return `Original stay note: ${line}`;
}

const journeyReasons: Record<string, string> = {
  '空侧转机不适用访客入境规则；机场、航站楼、行李直挂、联程票及过境签须专门核验。': 'Airside transit is not assessed under visitor-entry rules. Check the airport, terminal, baggage transfer, through-ticket and transit-visa requirements separately.',
  '是否入境尚不确定；先向航空公司确认行李、换航站楼及重新值机安排，不套用免签结论。': 'Entry is uncertain. Confirm baggage, terminal changes and check-in with the carrier before applying any visa-free rule.',
  '本段按居民或公民身份返回；返境权利及实际证件须专门核验，不套用访客签证或 ETA 规则。': 'This is a resident or citizen return. Check the right of return and actual documents separately; visitor visa or ETA rules do not apply.',
  '多条规则的适用范围交叠且结论不同；不能自动选择较宽松待遇，本段保留 REVIEW。': 'Overlapping rules conflict. The more permissive outcome is not selected automatically; this leg remains REVIEW.',
  '这组实际证件、目的地、用途和交通方式尚无受控规则；无结果不代表免签或禁止入境。': 'No controlled rule covers this document, destination, purpose and travel mode. No result means neither visa-free entry nor a prohibition.',
  '存在到期、证据不足、个体条件未决或不能覆盖计划日期的规则；本段保留 REVIEW。': 'At least one rule is expired, incomplete, individually conditional or does not cover the arrival date. This leg remains REVIEW.',
  '已找到当前短期访问规则；仍须满足下列全部条件，不代表已获签证、登机或入境许可。': 'A current short-visit rule was found. All original conditions still apply; this is not a visa, boarding approval or entry permission.',
};

const journeyTasks: Record<string, string> = {
  '另行确认出发地出境要求、承运人查验，以及本段所用证件与订票信息一致。': 'Check departure rules and carrier checks; the document used for this leg must match the booking.',
  '尚未确认所有证件在全程有效；先核对有效期和换发需求。': 'Document validity for the full journey is unconfirmed; check expiry and renewal needs.',
  '护照剩余有效期、空白页、历史停留累计及口岸资格须逐条核对，不能只看证件尚未过期。': 'Check remaining passport validity, blank pages, prior stay totals and port eligibility; an unexpired document alone is insufficient.',
  '尚未填写实际口岸；请核对该规则是否仅适用于指定机场、陆路或海港。': 'No port was entered. Check whether the rule is limited to specific airports, land crossings or seaports.',
  '政策区不是具体口岸；须确认实际成员国及入境安排，系统未沿用过期成员映射。': 'A policy area is not a port. Confirm the actual member country and entry arrangements; no expired country mapping is used.',
  '核对已持有的签证或许可及独立豁免；尚未具备适用文件时，按官方流程办理。系统不会代办或自动认定已获批。': 'Check the visa or authorisation actually held and any separate exemption. Apply through official channels if needed; this tool does not apply or assume approval.',
};

export function journeyText(text: string, locale: Locale) {
  if (locale === 'zh') return text;
  if (journeyReasons[text]) return journeyReasons[text];
  if (journeyTasks[text]) return journeyTasks[text];
  if (text === '证据窗口不能覆盖计划抵达日期，请在出发前重新核验。') return 'The evidence window does not cover the planned arrival date. Recheck before departure.';
  const port = /^口岸备注“(.+)”仅用于自查，系统尚未验证该口岸支持本路线。$/.exec(text);
  if (port) return `Port note “${port[1]}” is for your own checklist only. This tool has not verified that the port supports this route.`;
  return `Original-language note: ${text}`;
}

const validationErrors: Record<string, string> = {
  '核验时间无效，请刷新页面。': 'Invalid check time. Refresh the page.',
  '行程字段无效。': 'Invalid journey fields.',
  '请选择实际出发国家或地区。': 'Select the actual departure country or region.',
  '请选择实际携带的证件，不要重复或添加未支持的证件。': 'Select the documents actually carried, without duplicates or unsupported documents.',
  '证件有效期确认字段无效。': 'Invalid document-validity confirmation.',
  '行程须包含 1 至 8 个边境节点。': 'The journey must contain 1–8 border points.',
  '字段无效。': 'Invalid fields.',
  '请选择与上一站不同的目的地。': 'Select a destination different from the previous stop.',
  '必须选择实际携带的证件。': 'Select a document actually carried.',
  '旅行目的无效。': 'Invalid travel purpose.',
  '交通方式无效。': 'Invalid travel mode.',
  '入境或空侧转机设置无效。': 'Invalid entry or airside-transit setting.',
  '入境依据无效。': 'Invalid basis of entry.',
  '请填写不早于今天及上一段的有效日期。': 'Enter a valid date no earlier than today or the previous leg.',
  '口岸备注须为 80 字以内的普通文字。': 'The port note must be plain text of at most 80 characters.',
};

export function journeyError(text: string, locale: Locale) {
  if (locale === 'zh') return text;
  const match = /^第 (\d+) 段：(.*)$/.exec(text);
  if (match) return `Leg ${match[1]}: ${validationErrors[match[2]] ?? match[2]}`;
  return validationErrors[text] ?? `Original-language validation message: ${text}`;
}
