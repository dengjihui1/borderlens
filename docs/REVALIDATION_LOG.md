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

## Phase 64 · 东南亚第二批（2026-10-21）

| 来源组 | 当前官方证据 | 更新规则 | 核验结论 |
|---|---|---:|---|
| 泰国 | [Visa Exemption (60 Days)](https://image.mfa.go.th/mfa/0/91fPdh6NtO/VISA_Information/Visa_Exemption_Revised_16_July_2024.pdf)（官方 PDF，视觉核验）与 [TDAC Guide](https://tdac.immigration.go.th/manual/en/) | 3 | 中国、香港、澳门列入 60 天免签表；所有非泰国籍旅客仍需按官方要求提交 TDAC |
| 马来西亚 | [Malaysia–China FAQ](https://www.imi.gov.my/index.php/en/https-www-imi-gov-my-index-php-f-a-q-malaysia-china-visa-exemption-agreement/)（官方 FAQ PDF）与 [香港总领馆签证表](https://www.kln.gov.my/web/chn_hong-kong/requirement_foreigner) | 5 | 中国普通护照 30 天；香港 90 天；澳门 30 天；DOI 与澳门旅行证按独立证件规则处理 |
| 斯里兰卡 | [Official ETA](https://eta.gov.lk/slvisa/) 当前页面的 free-visa alert | 3 | 中国普通/港澳特区护照均需 ETA；中国列免费名单，当前页面写明 30 天、双次入境 |
| 马尔代夫 | [Tourist Visa — On Arrival](https://www.immigration.gov.mv/visa/tourist-visa) 与官方 IMUGA Traveller Declaration 入口 | 3 | 旅游签证抵达办理、无需预先批准；入境条件和免费 Traveller Declaration 仍需满足 |
| 文莱 | [Visa Information by Country](https://www.mfa.gov.bn/Pages/visa-information.aspx) 与 [Category D3](https://www.mfa.gov.bn/Pages/D3---D14.aspx) | 3 | 中国普通、香港和澳门特区普通护照均路由至 D3，免签最多 14 天 |

本批新增 17 条规则，统一复核截止日为 2026-11-20；累计当前有效规则 34 条。缅甸、东帝汶、柬埔寨和老挝本轮页面未同时提供足够稳定的当前证件/期限证据，因此未机械续期。

## Phase 65 · 拉美与新增官方路由复核（2026-10-21）

| 来源组 | 当前官方证据 | 更新规则 | 核验结论 |
|---|---|---:|---|
| 蒙古 | [eVisa VISA FREE COUNTRIES](https://evisa.mn/en) | 3 | 中国、香港特区、澳门特区均列入免签名单；页面未给期限，不补填期限 |
| 乌拉圭 | [Régimen de visas de admisión](https://www.gub.uy/ministerio-interior/comunicacion/publicaciones/regimen-visas-admision) | 3 | 中国普通护照需签证但有第三国签证例外；HKSAR、澳门普通护照按官方脚注免签 |
| 厄瓜多尔 | [官方签证国籍表](https://www.cancilleria.gob.ec/2020/06/30/lista-de-paises-que-deben-presentar-visa-al-ingresar-al-ecuador/) 与 [2024 ministerial order](https://www.cancilleria.gob.ec/wp-content/uploads/2024/07/0000064.pdf) | 1 | 中国普通护照先办签证；港澳既有独立证据仍保留 |
| 埃及 | [香港政府公告](https://www.info.gov.hk/gia/general/brandhk/1010001.htm) 与 [澳门年鉴 2025](https://yearbook.gcs.gov.mo/yearbook_pdf/2025/myb2025cAP09.pdf) | 2 | 港澳特区护照各自保留 90 天免签证据；不扩展到其他证件 |
| 菲律宾 | [Bureau of Immigration Visa Waiver](https://immigration.gov.ph/visas/visa-waiver/) 与 [DFA eVisa policy](https://evisa.gov.ph/page/policy) | 3 | 中国普通护照旅游/商务 14 天免签但限机场与条件；港澳特区护照 9A 初始 14 天 |

本批新增 12 条规则，统一复核截止日为 2026-11-20；累计当前有效规则 46 条。越南页面本轮返回了极短的入口响应，虽官方 API 可访问，但港澳路线还依赖官方国籍 PDF，因此本批未机械续期越南三条规则；埃及 eVisa FAQ 当前自动访问受阻，未续期中国普通护照 eVisa 路线。
