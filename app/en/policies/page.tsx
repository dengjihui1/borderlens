import Link from '@/components/local-link';
import { ArrowLeft, Database, FileSearch } from 'lucide-react';
import { filterPolicyCatalog, getCatalogPage, getReviewQueue, parseCatalogFilters } from '@/lib/policy-catalog';
import { getPolicyCatalog, policyDestinationOptions, policyDocumentOptions } from '@/lib/policy-data';
import { modeLabel, purposeLabel } from '@/lib/locale';
import { LanguageSwitch } from '@/components/language-switch';
import { PolicyCard } from '@/components/policy-card';

export const dynamic = 'force-dynamic';

export default async function EnglishPoliciesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const now = new Date();
  const entries = getPolicyCatalog(now);
  const documents = policyDocumentOptions(entries, 'en');
  const destinations = policyDestinationOptions('en');
  const params = await searchParams;
  const { filters, errors } = parseCatalogFilters(params, documents.map((item) => item.id), destinations.map((item) => item.id));
  const matching = errors.length ? [] : filterPolicyCatalog(entries, filters);
  const results = filters.state === 'review' ? getReviewQueue(matching) : matching;
  const pagination = getCatalogPage(results, params.page);
  if (pagination.invalid) errors.push('page');
  const pageUrl = (page: number) => `/en/policies?${new URLSearchParams({ ...filters, page: String(page) })}`;
  const switchQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (typeof value === 'string') switchQuery.set(key, value);
  const queue = getReviewQueue(entries);
  const evidenceCurrent = entries.filter((entry) => entry.evidenceCurrent).length;
  return <main className="coverage-page policy-page">
    <header className="topbar coverage-nav"><Link className="brand" href="/en"><span className="brand-mark"><Database size={19} /></span><span>BorderLens</span></Link><div className="source-note">Official sources · per-rule evidence</div><div className="header-actions"><LanguageSwitch locale="en" path="/policies" query={switchQuery.size ? `?${switchQuery}` : ''} /><Link className="plain-link" href="/en"><ArrowLeft size={14} /> Route checklist</Link></div></header>
    <section className="policy-heading"><h1>Travel-document rules</h1><p>Filter by actual document and destination. Read conditions and official sources.</p><nav className="policy-tabs" aria-label="Rule views"><Link href="/en/policies">All {entries.length} rules</Link><Link href="/en/policies?state=current">Current outcomes {entries.length - queue.length}</Link><Link href="/en/policies?state=review">Needs review {queue.length}</Link></nav></section>
    <section className="policy-content"><aside className="policy-boundary"><strong>A current rule does not mean you personally qualify. No result means neither visa-free entry nor a ban.</strong><details><summary>Read the limits</summary><p>“Current” means official evidence is within its review window. All recorded conditions still apply. This site does not assess personal visas, residence rights or port exceptions. Select the Schengen policy area explicitly; no expired country mapping is reused.</p><p>As of {now.toISOString().slice(0, 10)}: {evidenceCurrent} rules have current evidence; {entries.filter((entry) => entry.reason === 'conditional_review').length} still require individual review. Expired or insufficient evidence hides historical outcomes.</p></details></aside>
      <form className="policy-filters" action="/en/policies" method="get">
        <label className="field"><span>Actual travel document</span><select name="document" defaultValue={filters.document}><option value="">All recorded documents</option>{documents.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label className="field"><span>Destination / policy area</span><select name="destination" defaultValue={filters.destination}><option value="">All destinations</option>{destinations.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label className="field"><span>Purpose</span><select name="purpose" defaultValue={filters.purpose}><option value="">All purposes</option>{['tourism', 'business', 'study-work', 'other'].map((key) => <option key={key} value={key}>{purposeLabel(key, 'en')}</option>)}</select></label>
        <label className="field"><span>Travel mode</span><select name="mode" defaultValue={filters.mode}><option value="">Any / unsure</option>{['air', 'land', 'sea'].map((key) => <option key={key} value={key}>{modeLabel(key, 'en')}</option>)}</select></label>
        <label className="field"><span>Outcome status</span><select name="state" defaultValue={filters.state}><option value="">All statuses</option><option value="current">Current displayed outcomes</option><option value="review">REVIEW queue</option></select></label>
        <div className="policy-filter-actions"><button type="submit" className="primary-button"><FileSearch size={17} />Search rules</button><Link href="/en/policies">Reset filters</Link></div>
      </form>
      <div className="policy-results-heading"><h2>Matching {results.length} rules</h2><span>Each rule has its own review date</span></div>
      {errors.length > 0 && <p className="policy-empty" role="alert">Invalid or duplicate filters: {errors.join(', ')}. No broader result was returned. Reset the filters.</p>}
      {!errors.length && !results.length && <div className="policy-empty"><h3>No controlled rule for this combination</h3><p>Check the destination government or consulate. Never infer a visa requirement from an empty result. Special documents do not inherit ordinary-passport rules, and study or work cannot use tourism rules.</p><Link href="/en/coverage">Open official-source registry</Link></div>}
      <div className="policy-results">{(!errors.length ? pagination.entries : []).map((entry) => <PolicyCard key={entry.id} entry={entry} locale="en" />)}</div>
      {!errors.length && results.length > 0 && <nav className="policy-pagination" aria-label="Rule pages">{pagination.page > 1 && <Link href={pageUrl(pagination.page - 1)}>← Previous</Link>}<span>Page {pagination.page} / {pagination.totalPages} · up to 12 per page</span>{pagination.page < pagination.totalPages && <Link href={pageUrl(pagination.page + 1)}>Next →</Link>}</nav>}
    </section><footer><span>BorderLens · evidence first, no guessed eligibility</span><span>Read-only · no personal data saved · no visa applications</span></footer>
  </main>;
}
