import { ExternalLink } from 'lucide-react';
import { modeNames, purposeNames, reviewReasonNames, type CatalogEntry } from '@/lib/policy-catalog';

export function PolicyCard({ entry, checklist = false, idPrefix = '', reviewNote }: { entry: CatalogEntry; checklist?: boolean; idPrefix?: string; reviewNote?: string }) {
  return <article className="policy-card" id={`${idPrefix}${entry.id}`}>
    <div className="policy-card-title"><div><small>{entry.documentName}</small><h3>{entry.destinationName}</h3></div><span className={`source-status ${entry.status === 'current' ? 'source-verified' : 'source-blocked'}`}>{entry.status === 'current' ? '当前证据有效' : 'REVIEW'}</span></div>
    <p className="policy-scope">{purposeNames[entry.purpose] ?? entry.purpose} · {modeNames[entry.borderMode] ?? entry.borderMode}</p>
    {entry.conclusion ? <div className="policy-conclusion"><h4>{entry.conclusion.label}</h4>{entry.conclusion.product && <p>{entry.conclusion.product}</p>}{entry.conclusion.stay.map((line) => <p key={line}>{line}</p>)}</div> : <div className="policy-conclusion policy-review"><h4>{reviewNote ?? reviewReasonNames[entry.reason!]}</h4><p>不提供确定签证或停留结论。先按实际证件、口岸和个人条件核对下列官方入口。</p></div>}
    <p className="policy-dates">核验 {entry.checkedAt} · 复核截止 {entry.reviewDueAt}（UTC 当日结束）{entry.effectiveUntil && <> · 临时政策截止 {entry.effectiveUntil}</>}</p>
    {entry.evidence && <><h4>全部适用条件{checklist && ' · 自查勾选不改变判定'}</h4><ul className={`policy-conditions ${checklist ? 'journey-checklist' : ''}`}>{entry.evidence.conditions.map((condition, index) => <li key={`${entry.id}-${index}`}>{checklist ? <label><input type="checkbox" />{condition}</label> : condition}</li>)}</ul><details><summary>查看官方证据定位与摘录</summary><p>{entry.evidence.locator}</p><blockquote>{entry.evidence.excerpt}</blockquote></details></>}
    <div className="policy-sources">{entry.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.title}{source.status === 'blocked' && '（访问受阻，需人工核对）'}<ExternalLink size={12} /></a>)}</div>
    <small className="policy-rule-id">规则 ID：{entry.id}</small>
  </article>;
}
