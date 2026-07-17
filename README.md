# 🇻🇳 Bách khoa Việt Nam — Không gian & Thời gian

**Từ điển bách khoa Việt Nam theo không gian–thời gian trên bản đồ tương tác.**

Website giáo dục mã nguồn mở giúp người Việt khám phá lịch sử biến động lãnh thổ của đất nước: từ thời khởi thủy, Văn Lang – Âu Lạc, qua các triều đại, đến 63 tỉnh thành và cuộc sắp xếp còn 34 tỉnh/thành năm 2025. Kéo dòng thời gian → ranh giới hành chính thay đổi; nhấp vào một tỉnh → trang bách khoa đầy đủ.

## Nội dung mỗi tỉnh

- Tên gọi qua các thời kỳ; quá trình chia tách / sáp nhập (kèm văn bản pháp lý)
- Địa lý tự nhiên; lịch sử; di chỉ khảo cổ
- Văn hoá – xã hội – dân số – kinh tế
- Đặc sản, trang phục, tiếng địa phương, kiến trúc đặc trưng
- Biển số xe, mã bưu chính
- Danh nhân, anh hùng dân tộc, anh hùng LLVT nhân dân, Mẹ Việt Nam anh hùng
- Truyền thuyết; hình ảnh thực tế, phục dựng 3D, animation

## Nguyên tắc nội dung

1. **Đúng chủ quyền**: quần đảo Hoàng Sa và quần đảo Trường Sa thuộc chủ quyền Việt Nam, hiển thị trên mọi bản đồ, mọi thời kỳ.
2. **Đúng sự thật lịch sử**, tuân thủ pháp luật Việt Nam (bao gồm Luật Đo đạc và bản đồ 2018).
3. **Trích dẫn bắt buộc**: mọi mục dữ liệu đều có trường `sources[]` dẫn về nguồn chính thống (Cổng TTĐT Chính phủ, Tổng cục Thống kê, NXB Chính trị quốc gia Sự thật, NXB Giáo dục, Viện Sử học, …).

## Công nghệ

- [Vite](https://vitejs.dev) + TypeScript
- [MapLibre GL JS](https://maplibre.org) — bản đồ tương tác, không khoá API
- Dữ liệu tĩnh JSON/GeoJSON trong repo — không cần backend, hosting miễn phí

## Phát triển

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # xuất ra dist/
```

## Đóng góp

Mọi đóng góp nội dung phải kèm nguồn kiểm chứng được. Xem `vietnam-encyclopedia-plan.md` để biết lộ trình.

## Giấy phép

- Mã nguồn: MIT
- Nội dung bách khoa (`data/`): CC BY-SA 4.0, kèm trích dẫn nguồn gốc từng mục
