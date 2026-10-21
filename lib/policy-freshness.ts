interface PolicyValidity {
  status: string;
  reviewDueAt: string;
  checkedAt?: string;
  effectiveUntil?: string;
}

export function isPolicyRuleCurrent(rule: PolicyValidity, now = new Date()) {
  if (rule.status !== 'verified') return false;
  const validDay = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
  if (!validDay(rule.reviewDueAt)) return false;
  if (rule.checkedAt !== undefined && (!validDay(rule.checkedAt)
    || Date.parse(`${rule.checkedAt}T00:00:00Z`) > now.getTime()
    || rule.checkedAt > rule.reviewDueAt)) return false;
  if (rule.effectiveUntil !== undefined && !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(rule.effectiveUntil)) return false;
  const dueAt = Date.parse(`${rule.reviewDueAt}T23:59:59.999Z`);
  const effectiveUntil = rule.effectiveUntil === undefined ? Infinity : Date.parse(rule.effectiveUntil);
  return Number.isFinite(dueAt) && !Number.isNaN(effectiveUntil)
    && now.getTime() <= Math.min(dueAt, effectiveUntil);
}

export function summarizePolicyBatch(rules: PolicyValidity[], verifiedNote: string, now = new Date()) {
  const verifiedRuleCount = rules.filter((rule) => isPolicyRuleCurrent(rule, now)).length;
  const reviewRuleCount = rules.length - verifiedRuleCount;
  const note = rules.length === 0
    ? '尚未建立可核验的受控规则，暂不提供当前签证结论。'
    : reviewRuleCount > 0
      ? `本组 ${reviewRuleCount} 条路线已过期或待复核；当前有效 ${verifiedRuleCount} 条。请按具体证件重新核对官方要求，历史结论暂不作为当前出行依据。`
      : verifiedNote;
  return { verifiedRuleCount, reviewRuleCount, note };
}
