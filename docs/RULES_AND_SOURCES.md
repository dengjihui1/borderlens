# 规则与来源台账

核验日期：2026-09-11（第十二批墨西哥规则）；既有规则的最近核验日保留在各条记录中。所有规则最迟在对应 `reviewDueAt` 前复核；超过 30 天未复核时必须降级，不继续输出确定结论。

## 当前受控规则

| 目的地 | 旅行证件 | 旅游/短期访问结论 | 关键边界 |
|---|---|---|---|
| 日本 | 香港特区护照 | 免签，通常 90 天 | 仅 MOFA Note 5 对应证件 |
| 日本 | 澳门特区护照 | 免签，通常 90 天 | 仅 MOFA Note 6 对应证件 |
| 日本 | 中国普通护照 | 需要签证 | 不继承港澳护照待遇 |
| 新西兰 | 香港特区护照 | 先取得 NZeTA，入境后最多 90 天 | 必须为香港居民并使用同一本护照 |
| 新西兰 | 澳门特区护照 | 先取得 NZeTA，入境后最多 90 天 | 必须为澳门居民并使用同一本护照 |
| 新西兰 | 中国普通护照 | REVIEW | 从澳大利亚出发且持符合条件澳大利亚签证时存在特殊分支，不能泛化 |
| 申根区 | 中国普通护照 | 短期旅游需要申根签证 | 仅跨越申根外部边境的短期规则 |
| 申根区 | 香港特区护照 | 免签，任何 180 天内最多 90 天 | 仅香港特区护照 |
| 申根区 | 澳门特区护照 | 免签，任何 180 天内最多 90 天 | 仅澳门特区护照 |
| 新加坡 | 中国普通护照 | 免签，最多 30 天 | 2024-02-09 起；最终停留期由 ICA 决定 |
| 新加坡 | 香港/澳门特区护照 | 免签，最多 30 天 | 商务或社会访问；不等于保证入境 |
| 新加坡 | 香港签证身份书 / 澳门旅行证 | 需要签证 | 不能继承对应特区护照免签 |
| 澳大利亚 | 香港特区护照 | ETA 601，每次最多 3 个月 | 境外使用 ETA App；健康/品格等例外需改走 Visitor 600 |
| 澳大利亚 | 中国普通护照 / 澳门特区护照 | 需要另行取得适用签证 | 不在 ETA 601 名单；Visitor 600 仅是候选路线，stream 需复核 |
| 英国 | 中国普通护照 | Standard Visitor visa | 已复现的窄问答路径不含英爱双重公民及家庭关系例外 |
| 英国 | 香港/澳门特区护照 | ETA 或 Standard Visitor visa | 必须选择 passport 而非 travel document；犯罪/拒绝入境历史可能改变路线 |
| 中国内地 | 香港/澳门居民通行证路线 | ACTION 或 REVIEW | 身份证与通行证分别检查，实际口岸仍需复核 |
| 韩国 | 中国普通护照 | 一般旅游 C-3-9 签证 | 不把公务/外交护照、济州或团体旅游例外混入 |
| 韩国 | 香港/澳门特区护照 | K-ETA，通常最多 90 天 | 年龄、ABTC、已有签证/外国人登记等官方豁免条件另行检查 |
| 韩国 | 香港签证身份书 | 一般旅游 C-3-9 签证 | Visa Navigator 将 HONG KONG D.I. 与香港特区护照分开 |
| 阿联酋 | 中国普通护照 | 抵达时 30 天免费签证 | 护照至少 6 个月有效；延长一次需付费且受当地规定约束 |
| 阿联酋 | 香港特区护照 | 抵达时一个月签证 | 官方页面描述为不可续期，且不扩展到香港签证身份书 |
| 阿联酋 | 澳门特区护照 | 出发前办理访问签证 | 澳门未列入该页落地签名单，需担保人渠道 |
| 卡塔尔 | 中国普通护照、香港/澳门特区护照 | 机场落地签 QAR 100，或在线申请 Hayya A1 | Visit Qatar 官方 Visa Check 将三类证件列入 A1-3；本轮不猜停留天数 |
| 沙特 | 中国普通护照、香港/澳门特区护照 | 旅游电子签，最多 90 天 | 官方 Eligible Countries 写明 China including Hong Kong and Macau；一年多次入境，Umrah 不含 Hajj |
| 巴林 | 中国普通护照、香港/澳门特区护照 | 官方在线签证路线 | NPRA 在线国家名单分别列出 China、Hong Kong, China、Macao, China；具体条款和入境仍需复核 |
| 阿曼 | 中国普通护照 | 26A/26B Tourist Visit Visa，10 或 30 天 | 官方资格向导在 CHINA + GCC 居民 No 分支返回 26A（OMR 5）和 26B（OMR 20）；26A 条件含境外申请、护照至少 6 个月有效、无需担保人，签证不保证入境 |
| 阿曼 | 香港特区护照 | 26A/26B Tourist Visit Visa，10 或 30 天 | 官方资格向导在 HONG KONG + GCC 居民 No 分支返回 26A（OMR 5）和 26B（OMR 20）；不扩展到其他证件 |
| 阿曼 | 澳门特区护照 | REVIEW | 官方资格向导在 MACAU + GCC 居民 No 分支只返回 12B、33A，未返回 26A/26B；结果缺席不足以推出免签、全面拒签或其他普通签证结论 |
| 约旦 | 中国普通护照、香港/澳门特区护照 | REVIEW | 官方页面将不需预先批准定义为非受限国家，亚洲受限名单未列目标国籍；电子签服务页给出境外申请与费用，但未给出目标护照的完整最终路由，且 Travel Pass 证件另有统一限制 |
| 土耳其 | 中国普通护照 | 免签，任何 180 天内最多 90 天 | 土耳其外交部表格注明自 2026-01-02 起生效；仅普通护照旅游路线 |
| 土耳其 | 香港特区护照 | 免签，最多 90 天 | 仅香港特区护照；BNO 与香港签证身份书另行处理 |
| 土耳其 | 澳门特区护照 | 免签，最多 30 天 | 仅澳门特区护照，不扩展到澳门旅行证 |
| 埃及 | 中国普通护照 | 埃及电子签路线 | 官方电子签 FAQ 资格表列出中国；本轮不猜停留期限 |
| 埃及 | 香港/澳门特区护照 | REVIEW | 官方电子签资格表未显示港澳，但名单缺席不能推出普通签证或免签结论 |
| 墨西哥 | 中国普通护照 | 需要访问签证 | 官方需签证名单包含 China；旅游应申请不允许从事有报酬活动的访问者签证 |
| 墨西哥 | 香港特区护照 | 免签，最多 90 天 | 仅香港特区护照；适用于旅游、过境或商务 |
| 墨西哥 | 澳门特区护照 | 免签，最多 90 天 | 仅澳门特区护照；适用于旅游、过境或商务 |
| 中国内地 | 非中国籍香港/澳门永久居民通行证 | 5 年内多次来往，每次最多 90 天 | 仅短期旅游、探亲、商务等；工作、学习、采访需另办许可 |
| 美国 | 中国普通护照、香港/澳门特区护照 | 需要访客签证 | 三者均不在 DHS 当前 42 个 VWP 国家名单；关岛—北马里亚纳另查 |
| 加拿大 | 中国普通护照 / 澳门特区护照 | 需要访客签证 | 航空、陆路、海路均需要；特定无签证过境项目另查 |
| 加拿大 | 香港特区护照 | 航空需 eTA；一般陆路/海路免 eTA | 必须是香港特区签发护照；圣皮埃尔和密克隆海路分支另查 |
| 泰国 | 中国普通护照、香港/澳门特区护照 | 免签，最多 60 天 | 所有非泰国籍旅客按规定提交 TDAC；身份书/旅行证不继承护照结论 |
| 马来西亚 | 中国普通护照 | 免签，每次最多 30 天 | 互免安排的短期旅游分支；不覆盖工作或长期居留 |
| 马来西亚 | 香港特区护照 / 澳门特区护照 | 免签，分别最多 90 / 30 天 | 护照超过 6 个月有效；完成 MDAC 并选择正确国籍 |
| 马来西亚 | 香港签证身份书 / 澳门旅行证 | 前者需签证；后者最多 14 天免签 | 两类证件均不能继承对应特区护照待遇 |
| 印度尼西亚 | 中国普通护照 | B1 落地签，最多 30 天，可延长一次 30 天 | 护照至少 6 个月有效、离境票据、Rp500,000 |
| 印度尼西亚 | 香港/澳门特区护照 | A1 Tourism Visa Exemption | 官方选择器已确认产品；本轮不输出未稳定呈现的具体停留天数 |
| 越南 | 中国普通护照、香港/澳门特区护照 | REVIEW | 国家 eVisa 页面返回空白，资格、期限和口岸需直接复核 |
| 菲律宾 | 中国普通护照、香港/澳门特区护照 | REVIEW | DFA 页面被安全验证阻挡，索引摘要不作政策证据 |
| 柬埔寨 | 中国普通护照、香港/澳门特区护照 | Visa T 电子签，单次入境，停留 1 个月 | USD 30；签发日起 3 个月有效；护照超过 6 个月有效；另填 Cambodia e-Arrival |
| 老挝 | 中国普通护照、香港/澳门特区护照 | T-B3 旅游电子签，停留 30 天 | 批准信 60 天有效；只接受普通护照；须从 9 个指定口岸之一入境并打印批准信 |
| 缅甸 | 中国普通护照、香港/澳门特区护照 | 旅游电子签，停留 28 天 | 批准信 90 天有效；单次入境；仅 3 个国际机场与 Kawthaung 陆路口岸，海港不适用；旅行证件不接受 |
| 文莱 | 香港/澳门特区护照 | 免签，最多 14 天 | 超期、商务或专业访问需另办签证 |
| 文莱 | 中国普通护照 | REVIEW | 官方国家路由器为多分支控件，本轮未获得可审阅的最终类别 |
| 东帝汶 | 中国普通护照、香港/澳门特区护照 | 旅游落地签，停留 30 天 | 正式航空、陆路、海路口岸均可申请；USD 30 现金；护照至少 6 个月；通常可延长一次 30 天 |
| 印度 | 中国普通护照、香港/澳门特区护照 | REVIEW | 当前 eVisa 资格弹窗没有列出三类证件，但该页面不足以证明完整普通签证或豁免路线 |
| 斯里兰卡 | 中国普通护照 | ETA，30 天内两次入境 | 2026-05-25 起列入 40 国免费旅游 ETA 名单 |
| 斯里兰卡 | 香港/澳门特区护照 | ETA，30 天内两次入境 | 未列入免费名单，按其他国家费用分支；第二次入境只使用 30 天总期限的余额 |
| 尼泊尔 | 中国普通护照、香港/澳门特区护照 | REVIEW | 原 Visa on Arrival 英文官方页返回 404，期限、费用与排除名单待新入口复核 |
| 孟加拉国 | 中国普通护照、香港/澳门特区护照 | REVIEW | MRV 门户只证明可填新签证/落地签表格，未给出目标证件的国籍资格 |
| 马尔代夫 | 中国普通护照、香港/澳门特区护照 | 旅游落地签 | 无需预先签证批准；另通过官方 IMUGA 免费提交 Traveller Declaration；官网正文未稳定显示天数，本轮不猜期限 |
| 其他组合 | 任意 | REVIEW | 不根据模型记忆或第三方聚合器猜测 |

完整结构化条目、证据定位和原文摘录见 `data/policies.seed.json`。

## 申根为何不是“一个国家”

申根规则适用于跨国政策区域，不能伪装成某个 ISO 国家代码。`data/policy-zones.json` 当前记录 29 个成员：25 个欧盟成员国以及冰岛、挪威、瑞士和列支敦士登；塞浦路斯仍在整合，爱尔兰适用 opt-out，因此没有混入成员映射。

## 本批官方来源

- [Immigration New Zealand：Visa Waiver Visitor Visa](https://www.immigration.govt.nz/visas/visa-waiver-visitor-visa/)
- [European Commission：Visa policy](https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en)
- [Regulation (EU) 2018/1806 PDF](https://home-affairs.ec.europa.eu/system/files/2020-05/regulation-2018-1806.pdf)
- [European Commission：Schengen area](https://home-affairs.ec.europa.eu/policies/schengen/schengen-area_en)
- [Singapore ICA：Entering Singapore](https://www.ica.gov.sg/enter-transit-depart/entering-singapore)
- [Singapore ICA：Check if You Need an Entry Visa](https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements)
- [Singapore Embassy in Beijing：Visa information](https://beijing.mfa.gov.sg/consular-services/visa-information/)
- [Singapore Consulate-General in Hong Kong：Visa information](https://hongkong.mfa.gov.sg/consular-services/visa-information/)
- [Australian Home Affairs：Electronic Travel Authority 601](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601)
- [Australian Home Affairs：Can I go to Australia?](https://immi.homeaffairs.gov.au/entering-and-leaving-australia/entering-australia/can-i-go-to-australia)
- [Australian Home Affairs：Visitor visa 600](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600)
- [GOV.UK：Check if you need a UK visa](https://www.gov.uk/check-uk-visa)
- [Korea Visa Portal：Visa Navigator](https://www.visa.go.kr/openPage.do?MENU_ID=10101)
- [K-ETA：Eligible Countries / Applicants](https://www.k-eta.go.kr/portal/guide/viewetaalification.do)
- [UAE Ministry of Foreign Affairs, Shanghai：Visas](https://www.mofa.gov.ae/en/missions/shanghai/services/visas)
- [中国国家移民管理局：港澳居民来往内地通行证签发服务指南](https://s.nia.gov.cn/mps/bszy/wldl/ndtxz/202008/t20200828_1260.html)
- [中国国家移民管理局：非中国籍港澳永久居民来往内地通行证问答](https://www.nia.gov.cn/n794014/n1050181/n1050484/c1659464/content.html)
- [U.S. CBP：Electronic System for Travel Authorization](https://www.cbp.gov/travel/international-visitors/esta)
- [U.S. DHS：Visa Waiver Program country list](https://www.dhs.gov/visa-waiver-program)
- [Canada.ca / IRCC：What you need to enter Canada](https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/entry-requirements-country.html)
- [Thailand MFA：Visa Exemption (60 Days)](https://image.mfa.go.th/mfa/0/91fPdh6NtO/VISA_Information/Visa_Exemption_Revised_16_July_2024.pdf)
- [Thailand Immigration Bureau：Thailand Digital Arrival Card](https://tdac.immigration.go.th/manual/en/)
- [Malaysia Immigration：Malaysia–China mutual visa exemption FAQ](https://www.imi.gov.my/index.php/en/https-www-imi-gov-my-index-php-f-a-q-malaysia-china-visa-exemption-agreement/)
- [Malaysia MFA Hong Kong：Visa requirement information for foreigners](https://www.kln.gov.my/web/chn_hong-kong/requirement_foreigner)
- [Indonesia Immigration：Official visa selection](https://evisa.imigrasi.go.id/web/visa-selection)
- [Vietnam Immigration：National Electronic Visa system](https://evisa.gov.vn/e-visa/foreigners)（本轮空白响应，`blocked`）
- [Philippines DFA Beijing：General Information](https://beijingpe.dfa.gov.ph/general-information)（本轮安全验证阻挡，`blocked`）
- [Cambodia MFAIC：e-Visa Visa Type Information](https://www.evisa.gov.kh/information/visa_type/4)
- [Cambodia MFAIC：Official e-Visa service](https://www.evisa.gov.kh/home)
- [Lao PDR MOFA：Who can apply for Lao eVisa](https://laoevisa.gov.la/article/who_can_apply)
- [Lao PDR MOFA：eVisa Terms and Conditions](https://laoevisa.gov.la/term)
- [Myanmar Ministry of Immigration and Population：Notice to Tourist](https://evisa.moip.gov.mm/notice/tourist)
- [Brunei MFA：Visa Information by Country / Region](https://www.mfa.gov.bn/Pages/visa-information.aspx)
- [Brunei MFA：Category D3 — 14-day visa waiver](https://www.mfa.gov.bn/Pages/D3---D14.aspx)
- [Timor-Leste Migration Service：Tourist Visa](https://migracao.gov.tl/wp/tourist-visa/)
- [Timor-Leste Migration Service：Visa exemptions](https://migracao.gov.tl/wp/visa-exemptions/)
- [India Bureau of Immigration：Indian e-Visa](https://indianvisaonline.gov.in/evisa/tvoa.html)（目标证件普通签证路线仍待复核）
- [Sri Lanka Department of Immigration and Emigration：ETA official website](https://www.eta.gov.lk/slvisa/visainfo/center.jsp?locale=en_US)
- [Sri Lanka Department of Immigration and Emigration：Tourist ETA fees](https://www.eta.gov.lk/slvisa/visainfo/fees.jsp?locale=en_US)
- [Nepal Department of Immigration：Visa on Arrival](https://www.immigration.gov.np/en/page/visa-on-arrival)（本轮返回 404，`blocked`）
- [Bangladesh Department of Immigration and Passports：Online MRV Portal](https://visa.gov.bd/)
- [Maldives Immigration：Tourist Visa — On Arrival](https://www.immigration.gov.mv/visa/tourist-visa)
- [Maldives Immigration：Traveller Declaration](https://www.immigration.gov.mv/traveller-declaration)
- [Visit Qatar：Qatar Visa Check](https://visitqatar.com/intl-en/plan-your-trip/visas)
- [Saudi eVisa：Official tourist visa portal](https://visa.visitsaudi.com/)
- [Bahrain eVisa / NPRA：Countries Eligible to Get Visa Online](https://www.evisa.gov.bh/list-of-online-visa-country.html)
- [Royal Oman Police：eVisa View Visa Types](https://evisa.rop.gov.om/en/types-of-visa)
- [Royal Oman Police：eVisa Visa Eligibility Wizard](https://evisa.rop.gov.om/en/visa-eligibility)
- [Jordan Ministry of Interior：Countries requiring prior approval](https://moi.gov.jo/Ar/Pages/%D8%A7%D9%84%D8%AF%D9%88%D9%84_%D8%A7%D9%84%D8%AC%D9%86%D8%B3%D9%8A%D8%A7%D8%AA_%D8%A7%D9%84%D9%85%D9%82%D9%8A%D8%AF%D8%A9_%D9%88%D8%BA%D9%8A%D8%B1_%D8%A7%D9%84%D9%85%D9%82%D9%8A%D8%AF%D8%A9)
- [Jordan Ministry of Interior：Restricted and Non Restricted Countries (Nationalities)](https://moi.gov.jo/EN/Pages/Restricted_and_Non_Restricted_Countries_Nationalities)
- [Jordan Ministry of Interior：E Applications for Visa and Residence Permits](https://moi.gov.jo/EN/Pages/E_Applications_for_Visa_and_Residence_Permits)
- [Türkiye MFA：Visa Information For Foreigners](https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa)
- [Egypt Electronic Visa Portal：FAQ eligibility list](https://visa2egypt.gov.eg/eVisa/FAQ)
- [Mexico National Institute of Migration：Countries and regions requiring a visa](https://www.inm.gob.mx/gobmx/word/index.php/paises-requieren-visa-para-mexico/)
- [Consulate General of Mexico in Hong Kong：Mexican Visa Exemptions](https://consulmex.sre.gob.mx/hongkong/index.php/for-foreigners/visa-exemptions)

## 核验方法

- 页面可访问只记为 `reachable`；只有条文、证件类型、条件和复核日期齐全才升级为 `verified`。
- 动态问答必须保存实际选择路径。例如英国香港护照旅游路径记录为 `/check-uk-visa/y/hong-kong/no/passport/tourism`。
- “不在电子许可名单”不能被写成“禁止入境”；系统转向明确的签证产品或人工路由。
- 官方 PDF 同时保存法规名称、附件、脚注和 PDF 页码；项目不提交整份临时下载文件。
- IATA Timatic 属许可型数据，不复制其完整数据库。
- 官方入口受阻时允许换用同一政府体系内可核验的替代页面，但保留原入口的 `blocked` 状态。例如美国国务院页面仍受安全验证阻挡，而 CBP/DHS 页面可直接核验；加拿大旧 IRCC 检查器仍受阻，而 Canada.ca 的 IRCC 证件清单可访问。
