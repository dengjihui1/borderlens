'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileCheck2, Plus, Printer, Route, ShieldCheck, Trash2 } from 'lucide-react';
import { destinationName, purposeNames, type CatalogEntry } from '@/lib/policy-catalog';
import { evaluateCatalogJourney, journeyDocumentName, type CatalogJourney, type CatalogJourneyResult, type JourneyLeg } from '@/lib/journey-catalog';
import { PolicyCard } from './policy-card';

type Option = { id: string; label: string };
const newLeg = (document: string, date: string, destination = ''): JourneyLeg => ({ destination, document, date, purpose: 'tourism', mode: 'air', entry: 'entry', basis: 'visit', port: '' });
const initialJourney = (today: string): CatalogJourney => ({ origin: 'hk', documents: ['hk:hksar_passport'], documentsValid: false, legs: [newLeg('hk:hksar_passport', today, 'jp')] });

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

export function JourneyWorkbench({ entries, destinations, documents, today }: { entries: CatalogEntry[]; destinations: Option[]; documents: Option[]; today: string }) {
  const options = useMemo(() => ({ destinations: destinations.map((item) => item.id), documents: documents.map((item) => item.id) }), [destinations, documents]);
  const [input, setInput] = useState<CatalogJourney>(() => initialJourney(today));
  const [submitted, setSubmitted] = useState<CatalogJourney | null>(null);
  const [result, setResult] = useState<CatalogJourneyResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [generation, setGeneration] = useState(0);
  const dirty = submitted !== null && JSON.stringify(input) !== JSON.stringify(submitted);
  const currentCount = entries.filter((entry) => entry.conclusion).length;

  const generate = (value: CatalogJourney) => {
    const evaluation = evaluateCatalogJourney(value, entries, options);
    setErrors(evaluation.errors);
    setResult(evaluation.result);
    setSubmitted(evaluation.result ? structuredClone(value) : null);
    setGeneration((count) => count + 1);
  };
  useEffect(() => {
    if (!submitted) return;
    const refresh = () => {
      const evaluation = evaluateCatalogJourney(submitted, entries, options);
      setErrors(evaluation.errors);
      setResult(evaluation.result);
    };
    const timer = window.setInterval(refresh, 60000);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [submitted, entries, options]);

  const updateLeg = (index: number, patch: Partial<JourneyLeg>) => setInput((value) => ({ ...value, legs: value.legs.map((leg, i) => i === index ? { ...leg, ...patch } : leg) }));
  const toggleDocument = (key: string) => setInput((value) => ({ ...value, documents: value.documents.includes(key) ? value.documents.filter((item) => item !== key) : [...value.documents, key] }));
  const addLeg = (destination = '') => setInput((value) => value.legs.length >= 8 ? value : { ...value, legs: [...value.legs, newLeg(value.documents[0] ?? '', value.legs.at(-1)?.date || today, destination)] });
  const applyExample = (kind: 'roundtrip' | 'transit' | 'permit') => {
    const sample = initialJourney(today);
    if (kind === 'roundtrip') sample.legs.push({ ...newLeg('hk:hksar_passport', today, 'hk'), basis: 'residence' });
    if (kind === 'transit') {
      sample.origin = 'gb'; sample.documents = ['cn:ordinary_passport'];
      sample.legs = [{ ...newLeg('cn:ordinary_passport', today, 'hk'), entry: 'unknown' }, newLeg('cn:ordinary_passport', today, 'jp'), { ...newLeg('cn:ordinary_passport', today, 'gb'), basis: 'residence' }];
    }
    if (kind === 'permit') {
      sample.origin = 'mo'; sample.documents = ['mo:macao_sar_passport', 'mo:home_return_permit'];
      sample.legs = [{ ...newLeg('mo:home_return_permit', today, 'cn'), purpose: 'other', mode: 'land' }];
    }
    setInput(sample); setSubmitted(null); setResult(null); setErrors([]);
  };

  return <main className="coverage-page journey-page">
    <header className="topbar coverage-nav">
      <Link className="brand" href="/"><span className="brand-mark"><Route size={19} /></span><span>BorderLens</span></Link>
      <div className="source-note"><ShieldCheck size={15} />证据优先 · 不猜个人资格</div>
      <Link className="plain-link" href="/policies">证件规则查询 <ArrowRight size={14} /></Link>
    </header>
    <section className="policy-heading journey-heading">
      <p className="eyebrow">YOUR DOCUMENTS. EVERY BORDER.</p>
      <h1>把证件和行程，逐段对上。</h1>
      <p>不是一句“免签”就能出发。每一段选实际证件、交通方式、日期与入境依据，拿到可追溯的规则、条件和待办。</p>
      <nav className="policy-tabs" aria-label="工具导航"><Link href="/policies">完整规则 {entries.length} 条</Link><Link href="/policies?state=current">当前可展示结论 {currentCount} 条</Link><Link href="/policies?state=review">待复核 {entries.length - currentCount} 条</Link><Link href="/coverage">覆盖与官方来源</Link><Link href="/demo">旧版演示</Link></nav>
    </section>
    <div className="journey-shell">
      <aside className="policy-boundary"><strong>这是出发前自查，不是自动通关判定。</strong><p>空侧转机、居民 / 公民返境、出境要求及个人第三国资格保留人工复核。日期按 UTC 日终保守核验；超出证据复核窗口或临时条款截止，隐藏结论。勾选自查不会变成 READY，不计算历史 90/180 或年度累计。</p></aside>
      <div className="journey-examples" aria-label="载入行程示例"><span>从例子开始</span><button type="button" onClick={() => applyExample('roundtrip')}>香港 ⇄ 日本</button><button type="button" onClick={() => applyExample('transit')}>英国 → 香港 → 日本 → 英国</button><button type="button" onClick={() => applyExample('permit')}>澳门 → 内地 · 回乡证</button></div>
      <noscript><p className="policy-empty">逐段行程计算需要 JavaScript。你仍可直接使用<Link href="/policies">服务端规则查询</Link>核对证件和官方证据。</p></noscript>
      <form className="journey-builder" autoComplete="off" onSubmit={(event) => { event.preventDefault(); generate(input); }}>
        <div className="journey-builder-heading"><div><p className="step-kicker">01 / YOUR DOCUMENT WALLET</p><h2>只选实际携带的证件</h2></div><span>仅当前页面，不保存</span></div>
        <div className="journey-wallet">{documents.map((item) => <label key={item.id} className="wallet-choice"><input type="checkbox" checked={input.documents.includes(item.id)} onChange={() => toggleDocument(item.id)} /><span>{item.label}</span></label>)}</div>
        <div className="journey-origin"><Field label="实际出发国家或地区"><select value={input.origin} onChange={(event) => setInput((value) => ({ ...value, origin: event.target.value }))}>{destinations.filter((item) => item.id !== 'eu-schengen').map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field><label className="journey-validity"><input type="checkbox" checked={input.documentsValid} onChange={(event) => setInput((value) => ({ ...value, documentsValid: event.target.checked }))} />已自查所选证件全程有效；不等于满足每个目的地的剩余有效期要求</label></div>
        <div className="journey-builder-heading"><div><p className="step-kicker">02 / EVERY BORDER NODE</p><h2>按实际顺序，加入每个节点</h2></div><span>最多 8 段 · 返程和返程转机都要添加</span></div>
        <div className="journey-leg-list">{input.legs.map((leg, index) => <fieldset className="journey-leg" key={index}>
          <legend>第 {index + 1} 段 · 从 {destinationName(index === 0 ? input.origin : input.legs[index - 1].destination || '待选择')}</legend>
          <div className="journey-leg-fields">
            <Field label="抵达国家 / 地区或明确政策区"><select required value={leg.destination} onChange={(event) => updateLeg(index, { destination: event.target.value })}><option value="">选择本段目的地</option>{destinations.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field>
            <Field label="本段实际使用证件"><select required value={input.documents.includes(leg.document) ? leg.document : ''} onChange={(event) => updateLeg(index, { document: event.target.value })}><option value="">从已选证件中选择</option>{documents.filter((item) => input.documents.includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field>
            <Field label="计划抵达日期（不预测未来政策）"><input type="date" required min={index === 0 ? today : input.legs[index - 1].date || today} value={leg.date} onChange={(event) => updateLeg(index, { date: event.target.value })} /></Field>
            <Field label="本段交通方式"><select value={leg.mode} onChange={(event) => updateLeg(index, { mode: event.target.value as JourneyLeg['mode'], entry: event.target.value !== 'air' && leg.entry === 'airside' ? 'unknown' : leg.entry })}><option value="air">航空</option><option value="land">陆路</option><option value="sea">海路</option></select></Field>
            <Field label="是否在本段目的地入境"><select value={leg.entry} onChange={(event) => updateLeg(index, { entry: event.target.value as JourneyLeg['entry'] })}><option value="entry">需要入境（包括转机入境）</option><option value="unknown">还不确定</option>{leg.mode === 'air' && <option value="airside">不入境 / 空侧转机</option>}</select></Field>
            <Field label="入境依据（居民返境不套用访客规则）"><select value={leg.basis} onChange={(event) => updateLeg(index, { basis: event.target.value as JourneyLeg['basis'] })}><option value="visit">短期访问 / 所选通行证路线</option><option value="residence">居民身份返境</option><option value="citizen">公民身份返境</option></select></Field>
            <Field label="本段旅行目的"><select value={leg.purpose} onChange={(event) => updateLeg(index, { purpose: event.target.value as JourneyLeg['purpose'] })}>{Object.entries(purposeNames).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
            <Field label="实际机场 / 口岸备注（可空，不自动验证）"><input type="text" value={leg.port} maxLength={80} placeholder="仅填口岸，不填姓名或证件号码" onChange={(event) => updateLeg(index, { port: event.target.value })} /></Field>
          </div>
          {input.legs.length > 1 && <button className="journey-remove" type="button" onClick={() => setInput((value) => ({ ...value, legs: value.legs.filter((_, i) => i !== index) }))}><Trash2 size={14} />移除第 {index + 1} 段</button>}
        </fieldset>)}</div>
        <div className="journey-builder-actions"><button type="button" className="journey-secondary" disabled={input.legs.length >= 8} onClick={() => addLeg()}><Plus size={16} />添加下一段 / 转机</button><button type="button" className="journey-secondary" disabled={input.legs.length >= 8} onClick={() => addLeg(input.origin)}>添加返程目的地</button><button type="submit" className="primary-button"><FileCheck2 size={18} />生成逐段自查清单 <ArrowRight size={16} /></button></div>
        <p className="privacy-line">表单和勾选仅在当前浏览器内存中计算，刷新即清空；不上传证件、不记录行程、不调用 AI 接口。不要填写个人资料。</p>
      </form>
      <section className="journey-results" aria-live="polite" aria-label="逐段自查结果">
        {errors.length > 0 && <div className="policy-empty" role="alert"><h2>请先修正行程</h2><ul>{errors.map((error, index) => <li key={index}>{error}</li>)}</ul><p>没有返回宽泛结果。</p></div>}
        {!result && !errors.length && <div className="journey-empty"><Route size={30} /><h2>下一步，生成你的逐段清单。</h2><p>先核对上方实际证件和日期；示例不会替你确认资格。规则覆盖不到的节点会明确保留 REVIEW。</p></div>}
        {dirty && <output className="stale-warning">表单已修改，以下仍为上次结果。请重新生成；旧结果不能代表新行程。</output>}
        {result && <div key={generation} className={dirty ? 'journey-result-dirty' : ''}>
          <div className="journey-result-heading"><div><p className="step-kicker">03 / YOUR PREFLIGHT CHECKLIST</p><h2>{result.headline}</h2><p>{result.summary}</p><small>计算于 {result.generatedAt} · 规则会到期，出发前须重新查询</small></div><button type="button" className="journey-secondary" disabled={dirty} onClick={() => window.print()}><Printer size={16} />打印自查清单</button></div>
          {result.steps.map((step) => <section className="journey-result-step" key={step.index}>
            <div className="journey-step-heading"><div><p className="step-kicker">节点 {step.index + 1} · {step.leg.date}</p><h3>{step.title}</h3><p>{journeyDocumentName(step.leg.document)} · {step.leg.basis === 'visit' ? purposeNames[step.leg.purpose] : '居民 / 公民返境'}</p></div><span className={`source-status ${step.status === 'conditions' ? 'source-reachable' : 'source-blocked'}`}>{step.status === 'conditions' ? '有当前依据 · 条件待核' : 'REVIEW'}</span></div>
            <p className="journey-step-reason">{step.reason}</p>
            <div className="journey-tasks"><h4>出发前待核事项 · 勾选不代表通过</h4><ul className="journey-checklist">{step.tasks.map((task) => <li key={task}><label><input type="checkbox" />{task}</label></li>)}</ul></div>
            <div className="policy-results">{step.policies.map((entry) => <PolicyCard key={entry.id} entry={entry} checklist idPrefix={`leg-${step.index}-`} reviewNote={entry.journeyReviewNote} />)}</div>
            {!step.policies.length && <p className="journey-handoff">不生成猜测规则。<Link href="/coverage">查看官方来源入口</Link>，按本段实际身份和口岸人工核验。</p>}
          </section>)}
        </div>}
      </section>
    </div>
    <footer><span>BorderLens · 官方证据与逐段自查</span><span>不代办 · 不保存个人信息 · 不保证登机或入境</span></footer>
  </main>;
}
