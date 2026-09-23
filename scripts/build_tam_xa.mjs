// Sinh bảng TÂM XÃ 2025 — một điểm đại diện cho mỗi đơn vị cấp xã sau sắp
// xếp (hiệu lực 1/7/2025), dùng để neo di tích đủ nguồn mà thiếu toạ độ.
//
// Vì sao có bảng này: chủ dự án duyệt 2026-09-23 cho đặt mục như vậy ở tâm
// xã/phường, BẮT BUỘC kèm nhãn gần đúng (`phuong_phap_toa_do: "tam-xa"`, xem
// overlays-config.ts). Neo tâm HUYỆN vẫn cấm.
//
// Nguồn (ghi nguyên vào tệp sinh ra):
//   · hình học: Bản đồ tra cứu đơn vị hành chính Việt Nam — NXB Tài nguyên
//     Môi trường và Bản đồ Việt Nam, Bộ Nông nghiệp và Môi trường
//     (sapnhap.bando.com.vn), lớp `diaphanhanhchinhcapxa_2025`;
//   · mã/tên: QĐ 19/2025/QĐ-TTg, qua API danh mục hành chính của Cục Thống kê;
//   · đóng gói: github.com/thanglequoc/vietnamese-provinces-database (MIT).
//
// «Điểm đại diện» chứ không phải trọng tâm trần: trọng tâm của xã hình lõm có
// thể rơi RA NGOÀI xã, tức đặt di tích sang xã bên cạnh. Trọng tâm nằm trong
// thì dùng; không thì lấy trung điểm đoạn cắt ngang dài nhất qua vĩ độ trọng
// tâm — luôn nằm trong đa giác.
//
// Chạy: node scripts/build_tam_xa.mjs <tệp-ra.json> [thư-mục-đệm]
// Thư mục đệm giữ ~500 MB GeoJSON gốc — để NGOÀI repo.

import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const RA = process.argv[2];
const DEM = process.argv[3] ?? path.join(process.env.TEMP ?? "/tmp", "tam-xa-cache");
if (!RA) {
  console.error("Dùng: node scripts/build_tam_xa.mjs <tệp-ra.json> [thư-mục-đệm]");
  process.exit(2);
}
const KHO = "thanglequoc/vietnamese-provinces-database";
const API = `https://api.github.com/repos/${KHO}/contents/json/geojson`;
const UA = { "User-Agent": "vietnam-encyclopedia-build-tam-xa" };
mkdirSync(DEM, { recursive: true });

async function layJson(url, tep) {
  if (tep && existsSync(tep)) return JSON.parse(readFileSync(tep, "utf8"));
  for (let lan = 1; ; lan++) {
    const r = await fetch(url, { headers: UA });
    if (r.ok) {
      const s = await r.text();
      if (tep) writeFileSync(tep, s);
      return JSON.parse(s);
    }
    if (lan >= 4) throw new Error(`${r.status} ${url}`);
    await new Promise((res) => setTimeout(res, 2000 * lan));
  }
}

// ── Hình học phẳng trên kinh/vĩ độ. Sai lệch do chiếu bỏ qua được ở cỡ một xã.
const vongCuaHinh = (g) => (g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : []);

function trongTamVong(vong) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, j = vong.length - 1; i < vong.length; j = i++) {
    const [x0, y0] = vong[j], [x1, y1] = vong[i];
    const k = x0 * y1 - x1 * y0;
    a += k; cx += (x0 + x1) * k; cy += (y0 + y1) * k;
  }
  return { a: a / 2, x: cx / (3 * a), y: cy / (3 * a) };
}

function trongDaGiac(x, y, daGiac) {
  // daGiac = [vòng ngoài, ...lỗ]; chẵn-lẻ trên mọi vòng xử lý đúng cả lỗ.
  let trong = false;
  for (const vong of daGiac)
    for (let i = 0, j = vong.length - 1; i < vong.length; j = i++) {
      const [xi, yi] = vong[i], [xj, yj] = vong[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) trong = !trong;
    }
  return trong;
}

function diemDaiDien(geom) {
  const cacDaGiac = vongCuaHinh(geom);
  // Đa giác lớn nhất (theo vòng ngoài) quyết định — đảo nhỏ ven bờ không kéo lệch tâm.
  let lon = null;
  for (const dg of cacDaGiac) {
    const t = trongTamVong(dg[0]);
    if (!lon || Math.abs(t.a) > Math.abs(lon.t.a)) lon = { dg, t };
  }
  if (!lon) return null;
  const { dg, t } = lon;
  if (trongDaGiac(t.x, t.y, dg)) return { lon: t.x, lat: t.y, cach: "trong-tam" };
  // Đoạn cắt ngang dài nhất tại vĩ độ trọng tâm.
  const cat = [];
  for (const vong of dg)
    for (let i = 0, j = vong.length - 1; i < vong.length; j = i++) {
      const [xi, yi] = vong[i], [xj, yj] = vong[j];
      if (yi > t.y !== yj > t.y) cat.push(((xj - xi) * (t.y - yi)) / (yj - yi) + xi);
    }
  cat.sort((p, q) => p - q);
  let tot = null;
  for (let i = 0; i + 1 < cat.length; i += 2)
    if (!tot || cat[i + 1] - cat[i] > tot[1] - tot[0]) tot = [cat[i], cat[i + 1]];
  if (!tot) return null;
  return { lon: (tot[0] + tot[1]) / 2, lat: t.y, cach: "doan-cat-ngang" };
}

// Đặc khu QUẦN ĐẢO: «tâm» là khái niệm vô nghĩa với vài chục đảo rải trên
// hàng trăm km. Đo 2026-09-23: điểm đại diện của Trường Sa rơi vào vùng bãi Tư
// Chính (7,49°N 109,61°E) — trong đặc khu nhưng không phải quần đảo. Mục ở đây
// phải dùng toạ độ đảo cụ thể; cổng validate_tam_xa chặn neo tâm.
const KHONG_NEO = {
  "20333": "Đặc khu Hoàng Sa là quần đảo — dùng toạ độ đảo cụ thể, không neo tâm",
  "22736": "Đặc khu Trường Sa là quần đảo — dùng toạ độ đảo cụ thể, không neo tâm",
};

const tinh = (await layJson(API, path.join(DEM, "_tinh.json"))).filter((x) => x.type === "dir");
const ra = [];
const loi = [];
for (const t of tinh) {
  const ds = await layJson(`${API}/${t.name}/wards`, path.join(DEM, `_${t.name}.json`));
  const tepXa = ds.filter((f) => f.name.endsWith(".geojson"));
  const hang = [...tepXa];
  const lam = async () => {
    for (let f = hang.shift(); f; f = hang.shift()) {
      try {
        const g = await layJson(f.download_url, path.join(DEM, `${t.name}__${f.name}`));
        const ft = g.type === "FeatureCollection" ? g.features[0] : g;
        const p = ft.properties ?? {};
        const d = diemDaiDien(ft.geometry);
        if (!d) throw new Error("không có hình học");
        const dt = Number(p.areaKm2) || null;
        ra.push({
          ma: String(p.code),
          ten: p.name,
          ten_day_du: p.fullName,
          ma_tinh: t.name.slice(0, 2),
          lon: Math.round(d.lon * 1e5) / 1e5,
          lat: Math.round(d.lat * 1e5) / 1e5,
          cach: d.cach,
          dien_tich_km2: dt,
          // Bán kính hình tròn cùng diện tích — thước đo sai số khi neo tâm.
          ban_kinh_km: dt ? Math.round(Math.sqrt(dt / Math.PI) * 10) / 10 : null,
          ...(KHONG_NEO[String(p.code)] ? { khong_neo: KHONG_NEO[String(p.code)] } : {}),
        });
      } catch (e) {
        loi.push(`${t.name}/${f.name}: ${e.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: 8 }, lam));
  console.log(`${t.name}: ${tepXa.length} tệp`);
}
ra.sort((a, b) => a.ma.localeCompare(b.ma));
writeFileSync(
  RA,
  JSON.stringify(
    {
      ghi_chu:
        "SINH TỰ ĐỘNG bởi scripts/build_tam_xa.mjs — đừng sửa tay. Một điểm đại diện NẰM TRONG mỗi đơn vị cấp xã 2025; chỉ dùng cho mục đã đủ nguồn nội dung, kèm phuong_phap_toa_do: tam-xa.",
      nguon: [
        "Bản đồ tra cứu đơn vị hành chính Việt Nam — NXB Tài nguyên Môi trường và Bản đồ Việt Nam, Bộ Nông nghiệp và Môi trường — https://sapnhap.bando.com.vn",
        "Mã và danh mục đơn vị hành chính: Quyết định 19/2025/QĐ-TTg — https://www.nso.gov.vn/default/2025/07/quyet-dinh-ban-hanh-bang-danh-muc-va-ma-so-cac-don-vi-hanh-chinh-viet-nam/",
        "Đóng gói GeoJSON (MIT): https://github.com/thanglequoc/vietnamese-provinces-database",
      ],
      ngay_sinh: new Date().toISOString().slice(0, 10),
      so_don_vi: ra.length,
      don_vi: ra,
    },
    null,
    0,
  ),
);
console.log(`\n${ra.length} đơn vị · ${loi.length} lỗi → ${RA}`);
for (const l of loi.slice(0, 20)) console.log("  ❌", l);
process.exit(loi.length ? 1 : 0);
