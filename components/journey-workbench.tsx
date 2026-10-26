'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from './local-link';
import { ArrowRight, FileCheck2, Plus, Printer, Route, ShieldCheck, Trash2 } from 'lucide-react';
import type { CatalogEntry } from '@/lib/policy-catalog';
import { evaluateCatalogJourney, type CatalogJourney, type CatalogJourneyResult, type JourneyLeg } from '@/lib/journey-catalog';
import { documentLabel, journeyError, journeyText, localePath, placeLabel, purposeLabel, type Locale } from '@/lib/locale';
import { LanguageSwitch } from './language-switch';
import { PolicyCard } from './policy-card';

type Option = { id: string; label: string };
const newLeg = (document: string, date: string, destination = ''): JourneyLeg => ({ destination, document, date, purpose: 'tourism', mode: 'air', entry: 'entry', basis: 'visit', port: '' });
const initialJourney = (today: string): CatalogJourney => ({ origin: '', documents: [], documentsValid: false, legs: [newLeg('', today)] });

const copy = {
  zh: {
    source: '基于官方来源', rules: '查单条规则', title: '逐段核对入境规则', intro: '选实际证件与行程，查看每段条件和官方来源。', start: '开始自查',
    warning: '仅供出发前自查，不是入境许可；REVIEW 须向官方核对。', warningMore: '查看适用边界', warningDetail: '空侧转机、居民 / 公民返境、出境要求及个人第三国资格保留人工复核。日期按 UTC 日终保守核验；超出证据复核窗口或临时条款截止，隐藏结论。勾选自查不会变成 READY，不计算历史 90/180 或年度累计。',
    examples: '试用示例', roundtrip: '香港 ⇄ 日本', transit: '英国 → 香港 → 日本 → 英国', permit: '澳门 → 内地 · 回乡证',
    noScript: '逐段行程计算需要 JavaScript。仍可使用', noScriptEnd: '核对证件和官方证据。', serverRules: '服务端规则查询',
    walletStep: '01 · 证件', walletTitle: '你实际携带哪些证件？', from: '从哪里出发？', chooseFrom: '选择出发地', validity: '已核对证件全程有效（仍须满足目的地剩余有效期要求）',
    routeStep: '02 · 行程', routeTitle: '按顺序填写每一段', routeHint: '包括转机和返程 · 最多 8 段', leg: '第', fromLeg: '段 · 从', pending: '待选择', destination: '抵达地 / 政策区', chooseDestination: '选择目的地', document: '使用证件', chooseDocument: '从已选证件中选择', arrival: '抵达日期', mode: '交通方式', entry: '是否入境', entryYes: '入境（包括转机入境）', entryUnknown: '不确定', airside: '不入境 / 空侧转机', basis: '入境依据', visit: '短期访问 / 所选通行证路线', residence: '居民身份返境', citizen: '公民身份返境', purpose: '旅行目的', port: '机场 / 口岸（可选）', portPlaceholder: '仅填口岸，不填个人信息',
    remove: '移除第', removeEnd: '段', addLeg: '添加下一段 / 转机', addReturn: '添加返程目的地', generate: '生成逐段自查清单', privacy: '仅在本页计算；刷新即清空。不上传或保存证件与行程，请勿填写个人资料。',
    fix: '请先修正行程', noWide: '没有返回宽泛结果。', stale: '表单已修改，以下仍为上次结果。请重新生成；旧结果不能代表新行程。', resultStep: '03 · 自查结果', resultSummary: '全程仍需复核：规则条件、出境要求和个人资格未被自动验证。没有 READY 或通关保证；返程转机须逐段显式添加。', calculated: '计算于', recalc: '规则会到期，出发前须重新查询', print: '打印自查清单', node: '节点', residentOrCitizen: '居民 / 公民返境', conditions: '有当前依据 · 条件待核', tasks: '出发前待核事项 · 勾选不代表通过', noGuess: '不生成猜测规则。', sourceLink: '查看官方来源入口', handoff: '，按本段实际身份和口岸人工核验。', footer1: 'BorderLens · 官方证据与逐段自查', footer2: '不代办 · 不保存个人信息 · 不保证登机或入境',
  },
  en: {
    source: 'Based on official sources', rules: 'Search rules', title: 'Check every border on your route', intro: 'Select your actual documents and itinerary. See conditions and official sources for each leg.', start: 'Start checking',
    warning: 'Pre-travel checklist only, not entry permission. REVIEW requires an official check.', warningMore: 'Read the limits', warningDetail: 'Airside transit, resident or citizen returns, departure rules and personal third-country eligibility need manual checks. Dates are assessed conservatively through the end of the UTC day. Conclusions disappear after their review window or temporary expiry. Ticking a box never means READY; historical 90/180-day or annual stay totals are not calculated.',
    examples: 'Try an example', roundtrip: 'Hong Kong ⇄ Japan', transit: 'UK → Hong Kong → Japan → UK', permit: 'Macao → Mainland China · permit',
    noScript: 'This itinerary checker needs JavaScript. You can still use the', noScriptEnd: 'to inspect documents and official evidence.', serverRules: 'server-rendered rule search',
    walletStep: '01 · Documents', walletTitle: 'Which documents will you carry?', from: 'Where will you depart from?', chooseFrom: 'Select departure point', validity: 'I checked that my documents are valid throughout the trip (destination-specific remaining validity still applies)',
    routeStep: '02 · Itinerary', routeTitle: 'Add each border in order', routeHint: 'Include transit and return · up to 8 legs', leg: 'Leg', fromLeg: '· from', pending: 'not selected', destination: 'Arrival destination / policy area', chooseDestination: 'Select destination', document: 'Document used for this leg', chooseDocument: 'Choose from selected documents', arrival: 'Arrival date', mode: 'Travel mode', entry: 'Will you enter?', entryYes: 'Yes (including transit with entry)', entryUnknown: 'Not sure', airside: 'No / airside transit', basis: 'Basis of entry', visit: 'Short visit / selected permit route', residence: 'Resident returning', citizen: 'Citizen returning', purpose: 'Purpose', port: 'Airport / port (optional)', portPlaceholder: 'Port only; no personal information',
    remove: 'Remove leg', removeEnd: '', addLeg: 'Add next leg / transit', addReturn: 'Add return destination', generate: 'Create leg-by-leg checklist', privacy: 'Calculated only in this page and cleared on refresh. No documents or itinerary are uploaded or saved. Do not enter personal details.',
    fix: 'Fix your itinerary', noWide: 'No broader result was returned.', stale: 'The form changed; the result below is for the previous itinerary. Generate it again before relying on it.', resultStep: '03 · Checklist', resultSummary: 'The whole journey still needs review: conditions, departure rules and personal eligibility are not verified automatically. There is no READY or entry guarantee. Add return transits as separate legs.', calculated: 'Calculated', recalc: 'rules expire; recheck before departure', print: 'Print checklist', node: 'Border point', residentOrCitizen: 'Resident / citizen return', conditions: 'Current rule found · conditions to check', tasks: 'Before travel · ticking boxes does not mean approval', noGuess: 'No rule is guessed. ', sourceLink: 'Open official source registry', handoff: ' and check your actual status and port manually.', footer1: 'BorderLens · evidence and route checklist', footer2: 'No applications · no personal data saved · no boarding or entry guarantee',
  },
} as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

export function JourneyWorkbench({ entries, destinations, documents, today, locale = 'zh' }: { entries: CatalogEntry[]; destinations: Option[]; documents: Option[]; today: string; locale?: Locale }) {
  const t = copy[locale];
  const options = useMemo(() => ({ destinations: destinations.map((item) => item.id), documents: documents.map((item) => item.id) }), [destinations, documents]);
  const [input, setInput] = useState<CatalogJourney>(() => initialJourney(today));
  const [submitted, setSubmitted] = useState<CatalogJourney | null>(null);
  const [result, setResult] = useState<CatalogJourneyResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [generation, setGeneration] = useState(0);
  const dirty = submitted !== null && JSON.stringify(input) !== JSON.stringify(submitted);

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
  const toggleDocument = (key: string) => setInput((value) => {
    const removing = value.documents.includes(key);
    return {
      ...value,
      documents: removing ? value.documents.filter((item) => item !== key) : [...value.documents, key],
      legs: value.legs.map((leg) => ({ ...leg, document: removing && leg.document === key ? '' : !removing && !leg.document && !value.documents.length ? key : leg.document })),
    };
  });
  const addLeg = (destination = '') => setInput((value) => value.legs.length >= 8 ? value : { ...value, legs: [...value.legs, newLeg(value.documents[0] ?? '', value.legs.at(-1)?.date || today, destination)] });
  const applyExample = (kind: 'roundtrip' | 'transit' | 'permit') => {
    const sample = initialJourney(today);
    sample.origin = 'hk'; sample.documents = ['hk:hksar_passport'];
    sample.legs = [newLeg('hk:hksar_passport', today, 'jp')];
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
      <Link className="brand" href={localePath(locale, '/')}><span className="brand-mark"><Route size={19} /></span><span>BorderLens</span></Link>
      <div className="source-note"><ShieldCheck size={15} />{t.source}</div>
      <div className="header-actions"><LanguageSwitch locale={locale} path="/" /><Link className="plain-link" href={localePath(locale, '/policies')}>{t.rules} <ArrowRight size={14} /></Link></div>
    </header>
    <section className="policy-heading journey-heading">
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
      <div className="journey-hero-actions"><a className="primary-button" href="#journey-form">{t.start} <ArrowRight size={16} /></a></div>
    </section>
    <div className="journey-shell">
      <aside className="policy-boundary"><strong>{t.warning}</strong><details><summary>{t.warningMore}</summary><p>{t.warningDetail}</p></details></aside>
      <div className="journey-examples" aria-label={t.examples}><span>{t.examples}</span><button type="button" onClick={() => applyExample('roundtrip')}>{t.roundtrip}</button><button type="button" onClick={() => applyExample('transit')}>{t.transit}</button><button type="button" onClick={() => applyExample('permit')}>{t.permit}</button></div>
      <noscript><p className="policy-empty">{t.noScript} <Link href={localePath(locale, '/policies')}>{t.serverRules}</Link> {t.noScriptEnd}</p></noscript>
      <form id="journey-form" className="journey-builder" autoComplete="off" onSubmit={(event) => { event.preventDefault(); generate(input); }}>
        <div className="journey-builder-heading"><div><p className="step-kicker">{t.walletStep}</p><h2>{t.walletTitle}</h2></div></div>
        <div className="journey-wallet">{documents.map((item) => <label key={item.id} className="wallet-choice"><input type="checkbox" checked={input.documents.includes(item.id)} onChange={() => toggleDocument(item.id)} /><span>{item.label}</span></label>)}</div>
        <div className="journey-origin"><Field label={t.from}><select required value={input.origin} onChange={(event) => setInput((value) => ({ ...value, origin: event.target.value }))}><option value="">{t.chooseFrom}</option>{destinations.filter((item) => item.id !== 'eu-schengen').map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field><label className="journey-validity"><input type="checkbox" checked={input.documentsValid} onChange={(event) => setInput((value) => ({ ...value, documentsValid: event.target.checked }))} />{t.validity}</label></div>
        <div className="journey-builder-heading"><div><p className="step-kicker">{t.routeStep}</p><h2>{t.routeTitle}</h2></div><span>{t.routeHint}</span></div>
        <div className="journey-leg-list">{input.legs.map((leg, index) => <fieldset className="journey-leg" key={index}>
          <legend>{t.leg} {index + 1} {t.fromLeg} {placeLabel(index === 0 ? input.origin || t.pending : input.legs[index - 1].destination || t.pending, locale)}</legend>
          <div className="journey-leg-fields">
            <Field label={t.destination}><select required value={leg.destination} onChange={(event) => updateLeg(index, { destination: event.target.value })}><option value="">{t.chooseDestination}</option>{destinations.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field>
            <Field label={t.document}><select required value={input.documents.includes(leg.document) ? leg.document : ''} onChange={(event) => updateLeg(index, { document: event.target.value })}><option value="">{t.chooseDocument}</option>{documents.filter((item) => input.documents.includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field>
            <Field label={t.arrival}><input type="date" required min={index === 0 ? today : input.legs[index - 1].date || today} value={leg.date} onChange={(event) => updateLeg(index, { date: event.target.value })} /></Field>
            <Field label={t.mode}><select value={leg.mode} onChange={(event) => updateLeg(index, { mode: event.target.value as JourneyLeg['mode'], entry: event.target.value !== 'air' && leg.entry === 'airside' ? 'unknown' : leg.entry })}><option value="air">{locale === 'en' ? 'Air' : '航空'}</option><option value="land">{locale === 'en' ? 'Land' : '陆路'}</option><option value="sea">{locale === 'en' ? 'Sea' : '海路'}</option></select></Field>
            <Field label={t.entry}><select value={leg.entry} onChange={(event) => updateLeg(index, { entry: event.target.value as JourneyLeg['entry'] })}><option value="entry">{t.entryYes}</option><option value="unknown">{t.entryUnknown}</option>{leg.mode === 'air' && <option value="airside">{t.airside}</option>}</select></Field>
            <Field label={t.basis}><select value={leg.basis} onChange={(event) => updateLeg(index, { basis: event.target.value as JourneyLeg['basis'] })}><option value="visit">{t.visit}</option><option value="residence">{t.residence}</option><option value="citizen">{t.citizen}</option></select></Field>
            <Field label={t.purpose}><select value={leg.purpose} onChange={(event) => updateLeg(index, { purpose: event.target.value as JourneyLeg['purpose'] })}>{['tourism', 'business', 'study-work', 'other'].map((key) => <option key={key} value={key}>{purposeLabel(key, locale)}</option>)}</select></Field>
            <Field label={t.port}><input type="text" value={leg.port} maxLength={80} placeholder={t.portPlaceholder} onChange={(event) => updateLeg(index, { port: event.target.value })} /></Field>
          </div>
          {input.legs.length > 1 && <button className="journey-remove" type="button" onClick={() => setInput((value) => ({ ...value, legs: value.legs.filter((_, i) => i !== index) }))}><Trash2 size={14} />{t.remove} {index + 1} {t.removeEnd}</button>}
        </fieldset>)}</div>
        <div className="journey-builder-actions"><button type="button" className="journey-secondary" disabled={input.legs.length >= 8} onClick={() => addLeg()}><Plus size={16} />{t.addLeg}</button><button type="button" className="journey-secondary" disabled={input.legs.length >= 8} onClick={() => addLeg(input.origin)}>{t.addReturn}</button><button type="submit" className="primary-button"><FileCheck2 size={18} />{t.generate} <ArrowRight size={16} /></button></div>
        <p className="privacy-line">{t.privacy}</p>
      </form>
      {(errors.length > 0 || result) && <section className="journey-results" aria-live="polite" aria-label={t.resultStep}>
        {errors.length > 0 && <div className="policy-empty" role="alert"><h2>{t.fix}</h2><ul>{errors.map((error, index) => <li key={index}>{journeyError(error, locale)}</li>)}</ul><p>{t.noWide}</p></div>}
        {dirty && <output className="stale-warning">{t.stale}</output>}
        {result && <div key={generation} className={dirty ? 'journey-result-dirty' : ''}>
          <div className="journey-result-heading"><div><p className="step-kicker">{t.resultStep}</p><h2>{locale === 'en' ? `${result.steps.length} border points checked · ${result.currentLegs} with current visitor rules` : result.headline}</h2><p>{t.resultSummary}</p><small>{t.calculated} {result.generatedAt} · {t.recalc}</small></div><button type="button" className="journey-secondary" disabled={dirty} onClick={() => window.print()}><Printer size={16} />{t.print}</button></div>
          {result.steps.map((step) => <section className="journey-result-step" key={step.index}>
            <div className="journey-step-heading"><div><p className="step-kicker">{t.node} {step.index + 1} · {step.leg.date}</p><h3>{locale === 'en' ? `${placeLabel(step.from, locale)} → ${placeLabel(step.leg.destination, locale)}` : step.title}</h3><p>{documentLabel(step.leg.document, locale)} · {step.leg.basis === 'visit' ? purposeLabel(step.leg.purpose, locale) : t.residentOrCitizen}</p></div><span className={`source-status ${step.status === 'conditions' ? 'source-reachable' : 'source-blocked'}`}>{step.status === 'conditions' ? t.conditions : 'REVIEW'}</span></div>
            <p className="journey-step-reason">{journeyText(step.reason, locale)}</p>
            <div className="journey-tasks"><h4>{t.tasks}</h4><ul className="journey-checklist">{step.tasks.map((task) => <li key={task}><label><input type="checkbox" />{journeyText(task, locale)}</label></li>)}</ul></div>
            <div className="policy-results">{step.policies.map((entry) => <PolicyCard key={entry.id} entry={entry} checklist idPrefix={`leg-${step.index}-`} reviewNote={entry.journeyReviewNote} locale={locale} />)}</div>
            {!step.policies.length && <p className="journey-handoff">{t.noGuess}<Link href={localePath(locale, '/coverage')}>{t.sourceLink}</Link>{t.handoff}</p>}
          </section>)}
        </div>}
      </section>}
    </div>
    <footer><span>{t.footer1}</span><span>{t.footer2}</span></footer>
  </main>;
}
