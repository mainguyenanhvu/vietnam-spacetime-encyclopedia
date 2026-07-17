# Research 0.3 — Phân tích repo mẫu `holetexvn/vietnam-3d-map` (2026-07-17)

**Kết luận: chỉ tham khảo (inspiration-only), KHÔNG fork** — repo không có LICENSE (mặc định all-rights-reserved, không được tái sử dụng hợp pháp).

## Hiện trạng
- Public, 15 sao, tạo 2026-07-16 (rất mới). JS 87% / CSS 9% / HTML 3.5%.
- Không có `package.json`, không bundler — plain ES modules + Three.js r178 vendored (~2 MB).
- Không dùng MapLibre/deck.gl — pure Three.js scene, không map tiles.

## Dữ liệu
- `province-shapes.js`: 34 tỉnh (sau sáp nhập 2025-07-01), 87 KB, ~5.000 điểm (Douglas-Peucker simplified).
- Nguồn gốc: **Free-GIS-Data (nguyenduy1133)** — trùng với ứng viên geodata của ta.
- Trường `merged` ("An Giang, Kiên Giang") là mô hình lineage tối giản → đáng khái quát hoá thành **đồ thị kế thừa tỉnh (province succession graph)**.

## Kỹ thuật render
- GeoJSON rings → `THREE.ExtrudeGeometry` (khối tỉnh 3D), ACES tone mapping, ocean animation.
- Diorama landmark low-poly per tỉnh; hover → info card; click → camera flyover; `?demo=1` auto-tour.

## Bài học áp dụng
1. Lấy dữ liệu từ upstream Free-GIS-Data + tự simplify bằng mapshaper (~5K điểm vẫn đẹp).
2. Cần **cả hai lớp** 63 (trước 2025) và 34 (sau) dạng GeoJSON có timestamp — repo mẫu chỉ có 34.
3. MapLibre fill-extrusion / deck.gl phù hợp hơn raw Three.js cho encyclopedia có timeline + nội dung theo tỉnh.
4. Giữ tính static-deployable; dùng Vite + npm thay vì vendor 2 MB Three.js.
5. UX đáng học: hover-card, click-flyover, Esc-overview, auto-tour.
