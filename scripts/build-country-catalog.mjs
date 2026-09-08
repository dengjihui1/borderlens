import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_URL = 'https://unstats.un.org/unsd/methodology/m49/overview/';
const CHECKED_AT = '2026-09-08';

const decode = (value) => value
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ')
  .trim();

const response = await fetch(SOURCE_URL, { headers: { 'user-agent': 'BorderLens source catalog builder/0.2' } });
if (!response.ok) throw new Error(`UN M49 fetch failed: ${response.status}`);
const html = await response.text();
const table = html.match(/<table[^>]+id\s*=\s*["']downloadTableEN["'][\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i)?.[1];
if (!table) throw new Error('UN M49 English table not found');

const territories = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) => {
  const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => decode(cell[1]));
  return {
    id: cells[10]?.toLowerCase(),
    nameEn: cells[8],
    m49Code: cells[9],
    iso2: cells[10],
    iso3: cells[11],
    regionCode: cells[2] || null,
    regionName: cells[3] || null,
    subregionCode: cells[4] || null,
    subregionName: cells[5] || null,
    intermediateRegionCode: cells[6] || null,
    intermediateRegionName: cells[7] || null,
  };
}).filter((item) => item.iso2 && item.iso3 && item.m49Code);

if (territories.length < 240) throw new Error(`Expected at least 240 UN M49 entries, received ${territories.length}`);
if (new Set(territories.map((item) => item.iso2)).size !== territories.length) throw new Error('Duplicate ISO alpha-2 codes detected');

const output = {
  schemaVersion: 1,
  source: { authority: 'United Nations Statistics Division', title: 'Standard country or area codes for statistical use (M49)', url: SOURCE_URL, checkedAt: CHECKED_AT },
  count: territories.length,
  territories,
};

await mkdir(path.resolve('data'), { recursive: true });
await writeFile(path.resolve('data/countries.un-m49.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Wrote ${territories.length} UN M49 countries and areas`);
