// Sinh public/data/_index/entries-index.json — mảng PHẲNG mọi mục có định danh
// trong public/data/**, dùng để dò trùng tên/toạ độ xuyên miền. Mô hình
// PageIndex: đây là "chỉ mục mục", nhẹ hơn nhiều so với mở lại 98 file gốc.
//
// Dùng lại đúng bảng cấu hình bọc-ngoài (DOMAIN_DEFAULT_WRAP/WRAP_OVERRIDES)
// từ build_catalog.mjs thay vì chép lại — một nguồn sự thật duy nhất cho việc
// "mục nằm ở đâu trong file", tránh 2 script lệch nhau khi có file dữ liệu mới.
// Chạy: node scripts/build_entries_index.mjs
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { getWrap, getItems } from "./build_catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "public", "data");
const OUT_DIR = join(DATA_DIR, "_index");
const OUT_FILE = join(OUT_DIR, "entries-index.json");

const NGUONG_KHOANG_CACH_M = 200;

function toPosix(p) {
  return p.split("\\").join("/");
}

function walkDataFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "_index") continue;
      out.push(...walkDataFiles(full));
    } else if (extname(name) === ".json" || extname(name) === ".geojson") {
      out.push(full);
    }
  }
  return out;
}

// bỏ dấu tiếng Việt, hạ chữ thường, bỏ dấu câu, gọn khoảng trắng — dùng để so
// khớp tên gần-trùng xuyên miền (không nhằm hiển thị).
function chuanHoaTen(ten) {
  if (typeof ten !== "string" || !ten.trim()) return null;
  return ten
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const TEN_CANDIDATES = [
  "ten",
  "tieu_de",
  "title",
  "nien_hieu",
  "vua",
  "trieu_dai",
  "hang_ngang",
  "cau_hoi",
  "tu_khoa",
  "chu_de",
];

function suyRaTen(host) {
  for (const k of TEN_CANDIDATES) {
    const v = host[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function suyRaLoai(host, wrap, wrapFieldCuaMangSongSong) {
  if (typeof host.loai === "string" && host.loai.trim()) return host.loai;
  // mang-song-song (vd games): tên trường mảng (khoi_dong/vcnv/...) LÀ nhãn
  // thể loại thật trong dữ liệu, không phải suy đoán/bịa thêm.
  if (Array.isArray(wrap) && wrapFieldCuaMangSongSong) return wrapFieldCuaMangSongSong;
  return null;
}

// toạ độ: chỉ lấy khi CHẮC CHẮN — lat/lon vô hướng ngay trên mục, hoặc geometry
// kiểu Point. LineString/Polygon (sông, ranh giới tỉnh...) CỐ Ý bỏ qua vì tính
// tâm chính xác đòi hỏi thuật toán riêng, ngoài phạm vi việc này — thà để
// null còn hơn suy ra một toạ độ có thể sai.
function suyRaToaDo(host, wrap, item) {
  if (typeof host.lat === "number" && typeof host.lon === "number") {
    return [host.lat, host.lon];
  }
  if (wrap === "features" && item?.geometry?.type === "Point") {
    const c = item.geometry.coordinates;
    if (Array.isArray(c) && typeof c[0] === "number" && typeof c[1] === "number") {
      return [c[1], c[0]]; // GeoJSON: [lon, lat] → đổi thành [lat, lon]
    }
  }
  return [null, null];
}

function demSoNguon(host, field) {
  if (!field) return 0;
  const v = host[field];
  if (Array.isArray(v)) return v.length;
  if (typeof v === "string") return v.trim() ? 1 : 0;
  if (v && typeof v === "object") return Object.keys(v).length;
  return 0;
}

const ITEM_SOURCE_CANDIDATES = ["nguon", "sources"];
function detectItemSourceField(items, wrap) {
  const counts = { nguon: 0, sources: 0 };
  for (const it of items) {
    const host = wrap === "features" ? (it?.properties ?? {}) : (it ?? {});
    for (const cand of ITEM_SOURCE_CANDIDATES) if (cand in host) counts[cand]++;
  }
  let best = null;
  let bestCount = 0;
  for (const cand of ITEM_SOURCE_CANDIDATES) {
    if (counts[cand] > bestCount) {
      best = cand;
      bestCount = counts[cand];
    }
  }
  return best;
}

function haversineMet(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function main() {
  const absFiles = walkDataFiles(DATA_DIR).sort();
  const entries = [];

  for (const full of absFiles) {
    const relPath = toPosix(relative(DATA_DIR, full));
    const mien = relPath.split("/")[0];
    const json = JSON.parse(readFileSync(full, "utf8"));

    const wrap = getWrap(relPath, mien);
    const items = getItems(json, wrap);
    const truongNguon = wrap === "record" ? null : detectItemSourceField(items, wrap);
    // ban-ghi-don: nguồn của "mục" chính là nguồn cấp file (record == file == mục).
    const truongNguonBanGhiDon =
      wrap === "record" ? (json.sources ? "sources" : json.nguon ? "nguon" : null) : null;

    // với mang-song-song, biết mục đến từ trường nào (để dùng làm 'loai').
    const wrapFields = Array.isArray(wrap) ? wrap : null;
    let wrapFieldTheoMuc = [];
    if (wrapFields) {
      for (const f of wrapFields) {
        const arr = Array.isArray(json[f]) ? json[f] : [];
        for (let i = 0; i < arr.length; i++) wrapFieldTheoMuc.push(f);
      }
    }

    items.forEach((item, idx) => {
      const host = wrap === "features" ? (item?.properties ?? {}) : (item ?? {});
      const field = wrap === "record" ? truongNguonBanGhiDon : truongNguon;
      const ten = suyRaTen(host);
      const [lat, lon] = suyRaToaDo(host, wrap, item);
      entries.push({
        id: typeof host.id === "string" || typeof host.id === "number" ? host.id : null,
        slug: typeof host.slug === "string" ? host.slug : null,
        ten,
        ten_chuan: chuanHoaTen(ten),
        file: relPath,
        mien,
        loai: suyRaLoai(host, wrap, wrapFieldTheoMuc[idx]),
        lat,
        lon,
        so_nguon: demSoNguon(host, field),
        trang_thai: typeof host.trang_thai === "string" ? host.trang_thai : null,
      });
    });
  }

  // --- trung_ten[]: nhóm ten_chuan trùng, trải trên ≥2 file khác nhau ---
  const theoTenChuan = new Map();
  for (const e of entries) {
    if (!e.ten_chuan) continue;
    if (!theoTenChuan.has(e.ten_chuan)) theoTenChuan.set(e.ten_chuan, []);
    theoTenChuan.get(e.ten_chuan).push(e);
  }
  const trungTen = [];
  for (const [tenChuan, list] of theoTenChuan) {
    const fileSet = new Set(list.map((e) => e.file));
    if (fileSet.size < 2) continue;
    trungTen.push({
      ten_chuan: tenChuan,
      so_file: fileSet.size,
      files: [...fileSet].sort(),
      muc: list.map((e) => ({ file: e.file, id: e.id, ten: e.ten })),
    });
  }
  trungTen.sort((a, b) => b.so_file - a.so_file || a.ten_chuan.localeCompare(b.ten_chuan));

  // --- trung_toa_do[]: cặp mục khác file, cách nhau < 200m (haversine) ---
  // lọc thô bằng hộp bao (chênh lệch vĩ độ quy ra mét) trước khi tính haversine
  // đầy đủ — 1 độ vĩ độ ≈ 111 320 m, việc này cắt bớt phần lớn phép so sánh
  // toàn cục O(n²) mà không cần lưới không gian phức tạp hơn.
  const coToaDo = entries.filter((e) => typeof e.lat === "number" && typeof e.lon === "number");
  const trungToaDo = [];
  const NGUONG_DO_VI = NGUONG_KHOANG_CACH_M / 111320;
  for (let i = 0; i < coToaDo.length; i++) {
    const a = coToaDo[i];
    for (let j = i + 1; j < coToaDo.length; j++) {
      const b = coToaDo[j];
      if (a.file === b.file) continue;
      if (Math.abs(a.lat - b.lat) > NGUONG_DO_VI) continue;
      const d = haversineMet(a.lat, a.lon, b.lat, b.lon);
      if (d < NGUONG_KHOANG_CACH_M) {
        trungToaDo.push({
          a: { file: a.file, id: a.id, ten: a.ten },
          b: { file: b.file, id: b.id, ten: b.ten },
          khoang_cach_m: Math.round(d),
        });
      }
    }
  }
  trungToaDo.sort((a, b) => a.khoang_cach_m - b.khoang_cach_m);

  const out = {
    sinh_luc: {
      tong_muc: entries.length,
      tong_co_toa_do: coToaDo.length,
      so_nhom_trung_ten: trungTen.length,
      so_cap_trung_toa_do: trungToaDo.length,
      ngay_sinh: new Date().toISOString().slice(0, 10),
    },
    entries,
    trung_ten: trungTen,
    trung_toa_do: trungToaDo,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + "\n", "utf8");

  console.log(
    `✅ entries-index.json: ${entries.length} mục, ${coToaDo.length} có toạ độ, ` +
      `${trungTen.length} nhóm trung_ten, ${trungToaDo.length} cặp trung_toa_do (<${NGUONG_KHOANG_CACH_M}m)`,
  );
  console.log(`   ghi ra ${relative(ROOT, OUT_FILE)}`);
}

main();
