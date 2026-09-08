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
  { id: 'kr', label: '韩国', ruleCount: rulesByDestination('kr').length, note: 'K-ETA、C-3-9 与香港身份书分流' },
  { id: 'ae', label: '阿联酋', ruleCount: rulesByDestination('ae').length, note: '落地签与预先担保签证分流' },
  { id: 'cn', label: '中国内地', ruleCount: rulesByDestination('cn').length, note: '中国籍与非中国籍港澳居民通行证' },
  { id: 'us', label: '美国', ruleCount: rulesByDestination('us').length, note: 'CBP / DHS 官方 VWP 边界' },
  { id: 'ca', label: '加拿大', ruleCount: rulesByDestination('ca').length, note: '香港护照按航空、陆路、海路拆分' },
];

export const coverageSummary = {
  jurisdictionCount: countryCatalog.count,
  policyZoneCount: policyZones.length,
  schengenMemberCount: policyZones.find((zone) => zone.id === 'eu-schengen')?.members.length ?? 0,
  officialSourceCount: registeredSources.length,
  verifiedSourceCount: registeredSources.filter((source) => source.status === 'verified').length,
  reachableSourceCount: registeredSources.filter((source) => source.status === 'reachable').length,
  blockedSourceCount: registeredSources.filter((source) => source.status === 'blocked').length,
  checkedAt: sourceRegistry.checkedAt,
  verifiedPolicyRuleCount: policySeed.rules.length,
  minimumPolicyCells: countryCatalog.count * countryCatalog.count * 7,
};

export const sourceStatusCopy: Record<SourceStatus, { label: string; description: string }> = {
  verified: { label: '规则已核验', description: '至少一条实际规则已经从该官方来源转录并检查。' },
  reachable: { label: '入口可访问', description: '已确认官方页面可访问，具体政策仍在采集队列中。' },
  blocked: { label: '需浏览器核验', description: '官方入口存在，但自动请求被阻止，不能假装已经验证。' },
};
