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
  { id: 'nz', label: '新西兰', ruleCount: rulesByDestination('nz').length, note: 'NZeTA 与中国护照澳洲出发例外' },
  { id: 'eu-schengen', label: '申根区', ruleCount: rulesByDestination('eu-schengen', true).length, note: '中国签证要求与港澳 90/180' },
  { id: 'sg', label: '新加坡', ruleCount: rulesByDestination('sg').length, note: '普通护照与身份书/旅行证分流' },
  { id: 'au', label: '澳大利亚', ruleCount: rulesByDestination('au').length, note: 'ETA 601 与 Visitor 600 路由' },
  { id: 'gb', label: '英国', ruleCount: rulesByDestination('gb').length, note: '官方问答路径逐项复现' },
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
