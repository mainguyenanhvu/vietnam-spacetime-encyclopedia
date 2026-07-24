# Plan A+B+C — «Bản đồ tri ân» (Iron Man 2026-07-24)

Lệnh: làm cả **A (duyệt §9)** + **B (soát toạ độ)** + **C (Phase 3/4)**.
Nguồn cảm hứng: https://bandotrian.thanhdoandongnai.com/ — bản đồ tưởng niệm Mẹ VNAH Đồng Nai (23 «vì sao»), **chú giải 3 mức tư liệu**: có ảnh chân dung / có trong hồ sơ / đặt theo nơi cư trú. → mẫu cho **tier ảnh + legend** của Phase 4.

## Ràng buộc orchestration (QUAN TRỌNG)
- 4 việc đều ghi vào **cùng 29 file `public/data/overlays/*.json`** → **KHÔNG song song mù**.
- Chạy **tuần tự theo pass**, mỗi pass = 1 commit + gate (`validate_overlays` + `audit_sovereignty` + `build`).
- Trong 1 pass, fan-out agent **theo file** (mỗi agent sở hữu file khác nhau → không đụng nhau).

## Trạng thái thật (đã verify 2026-07-24)
- Overlay đã gom **69→29 file**; entry keys: `id,ten,lon,lat,loai,thoi_ky,noi_tho,cong_trang,nhan_hinh_dung,do_tin_cay_toa_do,nguon,trang_thai`.
- Toạ độ `do_tin_cay_toa_do`: **cao 436 · trung 850 · thap 157**.
- **Chưa có field `anh`** ở bất kỳ file nào (Phase 4 chưa động data).
- **Chưa có `nhom`/`vung_mien`** (Phase 3 gom file xong, enrichment chưa).
- `trang_thai`: reviewed 1260 · draft 254.
- §9 docs sẵn: `docs/section9-review-digest-2026-07-24.md`, `docs/section9-sensitive.json`.
- Popup builder ở `src/main.ts` ~L1132–1187: `mo_ta ?? cong_trang`, `dia_diem ?? noi_tho`. Điểm chèn `<img>` cho Phase 4.
- ⚠️ Script scratchpad phiên cũ (promote/geo) đã mất → **tái tạo vào `scripts/`** (commit được, tái dùng).

## Thứ tự pass (đề xuất)
### Pass B — Soát toạ độ (làm trước; cơ học, không cần phán đoán)
- Mục tiêu: nâng **157 mục `thap`** → `trung`/`cao` bằng geocode chính xác.
- Script `scripts/regeocode.mjs`: Nominatim + `geoBounded` (kiểm biên vĩ độ theo tỉnh, chống khớp nhầm) + tên tỉnh **mới sau sáp nhập 2025**.
- Fan-out agent theo file; mỗi agent chỉ sửa `lon/lat/do_tin_cay_toa_do` file mình.
- ✅ Done: mọi `thap` được thử lại; báo cáo nâng được bao nhiêu; validator+build xanh.

### Pass A — §9 duyệt
- Regenerate digest trên **254 draft** hiện tại (`scripts/gen_section9.mjs`): SAFE (tiền hiện đại phi chính trị) vs CARE (≥1900/chính trị/chiến tranh/liệt sĩ/VNAH).
- **Auto-promote SAFE** draft→reviewed (`scripts/promote_section9.mjs --apply`), loại trừ theo `section9-sensitive.json`.
- CARE → **bảng khuyến nghị per-item cho Iron Man duyệt lô** (không tự nâng).
- ✅ Done: SAFE nâng xong; bảng CARE trình Iron Man; validator+build xanh.

### Pass C — Phase 4 (ảnh + tier legend) rồi Phase 3 (nhom/vung_mien)
- **Phase 4** (trọng tâm, khớp nguồn tham khảo):
  - Schema: thêm `anh` (URL ổn định), `anh_nguon`, `anh_giay_phep`, `anh_muc` (chan-dung/tu-lieu/vi-tri = 3 tier legend).
  - Wire popup `src/main.ts`: render `<img>` lazy + attribution khi có `anh`; legend 3 mức.
  - Nguồn (đã chốt 2026-07-22): cổng nhà nước/bảo tàng/báo ưu tiên + Wikimedia **Commons** bổ khuyết; **KHÔNG** bài chữ Wikipedia.
  - **Pilot trước**: ~30–50 danh nhân giá trị cao có ảnh Commons/cổng rõ license; log % phủ; loop mở rộng sau.
- **Phase 3 enrichment** (polish cuối): thêm `nhom` + `vung_mien`, accordion layer-control theo cụm.
- ✅ Done: popup hiện ảnh + legend; pilot có ảnh; validator+build xanh.

## Gate mỗi commit
`node scripts/validate_overlays.mjs` · `node scripts/audit_sovereignty.mjs` · `npm run build`

## Cần quyết
- Phase 4 phạm vi ảnh: **pilot 30–50** (khuyến nghị) vs **chiến dịch phủ ảnh toàn bộ**.
