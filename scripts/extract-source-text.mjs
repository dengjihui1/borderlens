const [url, ...terms] = process.argv.slice(2);
if (!url || terms.length === 0) {
  console.error('Usage: node scripts/extract-source-text.mjs URL TERM...');
  process.exit(1);
}

const response = await fetch(url, { headers: { 'user-agent': 'BorderLens evidence collector/0.3' } });
console.log(`HTTP ${response.status} ${response.url}`);
const html = await response.text();
const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

for (const term of terms) {
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  console.log(`\n--- ${term} ---`);
  console.log(index < 0 ? 'NOT FOUND' : text.slice(Math.max(0, index - 320), index + term.length + 720));
}
