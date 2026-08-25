// Sinh lớp phủ «Bản đồ cổ» từ bản gốc public/data/media/ban-do-co.json.
//
// VÌ SAO SINH RA CHỨ KHÔNG VIẾT TAY: bản gốc là hồ sơ tư liệu (mô tả dài, ý
// nghĩa chủ quyền, nguồn), còn lớp phủ cần danh sách ĐIỂM phẳng để MapLibre vẽ.
// Viết tay hai nơi là bảo đảm sẽ lệch nhau sau vài lần sửa. Cổng
// validate_media.mjs kiểm tệp sinh ra có khớp bản gốc không, giống cách
// validate_catalog_freshness.mjs canh _index.
//
// GOM THEO ĐỊA ĐIỂM, KHÔNG PHẢI THEO BẢN ĐỒ — quyết định quan trọng nhất của
// tệp này, và nó đến từ việc NHÌN BẢN ĐỒ THẬT chứ không phải suy trên giấy:
// 10 tấm bản đồ cổ cùng gọi tên quần đảo Hoàng Sa, để mỗi tấm một điểm thì 10
// điểm chồng khít lên một toạ độ. `tachDiemTrung` của main.ts chỉ dời ≤~65 m,
// ở mức zoom người ta hay dùng thì vẫn là một chấm — tức 9/10 tấm bấm không tới.
//
// Gom lại còn ~13 điểm, mỗi điểm mang danh sách MỌI bản đồ từng ghi tên nơi
// đó. Vừa hết chồng lấn, vừa nói được điều mạnh hơn hẳn: ở đúng chỗ này, bản
// đồ Việt Nam, bản đồ phương Tây và cả bản đồ Trung Quốc đều ghi tên.
//
// Chạy: node scripts/build_ban_do_co_overlay.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GOC = join(ROOT, "public", "data", "media", "ban-do-co.json");
const RA = join(ROOT, "public", "data", "overlays", "ban-do-co.json");

/** Bỏ phần «(năm)» ở đuôi tên bản đồ để dòng liệt kê khỏi dài gấp đôi. */
const tenNgan = (s) => String(s).replace(/\s*\((?:kho[aả]ng\s*)?\d{3,4}[^)]*\)\s*$/u, "").trim();

/** Bỏ hẳn khoá rỗng: cổng validate_no_html coi `anh: ""` là có mặt và làm đỏ. */
const bo0 = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== "" && v != null));

const HANG = { cao: 3, trung: 2, thap: 1 };

export function dungItems(goc) {
  /** khoá toạ độ → cụm điểm */
  const cum = new Map();
  for (const b of goc.items ?? []) {
    for (const n of b.diem_neo ?? []) {
      const khoa = `${n.lat},${n.lon}`;
      if (!cum.has(khoa)) cum.set(khoa, { ten_nay: n.ten_nay, lat: n.lat, lon: n.lon, ghi: [] });
      cum.get(khoa).ghi.push({
        nam: String(b.nam ?? ""),
        ten_ban_do: tenNgan(b.ten),
        dia_danh_xua: n.ten_xua,
        nhom: b.nhom ?? "",
        ghi_chu: n.ghi_chu ?? "",
        do_tin_cay: n.do_tin_cay ?? "trung",
      });
    }
  }

  const ra = [];
  for (const c of cum.values()) {
    c.ghi.sort((a, b) => (Number(a.nam) || 0) - (Number(b.nam) || 0));
    const nhoms = [...new Set(c.ghi.map((g) => g.nhom))];
    const tenXua = [...new Set(c.ghi.map((g) => g.dia_danh_xua))];
    // Độ tin cậy của ĐIỂM lấy mức TỐT NHẤT trong cụm: chỉ cần một tấm bản đồ
    // khớp chắc chắn là vị trí đã đứng vững. Mức của từng tấm vẫn hiện riêng
    // trong popup nên chỗ yếu không bị giấu đi.
    const tot = c.ghi.reduce((m, g) => Math.max(m, HANG[g.do_tin_cay] ?? 0), 0);
    ra.push(
      bo0({
        ten: c.ten_nay,
        lat: c.lat,
        lon: c.lon,
        dia_danh_xua: tenXua.join(" · "),
        // «nhieu» = nơi được hơn một phía ghi tên (Việt Nam / phương Tây /
        // Trung Quốc). Đó là tín hiệu mạnh nhất của cả vỉa dữ liệu — cho màu riêng.
        nhom_ban_do: nhoms.length > 1 ? "nhieu" : nhoms[0],
        nam: String(c.ghi[0].nam),
        nam_hien_thi:
          c.ghi.length > 1
            ? `${c.ghi[0].nam} – ${c.ghi[c.ghi.length - 1].nam}`
            : String(c.ghi[0].nam),
        mo_ta: `${c.ghi.length} tấm bản đồ cổ ghi tên nơi này, sớm nhất năm ${c.ghi[0].nam}.`,
        ban_do_ghi: c.ghi,
        do_tin_cay_toa_do: Object.keys(HANG).find((k) => HANG[k] === tot) ?? "trung",
      }),
    );
  }
  ra.sort((a, b) => (Number(a.nam) || 0) - (Number(b.nam) || 0) || a.ten.localeCompare(b.ten, "vi"));
  return ra;
}

export function dungTep(goc) {
  return {
    ghi_chu:
      "SINH TỰ ĐỘNG từ media/ban-do-co.json bởi scripts/build_ban_do_co_overlay.mjs — ĐỪNG SỬA TAY, sửa bản gốc rồi chạy lại. " +
      "Mỗi mục là MỘT ĐỊA ĐIỂM có thật ngày nay, mang danh sách mọi bản đồ cổ từng ghi tên nơi đó (ban_do_ghi[]). " +
      "Gom theo địa điểm chứ không theo bản đồ, vì nhiều tấm cùng gọi tên một chỗ — để riêng thì các điểm chồng khít, bấm không tới.",
    ngay_cap_nhat: goc.ngay_cap_nhat,
    sources: goc.sources,
    items: dungItems(goc),
  };
}

// So sánh qua pathToFileURL: trên Windows nối chuỗi "file://" + đường dẫn ổ
// đĩa cho ra file://D:/... thiếu một gạch so với file:///D:/... của import.meta.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const goc = JSON.parse(readFileSync(GOC, "utf8"));
  const tep = dungTep(goc);
  writeFileSync(RA, JSON.stringify(tep, null, 2) + "\n", "utf8");
  const neo = tep.items.reduce((n, i) => n + i.ban_do_ghi.length, 0);
  console.log(
    `✅ overlays/ban-do-co.json: ${tep.items.length} địa điểm · ${neo} điểm neo từ ${goc.items.length} bản đồ`,
  );
}
