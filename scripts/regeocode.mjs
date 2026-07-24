// Re-geocode overlay entries with do_tin_cay_toa_do:"thap" to a more precise
// lon/lat via Nominatim, bumping confidence to "trung"/"cao" when a nearby,
// specific match is found. Never touches non-"thap" entries or other fields.
//
// Usage:
//   node scripts/regeocode.mjs                 # dry-run, all 29 overlay files
//   node scripts/regeocode.mjs --apply          # write changes
//   node scripts/regeocode.mjs --file di-tich-quoc-gia.json --apply
//
// Rate-limited to Nominatim's usage policy (1 req/s) with a custom UA.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OVERLAY_DIR = join(ROOT, "public", "data", "overlays");
const UA = "vn-encyclopedia-geo/1.0 (contact: mnav.tkonline@gmail.com)";
const SLEEP_MS = 1100;
const MAX_DELTA_DEG = 0.3; // ~33 km geoBounded guard

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const fileArgIdx = args.indexOf("--file");
const FILE_FILTER = fileArgIdx >= 0 ? args[fileArgIdx + 1] : null;

// 2025 sáp nhập tỉnh: tên cũ (không dấu tiền tố "tỉnh/thành phố") -> tên tỉnh mới.
// Tỉnh không đổi tên không cần liệt kê (đã map identity ở normalizeProvince).
const PROVINCE_MERGE = {
  "an giang": "An Giang", "kiên giang": "An Giang",
  "bắc ninh": "Bắc Ninh", "bắc giang": "Bắc Ninh",
  "cà mau": "Cà Mau", "bạc liêu": "Cà Mau",
  "cần thơ": "Cần Thơ", "hậu giang": "Cần Thơ", "sóc trăng": "Cần Thơ",
  "đà nẵng": "Đà Nẵng", "quảng nam": "Đà Nẵng",
  "đắk lắk": "Đắk Lắk", "đắc lắc": "Đắk Lắk", "phú yên": "Đắk Lắk",
  "đồng nai": "Đồng Nai", "bình phước": "Đồng Nai",
  "đồng tháp": "Đồng Tháp", "tiền giang": "Đồng Tháp",
  "gia lai": "Gia Lai", "bình định": "Gia Lai",
  "hải phòng": "Hải Phòng", "hải dương": "Hải Phòng",
  "huế": "Huế", "thừa thiên huế": "Huế", "thừa thiên - huế": "Huế",
  "hưng yên": "Hưng Yên", "thái bình": "Hưng Yên",
  "khánh hòa": "Khánh Hòa", "ninh thuận": "Khánh Hòa",
  "lâm đồng": "Lâm Đồng", "đắk nông": "Lâm Đồng", "bình thuận": "Lâm Đồng",
  "lào cai": "Lào Cai", "yên bái": "Lào Cai",
  "ninh bình": "Ninh Bình", "hà nam": "Ninh Bình", "nam định": "Ninh Bình",
  "phú thọ": "Phú Thọ", "vĩnh phúc": "Phú Thọ", "hòa bình": "Phú Thọ",
  "quảng ngãi": "Quảng Ngãi", "kon tum": "Quảng Ngãi",
  "quảng trị": "Quảng Trị", "quảng bình": "Quảng Trị",
  "tây ninh": "Tây Ninh", "long an": "Tây Ninh",
  "thái nguyên": "Thái Nguyên", "bắc kạn": "Thái Nguyên", "bắc cạn": "Thái Nguyên",
  "hồ chí minh": "Thành phố Hồ Chí Minh", "tp hồ chí minh": "Thành phố Hồ Chí Minh",
  "bình dương": "Thành phố Hồ Chí Minh", "bà rịa - vũng tàu": "Thành phố Hồ Chí Minh",
  "bà rịa vũng tàu": "Thành phố Hồ Chí Minh", "vũng tàu": "Thành phố Hồ Chí Minh",
  "tuyên quang": "Tuyên Quang", "hà giang": "Tuyên Quang",
  "vĩnh long": "Vĩnh Long", "bến tre": "Vĩnh Long", "trà vinh": "Vĩnh Long",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function removeDiacritics(s) {
  return s
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .normalize("NFD").replace(/[̀-ͯ]/g, "");
}
const norm = (s) => removeDiacritics(String(s || "")).toLowerCase().trim();

const UNCHANGED_PROVINCES = [
  "Cao Bằng", "Điện Biên", "Hà Nội", "Hà Tĩnh", "Lai Châu", "Lạng Sơn",
  "Nghệ An", "Quảng Ninh", "Sơn La", "Thanh Hóa",
];
// Old-name display casing map for bare-name scanning (regex needs the
// original accented casing as it appears in source text, not the map key).
const OLD_NAME_DISPLAY = {
  "an giang": "An Giang", "kiên giang": "Kiên Giang",
  "bắc ninh": "Bắc Ninh", "bắc giang": "Bắc Giang",
  "cà mau": "Cà Mau", "bạc liêu": "Bạc Liêu",
  "cần thơ": "Cần Thơ", "hậu giang": "Hậu Giang", "sóc trăng": "Sóc Trăng",
  "đà nẵng": "Đà Nẵng", "quảng nam": "Quảng Nam",
  "đắk lắk": "Đắk Lắk", "đắc lắc": "Đắc Lắc", "phú yên": "Phú Yên",
  "đồng nai": "Đồng Nai", "bình phước": "Bình Phước",
  "đồng tháp": "Đồng Tháp", "tiền giang": "Tiền Giang",
  "gia lai": "Gia Lai", "bình định": "Bình Định",
  "hải phòng": "Hải Phòng", "hải dương": "Hải Dương",
  "huế": "Huế", "thừa thiên huế": "Thừa Thiên Huế", "thừa thiên - huế": "Thừa Thiên - Huế",
  "hưng yên": "Hưng Yên", "thái bình": "Thái Bình",
  "khánh hòa": "Khánh Hòa", "ninh thuận": "Ninh Thuận",
  "lâm đồng": "Lâm Đồng", "đắk nông": "Đắk Nông", "bình thuận": "Bình Thuận",
  "lào cai": "Lào Cai", "yên bái": "Yên Bái",
  "ninh bình": "Ninh Bình", "hà nam": "Hà Nam", "nam định": "Nam Định",
  "phú thọ": "Phú Thọ", "vĩnh phúc": "Vĩnh Phúc", "hòa bình": "Hòa Bình",
  "quảng ngãi": "Quảng Ngãi", "kon tum": "Kon Tum",
  "quảng trị": "Quảng Trị", "quảng bình": "Quảng Bình",
  "tây ninh": "Tây Ninh", "long an": "Long An",
  "thái nguyên": "Thái Nguyên", "bắc kạn": "Bắc Kạn", "bắc cạn": "Bắc Cạn",
  "hồ chí minh": "Hồ Chí Minh", "tp hồ chí minh": "TP Hồ Chí Minh",
  "bình dương": "Bình Dương", "bà rịa - vũng tàu": "Bà Rịa - Vũng Tàu",
  "bà rịa vũng tàu": "Bà Rịa Vũng Tàu", "vũng tàu": "Vũng Tàu",
  "tuyên quang": "Tuyên Quang", "hà giang": "Hà Giang",
  "vĩnh long": "Vĩnh Long", "bến tre": "Bến Tre", "trà vinh": "Trà Vinh",
};
const BARE_SCAN_NAMES = [...new Set([...Object.values(OLD_NAME_DISPLAY), ...UNCHANGED_PROVINCES])]
  .sort((a, b) => b.length - a.length);

function extractProvince(text) {
  if (!text) return null;
  const nayThuoc = text.match(/nay thuộc\s+([^)]+)\)/i);
  let raw = null;
  if (nayThuoc) raw = nayThuoc[1];
  else {
    const matches = [...text.matchAll(/(?:tỉnh|thành phố|Thành phố|TP\.?|Tp\.?)\s+([^,()]+)/gi)];
    if (matches.length) raw = matches[matches.length - 1][1];
  }
  if (raw) {
    raw = raw.replace(/^(tỉnh|thành phố|Thành phố|TP\.?|Tp\.?)\s+/i, "").trim();
    const key = norm(raw);
    return PROVINCE_MERGE[key] || raw;
  }
  // Fallback: scan for a bare province name (no "tỉnh"/"thành phố" prefix),
  // taking the LAST match by position (province is usually mentioned last).
  let bestName = null, bestIdx = -1;
  for (const name of BARE_SCAN_NAMES) {
    const idx = text.lastIndexOf(name);
    if (idx > bestIdx) { bestIdx = idx; bestName = name; }
  }
  if (!bestName) return null;
  const key = norm(bestName);
  return PROVINCE_MERGE[key] || bestName;
}

function coreName(ten) {
  return String(ten || "").replace(/\([^)]*\)/g, "").trim();
}

function specificity(r) {
  const cls = r.category, typ = r.type; // Nominatim jsonv2 field is "category", not "class"
  if (["historic", "tourism", "building", "amenity", "man_made", "shrine"].includes(cls)) return 3;
  if (cls === "place" && ["village", "hamlet", "suburb", "neighbourhood", "quarter", "isolated_dwelling", "city_block"].includes(typ)) return 2;
  if (cls === "place" && ["town", "city", "municipality"].includes(typ)) return 1;
  if (cls === "boundary" || typ === "administrative") return 0;
  return 1;
}

function nameMatches(r, ten) {
  const target = norm(coreName(ten));
  const candidates = [r.name, r.display_name?.split(",")[0]].filter(Boolean).map(norm);
  return candidates.some((c) => c.includes(target) || target.includes(c));
}

async function nominatimSearch(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  await sleep(SLEEP_MS);
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  return res.json();
}

// Try queries in order; return {result, query, distance} for the first query
// that yields an acceptable (within-guard) hit, preferring the most specific
// among that query's accepted candidates. Also tracks the globally closest
// rejected candidate for diagnostics.
async function geocodeEntry(entry) {
  const locText = entry.dia_diem || entry.noi_tho || "";
  const province = extractProvince(locText);
  const ten = entry.ten;
  const queries = [];
  if (locText) queries.push(locText);
  if (province) queries.push(`${ten}, ${province}, Việt Nam`);
  if (province) queries.push(`${coreName(ten)}, ${province}, Việt Nam`);
  else queries.push(`${coreName(ten)}, Việt Nam`);

  let closestRejected = null; // {distance, query}
  for (const q of queries) {
    let results;
    try {
      results = await nominatimSearch(q);
    } catch (e) {
      continue;
    }
    if (!Array.isArray(results) || !results.length) continue;
    const accepted = [];
    for (const r of results) {
      const rlon = parseFloat(r.lon), rlat = parseFloat(r.lat);
      const d = Math.hypot(rlon - entry.lon, rlat - entry.lat);
      if (d <= MAX_DELTA_DEG) accepted.push({ r, d });
      else if (!closestRejected || d < closestRejected.distance) {
        closestRejected = { distance: d, query: q };
      }
    }
    if (accepted.length) {
      accepted.sort((a, b) => specificity(b.r) - specificity(a.r) || a.d - b.d);
      const best = accepted[0];
      const spec = specificity(best.r);
      let conf;
      if (spec === 3 && nameMatches(best.r, ten)) conf = "cao";
      else if (spec >= 1) conf = "trung";
      else conf = null; // only boundary-level, not good enough
      if (conf) {
        return {
          lon: parseFloat(best.r.lon),
          lat: parseFloat(best.r.lat),
          conf,
          query: q,
          display_name: best.r.display_name,
          class: best.r.category,
          type: best.r.type,
        };
      }
    }
  }
  return { closestRejected };
}

function loadFiles() {
  let files = readdirSync(OVERLAY_DIR).filter((f) => f.endsWith(".json"));
  if (FILE_FILTER) {
    const want = FILE_FILTER.endsWith(".json") ? FILE_FILTER : `${FILE_FILTER}.json`;
    files = files.filter((f) => f === want);
  }
  return files;
}

// Targeted per-field string replacement fallback, used only if a file fails
// the round-trip verification (JSON.stringify(parsed,null,2) !== original text).
function patchRawById(raw, id, lon, lat, conf) {
  const idMarker = `"id": "${id}"`;
  const idx = raw.indexOf(idMarker);
  if (idx < 0) throw new Error(`patchRawById: id '${id}' not found in raw text`);
  const nextIdx = raw.indexOf(`"id": "`, idx + idMarker.length);
  const blockEnd = nextIdx >= 0 ? nextIdx : raw.length;
  let block = raw.slice(idx, blockEnd);
  block = block.replace(/"lon":\s*-?\d+(\.\d+)?/, `"lon": ${lon}`);
  block = block.replace(/"lat":\s*-?\d+(\.\d+)?/, `"lat": ${lat}`);
  block = block.replace(/"do_tin_cay_toa_do":\s*"[^"]*"/, `"do_tin_cay_toa_do": "${conf}"`);
  return raw.slice(0, idx) + block + raw.slice(blockEnd);
}

async function main() {
  const files = loadFiles();
  const summary = { attempted: 0, toCao: 0, toTrung: 0, unchanged: 0, flagged: [] };

  for (const file of files) {
    const filePath = join(OVERLAY_DIR, file);
    const raw = readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    const items = Array.isArray(data) ? data : data.items;
    if (!Array.isArray(items)) continue;

    const roundTripOk = JSON.stringify(data, null, 2) + "\n" === raw;
    let workingRaw = raw;
    const changes = []; // {id, lon, lat, conf}

    const thapItems = items.filter((it) => it.do_tin_cay_toa_do === "thap");
    if (!thapItems.length) continue;

    for (const it of thapItems) {
      summary.attempted++;
      const result = await geocodeEntry(it);
      if (result.lon !== undefined) {
        console.log(
          `[${file}] ${it.id}: (${it.lon},${it.lat}) -> (${result.lon.toFixed(6)},${result.lat.toFixed(6)}) ` +
          `thap->${result.conf}  via "${result.query}"  [${result.class}/${result.type}] ${result.display_name}`,
        );
        if (result.conf === "cao") summary.toCao++;
        else summary.toTrung++;
        changes.push({ id: it.id, lon: result.lon, lat: result.lat, conf: result.conf });
        if (APPLY) {
          it.lon = result.lon;
          it.lat = result.lat;
          it.do_tin_cay_toa_do = result.conf;
        }
      } else {
        summary.unchanged++;
        if (result.closestRejected) {
          const flag = `[${file}] ${it.id}: no accepted match, closest candidate ${result.closestRejected.distance.toFixed(3)}° away (query: "${result.closestRejected.query}")`;
          console.log(flag);
          if (result.closestRejected.distance > MAX_DELTA_DEG) {
            summary.flagged.push({ file, id: it.id, distance: result.closestRejected.distance });
          }
        } else {
          console.log(`[${file}] ${it.id}: no geocode result at all — left unchanged`);
        }
      }
    }

    if (APPLY && changes.length) {
      if (roundTripOk) {
        writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
      } else {
        for (const c of changes) {
          workingRaw = patchRawById(workingRaw, c.id, c.lon, c.lat, c.conf);
        }
        writeFileSync(filePath, workingRaw, "utf8");
        console.log(`[${file}] WARNING: used fallback per-field patch (round-trip mismatch)`);
      }
    }
  }

  console.log("\n=== SUMMARY ===");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
