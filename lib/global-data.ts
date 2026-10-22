import countryCatalog from '@/data/countries.un-m49.json';
import sourceRegistry from '@/data/official-source-registry.json';
import policySeed from '@/data/policies.seed.json';
import policyZoneCatalog from '@/data/policy-zones.json';
import { isPolicyRuleCurrent, summarizePolicyBatch } from './policy-freshness';

export { isPolicyRuleCurrent } from './policy-freshness';

export type SourceStatus = 'verified' | 'reachable' | 'blocked';

export interface RegisteredSource {
  id: string;
  jurisdictionId: string | null;
  authority: string;
  title: string;
  url: string;
  sourceType: string;
  accessModel: string;
  status: SourceStatus;
  scope: string;
}

export const jurisdictions = countryCatalog.territories;
export const registeredSources = sourceRegistry.sources as RegisteredSource[];
export const policyZones = policyZoneCatalog.zones;

const rulesByDestination = (destinationId: string, isZone = false) => policySeed.rules.filter((rule) => (
  isZone ? 'destinationPolicyZoneId' in rule && rule.destinationPolicyZoneId === destinationId : 'destinationJurisdictionId' in rule && rule.destinationJurisdictionId === destinationId
));

const policyBatchDescriptions = [
  { id: 'id', label: '印度尼西亚', note: '中国普通护照 B1 落地签最多 30 天，可再延长 30 天；港澳特区护照 A1 免签最多 30 天、不能延期' },
  { id: 'au', label: '澳大利亚', note: '香港特区护照可申请 ETA 601，每次最多 3 个日历月；中国普通及澳门特区护照需其他适用签证，Visitor 600 仅为候选路线' },
  { id: 'us', label: '美国', note: '三类普通护照一般旅游需 B-2 或 B-1/B-2；ESTA 不替代签证，关岛/北马里亚纳群岛和其他国籍或居留身份另行核验' },
  { id: 'kr', label: '韩国', note: '港澳特区普通护照短期访问的 K-ETA 临时豁免截至 2026 年 12 月 31 日韩国时间；其他证件和路线分别核验' },
  { id: 'ae', label: '阿联酋', note: '中国和香港普通护照当前外交部卡片标为 Visa Free；澳门特区护照存在官方来源冲突，须复核' },
  { id: 'gb', label: '英国', note: '中国普通护照需 Standard Visitor visa；港澳特区护照需 ETA 或签证，护照须覆盖全程有效期' },
  { id: 'ca', label: '加拿大', note: '中国普通及澳门特区护照需访客签证；香港特区护照航空需 eTA，一般陆海路豁免，Saint-Pierre-et-Miquelon 非邮轮船班另行核验' },
  { id: 'tl', label: '东帝汶', note: '三类普通护照可在符合条件的正式口岸申请 30 天落地签；保留护照、资金或担保及提前申请例外' },
  { id: 'uy', label: '乌拉圭', note: '中国普通护照需签证但有条件例外；香港与澳门特区护照免签，期限待官方表格进一步确认' },
  { id: 'mn', label: '蒙古', note: '中国、香港、澳门列入官方 VISA FREE COUNTRIES；页面未给出停留天数' },
  { id: 'ph', label: '菲律宾', note: '中国普通护照旅游/商务免签 14 天，但仅限马尼拉与宿务两个机场；港澳特区护照 9A 初始 14 天' },
  { id: 'vn', label: '越南', note: '中国普通护照的条件团体免签与 e-Visa 并存但需核资格；港澳 e-Visa 申请资格不等于完整入境结论，三条均保留 REVIEW' },
  { id: 'cr', label: '哥斯达黎加', note: '三条历史规则仍为 REVIEW；2025 年指引副本不能单独确认现行版本，未续期或展示旧结论' },
  { id: 'bo', label: '玻利维亚', note: '中国、香港、澳门特区普通护照列入 Tourist Visa Group II，需申请旅游签证' },
  { id: 'py', label: '巴拉圭', note: '中国、香港、澳门特区普通护照均需出发前签证' },
  { id: 'ec', label: '厄瓜多尔', note: '中国普通护照需预先签证；香港特区政府公告与澳门官方年鉴均确认港澳特区普通护照免签最多 90 天' },
  { id: 'ar', label: '阿根廷', note: '中国普通护照需签证；港澳特区护照表格未标需签证，停留期继续核验' },
  { id: 'cl', label: '智利', note: '中国普通护照有美/加签证条件免签；香港 90 天免签；澳门 30 天免签' },
  { id: 'co', label: '哥伦比亚', note: '中国普通护照有美国/申根条件免签；香港短期少于 90 天；澳门一般需签证，另有指定地区永久居民独立豁免，资格须另核' },
  { id: 'pe', label: '秘鲁', note: '中国普通护照有指定第三国签证或永久居留例外；香港旅游免签最多 90 天；澳门一般需旅游签证，太平洋联盟永久居民独立豁免须另核' },
  { id: 'br', label: '巴西', note: '中国普通护照需 VIVIS 访问签证；港澳特区护照旅游最多 90 天免签' },
  { id: 'mx', label: '墨西哥', note: '中国普通护照一般需访问签证，所列第三国签证/永久居留等独立豁免须另核；港澳特区护照旅游最多 90 天免签' },
  { id: 'qa', label: '卡塔尔', note: '中国及港澳普通护照 A1-3 当前为免签入境，或可选 Hayya A1；护照至少 3 个月有效，停留期限未确认' },
  { id: 'sa', label: '沙特', note: '中国（含港澳）列入官方旅游电子签合资格国家，最多 90 天' },
  { id: 'bh', label: '巴林', note: '中国、香港、澳门列入官方在线签证国家名单' },
  { id: 'om', label: '阿曼', note: '中国及港澳普通护照均属第一组，有条件免签最多 14 天；护照至少 6 个月、返程票、酒店、保险及资金要求，且不可延期或转换' },
  { id: 'jo', label: '约旦', note: '中国、香港、澳门普通护照均可按官方表在抵达时办理签证，费用 40 JOD；停留期限待官方表进一步确认' },
  { id: 'tr', label: '土耳其', note: '中国普通护照 90 天、香港特区护照 90 天、澳门特区护照 30 天免签' },
  { id: 'eg', label: '埃及', note: '中国普通护照可走官方电子签；香港与澳门特区普通护照均有官方 90 天免签证据' },
/* PHASE_06_BATCH */
  { id: 'in', label: '印度', note: '三类普通护照均需取得适用印度签证；港澳领区正规旅游签证按改版官网要求办理，电子签资格、收费及实际停留期另核' },
  { id: 'lk', label: '斯里兰卡', note: '30 天双次 ETA；中国进入免费名单' },
  { id: 'np', label: '尼泊尔', note: '中国普通及 HKSAR 护照需签证但免费；澳门可进入官方落地签申请路线。旅游签证年度累计上限 150 天，单次期限须另核' },
  { id: 'bd', label: '孟加拉国', note: '中国普通及港澳特区护照可按中国公民国籍类别申请最多 30 天落地签；须满足口岸材料条件并经移民机关批准，不是免签或保证入境' },
  { id: 'mv', label: '马尔代夫', note: '旅游落地签与免费 IMUGA 申报并存' },
];

const coverageCatalogSummary = {
  jurisdictionCount: countryCatalog.count,
  policyZoneCount: policyZones.length,
  schengenMemberCount: policyZones.find((zone) => zone.id === 'eu-schengen')?.members.length ?? 0,
  officialSourceCount: registeredSources.length,
  verifiedSourceCount: registeredSources.filter((source) => source.status === 'verified').length,
  reachableSourceCount: registeredSources.filter((source) => source.status === 'reachable').length,
  blockedSourceCount: registeredSources.filter((source) => source.status === 'blocked').length,
  checkedAt: sourceRegistry.checkedAt,
  storedVerifiedPolicyRuleCount: policySeed.rules.filter((rule) => rule.status === 'verified').length,
  minimumPolicyCells: countryCatalog.count * countryCatalog.count * 7,
};

export function getCoverageSnapshot(now = new Date()) {
  const verifiedPolicyRuleCount = policySeed.rules.filter((rule) => isPolicyRuleCurrent(rule, now)).length;
  return {
    coverageSummary: {
      ...coverageCatalogSummary,
      verifiedPolicyRuleCount,
      reviewPolicyRuleCount: policySeed.rules.length - verifiedPolicyRuleCount,
    },
    latestPolicyBatch: policyBatchDescriptions.map((item) => ({
      ...item,
      ...summarizePolicyBatch(rulesByDestination(item.id), item.note, now),
    })),
  };
}

export const sourceStatusCopy: Record<SourceStatus, { label: string; description: string }> = {
  verified: { label: '规则已核验', description: '至少一条实际规则已经从该官方来源转录并检查。' },
  reachable: { label: '入口可访问', description: '已确认官方页面可访问，具体政策仍在采集队列中。' },
  blocked: { label: '需人工复核', description: '官方入口存在，但空白响应或安全验证阻止了直接核验。' },
};
