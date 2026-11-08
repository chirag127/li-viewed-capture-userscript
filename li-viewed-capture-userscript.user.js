// ==UserScript==
// @name         LinkedIn Viewed Capture
// @namespace    https://github.com/chirag127
// @version      1.0.0
// @description  Captures your "who viewed your profile" list before LinkedIn truncates it, paging and deduping, then exports CSV or JSON.
// @author       chirag127
// @license      MIT
// @match        https://www.linkedin.com/me/profile-views/*
// @icon         https://www.linkedin.com/favicon.ico
// @homepageURL  https://github.com/chirag127/li-viewed-capture-userscript
// @supportURL   https://github.com/chirag127/li-viewed-capture-userscript/issues
// @downloadURL  https://github.com/chirag127/li-viewed-capture-userscript/raw/main/li-viewed-capture-userscript.user.js
// @updateURL    https://github.com/chirag127/li-viewed-capture-userscript/raw/main/li-viewed-capture-userscript.user.js
// @grant        none
// @noframes
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  /**
   * The list is virtualised and only the newest slice is free. Scrolling is the only way to make
   * the rest exist, so this drives the scroll and reads each card as it appears.
   */
  const rows = [];
  let running = false;
  let stop = false;
  let ui = null;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const typing = () => /input|textarea/i.test(document.activeElement.tagName);

  function capture() {
    const seen = new Set(rows.map((r) => r.url));
    let added = 0;
    for (const a of document.querySelectorAll('a[href*="/in/"]')) {
      const url = a.href.split("?")[0];
      if (seen.has(url)) continue;
      const card = a.closest("li, div");
      const text = (card && card.innerText || "").split("\n").map((s) => s.trim()).filter(Boolean);
      rows.push({ url, name: (a.textContent || text[0] || "").trim(), detail: text.slice(1, 3).join(" · ") });
      added++;
    }
    return added;
  }

  async function run() {
    if (running) return;
    running = true; stop = false;
    let idle = 0, last = 0;
    while (!stop && idle < 6) {
      const added = capture();
      paint();
      scrollBy(0, Math.round(innerHeight * 0.8));
      await sleep(420 + Math.random() * 300);
      if (!added && document.documentElement.scrollHeight === last) idle++; else idle = 0;
      last = document.documentElement.scrollHeight;
    }
    running = false;
    say("captured " + rows.length + " (stop scrolling to review)");
  }

  function csv() {
    const esc = (v) => '"' + String(v).replace(/"/g, '""') + '"';
    return ["name,detail,url", ...rows.map((r) => [esc(r.name), esc(r.detail), esc(r.url)].join(","))].join("\n");
  }
  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; a.click(); URL.revokeObjectURL(a.href);
  }

  function el(tag, css, text) {
    const n = document.createElement(tag);
    if (css) Object.assign(n.style, css);
    if (text != null) n.textContent = text;
    return n;
  }
  function say(m) { if (ui) ui.status.textContent = m; }
  function paint() {
    if (!ui) return;
    ui.count.textContent = rows.length + " viewer(s)";
    ui.body.textContent = "";
    for (const r of rows.slice(-250).reverse()) ui.body.appendChild(el("div", { padding: "3px 6px", borderBottom: "1px solid #262626", color: "#ddd" }, r.name + " — " + r.detail));
  }

  function panel() {
    if (ui) { ui.root.remove(); ui = null; return; }
    const root = el("div", { position: "fixed", right: "18px", bottom: "18px", width: "380px", height: "56vh", zIndex: 2147483647, background: "#181818", color: "#fff", font: "12px Roboto, Arial", border: "1px solid #3a3a3a", borderRadius: "10px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 28px rgba(0,0,0,.65)" });
    const head = el("div", { padding: "8px", background: "#242424", display: "flex", gap: "6px", alignItems: "center", cursor: "move" });
    const count = el("strong", { flex: "1" }, "0 viewer(s)");
    const btn = (l, fn, bg) => { const b = el("button", { background: bg || "#333", color: "#fff", border: "0", borderRadius: "5px", padding: "3px 7px", cursor: "pointer" }, l); b.onclick = fn; return b; };
    head.append(count, btn("Capture", run, "#065fd4"), btn("Stop", () => (stop = true)), btn("×", panel));
    const body = el("div", { overflow: "auto", flex: "1" });
    const foot = el("div", { padding: "6px", display: "flex", gap: "6px", borderTop: "1px solid #333" });
    foot.append(btn("CSV", () => download("profile-views.csv", csv(), "text/csv")), btn("JSON", () => download("profile-views.json", JSON.stringify(rows, null, 2), "application/json")), btn("Copy", () => navigator.clipboard.writeText(rows.map((r) => r.url).join("\n"))));
    const status = el("div", { padding: "0 8px 6px", color: "#9aa" }, "free tier shows a recent slice only");
    root.append(head, body, foot, status);
    document.body.appendChild(root);
    ui = { root, count, body, status };
    let dx = 0, dy = 0, drag = false;
    head.addEventListener("pointerdown", (e) => { if (e.target.tagName === "BUTTON") return; drag = true; dx = e.clientX; dy = e.clientY; head.setPointerCapture(e.pointerId); });
    head.addEventListener("pointermove", (e) => {
      if (!drag) return;
      root.style.right = "auto"; root.style.bottom = "auto";
      root.style.left = Math.max(0, root.offsetLeft + e.clientX - dx) + "px";
      root.style.top = Math.max(0, root.offsetTop + e.clientY - dy) + "px";
      dx = e.clientX; dy = e.clientY;
    });
    head.addEventListener("pointerup", () => (drag = false));
    paint();
  }

  addEventListener("keydown", (e) => { if (e.altKey && e.key.toLowerCase() === "v" && !typing()) panel(); });
  const chip = el("button", { position: "fixed", right: "18px", bottom: "18px", zIndex: 2147483646, background: "#065fd4", color: "#fff", border: "0", borderRadius: "18px", padding: "6px 12px", cursor: "pointer", font: "12px Roboto, Arial" }, "👁");
  chip.title = "Capture profile viewers (Alt+V)";
  chip.onclick = panel;
  document.body.appendChild(chip);
})();
