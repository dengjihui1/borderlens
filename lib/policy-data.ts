import policies from '@/data/policies.seed.json';
import sources from '@/data/official-source-registry.json';
import countries from '@/data/countries.un-m49.json';
import zones from '@/data/policy-zones.json';
import { buildPolicyCatalog, destinationName } from './policy-catalog';
import { documentLabel, placeLabel, type Locale } from './locale';

export const policyDestinations = [
  ...countries.territories.map((item) => ({ id: item.id, label: `${destinationName(item.id)} / ${item.nameEn}` })),
  ...zones.zones.map((item) => ({ id: item.id, label: destinationName(item.id) })),
].sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));

export function policyDestinationOptions(locale: Locale) {
  return locale === 'zh' ? policyDestinations : policyDestinations.map(({ id }) => ({ id, label: placeLabel(id, 'en') })).sort((a, b) => a.label.localeCompare(b.label, 'en'));
}

export function policyDocumentOptions(entries: ReturnType<typeof getPolicyCatalog>, locale: Locale) {
  return [...new Map(entries.map((entry) => [entry.documentKey, locale === 'en' ? documentLabel(entry.documentKey, 'en') : entry.documentName])).entries()]
    .map(([id, label]) => ({ id, label }));
}

export function getPolicyCatalog(now = new Date()) {
  return buildPolicyCatalog(policies.rules, sources.sources, now);
}
