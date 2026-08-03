// Cổng gác BẤT BIẾN #1 — Hoàng Sa & Trường Sa phải render ở mọi thời kỳ.
//
// Vì sao cần script riêng: CLAUDE.md nói cổng dữ liệu xanh KHÔNG chứng minh bản
// đồ đúng, phải mở trình duyệt nhìn bằng mắt. Nhưng "nhìn bằng mắt" không chạy
// lại được và phụ thuộc việc cửa sổ Chrome có đang ở trên hay không — tab chạy
// nền bị hãm requestAnimationFrame nên MapLibre không bao giờ tải xong style,
// và mọi phép đo đều trả giá trị vô nghĩa. Script này dựng Chrome headless
// riêng (swiftshader, WebGL thật) nên không phụ thuộc cửa sổ nào.
//
// Kiểm 3 điều:
//   V1  nhãn Hoàng Sa + Trường Sa RENDER được ở MỌI thời kỳ
//   V2  mọi lớp era nằm DƯỚI nhãn chu-quyen-labels trong thứ tự vẽ thật
//   V3  era nạp lười — lúc mở trang chỉ 1/3 nguồn era tồn tại
//
// V2 là thứ dễ vỡ nhất và im lặng nhất: nếu một lớp era chèn lên trên nhãn,
// nhãn Hoàng Sa/Trường Sa bị phủ mất mà không có lỗi nào trong console.
//
// ⚠️ BẢN ĐẦU CỦA SCRIPT NÀY ĐỎ GIẢ — ghi lại để đừng lặp lại. Nó đòi đủ 5 đảo
// (thêm Thổ Chu, Bạch Long Vĩ, Phú Quý) ở mọi thời kỳ và báo đỏ 10/13. Sai ở
// phép đo: ba đảo đó sống trong file ranh giới tỉnh, mà các thời kỳ cổ (Xích
// Quỷ → Đại Nam) KHÔNG có lớp ranh giới nào theo đúng phán quyết nguồn — nên
// chúng chưa bao giờ được VẼ ở đó, kể cả trước khi era nạp lười. Cái script cũ
// đo là "nguồn có feature", không phải "có render".
// Ba đảo đó đã có cổng riêng đúng tầng: audit_sovereignty.mjs kiểm chúng có mặt
// trong cả 3 file ranh giới ở mức DỮ LIỆU. Script này chỉ lo mức HIỂN THỊ.
//
// WebSocket là built-in của Node, chi phí 0 dependency. Node 20 (repo ghim ở
// .nvmrc) BẮT BUỘC cờ --experimental-websocket; Node >= 22 bỏ được cờ.
//
// Chạy: node --experimental-websocket scripts/verify_chu_quyen.mjs

import { spawn } from "node:child_process";
import { mkdtempSync, existsSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 5189; // cổng riêng: 5173 vite mặc định, 5188 smoke.mjs
const CDP_PORT = 9223;
const ORIGIN = `http://127.0.0.1:${PORT}/`;

const CHROME =
  process.env.CHROME_PATH ??
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    `${os.homedir()}/AppData/Local/Google/Chrome/Application/chrome.exe`,
  ].find((p) => existsSync(p));

// Bất biến #1 của dự án nêu đích danh HAI quần đảo này. Chúng đến từ nguồn
// "chu-quyen" luôn hiện ở mọi thời kỳ, độc lập với lớp ranh giới tỉnh.
const DAO = ["Hoàng Sa", "Trường Sa"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitPort(url, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return true;
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

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) {
        this.pending.get(m.id)(m.result);
        this.pending.delete(m.id);
      }
    };
  }
  send(method, params = {}) {
    const mid = ++this.id;
    this.ws.send(JSON.stringify({ id: mid, method, params }));
    return new Promise((res) => this.pending.set(mid, res));
  }
  /** Chạy JS trong trang; NÉM nếu trang ném — không nuốt lỗi thành xanh giả. */
  async evaluate(expression) {
    const r = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    const ex = r.result?.exceptionDetails ?? r.exceptionDetails;
    if (ex) throw new Error(`lỗi trong trang: ${ex.text} ${ex.exception?.description ?? ""}`);
    return r.result?.value;
  }
}

/** Đợi MapLibre tải xong style. Headless có rAF thật nên việc này về đích được. */
async function doiMap(cdp, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await cdp.evaluate(
      `(() => { try { return !!(window.__map && window.__map.isStyleLoaded() && window.__map.getStyle()); } catch { return false; } })()`,
    );
    if (ok) return true;
    await sleep(500);
  }
  return false;
}

/** Ảnh chụp trạng thái lớp + nguồn + feature chủ quyền đang render. */
const DO = (dao) => `(() => {
  const m = window.__map, st = m.getStyle();
  const ids = st.layers.map(l => l.id);
  const iCQ = ids.indexOf("chu-quyen-labels");
  const eras = ids.map((id, i) => ({ id, i })).filter(x => /^era-/.test(x.id));
  const tim = ${JSON.stringify(dao)};
  const thay = new Set();
  for (const s of Object.keys(st.sources)) {
    let f = []; try { f = m.querySourceFeatures(s) || []; } catch { continue; }
    for (const x of f) { const t = x.properties && x.properties.ten;
      if (t) for (const d of tim) if (String(t).includes(d)) thay.add(d); }
  }
  return {
    nguonEra: Object.keys(st.sources).filter(s => /^era-/.test(s)),
    iCQ, eras,
    moiEraDuoiNhan: iCQ >= 0 && eras.every(x => x.i < iCQ),
    nhanHien: iCQ >= 0 && st.layers[iCQ].layout?.visibility !== "none",
    daoThay: [...thay],
  };
})()`;

async function main() {
  if (!CHROME) {
    console.error("❌ Không tìm thấy chrome.exe. Đặt biến môi trường CHROME_PATH.");
    process.exit(2);
  }
  // --host 127.0.0.1 là BẮT BUỘC: vite mặc định bind "localhost", trên Windows
  // phân giải thành ::1 nên fetch tới 127.0.0.1 không bao giờ tới.
  const server = spawn(
    process.execPath,
    [
      path.join(ROOT, "node_modules/vite/bin/vite.js"),
      "--host", "127.0.0.1",
      "--port", String(PORT),
      "--strictPort",
    ],
    { cwd: ROOT, stdio: "ignore" },
  );
  const profile = mkdtempSync(path.join(os.tmpdir(), "vnenc-cq-"));
  let chrome = null;
  let loi = 0;

  try {
    if (!(await waitPort(ORIGIN))) throw new Error(`vite không lên ở ${ORIGIN}`);
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
    await cdp.send("Page.enable");
    await cdp.send("Page.navigate", { url: ORIGIN });

    if (!(await doiMap(cdp))) throw new Error("MapLibre không tải xong style trong 60s");

    // ── V3: era nạp lười ────────────────────────────────────────────────
    const dau = await cdp.evaluate(DO(DAO));
    const soEra = dau.nguonEra.length;
    if (soEra === 1) console.log(`✅ V3 nạp lười: ${soEra}/3 nguồn era lúc mở trang (${dau.nguonEra})`);
    else { console.log(`❌ V3 nạp lười: ${soEra}/3 nguồn era lúc mở trang — kỳ vọng 1`); loi++; }

    // ── V1 + V2 ở thời kỳ mặc định ──────────────────────────────────────
    const thieu0 = DAO.filter((d) => !dau.daoThay.includes(d));
    if (!thieu0.length) console.log(`✅ V1 mặc định: đủ ${DAO.length} feature chủ quyền render`);
    else { console.log(`❌ V1 mặc định: THIẾU ${thieu0.join(", ")}`); loi++; }

    if (dau.moiEraDuoiNhan)
      console.log(`✅ V2 mặc định: mọi lớp era dưới chu-quyen-labels (@${dau.iCQ})`);
    else { console.log(`❌ V2 mặc định: có lớp era ĐÈ LÊN nhãn chủ quyền — ${JSON.stringify(dau.eras)} vs iCQ=${dau.iCQ}`); loi++; }

    // ── Quét MỌI thời kỳ trên thanh trượt ───────────────────────────────
    const soThoiKy = await cdp.evaluate(
      `(() => { const t = document.getElementById("timeline"); return t ? Number(t.max) + 1 : 0; })()`,
    );
    console.log(`▶ quét ${soThoiKy} thời kỳ trên thanh trượt…`);
    for (let k = 0; k < soThoiKy; k++) {
      await cdp.evaluate(
        `(() => { const t = document.getElementById("timeline"); t.value = "${k}";
          t.dispatchEvent(new Event("input", { bubbles: true }));
          t.dispatchEvent(new Event("change", { bubbles: true })); return 1; })()`,
      );
      await sleep(1400); // đợi nguồn era nạp lười xong
      const s = await cdp.evaluate(DO(DAO));
      const thieu = DAO.filter((d) => !s.daoThay.includes(d));
      const nhan = await cdp.evaluate(
        `(document.getElementById("period-label") || {}).textContent || ""`,
      );
      const ok1 = thieu.length === 0 && s.nhanHien;
      const ok2 = s.moiEraDuoiNhan;
      if (ok1 && ok2) console.log(`  ✅ [${k}] ${nhan.trim()}`);
      else {
        loi++;
        console.log(`  ❌ [${k}] ${nhan.trim()}`);
        if (!ok1) console.log(`        V1 THIẾU: ${thieu.join(", ") || "(nhãn chủ quyền bị ẩn)"}`);
        if (!ok2) console.log(`        V2 lớp era đè nhãn: ${JSON.stringify(s.eras)} vs iCQ=${s.iCQ}`);
      }
    }

    console.log(loi === 0 ? "\n✅ Bất biến chủ quyền GIỮ ĐƯỢC ở mọi thời kỳ." : `\n❌ ${loi} lỗi.`);
  } catch (e) {
    console.error("❌", e.message);
    loi++;
  } finally {
    chrome?.kill();
    server.kill();
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* hồ sơ tạm */ }
  }
  process.exit(loi ? 1 : 0);
}

void main();
