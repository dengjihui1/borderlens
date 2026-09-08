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
