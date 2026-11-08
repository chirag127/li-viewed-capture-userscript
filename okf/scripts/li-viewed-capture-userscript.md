---
type: Script
title: LinkedIn Viewed Capture
description: Captures the who-viewed list before LinkedIn truncates it, paging and deduping into an exportable table.
repo: https://github.com/chirag127/li-viewed-capture-userscript
install: https://github.com/chirag127/li-viewed-capture-userscript/raw/main/li-viewed-capture-userscript.user.js
version: "1.0.0"
tags: [userscript, li]
timestamp: 2026-11-09T00:00:00Z
---

# LinkedIn Viewed Capture

Captures the who-viewed list before LinkedIn truncates it, paging and deduping into an exportable table.

## Method

Scroll loop with idle detection, `a[href*="/in/"]` capture, dedupe by URL, CSV/JSON export.

## Limits

- Free tier only shows a recent slice; older viewers are behind premium
- Virtualised list, so scrolling is required
- Names come from whatever the card renders
