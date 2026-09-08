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
  { id: 'th', label: '泰国', note: '60 天免签与 TDAC 入境卡并存' },
  { id: 'my', label: '马来西亚', note: '港澳护照、身份书与旅行证分流' },
  { id: 'id', label: '印度尼西亚', note: 'A1 免签与 B1 落地签分流' },
  { id: 'vn', label: '越南', note: '官方 eVisa 页面空白，保留 REVIEW' },
  { id: 'ph', label: '菲律宾', note: 'DFA 安全验证阻挡，保留 REVIEW' },
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
