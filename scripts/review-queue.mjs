import { readFile } from 'node:fs/promises';
import { buildPolicyCatalog, getReviewQueue, reviewReasonNames } from '../lib/policy-catalog.ts';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const [policies, sources] = await Promise.all([readJson('../data/policies.seed.json'), readJson('../data/official-source-registry.json')]);
const dateArgument = process.argv[2];
if (dateArgument && (!/^\d{4}-\d{2}-\d{2}$/.test(dateArgument) || new Date(`${dateArgument}T12:00:00Z`).toISOString().slice(0, 10) !== dateArgument)) throw new Error('Use an actual YYYY-MM-DD date');
const now = dateArgument ? new Date(`${dateArgument}T12:00:00Z`) : new Date();
const entries = buildPolicyCatalog(policies.rules, sources.sources, now);
const queue = getReviewQueue(entries);
console.log(JSON.stringify({
  asOf: now.toISOString(), total: entries.length,
  currentEvidence: entries.filter((entry) => entry.evidenceCurrent).length,
  currentConclusions: entries.length - queue.length,
  reviewTotal: queue.length,
  reasons: Object.fromEntries(Object.keys(reviewReasonNames).map((reason) => [reason, queue.filter((entry) => entry.reason === reason).length])),
  queue: queue.map((entry) => ({
    id: entry.id, destination: entry.destinationName, document: entry.documentName,
    reason: entry.reason, reviewDueAt: entry.reviewDueAt,
    nextAction: entry.reason === 'conditional_review' ? '确认个人条件及适用分支；不得自动升级为许可'
      : entry.reason === 'evidence_pending' ? '取得证件专属的当前官方结论并解决冲突，证据不足保持 REVIEW'
        : '重新读取当前官方原文、证件范围与期限；核验后才续期',
    sources: entry.sources.map(({ url, status }) => ({ url, status })),
  })),
}, null, 2));
