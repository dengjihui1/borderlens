# 规则与来源台账

核验日期：2026-09-08。所有规则最迟在 2026-10-08 前复核；超过 30 天未复核时必须降级，不继续输出确定结论。

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
| 中国内地 | 非中国籍香港/澳门永久居民通行证 | 5 年内多次来往，每次最多 90 天 | 仅短期旅游、探亲、商务等；工作、学习、采访需另办许可 |
| 美国 | 中国普通护照、香港/澳门特区护照 | 需要访客签证 | 三者均不在 DHS 当前 42 个 VWP 国家名单；关岛—北马里亚纳另查 |
| 加拿大 | 中国普通护照 / 澳门特区护照 | 需要访客签证 | 航空、陆路、海路均需要；特定无签证过境项目另查 |
| 加拿大 | 香港特区护照 | 航空需 eTA；一般陆路/海路免 eTA | 必须是香港特区签发护照；圣皮埃尔和密克隆海路分支另查 |
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

## 核验方法

- 页面可访问只记为 `reachable`；只有条文、证件类型、条件和复核日期齐全才升级为 `verified`。
- 动态问答必须保存实际选择路径。例如英国香港护照旅游路径记录为 `/check-uk-visa/y/hong-kong/no/passport/tourism`。
- “不在电子许可名单”不能被写成“禁止入境”；系统转向明确的签证产品或人工路由。
- 官方 PDF 同时保存法规名称、附件、脚注和 PDF 页码；项目不提交整份临时下载文件。
- IATA Timatic 属许可型数据，不复制其完整数据库。
- 官方入口受阻时允许换用同一政府体系内可核验的替代页面，但保留原入口的 `blocked` 状态。例如美国国务院页面仍受安全验证阻挡，而 CBP/DHS 页面可直接核验；加拿大旧 IRCC 检查器仍受阻，而 Canada.ca 的 IRCC 证件清单可访问。
