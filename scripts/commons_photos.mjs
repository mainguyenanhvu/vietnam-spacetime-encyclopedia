#!/usr/bin/env node
/**
 * Fill anh/anh_nguon/anh_giay_phep/anh_muc for map overlay entries by
 * searching Wikimedia Commons (media repo — NOT Wikipedia article text,
 * which is banned for this project).
 *
 * Usage:
 *   node scripts/commons_photos.mjs [--file <name.json>] [--apply] [--limit <n>]
 *
 * Default is DRY RUN (no files written). Pass --apply to write changes.
 */

import fs from "fs";
import path from "path";

const OVERLAYS_DIR = path.resolve("public/data/overlays");
const USER_AGENT = "vn-encyclopedia-photos/1.0 (mnav.tkonline@gmail.com)";
const SLEEP_MS = 500;

const FREE_LICENSE_RE =
  /\b(cc[\s-]?by(?:[\s-]?sa)?|cc0|public domain|pd[\s-]?(us|old|art)?)\b/i;
const REJECT_LICENSE_RE = /\b(fair use|non-free|all rights reserved)\b/i;

// Generic words dropped when extracting distinctive tokens from `ten`.
const STOPWORDS = new Set([
  "thanh", "den", "chua", "thap", "di", "tich", "co", "khu", "hoc", "van",
  "hoa", "of", "the", "quoc", "gia", "lang", "nha", "tho", "mieu", "cang",
  "dinh", "lich", "su", "khao", "danh", "thang", "cang", "hang", "cau",
  "gieng", "dan", "te", "toa", "am", "vien", "khmer", "phat", "giao",
  "cach", "mang", "cu", "vua", "tuong", "linh", "mo", "thi", "tran",
  "huyen", "tinh", "xa", "phuong", "quan",
]);

function args() {
  const a = process.argv.slice(2);
  const out = { file: null, apply: false, limit: Infinity, json: null, reject: null };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--file") out.file = a[++i];
    else if (a[i] === "--apply") out.apply = true;
    else if (a[i] === "--limit") out.limit = parseInt(a[++i], 10);
    else if (a[i] === "--json") out.json = a[++i]; // dump matched candidates here
    else if (a[i] === "--reject") out.reject = a[++i]; // JSON array of id/ten to skip on apply
  }
  return out;
}

// Load a reject list (array of entry `id` or `ten`) so --apply writes every
// matched entry EXCEPT ones a human flagged as wrong.
function loadRejectSet(p) {
  if (!p) return new Set();
  const arr = JSON.parse(fs.readFileSync(p, "utf8"));
  return new Set(arr.map(String));
}

// Diacritics-insensitive normalize: lowercase, strip Vietnamese diacritics,
// collapse punctuation to spaces.
function normalize(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function distinctiveTokens(ten) {
  const norm = normalize(ten);
  const tokens = norm.split(" ").filter((t) => t && !STOPWORDS.has(t) && t.length > 1);
  return tokens;
}

function stripHtml(s) {
  if (!s) return "";
  return s.replace(/<[^>]*>/g, "").trim();
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchCommons(query) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json" +
    "&generator=search&gsrnamespace=6&gsrlimit=6" +
    "&gsrsearch=" + encodeURIComponent(query) +
    "&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=320";

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for query "${query}"`);
  const json = await res.json();
  const pages = json?.query?.pages;
  if (!pages) return [];
  return Object.values(pages).map((p) => ({
    title: p.title, // e.g. "File:Thap Bang An.jpg"
    imageinfo: p.imageinfo?.[0] || null,
  }));
}

// Find best candidate passing the match gate + license gate.
function pickBest(ten, candidates) {
  const tokens = distinctiveTokens(ten);
  if (tokens.length === 0) return { result: null, reason: "no-distinctive-tokens" };

  let sawLicenseReject = false;
  let best = null;
  let bestScore = -1;

  // Single short distinctive token is too ambiguous (e.g. "Thành Hồ" -> "ho",
  // "Châu Sa" -> "sa" match unrelated files). Require either >=2 distinctive
  // tokens, or one long (>=5 char) distinctive token.
  if (tokens.length === 1 && tokens[0].length < 5) {
    return { result: null, reason: "single-short-token" };
  }

  let sawDocReject = false;
  for (const c of candidates) {
    if (!c.imageinfo) continue;
    // Photos only — reject document scans (.pdf/.djvu), vector (.svg), media.
    if (!/\.(jpe?g|png|gif|tiff?|webp)$/i.test(c.title)) { sawDocReject = true; continue; }
    const fileTitleNorm = normalize(c.title.replace(/^file:/i, "").replace(/\.[a-z0-9]+$/i, ""));

    const matchedTokens = tokens.filter((t) => fileTitleNorm.includes(t));
    // ALL distinctive tokens must be present (not just one).
    if (matchedTokens.length < tokens.length) continue; // fails match gate

    const meta = c.imageinfo.extmetadata || {};
    const licenseShort = meta.LicenseShortName?.value || "";
    if (REJECT_LICENSE_RE.test(licenseShort) || !FREE_LICENSE_RE.test(licenseShort)) {
      sawLicenseReject = true;
      continue; // fails license gate
    }

    // Score: more matched tokens, then prefer larger images.
    const width = c.imageinfo.width || 0;
    const score = matchedTokens.length * 100000 + width;
    if (score > bestScore) {
      bestScore = score;
      best = { candidate: c, license: licenseShort, matchedTokens };
    }
  }

  if (best) return { result: best, reason: null };
  return { result: null, reason: sawLicenseReject ? "license-reject" : "no-match" };
}

function buildAnhFields(ten, best) {
  const info = best.candidate.imageinfo;
  const meta = info.extmetadata || {};
  // Commons Artist metadata is sometimes a giant multi-line credit dump; keep
  // the first line and cap length so anh_nguon stays a short attribution.
  let artist = stripHtml(meta.Artist?.value) || "không rõ tác giả";
  artist = artist.split("\n")[0].trim();
  if (artist.length > 100) artist = artist.slice(0, 100).trim() + "…";
  if (!artist) artist = "không rõ tác giả";
  return {
    anh: info.thumburl,
    anh_nguon: `Wikimedia Commons — ${artist} · ${info.descriptionurl}`,
    anh_giay_phep: best.license,
    anh_muc: "tu-lieu",
  };
}

async function processFile(fileName, opts) {
  const filePath = path.join(OVERLAYS_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  const items = Array.isArray(data) ? data : data.items;

  const roundtripOk = JSON.stringify(data, null, 2) + "\n" === raw;
  if (!roundtripOk) {
    console.warn(`WARNING: ${fileName} does not round-trip through JSON.stringify(...,null,2). Re-stringify may reformat the file.`);
  }

  const matched = [];
  const unmatched = [];
  const licenseRejected = [];

  let processed = 0;
  for (const item of items) {
    if (processed >= opts.limit) break;
    if (item.anh) continue; // already has a photo, skip
    processed++;

    const query = item.ten;
    let candidates;
    try {
      candidates = await searchCommons(query);
    } catch (err) {
      console.error(`ERROR searching "${query}": ${err.message}`);
      unmatched.push({ ten: item.ten, reason: "search-error" });
      await sleep(SLEEP_MS);
      continue;
    }

    const { result, reason } = pickBest(item.ten, candidates);
    if (result) {
      const fields = buildAnhFields(item.ten, result);
      const rejected = opts.rejectSet.has(String(item.id)) || opts.rejectSet.has(item.ten);
      // HIGH = the entry's full name (minus parenthetical) appears as a
      // contiguous substring of the file title -> safe to auto-accept.
      // REVIEW = only partial/token overlap -> a human should eyeball it.
      const fullTen = normalize(item.ten.replace(/\(.*?\)/g, ""));
      const titleNorm = normalize(result.candidate.title.replace(/^file:/i, "").replace(/\.[a-z0-9]+$/i, ""));
      const conf = fullTen.length >= 4 && titleNorm.includes(fullTen) ? "HIGH" : "REVIEW";
      matched.push({
        id: item.id,
        ten: item.ten,
        title: result.candidate.title,
        license: result.license,
        thumburl: fields.anh,
        conf,
        rejected,
        fields,
      });
      if (opts.apply && !rejected) Object.assign(item, fields);
    } else if (reason === "license-reject") {
      licenseRejected.push({ ten: item.ten });
    } else {
      unmatched.push({ ten: item.ten, reason });
    }

    await sleep(SLEEP_MS);
  }

  if (opts.apply && matched.length > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  }

  return { fileName, total: items.length, processed, matched, unmatched, licenseRejected };
}

async function main() {
  const opts = args();
  opts.rejectSet = loadRejectSet(opts.reject);
  const files = opts.file
    ? [opts.file]
    : fs.readdirSync(OVERLAYS_DIR).filter((f) => f.endsWith(".json"));

  console.log(`Mode: ${opts.apply ? "APPLY (writing files)" : "DRY RUN (no files written)"}`);
  console.log(`Files: ${files.join(", ")}${opts.reject ? ` · reject-list: ${opts.rejectSet.size}` : ""}`);
  console.log("");

  const allMatched = [];
  for (const file of files) {
    const result = await processFile(file, opts);
    for (const m of result.matched) allMatched.push({ file, ...m });
    console.log(`=== ${result.fileName} ===`);
    console.log(`total entries: ${result.total}, processed (no prior anh): ${result.processed}`);
    console.log(`matched: ${result.matched.length}, unmatched: ${result.unmatched.length}, license-rejected: ${result.licenseRejected.length}`);
    console.log("");
    console.log("-- Sample matches --");
    for (const m of result.matched.slice(0, 25)) {
      console.log(`${m.ten}  ->  ${m.title}  |  ${m.license}`);
    }
    console.log("");
    console.log("-- Unmatched (sample) --");
    for (const u of result.unmatched.slice(0, 15)) {
      console.log(`${u.ten}  (${u.reason})`);
    }
    console.log("");
    console.log("-- License-rejected (sample) --");
    for (const l of result.licenseRejected.slice(0, 10)) {
      console.log(`${l.ten}`);
    }
    console.log("");
  }

  if (opts.json) {
    fs.writeFileSync(opts.json, JSON.stringify(allMatched, null, 2));
    console.log(`Wrote ${allMatched.length} matched candidates to ${opts.json}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
