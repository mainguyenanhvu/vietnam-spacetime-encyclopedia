// Validator phim tài liệu danh nhân + nhạc yêu nước quốc gia:
// - phim-tai-lieu.json: mỗi mục có youtube_id 11 ký tự, kenh_loai hợp lệ, trang_thai;
//   danh_nhan.tinh phải khớp slug tỉnh; figure_id (nếu có) phải khớp figures-3d.json.
// - nhac-yeu-nuoc.json: mỗi item (hoặc phien_ban[]) có youtube_id 11 ký tự, kenh_loai hợp lệ.
// Guard existsSync để không chặn CI khi file chưa có.
// Chạy: node scripts/validate_documentaries.mjs
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PHIM = join(ROOT, "public", "data", "documentaries", "phim-tai-lieu.json");
const NHAC = join(ROOT, "public", "data", "media", "nhac-yeu-nuoc.json");
const DANHNHAN = join(ROOT, "public", "data", "figures", "danh-nhan.json");
const DIADANH = join(ROOT, "public", "data", "media", "dia-danh.json");
const PROV = join(ROOT, "public", "data", "provinces");
const FIG = join(ROOT, "public", "data", "figures", "figures-3d.json");

const YT = /^[A-Za-z0-9_-]{11}$/;
const KENH_LOAI = new Set(["state", "verified", "official-name", "topic", "khac"]);

let errors = 0;
const fail = (where, msg) => { console.error(`❌ ${where}: ${msg}`); errors++; };

const slugs = new Set(
  readdirSync(PROV).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")),
);

let figIds = new Set();
if (existsSync(FIG)) {
  try {
    const fig = JSON.parse(readFileSync(FIG, "utf8"));
    const arr = fig.items || fig.figures || fig;
    if (Array.isArray(arr)) for (const f of arr) if (f && f.id) figIds.add(f.id);
  } catch { /* ignore */ }
}

function checkYt(w, vid) {
  if (!vid || !YT.test(vid)) fail(w, `youtube_id "${vid}" không hợp lệ (cần 11 ký tự [A-Za-z0-9_-])`);
}
function checkKenh(w, k) {
  if (!KENH_LOAI.has(k)) fail(w, `kenh_loai "${k}" không thuộc {${[...KENH_LOAI].join("|")}}`);
}

// --- phim-tai-lieu.json ---
if (existsSync(PHIM)) {
  const data = JSON.parse(readFileSync(PHIM, "utf8"));
  const dn = data.danh_nhan || [];
  const seen = new Set();
  for (const d of dn) {
    const w = `phim/danh_nhan/${d.ten ?? "(thiếu ten)"}`;
    if (!d.ten) fail(w, "thiếu ten");
    if (!slugs.has(d.tinh)) fail(w, `tinh "${d.tinh}" không khớp slug tỉnh`);
    checkYt(w, d.youtube_id);
    checkKenh(w, d.kenh_loai);
    if (d.trang_thai !== "draft" && d.trang_thai !== "reviewed")
      fail(w, `trang_thai "${d.trang_thai}" phải là draft|reviewed`);
    if (d.figure_id && figIds.size && !figIds.has(d.figure_id))
      fail(w, `figure_id "${d.figure_id}" không khớp figures-3d.json`);
    const key = d.tinh + "|" + d.ten;
    if (seen.has(key)) fail(w, "trùng (tinh|ten)");
    seen.add(key);
  }
  for (const q of (data.quoc_gia || [])) {
    const w = `phim/quoc_gia/${q.chu_de ?? q.ten ?? "?"}`;
    if (!q.ten) fail(w, "thiếu ten");
    checkYt(w, q.youtube_id);
    checkKenh(w, q.kenh_loai);
    if (q.figure_id && figIds.size && !figIds.has(q.figure_id))
      fail(w, `figure_id "${q.figure_id}" không khớp figures-3d.json`);
  }
  console.log(`✅ phim-tai-lieu.json: ${dn.length} danh nhân + ${(data.quoc_gia || []).length} quốc gia`);
} else {
  console.log("ℹ️ phim-tai-lieu.json chưa có — bỏ qua.");
}

// --- nhac-yeu-nuoc.json ---
if (existsSync(NHAC)) {
  const data = JSON.parse(readFileSync(NHAC, "utf8"));
  const items = data.items || [];
  const seen = new Set();
  for (const it of items) {
    const w = `nhac/${it.id ?? it.ten ?? "?"}`;
    if (!it.id) fail(w, "thiếu id");
    if (it.id && seen.has(it.id)) fail(w, "id trùng");
    seen.add(it.id);
    if (!it.ten) fail(w, "thiếu ten");
    if (Array.isArray(it.phien_ban)) {
      if (!it.phien_ban.length) fail(w, "phien_ban[] rỗng");
      for (const p of it.phien_ban) {
        const pw = `${w}/${p.the_hien ?? "?"}`;
        checkYt(pw, p.youtube_id);
        checkKenh(pw, p.kenh_loai);
      }
    } else {
      checkYt(w, it.youtube_id);
      checkKenh(w, it.kenh_loai);
    }
  }
  console.log(`✅ nhac-yeu-nuoc.json: ${items.length} mục`);
} else {
  console.log("ℹ️ nhac-yeu-nuoc.json chưa có — bỏ qua.");
}

// --- danh-nhan.json ---
if (existsSync(DANHNHAN)) {
  const data = JSON.parse(readFileSync(DANHNHAN, "utf8"));
  const items = data.items || [];
  const idSeen = new Set();
  let coPhim = 0;
  for (const d of items) {
    const w = `danh-nhan/${d.id ?? d.ten ?? "?"}`;
    if (!d.id) fail(w, "thiếu id");
    if (d.id && idSeen.has(d.id)) fail(w, "id trùng");
    idSeen.add(d.id);
    if (!d.ten) fail(w, "thiếu ten");
    if (!slugs.has(d.tinh)) fail(w, `tinh "${d.tinh}" không khớp slug tỉnh`);
    if (!d.nguon || !d.nguon.length) fail(w, "thiếu nguon[]");
    if (d.trang_thai !== "draft" && d.trang_thai !== "reviewed")
      fail(w, `trang_thai "${d.trang_thai}" phải là draft|reviewed`);
    if (d.youtube_id) { checkYt(w, d.youtube_id); coPhim++; }
    if (d.figure_id && figIds.size && !figIds.has(d.figure_id))
      fail(w, `figure_id "${d.figure_id}" không khớp figures-3d.json`);
  }
  console.log(`✅ danh-nhan.json: ${items.length} danh nhân (${coPhim} có phim)`);
} else {
  console.log("ℹ️ danh-nhan.json chưa có — bỏ qua.");
}

// --- dia-danh.json ---
if (existsSync(DIADANH)) {
  const data = JSON.parse(readFileSync(DIADANH, "utf8"));
  const items = data.items || [];
  for (const d of items) {
    const w = `dia-danh/${d.ten ?? "?"}`;
    if (!d.ten) fail(w, "thiếu ten");
    if (!slugs.has(d.tinh)) fail(w, `tinh "${d.tinh}" không khớp slug tỉnh`);
    if (!d.maps_query) fail(w, "thiếu maps_query");
  }
  console.log(`✅ dia-danh.json: ${items.length} địa danh`);
} else {
  console.log("ℹ️ dia-danh.json chưa có — bỏ qua.");
}

if (errors) {
  console.error(`\n❌ ${errors} lỗi phim tài liệu / nhạc / danh nhân / địa danh.`);
  process.exit(1);
}
console.log(`\n✅ Phim tài liệu + nhạc yêu nước + danh nhân + địa danh hợp lệ.`);
