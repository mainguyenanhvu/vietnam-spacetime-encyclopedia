// Đồ nghề chiến dịch 2.122 di tích: nạp bản ghi đã xác minh vào lớp
// di-tich-quoc-gia / di-tich-cap-tinh, KHỚP schema 12 trường:
// {id,ten,lon,lat,loai,nam_hien_thi,mo_ta,dia_diem,do_tin_cay_toa_do,trang_thai,xep_hang,nguon}
// Payload: JSON có mảng xac_minh_xong | len_ban_do | mảng trần, bản ghi
// {id|id_goi_y, ten, cap: quoc-gia|cap-tinh|dac-biet, xep_hang, dia_diem, lon, lat, mo_ta, nguon[], ghi_chu?, do_tin_cay?}
// Cổng loại: thiếu toạ độ/ngoài bbox VN, không có nguồn [WF*] fetch trực tiếp,
// trùng tên (norm đ→d) với entries-index + mọi lớp overlay, trùng id xuyên file.
// Chạy: node scripts/nap_di_tich.mjs <payload.json> [--ap-dung]   (mặc định DRY-RUN)
// Sau khi --ap-dung: node scripts/build_catalog.mjs && node scripts/build_entries_index.mjs && npm run validate
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const payloadPath = process.argv[2];
const apDung = process.argv.includes("--ap-dung");
if (!payloadPath) {
  console.error("Cách chạy: node scripts/nap_di_tich.mjs <payload.json> [--ap-dung]");
  process.exit(1);
}
const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const seenTen = new Map();
const seenId = new Map();
const ei = JSON.parse(readFileSync(ROOT + "/public/data/_index/entries-index.json", "utf8"));
for (const e of Array.isArray(ei) ? ei : ei.entries || []) {
  if (e.ten && !seenTen.has(norm(e.ten))) seenTen.set(norm(e.ten), "entries-index:" + (e.file || "?"));
  if (e.id && !seenId.has(e.id)) seenId.set(e.id, "entries-index:" + (e.file || "?"));
}
for (const f of readdirSync(ROOT + "/public/data/overlays").filter((x) => x.endsWith(".json"))) {
  const d = JSON.parse(readFileSync(ROOT + "/public/data/overlays/" + f, "utf8"));
  for (const it of d.items || []) {
    if (it.ten && !seenTen.has(norm(it.ten))) seenTen.set(norm(it.ten), f);
    if (it.id && !seenId.has(it.id)) seenId.set(it.id, f);
  }
}

const suyLoai = (xh, ten, moTa) => {
  const t = norm(xh + " " + moTa);
  if (t.includes("kien truc nghe thuat")) return "kien-truc-nghe-thuat";
  if (t.includes("khao co")) return "khao-co";
  if (t.includes("danh lam thang canh") || t.includes("danh thang")) return "danh-thang";
  if (t.includes("cach mang") || t.includes("khang chien") || t.includes("luu niem")) return "cach-mang";
  if (t.includes("kien truc")) return "kien-truc";
  return "lich-su";
};
const namXH = (xh) => {
  const m = String(xh || "").match(/(19|20)\d{2}/g);
  return m ? m[m.length - 1] : null;
};

const payload = JSON.parse(readFileSync(payloadPath, "utf8"));
const arr = Array.isArray(payload) ? payload : payload.xac_minh_xong || payload.len_ban_do || [];
const nhan = { "di-tich-quoc-gia": [], "di-tich-cap-tinh": [] };
const loaiBo = [];
for (const it of arr) {
  const id = (it.id || it.id_goi_y || "").trim();
  const vi = `${id || "?"} (${it.ten})`;
  const nguonOk = Array.isArray(it.nguon) && it.nguon.some((n) => /^\[WF/.test(n));
  if (!it.ten) { loaiBo.push([vi, "thiếu ten"]); continue; }
  if (typeof it.lon !== "number" || typeof it.lat !== "number") { loaiBo.push([vi, "thiếu lon/lat — chờ geocode"]); continue; }
  if (it.lon < 102 || it.lon > 118 || it.lat < 7 || it.lat > 24) { loaiBo.push([vi, "ngoài bbox VN"]); continue; }
  if (!nguonOk) { loaiBo.push([vi, "không có nguồn [WF*] fetch trực tiếp"]); continue; }
  if (!id) { loaiBo.push([vi, "thiếu id"]); continue; }
  if (seenId.has(id)) { loaiBo.push([vi, "id trùng: " + seenId.get(id)]); continue; }
  if (seenTen.has(norm(it.ten))) { loaiBo.push([vi, "tên trùng: " + seenTen.get(norm(it.ten))]); continue; }
  const dich = it.cap === "cap-tinh" ? "di-tich-cap-tinh" : it.cap === "quoc-gia" || it.cap === "dac-biet" ? "di-tich-quoc-gia" : null;
  if (!dich) { loaiBo.push([vi, "cap không hợp lệ: " + it.cap]); continue; }
  seenId.set(id, "payload"); seenTen.set(norm(it.ten), "payload");
  const nam = namXH(it.xep_hang);
  const capChu = it.cap === "cap-tinh" ? "cấp tỉnh/TP" : it.cap === "dac-biet" ? "QG đặc biệt" : "QG";
  nhan[dich].push({
    id, ten: it.ten,
    lon: +(+it.lon).toFixed(7), lat: +(+it.lat).toFixed(7),
    loai: suyLoai(it.xep_hang, it.ten, it.mo_ta),
    nam_hien_thi: nam ? `Di tích ${capChu} ${nam}` : `Di tích ${capChu}`,
    mo_ta: it.mo_ta || "",
    dia_diem: it.dia_diem || "",
    do_tin_cay_toa_do: it.do_tin_cay || "trung",
    trang_thai: "draft",
    xep_hang: it.xep_hang || "chưa xác minh được",
    nguon: it.nguon.map((n) => n.replace(/^\[WF[^\]]*\]\s*/, "").replace(/^\[WS[^\]]*\]\s*/, "")),
  });
}

console.log(`Payload ${arr.length} → QG ${nhan["di-tich-quoc-gia"].length} · cấp tỉnh ${nhan["di-tich-cap-tinh"].length} · loại ${loaiBo.length}`);
for (const [vi, ld] of loaiBo) console.log(`  ✗ ${vi}: ${ld}`);
if (apDung) {
  for (const [ten, them] of Object.entries(nhan)) {
    if (!them.length) continue;
    const p = ROOT + `/public/data/overlays/${ten}.json`;
    const db = JSON.parse(readFileSync(p, "utf8"));
    db.items.push(...them);
    writeFileSync(p, JSON.stringify(db, null, 2) + "\n");
    console.log(`✔ ghi ${them.length} → ${ten}.json (tổng ${db.items.length})`);
  }
} else console.log("(dry-run — thêm --ap-dung để ghi)");
