#!/usr/bin/env node
// §9 sensitivity classifier: scans all overlay files, classifies each DRAFT
// entry as SAFE (auto-promotable) or CARE (needs human review), and writes
// a review digest under docs/. See docs/section9-review-digest-2026-07-24.md
// for the reference format this mirrors.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
export const OVERLAYS_DIR = path.join(ROOT, 'public', 'data', 'overlays');
const SENSITIVE_IDS_PATH = path.join(ROOT, 'docs', 'section9-sensitive.json');

// (b) source files treated as sensitive layers wholesale.
export const SENSITIVE_FILES = new Set([
  'chi-si-cach-mang.json',
  'di-tich-cach-mang.json',
  'anh-hung-can-hien-dai.json',
  'danh-nhan-dan-toc-thieu-so.json',
  'nghia-si-can-vuong.json',
  'thieu-nien-anh-hung.json',
  'tri-thuc-khoa-hoc-tk20.json',
  'me-vnah.json',
  'danh-nhan-van-hoa-can-hien-dai.json',
]);

// (c) political/war terms. "khởi nghĩa" alone on an ancient entry (max-year
// < 1900) does NOT count — the max-year test wins for that one term.
const POLITICAL_RE = /cách mạng|kháng chiến|liệt sĩ|đảng|chiến tranh|VNAH|anh hùng LLVT|cộng sản|khởi nghĩa/gi;
const YEAR_RE = /\b(1[0-9]{3}|20[0-9]{2}|2100)\b/g;

export function loadSensitiveIds() {
  const set = new Set();
  if (!fs.existsSync(SENSITIVE_IDS_PATH)) return set;
  const raw = JSON.parse(fs.readFileSync(SENSITIVE_IDS_PATH, 'utf8'));
  for (const entry of raw) {
    if (entry.file && entry.id) set.add(`${entry.file}::${entry.id}`);
  }
  return set;
}

export function listOverlayFiles() {
  return fs.readdirSync(OVERLAYS_DIR).filter((f) => f.endsWith('.json')).sort();
}

// Returns null (and reports via onError) if a file fails to parse, instead
// of crashing the whole run.
export function readOverlay(file, onError) {
  const full = path.join(OVERLAYS_DIR, file);
  try {
    const raw = fs.readFileSync(full, 'utf8');
    const data = JSON.parse(raw);
    const items = Array.isArray(data) ? data : data.items;
    return { data, items: items || [] };
  } catch (e) {
    if (onError) onError(file, e);
    return null;
  }
}

// (a) MAX year mentioned across nam / nam_hien_thi / thoi_ky.
export function maxYear(item) {
  const text = [item.nam, item.nam_hien_thi, item.thoi_ky]
    .filter((v) => v !== undefined && v !== null)
    .map(String)
    .join(' ');
  const matches = text.match(YEAR_RE);
  if (!matches) return null;
  return Math.max(...matches.map(Number));
}

function yearDisplay(item) {
  return item.nam_hien_thi || item.thoi_ky || (item.nam !== undefined ? String(item.nam) : '');
}

export function classify(file, item, sensitiveIds) {
  const reasons = [];
  const year = maxYear(item);
  if (year !== null && year >= 1900) reasons.push(`năm ${year}`);
  if (SENSITIVE_FILES.has(file)) reasons.push('lớp nhạy cảm');

  const text = [item.ten, item.mo_ta, item.cong_trang].filter(Boolean).join(' ');
  const matches = [...text.matchAll(POLITICAL_RE)].map((m) => m[0].toLowerCase());
  for (const word of new Set(matches)) {
    if (word === 'khởi nghĩa') {
      if (year !== null && year >= 1900) reasons.push(`từ khoá "khởi nghĩa" (năm ${year})`);
    } else {
      reasons.push(`từ khoá "${word}"`);
    }
  }

  if (item.id && sensitiveIds.has(`${file}::${item.id}`)) reasons.push('trong section9-sensitive.json');

  return { care: reasons.length > 0, reasons, year, yearDisplay: yearDisplay(item) };
}

function buildDigest(results) {
  const total = results.length;
  const safe = results.filter((r) => !r.care);
  const care = results.filter((r) => r.care);

  const groupByFile = (list) => {
    const map = new Map();
    for (const r of list) {
      if (!map.has(r.file)) map.set(r.file, []);
      map.get(r.file).push(r);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  };

  const lines = [];
  lines.push(`# §9 review digest — draft chờ duyệt (2026-07-25)`);
  lines.push('');
  lines.push('> Cờ **SAFE** = tiền hiện đại, phi chính trị (đền/tháp/khảo cổ/thiền sư/khoa bảng cổ) — duyệt nhanh theo lô.');
  lines.push('> Cờ **CARE** = hiện đại (≥1900) hoặc dính chính trị/chiến tranh/liệt sĩ/VNAH — Iron Man soát kỹ từng mục.');
  lines.push('> (Bộ lọc thô: «khởi nghĩa/kháng chiến» cổ đại có thể bị gắn CARE oan — đọc niên đại.)');
  lines.push('');
  lines.push(`## Tổng: ${total} draft — **${safe.length} SAFE** (duyệt lô) · **${care.length} CARE** (soát kỹ)`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## ✅ SAFE — duyệt nhanh theo lớp');
  lines.push('');
  const fileBase = (f) => f.replace(/\.json$/, '');
  for (const [file, items] of groupByFile(safe)) {
    lines.push(`### ${fileBase(file)} (${items.length})`);
    for (const r of items) {
      lines.push(`- ${r.ten}  ·  ${r.yearDisplay}`);
    }
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  lines.push('## ⚠️ CARE — soát kỹ từng mục');
  lines.push('');
  for (const [file, items] of groupByFile(care)) {
    lines.push(`### ${fileBase(file)} (${items.length})`);
    for (const r of items) {
      lines.push(`- ${r.ten}  ·  ${r.yearDisplay}  (lý do: ${r.reasons.join('; ')})`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function main() {
  const sensitiveIds = loadSensitiveIds();
  const files = listOverlayFiles();
  const results = [];
  const errors = [];

  for (const file of files) {
    const overlay = readOverlay(file, (f, e) => errors.push(`${f}: ${e.message}`));
    if (!overlay) continue;
    for (const item of overlay.items) {
      if (item.trang_thai !== 'draft') continue;
      const c = classify(file, item, sensitiveIds);
      results.push({ file, id: item.id, ten: item.ten, ...c });
    }
  }

  const digest = buildDigest(results);
  const outPath = path.join(ROOT, 'docs', 'section9-review-digest-2026-07-25.md');
  fs.writeFileSync(outPath, digest, 'utf8');

  const safeCount = results.filter((r) => !r.care).length;
  const careCount = results.filter((r) => r.care).length;
  console.log(`Scanned ${files.length} overlay files (${errors.length} errors).`);
  console.log(`Draft total: ${results.length} — SAFE: ${safeCount} · CARE: ${careCount}`);
  console.log(`Digest written: ${outPath}`);
  if (errors.length) {
    console.log('Parse errors:');
    for (const e of errors) console.log(`  - ${e}`);
  }
}

// Only run when executed directly (not when imported by promote_section9.mjs).
const isMain = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);
if (isMain) {
  main();
}
