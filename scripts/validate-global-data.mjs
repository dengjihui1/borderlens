import { readFile } from 'node:fs/promises';

const countries = JSON.parse(await readFile(new URL('../data/countries.un-m49.json', import.meta.url), 'utf8'));
const registry = JSON.parse(await readFile(new URL('../data/official-source-registry.json', import.meta.url), 'utf8'));
const policies = JSON.parse(await readFile(new URL('../data/policies.seed.json', import.meta.url), 'utf8'));

const errors = [];
const iso2 = new Set(countries.territories.map((item) => item.iso2.toLowerCase()));
if (countries.count !== countries.territories.length) errors.push('Country count does not match rows');
if (countries.territories.length < 240) errors.push('UN M49 catalog is unexpectedly small');
if (iso2.size !== countries.territories.length) errors.push('Duplicate ISO alpha-2 jurisdiction code');

for (const source of registry.sources) {
  if (!source.url.startsWith('https://')) errors.push(`${source.id}: source URL is not HTTPS`);
  if (source.jurisdictionId && source.jurisdictionId !== 'eu-schengen' && !iso2.has(source.jurisdictionId)) errors.push(`${source.id}: unknown jurisdiction ${source.jurisdictionId}`);
}
if (new Set(registry.sources.map((item) => item.id)).size !== registry.sources.length) errors.push('Duplicate source id');
if (new Set(registry.sources.map((item) => item.url)).size !== registry.sources.length) errors.push('Duplicate source URL');

const sourceIds = new Set(registry.sources.map((item) => item.id));
for (const rule of policies.rules) {
  if (!iso2.has(rule.destinationJurisdictionId)) errors.push(`${rule.id}: unknown destination jurisdiction`);
  if (!iso2.has(rule.documentIssuerJurisdictionId)) errors.push(`${rule.id}: unknown issuer jurisdiction`);
  for (const sourceId of rule.sourceIds) if (!sourceIds.has(sourceId)) errors.push(`${rule.id}: unknown source ${sourceId}`);
  if (rule.status === 'verified' && rule.sourceIds.length === 0) errors.push(`${rule.id}: verified rule has no source`);
}
if (new Set(policies.rules.map((item) => item.id)).size !== policies.rules.length) errors.push('Duplicate policy rule id');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const statusCounts = Object.groupBy(registry.sources, (source) => source.status);
console.log(JSON.stringify({ jurisdictions: countries.count, sources: registry.sources.length, verifiedPolicyRules: policies.rules.length, sourceStatuses: Object.fromEntries(Object.entries(statusCounts).map(([key, value]) => [key, value.length])) }, null, 2));
