# spur-gear-calc

A Node.js + TypeScript CLI for standard, unshifted external involute spur gears,
using ISO / GB/T 1356 basic rack proportions: addendum coefficient 1, dedendum
coefficient 1.25, and a default pressure angle of 20°. Intended for machining
students and CAD freelancers. All lengths are in millimetres. Runtime works
offline and has no third-party dependencies.

## Install and run

Requires Node.js 24 or newer and npm. Development dependencies must be available
from your npm cache or registry for installation; the calculator itself uses no network.

```sh
npm install
npm run build
npm test
npm link
spur-gear --m 2 --z 20
spur-gear --m 2 --z1 20 --z2 45 --json
spur-gear --m 2 --z 20 --alpha 25
spur-gear --modules
```

You can also run `node dist/cli.js` instead of linking the command.
Use `spur-gear --help` for options. Choose either `--z` or both `--z1` and `--z2`.
Module must be finite and positive; tooth counts must be positive safe integers;
pressure angle must be strictly between 0° and 90°. Invalid arguments print a
clear error to stderr and exit with a nonzero status. Duplicate and unknown
options are rejected. Numeric arguments support decimal and scientific notation.

## Output and formulas

| Field | Meaning | Formula |
| --- | --- | --- |
| m | Module | Input |
| z | Teeth | Input |
| alpha | Pressure angle in degrees | Default 20 |
| d | Pitch diameter | m × z |
| ha | Addendum | m |
| hf | Dedendum | 1.25 × m |
| da | Tip diameter | d + 2m |
| df | Root diameter | d − 2.5m |
| db | Base diameter | d × cos(alpha) |
| p | Circular pitch | π × m |
| s | Tooth thickness at pitch circle | p / 2 |

For `--m 2 --z 20`, d = 40, da = 44, df = 35, db ≈ 37.587705,
p ≈ 6.283185. Text output rounds to six decimal places; JSON retains numeric
precision. JSON for a single gear contains the fields above. Pair JSON contains
`m`, `alpha`, `gear1`, `gear2`, `a`, `ratio`, and `contactRatio`.

For a pair, centre distance `a = m(z1 + z2)/2`, and the tooth-count ratio
`ratio = z2/z1`. For a driving gear 1, this is the ideal speed reduction factor;
external gears rotate in opposite directions. With m = 2, z1 = 20, z2 = 45,
a = 65 and ratio = 2.25.

The transverse contact ratio is
`(sqrt(ra1² − rb1²) + sqrt(ra2² − rb2²) − a sin(alpha)) / (π m cos(alpha))`,
where `ra = da/2` and `rb = db/2`. It assumes standard centre distance,
zero profile shift, zero backlash, and ideal involute geometry. It does not
account for undercut, interference, strength, tolerances, or manufacturing
corrections. Values for very small tooth counts are nominal only.

## Standard modules and warnings

Included first-series modules (mm):
1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 25, 32, 40, 50.
Other positive modules are accepted with a warning. At 20°, tooth counts below
17 warn about undercut risk, as a practical screening rule. Changing pressure
angle disables that specific 20° rule; it does not certify freedom from undercut.
Non-positive root diameters and pair contact ratios below 1 also produce warnings.
Warnings always go to stderr, including in JSON mode, and do not change a
successful exit status.

## 中文说明

本工具计算标准无变位外啮合直齿圆柱齿轮的基本几何参数，默认压力角为 20°，
长度单位为毫米。使用 `spur-gear --m 2 --z 20` 计算单个齿轮，使用
`spur-gear --m 2 --z1 20 --z2 45 --json` 输出齿轮副的 JSON 数据。
`--alpha` 可修改压力角。20° 时齿数小于 17 会提示根切风险，非标准模数也会
给出警告。重合度按理想标准中心距计算，不能替代强度校核或实际加工设计。

## License

MIT. See [LICENSE](LICENSE).
