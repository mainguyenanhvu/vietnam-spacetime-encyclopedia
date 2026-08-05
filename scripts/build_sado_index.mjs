// Sinh public/data/battles/_index.json — danh sách trận ĐÃ CÓ sa đồ diễn biến.
//
// Vì sao có file này: src/battle.ts từng chép cứng `SA_DO_SAN_CO =
// ["bach-dang-938"]`. Một hằng số chép tay như vậy mốc ngay lần thêm sa đồ thứ
// hai — trận mới nằm trong public/data/battles/ nhưng Màn A vẫn dán nhãn
// «○ Chưa có sa đồ» và bấm vào chỉ ra bản rút gọn. Nay thư mục là nguồn sự
// thật duy nhất: thả file JSON vào đó, chạy lại script, xong.
//
// Chạy:  node scripts/build_sado_index.mjs
// Cổng chống mốc: scripts/validate_sado_index.mjs (dựng lại trong bộ nhớ rồi
// so với file trên đĩa) + bước `npm run build` gọi script này trước tsc.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "public", "data", "battles");
export const FILE_CHI_MUC = join(DIR, "_index.json");
export const LENH_SUA = "node scripts/build_sado_index.mjs";

/** File bắt đầu bằng `_` là hạ tầng (chính chỉ mục này), không phải một trận. */
const laHoSoTran = (f) => f.endsWith(".json") && !basename(f).startsWith("_");

/**
 * Dựng nội dung chỉ mục từ thư mục battles/ — KHÔNG ghi đĩa.
 * Trả về chuỗi JSON đã format để cả script sinh lẫn cổng kiểm so đúng một thứ.
 */
export function dungChiMuc() {
  const ids = existsSync(DIR)
    ? readdirSync(DIR)
        .filter(laHoSoTran)
        .map((f) => {
          const b = JSON.parse(readFileSync(join(DIR, f), "utf8"));
          // `id` trong file là nguồn sự thật; tên file chỉ là chỗ chứa. Lệch
          // nhau thì battle.ts fetch theo id sẽ 404 — bắt tại đây cho sớm.
          const tenTep = f.replace(/\.json$/, "");
          if (b.id && b.id !== tenTep)
            throw new Error(`battles/${f}: trường id="${b.id}" lệch tên tệp "${tenTep}"`);
          return b.id ?? tenTep;
        })
        .sort()
    : [];
  return `${JSON.stringify(
    {
      ghi_chu:
        "SINH TỰ ĐỘNG bởi scripts/build_sado_index.mjs — đừng sửa tay. " +
        "Danh sách trận đã có sa đồ diễn biến từng bước trong public/data/battles/.",
      so_luong: ids.length,
      ids,
    },
    null,
    2,
  )}\n`;
}

const laChinh =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (laChinh) {
  const noiDung = dungChiMuc();
  writeFileSync(FILE_CHI_MUC, noiDung, "utf8");
  const { so_luong } = JSON.parse(noiDung);
  console.log(`✅ public/data/battles/_index.json — ${so_luong} trận có sa đồ diễn biến.`);
}
