#!/usr/bin/env node
// §9 promotion: sets trang_thai draft -> reviewed for SAFE-classified drafts
// (see gen_section9.mjs for the SAFE/CARE rule). Defaults to dry-run; pass
// --apply to actually write the overlay files.
import fs from 'node:fs';
import path from 'node:path';
import {
  OVERLAYS_DIR,
  listOverlayFiles,
  readOverlay,
  classify,
  loadSensitiveIds,
} from './gen_section9.mjs';

const APPLY = process.argv.includes('--apply');

function main() {
  const sensitiveIds = loadSensitiveIds();
  const files = listOverlayFiles();
  const errors = [];
  const perFile = [];
  let totalPromoted = 0;
  let totalDraft = 0;

  for (const file of files) {
    const overlay = readOverlay(file, (f, e) => errors.push(`${f}: ${e.message}`));
    if (!overlay) continue;
    let promotedInFile = 0;
    let draftInFile = 0;

    for (const item of overlay.items) {
      if (item.trang_thai !== 'draft') continue;
      draftInFile++;
      const c = classify(file, item, sensitiveIds);
      if (!c.care) {
        promotedInFile++;
        if (APPLY) item.trang_thai = 'reviewed';
      }
    }

    if (draftInFile > 0) {
      perFile.push({ file, draftInFile, promotedInFile });
    }
    totalPromoted += promotedInFile;
    totalDraft += draftInFile;

    if (APPLY && promotedInFile > 0) {
      const full = path.join(OVERLAYS_DIR, file);
      fs.writeFileSync(full, JSON.stringify(overlay.data, null, 2) + '\n', 'utf8');
    }
  }

  console.log(APPLY ? 'APPLY MODE — overlay files updated.' : 'DRY RUN — no files written (pass --apply to promote).');
  console.log('');
  console.log('file                                    draft  SAFE->promote');
  for (const r of perFile.sort((a, b) => b.promotedInFile - a.promotedInFile)) {
    console.log(`${r.file.padEnd(40)} ${String(r.draftInFile).padStart(5)}  ${String(r.promotedInFile).padStart(5)}`);
  }
  console.log('');
  console.log(`Total draft: ${totalDraft} — SAFE promoted: ${totalPromoted} — remaining CARE: ${totalDraft - totalPromoted}`);
  if (errors.length) {
    console.log('Parse errors (skipped):');
    for (const e of errors) console.log(`  - ${e}`);
  }
}

main();
