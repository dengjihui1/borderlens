import { ArrowLeft, Database, ExternalLink, FileSearch, Globe2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { coverageSummary, registeredSources, sourceStatusCopy } from '@/lib/global-data';

const format = new Intl.NumberFormat('zh-CN');

export default function CoveragePage() {
  return (
    <main className="coverage-page">
      <header className="topbar coverage-nav">
        <Link className="brand" href="/"><span className="brand-mark"><Database size={19} /></span><span>BorderLens Data</span></Link>
        <div className="source-note"><Globe2 size={15} /> 全球政策数据库 · Phase 02</div>
        <Link className="plain-link" href="/"><ArrowLeft size={14} /> 返回路线工具</Link>
      </header>

      <section className="coverage-hero">
        <div>
          <p className="eyebrow">GLOBAL POLICY CONTROL ROOM</p>
          <h1>先证明覆盖率，<br />再谈全球可用。</h1>
        </div>
        <div className="coverage-hero-copy">
          <p>全球目录已经建立，但“找到一个政府网址”不等于“该国政策已录入”。这里把国家目录、官方入口、具体规则和复核状态分开统计。</p>
          <span>数据核验日 {coverageSummary.checkedAt}</span>
        </div>
      </section>

      <section className="coverage-content">
        <div className="metric-grid">
          <article><span><Globe2 /></span><strong>{coverageSummary.jurisdictionCount}</strong><p>联合国 M49 国家与地区</p><small>全球主目录已建立</small></article>
          <article><span><FileSearch /></span><strong>{coverageSummary.officialSourceCount}</strong><p>首批官方来源入口</p><small>覆盖 12 个重点法域及全球系统</small></article>
          <article><span><Database /></span><strong>{coverageSummary.verifiedPolicyRuleCount}</strong><p>已结构化的受控规则</p><small>与“仅能访问”严格分开</small></article>
          <article><span><ShieldAlert /></span><strong>{format.format(coverageSummary.minimumPolicyCells)}</strong><p>最低政策组合规模</p><small>目的地 × 证件签发地 × 7 类目的</small></article>
        </div>

        <section className="coverage-warning">
          <ShieldAlert size={22} />
          <div><strong>当前不是“全球签证政策已完成”。</strong><p>已完成的是全球数据库骨架、248 个法域目录和第一批官方来源注册。只有状态为“规则已核验”的来源可以支撑明确结论，其余仍输出 REVIEW。</p></div>
        </section>

        <section className="registry-card">
          <div className="registry-heading"><div><p className="step-kicker">OFFICIAL SOURCE REGISTRY</p><h2>第一批官方来源队列</h2></div><div className="registry-counts"><span>{coverageSummary.reachableSourceCount} 待转录</span><span>{coverageSummary.blockedSourceCount} 需浏览器</span></div></div>
          <Table className="registry-table">
            <TableHeader><TableRow><TableHead>法域 / 系统</TableHead><TableHead>官方机构</TableHead><TableHead>覆盖范围</TableHead><TableHead>状态</TableHead><TableHead>来源</TableHead></TableRow></TableHeader>
            <TableBody>{registeredSources.map((source) => <TableRow key={source.id}>
              <TableCell className="source-code">{source.jurisdictionId?.toUpperCase() ?? 'GLOBAL'}</TableCell>
              <TableCell><strong>{source.authority}</strong><small>{source.title}</small></TableCell>
              <TableCell>{source.scope.replaceAll('_', ' ')}</TableCell>
              <TableCell><span className={`source-status source-${source.status}`}>{sourceStatusCopy[source.status].label}</span></TableCell>
              <TableCell><a href={source.url} target="_blank" rel="noreferrer" aria-label={`打开 ${source.title}`}><ExternalLink size={15} /></a></TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </section>

        <section className="pipeline-card">
          <div><p className="step-kicker">EVIDENCE PIPELINE</p><h2>一条政策进入可用结果前，要过五道门。</h2></div>
          <ol>
            <li><span>01</span><strong>发现官方入口</strong><p>确认域名、主管机构和适用范围。</p></li>
            <li><span>02</span><strong>保存证据定位</strong><p>记录原文、段落、发布日期与内容哈希。</p></li>
            <li><span>03</span><strong>结构化规则</strong><p>拆成证件、目的、口岸、停留期和附加条件。</p></li>
            <li><span>04</span><strong>冲突与回归检查</strong><p>不允许新规则悄悄覆盖旧证据。</p></li>
            <li><span>05</span><strong>定期重新核验</strong><p>到期或来源变化后自动降级为 REVIEW。</p></li>
          </ol>
        </section>
      </section>
      <footer><span>BorderLens Global Policy DB · foundation</span><span>来源可追溯 · 规则可过期 · 未验证不作答</span></footer>
    </main>
  );
}
