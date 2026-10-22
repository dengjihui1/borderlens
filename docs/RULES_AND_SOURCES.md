# 规则与来源台账

## Phase 69 查询与判定边界

`/policies` 接入全部结构化记录，以实际证件及签发地、目的地、旅行目的和交通方式筛选。判定共用 `lib/policy-catalog.ts`；`npm run data:review` 输出相同的逐条队列。无匹配不推断免签；申根成员映射已过期时不自动拓展至单一成员国。

证据仍有效的 `manual_review` 不作为确定结论；过期、draft、来源缺失、无已验证来源或未知 outcome 都隐藏历史结论。日期门禁拒绝未来核验、无效日历日期和不带时区的临时截止。普通规则保留全部条件，日历月和签证年度累计不被换算成单次天数。

Phase 73 首页接入完整规则库进行逐段查询及自查，旧版演示移至 `/demo`。每段匹配实际证件、用途、交通与目的地，日期超出复核/临时有效窗口隐藏结论；开着的页面每分钟及重新可见时复算。空侧转机、未知入境、居民/公民返境不套用访客规则；返程必须显式添加。不自动验证第三国签证/永久居留、口岸、出境或累计停留，勾选不触发全程 READY。旧演示仍不输出过期历史结论。未完成范围见 `PROJECT_PLAN.md`。

## 最近政策证据

核验日期：2026-10-22（Phase 86 续核约旦中国及港澳普通护照落地签；此前 Phase 85 续核埃及中国普通护照 eVisa）；其他规则的最近核验日保留在各条记录中。所有规则最迟在对应 `reviewDueAt` 前复核；临时政策另受带时区的 `effectiveUntil` 限制。到期、官方证据冲突或证据不足的路线不得输出确定结论。

截至 Phase 86，当前有效证据 138 条，其中 3 条需个体条件核验；另有 4 条历史到期和 5 条显式证据问题。查询口径为 135 条当前结论、12 条 REVIEW。约旦旅游局现行国籍表将中国、香港和澳门均列为可抵达办理签证、费用 40 JOD；未声明准许停留天数，因此期限留空，仅适用于对应普通护照，不外推至 Travel Pass 或其他旅行证件。老挝中国普通护照有独立 B3 落地签路线（13 个指定口岸、磨丁铁路除外），eVisa 是另一条可申请路线；不把 VOA 结论外推到港澳。老挝外交部名单列有港澳 eVisa 申请资格，但条款及资格页不能证明港澳整体入境必须办理该 eVisa，因此两条均改为 `manual_review`，不再展示签证类别或停留期。缅甸 eVisa 与机场落地签作为独立路线记录；中国及香港落地签试行期仍有效，澳门此前试行期于 2026-10-20 到期，未发现续期材料，故历史 VOA 记录进入 REVIEW，但澳门 eVisa 仍为单独当前路线。厄瓜多尔港澳普通护照记录分别由香港政府免签协定公告及澳门《2025 年鉴》支持，均限定最多停留 90 天。沙特中国普通护照记录为需签证、但不宣称 eVisa 是唯一渠道；澳门特区护照保留落地签及在线 eVisa 两条已核实路线。巴林中港澳国籍现同时列于 NPRA 落地签和在线申请名单，结论保留条款限制且不推断停留期限。哥斯达黎加三条路线由 2025-11-17 官方公报 AJ-484-11-2025 续核；埃及中国普通护照 eVisa 路线按内政部当前 FAQ 更新，未推断港澳 eVisa 资格。港澳赴孟加拉国证据不足、澳门赴阿联酋来源冲突仍未解决。证据定位和下一步要求见 `REVALIDATION_LOG.md`。

下表保留结构化规则的历史范围，不代表每一行目前仍有效；当日是否可用以规则自身的 `reviewDueAt` 和运行时门禁为准。覆盖率卡片含过期或待复核路线时，不展示旧的整组确定性结论。

## 当前受控规则

| 目的地 | 旅行证件 | 旅游/短期访问结论 | 关键边界 |
|---|---|---|---|
| 日本 | 香港特区护照 | 免签，通常 90 天 | 仅 MOFA Note 5 对应证件 |
| 日本 | 澳门特区护照 | 免签，通常 90 天 | 仅 MOFA Note 6 对应证件 |
| 日本 | 中国普通护照 | 需要签证 | 不继承港澳护照待遇 |
| 新西兰 | 香港特区护照 | 先取得 NZeTA，获准入境后最多 3 个日历月 | 必须为香港居民并使用同一本护照；不换算成固定 90 天 |
| 新西兰 | 澳门特区护照 | 先取得 NZeTA，获准入境后最多 3 个日历月 | 必须为澳门居民并使用同一本护照；不换算成固定 90 天 |
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
| 韩国 | 香港/澳门特区护照 | 短期免签最多 90 天；2026 年底前临时免 K-ETA | 截至 2026-12-31 韩国时间，自愿申请 K-ETA 仍收费；入境申报、口岸审查及后续政策另核 |
| 韩国 | 香港签证身份书 | 一般旅游 C-3-9 签证 | Visa Navigator 将 HONG KONG D.I. 与香港特区护照分开 |
| 阿联酋 | 中国普通护照 | 当前外交部卡片标为 Visa Free；期限未填 | 原上海领馆链接已失效；不沿用旧停留、延期和收费条款，实际要求须核对主管机关 |
| 阿联酋 | 香港特区护照 | 当前外交部卡片标为 Visa Free；期限未填 | 不扩展到签证身份书或其他证件；卡片未给出停留期限 |
| 阿联酋 | 澳门特区护照 | REVIEW：官方证据冲突 | 阿联酋外交部当前卡片标为 Visa Required，澳门官方年鉴列 30 天免签；须确认后才能给出结论 |
| 卡塔尔 | 中国普通护照、香港/澳门特区护照 | 免签入境，或可选 Hayya A1 | 三个国籍选项均映射 A1-3，其独立条件块明确 Enter visa-free；护照至少 3 个月有效，停留天数未给，不套用其他分支的费用与酒店要求 |
| 沙特 | 香港特区护照 | 可在指定口岸申请落地旅游签，最多 90 天 | 六个指定口岸；单次最多 30 天/多次最多 90 天；亦可行前申请 eVisa；以沙特现行要求和入境官裁量为准 |
| 沙特 | 中国普通护照、澳门特区护照 | REVIEW（历史结论已过期） | eVisa 资格或澳门历史待遇不能单独证明完整当前入境路线；不与 HKSAR 护照互相类推 |
| 巴林 | 中国普通护照、香港/澳门特区护照 | 官方在线签证路线 | NPRA 在线国家名单分别列出 China、Hong Kong, China、Macao, China；具体条款和入境仍需复核 |
| 阿曼 | 中国普通护照 | 有条件免签，最多 14 天 | 外交部第一组包含 China；护照至少 6 个月、返程票、酒店、健康保险和资金，14 天不可延期或转换；电子签产品查询不等于必须办签 |
| 阿曼 | 香港特区护照 | 有条件免签，最多 14 天 | 外交部第一组 China 明确包括 Hong Kong；同样保留护照、票据、酒店、保险、资金及不可延期/转换条件，不扩展到身份书 |
| 阿曼 | 澳门特区护照 | 免签，最多 14 天 | 阿曼外交部 Entry visas 页面将 China（包括 Hong Kong 和 Macau）列入第一组；需满足护照、返程票、酒店、保险和资金条件，14 天不可延期或转换；不扩展到澳门旅行证 |
| 约旦 | 中国普通护照 | 落地签，费用 40 JOD，停留期限待确认 | 约旦旅游局官方 Visas To Jordan 表将 China 列为 On-Arrival Applicable，并写明抵达办理、40 JOD；页面未给出准许停留天数；仅普通护照，不扩展到旅行证件 |
| 约旦 | 香港特区护照 | 落地签，费用 40 JOD，停留期限待确认 | 约旦旅游局官方表将 Hong Kong 列为 On-Arrival Applicable，并写明抵达办理、40 JOD；页面未给出准许停留天数；仅 HKSAR 普通护照，不扩展到签证身份书或旅行证件 |
| 约旦 | 澳门特区护照 | 落地签，费用 40 JOD，停留期限待确认 | 约旦旅游局官方表将 Macau 列为 On-Arrival Applicable，并写明抵达办理、40 JOD；页面未给出准许停留天数；仅澳门特区普通护照，不扩展到澳门旅行证或其他旅行证件 |
| 土耳其 | 中国普通护照 | 免签，任何 180 天内最多 90 天 | 土耳其外交部表格注明自 2026-01-02 起生效；仅普通护照旅游路线 |
| 土耳其 | 香港特区护照 | 免签，最多 90 天 | 仅香港特区护照；BNO 与香港签证身份书另行处理 |
| 土耳其 | 澳门特区护照 | 免签，最多 30 天 | 仅澳门特区护照，不扩展到澳门旅行证 |
| 埃及 | 中国普通护照 | 埃及电子签路线 | 官方电子签 FAQ 资格表列出中国；本轮不猜停留期限 |
| 埃及 | 香港特区护照 | 免签，最多 90 天 | 香港特区政府官方通告记录埃及政府将 HKSAR 护照免签期延长至 90 天；香港入境处当前参考表交叉列出 90 天；不扩展到香港签证身份书 |
| 埃及 | 澳门特区护照 | 免签，最多 90 天 | 《澳门年鉴 2025》官方签证待遇表列出埃及 90 天免签；澳门旅行证不适用 |
| 墨西哥 | 中国普通护照 | 一般需访问签证；存在独立豁免 | 未符合例外时按普通访问签证办理；列示有效多次第三国签证、永久居留及专门证件分支必须逐案核对，不自动认定；不把豁免 180 天当所有签证访客统一期限 |
| 墨西哥 | 香港特区护照 | 免签，最多 90 天 | 仅香港特区护照；适用于旅游、过境或商务 |
| 墨西哥 | 澳门特区护照 | 免签，最多 90 天 | 仅澳门特区护照；适用于旅游、过境或商务 |
| 巴西 | 中国普通护照 | 需要 Visitor Visa（VIVIS） | 巴西外交部中国条目仅对外交/公务护照设例外，其他护照入境前需签证 |
| 巴西 | 香港特区护照 | 免 Visitor Visa，最多 90 天 | 仅香港特区护照；旅游、过境或商务适用 |
| 巴西 | 澳门特区护照 | 免 Visitor Visa，最多 90 天 | 仅澳门特区护照；旅游、过境或商务适用 |
| 秘鲁 | 中国普通护照 | 通常需要旅游签证；符合条件的第三国签证或永久居留可免签 | 普通护照表第 3 页脚注 a/b 分别列英/加/澳/申根/美签证至少 6 个月有效或上述地区永久居留；另有太平洋联盟永久居民独立旅游豁免，不能把例外 180 天当所有旅客统一期限 |
| 秘鲁 | 香港特区护照 | 免旅游签证，最多 90 天 | 普通护照表第 5 页 Hong Kong 为 TURISTA NO / HASTA 90；NEGOCIOS SI，不扩大至商务 |
| 秘鲁 | 澳门特区护照 | 一般需要旅游签证；有独立永久居留豁免 | 普通护照表第 5 页 Macao 的 TURISTA 为 SI；同页太平洋联盟永久居民旅游豁免须独立核对，不扩展到澳门旅行证 |
| 哥伦比亚 | 中国普通护照 | 一般需 Visitor (V) 签证；有指定签证/永久居留条件免签 | 美国/申根永久居留或相关签证超过 6 个月；另有不分国籍的太平洋联盟或安第斯共同体指定国家永久居民豁免，须逐案核对 |
| 哥伦比亚 | 香港特区护照 | 短期免 Visitor (V) 签证，少于 90 天 | 官方特殊地区名单列出 Hong Kong；不扩展到香港签证身份书 |
| 哥伦比亚 | 澳门特区护照 | 一般需 Visitor 签证；有独立永久居留豁免 | 驻港 FAQ 直接列澳门一般签证要求；外交部 PDF 第 2 页另有太平洋联盟或安第斯共同体指定国家永久居民豁免；不扩展到澳门旅行证 |
| 智利 | 中国普通护照 | 通常需要临时停留签证/授权，申请停留上限 90 天；有美/加签证或 Green Card 条件豁免 | 当前官方 JSON 中国行 visa SI、上限 90；注 6 排除美国 C 类或过境签，相关证件至少 6 个月有效；费用 0 不等于免签，上限不保证个人获批 |
| 智利 | 香港特区护照 | 免签，最多 90 天 | 官方领事选择器注明 Hong Kong 特别行政区国民；不扩展到香港签证身份书 |
| 智利 | 澳门特区护照 | 免签，最多 30 天 | 官方领事选择器注明 Macao 特别行政区国民；不扩展到澳门旅行证 |
| 阿根廷 | 中国普通护照 | 普通游客基线需签证；同类别有效美国签证可适用 30 天旅游/商务免领事签证及 AVE 例外 | 不符合例外者需向领事机构申请；不得转换移民类别，延期须 DNM 审批。DNM AVE 页面另提 Green Card 免办 AVE，但不据此扩展免领事签证结论 |
| 阿根廷 | 香港特区护照 | 免签，官方参考上限 90 天 | DNM 普通游客矩阵未标需签证；香港入境处 2026-10-16 表列阿根廷 90 天，但合并免签/落地签且只作参考；不扩展到香港签证身份书 |
| 阿根廷 | 澳门特区护照 | 符合资格者免签，最多 30 天 | 阿根廷公告及澳门 DSI 均列 30 天；阿根廷公告限定澳门居住、中国籍、持有效澳门特区签发护照及旅游/商务用途；不扩展到澳门旅行证 |
| 乌拉圭 | 中国普通护照 | 需要签证；符合条件的第三国签证与指定首入港口可触发例外 | 内政部表格将中国普通护照列为需签证；脚注 (10) 列出美国、加拿大、英国或欧盟签证及指定首入港口条件 |
| 乌拉圭 | 香港特区护照 | 免签，期限待官方表格进一步确认 | 仅 Pte. HKSAR；脚注 (4) 要求护照显示 HKSAR 或 OVERSEAS |
| 乌拉圭 | 澳门特区护照 | 免签，期限待官方表格进一步确认 | 脚注 (11) 明确澳门特区普通护照免签；本条不扩展到其他证件 |
| 厄瓜多尔 | 中国普通护照 | 需要预先签证 | 外交部入境需签证名单与 2024 年部长令均支持普通护照基础路线；不推断签证类别与停留期 |
| 厄瓜多尔 | 香港特区普通护照 | 免签，最多 90 天 | 香港特区政府公告确认厄瓜多尔免签协定；香港入境处当前参考表交叉列出 90 天；不扩展到香港签证身份书或其他证件 |
| 厄瓜多尔 | 澳门特区普通护照 | 免签，最多 90 天 | 《澳门年鉴 2025》官方签证待遇表列出 Ecuador 90 天；澳门旅行证不适用，出发前仍应按厄瓜多尔官方最新要求核对 |
| 巴拉圭 | 中国普通护照 | 需要出发前签证 | 驻日使馆官方页规定免签名单之外的国籍必须出发前取得签证；不推断签发期限与停留期 |
| 巴拉圭 | 香港/澳门特区护照 | 需要出发前签证 | 官方短期免签名单未列港澳，且签证申请要求明确提到 Hong Kong、Macao；仅覆盖对应特区护照 |
| 玻利维亚 | 中国普通护照、香港/澳门特区护照 | Tourist Visa Group II，需要旅游签证 | 驻英使馆官方分组表将 China（包括 Hong Kong、Taiwan、Macao）列入 Group II，并给出材料与领事预约流程；页面未给出停留期 |
| 哥斯达黎加 | 中国普通护照 | REVIEW，以下仅为历史条款 | 2025 指引列第三组，未成年人由受限签证委员会审理；第三组护照至少 180 自然日、签证盖章后 60 工作日内使用（非停留期）；成年旅行团及第三国证件另有例外；中央入口受阻，未确认现行版本 |
| 哥斯达黎加 | 香港特区护照 | REVIEW，以下仅为历史条款 | 2025 指引列不持英国护照的香港国民适用中国对应规定，包括未成年人分支；不扩展到身份书，不以历史副本续期 |
| 哥斯达黎加 | 澳门特区护照 | REVIEW，以下仅为历史条款 | 2025 指引列不持葡萄牙护照的澳门国民适用中国对应规定，包括未成年人分支；不扩展到旅行证，不以历史副本续期 |
| 中国内地 | 非中国籍香港/澳门永久居民通行证 | 5 年内多次来往，每次最多 90 天 | 仅短期旅游、探亲、商务等；工作、学习、采访需另办许可 |
| 美国 | 中国普通护照、香港/澳门特区护照 | 一般旅游需 B-2 或 B-1/B-2 | 使用国务院现行 VWP 封闭名单与 Visitor Visa 一般要求；关岛/北马里亚纳及其他国籍或居留身份另核 |
| 加拿大 | 中国普通护照 / 澳门特区护照 | 需要访客签证 | 航空、陆路、海路均需要；特定无签证过境项目另查 |
| 加拿大 | 香港特区护照 | 航空需 eTA；一般陆路/海路免 eTA | 必须是香港特区签发护照；圣皮埃尔和密克隆海路分支另查 |
| 泰国 | 中国普通护照、香港/澳门特区护照 | 免签，最多 60 天 | 所有非泰国籍旅客按规定提交 TDAC；身份书/旅行证不继承护照结论 |
| 马来西亚 | 中国普通护照 | 免签，每次最多 30 天 | 互免安排的短期旅游分支；不覆盖工作或长期居留 |
| 马来西亚 | 香港特区护照 / 澳门特区护照 | 免签，分别最多 90 / 30 天 | 护照超过 6 个月有效；完成 MDAC 并选择正确国籍 |
| 马来西亚 | 香港签证身份书 / 澳门旅行证 | 前者需签证；后者最多 14 天免签 | 两类证件均不能继承对应特区护照待遇 |
| 印度尼西亚 | 中国普通护照 | B1 落地签，最多 30 天，可延长一次 30 天 | 护照至少 6 个月有效、离境票据、Rp500,000 |
| 印度尼西亚 | 香港/澳门特区护照 | A1 旅游免签，最多 30 天、不可延期 | 按国籍筛选的产品列表与 A1 详情共同核验；护照至少 6 个月有效、离境票据，禁止工作或收取当地报酬 |
| 越南 | 中国普通护照 | Vietnam e-Visa，最长 90 天，可单次或多次入境 | 官方国籍 API 将 CHN / China 标为 EVISA；申请须在越南境外，需有效护照或国际旅行证件，并经政府指定国际边境口岸出入 |
| 越南 | 香港/澳门特区护照 | Vietnam e-Visa，最长 90 天，可单次或多次入境 | 官方 e-Visa 国籍名单的 CHN 行明确包含 Hong Kong SAR 和 Macao SAR passport holders，并排除 Chinese e-passport holders；仍须从指定国际口岸出入 |
| 蒙古 | 中国普通护照 | 免签，期限待官方入口进一步核验 | 蒙古电子签官方系统的 VISA FREE COUNTRIES 名单列出 The People's Republic of China；当前页未说明停留天数与特殊证件 |
| 蒙古 | 香港特区护照 | 免签，期限待官方入口进一步核验 | 官方名单列出 Hong Kong SAR (China)；当前页未说明停留天数与香港签证身份书 |
| 蒙古 | 澳门特区护照 | 免签，期限待官方入口进一步核验 | 官方名单列出 Macau SAR (China)；当前页未说明停留天数与澳门旅行证 |
| 菲律宾 | 中国普通护照 | 旅游/商务免签，最多 14 天 | 2026-01-16 生效；仅限马尼拉与宿务两个机场；不可延期或转换，前往第三国过境需签证 |
| 菲律宾 | 香港特区护照 | 9A 免签，初始准许停留 14 天 | 菲律宾移民局 Visa Waiver 页面直接列出 HONG KONG / MACAU SAR PASSPORT；首次延长项目另行办理 |
| 菲律宾 | 澳门特区护照 | 9A 免签，初始准许停留 14 天 | 菲律宾移民局 Visa Waiver 页面直接列出 HONG KONG / MACAU SAR PASSPORT；首次延长项目另行办理 |
| 柬埔寨 | 中国普通护照、香港/澳门特区护照 | Visa T 电子签，单次入境，停留 1 个月 | USD 30；签发日起 3 个月有效；护照超过 6 个月有效；另填 Cambodia e-Arrival。中国游客 2026-06-15 至 10-15 临时免签已过期，不用于当前路线 |
| 老挝 | 中国普通护照 | B3 旅游落地签（可申请）或 T-B3 电子签 | VOA：USD 20、停留 30 天、13 个口岸（磨丁铁路不办理）；护照有效期超过 6 个月、至少 2 页空白页及 2 张照片。eVisa：批准信 60 天有效、T-B3 停留 30 天、仅普通护照、9 个指定口岸并打印批准信 |
| 老挝 | 香港/澳门特区护照 | REVIEW：官方资格名单列有护照/地区，但不证明整体入境必须办签或可用该 eVisa | 不显示签证类别或停留期；eVisa 条款的 30 天、60 天、普通护照和口岸要求只用于描述产品，不冒充港澳护照实际入境结论；不将中国普通护照落地签规则外推至港澳 |
| 缅甸 | 中国普通护照、香港/澳门特区护照 | 旅游电子签，停留 28 天 | 批准信 90 天有效；单次入境；仅 3 个国际机场与 Kawthaung 陆路口岸，海港不适用；旅行证件不接受 |
| 缅甸 | 中国普通护照 | 航空旅游落地签试行，停留 30 天 | USD 50、护照至少有效 6 个月、2 张照片；官方续期至 2027-08-29；机场路线与 eVisa 分开 |
| 缅甸 | 香港特区护照 | 航空旅游落地签试行，停留 30 天 | USD 50、护照至少有效 6 个月、2 张照片；驻港总领馆续期至 2027-03-10；机场路线与 eVisa 分开 |
| 缅甸 | 澳门特区护照 | eVisa 当前路线；历史航空 VOA 复核中 | VOA 试行原定至 2026-10-20；未找到官方延期材料，不把历史 30 天条件当当前结论 |
| 文莱 | 香港/澳门特区护照 | 免签，最多 14 天 | 超期、商务或专业访问需另办签证 |
| 文莱 | 中国普通护照 | D3 免签，最多 14 天 | 外交部当前 China > Ordinary Passport 直接链接 Category D3；D3 正文确认无需签证、最多停留 14 天 |
| 东帝汶 | 中国普通护照、香港/澳门特区护照 | 旅游落地签，停留 30 天 | 正式航空、陆路、海路口岸均可申请；USD 30 现金；护照至少 6 个月；通常可延长一次 30 天 |
| 印度 | 中国普通护照 | 需旅游签证 | 驻北京大使馆官方 Tourist Visa-Info 页面明确旅游签证用途和中国申请人材料；电子签名单缺席不影响普通签证页面的直接结论 |
| 印度 | 香港特区护照 | 需适用印度签证，正规 Tourist Visa 路线可核验 | 中央签证门户一般要求与驻港改版官网共同支持；护照至少 180 天、连续两页空白页及本地身份材料；不续用失效费用表，eVisa 资格、收费及停留期另核 |
| 印度 | 澳门特区护照 | 需适用印度签证，正规 Tourist Visa 路线可核验 | 同一当前正规旅游签证路线；本地居民及非居民分别审查，不把 e-Arrival 当作签证，也不补填统一停留天数 |
| 斯里兰卡 | 中国普通护照 | ETA，30 天内两次入境 | 2026-05-25 起列入 40 国免费旅游 ETA 名单 |
| 斯里兰卡 | 香港/澳门特区护照 | ETA，30 天内两次入境 | 未列入免费名单，按其他国家费用分支；第二次入境只使用 30 天总期限的余额 |
| 尼泊尔 | 中国普通护照 | 需签证，免费；签证年度累计最多 150 天 | 年度值单列 `maxStayDaysPerVisaYear: 150`，单次 `maxStayDays` 为 null；实际签发和单次准许期限另核 |
| 尼泊尔 | 香港特区护照 | 需签证，免费；签证年度累计最多 150 天 | 同样区分免费、免签、年度累计和单次停留；不扩展为澳门护照免费待遇 |
| 尼泊尔 | 澳门特区护照 | 旅游落地签申请路线 | Nepaliport 官方 On-arrival Visa Application 的护照签发国列表列出 Macao Special Administrative Region of China（MAC，blacklisted=false）；确认可进入申请路线，但不保证签发、入境或停留天数 |
| 孟加拉国 | 中国普通护照 | 旅游落地签，最多 30 天 | 官方驻北京使馆页面列明中国属于可按条件申请落地签的国籍；需返程票、访问证明、至少 500 美元或等值资金，最终由移民机关审查 |
| 孟加拉国 | 香港特区护照 | REVIEW：护照专属签证要求待确认 | 费用表和旅游签申请材料不足以排除落地签；同一费用表中的中国有金额行并不排除中国旅客落地签，不能据此推断香港护照必须预先办签 |
| 孟加拉国 | 澳门特区护照 | REVIEW：护照专属签证要求待确认 | 保留正规旅游签申请和费用证据，但不据此作完整签证结论，不补填准许停留天数 |
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
- [Vietnam Immigration：National Electronic Visa system](https://evisa.gov.vn/e-visa/foreigners)
- [Vietnam Immigration：public nationality and border-gate APIs](https://api.evisa.gov.vn/client-service/public/dm-qt/get-all)
- [Vietnam Immigration：e-Visa nationality list](https://evisa.xuatnhapcanh.gov.vn/documents/20181/117155/Vietnam-Evisa-nation-list-Vi.pdf/7611c905-0370-45e9-8080-cd0dec11df95)
- [Philippines DFA Beijing：General Information](https://beijingpe.dfa.gov.ph/general-information)（本轮安全验证阻挡，`blocked`）
- [Philippines Bureau of Immigration：Visa Waiver](https://immigration.gov.ph/visas/visa-waiver/)
- [Philippine eVisa：Visa Policy](https://evisa.gov.ph/page/policy)
- [Mongolia Electronic Visa Application System：Visa Free Countries](https://evisa.mn/en)
- [Uruguay Ministry of the Interior：Régimen de visas de admisión](https://www.gub.uy/ministerio-interior/comunicacion/publicaciones/regimen-visas-admision)
- [Nepal Department of Immigration：Visa Exemption](https://immigration.gov.np/visa-exemption)
- [Cambodia MFAIC：e-Visa Visa Type Information](https://www.evisa.gov.kh/information/visa_type/4)
- [Cambodia MFAIC：Official e-Visa service](https://www.evisa.gov.kh/home)
- [Lao PDR MOFA：Who can apply for Lao eVisa](https://laoevisa.gov.la/article/Who%20can%20Apply%20for%20Lao%20eVisa)
- [Lao PDR MOFA：eVisa Terms and Conditions](https://laoevisa.gov.la/term)
- [中国驻琅勃拉邦总领事馆：赴老挝须知](https://luangprabang.china-consulate.gov.cn/chn/lsfw/flwxz/202601/t20260107_11807949.htm)（中国公民因私护照的 B3 落地签适用口岸、费用、停留期和材料；磨丁铁路口岸不办理落地签）
- [Myanmar Ministry of Immigration and Population：Notice to Tourist](https://evisa.moip.gov.mm/notice/tourist)
- [Myanmar Ministry of Hotels and Tourism：Electronic Visa](https://tourism.gov.mm/en/e-visa)
- [Myanmar Ministry of Hotels and Tourism：Visa on Arrival](https://tourism.gov.mm/en/information-pages/visa-on-arrival)
- [Myanmar Ministry of Hotels and Tourism：2026 China/India Tourist VOA extension](https://tourism.gov.mm/en/announcements/extension-of-visa-on-arrival-tourist-for-chinese-and-indian-tourists)
- [Myanmar Consulate General in Hong Kong：2026 HKSAR Tourist VOA extension](https://myanmarconsulatehk.org/extension-of-tourist-visa-on-arrival-in-myanmar-for-the-hong-kong-passport-holders/)
- [Myanmar Ministry of Hotels and Tourism：2025 Macau Tourist VOA extension](https://tourism.gov.mm/mm/announcements/aaksanhngatlungeyaeyaawankyitaannhngat-hotenhngatkhyaithwalayaewankyitaan-pyitaawinsuwankyi-jeng-phang-nawtawin-nepyitawhotezonyahi-hotemyaamh-lonkhyonyaewantaanmyaa-e-sunsaawinyaimyhngattinyaesaoinyaa-myanmayaoyaathointhintansainpwe-akhananatho-tetyaawet)
- [Brunei MFA：Visa Information by Country / Region](https://www.mfa.gov.bn/Pages/visa-information.aspx)
- [Brunei MFA：Category D3 — 14-day visa waiver](https://www.mfa.gov.bn/Pages/D3---D14.aspx)
- [Timor-Leste Migration Service：Tourist Visa](https://migracao.gov.tl/wp/tourist-visa/)
- [Timor-Leste Migration Service：Visa exemptions](https://migracao.gov.tl/wp/visa-exemptions/)
- [India Bureau of Immigration：Indian e-Visa](https://indianvisaonline.gov.in/evisa/tvoa.html)（电子签资格与普通签证路线分开记录）
- [Consulate General of India, Hong Kong：General Instructions](https://cgihk.gov.in/page/General_Information/)（港澳居民签证申请资格与非居民逐案审查）
- [Consulate General of India, Hong Kong：Visa Information](https://cgihk.gov.in/page/visa-information/)（Hong Kong/Macau Tourist Visa 申请材料）
- [Consulate General of India, Hong Kong：Indian Visa fee schedule for all nationalities](https://cgihk.gov.in/pdf/indian-visa-fee-schedule-for-all-nationalities.pdf)（Hong Kong/Macau Tourist Visa 均为 HKD 335，通常签发 3 个月单次；不把签证有效期写成停留期）
- [Hong Kong Immigration Department：Visa-free access or visa-on-arrival for HKSAR Passport](https://www.immd.gov.hk/eng/service/travel_document/visa_free_access.html)（官方参考表：Jordan 14 天、Egypt 90 天、Ecuador 90 天；合并免签/落地签显示，需向目的地官方确认）
- [Hong Kong Government：Visa-free arrangement for HKSAR passport holders](https://www.info.gov.hk/gia/general/199909/03/0903152.htm)（厄瓜多尔与 HKSAR 护照免签协定，最多 90 天，自 1999-10-03 生效）
- [Sri Lanka Department of Immigration and Emigration：ETA official website](https://www.eta.gov.lk/slvisa/visainfo/center.jsp?locale=en_US)
- [Sri Lanka Department of Immigration and Emigration：Tourist ETA fees](https://www.eta.gov.lk/slvisa/visainfo/fees.jsp?locale=en_US)
- [Nepal Department of Immigration：Visa on Arrival](https://www.immigration.gov.np/en/page/visa-on-arrival)（本轮返回 404，`blocked`）
- [Nepaliport：On-arrival Visa Application](https://nepaliport.immigration.gov.np/on-arrival/IO01)（官方护照签发国列表含 Macao；确认旅游落地签申请路线，不保证签发或停留期）
- [Bangladesh Department of Immigration and Passports：Online MRV Portal](https://visa.gov.bd/)（含 Hong Kong/Macau 当前费用记录；不单独决定入境制度）
- [Bangladesh Embassy in Beijing：Visa on Arrival](https://beijing.mofa.gov.bd/pages/static-pages/6952668b35ce18e1c05a9eb1)
- [Bangladesh Consulate General in Hong Kong：Tourist Visa](https://hongkong.mofa.gov.bd/pages/static-pages/6952668735ce18e1c05a9d33)
- [Bangladesh Consulate General in Hong Kong：Visa Fees](https://hongkong.mofa.gov.bd/pages/static-pages/6952667c35ce18e1c05a97fc)（Hong Kong/Macau 签证费率行；不补填统一停留期）
- [Maldives Immigration：Tourist Visa — On Arrival](https://www.immigration.gov.mv/visa/tourist-visa)
- [Maldives Immigration：Traveller Declaration](https://www.immigration.gov.mv/traveller-declaration)
- [Visit Qatar：Qatar Visa Check](https://visitqatar.com/intl-en/plan-your-trip/visas)
- [Saudi eVisa：Official tourist visa portal](https://visa.visitsaudi.com/)
- [Saudi Ministry of Tourism / Umm Al-Qura：Tourist Visa Regulations](https://www.uqn.gov.sa/details?p=19990)（第 2 条规定旅游签证原则，第 4 条列出落地签、eVisa 和使馆办理渠道，第 5 条规定护照有效期）
- [Macao Identification Services Bureau：Saudi Arabia entry route for Macao SAR passport holders](https://www.dsi.gov.mo/Mobile/visa/visa_region_e.jsp?visa_id=153)（参考 90 天，落地签或在线 eVisa；目的地主管机关决定入境和实际停留）
- [Hong Kong Government：Visa-on-arrival access to Saudi Arabia for HKSAR passport holders](https://www.info.gov.hk/gia/general/202501/14/P2025011400185.htm)
- [Hong Kong Immigration Department：Visa-free Access or Visa-on-arrival for HKSAR passport list](https://www.immd.gov.hk/pdf/Visa-free%20Access%20or%20Visa-on-arrival%20for%20HKSAR%20passport%20list_Eng.pdf)
- [Bahrain eVisa / NPRA：Countries Eligible to Get Visa Online](https://www.evisa.gov.bh/list-of-online-visa-country.html)
- [Bahrain eVisa / NPRA：On Arrival Visa Eligibility](https://www.evisa.gov.bh/list-of-onarrival-visa-country.html)（中国、香港、澳门均在国籍名单中；页面提示具体条款仍需逐项核对）
- [Royal Oman Police：eVisa View Visa Types](https://evisa.rop.gov.om/en/types-of-visa)
- [Royal Oman Police：eVisa Visa Eligibility Wizard](https://evisa.rop.gov.om/en/visa-eligibility)
- [Jordan Ministry of Interior：Countries requiring prior approval](https://moi.gov.jo/Ar/Pages/%D8%A7%D9%84%D8%AF%D9%88%D9%84_%D8%A7%D9%84%D8%AC%D9%86%D8%B3%D9%8A%D8%A7%D8%AA_%D8%A7%D9%84%D9%85%D9%82%D9%8A%D8%AF%D8%A9_%D9%88%D8%BA%D9%8A%D8%B1_%D8%A7%D9%84%D9%85%D9%82%D9%8A%D8%AF%D8%A9)
- [Jordan Ministry of Interior：Restricted and Non Restricted Countries (Nationalities)](https://moi.gov.jo/EN/Pages/Restricted_and_Non_Restricted_Countries_Nationalities)
- [Jordan Ministry of Interior：E Applications for Visa and Residence Permits](https://moi.gov.jo/EN/Pages/E_Applications_for_Visa_and_Residence_Permits)
- [Jordan Tourism Board：Visas To Jordan](https://fr.visitjordan.com/page/4/visas-to-jordan/)（官方国籍表：China、Hong Kong、Macau 均可抵达办理签证，费用 40 JOD；页面未列停留期限）
- [Türkiye MFA：Visa Information For Foreigners](https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa)
- [Egypt Electronic Visa Portal：FAQ eligibility list](https://visa2egypt.gov.eg/eVisa/FAQ)（中国列入电子签资格表；旅游电子签 30/65 美元及入境材料；港澳缺席仍不作最终推断）
- [Mexico National Institute of Migration：Countries and regions requiring a visa](https://www.inm.gob.mx/gobmx/word/index.php/paises-requieren-visa-para-mexico/)
- [Consulate General of Mexico in Hong Kong：Mexican Visa Exemptions](https://consulmex.sre.gob.mx/hongkong/index.php/for-foreigners/visa-exemptions)
- [Brazil Ministry of Foreign Affairs：Visa requirements by country](https://www.gov.br/mre/pt-br/embaixada-abu-dhabi/abu-dhabi-arquivos/english/consular-services/visa/visa-requirements-by-country/visa-requirements-by-country-list-of-countries)
- [Consulate General of Brazil in Hong Kong：Tourist Visa](https://www.gov.br/mre/pt-br/consulado-hong-kong/english/consular-services/visas/tourist-visa)
- [Consulate General of Peru in London：Tourism Visas](https://www.consulado.pe/es/londres/tramite/Paginas/Visas/Issuance-of-Tourist-Visa.aspx)
- [Peru Ministry of Foreign Affairs：Requerimientos y exoneración de visas para ciudadanos extranjeros en pasaportes ordinarios](https://www.consulado.pe/Documents/visas/Requerimientos_de_visa_para_ciudadanos_extranjeros.pdf)
- [Colombia Ministry of Foreign Affairs：Entry to Colombia and Courtesy Visa Information](https://www.cancilleria.gov.co/sites/default/files/FOTOS2024/ENTRY%20TO%20COLOMBIA%20AND%20COURTESY%20VISA%20INFORMATION.pdf)
- [Consulate General of Colombia in Hong Kong：30 frequently asked questions regarding visa applications and issuance for foreigners](https://hongkong.consulado.gov.co/sala-de-prensa/noticias/30-preguntas-frecuentes-relativas-la-solicitud-y-expedicion-de-visas-extranjeros-para-colombia)
- [Chile Ministry of Foreign Affairs, Consular Services：Visas para ingresar a Chile](https://serviciosconsulares.cl/tramites/site/tax/port/all/taxport_14___1.html)
- [Argentina National Migration Directorate：Regimen de Visas](https://www.migraciones.gob.ar/accesible/indexdnm.php?visas)（中国普通护照游客标需签证；港澳行无需签证标记，不提供停留期限）
- [Argentina：Resolución 316/2025](https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-316-2025-415345/texto)（同类别有效美国签证的中国普通护照旅游/商务例外，最多 30 天）
- [Argentina DNM：AVE](https://www.migraciones.gob.ar/ave/)（中国持美国签证或 Green Card 的免 AVE 说明；Green Card 不扩展为普遍免领事签证）
- [Hong Kong Immigration Department：HKSAR passport list](https://www.immd.gov.hk/pdf/Visa-free%20Access%20or%20Visa-on-arrival%20for%20HKSAR%20passport%20list_Eng.pdf)（2026-10-16 更新，阿根廷最多 90 天；免签/落地签合并列示）
- [Argentina：Macao mutual visa-waiver announcement](https://www.argentina.gob.ar/noticias/turistas-de-argentina-y-de-la-region-china-de-macao-podran-viajar-sin-visado)（限公告描述的中国籍澳门居民、有效澳门特区护照、旅游/商务 30 天）
- [Macao DSI：Macao SAR passport visa-free/arrival list — Argentina](https://www.dsi.gov.mo/Mobile/visa/visa_all_e.jsp?visa_id=149)（30 天，协议免签计划）
- [Uruguay Ministry of Foreign Affairs, Consulate General in Hong Kong：Visas](https://www.gub.uy/ministerio-relaciones-exteriores/en/consulate-general-of-the-oriental-republic-of-uruguay-in-hong-kong/consular-services/visas)
- [Ecuador Ministry of Foreign Affairs：List of countries requiring a visa to enter Ecuador](https://www.cancilleria.gob.ec/2020/06/30/lista-de-paises-que-deben-presentar-visa-al-ingresar-al-ecuador/)
- [Ecuador Ministry of Foreign Affairs：Ministerial Agreement No. 0000064](https://www.cancilleria.gob.ec/wp-content/uploads/2024/07/0000064.pdf)
- [Macao Government Information Bureau：Macao Yearbook 2025 — Visa treatment table](https://yearbook.gcs.gov.mo/yearbook_pdf/2025/myb2025cAP09.pdf)（Ecuador 对澳门特区护照 90 天免签；澳门旅行证不适用）
- [Embassy of the Republic of Paraguay in Japan：Visa](https://embapar.jp/en/sc/visa/)
- [Embassy of Bolivia in London：Visa Grupos 1-2-3](https://bolivianembassy.co.uk/visa-grupos-1-2-3/)
- [Costa Rica Dirección General de Migración y Extranjería：Visas](https://migracion.go.cr/visas/)
- [Costa Rica Dirección General de Migración y Extranjería / Diario Oficial La Gaceta：Directrices Generales de Visas AJ-484-11-2025](https://www.icoder.go.cr/fileadmin/documentos/tramites/visas/Directrices-Generales-de-Visas-Noviembre-2025-Alcance-148-Gaceta-N_-216-17-11-2025.pdf)

## 核验方法

- 页面可访问只记为 `reachable`；只有条文、证件类型、条件和复核日期齐全才升级为 `verified`。
- 动态问答必须保存实际选择路径。例如英国香港护照旅游路径记录为 `/check-uk-visa/y/hong-kong/no/passport/tourism`。
- “不在电子许可名单”不能被写成“禁止入境”；系统转向明确的签证产品或人工路由。
- 官方 PDF 同时保存法规名称、附件、脚注和 PDF 页码；项目不提交整份临时下载文件。
- IATA Timatic 属许可型数据，不复制其完整数据库。
- 官方入口受阻时允许换用同一政府体系内可核验的替代页面，但保留原入口的 `blocked` 状态。例如美国国务院页面仍受安全验证阻挡，而 CBP/DHS 页面可直接核验；加拿大旧 IRCC 检查器仍受阻，而 Canada.ca 的 IRCC 证件清单可访问。
