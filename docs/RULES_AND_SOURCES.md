# 规则与来源台账

核验日期：2026-09-08。规则超过 30 天未复核时，界面自动显示过期提示。

## 受控规则

| 场景 | 输出边界 | 官方依据 |
|---|---|---|
| 香港特区护照前往日本短期旅游 | 进入免签分支，通常 90 天；仍需临行核对 Note 5 | 日本外务省短期免签页 |
| 澳门特区护照前往日本短期旅游 | 进入免签分支，通常 90 天；仍需临行核对 Note 6 | 日本外务省短期免签页 |
| 中国普通护照前往日本旅游 | 不继承港澳证件待遇，输出 ACTION | 日本外务省短期免签页 |
| 香港居民从香港进入中国内地 | 检查香港身份证与回乡证是否均已确认 | 香港入境事务处旅行证件 FAQ |
| 澳门居民从澳门进入中国内地 | 检查澳门身份证与通行证；证件齐全仍保留口岸级 REVIEW | 澳门政府 PS-1474 |
| 抵达英国 | 不复制复杂实时规则，路由到 GOV.UK 官方问答 | GOV.UK visa checker |
| 其他目的地/证件组合 | 输出 REVIEW，不猜测 | IATA Travel Centre / 目的地官方工具 |

## 官方来源

- [IATA Travel Centre / Timatic](https://www.iata.org/en/services/compliance/timatic/travel-documentation/)
- [日本外务省：短期停留免签安排](https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html)
- [香港入境事务处：香港旅行证件常见问题](https://www.immd.gov.hk/eng/faq/hk-travel-doc.html)
- [澳门特别行政区政府：居民自助过关服务](https://www.gov.mo/en/services/ps-1474/)
- [GOV.UK：Check if you need a UK visa](https://www.gov.uk/check-uk-visa)

## 为什么不把所有国家规则写死

旅行证件规则变化快，而且同一“香港人”可能实际使用香港特区护照、BNO、外国护照或其他证件。可靠系统的关键不是回答得多，而是知道哪条规则已经被证明、何时应该停止推断并把用户送到官方来源。
