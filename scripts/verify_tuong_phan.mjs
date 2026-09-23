// Cổng gác TƯƠNG PHẢN — đo tỉ lệ chữ/nền của MỌI chữ đang hiện, ở MỌI chế độ.
//
// Vì sao cần: kỷ luật của dự án là mọi cặp màu đều đo thật (xem ghi chú số đo
// rải khắp theme.css). Nhưng đến 2026-09 các số đó vẫn đo TAY từng cặp, chỉ phủ
// topbar và nút — PLAN mục 1 ghi rõ 11 panel, badge, popup chưa ai đo. Và chế độ
// tối bị hoãn đúng vì lý do này: không có cách đo lại cả trang mỗi lần đổi token.
//
// Cách đo: với mỗi phần tử có nút chữ trực tiếp, lấy màu chữ đã tính, rồi đi
// ngược lên tổ tiên gom các lớp nền cho tới khi gặp nền đục, trộn alpha từ dưới
// lên. Nền gradient → lấy TỪNG điểm dừng màu và chấm theo điểm tệ nhất. Nền ảnh
// (url) → không đo được, đếm riêng chứ không coi là đạt.
//
// Mọi chuỗi màu (rgb, oklab, color-mix đã tính…) được chuẩn hoá bằng cách tô 1px
// lên canvas rồi đọc pixel — Chrome serialise color-mix thành `oklab(...)` hay
// `color(srgb ...)` tuỳ trường hợp, tự viết parser là đo sai im lặng.
//
// Ngưỡng WCAG 1.4.3: 4,5:1; chữ lớn (≥24px, hoặc ≥18,66px đậm ≥700) 3:1.
// Chữ trong phần tử :disabled được miễn theo đúng WCAG.
//
// Chạy: node --experimental-websocket scripts/verify_tuong_phan.mjs [che-do...]

import { spawn } from "node:child_process";
import { mkdtempSync, existsSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 5190; // 5173 vite · 5188 smoke · 5189 verify:chuquyen
const CDP_PORT = 9224;
// `localhost` chứ không phải 127.0.0.1: localStorage gắn theo origin, và phép
// đo đặt chế độ bằng localStorage trước khi nạp lại trang.
const ORIGIN = `http://localhost:${PORT}/`;

const CHROME =
  process.env.CHROME_PATH ??
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    `${os.homedir()}/AppData/Local/Google/Chrome/Application/chrome.exe`,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ].find((p) => existsSync(p));

const CHE_DO = process.argv.slice(2).length ? process.argv.slice(2) : ["nguoi-lon", "tre-em", "toi"];
// TP_CHI="popup" → chỉ đo các trạng thái có tên chứa chuỗi đó (gỡ lỗi nhanh).
const CHI = process.env.TP_CHI ?? "";
// TP_ANH=<thư mục> → chụp PNG từng trạng thái. Đạt ngưỡng chưa chứng minh trang
// trông đúng: mảng nền sáng không chứa chữ nào thì cổng này không bao giờ thấy.
const ANH = process.env.TP_ANH ?? "";
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
  async evaluate(expression) {
    const r =
      (await this.send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      })) ?? {};
    const ex = r.result?.exceptionDetails ?? r.exceptionDetails;
    if (ex) throw new Error(`lỗi trong trang: ${ex.text} ${ex.exception?.description ?? ""}`);
    return r.result?.value;
  }
  async click(x, y) {
    for (const type of ["mousePressed", "mouseReleased"])
      await this.send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
  }
}

/** Như verify_chu_quyen: đợi lớp chủ quyền + thanh thời gian, không chỉ style nền. */
async function doiMap(cdp, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await cdp.evaluate(
      `(() => { try {
        const m = window.__map, t = document.getElementById("timeline");
        return !!(m && m.isStyleLoaded() && m.getLayer("chu-quyen-labels") && t && Number(t.max) > 0);
      } catch { return false; } })()`,
    );
    if (ok) return true;
    await sleep(500);
  }
  return false;
}

// Chạy TRONG trang: cài `window.__tp` với ba hàm —
//   do(goc)   đo mọi chữ đang hiện bên trong `goc` (cả chữ SVG),
//   kieu(el)  chụp các thuộc tính có thể làm chỉ báo focus,
//   vien(el)  tỉ lệ tương phản của vòng outline so với nền xung quanh.
// Cài lại sau mỗi lần nạp trang.
const CAI_DAT = `(() => {
  const cv = document.createElement("canvas"); cv.width = cv.height = 1;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  const bo = new Map();
  const mau = (s) => {
    if (bo.has(s)) return bo.get(s);
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = "rgba(0,0,0,0)"; cx.fillStyle = s; cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    const v = [d[0], d[1], d[2], d[3] / 255];
    bo.set(s, v); return v;
  };
  const tron = (tren, duoi) => { const a = tren[3];
    return [0, 1, 2].map((i) => tren[i] * a + duoi[i] * (1 - a)).concat(1); };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const tile = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const RE_MAU = /(?:rgba?|oklab|oklch|lab|lch|color|hsla?)\\([^()]*\\)|#[0-9a-f]{3,8}\\b/gi;

  // Các lớp nền từ phần tử lên gốc. Mỗi lớp là DANH SÁCH màu ứng viên
  // (gradient cho nhiều ứng viên). Dừng ở lớp đục đầu tiên.
  const nen = (el) => {
    const lop = []; let anh = false, xapXi = true, chuNen = null;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      const bi = cs.backgroundImage;
      if (bi && bi !== "none") {
        if (/url\\(/.test(bi)) { anh = true; break; }
        const stops = (bi.match(RE_MAU) || []).map(mau);
        if (stops.length) { lop.push(stops); if (stops.every((s) => s[3] >= 0.99)) { xapXi = false; chuNen = e; break; } }
      }
      const bc = mau(cs.backgroundColor);
      if (bc[3] > 0) { lop.push([bc]); if (bc[3] >= 0.99) { xapXi = false; chuNen = e; break; } }
    }
    if (anh) return { anh: true };
    // Chưa gặp nền đục = phần tử trôi trên bản đồ. Trộn lên nền của <body>
    // (màu giấy của bản đồ) — xấp xỉ, đánh dấu để người đọc biết.
    let ungVien = [mau(getComputedStyle(document.body).backgroundColor)];
    if (ungVien[0][3] < 0.99) ungVien = [[255, 255, 255, 1]];
    for (let i = lop.length - 1; i >= 0; i--) {
      const moi = [];
      for (const tren of lop[i]) for (const duoi of ungVien) moi.push(tren[3] >= 0.99 ? tren : tron(tren, duoi));
      ungVien = moi.slice(0, 24);
    }
    return { ungVien, xapXi, chuNen };
  };

  const ten = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) return s + "#" + el.id;
    const c = [...el.classList].slice(0, 2).join(".");
    if (c) s += "." + c;
    const cha = el.parentElement && el.parentElement.closest("[id]");
    return (cha ? "#" + cha.id + " " : "") + s;
  };

  const hex = (c) => "#" + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

  // Chữ SVG: màu là fill, không phải color. Nền là QUẦNG nếu chữ có viền vẽ
  // trước (paint-order: stroke) rộng ≥2px thật — kỹ thuật nhãn bản đồ của sa
  // đồ. Không quầng thì lấy hình nằm ngay dưới tâm chữ; không có hình thì nền
  // HTML chứa SVG. Chỉ lấy MỘT điểm (tâm) — đánh dấu xấp xỉ.
  const doSvg = (el, cs, op, mt0) => {
    const ctm = el.getScreenCTM();
    const tile_ = ctm ? Math.hypot(ctm.a, ctm.b) : 1;
    const co = parseFloat(cs.fontSize) * tile_, dam = Number(cs.fontWeight) || 400;
    const nguong = co >= 24 || (co >= 18.66 && dam >= 700) ? 3 : 4.5;
    const mt = { ...mt0, co: Math.round(co), nguong, svg: true };
    if (/url\\(/.test(cs.fill) || cs.fill === "none") return { ...mt, anh: true };
    const fg = [...mau(cs.fill)]; fg[3] *= Number(cs.fillOpacity);
    let ungVien = null, quang = false, xapXi = true, nenTu = "";
    const sw = parseFloat(cs.strokeWidth) * tile_;
    if (cs.stroke !== "none" && !/url\\(/.test(cs.stroke) && /^\\s*stroke/.test(cs.paintOrder) && sw >= 2) {
      const s = [...mau(cs.stroke)]; s[3] *= Number(cs.strokeOpacity);
      if (s[3] >= 0.99) { ungVien = [s]; quang = true; xapXi = false; }
    }
    if (!ungVien) {
      const r = el.getBoundingClientRect();
      const duoi = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        .find((e) => e !== el && !e.contains(el) && !el.contains(e));
      const cha = duoi ?? el;
      const b = nen(cha);
      if (b.anh) return { ...mt, anh: true };
      ungVien = b.ungVien;
      if (duoi instanceof SVGGeometryElement) {
        const dc = getComputedStyle(duoi);
        if (dc.fill !== "none" && !/url\\(/.test(dc.fill)) {
          const f = [...mau(dc.fill)]; f[3] *= Number(dc.fillOpacity) * Number(dc.opacity);
          ungVien = f[3] >= 0.99 ? [f] : ungVien.map((u) => tron(f, u));
          nenTu = ten(duoi);
        }
      } else if (b.chuNen) nenTu = ten(b.chuNen);
    }
    let toiNhat = Infinity, bgToi = null;
    for (const bg of ungVien) {
      let f = fg[3] < 1 ? tron(fg, bg) : fg;
      if (op < 1) f = tron([f[0], f[1], f[2], op], bg);
      const t = tile(f, bg);
      if (t < toiNhat) { toiNhat = t; bgToi = bg; }
    }
    return { ...mt, tile: Math.round(toiNhat * 100) / 100, fg: hex(fg), bg: hex(bgToi), xapXi, nenTu: quang ? "quầng" : nenTu };
  };

  const doChu = (goc) => {
  const kq = [];
  const walker = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT);
  const daXet = new Set();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!/[\\p{L}\\p{N}]/u.test(n.nodeValue)) continue;
    const el = n.parentElement;
    if (!el || daXet.has(el)) continue;
    daXet.add(el);
    if (el.closest("canvas, script, style, noscript, [hidden]")) continue;
    // Trong SVG chỉ đo phần tử chữ (<title>/<desc> không vẽ ra). HTML trong
    // <foreignObject> đi đường thường.
    const laSvgChu = el instanceof SVGTextContentElement;
    if (el.closest("svg") && !laSvgChu && !el.closest("foreignObject")) continue;
    if (el.closest(":disabled, [aria-disabled=true]")) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility !== "visible" || cs.display === "none") continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) continue;
    // Chữ nằm ngoài khung nhìn (panel cuộn dài) vẫn đo — người dùng cuộn tới.
    let op = 1, anDi = false;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const c = getComputedStyle(e);
      if (c.display === "none" || c.visibility === "hidden") { anDi = true; break; }
      op *= Number(c.opacity);
    }
    if (anDi || op < 0.05) continue;
    // Chữ tàng hình cho screen reader (clip 1px) đã bị lọc bởi kích thước ở trên.
    if (laSvgChu) { kq.push(doSvg(el, cs, op, { chon: ten(el), chu: n.nodeValue.trim().slice(0, 40) })); continue; }
    const b = nen(el);
    const co = parseFloat(cs.fontSize), dam = Number(cs.fontWeight) || 400;
    const lon = co >= 24 || (co >= 18.66 && dam >= 700);
    const nguong = lon ? 3 : 4.5;
    const mt = { chon: ten(el), chu: n.nodeValue.trim().slice(0, 40), co: Math.round(co), nguong };
    if (b.anh) { kq.push({ ...mt, anh: true }); continue; }
    let fg = mau(cs.color);
    let toiNhat = Infinity, bgToi = null;
    for (const bg of b.ungVien) {
      let f = fg[3] < 1 ? tron(fg, bg) : fg;
      if (op < 1) f = tron([f[0], f[1], f[2], op], bg);
      const t = tile(f, bg);
      if (t < toiNhat) { toiNhat = t; bgToi = bg; }
    }
    kq.push({ ...mt, tile: Math.round(toiNhat * 100) / 100, fg: hex(fg), bg: hex(bgToi), xapXi: b.xapXi, nenTu: b.chuNen && b.chuNen !== el ? ten(b.chuNen) : "" });
  }
  return kq;
  };

  // Thuộc tính có thể làm chỉ báo focus. So trước/sau khi ép :focus-visible —
  // không đổi gì cả là focus VÔ HÌNH (WCAG 2.4.7).
  const kieu = (el) => {
    const c = getComputedStyle(el);
    return [c.outlineStyle, c.outlineWidth, c.outlineColor, c.boxShadow, c.borderColor, c.backgroundColor, c.color, c.textDecorationLine].join("|");
  };
  // Vòng outline so với nền NGOÀI phần tử (outline vẽ ra ngoài viền). WCAG
  // 1.4.11: chỉ báo không phải chữ cần 3:1 với màu kề bên.
  const vien = (el) => {
    const c = getComputedStyle(el);
    if (c.outlineStyle === "none" || parseFloat(c.outlineWidth) < 1) return null;
    const o = mau(c.outlineColor);
    const b = nen(el.parentElement ?? document.body);
    if (b.anh) return null;
    let t = Infinity, bg = null;
    for (const u of b.ungVien) { const f = o[3] < 1 ? tron(o, u) : o; const x = tile(f, u); if (x < t) { t = x; bg = u; } }
    return { tile: Math.round(t * 100) / 100, fg: hex(o), bg: hex(bg), nenTu: b.chuNen ? ten(b.chuNen) : "" };
  };

  // Chọn MỘT phần tử đại diện cho mỗi kiểu điều khiển (thẻ + class + khu vực
  // có id): 35 checkbox lớp phủ giống hệt nhau chỉ cần đo một cái.
  const chonTuongTac = (tran) => {
    for (const e of document.querySelectorAll("[data-tp-i]")) e.removeAttribute("data-tp-i");
    const daCo = new Set(); let i = 0;
    for (const e of document.querySelectorAll("button, a[href], summary, select, input, [role=button], [role=tab], [tabindex='0']")) {
      if (e.matches(":disabled, [aria-disabled=true]") || e.closest("[hidden]")) continue;
      if (!e.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
      const k = e.tagName + "." + [...e.classList].sort().join(".") + "|" + (e.parentElement?.closest("[id]")?.id ?? "");
      if (daCo.has(k)) continue;
      daCo.add(k); e.setAttribute("data-tp-i", String(i++));
      if (i >= tran) break;
    }
    return i;
  };

  window.__tp = { do: doChu, kieu, vien, chonTuongTac, ten };
  return 1;
})()`;
const DO_TRANG = `__tp.do(document.body)`;

/**
 * Đo hover và focus của các phần tử điều khiển đại diện. Ép trạng thái bằng
 * `CSS.forcePseudoState` — chuột ảo của CDP chỉ hover được một chỗ một lúc và
 * không bao giờ tạo :focus-visible.
 *
 * Trả danh sách mục trượt cùng định dạng với lượt đo chữ, `chon` mang tiền tố
 * [hover]/[focus] để người đọc biết trạng thái nào.
 */
async function doTuongTac(cdp) {
  const TRAN = Number(process.env.TP_TRAN_TUONG_TAC ?? 60);
  const so = await cdp.evaluate(`__tp.chonTuongTac(${TRAN})`);
  // Tắt chuyển tiếp: đo giữa lúc màu đang nội suy là đo rác. Trang có tôn
  // trọng prefers-reduced-motion hay không thì cũng không phụ thuộc vào đó.
  await cdp.evaluate(`(() => { const st = document.createElement("style"); st.id = "tp-tat-chuyen";
    st.textContent = "*, *::before, *::after { transition: none !important; animation: none !important; }";
    document.head.append(st); return 1; })()`);
  const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
  const truot = [];
  let coDo = 0;
  for (let i = 0; i < so; i++) {
    const { nodeId } = (await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: `[data-tp-i="${i}"]` })) ?? {};
    if (!nodeId) continue;
    coDo++;
    const EL = `document.querySelector('[data-tp-i="${i}"]')`;
    for (const tt of ["hover", "focus"]) {
      const truoc = tt === "focus" ? await cdp.evaluate(`__tp.kieu(${EL})`) : null;
      await cdp.send("CSS.forcePseudoState", {
        nodeId,
        forcedPseudoClasses: tt === "hover" ? ["hover"] : ["focus", "focus-visible"],
      });
      const kq = await cdp.evaluate(`__tp.do(${EL})`);
      for (const t of kq) if (!t.anh && t.tile < t.nguong) truot.push({ ...t, chon: `[${tt}] ${t.chon}` });
      if (tt === "focus") {
        const sau = await cdp.evaluate(`__tp.kieu(${EL})`);
        const v = await cdp.evaluate(`__tp.vien(${EL})`);
        const chon = `[focus] ${await cdp.evaluate(`__tp.ten(${EL})`)}`;
        if (v && v.tile < 3) truot.push({ ...v, chon, chu: "(vòng focus)", nguong: 3 });
        else if (!v && sau === truoc) truot.push({ chon, chu: "(focus VÔ HÌNH — không thuộc tính nào đổi)", tile: 1, nguong: 3, fg: "-", bg: "-" });
      }
      await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] });
    }
  }
  await cdp.evaluate(`(document.getElementById("tp-tat-chuyen")?.remove(), 1)`);
  return { truot, coDo };
}

/** Các trạng thái giao diện cần đo. Mỗi bước trả về false nếu dựng hỏng. */
const TRANG_THAI = [
  { ten: "mặc định", lam: async () => true },
  {
    ten: "hồ sơ tỉnh",
    lam: async (cdp) => {
      // Chuyển về thời kỳ 34 tỉnh rồi BẤM THẬT vào Hà Nội — đi đúng đường người dùng.
      await cdp.evaluate(`(() => { const s = document.getElementById("lc-period");
        const o = [...s.options].find((x) => /34/.test(x.textContent)); if (!o) return 0;
        s.value = o.value; s.dispatchEvent(new Event("change", { bubbles: true })); return 1; })()`);
      await sleep(2500);
      await cdp.evaluate(`window.__map.jumpTo({ center: [105.85, 21.03], zoom: 8 })`);
      await sleep(2500);
      const p = await cdp.evaluate(`(() => { const r = document.getElementById("map").getBoundingClientRect();
        const q = window.__map.project([105.85, 21.03]); return { x: r.left + q.x, y: r.top + q.y }; })()`);
      await cdp.click(p.x, p.y);
      await sleep(2500);
      return cdp.evaluate(`!document.getElementById("province-panel").hidden &&
        document.getElementById("panel-content").textContent.trim().length > 50`);
    },
  },
  ...["library", "quiz", "game", "story", "huongdan"].map((id) => ({
    ten: `panel ${id}`,
    lam: async (cdp) => {
      await cdp.evaluate(`document.getElementById("${id}-btn")?.click()`);
      await sleep(2500);
      return cdp.evaluate(`(() => { const p = document.getElementById("${id}-panel");
        return !!p && !p.hidden && getComputedStyle(p).display !== "none"; })()`);
    },
  })),
  // Năm panel trong menu «Khám phá» — nút nằm trong <details> đóng, nhưng
  // .click() bằng JS vẫn chạy như người bấm.
  ...["battle", "journey", "olympia", "quocgia", "namtien"].map((id) => ({
    ten: `panel ${id}`,
    lam: async (cdp) => {
      await cdp.evaluate(`document.getElementById("${id}-btn")?.click()`);
      await sleep(3000);
      return cdp.evaluate(`(() => { const p = document.getElementById("${id}-panel");
        return !!p && !p.hidden && getComputedStyle(p).display !== "none"; })()`);
    },
  })),
  {
    // Màn B của sa đồ: token riêng cho bờ/sông/phe ta–địch, chữ đè lên nền địa hình.
    ten: "sa đồ chi tiết",
    lam: async (cdp) => {
      await cdp.evaluate(`document.getElementById("battle-btn")?.click()`);
      await sleep(3000);
      await cdp.evaluate(`document.querySelector("#battle-panel .sd-card-ready")?.click()`);
      await sleep(3500);
      return cdp.evaluate(`!!document.getElementById("sd-detail")`);
    },
  },
  {
    ten: "popup lớp phủ",
    lam: async (cdp) => {
      await cdp.evaluate(`(() => { const c = document.querySelector('#layer-control input[name=overlay]');
        if (c && !c.checked) { c.checked = true; c.dispatchEvent(new Event("change", { bubbles: true })); } })()`);
      await sleep(4000);
      const p = await cdp.evaluate(`(() => { const m = window.__map;
        const ids = m.getStyle().layers.map((l) => l.id).filter((id) => /^overlay-/.test(id));
        // Chỉ nhận điểm mà cú bấm thật sự rơi vào canvas — điểm nằm dưới bảng
        // lớp (rộng hơn ở chế độ trẻ em vì chữ to) thì bấm trúng bảng lớp.
        const r = document.getElementById("map").getBoundingClientRect(), cv = m.getCanvas();
        for (const f of m.queryRenderedFeatures({ layers: ids })) {
          if (f.geometry.type !== "Point") continue;
          const q = m.project(f.geometry.coordinates), x = r.left + q.x, y = r.top + q.y;
          if (document.elementFromPoint(x, y) === cv) return { x, y };
        }
        return null; })()`);
      if (!p) {
        const chan = await cdp.evaluate(`(() => { const m = window.__map;
          const ids = m.getStyle().layers.map((l) => l.id).filter((id) => /^overlay-/.test(id));
          return { lop: ids.slice(0, 6), soDiem: m.queryRenderedFeatures({ layers: ids }).length,
            vis: ids.slice(0, 3).map((id) => m.getLayoutProperty(id, "visibility")) }; })()`);
        console.log(`      (chẩn đoán popup: ${JSON.stringify(chan)})`);
        return false;
      }
      await cdp.click(p.x, p.y);
      await sleep(2000);
      return cdp.evaluate(`!!document.querySelector(".maplibregl-popup")`);
    },
  },
];

async function main() {
  if (!CHROME) {
    console.error("❌ Không tìm thấy chrome.exe. Đặt biến môi trường CHROME_PATH.");
    process.exit(2);
  }
  const server = spawn(
    process.execPath,
    [path.join(ROOT, "node_modules/vite/bin/vite.js"), "--host", "localhost", "--port", String(PORT), "--strictPort"],
    { cwd: ROOT, stdio: "ignore" },
  );
  const profile = mkdtempSync(path.join(os.tmpdir(), "vnenc-tp-"));
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
        ...(process.env.CI ? ["--no-sandbox", "--disable-dev-shm-usage"] : []),
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
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    // Tắt chuyển động: panel đang trượt vào thì màu đang nội suy, đo là đo rác.
    await cdp.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });

    for (const che of CHE_DO) {
      console.log(`\n══ Chế độ ${che} ══`);
      for (const tt of TRANG_THAI.filter((t) => t.ten.includes(CHI))) {
        // Nạp lại sạch cho từng trạng thái: panel này không che panel kia,
        // và hướng dẫn tự bật lần đầu không lẫn vào phép đo khác.
        await cdp.send("Page.navigate", { url: ORIGIN });
        await sleep(800);
        await cdp.evaluate(`(() => { localStorage.setItem("bkvn.che-do", ${JSON.stringify(che)});
          localStorage.setItem("bkvn.huong-dan.da-moi", "1"); return 1; })()`);
        await cdp.send("Page.reload", { ignoreCache: false });
        if (!(await doiMap(cdp))) throw new Error("MapLibre không tải xong style trong 60s");
        await sleep(1200);
        const thatSu = await cdp.evaluate(`document.documentElement.dataset.cheDo`);
        if (thatSu !== che) {
          console.log(`  ❌ trang không nhận chế độ «${che}» (đang là «${thatSu}»)`);
          loi++;
          break;
        }
        const dung = await tt.lam(cdp);
        if (!dung) {
          console.log(`  ⚠️  [${tt.ten}] không dựng được trạng thái — BỎ QUA, chưa đo`);
          continue;
        }
        if (ANH) {
          mkdirSync(ANH, { recursive: true });
          const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
          writeFileSync(path.join(ANH, `${che}-${tt.ten.replace(/\s+/g, "-")}.png`), Buffer.from(data, "base64"));
        }
        await cdp.evaluate(CAI_DAT);
        const kq = await cdp.evaluate(DO_TRANG);
        const anh = kq.filter((x) => x.anh).length;
        const soSvg = kq.filter((x) => x.svg && !x.anh).length;
        const tuongTac = await doTuongTac(cdp);
        const truot = [...kq.filter((x) => !x.anh && x.tile < x.nguong), ...tuongTac.truot];
        // Gộp theo (bộ chọn, cặp màu) — một danh sách 40 mục giống nhau không ai đọc.
        const nhom = new Map();
        for (const t of truot) {
          const k = `${t.chon}|${t.fg}|${t.bg}`;
          if (!nhom.has(k)) nhom.set(k, { ...t, n: 0 });
          nhom.get(k).n++;
        }
        const dau = nhom.size ? "❌" : "✅";
        console.log(
          `  ${dau} [${tt.ten}] ${kq.length - anh} chữ đo được (${soSvg} SVG) · ${tuongTac.coDo} điều khiển × hover/focus · ${truot.length} trượt · ${anh} trên nền ảnh (không đo)`,
        );
        for (const t of [...nhom.values()].sort((a, b) => a.tile - b.tile))
          console.log(
            `      ${t.tile.toFixed(2)}:1 < ${t.nguong}  ${t.chon}  ${t.fg} trên ${t.bg}${t.nenTu ? " [nền: " + t.nenTu + "]" : ""}${t.xapXi ? (t.svg ? " (SVG, lấy mẫu tâm chữ)" : " (trôi trên bản đồ, xấp xỉ)") : ""}  ×${t.n}  «${t.chu}»`,
          );
        loi += nhom.size;
      }
    }
    console.log(
      loi === 0
        ? "\n✅ Đạt: chữ HTML + SVG (WCAG 1.4.3), cả lúc hover/focus; chỉ báo focus thấy được và đạt 3:1 (2.4.7 · 1.4.11)."
        : `\n❌ ${loi} nhóm trượt ngưỡng.`,
    );
  } catch (e) {
    console.error("❌", e.message);
    loi++;
  } finally {
    chrome?.kill();
    server.kill();
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {
      /* hồ sơ tạm */
    }
  }
  process.exit(loi ? 1 : 0);
}

void main();
