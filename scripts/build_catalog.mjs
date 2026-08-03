// Sinh public/data/_index/catalog.json — chỉ mục tĩnh mô tả TỪNG FILE dữ liệu
// dưới public/data/**. Mô hình PageIndex: đọc catalog trước (nhẹ, tổng quan),
// chỉ mở file gốc khi cần chi tiết mục.
//
// VÌ SAO CÓ BẢNG CẤU HÌNH THỦ CÔNG BÊN DƯỚI: cấu trúc bọc-ngoài của 98 file dữ
// liệu KHÔNG đồng nhất (items[] / 1-bản-ghi-mỗi-file / FeatureCollection / 4
// mảng song song / tên trường mảng khác nhau tuỳ file — lien_ket, events,
// moc, chapters…). Heuristic "cứ lấy mảng dài nhất trong file" đã từng đoán
// sai 37/98 file ở lần kiểm kê trước, nên ở đây khai báo TAY từng ngoại lệ đã
// xác minh bằng mắt thay vì đoán lại.
// Chạy: node scripts/build_catalog.mjs
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname, relative, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "public", "data");
const OUT_DIR = join(DATA_DIR, "_index");
const OUT_FILE = join(OUT_DIR, "catalog.json");

// wrap mặc định theo miền (tên thư mục cấp 1 dưới public/data/).
// 'record'  = ban-ghi-don (nguyên file là 1 bản ghi, không có mảng bọc ngoài).
// chuỗi khác = tên trường mảng chứa các mục.
export const DOMAIN_DEFAULT_WRAP = {
  overlays: "items",
  literature: "items",
  provinces: "record",
  battles: "record",
  games: "items",
  streets: "lien_ket",
  timeline: "items",
  documentaries: "items",
  media: "items",
  figures: "items",
  geo: "features",
  boundaries: "features",
  journey: "items",
  story: "chapters",
};

// override theo từng file cụ thể (đường dẫn tính từ public/data/, luôn dùng '/').
// mảng ['a','b',...] = mang-song-song, so_muc = tổng độ dài các mảng liệt kê.
export const WRAP_OVERRIDES = {
  "literature/lich-su-nuoc-ta.json": "record",
  "games/olympia-questions.json": ["khoi_dong", "vcnv", "tang_toc", "ve_dich"],
  // ghi_chu của file: "...theo tỉnh". quoc_gia (6 mục cấp quốc gia, không gắn
  // tỉnh) là mảng phụ trợ — CỐ Ý không tính vào so_muc. Tính cả 2 mảng sẽ ra
  // 127 thay vì 121 đã kiểm kê (và tổng toàn kho lệch 4531 → 4537). Không mất
  // dữ liệu: quoc_gia vẫn có mặt trong file gốc, chỉ không nằm trong so_muc.
  "documentaries/phim-tai-lieu.json": "danh_nhan",
  "timeline/events.json": "events",
  "journey/nam-tien.json": "moc",
};

export function getWrap(relPath, mien) {
  return WRAP_OVERRIDES[relPath] ?? DOMAIN_DEFAULT_WRAP[mien];
}

export function kieuBocNgoai(wrap, mien) {
  if (wrap === "record") return "ban-ghi-don";
  if (Array.isArray(wrap)) return "mang-song-song";
  if (mien === "geo" || mien === "boundaries") return "FeatureCollection";
  return `${wrap}[]`;
}

export function getItems(json, wrap) {
  if (wrap === "record") return [json];
  if (Array.isArray(wrap)) return wrap.flatMap((f) => (Array.isArray(json[f]) ? json[f] : []));
  return Array.isArray(json[wrap]) ? json[wrap] : [];
}

// trường chứa nguồn cấp mục nằm trong properties đối với feature GeoJSON,
// nằm ngay trên bản thân mục đối với mọi kiểu bọc-ngoài khác.
function sourceHost(item, wrap) {
  if (wrap === "features") return item?.properties ?? {};
  return item && typeof item === "object" ? item : {};
}

const FILE_SOURCE_CANDIDATES = ["sources", "nguon_chinh", "nguon_tong", "nguon"];
const ITEM_SOURCE_CANDIDATES = ["nguon", "sources"];

function detectFileSource(json) {
  for (const key of FILE_SOURCE_CANDIDATES) if (key in json) return key;
  return null;
}

function detectItemSource(items, wrap) {
  if (!items.length) return null;
  const counts = { nguon: 0, sources: 0 };
  for (const it of items) {
    const host = sourceHost(it, wrap);
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

function nonEmpty(v) {
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "string") return v.trim().length > 0;
  if (v && typeof v === "object") return Object.keys(v).length > 0;
  return Boolean(v);
}

function computePct(items, wrap, field) {
  if (!field || !items.length) return 0;
  let has = 0;
  for (const it of items) if (nonEmpty(sourceHost(it, wrap)[field])) has++;
  return Math.round((has / items.length) * 1000) / 10;
}

function commonFields(items, wrap, cap = 15, threshold = 0.5) {
  if (!items.length) return [];
  const counts = new Map();
  for (const it of items) {
    const host = sourceHost(it, wrap);
    for (const k of Object.keys(host)) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const n = items.length;
  return [...counts.entries()]
    .filter(([, c]) => c / n >= threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, cap)
    .map(([k]) => k);
}

function firstSentence(text) {
  const m = text.match(/^.*?[.!?](?=\s|$)/);
  return (m ? m[0] : text).trim();
}

function genMoTa(json, mien, fileBase) {
  if (typeof json.ghi_chu === "string" && json.ghi_chu.trim()) {
    return firstSentence(json.ghi_chu.trim());
  }
  return `Dữ liệu miền «${mien}» — tệp ${fileBase}.`;
}

function walkDataFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "_index") continue; // đầu ra sinh ra, không phải dữ liệu nguồn
      out.push(...walkDataFiles(full));
    } else if (extname(name) === ".json" || extname(name) === ".geojson") {
      out.push(full);
    }
  }
  return out;
}

// path.relative trả về separator theo OS (Windows dùng '\'); chuẩn hoá về '/'
// để catalog ổn định bất kể máy build là Windows hay Linux (CI).
function toPosix(p) {
  return p.split("\\").join("/");
}

function main() {
  const absFiles = walkDataFiles(DATA_DIR).sort();
  const entries = [];
  let tongMuc = 0;
  let tongByte = 0;

  for (const full of absFiles) {
    const relPath = toPosix(relative(DATA_DIR, full));
    const mien = relPath.split("/")[0];
    const fileBase = basename(relPath, extname(relPath));
    const raw = readFileSync(full); // Buffer — hash + byte tính trên bytes gốc
    tongByte += raw.length;

    let json;
    try {
      json = JSON.parse(raw.toString("utf8"));
    } catch (e) {
      throw new Error(`Lỗi parse JSON tại ${relPath}: ${e.message}`);
    }

    const wrap = getWrap(relPath, mien);
    if (wrap === undefined) {
      throw new Error(
        `Không rõ cấu trúc bọc-ngoài cho '${relPath}' (miền '${mien}' chưa có mặc định, ` +
          `chưa có override) — thêm vào DOMAIN_DEFAULT_WRAP hoặc WRAP_OVERRIDES rồi chạy lại.`,
      );
    }
    const items = getItems(json, wrap);
    const soMuc = items.length;
    tongMuc += soMuc;

    const truongNguonCapFile = wrap === "record" ? null : detectFileSource(json);
    const truongNguonCapMuc =
      wrap === "record" ? detectFileSource(json) : detectItemSource(items, wrap);

    entries.push({
      file: relPath,
      mien,
      so_muc: soMuc,
      byte: raw.length,
      kieu_boc_ngoai: kieuBocNgoai(wrap, mien),
      truong_nguon_cap_muc: truongNguonCapMuc,
      truong_nguon_cap_file: truongNguonCapFile,
      phu_nguon_cap_muc_pct: computePct(items, wrap, truongNguonCapMuc),
      truong_pho_bien: commonFields(items, wrap),
      sha256: createHash("sha256").update(raw).digest("hex"),
      mo_ta: genMoTa(json, mien, fileBase),
    });
  }

  const catalog = {
    tong: {
      so_file: entries.length,
      so_muc: tongMuc,
      so_byte: tongByte,
      ngay_sinh: new Date().toISOString().slice(0, 10),
    },
    files: entries,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(catalog, null, 2) + "\n", "utf8");

  console.log(`✅ catalog.json: ${entries.length} file, ${tongMuc} mục, ${tongByte} byte`);
  console.log(`   ghi ra ${relative(ROOT, OUT_FILE)}`);
}

// Chỉ tự chạy khi gọi trực tiếp (không chạy khi file này bị import làm cấu hình
// dùng chung — build_entries_index.mjs cần đọc lại DOMAIN_DEFAULT_WRAP/WRAP_OVERRIDES).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
