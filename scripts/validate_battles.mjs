// Validator sa đồ chiến dịch + CỔNG MINH BẠCH:
// - mỗi trận PHẢI có sa_do_ghi_chu nêu rõ «minh hoạ, không theo tỉ lệ»;
// - buoc[] không rỗng, mỗi bước có tieu_de + mo_ta + hien[];
// - nguon[] có >=1 nguồn chính sử ngoài wiki; trang_thai ∈ {draft, reviewed};
// - lien_quan_tinh khớp slug tỉnh; figure_id (nếu có) khớp builder figures3d.ts.
// Chạy: node scripts/validate_battles.mjs
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "public", "data", "battles");
const PROV = join(ROOT, "public", "data", "provinces");
const MODULE = join(ROOT, "src", "figures3d.ts");

let errors = 0;
const fail = (where, msg) => {
  console.error(`❌ ${where}: ${msg}`);
  errors++;
};
const isWiki = (s) => /wikipedia\.org|wikimedia\.org|\bwiki\b/i.test(s);

// ── Luật cho các trường của lược đồ mở rộng (2026-08-28) ────────────────────
// Mọi trường mới đều TÙY CHỌN: vắng mặt là hợp lệ, nên 290 hồ sơ hiện có
// không đụng tới vẫn xanh. Có mặt thì phải đủ nghĩa — khai một khối rỗng còn
// tệ hơn không khai, vì nó hứa một thông tin rồi không giao.

const chuoiCo = (where, ten, v) => {
  if (v === undefined) return;
  if (typeof v !== "string" || !v.trim()) fail(where, `${ten} phải là chuỗi không rỗng`);
};

const mangChuoi = (where, ten, v) => {
  if (v === undefined) return;
  if (!Array.isArray(v)) return fail(where, `${ten} phải là mảng chuỗi`);
  if (v.length === 0) return fail(where, `${ten} là mảng rỗng — bỏ hẳn trường còn hơn`);
  v.forEach((s, i) => {
    if (typeof s !== "string" || !s.trim()) fail(where, `${ten}[${i}] phải là chuỗi không rỗng`);
  });
};

/** Mảng nguồn của một khối mới — cùng luật đang áp cho `nguon[]` cấp trận:
 *  không rỗng và có ít nhất một nguồn ngoài wiki (bất biến #3). */
const kiemNguon = (where, ten, v) => {
  if (!Array.isArray(v)) return fail(where, `${ten} phải là mảng chuỗi`);
  const sach = v.filter((s) => typeof s === "string" && s.trim());
  if (sach.length === 0)
    return fail(where, `${ten} rỗng — khối không nguồn thì không được hiện`);
  if (!sach.some((s) => !isWiki(s)))
    fail(where, `${ten}: tất cả đều là wiki — cần >=1 nguồn chính thống`);
};

/** `quan_so` / `ton_that.ta` — chuỗi đơn, HOẶC mảng {so, nguon} khi các nguồn
 *  chép những con số khác nhau. Mảng là cách duy nhất nêu được chỗ vênh mà
 *  không quy về một con số (bất biến #4). */
const kiemSoLieu = (where, ten, v) => {
  if (v === undefined) return;
  if (typeof v === "string") {
    if (!v.trim()) fail(where, `${ten} là chuỗi rỗng`);
    return;
  }
  if (!Array.isArray(v)) return fail(where, `${ten} phải là chuỗi hoặc mảng {so, nguon}`);
  if (v.length === 0) return fail(where, `${ten} là mảng rỗng`);
  v.forEach((x, i) => {
    if (!x || typeof x !== "object" || typeof x.so !== "string" || !x.so.trim())
      fail(where, `${ten}[${i}]: thiếu "so" (chuỗi không rỗng)`);
    else if (x.nguon !== undefined && (typeof x.nguon !== "string" || !x.nguon.trim()))
      fail(where, `${ten}[${i}]: "nguon" phải là chuỗi không rỗng`);
  });
};

const kiemCotLucLuong = (where, ten, c) => {
  if (c === undefined) return;
  if (!c || typeof c !== "object" || Array.isArray(c))
    return fail(where, `${ten} phải là đối tượng {quan_so, don_vi, vu_khi}`);
  kiemSoLieu(where, `${ten}.quan_so`, c.quan_so);
  mangChuoi(where, `${ten}.don_vi`, c.don_vi);
  mangChuoi(where, `${ten}.vu_khi`, c.vu_khi);
};

if (!existsSync(DIR)) {
  console.log("ℹ️ public/data/battles/ chưa có — bỏ qua.");
  process.exit(0);
}
const slugs = new Set(
  readdirSync(PROV).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")),
);
const moduleSrc = existsSync(MODULE) ? readFileSync(MODULE, "utf8") : null;
// `_index.json` (sinh bởi build_sado_index.mjs) là hạ tầng, không phải hồ sơ
// trận — soi nó bằng luật hồ sơ trận thì cổng đỏ vĩnh viễn.
const files = readdirSync(DIR).filter((f) => f.endsWith(".json") && !f.startsWith("_"));

for (const file of files) {
  const b = JSON.parse(readFileSync(join(DIR, file), "utf8"));
  const w = `battle/${file}`;
  if (!b.ten || !b.nam) fail(w, "thiếu ten/nam");
  if (!b.sa_do_ghi_chu || !/không theo tỉ lệ/i.test(b.sa_do_ghi_chu))
    fail(w, "sa_do_ghi_chu phải nêu rõ «minh hoạ, KHÔNG theo tỉ lệ địa lý»");
  // Chỉ còn MỘT trình dựng. Bản vẽ tay riêng của bach-dang-938 đã gỡ khỏi
  // battle.ts ngày 2026-08-26, nên hồ sơ thiếu trường này sẽ render RỖNG mà
  // không có lỗi nào trong console — đúng loại hỏng câm mà cổng phải bắt.
  if (b.sa_do_kieu !== "tong-quat")
    fail(w, `sa_do_kieu phải là "tong-quat" (đang: ${JSON.stringify(b.sa_do_kieu)})`);
  const phanTuIds = new Set((b.phan_tu ?? []).map((p) => p.id));
  if (!Array.isArray(b.buoc) || b.buoc.length === 0) fail(w, "thiếu buoc[]");
  else
    for (const s of b.buoc) {
      if (!s.tieu_de || !s.mo_ta) fail(w, `bước ${s.id}: thiếu tieu_de/mo_ta`);
      if (!Array.isArray(s.hien)) fail(w, `bước ${s.id}: thiếu hien[]`);
      // Khoá trong `hien` trỏ vào `phan_tu[].id`. Gõ sai một khoá thì phần tử
      // đó lặng lẽ không hiện: dữ liệu hợp lệ, không lỗi console, chỉ là một
      // bước sa đồ thiếu quân. Không cổng nào bắt được cho tới lượt này.
      else
        for (const k of s.hien)
          if (!phanTuIds.has(k))
            fail(w, `bước ${s.id}: hien "${k}" không có trong phan_tu[]`);
      // Trường mới của bước — tuỳ chọn, có mặt thì phải đủ nghĩa.
      chuoiCo(w, `bước ${s.id}: thoi_gian`, s.thoi_gian);
      chuoiCo(w, `bước ${s.id}: dia_danh`, s.dia_danh);
      if (s.nguon !== undefined) kiemNguon(w, `bước ${s.id}: nguon`, s.nguon);
    }
  // Nhãn phụ của phần tử — khai chuỗi rỗng thì nhãn chính mất dòng hai mà
  // không có lỗi nào nổ ra.
  for (const p of b.phan_tu ?? []) chuoiCo(w, `phan_tu "${p.id}": quy_mo`, p.quy_mo);
  chuoiCo(w, "thoi_gian", b.thoi_gian);
  // 🔴 Bất biến #3: hai khối số liệu mới KHÔNG được thiếu nguồn. `luc_luong`
  // là tương quan quân số, `ton_that` là số người chết — đúng hai chỗ mà một
  // con số không nguồn gây hại nhất.
  if (b.luc_luong !== undefined) {
    if (!b.luc_luong || typeof b.luc_luong !== "object" || Array.isArray(b.luc_luong))
      fail(w, "luc_luong phải là đối tượng");
    else {
      kiemNguon(w, "luc_luong.nguon", b.luc_luong.nguon);
      kiemCotLucLuong(w, "luc_luong.ta", b.luc_luong.ta);
      kiemCotLucLuong(w, "luc_luong.doi_thu", b.luc_luong.doi_thu);
      if (b.luc_luong.ta === undefined && b.luc_luong.doi_thu === undefined)
        fail(w, "luc_luong không có cột nào (ta/doi_thu) — khối rỗng thì bỏ hẳn");
    }
  }
  if (b.ton_that !== undefined) {
    if (!b.ton_that || typeof b.ton_that !== "object" || Array.isArray(b.ton_that))
      fail(w, "ton_that phải là đối tượng");
    else {
      kiemNguon(w, "ton_that.nguon", b.ton_that.nguon);
      kiemSoLieu(w, "ton_that.ta", b.ton_that.ta);
      kiemSoLieu(w, "ton_that.doi_thu", b.ton_that.doi_thu);
      if (b.ton_that.ta === undefined && b.ton_that.doi_thu === undefined)
        fail(w, "ton_that không có bên nào (ta/doi_thu) — khối rỗng thì bỏ hẳn");
    }
  }
  if (Array.isArray(b.lien_quan_tinh))
    for (const s of b.lien_quan_tinh)
      if (!slugs.has(s)) fail(w, `slug tỉnh "${s}" không tồn tại`);
  if (b.figure_id && moduleSrc && !moduleSrc.includes(`"${b.figure_id}"`))
    fail(w, `figure_id "${b.figure_id}" không có builder trong figures3d.ts`);
  if (!["draft", "reviewed"].includes(b.trang_thai))
    fail(w, "trang_thai phải là draft|reviewed");
  if (!Array.isArray(b.nguon) || b.nguon.length === 0) fail(w, "thiếu nguon[]");
  else if (!b.nguon.some((s) => !isWiki(s)))
    fail(w, "TẤT CẢ nguồn đều là wiki — cần >=1 nguồn chính sử");
  // Trích văn tịch (nếu có): đoạn trích phải nêu SÁCH (kỷ + quyển, không URL)
  // và NƠI LẤY đoạn trích — hai nguồn khác nhau, thiếu một là trích không kiểm
  // được. `buoc` (nếu khai) phải trỏ vào một bước có thật.
  if (b.trich_van_tich !== undefined) {
    if (!Array.isArray(b.trich_van_tich)) fail(w, "trich_van_tich phải là mảng");
    else {
      const buocIds = new Set((b.buoc ?? []).map((s) => s.id));
      b.trich_van_tich.forEach((t, i) => {
        const wi = `${w} trich[${i}]`;
        if (!t.sach) fail(wi, "thiếu sach");
        else if (/https?:\/\//i.test(t.sach))
          fail(wi, "sach không được kèm URL — mẫu «Tên sách — kỷ, quyển» (URL để ở nguon_trich)");
        if (!t.doan || String(t.doan).trim().length < 20)
          fail(wi, "doan trích phải ≥20 ký tự — trích cụt không kiểm được");
        if (!t.nguon_trich) fail(wi, "thiếu nguon_trich — nơi lấy được đoạn trích");
        for (const s of [t.sach, t.doan, t.nguon_trich])
          if (s && isWiki(String(s))) fail(wi, "dính nguồn wiki");
        if (t.buoc !== undefined && !buocIds.has(t.buoc))
          fail(wi, `buoc ${t.buoc} không có trong buoc[] của trận`);
      });
    }
  }
  if (!errors) console.log(`✅ ${file}: ${b.buoc.length} bước`);
}

if (errors) {
  console.error(`\n❌ ${errors} lỗi sa đồ chiến dịch.`);
  process.exit(1);
}
console.log(`\n✅ Sa đồ chiến dịch hợp lệ (đủ disclaimer + nguồn chính sử).`);
