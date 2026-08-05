// Cổng chặn chỉ mục sa đồ mốc: public/data/battles/_index.json phải khớp
// CHÍNH XÁC nội dung thư mục battles/. Lệch = Màn A dán sai nhãn «có/chưa có
// sa đồ», đúng cái lỗi mà việc bỏ hằng số chép cứng SA_DO_SAN_CO sinh ra để
// diệt. Dựng lại trong bộ nhớ rồi so chuỗi — cùng một hàm với script sinh,
// nên không có đường nào để hai bên hiểu khác nhau.
// Chạy: node scripts/validate_sado_index.mjs
import { readFileSync, existsSync } from "node:fs";
import { dungChiMuc, FILE_CHI_MUC, LENH_SUA } from "./build_sado_index.mjs";

if (!existsSync(FILE_CHI_MUC)) {
  console.error(`❌ thiếu public/data/battles/_index.json — chạy: ${LENH_SUA}`);
  process.exit(1);
}

let mongDoi;
try {
  mongDoi = dungChiMuc();
} catch (e) {
  console.error(`❌ không dựng được chỉ mục sa đồ: ${e.message}`);
  process.exit(1);
}

const thucTe = readFileSync(FILE_CHI_MUC, "utf8");
if (thucTe !== mongDoi) {
  const idsThat = JSON.parse(mongDoi).ids;
  let idsCu = [];
  try {
    idsCu = JSON.parse(thucTe).ids ?? [];
  } catch {
    console.error("❌ _index.json không phải JSON hợp lệ.");
  }
  const thieu = idsThat.filter((i) => !idsCu.includes(i));
  const thua = idsCu.filter((i) => !idsThat.includes(i));
  console.error(`❌ public/data/battles/_index.json đã MỐC — chạy: ${LENH_SUA}`);
  if (thieu.length) console.error(`   có file nhưng thiếu trong chỉ mục: ${thieu.join(", ")}`);
  if (thua.length) console.error(`   có trong chỉ mục nhưng mất file: ${thua.join(", ")}`);
  if (!thieu.length && !thua.length) console.error("   danh sách id trùng nhưng nội dung khác");
  process.exit(1);
}

console.log(`✅ chỉ mục sa đồ khớp ${JSON.parse(thucTe).so_luong} trận thật trong battles/.`);
