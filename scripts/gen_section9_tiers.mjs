#!/usr/bin/env node
// §9 CARE sub-tiering: splits the CARE bucket (from gen_section9.mjs) into
// TIER-SENS (genuinely sensitive: war/revolution/martyr/security content)
// and TIER-MODERN (modern but politically neutral: scientists, athletes,
// artists, ethnic-minority cultural figures, monks, kings, envoys, etc.).
// Read-only: does not touch public/data/overlays/*.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  listOverlayFiles,
  readOverlay,
  classify,
  loadSensitiveIds,
} from './gen_section9.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TIER_SENS_FILES = new Set([
  'chi-si-cach-mang.json',
  'di-tich-cach-mang.json',
  'anh-hung-can-hien-dai.json',
  'nghia-si-can-vuong.json',
  'thieu-nien-anh-hung.json',
  'me-vnah.json',
]);

const TIER_SENS_RE = /cách mạng|kháng chiến|liệt sĩ|chiến tranh|VNAH|anh hùng LLVT|cộng sản|đảng|mặt trận|du kích|biệt động/i;

function careTier(file, item, sensitiveIds) {
  if (TIER_SENS_FILES.has(file)) return 'TIER-SENS';
  if (item.id && sensitiveIds.has(`${file}::${item.id}`)) return 'TIER-SENS';
  const text = [item.ten, item.mo_ta, item.cong_trang].filter(Boolean).join(' ');
  if (TIER_SENS_RE.test(text)) return 'TIER-SENS';
  return 'TIER-MODERN';
}

function fileBase(f) {
  return f.replace(/\.json$/, '');
}

function groupByFile(list) {
  const map = new Map();
  for (const r of list) {
    if (!map.has(r.file)) map.set(r.file, []);
    map.get(r.file).push(r);
  }
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
}

function main() {
  const sensitiveIds = loadSensitiveIds();
  const files = listOverlayFiles();
  const errors = [];
  const careItems = [];

  for (const file of files) {
    const overlay = readOverlay(file, (f, e) => errors.push(`${f}: ${e.message}`));
    if (!overlay) continue;
    for (const item of overlay.items) {
      if (item.trang_thai !== 'draft') continue;
      const c = classify(file, item, sensitiveIds);
      if (!c.care) continue; // only sub-tiering the CARE bucket
      const tier = careTier(file, item, sensitiveIds);
      careItems.push({ file, ten: item.ten, yearDisplay: c.yearDisplay, tier });
    }
  }

  const sens = careItems.filter((r) => r.tier === 'TIER-SENS');
  const modern = careItems.filter((r) => r.tier === 'TIER-MODERN');

  // ---- console summary ----
  console.log(`CARE total: ${careItems.length} — TIER-SENS: ${sens.length} · TIER-MODERN: ${modern.length}`);
  console.log(`Sanity: ${sens.length} + ${modern.length} = ${sens.length + modern.length} (expect 234)`);
  console.log('');
  console.log('TIER-SENS per file:');
  for (const [file, items] of groupByFile(sens)) console.log(`  ${fileBase(file).padEnd(30)} ${items.length}`);
  console.log('');
  console.log('TIER-MODERN per file:');
  for (const [file, items] of groupByFile(modern)) console.log(`  ${fileBase(file).padEnd(30)} ${items.length}`);
  if (errors.length) {
    console.log('Parse errors:');
    for (const e of errors) console.log(`  - ${e}`);
  }

  // ---- markdown digest ----
  const lines = [];
  lines.push('# §9 CARE sub-tiering — TIER-SENS vs TIER-MODERN (2026-07-25)');
  lines.push('');
  lines.push('> Read-only pass over the 234 CARE drafts from docs/section9-review-digest-2026-07-25.md.');
  lines.push('> **TIER-SENS** = war/revolution/martyr/security content — soát kỹ từng mục, không duyệt lô.');
  lines.push('> **TIER-MODERN** = hiện đại (≥1900) nhưng phi chính trị (khoa học/thể thao/nghệ thuật/dân tộc thiểu số văn hoá/thiền sư/vua/sứ thần...) — ứng viên duyệt lô sau khi Iron Man xác nhận.');
  lines.push('');
  lines.push(`## Tổng CARE: ${careItems.length} — **TIER-SENS ${sens.length}** · **TIER-MODERN ${modern.length}**`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## TIER-SENS — soát kỹ từng mục (per-file counts + 5 ví dụ)');
  lines.push('');
  for (const [file, items] of groupByFile(sens)) {
    lines.push(`### ${fileBase(file)} (${items.length})`);
    for (const r of items.slice(0, 5)) {
      lines.push(`- ${r.ten}  ·  ${r.yearDisplay}`);
    }
    if (items.length > 5) lines.push(`- … +${items.length - 5} mục khác`);
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  lines.push('## TIER-MODERN — ứng viên duyệt lô (danh sách đầy đủ)');
  lines.push('');
  for (const [file, items] of groupByFile(modern)) {
    lines.push(`### ${fileBase(file)} (${items.length})`);
    for (const r of items) {
      lines.push(`- ${r.ten}  ·  ${r.yearDisplay}`);
    }
    lines.push('');
  }

  const outPath = path.join(ROOT, 'docs', 'section9-care-tiers-2026-07-25.md');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log('');
  console.log(`Written: ${outPath}`);
}

main();
