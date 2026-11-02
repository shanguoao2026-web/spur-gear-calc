# Task: spur-gear-calc (Node.js + TypeScript CLI, no network)
Goal: standard involute spur gear geometry calculator (ISO / GB/T 1356, 20° pressure angle) for machining students and CAD freelancers.
- Command: `spur-gear --m 2 --z 20` prints module m, teeth z, pitch diameter d=m·z, addendum ha=m, dedendum hf=1.25m, tip diameter da=d+2m, root diameter df=d−2.5m, base diameter db=d·cos20°, circular pitch p=π·m, tooth thickness s=p/2. `spur-gear --m 2 --z1 20 --z2 45` adds pair data: centre distance a=m(z1+z2)/2, gear ratio, contact ratio. `--alpha` overrides pressure angle; `--json` output. Warn when z < 17 (undercut risk at 20°).
- Validate inputs with clear errors and non-zero exit. Include a list of standard first-series modules and warn on non-standard m.
- Unit tests: m=2,z=20 → d=40, da=44, df=35, db≈37.588, p≈6.283; pair z1=20,z2=45 → a=65, ratio 2.25. `npm test` must pass.
- README in English plus short Chinese section, MIT LICENSE, .gitignore with node_modules, dist, *.log. No personal data or local absolute paths.
