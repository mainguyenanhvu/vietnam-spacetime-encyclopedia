# 🎯 Kế hoạch 4 nhánh song song (chỉ đạo Iron Man 2026-07-21)

> Iron Man: "Làm hết 4 mục" — (1) tiếp sóng người, (2) duyệt §9, (3) tên đường/phố, (4) bản đồ Xích Quỷ.
> Cách làm: mỗi nhánh 1+ agent nền; main điều phối, gộp, gate, commit. Nền tảng bất biến §1/§9 giữ nguyên.

## Trạng thái nền (mốc xuất phát)
- DB **1.183 mục · 60 lớp phủ**. HEAD `ff7c36e`. Dedup bank `existing_entities.txt` = 1183 tên.
- Route discovery: WebSearch cạn. Agent dùng `html.duckduckgo.com/html/?q=` (ổn hơn lite). DDG-lite bắt đầu CAPTCHA → main Chrome-seed khi cần.

---

## NHÁNH 1 — Tiếp sóng người (Sóng 17) · [background, rhythm quen]
- 3 agent sonnet, mỗi agent 1 file mới, WebFetch-only (html DDG), dedup 1183.
- Mạch: khoa bảng Thanh Hoá–Bắc Trung Bộ · nghĩa sĩ Cần Vương–Văn Thân bổ sung · trí thức/nhà khoa học TK20 đã mất.
- **DoD**: mỗi file validator ✅, all-draft, no-wiki; main gộp+wire+gate+commit Sóng 17.

## NHÁNH 2 — Chuẩn bị duyệt §9 · [1 agent → digest]
- Agent đọc TẤT CẢ overlay `public/data/overlays/*.json`, lọc mục `draft` NHẠY CẢM, gom theo tầng:
  T1 mới mất (2024–2026) · T2 chiến tranh/chính trị/nguyên lãnh đạo · T3 bán-huyền sử/thần tích ·
  T4 đánh giá phức tạp (thuộc địa, án oan) · T5 trùng-tên rủi ro.
- Xuất `docs/section9-review-digest.md`: bảng mỗi mục {tên, lớp, năm, tầng, lý do cờ, nguồn, đề xuất}.
- **DoD**: digest đầy đủ để Iron Man duyệt cụm → main batch-update `trang_thai`. (KHÔNG tự nâng reviewed — việc của Iron Man.)

## NHÁNH 3 — Mô hình tên đường/phố · [1 agent research → đề xuất]
- Agent research: khảo nguồn dữ liệu tên đường VN (OpenStreetMap `highway` + `name`, cổng địa phương),
  cách liên kết đường ↔ danh nhân đã có trong DB. Soạn 2–3 phương án mô hình dữ liệu + tradeoff.
- Xuất `docs/street-names-model-proposal.md`.
- **DoD**: đề xuất đủ để Iron Man chốt 1 phương án; CHƯA build tới khi chốt (quyết định người).

## NHÁNH 4 — Làm giàu bản đồ Xích Quỷ · [1 agent research → đề xuất + draft GeoJSON]
- Lớp «Cương vực Việt cổ» đã có (commit 613704b). Agent research: mô tả cương vực Xích Quỷ→Văn Lang→Âu Lạc
  theo **chính sử/học giả** (KHÔNG Wiki), khung ranh giới ước lượng + độ tin cậy thấp, giọng trung tính
  ("theo truyền thuyết/dã sử"). Đề xuất cách thể hiện (polygon mờ + nhãn niên đại).
- Xuất `docs/xichquy-map-enrichment-proposal.md` + draft GeoJSON (main review trước khi wire — §1 chủ quyền).
- **DoD**: đề xuất + draft để main/Iron Man duyệt; CHƯA wire tới khi review.

---

## Điều phối (main)
- Dispatch 6 agent nền (3 sóng + 3 nhánh mới) — độc lập, không đụng file nhau.
- Nhánh 1 → gộp+commit như thường. Nhánh 2/3/4 → thu digest/proposal, trình Iron Man, KHÔNG tự quyết định lớn.
- Cập nhật nhật ký + memory mỗi mốc.
