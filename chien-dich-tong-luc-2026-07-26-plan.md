# Chiến dịch tổng lực — 2026-07-26

Điểm xuất phát: commit `ec43b69` (sóng 10). DB 1921 mục / 33 lớp / 358 draft. 9 validator + build đều xanh.

Yêu cầu gốc của chủ dự án gồm 15 gạch đầu dòng, gom thành 5 tuyến. Bản kế hoạch này là nguồn sự thật cho chiến dịch; nhật ký từng sóng dữ liệu vẫn ghi ở `expansion-campaign-plan.md`.

---

## Nguyên tắc xuyên suốt (không thương lượng)

1. **Không Wikipedia** làm nguồn thông tin, kể cả nguồn phụ. Wikimedia Commons chỉ được dùng làm kho **ảnh**.
2. **Không bịa** — không có nguồn thì không có mục. Không đoán số quyết định, ngày tháng, toạ độ.
3. **Tuân thủ pháp luật Việt Nam** — chủ quyền, lãnh tụ, lịch sử bám nguồn chính thống và lập trường chính thức.
4. **Không sinh ảnh chân dung người có thật.** Sinh ảnh chỉ cho bối cảnh, huyền sử, icon, phục dựng hiện vật — luôn gắn nhãn "hình dung nghệ thuật".
5. **Agent không ghi vào repo.** Agent viết ứng viên ra scratchpad; main hợp nhất sau khi dry-run đối chiếu chéo cả 33 file. Quy trình 6 bước ở `docs/PROGRESS.md`.
6. **Chứng minh bằng kết quả thật** — dán output lệnh, không báo cáo bằng sự tự tin.

---

## Tuyến 1 — Kỹ thuật (wave A, đang chạy)

| Agent | Model | Phạm vi ghi | Sản phẩm |
|---|---|---|---|
| `song-nui-fix` | opus | `src/main.ts`, `src/style.css`, `src/songnui.ts` (độc quyền) | Sửa lỗi lớp sông núi không hiển thị + bằng chứng render |
| `sec-audit` | opus | chỉ đọc | Kiểm toán STRIDE/OWASP, trọng tâm DOM XSS từ JSON → popup |
| `arch-audit` | opus | chỉ đọc | Bản đồ kiến trúc `main.ts` 2632 dòng, lỗi logic, kế hoạch tách module |
| `ux-audit` | sonnet | chỉ đọc | Kiểm toán UI/UX + mobile + a11y + mật độ 1921 điểm |
| `layer-tax` | sonnet | chỉ đọc | Kiểm kê 33 lớp, chỉ ra lớp chia theo vùng miền, bản đồ gộp |
| `slop-sweep` | sonnet | chỉ đọc | Danh sách lỗi chính tả + văn AI, kèm JSON máy đọc được |

**Phân vùng chống giẫm chân**: chỉ `song-nui-fix` được sửa `src/`. Năm agent còn lại chỉ đọc, ghi kết quả ra scratchpad.

## Tuyến 2 — Dữ liệu (wave B, đang chạy)

| Agent | Model | Vỉa | Chỉ tiêu |
|---|---|---|---|
| `folklore` | sonnet | Truyền thuyết, cổ tích, sự tích địa danh, sấm, vè, ca dao, tục ngữ gắn toạ độ | ≥80 mục |
| `van-hoc` | sonnet | Thơ Bác, thơ về Bác, thơ văn yêu nước, giai thoại khoa bảng — đi tuần tự từng tác giả | ≥60 mục |
| `ban-do-co` | opus | Bản đồ cổ chủ quyền + nguồn atlas ranh giới từng thời kỳ | Phán quyết đủ/không đủ nguồn mỗi thời kỳ |
| `dia-danh-tinh` | sonnet | Địa danh nổi bật, quét lần lượt 34 tỉnh | ≥3 mục/tỉnh, ≥102 tổng |
| `anh-nhan-vat` | sonnet | Ảnh nhân vật + đặc tả sinh ảnh | ≥80 nhân vật có ảnh mới |

## Tuyến 3 — Ranh giới lịch sử (chờ `ban-do-co`)

Yêu cầu: lớp bản đồ từng tỉnh cho toàn bộ thời kỳ, **chỉ rõ đường biên** ở những thời kỳ lãnh thổ vươn lên phía bắc.

Trạng thái: Phase 2b đang 🔴 vì "không có dataset sẵn". Quyết định đã chốt: **thà không vẽ còn hơn vẽ đoán**. Nên tuyến này phụ thuộc hoàn toàn vào phán quyết từng thời kỳ của `ban-do-co`. Chỉ số hoá thời kỳ nào nó chấm `đủ`.

Ràng buộc cứng: mọi lớp ranh giới phải qua `scripts/audit_sovereignty.mjs` — đủ 11 đảo/quần đảo trọng yếu.

## Tuyến 4 — Hợp nhất lớp (chờ `layer-tax`)

Yêu cầu: bỏ lớp chia theo vùng miền, chỉ chia theo lĩnh vực.

Đã biết trước: `danh-nhan-nam-bo.json` chia theo vùng miền; `di-tich-cach-mang.json` tên sai lệch nội dung (chứa 11 vườn quốc gia, 9 danh thắng). Còn tồn Phase 3: tách per-item `danh-nhan-cac-trieu.json`, gộp `huyen-su-khai-quoc`, thêm `nhom[]` cho 9 người đa danh mục.

Thứ tự bắt buộc: **hợp nhất lớp xong rồi mới nạp sóng dữ liệu mới vào các lớp đó**, tránh xung đột file.

## Tuyến 5 — Chất lượng & tính năng (chờ audit)

- Vá theo `sec-audit` (ưu tiên DOM XSS nếu có).
- Tách module `main.ts` theo `arch-audit`, từng bước ≤150 dòng, verify bằng build + validator.
- `manualChunks` tách `maplibre-gl` khỏi `index` (hiện 919 kB), `import()` động cho three.js.
- Áp bản sửa chính tả/văn AI từ `slop-sweep` sau khi main duyệt.
- Tính năng mới: chờ `ux-audit` đề xuất, main chọn theo tác động/công sức.

---

## Việc còn tồn từ trước (không được quên)

- ⚠️ `unesco.json` chưa vào `STRICT_SOURCE` — 13 mục schema cũ, thiếu `nguon[]` riêng. TODO đã ghi trong `scripts/validate_overlays.mjs`.
- 📌 **358 draft** chờ cổng §9 của chủ dự án. Nên xen một lô duyệt giữa các sóng thay vì để phình tiếp.
- 🤔 Bốn câu hỏi đang chờ chủ dự án quyết (chi tiết ở `docs/PROGRESS.md`): 12 mục chợ chưa xếp hạng · 2 mục cấp tỉnh/thành nằm nhầm trong lớp `di-tich-quoc-gia` · nhóm di tích nhạy cảm từ sóng 10 · báo chính thống ngoài báo Đảng có hợp lệ không.

## Cổng nghiệm thu

Mỗi lần hợp nhất phải xanh cả ba, dán output thật:

```
node scripts/validate_overlays.mjs
node scripts/audit_sovereignty.mjs
npm run build
```

Khi động vào vùng khác thì chạy thêm validator tương ứng trong 9 cái ở `scripts/`.
