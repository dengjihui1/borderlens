'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CircleHelp,
  ExternalLink,
  FileCheck2,
  MapPin,
  Plane,
  Route,
  ShieldCheck,
} from 'lucide-react';
import {
  DATA_CHECKED_AT,
  evaluateJourney,
  placeName,
  type JourneyInput,
  type JourneyResult,
  type Place,
  type Status,
} from '@/lib/rules';

const places: Array<{ value: Place; label: string }> = [
  { value: 'hong-kong', label: '中国香港' },
  { value: 'macao', label: '中国澳门' },
  { value: 'mainland-china', label: '中国内地' },
  { value: 'japan', label: '日本' },
  { value: 'united-kingdom', label: '英国' },
  { value: 'other', label: '其他地区' },
];

const initialInput: JourneyInput = {
  document: 'hksar-passport',
  origin: 'hong-kong',
  transit: '',
  destination: 'japan',
  purpose: 'tourism',
  transitEntry: 'no',
  extras: ['hk-id'],
  documentsValid: true,
  includeReturn: true,
};

const presets: Array<{ name: string; hint: string; value: JourneyInput }> = [
  { name: '香港居民去日本', hint: 'HKSAR Passport · 旅游', value: initialInput },
  {
    name: '英国经港去日本',
    hint: '中国护照 · 含返英',
    value: {
      document: 'prc-passport', origin: 'united-kingdom', transit: 'hong-kong', destination: 'japan',
      purpose: 'tourism', transitEntry: 'unknown', extras: ['uk-residence'], documentsValid: true, includeReturn: true,
    },
  },
  {
    name: '澳门居民进内地',
    hint: '居民证 + 回乡证',
    value: {
      document: 'macao-passport', origin: 'macao', transit: '', destination: 'mainland-china',
      purpose: 'other', transitEntry: 'no', extras: ['macao-id', 'home-return-permit'], documentsValid: true, includeReturn: false,
    },
  },
];

const statusStyle: Record<Status, { label: string; className: string; icon: typeof Check }> = {
  ready: { label: 'READY', className: 'status-ready', icon: Check },
  action: { label: 'ACTION', className: 'status-action', icon: AlertTriangle },
  review: { label: 'REVIEW', className: 'status-review', icon: CircleHelp },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function StatusPill({ status }: { status: Status }) {
  const item = statusStyle[status];
  const Icon = item.icon;
  return <span className={`status-pill ${item.className}`}><Icon size={13} />{item.label}</span>;
}

export default function Home() {
  const [input, setInput] = useState<JourneyInput>(initialInput);
  const [result, setResult] = useState<JourneyResult>(() => evaluateJourney(initialInput));
  const routeText = useMemo(() => [input.origin, input.transit, input.destination].filter(Boolean).map((p) => placeName(p as Place)).join(' → '), [input]);

  const update = <K extends keyof JourneyInput>(key: K, value: JourneyInput[K]) => setInput((current) => ({ ...current, [key]: value }));
  const toggleExtra = (value: string) => update('extras', input.extras.includes(value) ? input.extras.filter((item) => item !== value) : [...input.extras, value]);
  const applyPreset = (value: JourneyInput) => { setInput(value); setResult(evaluateJourney(value)); };

  useEffect(() => {
    const modelContext = (document as Document & {
      modelContext?: { registerTool: (tool: Record<string, unknown>, options?: { signal?: AbortSignal }) => void | Promise<void> };
    }).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const placeValues = places.map((place) => place.value);
    const documentValues = ['hksar-passport', 'macao-passport', 'prc-passport', 'other-passport'];

    void Promise.resolve(modelContext.registerTool({
      name: 'generate_document_route',
      title: '生成证件路线图',
      description: '根据主要旅行证件、出发地、可选转机地、目的地和附加证件，更新页面并生成逐段边境证件路线图。',
      inputSchema: {
        type: 'object',
        properties: {
          document: { type: 'string', enum: documentValues },
          origin: { type: 'string', enum: placeValues },
          transit: { type: 'string', enum: ['', ...placeValues] },
          destination: { type: 'string', enum: placeValues },
          purpose: { type: 'string', enum: ['tourism', 'business', 'study-work', 'other'] },
          transitEntry: { type: 'string', enum: ['yes', 'no', 'unknown'] },
          extras: { type: 'array', items: { type: 'string', enum: ['hk-id', 'macao-id', 'home-return-permit', 'uk-residence'] } },
          documentsValid: { type: 'boolean' },
          includeReturn: { type: 'boolean' },
        },
        required: ['document', 'origin', 'destination', 'purpose', 'transitEntry', 'extras', 'documentsValid', 'includeReturn'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(raw: unknown) {
        const candidate = raw as JourneyInput;
        if (!candidate || !documentValues.includes(candidate.document) || !placeValues.includes(candidate.origin) || !placeValues.includes(candidate.destination) || !Array.isArray(candidate.extras)) {
          throw new Error('旅行路线参数无效。');
        }
        const next: JourneyInput = { ...candidate, transit: candidate.transit || '' };
        const nextResult = evaluateJourney(next);
        setInput(next);
        setResult(nextResult);
        return { status: nextResult.status, headline: nextResult.headline, steps: nextResult.steps.map((step) => ({ route: step.title, status: step.status })) };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="BorderLens 首页"><span className="brand-mark"><Route size={19} /></span><span>BorderLens</span></a>
        <div className="source-note"><ShieldCheck size={15} /> 规则来自官方来源 · 核验于 {DATA_CHECKED_AT}</div>
        <Link className="plain-link" href="/coverage">全球数据 <ArrowRight size={14} /></Link>
      </header>

      <section className="intro" id="top">
        <div className="intro-copy">
          <p className="eyebrow">PERSONAL BORDER OPERATIONS</p>
          <h1>不要只问“免不免签”。<br />看清每一段该用哪份证件。</h1>
          <p>把真实使用的护照、居民身份与完整行程放在一起，生成逐段证件路线图。首版专注大中华身份与日本、英国常见路线。</p>
        </div>
        <div className="intro-visual" aria-label="准备出发的旅客与机场窗景"><div><Plane size={18} /> 私密演示版<br /><small>不上传证件、不保存表单</small></div></div>
      </section>

      <section className="preset-row" aria-label="示例场景">
        <span className="preset-label">快速载入</span>
        {presets.map((preset) => <button key={preset.name} type="button" onClick={() => applyPreset(preset.value)}><strong>{preset.name}</strong><small>{preset.hint}</small></button>)}
      </section>

      <section className="workspace">
        <form className="input-panel" onSubmit={(event) => { event.preventDefault(); setResult(evaluateJourney(input)); }}>
          <div className="panel-heading"><div><p className="step-kicker">01 / BUILD YOUR ROUTE</p><h2>告诉我你实际怎么走</h2></div><MapPin size={22} /></div>
          <div className="form-grid">
            <Field label="主要旅行证件"><select value={input.document} onChange={(e) => update('document', e.target.value as JourneyInput['document'])}><option value="hksar-passport">香港特区护照</option><option value="macao-passport">澳门特区护照</option><option value="prc-passport">中国普通护照</option><option value="other-passport">其他护照/旅行证件</option></select></Field>
            <Field label="旅行目的"><select value={input.purpose} onChange={(e) => update('purpose', e.target.value as JourneyInput['purpose'])}><option value="tourism">短期旅游</option><option value="business">商务</option><option value="study-work">学习 / 工作</option><option value="other">其他</option></select></Field>
            <Field label="从哪里出发"><select value={input.origin} onChange={(e) => update('origin', e.target.value as Place)}>{places.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></Field>
            <Field label="中途转机"><select value={input.transit} onChange={(e) => update('transit', e.target.value as Place | '')}><option value="">没有转机</option>{places.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></Field>
            <Field label="最终目的地"><select value={input.destination} onChange={(e) => update('destination', e.target.value as Place)}>{places.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></Field>
            <Field label="转机时是否入境"><select disabled={!input.transit} value={input.transitEntry} onChange={(e) => update('transitEntry', e.target.value as JourneyInput['transitEntry'])}><option value="no">不入境 / 空侧转机</option><option value="yes">需要入境</option><option value="unknown">还不确定</option></select></Field>
          </div>

          <fieldset><legend>我还会携带</legend><div className="check-grid">{[
            ['hk-id', '香港身份证'], ['macao-id', '澳门居民身份证'], ['home-return-permit', '港澳居民来往内地通行证'], ['uk-residence', '英国居留资格'],
          ].map(([value, label]) => <label className="check" key={value}><input type="checkbox" checked={input.extras.includes(value)} onChange={() => toggleExtra(value)} /><span><Check size={12} /></span>{label}</label>)}</div></fieldset>
          <div className="confirmations">
            <label><input type="checkbox" checked={input.documentsValid} onChange={(e) => update('documentsValid', e.target.checked)} />已确认所有证件在整个行程期间有效</label>
            <label><input type="checkbox" checked={input.includeReturn} onChange={(e) => update('includeReturn', e.target.checked)} />同时检查返程</label>
          </div>
          <button className="primary-button" type="submit"><FileCheck2 size={18} />生成我的证件路线图 <ArrowRight size={17} /></button>
          <p className="privacy-line">不需要护照号码、证件照片、完整出生日期或住址。</p>
        </form>

        <section className="result-panel" aria-live="polite">
          <div className="result-top"><div><p className="step-kicker">02 / DOCUMENT ROUTE</p><h2>{routeText}</h2></div><StatusPill status={result.status} /></div>
          <div className={`result-summary summary-${result.status}`}><span>{result.status === 'ready' ? <Check /> : result.status === 'action' ? <AlertTriangle /> : <CircleHelp />}</span><div><strong>{result.headline}</strong><p>{result.summary}</p></div></div>
          {result.stale && <div className="stale-warning"><AlertTriangle size={16} />规则核验已超过 30 天，请重新查看全部官方来源。</div>}
          <div className="timeline">
            {result.steps.map((step, index) => <article className="route-step" key={`${step.from}-${step.to}-${index}`}>
              <div className="timeline-mark"><span>{index + 1}</span></div>
              <div className="step-card">
                <div className="step-title"><div><small>边境节点 {String(index + 1).padStart(2, '0')}</small><h3>{step.title}</h3></div><StatusPill status={step.status} /></div>
                <p className="step-summary">{step.summary}</p>
                <div className="detail-columns">
                  <div><h4>随身携带</h4><ul>{step.bring.map((item) => <li key={item}>{item}</li>)}</ul></div>
                  {step.actions.length > 0 && <div><h4>出发前办理</h4><ul>{step.actions.map((item) => <li key={item}>{item}</li>)}</ul></div>}
                  <div><h4>仍需确认</h4><ul>{step.verify.map((item) => <li key={item}>{item}</li>)}</ul></div>
                </div>
                <div className="sources">{step.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}<ExternalLink size={12} /></a>)}</div>
              </div>
            </article>)}
          </div>
          <p className="disclaimer">BorderLens 是出发前预检工具，不替代政府、使领馆或航空公司的最终决定，也不保证登机或入境。</p>
        </section>
      </section>

      <section className="method" id="method">
        <div><p className="eyebrow">WHY THIS IS AN AGENT</p><h2>先拆边境节点，再调用最窄的可信规则。</h2></div>
        <ol><li><span>01</span><div><strong>结构化身份</strong><p>分开记录国籍、实际护照、居民身份与通行证，不把“哪里人”当作证件。</p></div></li><li><span>02</span><div><strong>逐段判断</strong><p>出发、转机、目的地与返程逐一检查，转机是否入境也会改变结果。</p></div></li><li><span>03</span><div><strong>控制不确定性</strong><p>只有受控规则才给结论；其他路线明确转交官方工具，不让模型凭记忆猜。</p></div></li></ol>
      </section>
      <footer><span>BorderLens · rule-based MVP</span><span>本地计算 · 不保存个人信息 · 无额外 AI API 费用</span></footer>
    </main>
  );
}
