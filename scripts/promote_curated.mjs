// Curated §9 promotion (Iron Man 2026-07-25 decision: "Rổ 1 + 2 + 20 SAFE",
// with political names pulled out of the modern-people bucket).
//
// Promote draft -> reviewed when EITHER:
//   (1) SAFE  (classify().care === false), OR
//   (2) CARE  &&  careTier === TIER-MODERN  &&  file !== chien-dich-tran-danh
//       (real military campaigns held back)  &&  ten not on EXCLUDE_NAMES
//       (high Party/State office or controversy — held for manual review).
// Everything else (TIER-SENS, campaigns, excluded names) stays draft.
//
// Defaults to dry-run. Pass --apply to write. Never commits.
import fs from "node:fs";
import path from "node:path";
import {
  OVERLAYS_DIR,
  listOverlayFiles,
  readOverlay,
  loadSensitiveIds,
  classify,
} from "./gen_section9.mjs";

const APPLY = process.argv.includes("--apply");

// careTier — reproduced verbatim from gen_section9_tiers.mjs (not exported there).
const TIER_SENS_FILES = new Set([
  "chi-si-cach-mang.json",
  "di-tich-cach-mang.json",
  "anh-hung-can-hien-dai.json",
  "nghia-si-can-vuong.json",
  "thieu-nien-anh-hung.json",
  "me-vnah.json",
]);
const TIER_SENS_RE =
  /cách mạng|kháng chiến|liệt sĩ|chiến tranh|VNAH|anh hùng LLVT|cộng sản|đảng|mặt trận|du kích|biệt động/i;
function careTier(file, item, sensitiveIds) {
  if (TIER_SENS_FILES.has(file)) return "TIER-SENS";
  if (item.id && sensitiveIds.has(`${file}::${item.id}`)) return "TIER-SENS";
  const text = [item.ten, item.mo_ta, item.cong_trang].filter(Boolean).join(" ");
  if (TIER_SENS_RE.test(text)) return "TIER-SENS";
  return "TIER-MODERN";
}

const CAMPAIGN_FILE = "chien-dich-tran-danh.json";

// High Party/State office or known controversy — held back from the modern-people
// bucket per Iron Man's condition. Matched as a substring of item.ten.
const EXCLUDE_NAMES = [
  "Nguyễn Khoa Điềm",
  "Nguyễn Đình Tứ",
  "Vũ Đình Cự",
  "Hoàng Phủ Ngọc Tường",
  "Tôn Thất Đàn",
  "Nguyễn Khoa Toàn",
  "Phạm Song",
  "Nguyễn Trọng Nhân",
  "Đặng Thai Mai",
  "Nông Văn Lạc",
];
const isExcludedName = (ten) =>
  EXCLUDE_NAMES.some((n) => (ten || "").includes(n));

function decide(file, item, sensitiveIds) {
  const c = classify(file, item, sensitiveIds);
  if (!c.care) return { promote: true, why: "SAFE" };
  const tier = careTier(file, item, sensitiveIds);
  if (tier === "TIER-SENS") return { promote: false, why: "TIER-SENS" };
  if (file === CAMPAIGN_FILE) return { promote: false, why: "chiến dịch quân sự" };
  if (isExcludedName(item.ten)) return { promote: false, why: "tên chính trị (giữ soát tay)" };
  return { promote: true, why: "TIER-MODERN phi chính trị" };
}

function main() {
  const sensitiveIds = loadSensitiveIds();
  const perFile = {};
  const promoted = [];
  const heldModern = []; // campaigns + excluded names (were candidate MODERN, held back)
  let total = 0;

  for (const file of listOverlayFiles()) {
    const ov = readOverlay(file, (f, e) => console.log("PARSE-ERR", f, e.message));
    if (!ov) continue;
    const { data, items } = ov;
    const full = path.join(OVERLAYS_DIR, file);
    const raw = fs.readFileSync(full, "utf8");
    let changed = 0;

    for (const item of items) {
      if (item.trang_thai !== "draft") continue;
      const d = decide(file, item, sensitiveIds);
      if (d.promote) {
        promoted.push({ file, ten: item.ten, why: d.why });
        if (APPLY) item.trang_thai = "reviewed";
        changed++;
        total++;
      } else if (d.why === "chiến dịch quân sự" || d.why.startsWith("tên chính trị")) {
        heldModern.push({ file, ten: item.ten, why: d.why });
      }
    }

    if (changed) perFile[file] = changed;

    if (APPLY && changed) {
      const canonical = JSON.stringify(data, null, 2) + "\n";
      const roundTripOk = JSON.stringify(JSON.parse(raw), null, 2) + "\n" === raw;
      if (!roundTripOk) console.log(`[${file}] WARNING: round-trip mismatch — file reformatted (still valid JSON)`);
      fs.writeFileSync(full, canonical, "utf8");
    }
  }

  console.log(APPLY ? "=== APPLIED ===" : "=== DRY-RUN (no writes) ===");
  console.log("Per-file promote counts:");
  for (const [f, n] of Object.entries(perFile).sort((a, b) => b[1] - a[1]))
    console.log(`  ${String(n).padStart(3)}  ${f}`);
  console.log(`TOTAL promote: ${total}`);
  console.log(`\nHeld back from modern bucket (campaigns + political names): ${heldModern.length}`);
  for (const h of heldModern) console.log(`  - ${h.ten}  [${h.file}]  (${h.why})`);
}

main();
