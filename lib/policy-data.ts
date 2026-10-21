import policies from '@/data/policies.seed.json';
import sources from '@/data/official-source-registry.json';
import countries from '@/data/countries.un-m49.json';
import zones from '@/data/policy-zones.json';
import { buildPolicyCatalog, destinationName } from './policy-catalog';

export const policyDestinations = [
  ...countries.territories.map((item) => ({ id: item.id, label: `${destinationName(item.id)} / ${item.nameEn}` })),
  ...zones.zones.map((item) => ({ id: item.id, label: destinationName(item.id) })),
].sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));

export function getPolicyCatalog(now = new Date()) {
  return buildPolicyCatalog(policies.rules, sources.sources, now);
}
