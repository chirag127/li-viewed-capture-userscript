# AGENTS.md - li-viewed-capture-userscript

Single-file userscript. $(System.Collections.Hashtable.n).user.js at repo root IS the product. No build, no deps.

## Method

Scroll loop with idle detection, `a[href*="/in/"]` capture, dedupe by URL, CSV/JSON export.

## Rules

- One file. Bump @version, keep @updateURL/@downloadURL on raw main.
- API first, DOM fallback. Dry run, then one confirm, then run.
- 3 concurrent workers with 150-400 ms jitter. Floating panel, Alt hotkey, never fire while typing.

## Install docs

https://github.com/chirag127/userscript-install-guide - link it, never duplicate install steps.

## Test

sctl install ./li-viewed-capture-userscript.user.js, open the target page, run the dry run, then sctl debug console --level error.
