// Smoke test tự động qua Chrome DevTools Protocol — KHÔNG cần cài package nào.
//
// Vì sao không dùng jsdom/Playwright: jsdom không có WebGL nên vô dụng với
// MapLibre; Playwright kéo về ~300 MB browser. CDP dùng Chrome có sẵn trên máy +
// WebSocket built-in của Node, chi phí 0.
//
// Chạy:  node --experimental-websocket scripts/smoke.mjs
//        node --experimental-websocket scripts/smoke.mjs --keep   (không tắt Chrome)
// (chưa thêm vào package.json vì file đó ngoài phạm vi đợt sửa này — xem
//  scratchpad/package-json-smoke-script.diff để gắn `npm run smoke`.)
//
// Node 20 BẮT BUỘC cờ --experimental-websocket (repo đang ghim Node 20 ở .nvmrc);
// Node >= 22 có WebSocket ổn định nên bỏ được cờ.
//
// Script tự dựng vite dev server ở cổng riêng 5188 rồi tự tắt. Dùng DEV server
// (không phải `vite preview`) vì hook `window.__map` chỉ bật khi import.meta.env.DEV.
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 5188; // cổng riêng: 5173 là vite mặc định, 5199 do agent khác dùng
const ORIGIN = `http://127.0.0.1:${PORT}/`;
const CDP_PORT = 9333;
const KEEP = process.argv.includes("--keep");
const CHROME =
  process.env.CHROME_PATH ??
  [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ].find((p) => {
    try {
      readFileSync(p, { flag: "r" });
      return true;
    } catch {
      return false;
    }
  });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const record = (id, ten, ok, chi_tiet) => {
  results.push({ id, ten, ok, chi_tiet });
  const tag = ok === true ? "✅ ĐẠT " : ok === false ? "❌ HỎNG" : "⚠️ BỎ QUA";
  console.log(`${tag} ${id} · ${ten}`);
  for (const line of String(chi_tiet).split("\n")) console.log(`        ${line}`);
};

// ── Ngân hàng thẻ quiz: chép lại đúng logic buildCards() của src/quiz.ts ──────
// Cần để S4 gieo sẵn localStorage rồi kiểm thẻ "đến hạn" có được ưu tiên không.
function quizBank() {
  const gj = JSON.parse(
    readFileSync(path.join(ROOT, "public/data/boundaries/vn-34-tinh-2025.geojson"), "utf8"),
  );
  const provinces = gj.features.map((f) => f.properties).filter((p) => !p["loai"]);
  const cards = [];
  for (const p of provinces) {
    if (p["Tỉnh thành cũ"] && p["Tỉnh thành cũ"] !== p["Tỉnh thành mới"]) {
      cards.push({
        id: `hopthanh:${p["Tỉnh thành mới"]}`,
        q: `Từ 1/7/2025, «${p["Tỉnh thành mới"]}» hợp thành từ những tỉnh/thành nào?`,
      });
      for (const old of p["Tỉnh thành cũ"].split(",").map((s) => s.trim()))
        if (old !== p["Tỉnh thành mới"])
          cards.push({
            id: `sapnhap:${old}`,
            q: `Tỉnh «${old}» thuộc tỉnh/thành nào sau sắp xếp 1/7/2025?`,
          });
    }
  }
  for (const p of provinces)
    cards.push({
      id: `tthc:${p["Tỉnh thành mới"]}`,
      q: `Trung tâm hành chính của «${p["Tỉnh thành mới"]}» đặt tại đâu?`,
    });
  return cards;
}

// ── Kịch bản chèn trước khi trang chạy ───────────────────────────────────────
// Đếm WebGL context được tạo + bắt sự kiện mất context. Đây là cách đo rò
// context mà không cần API nội bộ của trình duyệt.
const GL_PROBE = `(() => {
  window.__gl = { created: 0, lost: 0, lostTuNguyen: 0, restored: 0 };
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const ctx = orig.call(this, type, ...rest);
    if (ctx && /webgl/i.test(String(type))) {
      window.__gl.created++;
      if (!this.__glWatched) {
        this.__glWatched = true;
        this.addEventListener("webglcontextlost", () => {
          // Phân biệt mất context DO TA CHỦ ĐỘNG gọi loseContext() với mất do
          // Chrome tự thu hồi khi chạm trần — chỉ loại sau mới là rò rỉ.
          if (this.__tuNguyen) window.__gl.lostTuNguyen++;
          else window.__gl.lost++;
        });
        this.addEventListener("webglcontextrestored", () => { window.__gl.restored++; });
      }
    }
    return ctx;
  };
})();`;

// Ghim ngày hệ thống để chọn đúng câu đố cần kiểm (game.ts dùng new Date()).
const fakeDate = (iso) => `(() => {
  const FIXED = new Date("${iso}T09:00:00+07:00").getTime();
  const _D = Date;
  class D extends _D {
    constructor(...a) { if (a.length === 0) super(FIXED); else super(...a); }
    static now() { return FIXED; }
  }
  window.Date = D;
})();`;

// ── Máy CDP ──────────────────────────────────────────────────────────────────
class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.consoleMsgs = [];
    this.netFail = [];
    this.netBytes = [];
    this.reqUrl = new Map();
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) {
        this.pending.get(m.id)(m);
        this.pending.delete(m.id);
        return;
      }
      if (m.method === "Log.entryAdded" && ["error", "warning"].includes(m.params.entry.level))
        this.consoleMsgs.push(`[${m.params.entry.level}] ${m.params.entry.text}`);
      if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type))
        this.consoleMsgs.push(
          `[console.${m.params.type}] ${m.params.args.map((a) => a.description ?? a.value).join(" ")}`,
        );
      if (m.method === "Runtime.exceptionThrown")
        this.consoleMsgs.push(`[uncaught] ${m.params.exceptionDetails.text} ${m.params.exceptionDetails.exception?.description ?? ""}`);
      if (m.method === "Network.responseReceived" && m.params.response.status >= 400)
        this.netFail.push(`${m.params.response.status} ${m.params.response.url}`);
      if (m.method === "Network.loadingFailed")
        this.netFail.push(`FAILED ${m.params.errorText} ${m.params.requestId}`);
      // Gom byte theo URL để đo lượng dữ liệu tải lúc khởi động (S7).
      // responseReceived cho URL, loadingFinished mới cho số byte thật —
      // phải ghép hai sự kiện qua requestId.
      if (m.method === "Network.responseReceived")
        this.reqUrl.set(m.params.requestId, m.params.response.url);
      if (m.method === "Network.loadingFinished")
        this.netBytes.push({
          url: this.reqUrl.get(m.params.requestId) ?? "?",
          bytes: m.params.encodedDataLength ?? 0,
        });
    };
  }
  send(method, params = {}) {
    const mid = ++this.id;
    this.ws.send(JSON.stringify({ id: mid, method, params }));
    return new Promise((res) => this.pending.set(mid, res));
  }
  /** Chạy JS trong trang; ném lỗi nếu trang ném — không nuốt lỗi thành xanh giả. */
  async evaluate(expression) {
    const r = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    const ex = r.result?.exceptionDetails;
    if (ex) throw new Error(`lỗi trong trang: ${ex.text} ${ex.exception?.description ?? ""}`);
    return r.result?.result?.value;
  }
  reset() {
    this.consoleMsgs = [];
    this.netFail = [];
    // KHÔNG xoá netBytes/reqUrl — S7 đo lượt tải ĐẦU TIÊN, chạy sau các lượt
    // reset khác nên phải giữ tích luỹ từ lúc mở trang.
  }
}

async function waitPort(url, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url);
      if (r.ok) return true;
    } catch {
      /* server chưa lên */
    }
    await sleep(400);
  }
  return false;
}

async function firstPage() {
  for (let i = 0; i < 80; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
      const p = j.filter((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (p.length) return p[0];
    } catch {
      /* chrome chưa sẵn sàng */
    }
    await sleep(500);
  }
  throw new Error("không kết nối được CDP");
}

// ── Các kịch bản ─────────────────────────────────────────────────────────────

/** S1 — tải trang sạch: không lỗi console, không HTTP >= 400, không 404 glyph. */
async function s1(cdp) {
  const hasCanvas = await cdp.evaluate(`!!document.querySelector("#map canvas")`);
  // favicon.ico thuộc index.html (ngoài phạm vi đợt sửa này) và không ảnh hưởng
  // chức năng — bỏ qua để smoke không đỏ vĩnh viễn vì một thứ vô hại.
  const NHIEU = /favicon\.ico/;
  const netFail = cdp.netFail.filter((s) => !NHIEU.test(s));
  const consoleMsgs = cdp.consoleMsgs.filter((s) => !NHIEU.test(s) && !/status of 404/.test(s));
  const fontFails = netFail.filter((s) => /\/font\//.test(s));
  const ok = hasCanvas && consoleMsgs.length === 0 && netFail.length === 0;
  cdp.consoleMsgs = consoleMsgs;
  cdp.netFail = netFail;
  record(
    "S1",
    "Tải trang sạch (console · HTTP · glyph)",
    ok,
    [
      `canvas bản đồ: ${hasCanvas ? "có" : "KHÔNG CÓ"}`,
      `console error/warning: ${cdp.consoleMsgs.length}`,
      ...cdp.consoleMsgs.slice(0, 8).map((s) => "  " + s),
      `HTTP >= 400: ${cdp.netFail.length}`,
      ...[...new Set(cdp.netFail)].slice(0, 8).map((s) => "  " + s),
      `404 fontstack (/font/): ${fontFails.length}${fontFails.length ? " ← LỖI DỮ KIỆN (a)" : ""}`,
    ].join("\n"),
  );
}

/** S2 — rò WebGL context khi chuyển qua lại panel có mô hình 3D. */
async function s2(cdp, cycles = 20) {
  const before = await cdp.evaluate(`JSON.stringify(window.__gl)`);
  await cdp.evaluate(`(async () => {
    const j = document.getElementById("journey-btn");
    const b = document.getElementById("battle-btn");
    if (!j || !b) throw new Error("thiếu journey-btn hoặc battle-btn");
    for (let i = 0; i < ${cycles}; i++) {
      j.click(); await new Promise(r => setTimeout(r, 420));
      b.click(); await new Promise(r => setTimeout(r, 180));
    }
  })()`);
  await cdp.send("HeapProfiler.collectGarbage");
  await sleep(600);
  const after = JSON.parse(await cdp.evaluate(`JSON.stringify(window.__gl)`));
  const tooMany = cdp.consoleMsgs.filter((s) => /too many active webgl/i.test(s));
  // Tiêu chí cũ `after.lost === 0` SAI kể từ khi vá bằng forceContextLoss():
  // nhả context là hành vi ĐÚNG, nên nó làm `lost` tăng và kịch bản báo đỏ giả.
  // Phải tách như chính S2b đã tách: chỉ mất context NGOÀI Ý MUỐN mới là lỗi.
  const truoc = JSON.parse(before);
  const tuNguyen = after.lostTuNguyen - truoc.lostTuNguyen;
  const biThuHoi = after.lost - truoc.lost - tuNguyen;
  const ok = biThuHoi <= 0 && tooMany.length === 0;
  record(
    "S2",
    `Rò WebGL context sau ${cycles} lượt Hành trình↔Sa đồ`,
    ok,
    [
      `trước: ${before}`,
      `sau  : created=${after.created} lost=${after.lost} restored=${after.restored}`,
      `context TỰ NGUYỆN nhả: ${tuNguyen} (forceContextLoss — càng nhiều càng tốt)`,
      `context bị Chrome THU HỒI ngoài ý muốn: ${biThuHoi} (đây mới là rò)`,
      `cảnh báo "Too many active WebGL contexts": ${tooMany.length}`,
      `→ created tăng ${after.created - truoc.created} sau ${cycles} lượt`,
    ].join("\n"),
  );
  return after;
}

/**
 * S2b — thí nghiệm cơ chế: BỎ THAM CHIẾU một WebGL context có đủ để trình duyệt
 * thu hồi nó không? Trả lời câu hỏi «dispose-on-hide đã đủ chưa», tách khỏi mọi
 * chi tiết của three.js.
 *
 * @param tuNguyen true = gọi WEBGL_lose_context.loseContext() sau khi tạo
 *                 (đúng việc mà renderer.forceContextLoss() làm bên trong).
 */
async function s2b(cdp, tuNguyen) {
  const out = await cdp.evaluate(`(async () => {
    const truoc = { ...window.__gl };
    for (let i = 0; i < 24; i++) {
      const c = document.createElement("canvas");
      c.width = c.height = 32;
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (${tuNguyen} && gl) { c.__tuNguyen = true; gl.getExtension("WEBGL_lose_context")?.loseContext(); }
      // không giữ tham chiếu nào tới c/gl — mô phỏng đúng renderer.dispose()
    }
    await new Promise(r => setTimeout(r, 1500));
    const sau = { ...window.__gl };
    const canvas = document.createElement("canvas");
    const probe = canvas.getContext("webgl2") || canvas.getContext("webgl");
    return { truoc, sau, contextMoiHopLe: !!probe && !probe.isContextLost() };
  })()`);
  await cdp.send("HeapProfiler.collectGarbage");
  const batBuoc = out.sau.lost - out.truoc.lost;
  const ok = batBuoc === 0;
  record(
    tuNguyen ? "S2b-2" : "S2b-1",
    tuNguyen
      ? "Cơ chế: tạo 24 context CÓ gọi loseContext()"
      : "Cơ chế: tạo 24 context rồi chỉ BỎ THAM CHIẾU",
    ok,
    [
      `context bị Chrome thu hồi ngoài ý muốn: ${batBuoc}`,
      `context tự nguyện nhả: ${out.sau.lostTuNguyen - out.truoc.lostTuNguyen}`,
      `xin context mới sau đó: ${out.contextMoiHopLe ? "hợp lệ" : "HỎNG"}`,
      tuNguyen
        ? "→ nhả tường minh thì không ai bị thu hồi oan"
        : "→ nếu số này > 0: bỏ tham chiếu KHÔNG đủ, phải nhả context tường minh",
    ].join("\n"),
  );
}

/** S3 — mở lần lượt mọi panel: luôn chỉ đúng 1 panel hiện. */
async function s3(cdp) {
  const out = await cdp.evaluate(`(async () => {
    const PANELS = ["province-panel","library-panel","game-panel","quiz-panel","story-panel",
      "namtien-panel","olympia-panel","battle-panel","journey-panel","quocgia-panel","timeline-panel"];
    const BTNS = ["library-btn","game-btn","quiz-btn","story-btn","olympia-btn","battle-btn",
      "journey-btn","quocgia-btn","timeline-btn","namtien-btn"];
    const visible = () => PANELS.filter(id => { const e = document.getElementById(id); return e && !e.hidden; });
    const rows = [];
    for (const b of BTNS) {
      const el = document.getElementById(b);
      if (!el) { rows.push([b, "THIẾU NÚT", []]); continue; }
      el.click();
      await new Promise(r => setTimeout(r, 350));
      rows.push([b, visible().length, visible()]);
    }
    // dọn: đóng hết
    for (const id of PANELS) { const e = document.getElementById(id); if (e) e.hidden = true; }
    document.body.classList.remove("kid-mode");
    return rows;
  })()`);
  const bad = out.filter((r) => typeof r[1] === "number" && r[1] > 1);
  record(
    "S3a",
    "Mở panel tuần tự: luôn chỉ 1 panel hiện",
    bad.length === 0,
    out.map((r) => `${String(r[0]).padEnd(14)} → ${r[1]} panel hiện ${r[1] > 1 ? "❌ " + r[2].join(", ") : ""}`).join("\n"),
  );
}

/**
 * S3b — «panel mồ côi»: namtien-panel là panel KHÔNG module nào ẩn hộ. Mở nó
 * trước rồi bấm từng nút để xem nút nào thật sự dọn sạch màn hình. Kịch bản
 * tuần tự (S3a) không lộ được điều này vì nó chỉ kiểm cặp liền kề.
 */
async function s3b(cdp) {
  const out = await cdp.evaluate(`(async () => {
    const BTNS = ["library-btn","game-btn","quiz-btn","story-btn","olympia-btn","battle-btn",
      "journey-btn","quocgia-btn","timeline-btn"];
    const nt = document.getElementById("namtien-btn");
    const rows = [];
    for (const b of BTNS) {
      const el = document.getElementById(b);
      const panel = document.getElementById("namtien-panel");
      if (!el || !nt || !panel) { rows.push([b, "THIẾU"]); continue; }
      if (panel.hidden) { nt.click(); await new Promise(r => setTimeout(r, 250)); }
      el.click();
      await new Promise(r => setTimeout(r, 320));
      rows.push([b, panel.hidden ? "ẩn ✔" : "CÒN HIỆN ✘"]);
    }
    for (const id of ["namtien-panel"]) { const e = document.getElementById(id); if (e) e.hidden = true; }
    return rows;
  })()`);
  const bad = out.filter((r) => r[1] !== "ẩn ✔");
  record(
    "S3b",
    "Nút nào ẩn được «panel mồ côi» namtien-panel",
    bad.length === 0,
    [
      ...out.map((r) => `${String(r[0]).padEnd(14)} → namtien-panel ${r[1]}`),
      `${bad.length} nút chưa dọn (nằm ngoài 5 file được sửa đợt này: library/story/olympia/battle do main + sec-audit giữ)`,
    ].join("\n"),
  );
}

/** S4 — SM-2: thẻ ĐẾN HẠN phải được ưu tiên vào phiên ôn, không bị trộn lẫn. */
async function s4(cdp) {
  const bank = quizBank();
  const due = bank.slice(0, 3);
  const dueIds = due.map((c) => c.id);
  const reviews = {};
  const far = "2099-01-01";
  const today = new Date().toISOString().slice(0, 10);
  for (const c of bank) reviews[c.id] = { ef: 2.5, reps: 1, interval: 1, due: far };
  for (const c of due) reviews[c.id].due = today;
  // để CÒN thẻ unseen thì phải bỏ review của một phần thẻ — nếu mọi thẻ đều có
  // review thì `unseen` rỗng và bài kiểm không phân biệt được trước/sau khi sửa.
  for (const c of bank.slice(3, 60)) delete reviews[c.id];

  const seen = await cdp.evaluate(`(async () => {
    localStorage.setItem("quiz_reviews", ${JSON.stringify(JSON.stringify(reviews))});
    localStorage.removeItem("quiz_metric");
    document.getElementById("quiz-btn").click();
    await new Promise(r => setTimeout(r, 900));
    const start = document.getElementById("quiz-start");
    if (!start) throw new Error("không thấy nút 'Bắt đầu phiên mới'");
    start.click();
    await new Promise(r => setTimeout(r, 250));
    const qs = [];
    for (let i = 0; i < 3; i++) {
      const q = document.querySelector(".quiz-question");
      if (!q) break;
      qs.push(q.textContent.trim());
      document.querySelector(".quiz-option")?.click();
      await new Promise(r => setTimeout(r, 120));
      document.getElementById("quiz-next")?.click();
      await new Promise(r => setTimeout(r, 150));
    }
    document.getElementById("quiz-panel").hidden = true;
    return qs;
  })()`);
  const expected = due.map((c) => c.q);
  const hit = seen.filter((q) => expected.includes(q)).length;
  record(
    "S4",
    "Thẻ đến hạn được ưu tiên (SM-2)",
    hit === 3,
    [
      `3 thẻ gieo sẵn ĐẾN HẠN hôm nay: ${dueIds.join(" · ")}`,
      `ngân hàng: ${bank.length} thẻ, trong đó ${Object.keys(reviews).length} đã có lịch ôn`,
      `3 câu đầu phiên trúng thẻ đến hạn: ${hit}/3`,
      ...seen.map((q, i) => `  ${i + 1}. ${expected.includes(q) ? "✔ due" : "✘ KHÔNG phải due"} — ${q.slice(0, 72)}`),
    ].join("\n"),
  );
}

/** S5 — hình bóng câu đố không bị quần đảo xa kéo giãn khung. */
async function s5(cdp, tinh, mongDoi) {
  const out = await cdp.evaluate(`(async () => {
    document.getElementById("game-btn").click();
    await new Promise(r => setTimeout(r, 1500));
    const svg = document.querySelector(".dtx-silhouette");
    if (!svg) throw new Error("không thấy .dtx-silhouette");
    const vb = svg.getAttribute("viewBox").split(/\\s+/).map(Number);
    const h2 = document.querySelector("#game-content h2");
    return { viewBox: vb, tieu_de: h2 ? h2.textContent.trim() : "" };
  })()`);
  const [, , w, h] = out.viewBox;
  const huong = w > h ? "ngang" : "dọc";
  const ok = huong === mongDoi;
  record(
    "S5",
    `Hình bóng «${tinh}» không bị quần đảo kéo giãn`,
    ok,
    [
      `viewBox đo được: ${w}×${h} → khung ${huong} (mong đợi: ${mongDoi})`,
      `tỉ lệ w/h = ${(w / h).toFixed(2)}`,
      `${tinh}: đất liền 108,55–109,44° lon nhưng cả tỉnh tới 116,94° (Trường Sa)`,
      `khung "ngang" 220×155 = đang scale theo 8,39° → hình đất liền teo còn ~19% bề ngang`,
    ].join("\n"),
  );
}

/**
 * S7 — byte dữ liệu `/data/` tải ở lượt mở trang đầu, ĐO TRÊN LUỒNG CHÍNH.
 *
 * ⚠️ GIỚI HẠN PHẢI BIẾT: MapLibre nạp GeoJSON của `addSource` bên trong WEB
 * WORKER, mà miền `Network` của CDP gắn vào page target KHÔNG bắt request của
 * worker. Nên con số này KHÔNG bao gồm 3 file ranh giới tỉnh. Muốn đo cả worker
 * phải `Target.setAutoAttach({flatten:true})` rồi bật Network trên từng session
 * con — chưa làm.
 *
 * Vì vậy S7 chỉ chứng minh được ĐÚNG MỘT điều, và đó là điều nó được dựng ra để
 * chứng minh: `initNamTien()` trước đây gọi `fetch()` THẲNG trên luồng chính để
 * lấy bản sao thứ hai của `vn-34-tinh-2025.geojson` (1,16 MB) cho một tính năng
 * nằm sau nút bấm. Nếu file đó còn xuất hiện trong danh sách dưới đây thì việc
 * nạp lười đã hỏng.
 */
async function s7(cdp) {
  // Source GeoJSON của MapLibre về SAU sự kiện map "load" — chờ trang lắng,
  // nếu không sẽ đo hụt và báo xanh giả.
  await new Promise((r) => setTimeout(r, 3000));
  const geo = cdp.netBytes.filter((r) => /\/data\/.*\.(geojson|json)(\?|$)/.test(r.url));
  const tong = geo.reduce((s, r) => s + r.bytes, 0);
  const NGUONG = 1_400_000;
  record(
    "S7",
    "Nam tiến KHÔNG fetch lại 1,16 MB ranh giới lúc khởi động",
    tong > 0 && tong < NGUONG && !geo.some((r) => /vn-34-tinh-2025\.geojson/.test(r.url)),
    [
      `luồng chính tải ${(tong / 1e6).toFixed(2)} MB qua ${geo.length} request · ngưỡng ${(NGUONG / 1e6).toFixed(2)} MB`,
      `KHÔNG đo được 3 file ranh giới (MapLibre nạp trong web worker, CDP page target không thấy)`,
      ...geo.map((r) => `  ${(r.bytes / 1024).toFixed(0)} KB  ${r.url.replace(/^https?:\/\/[^/]+/, "")}`),
      tong === 0
        ? `  ⚠️ không thấy .geojson — tổng bắt được ${cdp.netBytes.length} request; 5 URL đầu: ${cdp.netBytes.slice(0, 5).map((r) => r.url.slice(-60)).join(" | ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

/** S6 — hook window.__map (main.ts thêm, chỉ bật ở DEV). Thiếu thì BÁO ĐỎ. */
async function s6(cdp) {
  const has = await cdp.evaluate(`typeof window.__map === "object" && window.__map !== null`);
  if (!has) {
    record(
      "S6",
      "Hook window.__map + lớp bản đồ render thật",
      false,
      [
        "window.__map KHÔNG TỒN TẠI → không thể kiểm lớp bản đồ có vẽ ra thật hay không.",
        "Cần main.ts thêm đúng 1 dòng sau khi khởi tạo map:",
        '  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__map = map;',
        "KHÔNG coi đây là ĐẠT — S6 tính là HỎNG cho tới khi có hook.",
      ].join("\n"),
    );
    return;
  }
  const out = await cdp.evaluate(`(async () => {
    const m = window.__map;
    if (!m.loaded()) await new Promise(r => m.once("idle", r));
    const ids = ["song-lines","song-labels","nui-markers","nui-labels","chu-quyen-labels"];
    return ids.map(i => {
      const l = m.getLayer(i);
      return { id: i, ton_tai: !!l, rendered: l ? m.queryRenderedFeatures({ layers: [i] }).length : 0 };
    });
  })()`);
  const missing = out.filter((l) => !l.ton_tai);
  record(
    "S6",
    "Hook window.__map + lớp bản đồ render thật",
    missing.length === 0,
    out.map((l) => `${l.id.padEnd(18)} tồn tại=${l.ton_tai} rendered=${l.rendered}`).join("\n"),
  );
}

// ── Điều phối ────────────────────────────────────────────────────────────────
async function main() {
  if (!CHROME) {
    console.error("❌ Không tìm thấy chrome.exe. Đặt biến môi trường CHROME_PATH.");
    process.exit(2);
  }
  console.log(`▶ dựng vite dev server ở cổng ${PORT}…`);
  // --host 127.0.0.1 là BẮT BUỘC: mặc định vite bind "localhost", trên Windows
  // phân giải thành ::1 (IPv6) nên fetch tới 127.0.0.1 sẽ không bao giờ tới.
  const server = spawn(
    process.execPath,
    [
      path.join(ROOT, "node_modules/vite/bin/vite.js"),
      "--host",
      "127.0.0.1",
      "--port",
      String(PORT),
      "--strictPort",
    ],
    { cwd: ROOT, stdio: "ignore" },
  );
  const profile = mkdtempSync(path.join(os.tmpdir(), "vnenc-smoke-"));
  let chrome = null;
  let exitCode = 0;
  try {
    if (!(await waitPort(ORIGIN))) throw new Error(`vite không lên ở ${ORIGIN}`);
    console.log(`▶ mở Chrome headless (swiftshader — có WebGL thật, chạy được trên CI không GPU)…`);
    chrome = spawn(
      CHROME,
      [
        "--headless=new",
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${profile}`,
        "--no-first-run",
        "--no-default-browser-check",
        "--enable-unsafe-swiftshader",
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--window-size=1280,900",
        "--hide-scrollbars",
        "about:blank",
      ],
      { stdio: "ignore" },
    );

    const page = await firstPage();
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });
    const cdp = new Cdp(ws);
    await cdp.send("Runtime.enable");
    await cdp.send("Log.enable");
    await cdp.send("Network.enable");
    await cdp.send("Page.enable");
    await cdp.send("HeapProfiler.enable");

    // ── Lượt tải A: ngày thật ──
    const glScript = await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: GL_PROBE });
    cdp.reset();
    await cdp.send("Page.navigate", { url: ORIGIN });
    await sleep(7000);

    console.log("\n──────── LƯỢT A (ngày thật) ────────");
    await s1(cdp);
    await s7(cdp);
    await s6(cdp);
    await s3(cdp);
    await s3b(cdp);
    await s4(cdp);
    await s2(cdp);

    // ── Lượt tải B: ghim ngày 2026-01-20 → câu đố rơi vào Khánh Hòa ──
    // (tính sẵn: FNV-1a("2026-01-20") % 34 = chỉ số của Khánh Hòa trong lớp 34 tỉnh)
    const dateScript = await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
      source: fakeDate("2026-01-20"),
    });
    cdp.reset();
    await cdp.send("Page.navigate", { url: ORIGIN });
    await sleep(6000);
    console.log("\n──────── LƯỢT B (ghim ngày 2026-01-20 → Khánh Hòa) ────────");
    await s5(cdp, "Khánh Hòa", "dọc");
    await cdp.send("Page.removeScriptToEvaluateOnNewDocument", {
      identifier: dateScript.result.identifier,
    });
    void glScript;

    // ── Lượt C & D: thí nghiệm cơ chế thu hồi WebGL context, mỗi phép đo một
    // trang sạch để hai phép không nhiễu nhau.
    console.log("\n──────── LƯỢT C/D (thí nghiệm cơ chế WebGL context) ────────");
    for (const tuNguyen of [false, true]) {
      cdp.reset();
      await cdp.send("Page.navigate", { url: "about:blank" });
      await sleep(400);
      await cdp.send("Page.navigate", { url: ORIGIN });
      await sleep(5000);
      await s2b(cdp, tuNguyen);
    }

    const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
    if (shot.result?.data) {
      const out = path.join(os.tmpdir(), "vnenc-smoke.png");
      writeFileSync(out, Buffer.from(shot.result.data, "base64"));
      console.log(`\nảnh chụp: ${out}`);
    }
    ws.close();
  } catch (e) {
    record("FATAL", "Smoke test không chạy được", false, String(e?.stack ?? e));
  } finally {
    if (chrome && !KEEP) chrome.kill();
    server.kill();
  }

  const hong = results.filter((r) => r.ok === false);
  console.log("\n════════ TỔNG KẾT ════════");
  console.log(`${results.filter((r) => r.ok === true).length} đạt · ${hong.length} hỏng · ${results.length} kịch bản`);
  for (const r of hong) console.log(`  ❌ ${r.id} ${r.ten}`);
  exitCode = hong.length ? 1 : 0;
  process.exit(exitCode);
}

await main();
