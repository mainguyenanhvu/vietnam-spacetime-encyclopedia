# Đặc tả sinh ảnh bằng AI — Từ điển bách khoa Việt Nam (sóng 11)

## 0. GIỚI HẠN CỨNG — ĐỌC TRƯỚC KHI CHẠY

**TUYỆT ĐỐI KHÔNG sinh ảnh chân dung "giả như thật" cho bất kỳ NGƯỜI CÓ THẬT nào trong lịch sử** — dù là vua chúa, danh nhân khoa bảng, chí sĩ cách mạng, tướng lĩnh, nhà khoa học, nghệ sĩ, hay bất kỳ nhân vật cận – hiện đại nào. Cấm tuyệt đối với: lãnh tụ, Chủ tịch Hồ Chí Minh, Mẹ Việt Nam anh hùng, liệt sĩ. Sinh ảnh chân dung người thật bằng AI = làm giả tư liệu lịch sử, phá hỏng giá trị của một bộ từ điển bách khoa. Nếu một nhân vật có thật không có ảnh tư liệu nào — giải pháp ĐÚNG là: (a) tìm ảnh đền thờ/tượng thờ thật (Phần A), hoặc (b) để trống và ghi vào danh sách "cần khảo sát thực địa". KHÔNG BAO GIỜ sinh ảnh thay thế.

File đặc tả này **CHỈ** bao gồm 4 loại hợp lệ:
1. Cảnh trí/bối cảnh lịch sử đã mất (kiến trúc, sa đồ trận đánh dạng minh hoạ, không có nhân vật cụ thể được nêu tên).
2. Minh hoạ truyền thuyết/huyền sử (nhân vật huyền thoại — vốn không phải người có thật, đã được chính CSDL của dự án ghi chú "hình dung nghệ thuật, KHÔNG phải chân dung xác thực").
3. Icon/biểu tượng cho lớp bản đồ, hoa văn trang trí.
4. Phục dựng trang phục/vật dụng theo mô tả khảo cổ — trên hình nộm/dáng người chung chung, không gán khuôn mặt cho bất kỳ cá nhân có thật nào.

**Mỗi ảnh sinh ra bắt buộc mang nhãn**: `"⚠️ Hình dung nghệ thuật do AI dựng lại — KHÔNG PHẢI ảnh chụp/chân dung xác thực"` hiển thị cùng ảnh trên giao diện, và cờ `anh_giay_phep: "ai-generated"` + `ai_generated: true` trong metadata.

---

## 1. Mục tiêu và phạm vi

Bổ khuyết hình ảnh cho các mục trong CSDL bản đồ **không có** và **không thể có** tư liệu ảnh thật (vì là huyền sử, hoặc vì là cảnh/vật thể đã mất không còn hiện vật/ảnh chụp), để giao diện không bị khoảng trắng, đồng thời không vi phạm tính xác thực bách khoa. Phạm vi đợt này: 8 ảnh cảnh/huyền sử liên quan trực tiếp tới các nhân vật huyền sử còn thiếu tư liệu thật (từ `public/data/overlays/huyen-su-khai-quoc.json`), 6 icon lớp bản đồ nhân vật, 2 phục dựng trang phục theo khảo cổ. Tổng: **16 ảnh**.

---

## 2. Bảng ảnh cần sinh

| Mã | Tiêu đề | Dùng ở đâu | Loại |
|---|---|---|---|
| G01 | Kinh Dương Vương nhận ngôi vua nước Xích Quỷ | `huyen-su-khai-quoc.json` → `kinh-duong-vuong` (không có ảnh thật) | Huyền sử |
| G02 | Đoàn thuyền Hải đội Hoàng Sa ra khơi (thế kỷ 18) | `huyen-su-khai-quoc.json` → `hai-doi-hoang-sa` (không có ảnh thật) | Bối cảnh lịch sử |
| G03 | Trận lụt huyền thoại Sơn Tinh – Thủy Tinh | Bổ sung minh hoạ cho `tan-vien-son-thanh` (đã có ảnh đền thật, đây là ảnh minh hoạ truyền thuyết bổ sung, KHÔNG thay thế) | Huyền sử |
| G04 | Cảnh sinh hoạt làng Văn Lang thời Hùng Vương (cấy lúa, dệt vải, trống đồng) | Layer `huyen-su-khai-quoc.json`, mục Hùng Vương — cảnh sinh hoạt chung, không có nhân vật cụ thể | Bối cảnh lịch sử |
| G05 | Hoàng thành Thăng Long thời Lý – Trần, phục dựng phối cảnh | Layer `kien-truc` / bổ trợ cho các mục vua triều Lý–Trần | Bối cảnh lịch sử |
| G06 | Thành Cổ Loa 3 vòng thành ốc, phối cảnh thời An Dương Vương | Bổ trợ `an-duong-vuong` bên cạnh ảnh di tích thật hiện có | Bối cảnh lịch sử |
| G07 | Sa đồ trận Bạch Đằng 938 (thế trận cọc ngầm) | Bổ trợ minh hoạ chiến dịch, không khắc hoạ khuôn mặt Ngô Quyền | Bối cảnh lịch sử (sa đồ) |
| G08 | Sa đồ trận Bạch Đằng 1288 (thế trận cọc ngầm, thuỷ triều) | Bổ trợ minh hoạ chiến dịch, không khắc hoạ khuôn mặt Trần Hưng Đạo | Bối cảnh lịch sử (sa đồ) |
| I01 | Icon lớp "Vua · Chúa · Hoàng tộc" | Map pin icon, layer `vua-hoang-de` | Icon |
| I02 | Icon lớp "Khoa bảng · Trạng nguyên" | Map pin icon, layer `khoa-bang-danh-nhan` | Icon |
| I03 | Icon lớp "Danh y · Lương y" | Map pin icon, layer `danh-y-luong-y` | Icon |
| I04 | Icon lớp "Thiền sư · Cao tăng" | Map pin icon, layer `thien-su-cao-tang` | Icon |
| I05 | Icon lớp "Nghệ nhân di sản" | Map pin icon, layer `nghe-nhan-di-san` | Icon |
| I06 | Icon lớp "Anh hùng · Chí sĩ cách mạng" | Map pin icon, layer `chi-si-cach-mang` / `anh-hung-can-hien-dai` | Icon |
| C01 | Phục dựng trang phục thời Hùng Vương (văn hoá Đông Sơn) | Bổ trợ hiểu biết văn hoá, không gán cho cá nhân cụ thể | Phục dựng trang phục |
| C02 | Phục dựng triều phục thời Lý (dựa hoa văn tượng Phật, bia đá) | Bổ trợ hiểu biết văn hoá triều Lý | Phục dựng trang phục |

---

## 3. Chi tiết từng ảnh

### G01 — Kinh Dương Vương nhận ngôi vua nước Xích Quỷ
- **Căn cứ tư liệu**: Đại Việt Sử Ký Toàn Thư — Ngoại kỷ, Kỷ Hồng Bàng thị; Lĩnh Nam Chích Quái — Truyện Hồng Bàng thị. Không có mô tả ngoại hình cụ thể trong thư tịch — cảnh dựng theo mô-típ nghi lễ lên ngôi thời thượng cổ Đông Nam Á (không sao chép trang phục triều đại cụ thể nào có thật).
- **Prompt (EN)**: `Mythical Vietnamese Bronze Age coronation scene, legendary ruler figure seated on a raised platform of woven bamboo and stone under a thatched pavilion, surrounded by tribal elders in simple hemp and bark-cloth wraps, bronze drum (Dong Son style) in foreground, misty mountain forest background, dawn light, illustrative folklore art style, no modern elements, faces stylized and non-specific (not a real historical portrait), digital painting`
- **Negative prompt**: `photorealistic portrait, real person, specific facial identity, modern clothing, text, watermark, Chinese imperial dragon robe, western clothing, low quality, blurry`
- **Tỉ lệ khung**: 16:9 · **Độ phân giải đề xuất**: 1920×1080
- **Phong cách tham chiếu**: tranh minh hoạ dân gian Đông Sơn/Ngọc Lũ (hoa văn trống đồng), không theo phong cách tranh cung đình Trung Hoa.

### G02 — Đoàn thuyền Hải đội Hoàng Sa ra khơi (thế kỷ 18)
- **Căn cứ tư liệu**: Phủ Biên Tạp Lục (Lê Quý Đôn, 1776) — mục đội Hoàng Sa; Đại Nam Thực Lục — mục tỉnh Quảng Ngãi. Ghe bầu (thuyền buồm gỗ miền Trung) là loại thuyền lịch sử có thật, được mô tả trong thư tịch.
- **Prompt (EN)**: `18th-century Vietnamese wooden sailing junks (ghe bầu type, single mast, woven bamboo sail) departing from a Central Vietnam coastal village at dawn, generic unnamed sailors in traditional nón lá hats and brown ao ba ba clothing loading bamboo baskets and stone markers, Ly Son island coastline in background, historical illustration style, no specific named individual depicted, digital painting`
- **Negative prompt**: `modern ships, steel hull, real named person portrait, modern navy uniform, text, watermark, fantasy elements, low quality`
- **Tỉ lệ khung**: 21:9 · **Độ phân giải đề xuất**: 2560×1080
- **Phong cách tham chiếu**: tranh minh hoạ lịch sử hàng hải Đông Nam Á thế kỷ 18.

### G03 — Trận lụt huyền thoại Sơn Tinh – Thủy Tinh
- **Căn cứ tư liệu**: Lĩnh Nam Chích Quái — Truyện Tản Viên Sơn thần. Truyền thuyết thuần tuý, không phải nhân vật lịch sử có thật.
- **Prompt (EN)**: `Legendary Vietnamese myth scene, mountain deity figure atop a misty green mountain summoning earth and rock to raise the land, opposing water deity figure rising from stormy river floodwaters below, dramatic clouds and rain, folklore illustration style, stylized non-realistic figures (mythical deities, not real people), digital painting`
- **Negative prompt**: `photorealistic human portrait, real historical figure, modern clothing, text, watermark, low quality`
- **Tỉ lệ khung**: 16:9 · **Độ phân giải đề xuất**: 1920×1080
- **Phong cách tham chiếu**: tranh dân gian Đông Hồ cách điệu.

### G04 — Cảnh sinh hoạt làng Văn Lang thời Hùng Vương
- **Căn cứ tư liệu**: hoa văn trống đồng Đông Sơn (cảnh giã gạo, đua thuyền, nhà sàn mái cong) — theo mô tả khảo cổ học văn hoá Đông Sơn phổ biến trong các công bố của Bảo tàng Lịch sử Quốc gia.
- **Prompt (EN)**: `Bronze Age Dong Son village life scene, stilt houses with curved roofs, villagers pounding rice, weaving cloth, bronze drum casting scene, no specific named individuals, generic tribal figures, lush river delta landscape, illustrative historical reconstruction style, digital painting`
- **Negative prompt**: `modern buildings, real named historical figure portrait, text, watermark, low quality`
- **Tỉ lệ khung**: 16:9 · **Độ phân giải**: 1920×1080

### G05 — Hoàng thành Thăng Long thời Lý – Trần, phục dựng phối cảnh
- **Căn cứ tư liệu**: kết quả khai quật khảo cổ khu di tích Hoàng thành Thăng Long (18 Hoàng Diệu) do Viện Khảo cổ học công bố; hồ sơ UNESCO Di sản Thế giới Hoàng thành Thăng Long. Chỉ phục dựng KIẾN TRÚC, không có nhân vật.
- **Prompt (EN)**: `Aerial architectural reconstruction of an 11th-13th century Vietnamese royal citadel, wooden pillared palace halls with terracotta dragon-phoenix roof tiles, red lacquered columns, courtyards with stone pathways, based on Thang Long Imperial Citadel archaeological excavation findings, no people, golden late-afternoon light, architectural visualization style, digital painting`
- **Negative prompt**: `modern buildings, people, real person, Chinese Forbidden City copy, text, watermark, low quality`
- **Tỉ lệ khung**: 16:9 · **Độ phân giải**: 2560×1440

### G06 — Thành Cổ Loa 3 vòng thành ốc, phối cảnh thời An Dương Vương
- **Căn cứ tư liệu**: Cục Di sản Văn hoá (dsvh.gov.vn) — hồ sơ Khu di tích Cổ Loa; khảo cổ học về cấu trúc 3 vòng thành đất hình xoắn ốc.
- **Prompt (EN)**: `Aerial view architectural reconstruction of an ancient Vietnamese spiral earthwork citadel with three concentric moated walls, wooden watchtowers, thatched-roof structures inside, surrounded by rice paddies, no people, dawn mist, archaeological visualization style, digital painting`
- **Negative prompt**: `modern buildings, people, real person portrait, text, watermark, low quality`
- **Tỉ lệ khung**: 16:9 · **Độ phân giải**: 2560×1440

### G07 — Sa đồ trận Bạch Đằng 938 (thế trận cọc ngầm)
- **Căn cứ tư liệu**: Đại Việt Sử Ký Toàn Thư — trận Bạch Đằng năm 938 (Ngô Quyền phá quân Nam Hán); mô tả bãi cọc gỗ đầu bịt sắt cắm dưới lòng sông theo các công bố khảo cổ bãi cọc Bạch Đằng (Quảng Yên).
- **Prompt (EN)**: `Historical battle map illustration (diagram style, bird's-eye view) of the 938 Bach Dang River naval battle, wooden stakes with iron tips hidden underwater at low tide, Vietnamese river boats and Chinese fleet positions marked with symbolic icons (not human figures), annotated arrows showing tidal ambush strategy, aged parchment map illustration style, no faces or portraits`
- **Negative prompt**: `human portrait, real person, modern map, text in wrong language, watermark, low quality`
- **Tỉ lệ khung**: 4:3 · **Độ phân giải**: 1600×1200
- **Lưu ý**: đây là SA ĐỒ dạng biểu đồ minh hoạ, không phải cảnh chiến trận có nhân vật.

### G08 — Sa đồ trận Bạch Đằng 1288
- **Căn cứ tư liệu**: Đại Việt Sử Ký Toàn Thư — trận Bạch Đằng năm 1288 (Trần Hưng Đạo phá quân Nguyên Mông); giống G07 nhưng chú thích niên đại khác.
- **Prompt / Negative / khung hình**: tương tự G07, đổi chú thích niên đại "1288" và phe địch thành "Nguyên Mông".

### I01–I06 — Icon lớp bản đồ
- **Prompt chung (EN, thay `{{SUBJECT}}` theo từng icon)**: `Minimalist flat-design map pin icon, {{SUBJECT}} symbolic motif, single accent color on transparent background, clean vector-illustration style, no text, no human face, no real portrait`
  - I01 `{{SUBJECT}}` = "royal crown and dragon motif" (vua-hoang-de)
  - I02 `{{SUBJECT}}` = "scroll and writing brush motif" (khoa-bang-danh-nhan)
  - I03 `{{SUBJECT}}` = "mortar-and-pestle with herbal leaf motif" (danh-y-luong-y)
  - I04 `{{SUBJECT}}` = "lotus and monk's alms bowl motif" (thien-su-cao-tang)
  - I05 `{{SUBJECT}}` = "traditional weaving loom and hand-craft tool motif" (nghe-nhan-di-san)
  - I06 `{{SUBJECT}}` = "red star and rifle-silhouette motif" (chi-si-cach-mang/anh-hung-can-hien-dai — dùng biểu tượng trừu tượng, KHÔNG có hình người)
- **Negative prompt**: `photorealistic, human face, real person, text, watermark, 3D render, gradient background`
- **Tỉ lệ khung**: 1:1 · **Độ phân giải**: 512×512 (SVG hoá lại sau nếu cần)

### C01 — Phục dựng trang phục thời Hùng Vương (văn hoá Đông Sơn)
- **Căn cứ tư liệu**: hoa văn trang phục trên trống đồng Đông Sơn/Ngọc Lũ (người mặc khố, áo chẽn, đội mũ lông chim) — theo các công bố khảo cổ học văn hoá Đông Sơn.
- **Prompt (EN)**: `Historical costume reconstruction display, Dong Son Bronze Age Vietnamese attire on a faceless mannequin/generic figure (no identifiable face), feathered headdress, woven bark-cloth wrap skirt, bronze bracelets, based on Dong Son bronze drum figural engravings, museum-display lighting, illustrative style`
- **Negative prompt**: `real person face, specific identity, modern clothing, text, watermark, low quality`
- **Tỉ lệ khung**: 3:4 · **Độ phân giải**: 1200×1600

### C02 — Phục dựng triều phục thời Lý
- **Căn cứ tư liệu**: hoa văn trang phục trên tượng Phật A Di Đà chùa Phật Tích (thế kỷ 11) và các bia đá thời Lý còn lưu — theo công bố của Bảo tàng Lịch sử Quốc gia.
- **Prompt (EN)**: `Historical Ly Dynasty (11th century Vietnam) court costume reconstruction on a faceless mannequin/generic figure, silk robe with lotus and cloud motifs based on Phat Tich pagoda stone Buddha statue carving patterns, layered court dress, museum-display lighting, illustrative style`
- **Negative prompt**: `real person face, specific identity, Chinese Ming/Qing dynasty style, text, watermark, low quality`
- **Tỉ lệ khung**: 3:4 · **Độ phân giải**: 1200×1600

---

## 4. Mô hình đề xuất

| Mô hình | Ưu điểm | Nhược điểm |
|---|---|---|
| **Stable Diffusion XL (SDXL 1.0) + ControlNet** (tự host) | Chạy trên server riêng, kiểm soát seed/tham số đầy đủ, cộng đồng LoRA phong phú cho phong cách tranh dân gian/lịch sử Á Đông, chi phí biên = 0 sau khi có GPU | Cần GPU ≥12GB VRAM, cần tinh chỉnh prompt kỹ hơn model thương mại |
| **Flux.1 [dev]** (tự host qua ComfyUI) | Chất lượng kiến trúc/phối cảnh vượt trội SDXL, tuân theo prompt dài chính xác hơn | Nặng hơn (cần ≥24GB VRAM hoặc quantize), giấy phép non-commercial cho bản dev cần xem lại nếu dự án có mục đích thương mại |
| **Midjourney v6 (qua Discord API không chính thức hoặc web)** | Chất lượng thẩm mỹ cao nhất cho cảnh minh hoạ/phong cách nghệ thuật, ít công sức tinh chỉnh | Không tự host được, không có seed cố định thực sự đáng tin cậy để tái lập chính xác, chi phí theo subscription, khó tích hợp pipeline tự động |

**Khuyến nghị**: SDXL 1.0 tự host cho batch icon (I01–I06, cần tái lập chính xác, chi phí thấp) + Flux.1 [dev] cho các cảnh bối cảnh lịch sử phức tạp (G01–G08, cần chất lượng phối cảnh cao). Không dùng Midjourney cho đợt này vì không tái lập seed được, khó kiểm duyệt tự động.

## 5. Tham số chạy đề xuất (SDXL/Flux qua ComfyUI hoặc Automatic1111)

```
seed: 20260726       # cố định theo ngày lập đặc tả — TÁI SỬ DỤNG CHO MỌI ẢNH để dễ truy vết, đổi seed+1 nếu cần biến thể khi ảnh đầu không đạt
steps: 30
cfg_scale (guidance): 6.5   # thấp hơn mức mặc định 7-8 để tránh cứng nhắc, cho phong cách minh hoạ tự nhiên hơn
sampler: DPM++ 2M Karras
width x height: theo cột "Độ phân giải đề xuất" mỗi ảnh
denoise: 1.0 (txt2img gốc); nếu dùng img2img tinh chỉnh lại bố cục: denoise 0.55–0.65
```
Nếu ảnh đầu ra không đạt (sai chi tiết lịch sử, lỗi giải phẫu), tăng seed lên +1 mỗi lần thử lại, ghi log seed nào cho ảnh cuối được duyệt.

## 6. Quy ước đặt tên file, thư mục đích, schema metadata nạp lại

- **Thư mục đích**: `public/data/media/ai-generated/` (tạo mới nếu chưa có; KHÔNG lẫn vào `images.json` gốc vì đó là ảnh tự do/thật — tách bạch để dễ kiểm toán).
- **Tên file**: `<ma-anh>_<slug-ten-khong-dau>.png` — ví dụ `g01_kinh-duong-vuong-len-ngoi.png`, `i03_icon-danh-y-luong-y.png`.
- **Schema metadata** (file `public/data/media/ai-generated.json`, KHÔNG gộp vào `images.json`):
```json
{
  "items": [
    {
      "id": "g01-kinh-duong-vuong-len-ngoi",
      "ma": "G01",
      "gan_voi": { "file": "huyen-su-khai-quoc.json", "id": "kinh-duong-vuong" },
      "loai": "huyen-su" ,
      "ten": "Kinh Dương Vương nhận ngôi vua nước Xích Quỷ",
      "url": "/data/media/ai-generated/g01_kinh-duong-vuong-len-ngoi.png",
      "mo_hinh": "Flux.1 [dev]",
      "seed": 20260726,
      "prompt": "<toàn văn prompt đã dùng>",
      "ngay_sinh": "2026-07-26",
      "nguoi_duyet": "<tên người duyệt>",
      "ngay_duyet": "<ngày duyệt>",
      "giay_phep": "ai-generated",
      "ai_generated": true,
      "nhan_canh_bao": "Hình dung nghệ thuật do AI dựng lại — KHÔNG PHẢI ảnh chụp/chân dung xác thực"
    }
  ]
}
```
- Trường `ai_generated: true` và `nhan_canh_bao` là BẮT BUỘC — validator (`scripts/validate_media.mjs` hoặc bản mở rộng) phải chặn nếu thiếu.
- Khi gắn vào overlay person/place, chỉ set `anh_giay_phep: "ai-generated"` (giá trị đã có sẵn trong enum của `validate_media.mjs`) và bổ sung field mới `ai_generated: true` — KHÔNG được để trống để lẫn với ảnh thật.

## 7. Quy trình kiểm duyệt

1. **Người duyệt**: chủ dự án (main) hoặc người được chủ dự án chỉ định — không tự động publish thẳng từ mô hình sinh ảnh.
2. **Kiểm trước khi đưa lên** (checklist bắt buộc):
   - [ ] Trang phục/vật dụng có đúng thời kỳ được ghi trong "Căn cứ tư liệu" không (đối chiếu lại nguồn khảo cổ/thư tịch đã trích)?
   - [ ] Có VÔ TÌNH tạo ra khuôn mặt giống một người có thật (kể cả lãnh tụ, người nổi tiếng) không? Nếu AI trả về khuôn mặt quá "thật", loại bỏ và sinh lại với seed khác hoặc thêm negative prompt `photorealistic face`.
   - [ ] Có yếu tố sai lệch văn hoá không (ví dụ lẫn trang phục/kiến trúc Trung Hoa/triều đại khác vào cảnh Việt Nam, cờ/phù hiệu sai niên đại)?
   - [ ] Ảnh có bị AI sinh lỗi giải phẫu, chữ viết vô nghĩa (gibberish text) làm mất tính chuyên nghiệp không?
   - [ ] Nhãn cảnh báo "hình dung nghệ thuật" đã gắn kèm khi hiển thị trên giao diện chưa?
3. Sau khi duyệt: cập nhật `nguoi_duyet` + `ngay_duyet` trong metadata, mới được merge vào `ai-generated.json` và tham chiếu trong overlay tương ứng.
4. Ảnh bị từ chối: lưu lại lý do từ chối trong `scratchpad/rejected-ai-images-log.md` (không đưa vào repo) để tránh lặp lại lỗi khi sinh lại.
