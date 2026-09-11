import countryCatalog from '@/data/countries.un-m49.json';
import sourceRegistry from '@/data/official-source-registry.json';
import policySeed from '@/data/policies.seed.json';
import policyZoneCatalog from '@/data/policy-zones.json';

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

export const latestPolicyBatch = [
  { id: 'co', label: '哥伦比亚', note: '中国普通护照有美国/申根条件免签；香港短期免签；澳门路线继续 REVIEW' },
  { id: 'pe', label: '秘鲁', note: '中国普通护照有第三国签证例外；香港免签；澳门路线继续 REVIEW' },
  { id: 'br', label: '巴西', note: '中国普通护照需 VIVIS 访问签证；港澳特区护照旅游最多 90 天免签' },
  { id: 'mx', label: '墨西哥', note: '中国普通护照需访问签证；香港与澳门特区护照旅游最多 90 天免签' },
  { id: 'qa', label: '卡塔尔', note: '中国、港澳列入官方 A1-3 路线；机场落地签或 Hayya A1' },
  { id: 'sa', label: '沙特', note: '中国（含港澳）列入官方旅游电子签合资格国家，最多 90 天' },
  { id: 'bh', label: '巴林', note: '中国、香港、澳门列入官方在线签证国家名单' },
  { id: 'om', label: '阿曼', note: '中国与香港返回 26A/26B 旅游签；澳门旅游分支继续 REVIEW' },
  { id: 'jo', label: '约旦', note: '官方区分受限/非受限国籍；电子签公开页未给目标护照完整结果，保留 REVIEW' },
  { id: 'tr', label: '土耳其', note: '中国普通护照 90 天、香港特区护照 90 天、澳门特区护照 30 天免签' },
  { id: 'eg', label: '埃及', note: '中国普通护照列入官方电子签资格表；港澳证件仍待完整路线复核' },
/* PHASE_06_BATCH */
  { id: 'in', label: '印度', note: '目标证件不在 eVisa 名单，普通签证路线待复核' },
  { id: 'lk', label: '斯里兰卡', note: '30 天双次 ETA；中国进入免费名单' },
  { id: 'np', label: '尼泊尔', note: '原落地签官方页 404，保留 REVIEW' },
  { id: 'bd', label: '孟加拉国', note: 'MRV 门户可用，国籍资格仍待复核' },
  { id: 'mv', label: '马尔代夫', note: '旅游落地签与免费 IMUGA 申报并存' },
].map((item) => {
  const rules = rulesByDestination(item.id);
  return {
    ...item,
    verifiedRuleCount: rules.filter((rule) => rule.status === 'verified').length,
    reviewRuleCount: rules.filter((rule) => rule.status !== 'verified').length,
  };
});

export const coverageSummary = {
  jurisdictionCount: countryCatalog.count,
  policyZoneCount: policyZones.length,
  schengenMemberCount: policyZones.find((zone) => zone.id === 'eu-schengen')?.members.length ?? 0,
  officialSourceCount: registeredSources.length,
  verifiedSourceCount: registeredSources.filter((source) => source.status === 'verified').length,
  reachableSourceCount: registeredSources.filter((source) => source.status === 'reachable').length,
  blockedSourceCount: registeredSources.filter((source) => source.status === 'blocked').length,
  checkedAt: sourceRegistry.checkedAt,
  verifiedPolicyRuleCount: policySeed.rules.filter((rule) => rule.status === 'verified').length,
  reviewPolicyRuleCount: policySeed.rules.filter((rule) => rule.status !== 'verified').length,
  minimumPolicyCells: countryCatalog.count * countryCatalog.count * 7,
};

export const sourceStatusCopy: Record<SourceStatus, { label: string; description: string }> = {
  verified: { label: '规则已核验', description: '至少一条实际规则已经从该官方来源转录并检查。' },
  reachable: { label: '入口可访问', description: '已确认官方页面可访问，具体政策仍在采集队列中。' },
  blocked: { label: '需人工复核', description: '官方入口存在，但空白响应或安全验证阻止了直接核验。' },
};
