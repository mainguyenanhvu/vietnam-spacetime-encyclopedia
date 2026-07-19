// Sinh public/data/geo/song-nui.json — SÔNG dạng LineString (đường sông nhìn thấy
// được), NÚI dạng Point (tam giác). Toạ độ SƠ ĐỒ HOÁ: waypoint xấp xỉ theo các mốc
// địa lý đã biết (thành phố sông chảy qua, cửa sông, đỉnh núi). Dùng cho lớp địa
// hình hiển thị — KHÔNG dùng cho ranh giới/chủ quyền. Nguồn toạ độ: GeoNames,
// OpenStreetMap, Wikidata (chỉ geodata trung tính). Chủ quyền: chỉ địa hình đất liền.
import fs from "node:fs";

// [ten, [ [lon,lat], ... ] ] — waypoint Bắc→Nam / thượng→hạ lưu
const SONG = [
  ["Sông Hồng", [[103.95, 22.49], [104.45, 22.05], [104.9, 21.72], [105.24, 21.42], [105.42, 21.30], [105.86, 21.04], [106.06, 20.66], [106.34, 20.42], [106.56, 20.28]]],
  ["Sông Đà", [[102.85, 22.38], [103.45, 21.98], [104.02, 21.42], [104.65, 21.05], [105.02, 20.86], [105.34, 20.82], [105.42, 21.30]]],
  ["Sông Lô", [[104.98, 22.82], [105.05, 22.35], [105.22, 21.82], [105.30, 21.55], [105.42, 21.30]]],
  ["Sông Chảy", [[104.32, 22.55], [104.55, 22.15], [104.78, 21.85], [105.02, 21.55], [105.20, 21.38]]],
  ["Sông Mã", [[104.05, 20.72], [104.55, 20.35], [105.10, 20.05], [105.55, 19.85], [105.78, 19.80], [105.92, 19.76]]],
  ["Sông Cả (Lam)", [[104.35, 19.45], [104.85, 19.10], [105.25, 18.85], [105.55, 18.72], [105.70, 18.79]]],
  ["Sông Gianh", [[105.75, 17.95], [106.05, 17.85], [106.28, 17.75], [106.47, 17.70]]],
  ["Sông Thạch Hãn", [[106.85, 16.62], [107.05, 16.72], [107.19, 16.75], [107.30, 16.78]]],
  ["Sông Hương", [[107.45, 16.22], [107.55, 16.38], [107.58, 16.47], [107.63, 16.57]]],
  ["Sông Thu Bồn", [[107.82, 15.52], [108.05, 15.70], [108.25, 15.82], [108.34, 15.88], [108.38, 15.89]]],
  ["Sông Trà Khúc", [[108.45, 15.02], [108.62, 15.08], [108.80, 15.12], [108.90, 15.23]]],
  ["Sông Ba (Đà Rằng)", [[108.35, 13.55], [108.75, 13.25], [109.05, 13.12], [109.28, 13.09], [109.35, 13.09]]],
  ["Sông Đồng Nai", [[107.85, 11.92], [107.45, 11.45], [107.05, 11.10], [106.82, 10.95], [106.78, 10.78], [106.75, 10.69]]],
  ["Sông Sài Gòn", [[106.45, 11.55], [106.55, 11.15], [106.62, 10.95], [106.70, 10.78], [106.75, 10.69]]],
  ["Sông Vàm Cỏ", [[106.15, 10.95], [106.35, 10.78], [106.55, 10.62], [106.70, 10.55]]],
  ["Sông Tiền", [[105.42, 10.72], [105.75, 10.55], [106.05, 10.42], [106.35, 10.35], [106.60, 10.30], [106.75, 10.28]]],
  ["Sông Hậu", [[105.12, 10.72], [105.35, 10.42], [105.62, 10.18], [105.78, 10.03], [106.00, 9.78], [106.20, 9.55]]],
  ["Sông Cửu Long (đoạn VN)", [[105.02, 10.90], [105.22, 10.80], [105.42, 10.72]]],
  ["Sông Kỳ Cùng", [[106.55, 21.62], [106.62, 21.78], [106.68, 21.92], [106.72, 22.02]]],
];

// [ten, lon, lat, cao_do_m]
const NUI = [
  ["Fansipan", 103.7767, 22.3033, 3147],
  ["Pu Ta Leng", 103.5083, 22.4183, 3049],
  ["Ky Quan San (Bạch Mộc Lương Tử)", 103.6767, 22.5217, 3046],
  ["Tây Côn Lĩnh", 104.7500, 22.7667, 2428],
  ["Phu Xai Lai Leng", 104.3167, 19.2167, 2711],
  ["Ngọc Linh", 107.9833, 15.0667, 2598],
  ["Bạch Mã", 107.8500, 16.1967, 1450],
  ["Bà Nà", 107.9950, 16.0100, 1487],
  ["Đèo Hải Vân", 108.1300, 16.2000, 500],
  ["Tản Viên (Ba Vì)", 105.3667, 21.0667, 1281],
  ["Yên Tử", 106.7167, 21.1667, 1068],
  ["Bà Đen", 106.1717, 11.3767, 986],
  ["Lang Biang", 108.4433, 12.0483, 2167],
  ["Chư Yang Sin", 108.3667, 12.4000, 2442],
  ["Núi Sam", 105.0900, 10.6800, 284],
  ["Thất Sơn (Núi Cấm)", 105.0100, 10.5000, 705],
  ["Hoàng Liên Sơn (dãy)", 103.8500, 22.2500, null],
  ["Trường Sơn (dãy)", 106.5000, 17.5000, null],
  ["Ngũ Hành Sơn", 108.2633, 16.0044, 108],
  ["Mẫu Sơn", 107.0833, 21.8500, 1541],
  ["Đèo Cả", 109.3500, 12.9000, 333],
  ["Núi Chứa Chan", 107.3600, 10.9400, 837],
  ["Cao nguyên đá Đồng Văn", 105.3600, 23.2700, 1600],
  ["Đèo Ngang (Hoành Sơn)", 106.2000, 17.9000, 256],
  ["Núi Chư Mom Ray", 107.6667, 14.4333, 1773],
  ["Núi Voi", 106.6167, 20.8333, 197],
];

const GEO_SRC = ["GeoNames.org", "OpenStreetMap", "Wikidata (geodata trung tính)"];
const features = [];
for (const [ten, coords] of SONG) {
  features.push({
    type: "Feature",
    properties: { ten, loai: "song", cao_do_m: null, so_do_hoa: true, nguon: GEO_SRC },
    geometry: { type: "LineString", coordinates: coords },
  });
}
for (const [ten, lon, lat, cao] of NUI) {
  features.push({
    type: "Feature",
    properties: { ten, loai: "nui", cao_do_m: cao, nguon: GEO_SRC },
    geometry: { type: "Point", coordinates: [lon, lat] },
  });
}
const out = {
  type: "FeatureCollection",
  ghi_chu:
    "Địa hình: SÔNG dạng LineString (đường sông nhìn thấy), NÚI dạng Point (tam giác). Toạ độ SƠ ĐỒ HOÁ theo waypoint xấp xỉ (mốc địa lý đã biết) — dùng hiển thị, KHÔNG dùng cho ranh giới/chủ quyền. Nguồn toạ độ: GeoNames, OpenStreetMap, Wikidata (geodata trung tính). Chủ quyền: chỉ địa hình đất liền.",
  ngay_cap_nhat: "2026-07-19",
  features,
};
fs.writeFileSync("public/data/geo/song-nui.json", JSON.stringify(out, null, 2) + "\n");
console.log(`✅ song-nui.json: ${SONG.length} sông (LineString) + ${NUI.length} núi (Point) = ${features.length} feature`);
