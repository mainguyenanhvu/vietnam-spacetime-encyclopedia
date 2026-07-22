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
import { pathToFileURL } from "node:url";

const OVERLAYS_DIR = "public/data/overlays";
const FIGURES_DIR = "public/data/figures";
const FIGURES_FILES = ["danh-nhan.json"]; // danh nhân theo tỉnh (255) — chỉ file người
const OUT_DIR = "public/data/streets";
const OUT_FILE = path.join(OUT_DIR, "danh-nhan-duong-pilot.json");

// Bảng ALIAS: tên đường OSM gõ SAI DẤU → id danh nhân đã XÁC MINH nguồn (2026-07-22, xem
// _soat_tay). Chỉ nối những trường hợp đã tra nguồn nhà nước xác nhận đường vinh danh chính
// danh nhân đó. KHÔNG nới lỏng matchKey (giữ phân biệt Bình≠Bính), chỉ override thủ công.
const OSM_ALIAS = {
  "Bùi Cẩm Hổ": "bui-cam-ho", // đúng: Bùi Cầm Hổ (laodong/baohatinh/honglinh.gov)
  "Nguyễn Thị Thử": "nguyen-thi-thu", // đúng: Nguyễn Thị Thứ (Mẹ VNAH)
  "Trương Quốc Dung": "truong-quoc-dung", // đúng: Trương Quốc Dụng (dantri/vietnam.vn)
};

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
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.osm.jp/api/interpreter",
];

const MAX_RETRY_PER_CITY = 2;
const DELAY_MS = 2500; // giãn cách giữa các request — tôn trọng usage policy Overpass

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Dấu THANH ĐIỆU tiếng Việt (combining, NFD) — tách riêng khỏi dấu CHẤT NGUYÊN ÂM.
const TONE_MARKS = {
  "̀": "1", // huyền (grave)
  "́": "2", // sắc (acute)
  "̃": "3", // ngã (tilde)
  "̉": "4", // hỏi (hook above)
  "̣": "5", // nặng (dot below)
};

// Khoá 1 âm tiết: giữ chất nguyên âm (â/ê/ô/ơ/ư/ă) + đ, nhưng TÁCH thanh điệu ra một mã
// đứng sau — nên khoá độc lập với VỊ TRÍ đặt dấu thanh («Thủy»≡«Thuỷ», cùng thanh hỏi trên
// cụm uy) nhưng vẫn PHÂN BIỆT khác thanh («Bình»huyền≠«Bính»sắc → 2 người khác nhau).
function syllableKey(tok) {
  let tone = "0";
  let base = "";
  for (const ch of tok.normalize("NFD")) {
    if (TONE_MARKS[ch]) tone = TONE_MARKS[ch]; // rút thanh ra, bỏ khỏi vị trí gốc
    else base += ch; // giữ chữ cái + dấu chất nguyên âm (circumflex/horn/breve) + đ
  }
  return base.normalize("NFC") + tone;
}

// Khoá so khớp đầy đủ chuỗi: hạ chữ thường + bỏ dấu câu + khoá từng âm tiết theo syllableKey.
// Tiếng Việt đơn âm tiết → mỗi token cách bằng khoảng trắng là 1 âm tiết.
export function matchKey(s) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(syllableKey)
    .join(" ");
}

// Trích các ứng viên "tên có thể dùng làm tên đường" từ trường `ten` của 1 mục overlay.
// VD: "Lý Thái Tổ – Lý Công Uẩn" → ["Lý Thái Tổ", "Lý Công Uẩn"]
//     "Đại tướng Võ Nguyên Giáp" → ["Võ Nguyên Giáp"]
//     "Bố Cái Đại Vương (Phùng Hưng)" → ["Bố Cái Đại Vương", "Phùng Hưng"]
//     "Hưng Đạo Đại Vương Trần Quốc Tuấn" → [..., "Trần Quốc Tuấn"] (qua VN_SURNAMES)
export function candidateNamesFromTen(ten) {
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

// Nạp 1 tập item vào catalog. `src` = "overlay" | "figures". Overlay ưu tiên hơn figures:
// nếu key đã có từ overlay thì item figures cùng key bị BỎ QUA (không đánh AMBIGUOUS) → không
// làm mất match sẵn có. Đụng độ ≥2 người khác nhau CÙNG nguồn (hoặc figures-figures) → AMBIGUOUS.
function ingestItems(items, catalog, byId, src) {
  let n = 0;
  for (const it of items) {
    if (!it.id || !it.ten) continue;
    n++;
    if (!byId.has(it.id)) byId.set(it.id, it.ten);
    for (const cand of candidateNamesFromTen(it.ten)) {
      const key = matchKey(cand);
      if (!key) continue;
      const ex = catalog.get(key);
      if (ex === undefined) catalog.set(key, { danh_nhan_id: it.id, ten: it.ten, src });
      else if (ex === "AMBIGUOUS") continue;
      else if (ex.danh_nhan_id === it.id) continue; // cùng người
      else if (src === "figures" && ex.src === "overlay") continue; // overlay thắng
      else catalog.set(key, "AMBIGUOUS");
    }
  }
  return n;
}

// Đọc overlay + figures, trả về { catalog: Map<matchKey, {danh_nhan_id,ten,src} | "AMBIGUOUS">,
// byId: Map<id, ten> }. figures/ được nạp SAU để overlay giữ ưu tiên.
export function buildCatalog() {
  const catalog = new Map();
  const byId = new Map();
  const oFiles = fs
    .readdirSync(OVERLAYS_DIR)
    .filter((f) => f.endsWith(".json") && !EXCLUDE_FILES.has(f));
  let personCount = 0;
  for (const f of oFiles) {
    const j = JSON.parse(fs.readFileSync(path.join(OVERLAYS_DIR, f), "utf8"));
    personCount += ingestItems(j.items || (Array.isArray(j) ? j : []), catalog, byId, "overlay");
  }
  let figCount = 0;
  for (const f of FIGURES_FILES) {
    const p = path.join(FIGURES_DIR, f);
    if (!fs.existsSync(p)) continue;
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    figCount += ingestItems(j.items || [], catalog, byId, "figures");
  }
  return { catalog, byId, personCount, figCount, fileCount: oFiles.length };
}

async function fetchOverpass(query, cityLabel) {
  for (let attempt = 1; attempt <= MAX_RETRY_PER_CITY; attempt++) {
    for (const mirror of MIRRORS) {
      try {
        const res = await fetch(mirror, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            // Overpass đòi User-Agent định danh; thiếu → một số mirror trả 406/403.
            "User-Agent": "vietnam-spacetime-encyclopedia/1.0 (build_street_names.mjs)",
            Accept: "application/json",
          },
          body: "data=" + encodeURIComponent(query),
          signal: AbortSignal.timeout(120000),
        });
        if (!res.ok) {
          console.error(`[${cityLabel}] ${mirror} → HTTP ${res.status} (lần ${attempt})`);
          // 429 = rate-limit: nghỉ dài hơn trước khi thử mirror/lần kế.
          if (res.status === 429) await sleep(5000);
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
  const { catalog, byId, personCount, figCount, fileCount } = buildCatalog();
  const candidateCount = [...catalog.values()].filter((v) => v !== "AMBIGUOUS").length;
  const ambiguousCount = [...catalog.values()].filter((v) => v === "AMBIGUOUS").length;
  console.error(
    `Danh mục: ${fileCount} file overlay (${personCount} người) + figures (${figCount} người), ` +
      `${candidateCount} ứng viên tên (loại ${ambiguousCount} đụng độ).`
  );

  // Bảo vệ dữ liệu: nhớ thành phố TỪNG fetch OK ở pilot cũ để không ghi đè bằng bản thiếu.
  const prev = fs.existsSync(OUT_FILE) ? JSON.parse(fs.readFileSync(OUT_FILE, "utf8")) : null;
  const prevOkCities = new Set(
    (prev?.thanh_pho || []).filter((c) => c.trang_thai === "ok").map((c) => c.ten_tp)
  );

  const thanhPhoReport = [];
  // danh_nhan_id -> { ten, thanh_pho: [...] }
  const lienKet = new Map();
  const aliasApplied = []; // {duong_osm, danh_nhan_id, ten_tp}

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
      // OSM (nhất là Hà Nội) hay gắn tiền tố loại đường: «Phố Trần Hưng Đạo», «Đường Lê
      // Lợi», «Đại lộ …» — bỏ tiền tố khi KHỚP (giữ tên gốc để hiển thị). Không tên người
      // Việt nào bắt đầu bằng các từ này nên strip an toàn.
      const cleanName = osmName.replace(/^(phố|đường|đại lộ|quốc lộ|tỉnh lộ|ngõ|ngách|hẻm)\s+/i, "");
      const key = matchKey(cleanName);
      let entry = catalog.get(key);
      let viaAlias = false;
      // Fallback ALIAS thủ công cho tên OSM gõ sai dấu đã xác minh nguồn.
      if ((!entry || entry === "AMBIGUOUS") && OSM_ALIAS[osmName] && byId.has(OSM_ALIAS[osmName])) {
        const aid = OSM_ALIAS[osmName];
        entry = { danh_nhan_id: aid, ten: byId.get(aid) };
        viaAlias = true;
      }
      if (!entry || entry === "AMBIGUOUS") continue;
      matched++;
      const centroid = [
        Math.round((g.sumLon / g.so_doan) * 1e5) / 1e5,
        Math.round((g.sumLat / g.so_doan) * 1e5) / 1e5,
      ];
      if (!lienKet.has(entry.danh_nhan_id)) {
        lienKet.set(entry.danh_nhan_id, { ten: entry.ten, thanh_pho: [] });
      }
      const tp = { ten_tp: city.ten_tp, ten_duong_osm: osmName, so_doan: g.so_doan, centroid };
      if (viaAlias) {
        tp.osm_sai_dau = true; // OSM gõ sai dấu, nối theo alias đã xác minh
        aliasApplied.push({ duong_osm: osmName, danh_nhan_id: entry.danh_nhan_id, ten_tp: city.ten_tp });
      }
      lienKet.get(entry.danh_nhan_id).thanh_pho.push(tp);
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
      "Danh mục khớp = overlays/ + figures/danh-nhan.json (overlay ưu tiên). Khớp tên: hạ chữ " +
      "thường + khoá theo âm tiết, TÁCH thanh điệu khỏi vị trí đặt dấu (Thủy≡Thuỷ) nhưng phân " +
      "biệt khác thanh (Bình≠Bính), đòi khớp đầy đủ chuỗi, loại ứng viên đụng độ ≥2 danh nhân. " +
      "Tên đường OSM gõ sai dấu (đã xác minh nguồn) nối qua bảng OSM_ALIAS, gắn cờ osm_sai_dau.",
    _ghi_chu_lech_thanh:
      "Một số đường CỐ Ý không khớp vì là NGƯỜI KHÁC (không phải OSM sai): «Lê Thận» (TP.HCM, " +
      "truyền thuyết gươm thần TK15) ≠ Bảng nhãn Lê Thân (Cổ Định 1275) trong dữ liệu; «Nguyễn " +
      "Thiệp» chưa xác minh có vinh danh La Sơn Phu Tử Nguyễn Thiếp hay không. Xem git d23daa0.",
    _alias_ap_dung: aliasApplied,
    thanh_pho: thanhPhoReport,
    lien_ket: lienKetArr,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Guard: nếu thành phố TỪNG ok nay lỗi → KHÔNG ghi đè (tránh mất dữ liệu tốt vì mạng chập).
  const okNow = new Set(thanhPhoReport.filter((c) => c.trang_thai === "ok").map((c) => c.ten_tp));
  const regressed = [...prevOkCities].filter((c) => !okNow.has(c));
  if (regressed.length) {
    const failFile = OUT_FILE + ".regen-failed.json";
    fs.writeFileSync(failFile, JSON.stringify(output, null, 2), "utf8");
    console.error(
      `\n⛔ Thành phố từng OK nay fetch lỗi: ${regressed.join(", ")}. KHÔNG ghi đè pilot cũ. ` +
        `Kết quả run này ghi tạm ${failFile} để soi.`
    );
    process.exitCode = 2;
    return;
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), "utf8");
  console.error(
    `\nGhi ${OUT_FILE}: ${lienKetArr.length} danh nhân có ≥1 đường khớp, ` +
      `tổng ${lienKetArr.reduce((s, x) => s + x.so_duong, 0)} liên kết thành-phố ` +
      `(alias áp dụng: ${aliasApplied.length}).`
  );
}

// Chỉ chạy build (gọi Overpass) khi thực thi trực tiếp; cho phép import helper để dùng lại
// (VD script dọn pilot) mà không kích hoạt fetch mạng.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error("Lỗi build:", e);
    process.exitCode = 1;
  });
}
