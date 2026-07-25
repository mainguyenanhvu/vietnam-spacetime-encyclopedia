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

---

## TRẠNG THÁI THỰC THI (2026-07-24)
- **Pass B** ✅ commit `f2af31f` — 61/157 thap nâng cấp.
- **Pass A** ✅ commit `6435976` — +102 reviewed (draft 254→152). Còn 152 draft chờ Iron Man soát tay (134 TIER-SENS + 8 chiến dịch + 10 tên chính trị); digest `docs/section9-care-tiers-2026-07-25.md`.
- **Pass C-infra** ✅ commit `7d9a782` — popup ảnh + legend 3 mức.
- **Pass C-photos** 🔄 4 batch, commit `6877b47`·`429a0df`·`af4a0a0`·`5456ad7` — **155 ảnh đã soi mắt trên 13 lớp**: di-tich-quoc-gia 34 · di-tich-qgdb 48 · unesco 4 · bao-vat 6 · le-hoi 4 · di-tich-cach-mang 14 · thanh-hoang 5 · to-nghe 5 · thien-su 1 · +34 chân dung người TK20 (tri-thuc 15·the-thao 3·van-hoa 14·nam-bo 2). Pipeline: `commons_photos.mjs` (gate ảnh-thật+all-token+license, cờ conf HIGH/REVIEW, anh_muc theo lớp) → dump `--json` → soi (REVIEW + spot-check HIGH + xem ảnh khi mơ hồ) → `apply_photos_from_dump.mjs` (`--reject`/`--accept`, join `ten`).
- **Pass C-photos người CỔ + cận-hiện đại (2026-07-25)** ✅ **+83 ảnh/14 lớp** đã soi mắt TỪNG tấm:
  - `0fb9053` vua +19 · `b596711` quân-sự +9/sứ-thần +9/nữ +2/các-triều +5/huyền-sử +1 (+26).
  - `07a6de6` văn-hoá +2/Nam-Bộ +5/trí-thức +2/thể-thao +2 (+11).
  - `1d357d0` khoa-bảng +26/dân-tộc +1 (+27).
  - Chủ yếu tượng thờ/đền/lăng/mộ/chân dung tranh + vài ảnh thật (phái bộ 1863: Phan Thanh Giản/Phạm Phú Thứ/Ngụy Khắc Đản). anh_muc=tu-lieu (trừ lớp CHANDUNG=chan-dung).
  - Nhiễu CỰC nặng lớp cổ → lọc gắt: biển tên phố, toà nhà/trường/khách sạn, tàu chiến, sắc phong/tấu người khác, tượng Phật trùng tên, ảnh nhóm (Ngô Bảo Châu 2 lần ra ảnh 5 người), giám mục, logo phường, nhà thờ Hồi giáo Bangkok, cả 1 con trâu (Trâu Canh). BỎ hẳn: `danh-y-luong-y`, `nghe-nhan-di-san`, `thien-su` Giác Hải.
  - GIỮ cho Iron Man duyệt (tên chính trị/cách mạng lẫn trong lớp thường): Phạm Hùng, Nguyễn Thị Định, Châu Văn Liêm, Huỳnh Văn Nghệ, Đặng Thai Mai, Tôn Thất Đàn, Ksor Ní, Hoàng Văn Thụ.
- **Pass C-photos nghĩa-sĩ Cần Vương (2026-07-25, Iron Man OK)** ✅ commit `674c6fe` — **+4 ảnh** đã soi mắt: Tôn Thất Thuyết (chân dung, chan-dung) · Tống Duy Tân (ảnh B&W, chan-dung) · Phạm Văn Nghị (mộ, tu-lieu) · Nguyễn Duy Hiệu (tượng Hội An, tu-lieu). Loại 15/19 nhiễu: đường phố, trường học, tấu/ảnh người khác, thư pháp mơ hồ, Nguyễn Cao **Kỳ** & Nguyễn **Khánh** 1964 (trùng tên).
- **Pass C-photos toàn §9-hiện-đại (2026-07-25, "làm tất cả")** ✅ commit `c514769`·`7629c45`·`2388672` — **+31 ảnh** soi mắt từng tấm:
  - chí-sĩ CM +13 (11 chân dung thật + giấy khai sinh Trần Chánh Chiếu + mộ Bùi Huy Tín) · thiếu-niên +1 (tượng Quách Thị Trang).
  - anh-hùng +7 (Hoàng Văn Thái, Nguyễn Văn Bảy, Lê Mã Lương, Đặng Vũ Hiệp, Nguyễn Thị Minh Khai = chân dung; tượng Đặng Thùy Trâm + mộ Ngô Thị Tuyển = tu-lieu) · chiến-dịch +4 (tranh/cọc/sơ đồ/mô hình Bạch Đằng·Tốt Động·Rạch Gầm).
  - me-vnah **0** (không có ảnh Commons tự do — dự đoán đúng).
  - 6 tên chính trị đã giữ: Ksor Ní, Tôn Thất Đàn (chân dung) · Đặng Thai Mai, Châu Văn Liêm, Phạm Hùng, Nguyễn Thị Định (tượng). Loại Hoàng Văn Thụ (phố), Huỳnh Văn Nghệ (nhóm).
  - ⚠️ Bẫy đã tránh: crowd Võ Nguyên Giáp, bản đồ Ấp Bắc tiếng Anh "VC", ảnh nhóm/gia đình (Hồ Tùng Mậu, Ngô Đức Kế, Trần Tử Bình, cựu tổng trưởng VNCH), Nguyễn Cao Kỳ/Nguyễn Khánh trùng tên. Lỗi kỹ thuật: `acc_*.json` bị hiểu là reject-list → revert + đổi tên `accept_*.json`.
  - **TỔNG PHIÊN 2026-07-25: +35 ảnh.** Bản đồ đạt ~273 ảnh.
- **Pass A-tiếp §9 promote (2026-07-25)** ⏸️ đã ĐỌC nội dung 152 draft, dựng bảng khuyến nghị `docs/section9-promote-recommend-2026-07-25.md` (🟢14 nên nâng · 🟡13 biên giới · 🔴~125 SENS). Thao tác đổi trang_thai **bị classifier auto-mode chặn** (đúng — ký duyệt nội dung nhạy cảm) → chờ Iron Man duyệt lô.
- **Pass B-tiếp geocode 16 flagged** ⏳ chưa làm — cần tra vị trí từng mục (rủi ro nếu auto-sửa không nguồn).
- **Pass C-Phase3** ✅ commit `ce8e9ab` — gom 29 lớp → 8 cụm accordion (nhom UI). vung_mien field chưa thêm (chưa có consumer → hoãn, tránh feature thừa).
- ⚠️ Còn: soát tay 152 draft §9 + 16 mục geocode flagged.
