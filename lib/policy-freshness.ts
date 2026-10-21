interface PolicyValidity {
  status: string;
  reviewDueAt: string;
}

export function isPolicyRuleCurrent(rule: PolicyValidity, now = new Date()) {
  if (rule.status !== 'verified') return false;
  const dueAt = Date.parse(`${rule.reviewDueAt}T23:59:59Z`);
  return Number.isFinite(dueAt) && now.getTime() <= dueAt;
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
