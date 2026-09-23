// Cổng chặn lạm dụng nhãn «tâm xã». Chủ dự án duyệt 2026-09-23 cho mục ĐỦ
// NGUỒN mà thiếu toạ độ được đặt ở tâm đơn vị cấp xã, với điều kiện ghi rõ.
// Nhãn ấy dễ thành cửa sau: một mục thiếu nguồn, hay một toạ độ tự đặt, gắn
// `tam-xa` là trông hợp lệ. Cổng này đòi mỗi mục `phuong_phap_toa_do: "tam-xa"`:
//   · có `nguon[]` không rỗng (điều kiện «đủ nguồn» của quyết định);
//   · `ma_xa` có trong docs/research/tam-xa-2025.json, và xã đó không bị cấm
//     neo (đặc khu quần đảo);
//   · lat/lon TRÙNG điểm của xã đó (±1e-4°) — toạ độ khác là toạ độ tự đặt
//     mang nhãn tâm xã;
//   · `don_vi_neo` có mặt, và chứa tên xã trong bảng.
// Chạy: node scripts/validate_tam_xa.mjs

import { readFileSync, readdirSync } from "node:fs";

const GOC = new URL("..", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const bang = JSON.parse(readFileSync(GOC + "docs/research/tam-xa-2025.json", "utf8"));
const theoMa = new Map(bang.don_vi.map((d) => [d.ma, d]));
const THU_MUC = GOC + "public/data/overlays/";

const loi = [];
let soMuc = 0;
for (const tep of readdirSync(THU_MUC).filter((f) => f.endsWith(".json"))) {
  const d = JSON.parse(readFileSync(THU_MUC + tep, "utf8"));
  for (const m of d.items ?? []) {
    if (m.phuong_phap_toa_do !== "tam-xa") continue;
    soMuc++;
    const ten = `${tep}#${m.id ?? m.ten}`;
    if (!Array.isArray(m.nguon) || !m.nguon.length) loi.push(`${ten}: neo tâm xã nhưng KHÔNG có nguồn nội dung`);
    const xa = theoMa.get(String(m.ma_xa ?? ""));
    if (!xa) {
      loi.push(`${ten}: ma_xa «${m.ma_xa ?? ""}» không có trong bảng tâm xã 2025`);
      continue;
    }
    if (xa.khong_neo) loi.push(`${ten}: ${xa.khong_neo}`);
    if (Math.abs(Number(m.lat) - xa.lat) > 1e-4 || Math.abs(Number(m.lon) - xa.lon) > 1e-4)
      loi.push(`${ten}: toạ độ ${m.lat}, ${m.lon} ≠ tâm ${xa.ten_day_du} (${xa.lat}, ${xa.lon})`);
    if (!m.don_vi_neo || !String(m.don_vi_neo).includes(xa.ten))
      loi.push(`${ten}: don_vi_neo «${m.don_vi_neo ?? ""}» không nêu ${xa.ten_day_du}`);
  }
}

if (loi.length) {
  console.error(`❌ ${loi.length} lỗi neo tâm xã trên ${soMuc} mục:`);
  for (const l of loi.slice(0, 40)) console.error("   " + l);
  process.exit(1);
}
console.log(`✅ ${soMuc} mục neo tâm xã: đủ nguồn, mã xã hợp lệ, toạ độ khớp bảng ${bang.so_don_vi} đơn vị.`);
