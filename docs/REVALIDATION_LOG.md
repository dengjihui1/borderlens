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
