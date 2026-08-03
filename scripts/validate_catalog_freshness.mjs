// Cổng chặn "chỉ mục chết": public/data/_index/catalog.json phải khớp CHÍNH XÁC
// với nội dung thật của public/data/**. Không có cổng này, catalog có thể lặng lẽ
// lệch khỏi dữ liệu gốc sau một lần sửa tay — mọi nơi dựa vào catalog (thay vì mở
// lại 98 file gốc, đúng tinh thần PageIndex) sẽ đọc số liệu sai mà không biết.
// Chạy: node scripts/validate_catalog_freshness.mjs
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "public", "data");
const CATALOG_FILE = join(DATA_DIR, "_index", "catalog.json");
const ENTRIES_FILE = join(DATA_DIR, "_index", "entries-index.json");

const LENH_SUA = "node scripts/build_catalog.mjs && node scripts/build_entries_index.mjs";

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

let loi = 0;
const bao = (msg) => {
  console.error(`❌ ${msg}`);
  loi++;
};

if (!existsSync(CATALOG_FILE)) {
  bao(`không thấy public/data/_index/catalog.json — chạy: ${LENH_SUA}`);
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(CATALOG_FILE, "utf8"));
const theoFile = new Map(catalog.files.map((f) => [f.file, f]));

const thucTe = walkDataFiles(DATA_DIR).sort();
const thucTeSet = new Set();

for (const full of thucTe) {
  const relPath = toPosix(relative(DATA_DIR, full));
  thucTeSet.add(relPath);
  const raw = readFileSync(full);
  const sha = createHash("sha256").update(raw).digest("hex");

  const ghiTrongCatalog = theoFile.get(relPath);
  if (!ghiTrongCatalog) {
    bao(`'${relPath}' có trên đĩa nhưng CHƯA có trong catalog.json (file mới) — chạy: ${LENH_SUA}`);
    continue;
  }
  if (ghiTrongCatalog.sha256 !== sha) {
    bao(
      `'${relPath}' đã đổi nội dung sau lần sinh catalog gần nhất ` +
        `(sha256 catalog=${ghiTrongCatalog.sha256.slice(0, 12)}… , thật=${sha.slice(0, 12)}…) — chạy: ${LENH_SUA}`,
    );
  }
  if (ghiTrongCatalog.byte !== raw.length) {
    bao(`'${relPath}' lệch số byte (catalog=${ghiTrongCatalog.byte}, thật=${raw.length}) — chạy: ${LENH_SUA}`);
  }
}

for (const relPath of theoFile.keys()) {
  if (!thucTeSet.has(relPath)) {
    bao(`'${relPath}' có trong catalog.json nhưng KHÔNG còn trên đĩa (file đã xoá/đổi tên) — chạy: ${LENH_SUA}`);
  }
}

// kiểm tra nhẹ: entries-index.json phải cùng "thời" với catalog (không bắt buộc
// tồn tại nếu dự án chưa cần dò trùng, nhưng nếu có thì tổng mục phải khớp —
// khớp tổng là dấu hiệu rẻ tiền nhất cho biết 2 chỉ mục có được sinh cùng lượt).
if (existsSync(ENTRIES_FILE)) {
  const entriesIdx = JSON.parse(readFileSync(ENTRIES_FILE, "utf8"));
  if (entriesIdx.sinh_luc?.tong_muc !== catalog.tong.so_muc) {
    bao(
      `entries-index.json (${entriesIdx.sinh_luc?.tong_muc} mục) và catalog.json ` +
        `(${catalog.tong.so_muc} mục) lệch tổng — hai chỉ mục không cùng lượt sinh, chạy: ${LENH_SUA}`,
    );
  }
}

if (loi) {
  console.error(`\n❌ ${loi} lỗi — catalog.json đã CHẾT (không khớp dữ liệu thật).`);
  process.exit(1);
}
console.log(
  `✅ catalog.json khớp ${catalog.files.length} file / ${catalog.tong.so_muc} mục thật trên đĩa.`,
);
