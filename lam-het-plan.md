# 🏯 "Làm hết" — kế hoạch (Iron Man 2026-07-22)

Mục tiêu: dứt điểm 3 nhánh treo còn lại của tên đường + tiếp sóng người.

## Nhánh A — Builder tên đường (deterministic, chắc ăn, làm trước)
- [ ] A1. `buildCatalog` quét THÊM `public/data/figures/danh-nhan.json` (255 người) —
      **ưu tiên overlay**: key đã có từ overlay thì bỏ qua figures (không đánh AMBIGUOUS →
      không mất match cũ). Chỉ THÊM tên figures-only (VD tướng Nguyễn Bình 1908–1951).
- [ ] A2. Bảng `OSM_ALIAS` cho 3 mục OSM gõ sai dấu (đã xác minh nguồn):
      "Bùi Cẩm Hổ"→bui-cam-ho · "Nguyễn Thị Thử"→nguyen-thi-thu · "Trương Quốc Dung"→truong-quoc-dung.
      KHÔNG nới matchKey (giữ Bình≠Bính). Link gắn cờ `osm_sai_dau`.
- [ ] A3. Guard chống mất dữ liệu: nếu thành phố TỪNG ok nay fetch lỗi → KHÔNG ghi đè pilot,
      ghi ra `*.regen-failed.json` + exit≠0. Bảo vệ HCMC 224 match.
- [ ] A4. Emit `_alias_ap_dung` + `_ghi_chu_lech_thanh` (Lê Thân, Nguyễn Thiếp: cố ý không khớp).

## Nhánh A' — Chạy builder + Overpass HN/ĐN
- [ ] Chạy `node scripts/build_street_names.mjs`. Kỳ vọng: HCMC giàu hơn (figures+alias);
      thử lại HN/ĐN (mạng, có thể vẫn timeout — guard sẽ bảo vệ).

## Nhánh B — Wire tên đường lên bản đồ MapLibre
- [ ] Lớp phủ mới trong `src/main.ts`: điểm centroid mỗi đường-danh-nhân, popup tên đường +
      danh nhân + số đoạn + attribution ODbL. Toggle trong panel lớp phủ. Màu riêng chưa dùng.
- [ ] validate + build + commit.

## Nhánh C — Sóng 19 danh nhân
- [ ] Chrome→Google seed tên ứng viên (DDG CAPTCHA gắt) → 3 agent sonnet nền (WebFetch, KHÔNG
      WebSearch) mỗi agent 1 file → gộp + wire + gate + commit.

## Cổng CI mỗi commit
`node scripts/validate_overlays.mjs` ✅ · `node scripts/audit_sovereignty.mjs` ✅ · `npm run build` ✅

## ✅ TRẠNG THÁI HOÀN TẤT (2026-07-22)
- Nhánh A (builder figures/+alias+guard) · A' (fetch 3 TP nhờ header+mirror) · B (wire bản đồ):
  commit `4d8132f` — pilot 224→**1137 liên kết / 459 danh nhân** (HN 331 · HCM 421 · ĐN 385).
- Nhánh C (Sóng 19): commit `4cfba92` — +37 danh nhân (Huế 12 · nữ 12 · miền núi 13), 3 lớp mới.
- Fix thanh điệu tên đường: `c7d00e2` `d23daa0`. Tất cả 3 cổng CI xanh mỗi commit.
- CÒN LẠI (việc người): duyệt §9; xác minh đường "Nguyễn Thiệp" (Q1) vinh danh ai; retry rollout
  tên đường ra tỉnh khác khi cần.
