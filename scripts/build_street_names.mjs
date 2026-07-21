// Build PILOT cho "tên đường/phố đặt theo danh nhân" — Phương án A (bảng liên kết +
// centroid đại diện, xem docs/street-names-model-proposal.md). Chạy OFFLINE, không gọi
// Overpass ở runtime app. Idempotent: chạy lại sẽ fetch lại Overpass và ghi đè file kết quả.
//
// Cách chạy: node scripts/build_street_names.mjs
//
// Luồng xử lý:
//   1. Quét toàn bộ public/data/overlays/*.json, loại các file KHÔNG phải danh nhân
//      (địa danh/di tích/sự kiện/lễ hội/làng nghề — xem EXCLUDE_FILES), trích tên +
//      chuẩn hoá thành ứng viên "tên có thể dùng làm tên đường".
//   2. Với mỗi thành phố pilot, gọi Overpass 1 lần lấy TẤT CẢ đường có tên trong bbox
//      trung tâm (out tags center — nhẹ, không lấy hình học đầy đủ), gộp theo tên.
//   3. Khớp CHẮC: so khớp đầy đủ (không phải substring) giữa tên đường OSM và ứng viên
//      danh nhân đã chuẩn hoá; bỏ qua ứng viên bị đụng tên giữa ≥2 danh nhân khác nhau
//      (tránh khớp mơ hồ).
//   4. Xuất public/data/streets/danh-nhan-duong-pilot.json kèm attribution ODbL.
//
// Giấy phép dữ liệu Overpass/OSM: © OpenStreetMap contributors, ODbL —
// https://www.openstreetmap.org/copyright — BẮT BUỘC giữ dòng attribution trong output.

import fs from "node:fs";
import path from "node:path";

const OVERLAYS_DIR = "public/data/overlays";
const OUT_DIR = "public/data/streets";
const OUT_FILE = path.join(OUT_DIR, "danh-nhan-duong-pilot.json");

// File overlay KHÔNG phải danh nhân (địa danh/di tích/sự kiện/lễ hội/làng nghề/hiện vật)
// — loại khỏi danh mục khớp tên đường để tránh dương tính giả kiểu "đường trùng tên
// địa danh không phải người".
const EXCLUDE_FILES = new Set([
  "bao-vat-quoc-gia.json", // hiện vật (trống đồng...), không phải người
  "chien-dich-tran-danh-bo-sung.json", // tên chiến dịch/trận đánh, không phải người
  "chien-dich-tran-danh.json",
  "danh-thang-di-san-thien-nhien.json", // danh thắng thiên nhiên
  "di-tich-cach-mang.json", // di tích (địa điểm)
  "di-tich-qgdb.json",
  "khoi-nghia-khang-chien.json", // tên trận đánh/sự kiện, không phải người
  "lang-nghe-truyen-thong.json", // tên làng nghề (địa danh)
  "le-hoi-truyen-thong.json", // tên lễ hội
  "tran-danh-khoi-nghia-bo-sung-2.json", // tên chiến dịch/khởi nghĩa (sự kiện)
  "unesco.json", // di sản UNESCO (địa điểm)
]);

// Tiền tố chức danh/danh xưng đứng trước tên riêng — cắt bỏ khi trích ứng viên, vì tên
// đường thực tế thường chỉ dùng tên riêng (VD "Đại tướng Võ Nguyên Giáp" → đường mang
// tên "Võ Nguyên Giáp", không phải "Đại tướng Võ Nguyên Giáp"). KHÔNG cắt "Bà ", "Ông ",
// "Thánh ", "Đức " vì các từ này thường là một phần tên đường thật (VD "Bà Triệu",
// "Ông Ích Khiêm", "Thánh Gióng").
const STRIP_PREFIXES = [
  "Đại tướng ", "Thượng tướng ", "Trung tướng ", "Thiếu tướng ", "Đại tá ", "Chuẩn tướng ",
  "Giáo sư ", "Phó Giáo sư ", "Tiến sĩ ", "Bác sĩ ", "Lương y ", "Kỹ sư ", "Kiến trúc sư ",
  "Nhà thơ ", "Nhà văn ", "Nhà giáo ", "Nhà báo ", "Nhà ngoại giao ", "Dịch giả ",
  "Nhạc sĩ ", "Hoạ sĩ ", "Họa sĩ ", "Nghệ sĩ ", "Nghệ nhân ", "Anh hùng ", "Liệt sĩ ",
  "Vua ", "Chúa ", "Phật hoàng ", "Quốc công ", "Mẹ ", "LLVTND ", "Lao động ", "Thiền sư ",
];

// Cụm mở đầu 1 đoạn tách bằng dấu gạch nối/ngoặc, nhưng KHÔNG phải tên người — cả đoạn
// bị loại (không chỉ cắt tiền tố), vì phần còn lại là tên nghề/địa danh chứ không phải
// tên riêng (VD "Nguyễn Kim Lâu — Tổ nghề chạm bạc Đồng Xâm": đoạn 2 không phải ứng viên).
const REJECT_PART_PREFIXES = ["Tổ nghề ", "Tam vị Tổ sư ", "Lục vị Thánh tổ "];

// Họ phổ biến VN — dùng để "cứu" ứng viên khi tên + tôn hiệu dính liền không có dấu
// tách (VD "Hưng Đạo Đại Vương Trần Quốc Tuấn" → không có dấu "–"/"," giữa tôn hiệu và
// tên thật, dài quá ngưỡng 6 từ nên bị loại nếu không có bước này) — quét cụm từ cuối
// bắt đầu bằng 1 họ để trích riêng phần tên thật ra làm ứng viên bổ sung.
const VN_SURNAMES = new Set([
  "Trần", "Nguyễn", "Lê", "Phạm", "Hoàng", "Huỳnh", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ",
  "Ngô", "Dương", "Lý", "Đinh", "Phan", "Đào", "Đoàn", "Trịnh", "Mai", "Trương", "Tô",
  "Tống", "Chu", "Cao", "Lương", "Hồ", "Đàm", "Lâm", "Kiều", "Thái", "Từ", "Vương",
]);

// Hậu tố tôn hiệu vua/thần thường gặp ngay trước phần "họ + tên" dính liền (VD "Hưng
// Đạo Đại Vương Trần Quốc Tuấn") — dùng để ghép thêm ứng viên "[họ] + [phần tôn hiệu
// riêng]" (VD "Trần" + "Hưng Đạo" → "Trần Hưng Đạo", tên đường phổ biến nhất cả nước).
// Duyệt suffix dài trước (2 từ) rồi mới tới suffix ngắn (1 từ) để không cắt thiếu.
const ROYAL_SUFFIXES = [["Đại", "Vương"], ["Đại", "Đế"], ["Hoàng", "Đế"], ["Vương"], ["Đế"]];

// bbox trung tâm đô thị (south,west,north,east) — theo khuyến nghị proposal: dùng bbox
// cố định thay vì area["name"=...] để tránh Overpass timeout. Đây là lõi đô thị, KHÔNG
// phải toàn bộ ranh giới hành chính sau sáp nhập tỉnh 2025 (sẽ quá rộng, dễ timeout).
const CITIES = [
  { ten_tp: "Hà Nội", bbox: [20.92, 105.72, 21.16, 106.02] },
  { ten_tp: "TP. Hồ Chí Minh", bbox: [10.68, 106.55, 10.90, 106.85] },
  { ten_tp: "Đà Nẵng", bbox: [15.98, 108.15, 16.14, 108.28] },
];

const MIRRORS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

const MAX_RETRY_PER_CITY = 2;
const DELAY_MS = 2500; // giãn cách giữa các request — tôn trọng usage policy Overpass

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripDiacritics(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

// Khoá so khớp: bỏ dấu + hạ chữ thường + gộp khoảng trắng — để chịu được khác biệt
// Unicode-normalization/hoa-thường giữa dữ liệu overlay và tên đường OSM, nhưng vẫn đòi
// khớp ĐẦY ĐỦ chuỗi (không phải substring) để tránh dương tính giả.
function matchKey(s) {
  return stripDiacritics(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Trích các ứng viên "tên có thể dùng làm tên đường" từ trường `ten` của 1 mục overlay.
// VD: "Lý Thái Tổ – Lý Công Uẩn" → ["Lý Thái Tổ", "Lý Công Uẩn"]
//     "Đại tướng Võ Nguyên Giáp" → ["Võ Nguyên Giáp"]
//     "Bố Cái Đại Vương (Phùng Hưng)" → ["Bố Cái Đại Vương", "Phùng Hưng"]
//     "Hưng Đạo Đại Vương Trần Quốc Tuấn" → [..., "Trần Quốc Tuấn"] (qua VN_SURNAMES)
function candidateNamesFromTen(ten) {
  // Nội dung trong ngoặc (VD tên gọi khác) cũng là ứng viên riêng — không chỉ bỏ đi.
  const parenContents = [...ten.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]);
  const noParen = ten.replace(/\(.*?\)/g, " ");
  const rawSegments = [noParen, ...parenContents];

  const out = [];
  for (const seg of rawSegments) {
    const parts = seg
      .split(/\s*[–—-]\s*|,/)
      .map((p) => p.trim())
      .filter(Boolean);
    for (let part of parts) {
      if (REJECT_PART_PREFIXES.some((pre) => part.startsWith(pre))) continue;
      // Lặp cắt tiền tố vì có tiêu đề kép (VD "Anh hùng LLVTND Kim Đồng" cần cắt 2 lượt).
      let changed = true;
      while (changed) {
        changed = false;
        for (const pre of STRIP_PREFIXES) {
          // So khớp cả trường hợp cả đoạn CHỈ LÀ tiêu đề (không có tên theo sau) bằng
          // cách thêm khoảng trắng đệm cuối chuỗi trước khi so startsWith.
          if ((part + " ").startsWith(pre)) {
            part = part.slice(pre.length).trim();
            changed = true;
            break;
          }
        }
      }
      const words = part.split(/\s+/).filter(Boolean);
      // Ràng buộc "khớp CHẮC": tên ≥2 âm tiết (xấp xỉ bằng số từ), không quá dài (loại
      // câu mô tả dài dòng còn sót lại sau khi tách).
      if (words.length >= 2 && words.length <= 6) {
        out.push(part);
      } else if (words.length > 6) {
        // Tôn hiệu + tên thật dính liền không dấu tách — quét họ để cứu phần tên thật.
        for (let i = 1; i < words.length; i++) {
          if (!VN_SURNAMES.has(words[i])) continue;
          const tail = words.slice(i);
          if (tail.length >= 2 && tail.length <= 6) out.push(tail.join(" "));

          // Ghép thêm "[họ] + [tôn hiệu đã bỏ hậu tố Vương/Đế...]" — VD "Trần Hưng Đạo".
          const leading = words.slice(0, i);
          for (const suf of ROYAL_SUFFIXES) {
            if (suf.length > leading.length) continue;
            const tailOfLeading = leading.slice(leading.length - suf.length);
            if (tailOfLeading.every((w, idx) => w === suf[idx])) {
              const remainder = leading.slice(0, leading.length - suf.length);
              const combo = [words[i], ...remainder];
              if (combo.length >= 2 && combo.length <= 6) out.push(combo.join(" "));
              break;
            }
          }
        }
      }
    }
  }
  return out;
}

// Đọc toàn bộ overlay, trả về Map<matchKey, {danh_nhan_id, ten} | "AMBIGUOUS">.
// Ứng viên đụng độ giữa ≥2 danh nhân khác nhau bị đánh dấu AMBIGUOUS và loại khỏi khớp.
function buildCatalog() {
  const files = fs.readdirSync(OVERLAYS_DIR).filter((f) => f.endsWith(".json"));
  const catalog = new Map();
  let personCount = 0;
  for (const f of files) {
    if (EXCLUDE_FILES.has(f)) continue;
    const j = JSON.parse(fs.readFileSync(path.join(OVERLAYS_DIR, f), "utf8"));
    const items = j.items || (Array.isArray(j) ? j : []);
    for (const it of items) {
      if (!it.id || !it.ten) continue;
      personCount++;
      for (const cand of candidateNamesFromTen(it.ten)) {
        const key = matchKey(cand);
        if (!key) continue;
        const existing = catalog.get(key);
        if (existing === undefined) {
          catalog.set(key, { danh_nhan_id: it.id, ten: it.ten, candidate: cand });
        } else if (existing !== "AMBIGUOUS" && existing.danh_nhan_id !== it.id) {
          catalog.set(key, "AMBIGUOUS");
        }
      }
    }
  }
  return { catalog, personCount, fileCount: files.length - EXCLUDE_FILES.size };
}

async function fetchOverpass(query, cityLabel) {
  for (let attempt = 1; attempt <= MAX_RETRY_PER_CITY; attempt++) {
    for (const mirror of MIRRORS) {
      try {
        const res = await fetch(mirror, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "data=" + encodeURIComponent(query),
          signal: AbortSignal.timeout(120000),
        });
        if (!res.ok) {
          console.error(`[${cityLabel}] ${mirror} → HTTP ${res.status} (lần ${attempt})`);
          continue;
        }
        const json = await res.json();
        if (json && Array.isArray(json.elements)) {
          console.error(`[${cityLabel}] OK qua ${mirror} — ${json.elements.length} way`);
          return json;
        }
      } catch (e) {
        console.error(`[${cityLabel}] ${mirror} lỗi (lần ${attempt}): ${e.message}`);
      }
      await sleep(1500);
    }
  }
  return null;
}

// Gộp các way cùng tên OSM trong 1 thành phố → { name: {so_doan, sumLon, sumLat} }
function groupWaysByName(elements) {
  const groups = new Map();
  for (const el of elements) {
    const name = el.tags && el.tags.name;
    const center = el.center;
    if (!name || !center) continue;
    const g = groups.get(name) || { so_doan: 0, sumLon: 0, sumLat: 0 };
    g.so_doan += 1;
    g.sumLon += center.lon;
    g.sumLat += center.lat;
    groups.set(name, g);
  }
  return groups;
}

async function main() {
  const { catalog, personCount, fileCount } = buildCatalog();
  const candidateCount = [...catalog.values()].filter((v) => v !== "AMBIGUOUS").length;
  const ambiguousCount = [...catalog.values()].filter((v) => v === "AMBIGUOUS").length;
  console.error(
    `Danh mục: ${fileCount} file danh nhân, ${personCount} người, ${candidateCount} ứng viên tên (loại ${ambiguousCount} đụng độ).`
  );

  const thanhPhoReport = [];
  // danh_nhan_id -> { ten, thanh_pho: [...] }
  const lienKet = new Map();

  for (const city of CITIES) {
    const [south, west, north, east] = city.bbox;
    const query = `[out:json][timeout:100];way["highway"]["name"](${south},${west},${north},${east});out tags center;`;
    const json = await fetchOverpass(query, city.ten_tp);

    if (!json) {
      thanhPhoReport.push({
        ten_tp: city.ten_tp,
        bbox: city.bbox,
        trang_thai: "loi",
        ghi_chu: `Overpass thất bại sau ${MAX_RETRY_PER_CITY} lần thử × ${MIRRORS.length} mirror.`,
      });
      continue;
    }

    const groups = groupWaysByName(json.elements);
    let matched = 0;
    for (const [osmName, g] of groups) {
      const key = matchKey(osmName);
      const entry = catalog.get(key);
      if (!entry || entry === "AMBIGUOUS") continue;
      matched++;
      const centroid = [
        Math.round((g.sumLon / g.so_doan) * 1e5) / 1e5,
        Math.round((g.sumLat / g.so_doan) * 1e5) / 1e5,
      ];
      if (!lienKet.has(entry.danh_nhan_id)) {
        lienKet.set(entry.danh_nhan_id, { ten: entry.ten, thanh_pho: [] });
      }
      lienKet.get(entry.danh_nhan_id).thanh_pho.push({
        ten_tp: city.ten_tp,
        ten_duong_osm: osmName,
        so_doan: g.so_doan,
        centroid,
      });
    }

    thanhPhoReport.push({
      ten_tp: city.ten_tp,
      bbox: city.bbox,
      trang_thai: "ok",
      tong_duong_co_ten_osm: groups.size,
      so_duong_khop_danh_nhan: matched,
    });

    await sleep(DELAY_MS);
  }

  const lienKetArr = [...lienKet.entries()]
    .map(([danh_nhan_id, v]) => ({
      danh_nhan_id,
      ten: v.ten,
      so_duong: v.thanh_pho.length,
      thanh_pho: v.thanh_pho,
    }))
    .sort((a, b) => b.so_duong - a.so_duong || a.danh_nhan_id.localeCompare(b.danh_nhan_id));

  const output = {
    _license: "© OpenStreetMap contributors (ODbL) — https://www.openstreetmap.org/copyright",
    ngay_build: new Date().toISOString().slice(0, 10),
    nguon: "OpenStreetMap qua Overpass API (overpass.kumi.systems / overpass-api.de)",
    ghi_chu:
      "PILOT Phương án A: chỉ centroid đại diện + số đoạn, không lưu hình học đầy đủ. " +
      "bbox là lõi đô thị trung tâm, chưa phủ hết ranh giới hành chính sau sáp nhập tỉnh 2025. " +
      "Khớp tên: chuẩn hoá bỏ dấu/hoa-thường, đòi khớp đầy đủ chuỗi, loại ứng viên đụng độ " +
      "giữa ≥2 danh nhân. Vẫn cần 1 vòng soát thủ công trước khi mở rộng toàn quốc (xem " +
      "docs/street-names-model-proposal.md mục 4 bước 5).",
    thanh_pho: thanhPhoReport,
    lien_ket: lienKetArr,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), "utf8");

  console.error(
    `\nGhi ${OUT_FILE}: ${lienKetArr.length} danh nhân có ≥1 đường khớp, ` +
      `tổng ${lienKetArr.reduce((s, x) => s + x.so_duong, 0)} liên kết thành-phố.`
  );
}

main().catch((e) => {
  console.error("Lỗi build:", e);
  process.exitCode = 1;
});
