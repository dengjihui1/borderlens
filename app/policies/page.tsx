import Link from 'next/link';
import { ArrowLeft, Database, FileSearch } from 'lucide-react';
import { filterPolicyCatalog, getCatalogPage, getReviewQueue, modeNames, parseCatalogFilters, purposeNames } from '@/lib/policy-catalog';
import { getPolicyCatalog, policyDestinations } from '@/lib/policy-data';
import { PolicyCard } from '@/components/policy-card';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'BorderLens｜证件规则查询与复核队列' };

export default async function PoliciesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const now = new Date();
  const entries = getPolicyCatalog(now);
  const documents = [...new Map(entries.map((entry) => [entry.documentKey, entry.documentName])).entries()];
  const params = await searchParams;
  const { filters, errors } = parseCatalogFilters(params, documents.map(([key]) => key), policyDestinations.map((item) => item.id));
  const matching = errors.length ? [] : filterPolicyCatalog(entries, filters);
  const results = filters.state === 'review' ? getReviewQueue(matching) : matching;
  const pagination = getCatalogPage(results, params.page);
  if (pagination.invalid) errors.push('page');
  const pageUrl = (page: number) => `/policies?${new URLSearchParams({ ...filters, page: String(page) })}`;
  const queue = getReviewQueue(entries);
  const evidenceCurrent = entries.filter((entry) => entry.evidenceCurrent).length;
  return (
    <main className="coverage-page policy-page">
      <header className="topbar coverage-nav">
        <Link className="brand" href="/"><span className="brand-mark"><Database size={19} /></span><span>BorderLens</span></Link>
        <div className="source-note">按实际证件查规则 · 不代表个人已获准入境</div>
        <Link className="plain-link" href="/coverage"><ArrowLeft size={14} /> 覆盖与来源</Link>
      </header>
      <section className="policy-heading">
        <p className="eyebrow">DOCUMENT POLICY EXPLORER</p>
        <h1>已有规则，真正查得到。</h1>
        <p>逐条查看证件范围、交通方式、附加条件和官方证据。只查询已录入的窄规则，不根据居民身份猜护照待遇。</p>
        <nav className="policy-tabs" aria-label="规则视图">
          <Link href="/policies">全部 {entries.length} 条</Link>
          <Link href="/policies?state=current">当前可展示结论 {entries.length - queue.length} 条</Link>
          <Link href="/policies?state=review">复核队列 {queue.length} 条</Link>
          <Link href="/">逐段行程自查</Link>
        </nav>
      </section>
      <section className="policy-content">
        <aside className="policy-boundary">
          <strong>这是规则查询，不是登机或入境许可。</strong>
          <p>每条“当前”仅表示核验窗口内有官方证据，仍须满足该条全部条件；不会自动判断你的签证、居留资格或口岸例外。未收录不等于免签，也不等于禁止入境。申根规则须明确选择“申根政策区”，不沿用已过期的成员映射。</p>
          <p>截至 {now.toISOString().slice(0, 10)}：{evidenceCurrent} 条证据在有效期内；其中 {entries.filter((entry) => entry.reason === 'conditional_review').length} 条仍需个体条件核验。日期过期或证据不足时隐藏历史结论。</p>
        </aside>
        <form className="policy-filters" action="/policies" method="get">
          <label className="field"><span>实际旅行证件 / 身份范围</span><select name="document" defaultValue={filters.document}><option value="">全部已录入证件</option>{documents.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label className="field"><span>目的地 / 明确政策区</span><select name="destination" defaultValue={filters.destination}><option value="">全部目的地</option>{policyDestinations.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="field"><span>旅行目的</span><select name="purpose" defaultValue={filters.purpose}><option value="">全部目的</option>{Object.entries(purposeNames).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label className="field"><span>交通方式（不确定时不筛选）</span><select name="mode" defaultValue={filters.mode}><option value="">全部交通范围</option>{['air', 'land', 'sea'].map((key) => <option key={key} value={key}>{modeNames[key]}</option>)}</select></label>
          <label className="field"><span>结论状态</span><select name="state" defaultValue={filters.state}><option value="">全部状态</option><option value="current">当前可展示结论</option><option value="review">REVIEW / 复核队列</option></select></label>
          <div className="policy-filter-actions"><button type="submit" className="primary-button"><FileSearch size={17} />查询规则</button><Link href="/policies">重置筛选</Link></div>
        </form>
        <div className="policy-results-heading"><h2>匹配 {results.length} 条规则</h2><span>逐条核验日期，不使用全库统一日期</span></div>
        {errors.length > 0 && <p className="policy-empty" role="alert">筛选参数无效或重复：{errors.join('、')}。未返回宽泛结果，请重置筛选。</p>}
        {!errors.length && !results.length && <div className="policy-empty"><h3>这组条件尚无受控规则</h3><p>请前往目的地政府或使领馆核对；不要从“无结果”推断签证要求。特殊旅行证件不能套用普通护照规则，学习 / 工作不能套用旅游规则。</p><Link href="/coverage">查看已登记官方入口</Link></div>}
        <div className="policy-results">{(!errors.length ? pagination.entries : []).map((entry) => <PolicyCard key={entry.id} entry={entry} />)}</div>
        {!errors.length && results.length > 0 && <nav className="policy-pagination" aria-label="规则查询分页">
          {pagination.page > 1 && <Link href={pageUrl(pagination.page - 1)}>← 上一页</Link>}
          <span>第 {pagination.page} / {pagination.totalPages} 页 · 每页最多 12 条</span>
          {pagination.page < pagination.totalPages && <Link href={pageUrl(pagination.page + 1)}>下一页 →</Link>}
        </nav>}
      </section>
      <footer><span>BorderLens · 证据优先，不猜资格</span><span>只读查询 · 不保存个人信息 · 不办理或提交签证</span></footer>
    </main>
  );
}
