// Dựng lớp «VÙNG đơn vị hành chính xưa» — public/data/geo/vung-don-vi-xua.geojson
//
// 🔴 ĐỌC KỸ TRƯỚC KHI SỬA — đây là chỗ dễ biến thành thứ dự án đã cố ý gỡ bỏ.
//
// Tệp sinh ra KHÔNG phải đường biên xưa. Hình học lấy nguyên từ ranh giới 63
// tỉnh NGÀY NAY (vn-63-tinh-truoc-2025.geojson). Lời khẳng định duy nhất là:
// «đơn vị hành chính xưa này phủ lên đất của những tỉnh nay đó» — một câu có
// trong văn tịch, khác hẳn với «đường biên của nó chạy thế này» là câu chính
// sử KHÔNG chép.
//
// Vì sao vẫn đáng làm: 13 chấm ở lỵ sở không cho người đọc thấy Đại Việt năm
// 1490 dừng ở đâu. Tô lên tỉnh ngày nay thì thấy — mà không bịa một mét đường
// biên nào, vì mọi đường vẽ ra đều là đường có thật của hôm nay.
//
// Cùng lối với lớp «Pháp thuộc 1887–1945» sẵn có: tệp đó cũng là 63 tỉnh ngày
// nay, gắn thêm thuộc tính `ky` (Bắc Kỳ / Trung Kỳ / Nam Kỳ) rồi tô theo.
//
// Chạy: node scripts/build_vung_don_vi_xua.mjs   (đã nằm trong npm run build:index)
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DON_VI = join(ROOT, "public", "data", "geo", "don-vi-hanh-chinh-xua.json");
const TINH_63 = join(ROOT, "public", "data", "boundaries", "vn-63-tinh-truoc-2025.geojson");
const RA = join(ROOT, "public", "data", "geo", "vung-don-vi-xua.geojson");

/**
 * Khoá đối chiếu tên tỉnh.
 *
 * Bỏ dấu là CỐ Ý: kho dữ liệu viết «Thanh Hoá» chỗ này, «Thanh Hóa» chỗ kia —
 * hai cách đặt dấu của cùng một tên. So chuỗi thô thì hai cách đó thành hai
 * tỉnh khác nhau. Đã kiểm: bỏ dấu xong 63 tên vẫn phân biệt được hết.
 */
export const khoaTinh = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export function dungVung() {
  const dv = JSON.parse(readFileSync(DON_VI, "utf8"));
  const gj = JSON.parse(readFileSync(TINH_63, "utf8"));

  // Một tỉnh có thể là nhiều feature (đảo tách rời) → gom theo khoá.
  const theoTinh = new Map();
  for (const f of gj.features) {
    const ten = f.properties?.["Tỉnh thành cũ"];
    if (!ten) continue; // feature đảo/quần đảo không mang tên tỉnh
    const k = khoaTinh(ten);
    if (!theoTinh.has(k)) theoTinh.set(k, []);
    theoTinh.get(k).push(f);
  }

  const features = [];
  const loi = [];
  let soDonVi = 0;
  for (const it of dv.items ?? []) {
    if (!Array.isArray(it.tinh_nay) || !it.tinh_nay.length) continue;
    if (!Array.isArray(it.nguon_anh_xa) || !it.nguon_anh_xa.length) {
      // Cổng cứng: ánh xạ không nguồn thì KHÔNG được vẽ. Đây đúng là loại
      // khẳng định địa lý mà bất biến #3 sinh ra để chặn.
      loi.push(`${it.id}: có tinh_nay[] nhưng thiếu nguon_anh_xa[]`);
      continue;
    }
    soDonVi++;
    for (const ten of it.tinh_nay) {
      const ds = theoTinh.get(khoaTinh(ten));
      if (!ds) {
        loi.push(`${it.id}: tên tỉnh "${ten}" không có trong vn-63-tinh-truoc-2025.geojson`);
        continue;
      }
      for (const f of ds) {
        features.push({
          type: "Feature",
          properties: {
            ky_id: it.ky_id,
            don_vi_id: it.id,
            don_vi_ten: it.ten,
            cap: it.cap,
            khop: it.khop ?? "",
            tinh_63: f.properties["Tỉnh thành cũ"],
          },
          geometry: f.geometry,
        });
      }
    }
  }

  if (loi.length) {
    for (const l of loi) console.error(`❌ ${l}`);
    throw new Error(`${loi.length} lỗi ánh xạ — xem trên`);
  }

  return {
    type: "FeatureCollection",
    ghi_chu:
      "TỆP SINH RA, đừng sửa tay — chạy scripts/build_vung_don_vi_xua.mjs. " +
      "🔴 KHÔNG PHẢI ĐƯỜNG BIÊN XƯA: hình học là ranh giới 63 tỉnh NGÀY NAY, " +
      "chỉ được gắn thêm nhãn đơn vị hành chính xưa phủ lên đất đó. Phạm vi " +
      "và nguồn của từng ánh xạ nằm ở public/data/geo/don-vi-hanh-chinh-xua.json " +
      "(trường tinh_nay / khop / nguon_anh_xa).",
    features,
    so_don_vi: soDonVi,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const g = dungVung();
  writeFileSync(RA, JSON.stringify(g) + "\n", "utf8");
  const theoKy = {};
  for (const f of g.features) theoKy[f.properties.ky_id] = (theoKy[f.properties.ky_id] ?? 0) + 1;
  console.log(
    `✅ vung-don-vi-xua.geojson — ${g.so_don_vi} đơn vị đã tra được nguồn, ${g.features.length} mảnh tỉnh ` +
      `(${Object.entries(theoKy).map(([k, n]) => `${k}:${n}`).join(" · ")})`,
  );
}
