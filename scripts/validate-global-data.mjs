import { readFile } from 'node:fs/promises';

const countries = JSON.parse(await readFile(new URL('../data/countries.un-m49.json', import.meta.url), 'utf8'));
const registry = JSON.parse(await readFile(new URL('../data/official-source-registry.json', import.meta.url), 'utf8'));
const policies = JSON.parse(await readFile(new URL('../data/policies.seed.json', import.meta.url), 'utf8'));
const policyZones = JSON.parse(await readFile(new URL('../data/policy-zones.json', import.meta.url), 'utf8'));

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
const verifiedSourceIds = new Set(registry.sources.filter((item) => item.status === 'verified').map((item) => item.id));
const policyZoneIds = new Set(policyZones.zones.map((item) => item.id));
const millisecondsPerDay = 24 * 60 * 60 * 1000;

for (const zone of policyZones.zones) {
  if (new Set(zone.members).size !== zone.members.length) errors.push(`${zone.id}: duplicate policy-zone member`);
  for (const member of zone.members) if (!iso2.has(member)) errors.push(`${zone.id}: unknown member ${member}`);
  for (const sourceId of zone.sourceIds) if (!sourceIds.has(sourceId)) errors.push(`${zone.id}: unknown source ${sourceId}`);
  if (!zone.evidenceLocator?.trim() || !zone.evidenceExcerpt?.trim()) errors.push(`${zone.id}: policy zone has no evidence`);
  if (zone.reviewDueAt < policyZones.checkedAt) errors.push(`${zone.id}: review due date predates check date`);
}
if (policyZoneIds.size !== policyZones.zones.length) errors.push('Duplicate policy zone id');

for (const rule of policies.rules) {
  const hasJurisdiction = typeof rule.destinationJurisdictionId === 'string';
  const hasPolicyZone = typeof rule.destinationPolicyZoneId === 'string';
  if (hasJurisdiction === hasPolicyZone) errors.push(`${rule.id}: must have exactly one destination jurisdiction or policy zone`);
  if (hasJurisdiction && !iso2.has(rule.destinationJurisdictionId)) errors.push(`${rule.id}: unknown destination jurisdiction`);
  if (hasPolicyZone && !policyZoneIds.has(rule.destinationPolicyZoneId)) errors.push(`${rule.id}: unknown destination policy zone`);
  if (!iso2.has(rule.documentIssuerJurisdictionId)) errors.push(`${rule.id}: unknown issuer jurisdiction`);
  for (const sourceId of rule.sourceIds) if (!sourceIds.has(sourceId)) errors.push(`${rule.id}: unknown source ${sourceId}`);
  if (rule.status === 'verified') {
    if (rule.sourceIds.length === 0) errors.push(`${rule.id}: verified rule has no source`);
    if (!rule.sourceIds.some((sourceId) => verifiedSourceIds.has(sourceId))) errors.push(`${rule.id}: verified rule has no verified source`);
    if (!rule.evidenceLocator?.trim()) errors.push(`${rule.id}: verified rule has no evidence locator`);
    if (!rule.evidenceExcerpt?.trim()) errors.push(`${rule.id}: verified rule has no evidence excerpt`);
    if (!rule.checkedAt) errors.push(`${rule.id}: verified rule has no checked date`);
  }
  const checkedAt = Date.parse(`${rule.checkedAt}T00:00:00Z`);
  const reviewDueAt = Date.parse(`${rule.reviewDueAt}T00:00:00Z`);
  if (!Number.isFinite(checkedAt) || !Number.isFinite(reviewDueAt)) errors.push(`${rule.id}: invalid check or review date`);
  else {
    if (reviewDueAt < checkedAt) errors.push(`${rule.id}: review due date predates check date`);
    if (reviewDueAt - checkedAt > 30 * millisecondsPerDay) errors.push(`${rule.id}: review interval exceeds 30 days`);
  }
}
if (new Set(policies.rules.map((item) => item.id)).size !== policies.rules.length) errors.push('Duplicate policy rule id');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const statusCounts = Object.groupBy(registry.sources, (source) => source.status);
console.log(JSON.stringify({ jurisdictions: countries.count, policyZones: policyZones.zones.length, sources: registry.sources.length, verifiedPolicyRules: policies.rules.filter((rule) => rule.status === 'verified').length, reviewPolicyRules: policies.rules.filter((rule) => rule.status !== 'verified').length, sourceStatuses: Object.fromEntries(Object.entries(statusCounts).map(([key, value]) => [key, value.length])) }, null, 2));
