# BorderLens 规则重新核验日志

## Phase 83 · 更正老挝港澳护照路线状态（2026-10-22，Asia/Shanghai）

发布前交叉核对发现 Phase 82 的记录与种子数据不一致：日志已说明香港、澳门特区护照路线因缺少目的地主管机关针对证件的完整入境要求而保持 REVIEW，但两条数据仍为 `verified / visa_required`，并会形成确定结论。本阶段修正状态为 `draft / manual_review`、清空停留天数，并将展示条件改为明确说明 eVisa 资格名单只支持特定产品的申请资格，不足以确定整体入境签证要求。

本次不新增证据、不续期港澳路线，也不据此判断其免签或落地签待遇。老挝 MOFA 当前资格名单列出 China、Hong Kong SAR, China、Macao SAR, China；当前条款说明产品面向普通护照持有人。申请资格和产品条款仍不能证明港澳护照必须申请该 eVisa。下一步需取得老挝主管机关针对 HKSAR 与 Macao SAR 普通护照的当前整体入境要求，或可验证的其他签证/免签/落地签依据；取得前保持 REVIEW。

该修正仅消除实现与既有证据记录的矛盾，147 条路线及 127 个来源总量不变。按现行目录口径，全库当前有效证据 131 条、历史到期 11 条、明确证据待复核 5 条、个体条件待复核 3 条；查询为 128 条当前结论、19 条 REVIEW。相关一手来源仍为 [Lao eVisa 当前适用国籍名单](https://laoevisa.gov.la/article/Who%20can%20Apply%20for%20Lao%20eVisa) 与 [Lao eVisa 条款](https://laoevisa.gov.la/term)；资格页面在本轮 UTC 10 月 22 日读取超时，依据前一轮成功读取的页面内容，不将超时写成新的核验。

## Phase 82 · 老挝中国普通护照 B3 落地签（2026-10-22，Asia/Shanghai；规则日期按 UTC 记为 2026-10-21）

中国驻琅勃拉邦总领馆 2026-01-07《赴老挝须知》明确区分因私护照的使领馆签证、eVisa 与 B3 落地旅游签：中国公民持因私护照可在列明的 13 个国际口岸申请 B3 落地签，费用 USD 20、停留 30 天；磨丁铁路口岸不办理 VOA。指南还列明护照剩余有效期超过 6 个月、至少 2 页空白页（不含备注页）、两张近半年白底 35×45 mm 照片及现场填写申请表和入境卡。故为中国普通护照单独新增 `visa_on_arrival` 路线，不再让 eVisa 成为资料呈现中唯一可见的签证渠道。

老挝外交部 eVisa 当前条款仍仅适用于普通护照，T-B3 停留 30 天、批准信有效 60 天、要求打印并仅可从 9 个指定口岸入境。电子签与落地签保持为独立途径，不将落地签13口岸、费用或材料套用到 eVisa；领事指南旧有 8 个 eVisa 口岸列表不覆盖 MOFA 当前条款新增的 Khamsavath Railway Station。指南只直接覆盖中国公民因私护照，本次不外推到 HKSAR/Macao SAR 护照；港澳路线仍处于过期 REVIEW，直至取得目的地主管机关针对各证件的充分材料。

本批新增 1 条 VOA 来源与路线，并续核中国普通护照 eVisa 记录；两条规则的核验日期按 UTC 记为 2026-10-21，复核截止为 2026-11-20。当前有效证据 131 条（128 条可展示结论、3 条个体条件审核）、13 条历史到期、3 条明确证据问题；查询 REVIEW 共 19 条。来源：[中国驻琅勃拉邦总领事馆《赴老挝须知》](https://luangprabang.china-consulate.gov.cn/chn/lsfw/flwxz/202601/t20260107_11807949.htm)、[Lao eVisa 当前适用国籍名单](https://laoevisa.gov.la/article/Who%20can%20Apply%20for%20Lao%20eVisa)、[Lao eVisa 条款](https://laoevisa.gov.la/term)。

## Phase 81 · 巴林中国、香港及澳门路线（2026-10-21）

此前 Phase 68 在官方 eVisa 国籍名单均返回 403 时保留三条历史规则并让其进入 REVIEW。本次重新打开 [NPRA 在线签证国籍名单](https://www.evisa.gov.bh/list-of-online-visa-country.html) 和[落地签国籍名单](https://www.evisa.gov.bh/list-of-onarrival-visa-country.html)，两页当前均可读取。落地签表第 10–12 行提示条款适用、须进一步点击国家名称核对资格；第 37 行列 China、第 12 行列 Hong Kong, China、第 39 行列 Macao, China。在线名单相同地列出这三项（第 32、57、59 行）。[官方 eVisa 首页免责声明](https://www.evisa.gov.bh/)另说明签证及申请费用不保证获批或入境。

据此三条路线更新为 `verified / visa_on_arrival`，并记录在线 eVisa 是并行申请途径；不写入单次停留天数，也不把国家名单当作无条件获签或确切个人资格。每条均连接上述两份路线名单，复核至 2026-11-20。此前“HTTP 403、不可续期”的记载保留为 2026-10-21 较早时点的历史访问记录，以体现官方源可达状态在同日发生变化。

## Phase 79 · 厄瓜多尔香港及澳门特区护照免签复核（2026-10-21）

重新核对香港政府 1999-09-03 公告：厄瓜多尔与香港特区的免签安排自 1999-10-03 生效，HKSAR 护照访问最多 90 天；香港入境处当前对外参考表仍列 Ecuador、90 days，并明确最终以目的地入境机关决定。澳门政府《澳门年鉴 2025》附录九 America > Ecuador 行仍列 Macao SAR Passport 最长停留 90 天，而 Macao SAR Travel Permit 不适用；澳门政府 2017-03-27 公告记录厄瓜多尔驻华使馆通知澳门特区护照免签最多 90 天。

同时复核厄瓜多尔外交部入境需签证名单及 2024-07-01 第 0000064 号部长令：PRC 一般入境要求不能不加区分地套用到特区普通护照；部长令本身保留适用免签协定例外。港澳路线均仅覆盖对应特区普通护照旅游访问，保持最长停留 90 天，不扩展至香港签证身份书、澳门特区旅行证或其他目的。香港和澳门两条记录的专项官方证据均重新核验，复核截止更新至 2026-11-20；没有将厄瓜多尔外交部对“厄瓜多尔公民出境目的地”的反向页面误作赴厄入境证据。

本批只续期 2 条已有窄规则，不新增来源或改变签证产品。当前有效证据 124 条（121 条可展示结论、3 条个体条件审核）、19 条历史到期、3 条明确证据问题；查询 REVIEW 共 25 条。完整测试与发布结果见 `docs/BUILD_LOG.md` Phase 79。

## Phase 78 · 缅甸中港澳电子签与航空落地签路线（2026-10-21）

重新打开缅甸旅游部电子签与落地签页面、2026 年中国/印度试行延期公告、缅甸驻港总领馆 HKSAR 延期公告，以及澳门政府和缅甸官方澳门试行公告。电子签页面当前仍列 China、Hong Kong SAR、Macao SAR 普通护照游客可申请 Tourist eVisa：批准信有效 90 天、单次入境后停留 28 天，仅限仰光/曼德勒/内比都国际机场及 Kawthaung 陆路口岸，不接受海港。三条 eVisa 路线更新核验日为 2026-10-21，复核至 2026-11-20。

中国和香港的落地签与 eVisa 分开建模，避免以航空试行路线覆盖陆路 eVisa 条件。旅游部 2026-09-15 公告附图确认中国游客航空 VOA 第三期为 2026-08-30 至 2027-08-29；驻港总领馆 2026-06-19 公告附图确认 HKSAR 护照 VOA 延期至 2027-03-10。旅游部当前一般 VOA 页面支持 USD 50、最多 30 天、国际机场、护照至少 6 个月有效、2 张照片且不可延期等条件。两条在当前试行期内建立 `air` 落地签路线，并用带缅甸时区的 `effectiveUntil` 门禁。

澳门特区护照 VOA 的缅甸官方延期公告只覆盖 2025-10-21 至 2026-10-20。澳门政府原始通知也只证明 2024 首期开始；在本轮核对的澳门政府与缅甸旅游部官方公告中未找到 2026-10-20 之后的延期材料。这不是“永久停止”的证据，因此将过期 VOA 路线保留为 REVIEW，不展示历史落地签结论；澳门当前 eVisa 路线另行保留，不受 VOA 试行期到期影响。

来源：[缅甸旅游部 Electronic Visa](https://tourism.gov.mm/en/e-visa)、[缅甸旅游部 Visa on Arrival](https://tourism.gov.mm/en/information-pages/visa-on-arrival)、[中国/印度游客 VOA 续期公告](https://tourism.gov.mm/en/announcements/extension-of-visa-on-arrival-tourist-for-chinese-and-indian-tourists)、[缅甸驻港总领馆 HKSAR VOA 续期公告](https://myanmarconsulatehk.org/extension-of-tourist-visa-on-arrival-in-myanmar-for-the-hong-kong-passport-holders/)、[澳门 VOA 缅甸官方续期公告](https://tourism.gov.mm/mm/announcements/aaksanhngatlungeyaeyaawankyitaannhngat-hotenhngatkhyaithwalayaewankyitaan-pyitaawinsuwankyi-jeng-phang-nawtawin-nepyitawhotezonyahi-hotemyaamh-lonkhyonyaewantaanmyaa-e-sunsaawinyaimyhngattinyaesaoinyaa-myanmayaoyaathointhintansainpwe-akhananatho-tetyaawet)、[澳门政府原始通知](https://www.gov.mo/en/news/346835/)。

本批新增 3 条独立 VOA 路线，核验至 2026-11-20；中国与 HKSAR 为当前航空落地签，澳门历史路线按有效期门禁转入 REVIEW。三条 eVisa 路线均恢复当前核验。完整测试、统计和发布结果见 `docs/BUILD_LOG.md` Phase 78。

## Phase 77 · 沙特 HKSAR 普通护照落地签路线（2026-10-21）

香港入境处当前《Visa-free Access or Visa-on-arrival for HKSAR passport list》在 Saudi Arabia 第 138 项及 Remark 30 记载：依据沙特驻港总领馆通知，HKSAR 护照可在六个指定口岸申请旅游落地签，单次签有效 90 天、最多停留 30 天；多次签有效一年、最多停留 90 天；也可行前申请 eVisa。香港政府 2025-01-14 公告记录收到总领馆通知，入境处当前清单复述相同安排。故仅香港特区普通护照路线更新为 `visa_on_arrival`，核验日期 2026-10-21、复核截止 2026-11-20，期限字段记可申请产品中的最高 90 天，并把六口岸、两种停留期及 eVisa 替代通道列为条件。

中国普通护照目前沙特 eVisa 官方 Eligible Countries 条目只证明可申请该 eVisa 产品，未独立排除其他入境路径；澳门特区护照的 DSI 历史待遇记录也尚未在本轮取得沙特主管机关当前确认。因此这两条仍保留过期 REVIEW，不根据同一 eVisa 合资格组推导相同签证制度，也不把港澳护照互相类推。巴林和其他过期路线不在本批变更范围。

本批仅更新 1 条规则，新增香港政府公告来源，并复用已登记的入境处当前清单来源（同步扩充其范围与核验说明）。当前证据 117 条（114 条可展示结论、3 条个体条件审核），23 条历史到期、3 条证据问题；查询 REVIEW 共 29 条。三类沙特护照路线分别为香港当前落地签、中国与澳门仍过期。完整回归与发布状态见 `docs/BUILD_LOG.md` Phase 77。

## Phase 76 · 韩国普通旅游路线与临时 K-ETA 豁免复核（2026-10-21）

韩国签证门户 Visa Navigator 本轮再次返回中国普通护照普通旅游 C-3-9、香港签证身份书 C-3-9；仅续期对应来源/证据日期，不把签证申请资格或个案申请材料扩大为未证实的身份权益。港澳特区护照的 K-ETA 合资格表仍分别列 90 天；韩国法务部 2025-12-23 公告把临时 K-ETA 豁免延长至 2026-12-31（韩国时间），韩国驻瑞士使馆当前名单明确包括 Hong Kong 与 Macao。因此港澳两条继续 90 天免签，并保留 `effectiveUntil`，到期后必须重核。官方驻华使馆 FAQ 确认中国公民普通旅游一般应申请签证；不将只针对公务/外交护照的免签表、济州或过境例外应用到普通旅游基线。

来源：[Korea Visa Portal](https://www.visa.go.kr/openPage.do?MENU_ID=10101)、[K-ETA 资格表](https://www.k-eta.go.kr/portal/guide/viewetaalification.do)、[韩国法务部临时豁免延期公告](https://www.k-eta.go.kr/portal/board/viewboarddetail.do?bbsSn=299707&esntlPnotiMtYn=Y&locale=EN)、[韩国驻瑞士使馆豁免名单](https://overseas.mofa.go.kr/ch-en/brd/m_23429/view.do?seq=22)、[韩国驻华使馆签证 FAQ](https://overseas.mofa.go.kr/cn-zh/wpge/m_1199/contents.do)。其余韩国路线不改。

## Phase 75 · 阿联酋/孟加拉国冲突复查与柬埔寨临时豁免到期（2026-10-21）

| 证据批次 | 当前官方原文及结果 |
|---|---|
| 澳门特区护照 → 阿联酋 | 重新读取 [UAE MOFA 国籍待遇卡](https://www.mofa.gov.ae/en/visa-exemptions-for-non-citizen/)：Macao 卡仍是 Visa Required。另读取 [澳门政府/身份证明局 2019 公告](https://www.gov.mo/en/news/114215/)；公告称澳门政府曾正式收到 UAE 政府通知，澳门特区护照入境 UAE 免签最多 30 天。澳门《年鉴 2025》附录九第 523 页也列 30 天；第 528 页脚注仅限旅行证。当前主管机关卡片和澳门政府记录的对方官方通知直接冲突，继续 `draft / manual_review`，期限 null；新增澳门政府公告源，不把旧通知当作现行 UAE 核准。 |
| 香港/澳门特区护照 → 孟加拉国 | 重新核对香港总领馆 [Tourist Visa](https://hongkong.mofa.gov.bd/pages/static-pages/6952668735ce18e1c05a9d33) 与 [Visa Fees](https://hongkong.mofa.gov.bd/pages/static-pages/6952667c35ce18e1c05a97fc)：两页提供申请路径、香港/澳门身份证明要求及独立收费行，但不单独证明必须预先办签。另查孟加拉驻哥本哈根使馆 [Visa on Arrival](https://copenhagen.mofa.gov.bd/pages/static-pages/visa-on-arrival-7030f0-695266a835ce18e1c05aa9f3)，该页检索到的官方正文（页面注明 2026-09-09 更新）在有条件 VOA 国籍组列 China；驻北京使馆页也列中国。两者均未写 HKSAR/Macao passport 是否纳入 China 项。香港总领馆页的直接网页读取超时，使用官方页面解析文本复核，不把检索摘要独立当成结论依据。港澳两条维持 REVIEW。 |
| 中国、香港、澳门普通护照 → 柬埔寨 | [官方 Visa T 页面](https://www.evisa.gov.kh/information/visa_type/4)列单次入境、USD 30、签发日起 3 个月有效、停留 1 个月及护照剩余有效期超过 6 个月；免签名单不含中港澳。[官方服务首页](https://www.evisa.gov.kh/home)显示临时 PRC 护照免签公告：包含内地、香港、澳门、最多 14 天，生效期 2026-06-15 至 2026-10-15；本轮核验日 10 月 21 日已过期，因此不延用该例外，三条路线按 Visa T 基线续核至 2026-11-20。[Cambodia e-Arrival](https://arrival.gov.kh/)说明所有旅客（含已获签者）仍须填报，并可在抵达前 7 天内提交。研究客户端对 e-Visa 页面返回重定向循环；本轮逐项复核了官方页面解析出的条款，并在来源记录中注明读取方式。 |
| 中国及港澳普通护照 → 巴林 | 官方 [NPRA 在线签证国家页](https://www.evisa.gov.bh/list-of-online-visa-country.html)与[落地签国家页](https://www.evisa.gov.bh/list-of-onarrival-visa-country.html)本轮均返回 HTTP 403；[门户首页](https://www.evisa.gov.bh/)可读取并明确为官方唯一签证申请站，但不含国籍待遇。来源保留 2026-09-08 的 verified 历史内容和核验日期，另记本轮 HTTP 403 尝试时间 2026-10-21；三条路线不续期，继续作为过期 REVIEW。 |

变更仅涉及柬埔寨 3 条过期路线恢复当前核验状态；阿联酋澳门增加一条可追溯的对方政府通知证据但不改 REVIEW 结论；孟加拉国港澳不改 REVIEW；巴林三条不改政策日期。来源总数 117；102 verified、7 reachable、8 blocked（巴林旧内容的历史核验保留，当前 HTTP 403 单独记尝试）。全库 143 条，当前证据 114 条、可展示结论 111 条、历史过期 26 条、证据问题 REVIEW 3 条，查询总 REVIEW 32 条。具体测试和构建结果见 `docs/BUILD_LOG.md` Phase 75。

## Phase 72 · 拉美条件分支、期限单位与历史边界（2026-10-21）

处理智利、秘鲁、哥伦比亚、哥斯达黎加共 12 条，其余 131 条不变。前三国 9 条取得当前证据，核验日期为 2026-10-21、复核截止为 2026-11-20；哥斯达黎加 3 条只校正历史条款，保留 2026-09-11 / 2026-10-11，不机械续期。全库 143 条、111 来源，108 条证据有效，32 条历史到期、3 条显式证据问题；有效证据中另有 3 条个体条件未决，查询为 105 当前结论、38 REVIEW。

| 官方来源 | 本次直接证据与处理 |
|---|---|
| [智利领事选择器](https://serviciosconsulares.cl/tramites/site/tax/port/all/taxport_14___1.html)、其实际脚本加载的 [info_visas.json](https://serviciosconsulares.cl/consulados/stat/info_visas/info_visas.json) 和 [notas_visas.json](https://serviciosconsulares.cl/consulados/site/edic/base/port/notas_visas.json) | 三项当前公开数据正常读取。CHINA, REP. POPULAR 为 visa SI、上限 90 天；HONG KONG 为 NO / 90，MACAO 为 NO / 30。注 6 列中国符合条件美/加签证（排除 C 类/过境）或 Green Card、至少 6 个月有效的独立豁免。费用 0 不当免签，通用注释 90 天不覆盖澳门行 30 天；中国上限不是个人获批保证。登记两个新数据来源，三条均追溯选择器及两端点 |
| [秘鲁驻伦敦领馆](https://www.consulado.pe/es/londres/tramite/Paginas/Visas/Issuance-of-Tourist-Visa.aspx) 与 [外交部普通护照要求表](https://www.consulado.pe/Documents/visas/Requerimientos_de_visa_para_ciudadanos_extranjeros.pdf) | 当前页面和 PDF 正常读取。PDF 物理第 3 页中国 SI/NO (*)，脚注 a 是列示第三国签证至少 6 个月，b 为上述地区永久居留；补上旧记录遗漏的 b。第 5 页 Hong Kong 为 TURISTA NO / HASTA 90 / NEGOCIOS SI，补旅游 90 天、不推广至商务；Macao 为 TURISTA SI，另有太平洋联盟永久居民独立旅游豁免。中国普通护照不将条件分支 180 天当所有访客统一许可 |
| [哥伦比亚外交部入境 PDF](https://www.cancilleria.gov.co/sites/default/files/FOTOS2024/ENTRY%20TO%20COLOMBIA%20AND%20COURTESY%20VISA%20INFORMATION.pdf) 与 [驻港 FAQ](https://hongkong.consulado.gov.co/sala-de-prensa/noticias/30-preguntas-frecuentes-relativas-la-solicitud-y-expedicion-de-visas-extranjeros-para-colombia) | 正常读取。PDF 物理第 1/2 页中国美国/申根永久居留或相关签证超过 6 个月；另有不限国籍的太平洋联盟（智利/墨西哥/秘鲁）或安第斯共同体（玻利维亚/厄瓜多尔/秘鲁）永久居民豁免，补到中国和澳门。FAQ 明确香港旅游/过境免签、澳门一般需预先签证，但不排除独立永久居留分支。short stay 为 less than 90 days，香港 maxStayDays 改 null 并保留“少于 90 天”，不写包含第 90 天的统一许可或擅填 89 |
| [哥斯达黎加中央入口](https://migracion.go.cr/visas/) 与 [ICODER 政府保存的 2025-11-17 指引副本](https://www.icoder.go.cr/fileadmin/documentos/tramites/visas/Directrices-Generales-de-Visas-Noviembre-2025-Alcance-148-Gaceta-N_-216-17-11-2025.pdf) | 中央入口正常 HTTPS 与 HTTP/1.1 均返回 Cloudflare 403，没有绕过。2025 PDF 可读但不能单独证明仍现行。物理第 8/12/15 页核对第三组护照 180 自然日、盖章后 60 工作日内使用（不是停留期），中国籍未成年人由受限签证委员会审理；北京/上海成年旅行团及第三国证件仍是独立例外。修正三条历史条件，来源仅引用历史 PDF，原日期保持过期，中央入口状态标 blocked |

### 原文存证与视觉核验

已渲染检查秘鲁物理第 3/5 页、哥伦比亚第 1/2 页、哥斯达黎加第 8/12/15 页的表头、脚注及关键文字；未只凭关键词命中形成结论。只读研究文件保存在忽略目录 `work/phase72/pdfs/`，不收入 Git 或部署包。SHA-256：

- `pe-requirements.pdf`：`EF900088922311992182EEDA5C7FF1487CD75558334B6975DD0B1B0D0D71EE81`
- `co-entry.pdf`：`8A0D9ACAEB5AB93B16938ADFA4C61B2FD12534F22A7389C75CC7B9A29D80E517`
- `cr-directives.pdf`：`6F17796468E1441F560943B67D3483627D852E6ABD76AD15411C8BE29F6434A8`

## Phase 71 · 拉美四国与中国籍回乡证来源恢复（2026-10-21）

复核墨西哥、巴拉圭、玻利维亚、巴西各三条，以及中国籍港澳居民回乡证两条，共 14 条；其余 129 条政策不变。全库 99 条证据有效、41 条历史到期、3 条明确证据问题。当前有效证据中有新西兰例外及港澳回乡证共 3 条个体条件仍需 REVIEW，因此查询为 96 条当前结论、47 条 REVIEW，不是将 14 条都自动放行。统一复核截止 2026-11-20。

| 官方来源 | 本次证据与处理 |
|---|---|
| [墨西哥 INM 需签证名单](https://www.inm.gob.mx/gobmx/word/index.php/paises-requieren-visa-para-mexico/) 与 [驻港签证豁免](https://consulmex.sre.gob.mx/hongkong/index.php/for-foreigners/visa-exemptions) | 两页已正常 HTTPS 返回 200 并读取正文。China 在一般需签证名单，港澳护照在领馆条目为旅游/过境/商务最多 90 天免签。同一领馆页另明确任何外籍旅客持列示有效多次入境美/加/日/英/申根签证、指定国家永久居留等独立豁免路径，最长 180 天。中国普通护照条目不再是无例外的强制签证结论；不将例外停留期写成所有签证访客的统一期限，也不自动认定用户持有第三国资格 |
| [巴拉圭驻日本使馆 Visa](https://embapar.jp/en/sc/visa/) | HTTP 200，读取 COMMON PASSPORT HOLDER 的完整 I 免签表、II 落地签表及 III catch-all 要求。中国、香港、澳门不在前两张有限列表中，III 明确未列国籍必须出发前签证；不是仅凭居住地/领区材料清单推断。页面一般要求护照入境日起至少 6 个月，领区和面见流程不等于所有中国旅客必须到日本办签；没有据他国条目补填停留期 |
| [玻利维亚驻英国使馆分组表](https://bolivianembassy.co.uk/visa-grupos-1-2-3/) | HTTP 200，明确 TOURIST VISA GROUP II 下列 CHINA (INCLUYENDO HONG KONG, TAIWAN, MACAO)，并有六个月护照有效期、航班、住宿/邀请、银行记录、黄热病证明、照片及预约要求。三类普通护照继续 Group II 申请路线；Group I 的免签和 Group III 的天数/费用不能套用 |
| [巴西外交部国别表](https://www.gov.br/mre/pt-br/embaixada-abu-dhabi/abu-dhabi-arquivos/english/consular-services/visa/visa-requirements-by-country/visa-requirements-by-country-list-of-countries) 与 [驻港 Tourist Visa](https://www.gov.br/mre/pt-br/consulado-hong-kong/english/consular-services/visas/tourist-visa) | HTTP 200。China 段明确外交/公务护照以外其他类型须签证，VIVIS 用于无巴西公司报酬的旅游等访问。驻港原文明确港澳 SAR 护照最多 90 天免 Visitor Visa，香港身份书/澳门旅行证必须签证；本批不扩展到这些特殊证件。该领馆 HKID/Macao BIR 申请领区条件不是对所有免签入境旅客的附加居留要求 |
| [国家移民管理局现行签发指南](https://www.nia.gov.cn/n741445/n741604/n1787219/n1795772/c1792480/content.html) | 原旧地址 404 后，跟随政务首页实际 meta redirect 到 `/zwfwpt/`，从页面发布的 `niaService` 模块找到公开 [港澳台目录 JSON](https://s.nia.gov.cn/zwfwpt/api/newsapi/gatjm.json)，再跟随目录中精确的指南 URL。现行指南 HTTP 200；五、申请条件明确中国国籍及港澳居民类别，七、材料分别处理居民身份证、国籍证明、特区护照和通行证。更新原来源 URL，不新建重复来源；两条证据续期但继续 `manual_review`，申请资格不等于实际持证或自动通关许可 |

### 访问和未解决边界

- 墨西哥领馆首次读取成功并取得以上正文，后续补读发生传输 EOF；最后用正常证书验证的 curl HTTP/1.1 成功完整读取 a-e，确认包括航空及船舶机组专门分支，页面标注更新于 2026-01-11。没有关闭证书验证或伪装所有请求成功。
- 阿根廷当前国别表可读取，普通旅游列对中国为 REQUIERE VISA、美国签证/Green CARD 列为 HABILITADO；港澳行为空。仅凭空格或未解释的 HABILITADO 不能给出完整现行豁免结论，因此三条原日期保留，未机械续期。
- 本批公开 JSON 仅用于找到国家移民管理局正式公开指南，没有登录、提交、办理、上传或调用个人证件接口。

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

## Phase 74 · 阿根廷中国、香港与澳门普通护照复核（2026-10-21）

| 护照路线 | 当前官方一手证据 | 更新及边界 |
|---|---|---|
| 中国普通护照旅游 | 阿根廷 DNM [Regimen de Visas](https://www.migraciones.gob.ar/accesible/indexdnm.php?visas)；[Resolución 316/2025](https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-316-2025-415345/texto)；DNM [AVE 页面](https://www.migraciones.gob.ar/ave/) | DNM 当前矩阵将中国普通护照游客标为需签证。法规第 1 条为同类别有效美国签证设免领事签证及 AVE 例外，旅游/商务最多 30 天；第 2 条禁止变更类别、允许经 DNM 审批延期一次。AVE 页面另称美国 Green Card 持有人可免办 AVE，但法规明文例外写的是同类别美国签证；不把 Green Card 扩展为普遍免领事签证。 |
| 香港特区护照 | 阿根廷 DNM 上述普通护照矩阵；香港入境处 2026-10-16 [HKSAR 护照名单 PDF](https://www.immd.gov.hk/pdf/Visa-free%20Access%20or%20Visa-on-arrival%20for%20HKSAR%20passport%20list_Eng.pdf) | DNM 表列香港且普通游客栏无需签证标记；HKSAR 名单明确将 Argentina 对应最多 90 天。后者将免签与落地签合并列示并提示目的地主管机关决定最终入境/停留，因此 90 天仅作官方参考上限，不作个人获准停留保证；不扩展至香港签证身份书。 |
| 澳门特区护照 | 阿根廷政府 2019 年[互免签公告](https://www.argentina.gob.ar/noticias/turistas-de-argentina-y-de-la-region-china-de-macao-podran-viajar-sin-visado)；澳门 DSI [Macao SAR passport Argentina detail](https://www.dsi.gov.mo/Mobile/visa/visa_all_e.jsp?visa_id=149) | 两个官方来源都支持 30 天，而非此前因动态国家详情错配到 Ecuador 的 90 天。阿根廷公告限定澳门居住、中国籍、持澳门特区签发有效护照并因旅游或商务前往，可申请延期；DSI 将 Argentina 列在澳门特区护照待遇中、最多 30 天并标注协议免签。规则按这些资格条件记录，不扩展至澳门旅行证。 |

本批将 3 条阿根廷路线的 `checkedAt` 更新为 2026-10-21，复核至 2026-11-20；新增 5 个官方来源记录。全库仍为 143 条路线，来源 116 个；111 条证据在核验窗口内，其中 3 条个人条件仍需人工确认；29 条历史到期、3 条证据待解；查询为 108 条当前结论和 35 条 REVIEW。未解决的阿联酋/澳门来源冲突及孟加拉国港澳证据缺口仍保留 REVIEW。
## Phase 80 · 沙特中国普通护照与澳门特区护照（2026-10-21）

复核沙特中国普通护照与澳门特区护照两条路线。沙特《旅游签证条例》现行正文第 2 条规定旅游入境须持有效签证，除非依法豁免；第 4 条列出落地签、电子签及使馆渠道，并把国籍资格指向官方平台；第 5 条规定护照有效期至少 6 个月。沙特官方 eVisa 条款当前仍列 China（including Hong Kong and Macau），并说明旅游 eVisa 为一年多次、最多停留 90 天，适用旅游、活动、探亲访友和 Umrah（不含 Hajj），不适用于学习。

中国普通护照路线续期为 `visa_required`，仅记录已确认的 eVisa 办理路线，不声称必须提前申请或该路线是唯一选项。澳门身份证明局针对 Macao SAR passport 的目的地页明确列出 Saudi Arabia，参考停留 90 天，可落地获签或在线申请 eVisa；结合沙特法规和官方 eVisa 页面，将澳门路线从仅记录 eVisa 更正为 `visa_on_arrival`，并保留最终签发/停留由沙特主管机关决定的边界。两条规则核验日期均为 2026-10-21、复核截止 2026-11-20。

本批新增沙特旅游签证法规与澳门 DSI 沙特路线两个来源，并更新沙特 eVisa 来源记录。测试覆盖两条路线的结论、期限、日期、来源可追溯性及中国路线不声称电子签为唯一方式。未改变路线总数；其他 REVIEW 不变。
