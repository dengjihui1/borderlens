# BorderLens 规则重新核验日志

## Phase 63 · 2026-10-21

本批采用“先访问当前官方来源，再更新 `checkedAt` / `reviewDueAt`”的方式。每条规则仍保留证件类型、目的、边界和官方证据定位；没有当前证据的规则不续期。

| 来源组 | 当前官方证据 | 更新规则 | 核验结论 |
|---|---|---:|---|
| 日本外务省 | [Exemption of Visa (Short-Term Stay)](https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html)，页面标注 2025-09-01；浏览器读取到 Hong Kong、Macao、Note 5/6，并写明其他列示地区通常 90 天 | 3 | HKSAR/Macao 特区护照短期旅游免签；中国普通护照不在普通短期免签表 |
| 新西兰移民局 | [Visa Waiver Visitor Visa](https://www.immigration.govt.nz/visas/visa-waiver-visitor-visa/)，当前页分别列 Hong Kong、Macau、NZeTA、最长 3 个月及中国从澳大利亚出发的限定分支 | 3 | 3 条原有窄规则仍成立；中国普通护照不升级为一般免签 |
| 欧盟委员会 / EUR-Lex | [Visa policy](https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en) 链接 [2025-12-30 consolidated Regulation 2018/1806](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02018R1806-20251230)；正文保留 Annex I China、Annex II Hong Kong SAR/Macao SAR、90/180 和护照脚注 | 3 | 中国普通护照需签证；港澳特区护照 90/180 免签 |
| 新加坡 | [北京使馆签证信息](https://beijing.mfa.gov.sg/consular-services/visa-information/)、[香港总领馆签证信息](https://hongkong.mfa.gov.sg/consular-services/visa-information/)、[ICA visa requirements](https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements) | 5 | 中国普通护照、港澳特区护照最多 30 天免签；HKSAR DOI、澳门特区旅行证仍是不同证件并需签证/进一步核验 |
| 土耳其外交部 | [Visa Information For Foreigners](https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa)；当前表明确 PRC 普通护照自 2026-01-02 起 90/180，HKSAR 90 天，Macao 30 天 | 3 | 三条普通护照免签期限继续成立 |

本批共更新 17 条规则，统一复核截止日为 2026-11-20。约旦旅游局原入口在本轮返回 404，未机械续期；约旦既有规则保留历史证据并继续进入下一轮人工/浏览器复核队列。

## Freshness gate

`lib/global-data.ts` 的 `isPolicyRuleCurrent()` 只把 `status: verified` 且尚未超过 `reviewDueAt` 的规则计入当前有效；`lib/rules.ts` 的 MVP 结果在全局核验日期超过 30 天时强制降级为 `REVIEW`。因此历史数据不会因为仍保留 `status: verified` 就绕过时效门禁。
