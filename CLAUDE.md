# vietnam_encyclopedia — project guide for Claude Code

**Bách khoa Việt Nam — Không gian & Thời gian.** An open-source educational site: Vietnam's territorial history on an interactive map, from Văn Lang – Âu Lạc through the dynasties to the 2025 reorganisation into 34 provinces/cities. Drag the timeline → administrative boundaries change; click a province → its full encyclopedia page.

> Read this file first (the map). **`PLAN.md` is the single plan file** — it holds everything still to do. Finished work moves to `RELEASE.md`. Superseded plans live in `docs/lich-su/`; read them for decision history, **never for current numbers**.

---

## 🔴 Content invariants — non-negotiable, check before any data edit

1. **Sovereignty.** Quần đảo **Hoàng Sa** and quần đảo **Trường Sa** are Vietnamese territory and must be rendered on **every map, in every period**. A map layer, style change, or bbox crop that drops them is a release blocker, not a styling detail.
2. **Legal compliance.** Content follows Vietnamese law, including **Luật Đo đạc và Bản đồ 2018**. Boundary rendering is a legal surface, not just a visual one.
3. **Mandatory citation.** Every data entry carries a `sources[]` field pointing to an official source — Cổng TTĐT Chính phủ, Tổng cục Thống kê, NXB Chính trị quốc gia Sự thật, NXB Giáo dục, Viện Sử học. **An entry without `sources[]` does not ship.** Never invent a date, a decree number, or a population figure to fill a gap — leave it empty and flag it.
4. **Historical accuracy over narrative appeal.** Where sources conflict (see `docs/ranh-gioi-1887-1895-phan-quyet.md`), present the conflict; do not silently pick the tidier version.
5. **Sensitive entries** are tracked in `docs/section9-sensitive.json` — read it before editing anything it lists.

## Stack

- **Vite 5 + TypeScript 5.6**, ES modules, Node ≥ 20.
- **MapLibre GL JS 4.7** — interactive map, deliberately no API key and no vendor lock-in.
- **Three.js 0.185** (pinned exactly, with matching `@types/three`) — 3D reconstructions, landmarks, ocean.
- **Static JSON/GeoJSON in-repo. No backend.** This is what keeps hosting free — do not introduce a server dependency without saying so explicitly.

## Commands

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc && vite build → dist/
npm run preview
npm run validate   # node scripts/run_validators.mjs — data integrity
```

`npm run validate` is the project's own data gate. **Run it after any change under the data files**, and treat a failure as blocking.

## Layout

- `src/` — flat TS modules by feature: `timeline`, `quocgia`, `panels`, `search`, `story`, `journey`, `battle`, `quiz`, `olympia`, and the 3D set (`models3d`, `landmarks3d`, `figures3d`, `ocean3d`).
- `scripts/` — validators and data tooling.
- `docs/` — `image-generation-spec.xml`, `section9-sensitive.json`, `ranh-gioi-1887-1895-phan-quyet.md`, `references/`, `research/`. Superseded material is under `docs/lich-su/`.
- `public/` · `dist/` (generated) · `.github/`

**Do not create new `*-plan.md` files.** One plan file, `PLAN.md`, is the rule.

## Before you search or edit data

Read `public/data/_index/catalog.json` first — one file per data file, with entry count, wrapper shape, source-field name, and a one-line description. Then `public/data/_index/entries-index.json` for entry-level lookup (~4.500 entries, flat) and its `trung_ten` / `trung_toa_do` blocks for duplicate detection. Open the source JSON only once you have narrowed the target. Globbing 98 files blind is the thing these indexes exist to replace.

Both are generated: `node scripts/build_catalog.mjs && node scripts/build_entries_index.mjs`. `validate_catalog_freshness.mjs` fails the data gate if they drift from the real files — regenerate rather than hand-editing them.

## Verification — what proves a change works

| Change | Proof |
|---|---|
| Data (JSON/GeoJSON) | `npm run validate` **plus** load the affected period in the browser and confirm the boundary renders. |
| Map / boundary rendering | Open the map at that period and **visually confirm Hoàng Sa + Trường Sa are present**. A passing build proves nothing here. |
| 3D scene | Render it; check the console is clean and it does not tank frame rate on a mid laptop. |
| Any build | `npm run build` — this runs `tsc`, so a type error fails the build. |

Per the global rule: a green `tsc` is not evidence the map is correct. Look at it.

## Conventions

- Vietnamese for all user-facing strings, place names, and content. Keep proper diacritics — a stripped-diacritic name is a data error.
- Dates ISO 8601 in data; Vietnamese display formatting in UI.
- Three.js version is pinned exactly on purpose; keep `three` and `@types/three` in lockstep.
- Git: ad-hoc project — commit logical chunks and report, push freely, ask before opening a PR. Branch prefixes `feat/`, `fix/`, `chore/`, `docs/`.
