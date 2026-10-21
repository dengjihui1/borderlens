# BorderLens 规则重新核验日志

## Phase 70 · 修正产品查询误读与继续复核（2026-10-21）

确认阿曼 3 条、卡塔尔 3 条、内地非中国籍港澳永久居民通行证 2 条，共 8 条当前规则。全库仍为 143 条，85 条证据在窗口内（其中 1 条个人条件仍需核验）、55 条历史到期、3 条明确证据问题；查询为 84 条当前结论和 59 条 REVIEW。八条规则统一复核截止 2026-11-20，其余 135 条保持原样。

| 官方证据 | 本次直接读取结果 | 修正 / 保留边界 |
|---|---|---|
| [阿曼外交部 Entry visas](https://www.fm.gov.om/visitors/entry-visas/) | HTTP 200，页面标注 last updated 2026-09-22；First group 写明 China (includes Hong Kong and Macau)，全文规定最多 14 天、护照至少 6 个月、返程票、酒店、健康保险及资金，不可延期或转居留 | 中国和香港不再仅凭 26A/26B 产品列表被判为必须签证；三类普通护照均采用当前外交部条件免签。产品存在不能排除其他免签路径，不沿用未经本轮复核的 ROP 细节 |
| [Visit Qatar Visa Check](https://visitqatar.com/intl-en/plan-your-trip/visas) | HTTP 200；官方 HTML 的 `vq-select-option` 分别为 China=`A1-3/cn`、Hong Kong=`A1-3/hk`、Macau=`A1-3/mo`；根级 `vq-form-conditional-block condition="citizenship^=A1-3"` 原文：`Enter visa-free OR apply now for a Hayya A1 Entry Visa`，并要求护照抵达时至少 3 个月有效 | 不把页面其他国籍/居民分支的 QAR 100 落地签文字套到 A1-3；本组三条更正为免签，Hayya A1 为可选路线。该条件块没有停留期限，不补填，也不混入联合签证等其他分支 |
| [国家移民管理局通行证政策问答](https://www.nia.gov.cn/n794014/n1050181/n1050484/c1659464/content.html) | HTTP 200，中英正文 Q1 确认非中国籍港澳永久性居民、5 年证件有效期、多次、每次不超过 90 日；Q3 禁止工作/学习/新闻；Q5 快捷通道须口岸指纹等采集；Q6 住宿登记及依法申请延期 | 两条保留“已持有效通行证”前提，补上住宿和快捷通道边界；不将 5 年当停留期限、不将可申请当作已持证、不将其他国籍身份自动匹配本规则 |

卡塔尔规则保留既有 ID（含历史 `voa` 后缀）以维持追溯，当前结论只取结构化 `outcome` 与当前原文，不从 ID 推断签证类别。HTML 中的条件块由标准 HTML parser 按元素和属性读取，并确认没有额外父条件；没有使用全文某段包含国名的文字代替路由。

### 本轮未续期与仍需解决的项目

- 阿联酋外交部当前 Macao 卡片再次读到 `visa-required` / `Visa Required`，没有取得能消解既有澳门官方资料冲突的新证据；保持 REVIEW。
- 孟加拉国驻港 Tourist Visa 当前 HTTP 200，仍仅有港澳身份材料和办理步骤，不足以排除其他入境路线；两条保持 REVIEW。
- 巴林在线资格列表与沙特 eVisa 门户本次直接访问均 HTTP 403；不更新相关六条规则的核验日期。来源的历史转录状态不被当作本次访问成功。
- 中国籍港澳居民回乡证原服务指南本次 HTTP 404，两条旧日期保留；非中国籍通行证问答不能替代它们。
- 约旦内政部限制国籍表当前可读，但未列入限制名单仍不能独立证明落地签、费用和期限；既有路线不续期。

## Phase 69 · 查询接入时的期限口径审计（2026-10-21）

直接重新读取新西兰移民局 [Visa Waiver Visitor Visa](https://www.immigration.govt.nz/visas/visa-waiver-visitor-visa/) 当前正文，HTTP 200。`How long you can stay` 明确写明 `You can stay for up to 3 months`；`Applicants from Hong Kong` 与 `Applicants from Macau` 分别保留居民及特区护照条件，`Authority to travel` 要求 NZeTA 及同一本护照旅行。

因此将港澳两条规则的固定 `maxStayDays: 90` 改为 `maxStayDays: null, maxStayMonths: 3`，避免把日历月错误折算成固定天数。核验日期与复核截止维持当天已核验的 2026-10-21 / 2026-11-20；没有扩大适用证件或中国普通护照的澳大利亚出发例外。当前证据总数仍为 77，明确可展示结论为 76，另 1 条个体条件仍需 REVIEW。

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

## Phase 66 · 英国、加拿大与东帝汶（2026-10-21）

本批直接读取官方网页正文。英国问答和东帝汶页面在检索服务无法读取时，改用直接 HTTPS 获取成功的正文；不以搜索摘要代替规则证据。

| 来源组 | 当前官方证据及定位 | 更新规则 | 本批保留或补全的边界 |
|---|---|---:|---|
| 英国 | GOV.UK 三条完整问答路径：[China](https://www.gov.uk/check-uk-visa/y/china/no/tourism/no)、[Hong Kong passport](https://www.gov.uk/check-uk-visa/y/hong-kong/no/passport/tourism)、[Macao passport](https://www.gov.uk/check-uk-visa/y/macao/no/passport/tourism)；逐页确认 Your answers 和最终结果 | 3 | 中国普通护照需 Standard Visitor visa；港澳特区护照需 ETA 或 Standard Visitor visa。保留非英爱双重公民、passport 证件和中国家庭关系问答条件；护照须全程有效，Common Travel Area 出发路线另行核验 |
| 加拿大 | [IRCC What you need to enter Canada](https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/entry-requirements-country.html) 的 visa-required、eTA-required、land/sea、Saint-Pierre-et-Miquelon 和身份例外段落 | 5 | 中国普通/澳门特区护照一般需访客签证；香港特区护照航空需 eTA，一般陆海路豁免。Saint-Pierre-et-Miquelon 非邮轮船班须 eTA；加拿大公民/永久居民和美国永久居民按专门身份规则处理 |
| 东帝汶 | Migration Service 的 [Tourist Visa](https://migracao.gov.tl/wp/tourist-visa/)（How and where to apply、Criteria、Documentary requirements、Fee、Conditions）和 [Visa exemptions](https://migracao.gov.tl/wp/visa-exemptions/)；两页直接 HTTPS 均返回 200 并含完整政策正文 | 3 | 符合条件的正式航空、陆路、海路口岸可申请 30 天旅游落地签，USD 30 现金、护照至少 6 个月有效。曾拒入/遣返/排除或欠罚款须提前申请；每次入境 USD 100 加每日 USD 50，或符合资格的食宿担保；Oecussi 行程可酌情获多次入境 |

本批续期 11 条规则，`checkedAt` 为 2026-10-21、`reviewDueAt` 为 2026-11-20；累计当前有效 57 条，另有 86 条历史规则仍过期。未增加来源或法域数量。

### 本批访问但未续期

| 来源组 | 实际观察 | 处理与下一次证据要求 |
|---|---|---|
| 老挝 | 原 `/article/who_can_apply` 返回 PAGE NOT FOUND。恢复的 [Who can Apply](https://laoevisa.gov.la/article/Who%20can%20Apply%20for%20Lao%20eVisa) 正文明确列出中国、香港和澳门；[Terms](https://laoevisa.gov.la/term) 确认 30 天停留、60 天批准信、普通护照及 9 个指定口岸 | 修复注册表 URL 并记录本次成功访问；三条规则不续期。申请资格表不能单独证明必须取得电子签，后续须核对各类证件适用的签证或免签要求 |
| 缅甸 | 官方 `/notice/tourist` 一次返回 200，但可提取内容只有应用标题；后续直接请求失败，未取得可同时核对证件、期限和口岸的完整正文 | 三条规则保留原日期和历史证据，由 freshness gate 继续计入 REVIEW；下一步读取渲染后官方政策内容或同机构替代官方页面 |
| 柬埔寨 | 原 Visa T 详情入口在检索服务发生重定向循环，直接请求亦失败。检索到的官方临时免签公告日期为 2026-06-15 至 2026-10-15，正文未在本批稳定取得 | 三条规则不续期；不将已结束的检索公告当作 2026-10-21 的免签证据。下一步取得临时安排结束后的官方签证要求、证件范围和口岸规定 |

### 覆盖率结论门禁

发现 `/coverage` 原来仅按到期日过滤计数，卡片说明仍展示旧的整组确定性结论。本批将卡片说明和数量使用同一时效判断：只有整组规则均当前有效时才展示政策摘要；过期、混合或空批次显示复核提示。回归测试覆盖截止日、草稿/无效日期、全部有效、全部过期、混合和空批次。

## Phase 67 · 澳大利亚、美国、韩国与阿联酋（2026-10-21）

本批确认 10 条规则：澳大利亚 3 条、美国 3 条、韩国港澳特区护照 2 条、阿联酋中国/香港普通护照 2 条。另将澳门赴阿联酋的官方来源冲突明确记为 `draft / manual_review`，不续用原来的确定签证结论。库内仍为 143 条路线、248 个法域；来源增至 106 个，当前有效 67 条、已过期历史记录 75 条、显式 REVIEW 1 条。

| 来源组 | 当前官方证据及定位 | 本批结论与边界 |
|---|---|---|
| 澳大利亚 | [Home Affairs 入境要求](https://immi.homeaffairs.gov.au/entering-and-leaving-australia/entering-australia/can-i-go-to-australia)；[ETA 601](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601) 的隐藏字段 `PageSchemaHiddenField` JSON：`applicant.eligibility.criteria[0]`、`applicant.aboutVisa.content[1]` 和 Other ways to apply | 直接解码当前网页自带的页面内容 JSON，确认 HKSAR 合资格、其他旅行证件不适用、兼具澳大利亚国籍者不能申请 ETA、每次最多 3 个日历月。中国普通/澳门特区护照须取得其他适用签证，Visitor 600 只是候选产品，不推定 stream 或批准期限。`maxStayDays` 改为 null，新增 `maxStayMonths: 3`，避免把 3 个日历月当作 90 天 |
| 美国 | 国务院 [VWP](https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html) 的 Must Be a Citizen or National of a VWP Designated Country；[Visitor Visa](https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html) 的 Overview / Tourism (B-2) | 当前可访问的国务院正文同时证明一般外国访客的签证要求、旅游 B-2/组合 B-1-B-2，以及 VWP 仅限封闭列明的国籍；三类目标普通护照不属该范围。保留关岛/北马里亚纳、美国公民/永久居民及其他合资格国籍护照的独立边界；不为签证统一补填入境停留天数 |
| 韩国 | [K-ETA 合资格表](https://www.k-eta.go.kr/portal/guide/viewetaalification.do)；法务部 [2026 临时豁免延期公告](https://www.k-eta.go.kr/portal/board/viewboarddetail.do?bbsSn=299707&esntlPnotiMtYn=Y&locale=EN)；韩国驻瑞士使馆 [适用国家/地区名单](https://overseas.mofa.go.kr/ch-en/brd/m_23429/view.do?seq=22)（直接 HTTPS 200） | 资格表港澳各为 90 天。现行延期公告与使馆名单共同确认 Hong Kong、Macao 的 K-ETA 临时豁免截至 2026-12-31 韩国时间；将原来的 `eta_required` 更正为此期限内的 `visa_free`。自愿 K-ETA 仍收费，入境申报及最终审查仍需满足。中国普通护照和香港签证身份书未在本批重跑 Visa Navigator，原日期保留，不续期 |
| 阿联酋 | 外交部 [Visa Exemptions for Non Citizen](https://www.mofa.gov.ae/en/visa-exemptions-for-non-citizen/) 的实际国家卡片 HTML，不使用搜索下拉名单判断签证要求 | PRC 与 Hong Kong 卡片明确标为 Visa Free；卡片没有期限、延期或收费条件，故本批只保留窄豁免结论，不继承原上海领馆页的 30 天及延期表述。旧上海领馆地址当前跳转至明确 404 页，标为受阻 |

### 澳门赴阿联酋：保留官方来源冲突

阿联酋外交部当前 Macao 卡片具有 `visa-required` 分类且正文为 Visa Required；澳门政府 [《澳门年鉴 2025》附录九](https://yearbook.gcs.gov.mo/yearbook_pdf/2025/myb2025cAP09.pdf) 印刷第 523 页则列出阿拉伯联合酋长国 30 天免签。印刷第 528 页脚注 f) 仅说明“不对特区旅行证发出签证”，并不能消解澳门特区普通护照的冲突。因此本条保留双方证据、停留日数为 null、状态明确 REVIEW，待阿联酋主管机关给出当前护照专属结论。

### 时效与来源访问状态

- 普通 `reviewDueAt` 截止到 UTC 当日最后 1 毫秒；临时安排可用带时区的 `effectiveUntil` 施加更早截止。本批韩国两条规则为 `2026-12-31T23:59:59.999+09:00`，即使复核期限后来被延长，也不会自动延长这项临时豁免。
- `/coverage` 改为动态页面，在每次请求内生成统计和卡片快照；不再在模块首次载入时冻结有效状态。
- 美国国务院原 VWP 入口本批已恢复完整访问，来源状态恢复 verified。DHS、CBP 旧入口本次均返回 403，阿联酋原领馆入口返回 404；三者保留历史核验日期并记录本次访问失败，不作为本批结论的当前证据。
- 其余未在本批取得完整证据的路线仍保持待复核，下一批继续处理印度尼西亚、南亚与中东剩余队列。

## Phase 68 · 印尼与南亚复核（2026-10-21）

本批读取并处理 12 条路线，确认其中 10 条可按当前窄证据使用：印尼 3 条、尼泊尔 3 条、印度 3 条、孟加拉国中国普通护照 1 条。港澳赴孟加拉国两条明确为 `draft / manual_review`，因为已有申请材料和费用记录不能证明必须预先办签。全库 143 条路线不变；来源增至 109 个，当前有效 77 条、过期历史规则 63 条、显式 REVIEW 3 条。

| 来源组 | 当前一手证据及定位 | 本批处理 |
|---|---|---|
| 印度尼西亚 | [官方 e-Visa 选择器](https://evisa.imigrasi.go.id/web/visa-selection)；页面自带的 `/web/visa-selection/data` 只读产品查询，依次使用页面实际提供的 General, Family, or Social、Tourism, Family Visit, and Transit、CHINA / HONG KONG SAR / MACAO SAR 值 | 按国籍筛选的 `data` 返回中国 B1、港澳 A1；随后读取各实际产品详情。B1 最多 30 天、可再延长 30 天、Rp500,000；A1 最多 30 天、不可延期。护照至少 6 个月有效、离境票据及足够费用。查询响应的 `all` 是未过滤的全产品目录，不能用来判断某个国籍的资格；本批未调用申请、付款或提交接口 |
| 尼泊尔 | [驻港领馆 Visa](https://hkg.nepalconsulate.gov.np/pages/nepal-visa/) 的 Chinese and HKSAR passport、Tourist Visa、Visa Extension；[Nepaliport 落地签入口](https://nepaliport.immigration.gov.np/on-arrival/IO01)；[官方游客签证国籍 API](https://backend.immigration.gov.np/api/v1/countries-for-tourist-visa) | 中国/HKSAR 护照需签证但免费；游客每签证年度累计上限为 150 天。改用 `maxStayDaysPerVisaYear: 150`，单次停留日数字段为 null。接口当前返回澳门 MAC、id 44、`blacklisted: false`，支持其申请路线，不推出澳门免费、自动获签或特定单次停留期 |
| 印度 | [中央 Indian Visa Online](https://indianvisaonline.gov.in/) 的一般护照和签证要求；[北京 Tourist Visa-Info](https://www.eoibeijing.gov.in/page/tourist-visa/)；改版后的驻港 [Visa Information](https://cgihk.gov.in/pages/Njk0) 的 Tourist Visa J(i). (T-1) 与 [General Instructions](https://cgihk.gov.in/pages/MTA2Mg,,) | 直接读取现行正文确认正规旅游签证路线，港澳领区护照 180 天、连续两页空白页及身份/居住地材料。旧 `/page/visa-information/`、`/page/General_Information/` 及旧费用 PDF 均失效：前两项更新为现官网实际菜单链接，旧 PDF 标为受阻。移除旧金额和三个月单次签发表述，不把 eVisa 是否可申请或 e-Arrival 混入一般签证结论 |
| 孟加拉国中国普通护照 | [北京 Visa on Arrival](https://beijing.mofa.gov.bd/pages/static-pages/6952668b35ce18e1c05a9eb1) 的资格第 3 项及要求；[官方在线落地签/过境签指南](https://beijing.mofa.gov.bd/pages/static-pages/6952668735ce18e1c05a9d03) | 中国被明确列入可按条件申请的国籍，最长 30 天，返程票、目的证明及至少 USD500/等值资金或信用卡。在线指南指向官方 `voa.specialbranch.gov.bd`；只记录流程入口，没有申请、付款、上传或提交行为 |

### 港澳赴孟加拉国：费用记录不等于预先签证义务

直接读取驻港 [Tourist Visa](https://hongkong.mofa.gov.bd/pages/static-pages/6952668735ce18e1c05a9d33) 和 [Visa Fees](https://hongkong.mofa.gov.bd/pages/static-pages/6952667c35ce18e1c05a97fc) 后，确认有 Hong Kong / Macau 身份材料及有金额的费用行；但同一表中的 China 也有金额费用行，而北京使馆同时明确中国普通护照可按条件申请落地签。这是费用记录不能排除其他办理路线的具体反例。因此撤回港澳“必须预先办签”的确定性推断，两条保留完整证据并明确 REVIEW；下一次须取得对应特区普通护照的入境要求、免签或落地签专属结果。

### 访问与证据边界

- 孟加拉国页面在检索服务超时、Node 默认证书链校验失败后，改用操作系统信任库的 HTTPS 客户端成功返回 200；全程保留证书验证，没有采用关闭验证的请求。印度驻港改版页面亦经正常验证读取。
- 尼泊尔落地签入口当前返回 SPA 外壳；未由空壳页面推断国籍或停留期。澳门国籍字段直接取自上述官方公开接口，领馆正文另给一般游客及年度累计规则。
- 本批所有已确认规则复核期至 2026-11-20。剩余队列继续包含中国内地证件、韩国未复核证件、中东、拉美及先前受阻路线；官方证据不足的项目不机械续期。
