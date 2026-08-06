// Mô hình 3D low-poly cách điệu 8 ANH HÙNG DÂN TỘC Việt Nam.
//
// Cùng kiến trúc với models3d.ts nhưng ĐỘC LẬP (không import chéo): mỗi lần
// mount tự tạo renderer / camera / scene / ánh sáng riêng, gắn canvas vào một
// <div> container, auto-rotate nhẹ + kéo chuột để xoay, chỉ render khi canvas
// trong viewport (IntersectionObserver), dispose() dọn sạch tài nguyên.
//
// TOÀN BỘ hình khối là mã GỐC dựng từ primitive Three.js — KHÔNG asset ngoài.
// Nhân vật cách điệu: thân trụ (áo bào/giáp), đầu cầu trơn (KHÔNG tả chân dung
// thật — mặt chỉ khối cầu), chi hộp. Mỗi anh hùng khác biệt qua tư thế + binh
// khí + bối cảnh thời đại (voi, ngựa, trống đồng, cọc gỗ, chiếu, cờ lau...).

import * as THREE from "three";

// ── Bảng màu ─────────────────────────────────────────────────────────────
const SKIN = 0xe3b88f; // da mặt/bàn tay
const HAIR = 0x241f1c; // tóc/búi tóc đen
const GOLD = 0xd4af37; // kim tuyến long bào, chuôi kiếm
const STEEL = 0x8b929c; // giáp thép
const BLADE = 0xd0d7de; // lưỡi kiếm
const WOOD = 0x8a5a2b; // cán gỗ, cọc, cán cờ
const BRONZE = 0xb08d3e; // đồng (trống đồng Đông Sơn)
const DARK_BRONZE = 0x7d5b1f; // hoa văn đồng tối
const ELEPHANT = 0x8a8f98; // da voi
const IVORY = 0xf4efe2; // ngà voi
const HORSE = 0x6b4a2f; // lông ngựa nâu
const MANE = 0x2c1e12; // bờm/đuôi ngựa
const SCROLL = 0xefe4c4; // giấy chiếu dời đô
const REED = 0xcdbb77; // bông cỏ lau
const REED_STALK = 0x9ca05a; // thân cỏ lau
const CLOTH_RED = 0xb23a3a; // cờ/vải đỏ

// Màu trang phục đặc trưng từng nhân vật.
const HUNG_ROBE = 0x8a6a3a; // áo choàng đất thời Văn Lang
const TRUNG_ROBE = 0xb0403a; // giáp nhẹ nữ tướng đỏ
const NGO_ROBE = 0x5b6b78; // giáp tướng thép xanh
const DINH_ROBE = 0x9b2d2d; // long bào Hoa Lư đỏ sẫm
const LY_ROBE = 0xc9a227; // long bào vàng
const TRAN_ROBE = 0x6b5535; // giáp trụ đồng
const LE_ROBE = 0xc7a63a; // long bào vàng nghệ
const QUANG_ROBE = 0xa8323f; // áo bào đỏ
const BA_TRIEU_ROBE = 0xb8860b; // giáp vàng đồng nữ tướng
const BA_TRIEU_ACCENT = 0xa8323f; // đỏ son
const LY_BI_ROBE = 0xab8a52; // áo bào vàng nhạt, vương triều sơ khai (tránh kiểu Nguyễn)
const LY_BI_ACCENT = 0x6b4a2f; // nâu trầm
const MAI_ROBE = 0x7a5230; // giáp vải/da nâu đất Hoan Châu
const MAI_ACCENT = 0x5b6b45; // xanh rêu
const LE_HOAN_ACCENT = 0x9b2d2d; // long bào đỏ sẫm khoác ngoài giáp thép
const LTK_ROBE = 0x33507a; // giáp trụ xanh chàm thời Lý
const MONK_ROBE = 0x8a5a2f; // cà sa nâu sồng
const MONK_SASH = 0xd4af37; // dải vàng nghệ
const NGUYEN_ANH_ROBE = 0xd9b23a; // long bào vàng cung đình Huế
const NGUYEN_ANH_ACCENT = 0xa8323f; // đỏ son
const TRUONG_DINH_ROBE = 0x6b5535; // áo nghĩa quân nâu vải, giản dị hơn quan phục triều đình
const HAM_NGHI_ROBE = 0xd8c37a; // áo vua giản lược khi lưu vong, vàng nhạt
const HAM_NGHI_ACCENT = 0x3f5f3a; // xanh rừng núi Tân Sở
const PHAN_ROBE = 0x2b2620; // áo the đen nho sĩ
const PHAN_ACCENT = 0x5a4632; // khăn xếp nâu sẫm

// Màu cho 4 VẬT biểu tượng thế kỷ XX (không dựng chân dung người).
const SHIP_HULL = 0x2b2f33; // thân tàu thép đen/xám
const SHIP_TRIM = 0x707880; // thượng tầng sáng hơn
const SHIP_FUNNEL = 0x3a3a3a; // ống khói
const SHIP_BAND = 0xb23a3a; // vành sọc ống khói
const PODIUM_BACKDROP = 0x6b5535; // phông gỗ lễ đài Ba Đình
const FLAG_RED = 0xda251d; // đỏ quốc kỳ (khác CLOTH_RED của cờ hiệu quân đội)
const FLAG_GOLD = 0xffcd00; // vàng sao quốc kỳ (khác GOLD trang trí kim tuyến)
const MILITARY_GREEN = 0x4a5a3a; // xanh ô liu quân đội (pháo + xe tăng)
const DARK_STEEL = 0x2b2b2b; // xích tăng, bánh pháo, dây kéo
const TANK_PLATE = 0xe8e4d8; // mảng màu số hiệu 390 (thay chữ số)

// ── Primitive helper ─────────────────────────────────────────────────────
function mat(color: number, roughness = 0.85): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, flatShading: true });
}

function box(w: number, h: number, d: number, color: number): THREE.Mesh {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
}

function cyl(rTop: number, rBot: number, h: number, color: number, seg = 8): THREE.Mesh {
  return new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat(color));
}

function ball(r: number, color: number, detail = 1): THREE.Mesh {
  return new THREE.Mesh(new THREE.IcosahedronGeometry(r, detail), mat(color));
}

function cone(r: number, h: number, color: number, seg = 6): THREE.Mesh {
  return new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat(color));
}

// ── Bộ phận dùng chung ───────────────────────────────────────────────────

// Kiếm dựng đứng: chuôi + đốc + lưỡi vươn theo +Y (gốc chuôi ở origin để gắn
// vào bàn tay; lưỡi là phần nối dài của cánh tay khi gắn).
function makeSword(bladeLen = 1.1): THREE.Group {
  const s = new THREE.Group();
  const grip = cyl(0.045, 0.05, 0.26, WOOD, 6);
  grip.position.y = -0.13;
  s.add(grip);
  const pommel = ball(0.07, GOLD, 0);
  pommel.position.y = -0.28;
  s.add(pommel);
  const guard = box(0.36, 0.06, 0.11, GOLD);
  guard.position.y = 0.02;
  s.add(guard);
  const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.07, bladeLen, 4), mat(BLADE, 0.35));
  blade.position.y = 0.05 + bladeLen / 2;
  s.add(blade);
  return s;
}

// Cánh tay áo: trụ vươn xuống -Y từ gốc (vai). Trả về Group để gắn ở vai rồi
// xoay tạo tư thế; đạo cụ gắn ở bàn tay = (0, -len, 0) trong hệ tay.
function makeArm(color: number, len = 0.72): THREE.Group {
  const a = new THREE.Group();
  const sleeve = cyl(0.11, 0.14, len, color, 6);
  sleeve.position.y = -len / 2;
  a.add(sleeve);
  const hand = ball(0.1, SKIN, 0);
  hand.position.y = -len;
  a.add(hand);
  return a;
}

// Lá cờ: cán gỗ dọc + tấm vải phất.
function makeFlag(cloth: number): THREE.Group {
  const f = new THREE.Group();
  const pole = cyl(0.03, 0.035, 1.7, WOOD, 6);
  pole.position.y = 0.55;
  f.add(pole);
  const cloth1 = box(0.06, 0.5, 0.7, cloth);
  cloth1.position.set(0, 1.15, 0.38);
  cloth1.rotation.x = 0.12;
  f.add(cloth1);
  const tip = ball(0.06, GOLD, 0);
  tip.position.y = 1.42;
  f.add(tip);
  return f;
}

// Thương/giáo/đại đao: cán gỗ dài + mũi nhọn ở đầu. Cùng quy ước toạ độ với
// makeSword (gốc cán quanh origin để gắn vào bàn tay, phần dài vươn +Y) để
// gắn vào tay theo đúng công thức đã kiểm chứng ở 8 mô hình có sẵn
// (`arm.add(prop); prop.position.y = -len; prop.rotation.z = Math.PI`).
function makeSpear(shaftLen = 1.7, tipColor = BLADE): THREE.Group {
  const s = new THREE.Group();
  const grip = cyl(0.04, 0.045, 0.3, WOOD, 6);
  grip.position.y = -0.15;
  s.add(grip);
  const shaft = cyl(0.032, 0.036, shaftLen, WOOD, 6);
  shaft.position.y = shaftLen / 2;
  s.add(shaft);
  const tip = cone(0.07, 0.34, tipColor, 5);
  tip.position.y = shaftLen + 0.15;
  s.add(tip);
  return s;
}

// Que/thanh thẳng, GỐC Ở MỘT ĐẦU (không phải giữa) — cùng quy ước với
// makeSword/makeSpear để gắn đúng điểm nối bất kể góc xoay: đặt group tại
// đúng toạ độ điểm nối rồi xoay, đầu gần luôn dính tại đó vì phép xoay chỉ
// đổi hướng, không đổi gốc. Dùng cho càng pháo, dây kéo — vật KHÔNG cầm ở
// tay (không qua attachArm) nên cần tự đảm bảo điểm chạm.
function makeRod(len: number, rTop: number, rBot: number, color: number, seg = 6): THREE.Group {
  const r = new THREE.Group();
  const rod = cyl(rTop, rBot, len, color, seg);
  rod.position.y = -len / 2;
  r.add(rod);
  return r;
}

// Khiên tròn: mặt khiên + viền — gắn vào tay giống đạo cụ khác (position.y=-len).
function makeShield(r = 0.32): THREE.Group {
  const sh = new THREE.Group();
  const face = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.06, 10), mat(WOOD, 0.9));
  face.rotation.z = Math.PI / 2;
  sh.add(face);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 6, 10), mat(DARK_BRONZE, 0.6));
  rim.rotation.y = Math.PI / 2;
  sh.add(rim);
  return sh;
}

// Ngôi sao 5 cánh CÓ ĐỘ DÀY thật (Extrude, không phải mặt phẳng 2D) — sửa lỗi
// §9: bản đầu dùng ShapeGeometry phẳng tuyệt đối (độ dày 0 theo pháp tuyến),
// nên ở góc nhìn gần như song song mặt phẳng đó thì diện tích chiếu gần bằng
// 0 và biến mất dù DoubleSide. Đúc khối thật loại bỏ hẳn khả năng đó — luôn
// có mặt bên hiện ra dù nhìn từ góc nào. Mặt phẳng sao nằm trên trục XY cục
// bộ (đùn theo +Z một đoạn `depth`), tâm ở gốc để dễ áp vào bề mặt vật khác.
function makeStar(r = 0.16, color = GOLD, depth = 0.04): THREE.Mesh {
  const shape = new THREE.Shape();
  const spikes = 5;
  const innerR = r * 0.38;
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : innerR;
    const x = Math.cos(ang) * rad;
    const y = Math.sin(ang) * rad;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2); // tâm khối theo Z tại gốc, không lệch hẳn về +Z
  return new THREE.Mesh(geo, mat(color, 0.5));
}

// Thân người đứng cách điệu: váy áo loe, thân, cổ, đầu cầu trơn, tóc/búi.
// Nhân vật hướng mặt về +X; hai vai nằm dọc trục ±Z.
interface Torso {
  g: THREE.Group;
  shoulderY: number;
  shoulderZ: number;
}

function standingBody(robe: number, accent: number, topknot = true): Torso {
  const g = new THREE.Group();

  // Váy áo bào loe xuống chân.
  const skirt = cyl(0.34, 0.58, 1.25, robe, 8);
  skirt.position.y = 0.63;
  g.add(skirt);
  const hem = cyl(0.59, 0.59, 0.12, accent, 8);
  hem.position.y = 0.07;
  g.add(hem);

  // Thân trên.
  const torso = cyl(0.34, 0.37, 0.8, robe, 8);
  torso.position.y = 1.56;
  g.add(torso);

  // Đai lưng + vạt áo trước (mặt +X).
  const belt = cyl(0.38, 0.38, 0.16, accent, 8);
  belt.position.y = 1.2;
  g.add(belt);
  const lapel = box(0.06, 0.72, 0.34, accent);
  lapel.position.set(0.33, 1.55, 0);
  g.add(lapel);

  // Vai đệm.
  const shoulders = cyl(0.16, 0.18, 0.78, robe, 6);
  shoulders.rotation.x = Math.PI / 2;
  shoulders.position.y = 1.92;
  g.add(shoulders);

  // Cổ + đầu (khối cầu trơn — KHÔNG chi tiết khuôn mặt).
  const neck = cyl(0.11, 0.13, 0.16, SKIN, 6);
  neck.position.y = 2.05;
  g.add(neck);
  const head = ball(0.29, SKIN, 1);
  head.position.y = 2.4;
  g.add(head);

  // Tóc: chỏm sẫm ôm nửa sau/đỉnh đầu.
  const hair = ball(0.31, HAIR, 1);
  hair.scale.set(1, 0.62, 1);
  hair.position.set(-0.06, 2.56, 0);
  g.add(hair);
  if (topknot) {
    const bun = cyl(0.1, 0.12, 0.16, HAIR, 6);
    bun.position.y = 2.72;
    g.add(bun);
  }

  return { g, shoulderY: 1.92, shoulderZ: 0.36 };
}

// Gắn một cánh tay đã tạo vào thân ở vai bên `side` (+1/-1 theo Z) với tư thế
// (rotZ vung ra trước/lên, rotX dang sang bên). Trả về Group tay để gắn đạo cụ.
function attachArm(
  torso: Torso,
  side: number,
  color: number,
  rotZ: number,
  rotX = 0,
  len = 0.72,
): THREE.Group {
  const arm = makeArm(color, len);
  arm.position.set(0, torso.shoulderY, side * torso.shoulderZ);
  arm.rotation.z = rotZ;
  arm.rotation.x = rotX;
  torso.g.add(arm);
  return arm;
}

// Voi low-poly (cho Hai Bà Trưng) — hướng +X, đủ lớn để đội bành.
function makeElephant(): THREE.Group {
  const g = new THREE.Group();
  const body = ball(0.95, ELEPHANT, 1);
  body.scale.set(1.5, 1.05, 1.0);
  body.position.y = 1.5;
  g.add(body);

  const head = ball(0.68, ELEPHANT, 1);
  head.position.set(1.35, 1.65, 0);
  g.add(head);

  // Vòi cuộn xuống (chuỗi trụ nhỏ dần).
  let tx = 1.9;
  let ty = 1.55;
  for (let i = 0; i < 6; i++) {
    const r = 0.24 - i * 0.03;
    const seg = cyl(r, r + 0.03, 0.34, ELEPHANT, 6);
    seg.position.set(tx, ty, 0);
    seg.rotation.z = -0.35 - i * 0.24;
    g.add(seg);
    tx += 0.14;
    ty -= 0.3;
  }

  for (const sz of [-1, 1]) {
    const ear = box(0.14, 0.78, 0.6, ELEPHANT);
    ear.position.set(1.05, 1.72, sz * 0.62);
    ear.rotation.x = sz * 0.3;
    g.add(ear);
    const tusk = cyl(0.02, 0.07, 0.55, IVORY, 5);
    tusk.position.set(1.85, 1.25, sz * 0.24);
    tusk.rotation.z = Math.PI / 2 - 0.35;
    g.add(tusk);
  }

  for (const [sx, sz] of [
    [0.8, 0.48],
    [0.8, -0.48],
    [-0.8, 0.48],
    [-0.8, -0.48],
  ]) {
    const leg = cyl(0.24, 0.28, 1.05, ELEPHANT, 6);
    leg.position.set(sx, 0.53, sz);
    g.add(leg);
  }

  // Đuôi.
  const tail = cyl(0.04, 0.06, 0.7, ELEPHANT, 5);
  tail.position.set(-1.35, 1.2, 0);
  tail.rotation.z = 0.6;
  g.add(tail);

  // Bành (tấm lót trên lưng).
  const pad = box(1.1, 0.14, 1.0, CLOTH_RED);
  pad.position.set(-0.1, 2.35, 0);
  g.add(pad);
  return g;
}

// Ngựa chiến low-poly (cho Quang Trung) — hướng +X.
function makeHorse(): THREE.Group {
  const g = new THREE.Group();
  const body = ball(0.62, HORSE, 1);
  body.scale.set(1.7, 1.05, 0.85);
  body.position.y = 1.45;
  g.add(body);

  // Cổ vươn chéo lên trước + đầu.
  const neck = cyl(0.24, 0.3, 0.85, HORSE, 6);
  neck.position.set(1.05, 1.85, 0);
  neck.rotation.z = -0.7;
  g.add(neck);
  const head = box(0.6, 0.3, 0.28, HORSE);
  head.position.set(1.5, 2.2, 0);
  head.rotation.z = -0.35;
  g.add(head);
  const muzzle = box(0.32, 0.22, 0.22, HORSE);
  muzzle.position.set(1.78, 2.05, 0);
  g.add(muzzle);
  for (const sz of [-1, 1]) {
    const ear = cone(0.06, 0.18, HORSE, 5);
    ear.position.set(1.35, 2.42, sz * 0.12);
    g.add(ear);
  }

  // Bờm dọc cổ.
  const maneGeo = box(0.06, 0.5, 0.5, MANE);
  maneGeo.position.set(1.0, 2.05, 0);
  maneGeo.rotation.z = -0.7;
  g.add(maneGeo);

  for (const [sx, sz] of [
    [0.95, 0.34],
    [0.95, -0.34],
    [-0.85, 0.34],
    [-0.85, -0.34],
  ]) {
    const leg = cyl(0.12, 0.14, 1.15, HORSE, 6);
    leg.position.set(sx, 0.57, sz);
    g.add(leg);
  }

  // Đuôi rủ.
  const tail = cyl(0.06, 0.12, 0.9, MANE, 5);
  tail.position.set(-1.15, 1.1, 0);
  tail.rotation.z = 0.9;
  g.add(tail);

  // Yên ngựa.
  const saddle = box(0.85, 0.16, 0.72, CLOTH_RED);
  saddle.position.set(-0.05, 2.05, 0);
  g.add(saddle);
  return g;
}

// Người cưỡi cách điệu (ngồi, hai chân buông hai bên) — gắn lên voi/ngựa.
// Trả về Group với gốc ở hông; hướng +X. shoulder ở +Y so với gốc.
interface Rider {
  g: THREE.Group;
  shoulderY: number;
  shoulderZ: number;
}

function seatedRider(robe: number, accent: number): Rider {
  const g = new THREE.Group();

  const hips = cyl(0.3, 0.34, 0.34, robe, 8);
  hips.position.y = 0.1;
  g.add(hips);

  // Hai chân buông hai bên, cẳng chân gập xuống.
  for (const sz of [-1, 1]) {
    const thigh = cyl(0.12, 0.14, 0.5, robe, 6);
    thigh.position.set(0.12, -0.02, sz * 0.34);
    thigh.rotation.x = sz * 0.5;
    g.add(thigh);
    const shin = cyl(0.1, 0.12, 0.55, robe, 6);
    shin.position.set(0.28, -0.42, sz * 0.42);
    g.add(shin);
    const boot = box(0.26, 0.12, 0.16, accent);
    boot.position.set(0.42, -0.68, sz * 0.42);
    g.add(boot);
  }

  const torso = cyl(0.3, 0.34, 0.72, robe, 8);
  torso.position.y = 0.6;
  g.add(torso);
  const belt = cyl(0.35, 0.35, 0.14, accent, 8);
  belt.position.y = 0.28;
  g.add(belt);

  const shoulders = cyl(0.15, 0.16, 0.7, robe, 6);
  shoulders.rotation.x = Math.PI / 2;
  shoulders.position.y = 0.92;
  g.add(shoulders);

  const neck = cyl(0.1, 0.12, 0.14, SKIN, 6);
  neck.position.y = 1.04;
  g.add(neck);
  const head = ball(0.26, SKIN, 1);
  head.position.y = 1.35;
  g.add(head);
  const hair = ball(0.28, HAIR, 1);
  hair.scale.set(1, 0.6, 1);
  hair.position.set(-0.05, 1.5, 0);
  g.add(hair);
  const bun = cyl(0.09, 0.11, 0.14, HAIR, 6);
  bun.position.y = 1.64;
  g.add(bun);

  return { g, shoulderY: 0.92, shoulderZ: 0.34 };
}

function attachRiderArm(
  rider: Rider,
  side: number,
  color: number,
  rotZ: number,
  rotX = 0,
  len = 0.6,
): THREE.Group {
  const arm = makeArm(color, len);
  arm.position.set(0, rider.shoulderY, side * rider.shoulderZ);
  arm.rotation.z = rotZ;
  arm.rotation.x = rotX;
  rider.g.add(arm);
  return arm;
}

// ── 8 anh hùng ───────────────────────────────────────────────────────────

// 1. Vua Hùng — áo choàng Văn Lang, tay đặt trên trống đồng Đông Sơn.
function hungVuong(): THREE.Group {
  const g = new THREE.Group();
  const t = standingBody(HUNG_ROBE, BRONZE);

  // Mũ lông chim (họa tiết trống đồng) — vành + chùm lông vươn.
  const crownBand = cyl(0.3, 0.31, 0.14, BRONZE, 8);
  crownBand.position.y = 2.62;
  t.g.add(crownBand);
  for (let i = 0; i < 4; i++) {
    const feather = cone(0.05, 0.5, DARK_BRONZE, 4);
    feather.position.set(-0.12, 2.95, (i - 1.5) * 0.12);
    feather.rotation.z = 0.35;
    t.g.add(feather);
  }

  // Hoa văn trống đồng trên ngực (vòng đồng).
  const chestRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 16), mat(BRONZE, 0.5));
  chestRing.position.set(0.34, 1.65, 0);
  chestRing.rotation.y = Math.PI / 2;
  t.g.add(chestRing);

  // Tay trái buông; tay phải đưa ngang đặt lên mặt trống.
  attachArm(t, -1, HUNG_ROBE, 0.2);
  attachArm(t, 1, HUNG_ROBE, Math.PI / 2 - 0.15, 0.3, 0.8);
  g.add(t.g);

  // Trống đồng Đông Sơn bên phải (mặt trống ngang tầm tay).
  const drum = new THREE.Group();
  const profile: THREE.Vector2[] = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.5, 0),
    new THREE.Vector2(0.5, 0.04),
    new THREE.Vector2(0.4, 0.28),
    new THREE.Vector2(0.34, 0.62),
    new THREE.Vector2(0.46, 0.86),
    new THREE.Vector2(0.46, 0.9),
  ];
  const drumMesh = new THREE.Mesh(new THREE.LatheGeometry(profile, 20), mat(BRONZE, 0.5));
  drumMesh.material.side = THREE.DoubleSide;
  drum.add(drumMesh);
  const star = cone(0.2, 0.06, DARK_BRONZE, 12);
  star.position.y = 0.92;
  drum.add(star);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.02, 6, 20), mat(DARK_BRONZE, 0.5));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.9;
  drum.add(ring);
  drum.position.set(0.85, 0, 0.55);
  g.add(drum);
  return g;
}

// 2. Hai Bà Trưng — một nữ tướng cưỡi voi, tay cầm cờ và kiếm, giáp nhẹ.
function haiBaTrung(): THREE.Group {
  const g = new THREE.Group();
  const elephant = makeElephant();
  g.add(elephant);

  const rider = seatedRider(TRUNG_ROBE, GOLD);

  // Khăn/mũ nữ tướng + búi cao đã có; thêm giáp vai vàng.
  for (const sz of [-1, 1]) {
    const pauldron = ball(0.16, GOLD, 0);
    pauldron.scale.set(1, 0.6, 1);
    pauldron.position.set(0, 0.98, sz * 0.32);
    rider.g.add(pauldron);
  }

  // Tay phải giương cờ lên; tay trái cầm kiếm chỉ chếch.
  const flagArm = attachRiderArm(rider, 1, TRUNG_ROBE, Math.PI - 0.4, 0, 0.62);
  const flag = makeFlag(CLOTH_RED);
  flag.position.y = -0.62;
  flag.rotation.z = Math.PI;
  flagArm.add(flag);

  const swordArm = attachRiderArm(rider, -1, TRUNG_ROBE, Math.PI / 2 + 0.3, 0, 0.6);
  const sword = makeSword(0.85);
  sword.position.y = -0.6;
  sword.rotation.z = Math.PI;
  swordArm.add(sword);

  rider.g.position.set(-0.1, 2.42, 0);
  g.add(rider.g);
  return g;
}

// 3. Ngô Quyền — tướng giáp, cầm kiếm, cạnh cọc gỗ nhọn trận Bạch Đằng.
function ngoQuyen(): THREE.Group {
  const g = new THREE.Group();
  const t = standingBody(NGO_ROBE, STEEL, false);

  // Mũ trụ chiến + chóp.
  const helmet = cyl(0.3, 0.32, 0.26, STEEL, 8);
  helmet.position.y = 2.56;
  t.g.add(helmet);
  const helmTip = cone(0.08, 0.24, GOLD, 6);
  helmTip.position.y = 2.82;
  t.g.add(helmTip);

  // Giáp phiến trên ngực.
  for (let i = 0; i < 3; i++) {
    const plate = box(0.06, 0.16, 0.42, STEEL);
    plate.position.set(0.33, 1.75 - i * 0.2, 0);
    t.g.add(plate);
  }

  // Tay trái buông; tay phải nâng kiếm chếch lên trước.
  attachArm(t, -1, NGO_ROBE, 0.25);
  const swordArm = attachArm(t, 1, NGO_ROBE, Math.PI / 2 + 0.5, 0, 0.78);
  const sword = makeSword(1.15);
  sword.position.y = -0.78;
  sword.rotation.z = Math.PI;
  swordArm.add(sword);
  g.add(t.g);

  // Vài cọc gỗ nhọn cắm nghiêng (trận Bạch Đằng 938).
  const stakePos: Array<[number, number]> = [
    [-0.95, 0.6],
    [-1.25, -0.5],
    [-0.7, -0.85],
  ];
  for (const [sx, sz] of stakePos) {
    const stake = cyl(0.05, 0.11, 1.3, WOOD, 6);
    stake.position.set(sx, 0.55, sz);
    stake.rotation.z = 0.4;
    stake.rotation.y = sz;
    g.add(stake);
    const tip = cone(0.05, 0.3, WOOD, 5);
    tip.position.set(sx + 0.28, 1.2, sz);
    tip.rotation.z = -0.4 + Math.PI;
    tip.rotation.y = sz;
    g.add(tip);
  }
  return g;
}

// 4. Đinh Bộ Lĩnh — đế vương Hoa Lư, long bào, cầm kiếm, có bó cờ lau.
function dinhBoLinh(): THREE.Group {
  const g = new THREE.Group();
  const t = standingBody(DINH_ROBE, GOLD);

  // Mũ bình thiên đơn giản (khối hộp trên đầu).
  const crown = box(0.5, 0.12, 0.4, GOLD);
  crown.position.y = 2.78;
  t.g.add(crown);
  const crownBase = cyl(0.3, 0.31, 0.14, GOLD, 8);
  crownBase.position.y = 2.64;
  t.g.add(crownBase);

  // Bổ tử long bào (ô vuông vàng trước ngực).
  const badge = box(0.05, 0.28, 0.28, GOLD);
  badge.position.set(0.34, 1.62, 0);
  t.g.add(badge);

  // Tay trái buông; tay phải chống kiếm chúc mũi xuống trước.
  attachArm(t, -1, DINH_ROBE, 0.22);
  const swordArm = attachArm(t, 1, DINH_ROBE, 0.9, 0, 0.7);
  const sword = makeSword(1.0);
  sword.position.y = -0.7;
  sword.rotation.z = Math.PI;
  swordArm.add(sword);
  g.add(t.g);

  // Bó cờ lau bên trái (tích «cờ lau tập trận»).
  const bundle = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const dx = Math.cos(ang) * 0.08;
    const dz = Math.sin(ang) * 0.08;
    const stalk = cyl(0.018, 0.025, 1.7, REED_STALK, 5);
    stalk.position.set(dx, 0.85, dz);
    stalk.rotation.z = dx * 0.5;
    bundle.add(stalk);
    const fluff = cone(0.07, 0.4, REED, 5);
    fluff.position.set(dx * 1.4, 1.75, dz);
    bundle.add(fluff);
  }
  bundle.position.set(-0.7, 0, 0.5);
  g.add(bundle);
  return g;
}

// 5. Lý Thái Tổ — long bào, hai tay nâng cuộn Chiếu dời đô (tượng đài Hồ Gươm).
function lyThaiTo(): THREE.Group {
  const g = new THREE.Group();
  const t = standingBody(LY_ROBE, 0x8a1f1f);

  // Mũ miện đế vương với dải rủ.
  const crownBase = cyl(0.3, 0.31, 0.16, 0x8a1f1f, 8);
  crownBase.position.y = 2.64;
  t.g.add(crownBase);
  const crownTop = box(0.46, 0.14, 0.36, GOLD);
  crownTop.position.y = 2.8;
  t.g.add(crownTop);
  for (const sz of [-1, 1]) {
    const tassel = cyl(0.02, 0.02, 0.3, GOLD, 4);
    tassel.position.set(0.2, 2.66, sz * 0.15);
    t.g.add(tassel);
  }

  // Hai tay đưa ra trước, khuỷu gập, cùng nâng cuộn chiếu ngang.
  attachArm(t, -1, LY_ROBE, Math.PI / 2 - 0.25, -0.5, 0.68);
  attachArm(t, 1, LY_ROBE, Math.PI / 2 - 0.25, 0.5, 0.68);

  // Cuộn Chiếu dời đô (trụ giấy nằm ngang trước bụng, hé phần mở).
  const scroll = new THREE.Group();
  const roll = cyl(0.12, 0.12, 0.66, SCROLL, 10);
  roll.rotation.x = Math.PI / 2;
  scroll.add(roll);
  for (const sz of [-1, 1]) {
    const cap = cyl(0.14, 0.14, 0.06, GOLD, 10);
    cap.rotation.x = Math.PI / 2;
    cap.position.z = sz * 0.34;
    scroll.add(cap);
  }
  const sheet = box(0.02, 0.34, 0.6, SCROLL);
  sheet.position.set(0.12, -0.14, 0);
  sheet.rotation.z = 0.5;
  scroll.add(sheet);
  scroll.position.set(0.62, 1.55, 0);
  t.g.add(scroll);
  g.add(t.g);
  return g;
}

// 6. Trần Hưng Đạo — đại tướng giáp trụ, một tay chỉ kiếm về phía trước.
function tranHungDao(): THREE.Group {
  const g = new THREE.Group();
  const t = standingBody(TRAN_ROBE, GOLD, false);

  // Mũ trụ đại tướng.
  const helmet = cyl(0.31, 0.33, 0.28, TRAN_ROBE, 8);
  helmet.position.y = 2.58;
  t.g.add(helmet);
  const helmCrest = cone(0.07, 0.3, GOLD, 6);
  helmCrest.position.y = 2.88;
  t.g.add(helmCrest);

  // Choàng bào sau lưng (tấm phất về -X).
  const cloak = box(0.08, 1.3, 0.7, CLOTH_RED);
  cloak.position.set(-0.36, 1.35, 0);
  cloak.rotation.z = -0.12;
  t.g.add(cloak);

  // Giáp vai.
  for (const sz of [-1, 1]) {
    const pauldron = ball(0.17, GOLD, 0);
    pauldron.scale.set(1, 0.55, 1);
    pauldron.position.set(0, 1.98, sz * 0.36);
    t.g.add(pauldron);
  }

  // Tay trái chống hông; tay phải duỗi thẳng chỉ kiếm về +X (thế tượng đài).
  attachArm(t, -1, TRAN_ROBE, 0.5, 0.4);
  const swordArm = attachArm(t, 1, TRAN_ROBE, Math.PI / 2, 0, 0.8);
  const sword = makeSword(1.2);
  sword.position.y = -0.8;
  sword.rotation.z = Math.PI;
  swordArm.add(sword);
  g.add(t.g);
  return g;
}

// 7. Lê Lợi — vua giơ kiếm lên cao (tích gươm Thuận Thiên), long bào.
function leLoi(): THREE.Group {
  const g = new THREE.Group();
  const t = standingBody(LE_ROBE, 0x2f6b46);

  // Mũ miện.
  const crownBase = cyl(0.3, 0.31, 0.16, 0x2f6b46, 8);
  crownBase.position.y = 2.64;
  t.g.add(crownBase);
  const crownTop = box(0.46, 0.14, 0.36, GOLD);
  crownTop.position.y = 2.8;
  t.g.add(crownTop);

  // Bổ tử long bào.
  const badge = box(0.05, 0.28, 0.28, 0x2f6b46);
  badge.position.set(0.34, 1.62, 0);
  t.g.add(badge);

  // Tay trái buông; tay phải giơ thẳng kiếm lên cao.
  attachArm(t, -1, LE_ROBE, 0.24);
  const swordArm = attachArm(t, 1, LE_ROBE, Math.PI - 0.12, 0, 0.8);
  const sword = makeSword(1.35);
  sword.position.y = -0.8;
  sword.rotation.z = Math.PI;
  swordArm.add(sword);
  g.add(t.g);
  return g;
}

// 8. Quang Trung — hoàng đế áo bào cưỡi ngựa, tay cầm kiếm.
function quangTrung(): THREE.Group {
  const g = new THREE.Group();
  const horse = makeHorse();
  g.add(horse);

  const rider = seatedRider(QUANG_ROBE, GOLD);

  // Mũ đâu mâu hoàng đế.
  const helmet = cyl(0.26, 0.28, 0.22, GOLD, 8);
  helmet.position.y = 1.5;
  rider.g.add(helmet);
  const helmTip = cone(0.06, 0.18, CLOTH_RED, 6);
  helmTip.position.y = 1.68;
  rider.g.add(helmTip);

  // Giáp vai.
  for (const sz of [-1, 1]) {
    const pauldron = ball(0.15, GOLD, 0);
    pauldron.scale.set(1, 0.6, 1);
    pauldron.position.set(0, 0.98, sz * 0.32);
    rider.g.add(pauldron);
  }

  // Tay trái ghì cương; tay phải vung kiếm chếch lên trước.
  attachRiderArm(rider, -1, QUANG_ROBE, Math.PI / 2 - 0.2, 0, 0.58);
  const swordArm = attachRiderArm(rider, 1, QUANG_ROBE, Math.PI / 2 + 0.7, 0, 0.62);
  const sword = makeSword(1.0);
  sword.position.y = -0.62;
  sword.rotation.z = Math.PI;
  swordArm.add(sword);

  rider.g.position.set(-0.05, 2.05, 0);
  g.add(rider.g);
  return g;
}

// ── 10 nhân vật bổ sung cho «Hành trình lịch sử» ────────────────────────────
// Cùng quy ước cách điệu: đầu cầu trơn KHÔNG tả chân dung thật — đây là tạo
// hình theo tượng đài/SGK, không phải ngoại hình đã được sử liệu xác nhận.

// 9. Bà Triệu — nữ tướng cưỡi voi, giáo dài, giáp vàng đồng (quy ước tượng đài
// đền Bà Triệu, Thanh Hoá).
function baTrieu(): THREE.Group {
  const g = new THREE.Group();
  const elephant = makeElephant();
  g.add(elephant);

  const rider = seatedRider(BA_TRIEU_ROBE, BA_TRIEU_ACCENT);

  // Tay trái ghì cương; tay phải cầm giáo dài chếch lên trước.
  attachRiderArm(rider, -1, BA_TRIEU_ROBE, Math.PI / 2 - 0.2, 0, 0.58);
  const spearArm = attachRiderArm(rider, 1, BA_TRIEU_ROBE, Math.PI / 2 + 0.5, 0, 0.6);
  const spear = makeSpear(1.5);
  spear.position.y = -0.6;
  spear.rotation.z = Math.PI;
  spearArm.add(spear);

  rider.g.position.set(-0.1, 2.42, 0);
  g.add(rider.g);
  return g;
}

// 10. Lý Bí (Lý Nam Đế) — đế vương giản dị buổi khai quốc, hai tay nâng hốt
// ngà trước ngực, không phô binh khí.
function lyBi(): THREE.Group {
  const g = new THREE.Group();
  const t = standingBody(LY_BI_ROBE, LY_BI_ACCENT, false);

  // Mũ bình thiên giản lược (một vành thấp, không cầu kỳ).
  const crown = cyl(0.28, 0.29, 0.1, LY_BI_ACCENT, 8);
  crown.position.y = 2.6;
  t.g.add(crown);

  // Hai tay đưa ra trước, khuỷu gập nhẹ, cùng nâng hốt ngà.
  attachArm(t, -1, LY_BI_ROBE, Math.PI / 2 - 0.2, -0.4, 0.6);
  attachArm(t, 1, LY_BI_ROBE, Math.PI / 2 - 0.2, 0.4, 0.6);
  const hot = box(0.16, 0.55, 0.05, IVORY);
  hot.position.set(0.55, 1.55, 0);
  t.g.add(hot);
  g.add(t.g);
  return g;
}

// 11. Mai Thúc Loan (Mai Hắc Đế) — thủ lĩnh dấy binh Hoan Châu, đại đao + khiên mây.
function maiThucLoan(): THREE.Group {
  const g = new THREE.Group();
  const t = standingBody(MAI_ROBE, MAI_ACCENT, false);

  // Khăn quấn đầu giản dị (thay vành mũ).
  const headband = cyl(0.3, 0.3, 0.08, MAI_ACCENT, 8);
  headband.position.y = 2.5;
  t.g.add(headband);

  // Tay trái mang khiên mây; tay phải cầm đại đao chếch lên trước.
  const shieldArm = attachArm(t, -1, MAI_ROBE, 0.3, 0, 0.6);
  const shield = makeShield(0.3);
  shield.position.y = -0.6;
  shieldArm.add(shield);

  const daoArm = attachArm(t, 1, MAI_ROBE, Math.PI / 2 + 0.4, 0, 0.7);
  const dao = makeSpear(1.0, BLADE);
  dao.position.y = -0.7;
  dao.rotation.z = Math.PI;
  daoArm.add(dao);
  g.add(t.g);
  return g;
}

// 12. Lê Hoàn (Lê Đại Hành) — giáp trụ thời Đinh – Tiền Lê (bám theo dinhBoLinh)
// khoác thêm long bào nhẹ, cầm thương.
function leHoan(): THREE.Group {
  const g = new THREE.Group();
  const t = standingBody(STEEL, LE_HOAN_ACCENT, false);

  // Mũ trụ chiến + chóp (cùng kiểu ngoQuyen để giữ nhất quán thời đại).
  const helmet = cyl(0.3, 0.32, 0.26, STEEL, 8);
  helmet.position.y = 2.56;
  t.g.add(helmet);
  const helmTip = cone(0.08, 0.24, GOLD, 6);
  helmTip.position.y = 2.82;
  t.g.add(helmTip);

  // Long bào khoác ngoài (tấm phất sau lưng, như tranHungDao).
  const cloak = box(0.08, 1.2, 0.66, LE_HOAN_ACCENT);
  cloak.position.set(-0.34, 1.4, 0);
  cloak.rotation.z = -0.1;
  t.g.add(cloak);

  // Bổ tử nhỏ trước ngực (đế vương xuất thân tướng quân).
  const badge = box(0.05, 0.22, 0.22, GOLD);
  badge.position.set(0.34, 1.65, 0);
  t.g.add(badge);

  // Tay trái buông; tay phải cầm thương chếch lên trước (thế thủ).
  attachArm(t, -1, STEEL, 0.24);
  const spearArm = attachArm(t, 1, STEEL, 0.85, 0, 0.72);
  const spear = makeSpear(1.3);
  spear.position.y = -0.72;
  spear.rotation.z = Math.PI;
  spearArm.add(spear);
  g.add(t.g);
  return g;
}

// 13. Lý Thường Kiệt — giáp trụ thời Lý, trường kiếm, thẻ tre bên hông tượng
// trưng bài thơ thần «Nam quốc sơn hà».
function lyThuongKiet(): THREE.Group {
  const g = new THREE.Group();
  const t = standingBody(LTK_ROBE, GOLD, false);

  const helmet = cyl(0.3, 0.32, 0.26, LTK_ROBE, 8);
  helmet.position.y = 2.56;
  t.g.add(helmet);
  const helmTip = cone(0.07, 0.22, GOLD, 6);
  helmTip.position.y = 2.8;
  t.g.add(helmTip);

  // Tay trái buông; tay phải chống trường kiếm chúc mũi xuống trước.
  attachArm(t, -1, LTK_ROBE, 0.22);
  const swordArm = attachArm(t, 1, LTK_ROBE, 0.9, 0, 0.74);
  const sword = makeSword(1.1);
  sword.position.y = -0.74;
  sword.rotation.z = Math.PI;
  swordArm.add(sword);
  g.add(t.g);

  // Bó thẻ tre bên hông (tượng trưng bài thơ thần).
  const bundle = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const slat = box(0.05, 0.5, 0.02, SCROLL);
    slat.position.set(0, 0, (i - 1.5) * 0.03);
    bundle.add(slat);
  }
  bundle.position.set(0.3, 1.15, 0.44);
  bundle.rotation.z = 0.15;
  g.add(bundle);
  return g;
}

// 14. Trần Nhân Tông (Phật hoàng) — tăng sĩ ngồi thiền, cà sa, tràng hạt,
// KHÔNG giáp/binh khí. Dựng riêng (không dùng standingBody vì hàm đó luôn
// gắn khối tóc — tăng sĩ đầu trọc).
function tranNhanTong(): THREE.Group {
  const g = new THREE.Group();

  // Đệm toạ.
  const cushion = cyl(0.5, 0.56, 0.14, MONK_SASH, 10);
  cushion.position.y = 0.07;
  g.add(cushion);

  // Thân ngồi xếp bằng (khối trụ loe thay hai chân gập).
  const lap = cyl(0.32, 0.5, 0.42, MONK_ROBE, 8);
  lap.position.y = 0.35;
  g.add(lap);

  const torso = cyl(0.3, 0.33, 0.7, MONK_ROBE, 8);
  torso.position.y = 0.92;
  g.add(torso);

  // (Đã bỏ dải cà sa chéo vai theo phản hồi §9 — tấm phẳng vàng nghệ dựng
  // đứng đọc thành "ván lạ" gây nhiễu hơn là giúp nhận dạng; áo nâu + đầu
  // trọc đã đủ đọc ra tăng sĩ, không cần thêm chi tiết khó hiểu.)

  const shoulders = cyl(0.14, 0.16, 0.62, MONK_ROBE, 6);
  shoulders.rotation.x = Math.PI / 2;
  shoulders.position.y = 1.24;
  g.add(shoulders);

  const neck = cyl(0.1, 0.12, 0.14, SKIN, 6);
  neck.position.y = 1.36;
  g.add(neck);
  const head = ball(0.27, SKIN, 1);
  head.position.y = 1.66;
  g.add(head);
  // Nhục kế nhỏ trên đỉnh đầu (không tóc — đầu trọc tăng sĩ).
  const ushnisha = ball(0.09, SKIN, 0);
  ushnisha.position.y = 1.9;
  g.add(ushnisha);

  // Hai tay gập vào trước ngực, chắp lại (ấn thiền).
  for (const sz of [-1, 1]) {
    const arm = cyl(0.09, 0.11, 0.42, MONK_ROBE, 6);
    arm.position.set(0.18, 1.06, sz * 0.16);
    arm.rotation.z = -sz * 0.9;
    arm.rotation.x = sz * 0.5;
    g.add(arm);
  }
  const hands = ball(0.11, SKIN, 0);
  hands.position.set(0.32, 0.98, 0);
  g.add(hands);

  // Tràng hạt vắt qua tay chắp.
  const mala = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.025, 6, 12), mat(WOOD, 0.6));
  mala.rotation.x = Math.PI / 2.4;
  mala.position.set(0.3, 0.86, 0);
  g.add(mala);

  return g;
}

// 15. Nguyễn Ánh (Gia Long) — đế vương cung đình Huế, long bào vàng (tương
// phản màu đỏ Tây Sơn của quangTrung), cầm ấn và kiếm nghi lễ.
function nguyenAnh(): THREE.Group {
  const g = new THREE.Group();
  const t = standingBody(NGUYEN_ANH_ROBE, NGUYEN_ANH_ACCENT);

  const crownBase = cyl(0.3, 0.31, 0.16, NGUYEN_ANH_ACCENT, 8);
  crownBase.position.y = 2.64;
  t.g.add(crownBase);
  const crownTop = box(0.46, 0.14, 0.36, GOLD);
  crownTop.position.y = 2.8;
  t.g.add(crownTop);
  const crownJewel = ball(0.06, NGUYEN_ANH_ACCENT, 0);
  crownJewel.position.y = 2.9;
  t.g.add(crownJewel);

  const badge = box(0.05, 0.28, 0.28, NGUYEN_ANH_ACCENT);
  badge.position.set(0.34, 1.62, 0);
  t.g.add(badge);

  // Tay trái nâng ấn triện; tay phải chống kiếm nghi lễ chúc mũi xuống.
  const sealArm = attachArm(t, -1, NGUYEN_ANH_ROBE, Math.PI / 2 - 0.3, -0.3, 0.6);
  const seal = box(0.16, 0.14, 0.16, GOLD);
  seal.position.y = -0.62;
  sealArm.add(seal);

  const swordArm = attachArm(t, 1, NGUYEN_ANH_ROBE, 0.9, 0, 0.7);
  const sword = makeSword(1.0);
  sword.position.y = -0.7;
  sword.rotation.z = Math.PI;
  swordArm.add(sword);
  g.add(t.g);
  return g;
}

// 16. Trương Định (Bình Tây Đại Nguyên Soái) — nghĩa quân Nam Kỳ, áo vải giản
// dị, gươm + cờ lệnh «Bình Tây».
function truongDinh(): THREE.Group {
  const g = new THREE.Group();
  const t = standingBody(TRUONG_DINH_ROBE, CLOTH_RED, false);

  // Khăn vấn đầu (thay mũ/crown — không phải quan phục triều đình).
  const headband = cyl(0.3, 0.3, 0.08, CLOTH_RED, 8);
  headband.position.y = 2.5;
  t.g.add(headband);

  // Tay trái cầm cờ lệnh; tay phải cầm gươm chếch lên trước.
  const flagArm = attachArm(t, -1, TRUONG_DINH_ROBE, Math.PI / 2 - 0.3, -0.3, 0.62);
  const flag = makeFlag(CLOTH_RED);
  flag.scale.set(0.75, 0.75, 0.75);
  flag.position.y = -0.62;
  flag.rotation.z = Math.PI;
  flagArm.add(flag);

  const swordArm = attachArm(t, 1, TRUONG_DINH_ROBE, Math.PI / 2 + 0.4, 0, 0.72);
  const sword = makeSword(1.0);
  sword.position.y = -0.72;
  sword.rotation.z = Math.PI;
  swordArm.add(sword);
  g.add(t.g);
  return g;
}

// 17. Vua Hàm Nghi — vua trẻ tuổi lưu vong, áo giản lược (không đại triều
// phục), hai tay nâng cuộn chiếu chỉ Cần Vương (thế giống lyThaiTo nhưng nhỏ,
// mộc mạc hơn — không mũ miện lớn, chỉ vành khăn mảnh).
function hamNghi(): THREE.Group {
  const g = new THREE.Group();
  const t = standingBody(HAM_NGHI_ROBE, HAM_NGHI_ACCENT, false);

  // Vành khăn mảnh (không phải miện đế vương đầy đủ).
  const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.025, 6, 12), mat(GOLD, 0.5));
  circlet.rotation.x = Math.PI / 2;
  circlet.position.y = 2.58;
  t.g.add(circlet);

  attachArm(t, -1, HAM_NGHI_ROBE, Math.PI / 2 - 0.25, -0.5, 0.62);
  attachArm(t, 1, HAM_NGHI_ROBE, Math.PI / 2 - 0.25, 0.5, 0.62);

  // Cuộn chiếu chỉ (nhỏ hơn cuộn của lyThaiTo).
  const scroll = new THREE.Group();
  const roll = cyl(0.09, 0.09, 0.5, SCROLL, 10);
  roll.rotation.x = Math.PI / 2;
  scroll.add(roll);
  for (const sz of [-1, 1]) {
    const cap = cyl(0.11, 0.11, 0.05, GOLD, 10);
    cap.rotation.x = Math.PI / 2;
    cap.position.z = sz * 0.26;
    scroll.add(cap);
  }
  scroll.position.set(0.56, 1.5, 0);
  t.g.add(scroll);
  g.add(t.g);
  return g;
}

// 18. Phan Bội Châu — nho sĩ đầu thế kỷ XX, áo the đen, khăn xếp, cầm sách.
function phanBoiChau(): THREE.Group {
  const g = new THREE.Group();
  const t = standingBody(PHAN_ROBE, PHAN_ACCENT, false);

  // Khăn xếp (vành quấn dày kiểu nho sĩ, thay mũ/miện).
  const turban = cyl(0.31, 0.33, 0.18, PHAN_ACCENT, 10);
  turban.position.y = 2.54;
  t.g.add(turban);
  const turbanTop = cyl(0.26, 0.29, 0.08, PHAN_ACCENT, 10);
  turbanTop.position.y = 2.66;
  t.g.add(turbanTop);

  // Tay trái buông; tay phải cầm tập sách trước ngực.
  attachArm(t, -1, PHAN_ROBE, 0.22);
  const bookArm = attachArm(t, 1, PHAN_ROBE, Math.PI / 2 - 0.15, 0.35, 0.6);
  const book = box(0.24, 0.05, 0.32, SCROLL);
  book.position.y = -0.62;
  bookArm.add(book);
  g.add(t.g);
  return g;
}

// ── 4 VẬT biểu tượng thế kỷ XX ───────────────────────────────────────────
// Chủ dự án quyết: không dựng chân dung cách điệu cho các lãnh tụ/tướng lĩnh
// hiện đại — dựng VẬT gắn với sự kiện thay thế. Không dùng standingBody/
// seatedRider (đó là khung người); chỉ ghép primitive như các đạo cụ khác.

// 19. Tàu Amiral Latouche-Tréville — tàu hơi nước Chargeurs Réunis đầu TK20
// (bến Nhà Rồng, 1911). Một ống khói lớn + hai cột buồm TRẦN (không cánh
// buồm) — đây là tàu hơi nước, khác hẳn thuyền buồm cổ.
function tauLatoucheTreville(): THREE.Group {
  const g = new THREE.Group();

  const hull = box(3.2, 0.6, 0.75, SHIP_HULL);
  hull.position.set(0, 0.5, 0);
  g.add(hull);
  // Mũi tàu vát nhọn hướng +X.
  const bow = cone(0.4, 0.9, SHIP_HULL, 6);
  bow.rotation.z = -Math.PI / 2;
  bow.position.set(1.9, 0.5, 0);
  g.add(bow);
  // Đuôi tàu bo tròn.
  const stern = ball(0.4, SHIP_HULL, 1);
  stern.scale.set(0.6, 1, 1);
  stern.position.set(-1.6, 0.5, 0);
  g.add(stern);

  const deck = box(3.0, 0.06, 0.7, WOOD);
  deck.position.set(0, 0.83, 0);
  g.add(deck);

  const bridge = box(0.9, 0.5, 0.6, SHIP_TRIM);
  bridge.position.set(-0.1, 1.12, 0);
  g.add(bridge);

  // Ống khói lớn + vành sọc.
  const funnel = cyl(0.24, 0.28, 0.95, SHIP_FUNNEL, 10);
  funnel.position.set(-0.1, 1.85, 0);
  g.add(funnel);
  const funnelBand = cyl(0.27, 0.27, 0.14, SHIP_BAND, 10);
  funnelBand.position.set(-0.1, 2.24, 0);
  g.add(funnelBand);

  // Hai cột buồm trần (tàu hơi nước, không cánh buồm).
  for (const sx of [0.9, -1.0]) {
    const mast = cyl(0.035, 0.045, 1.6, WOOD, 6);
    mast.position.set(sx, 1.55, 0);
    g.add(mast);
    const crow = ball(0.07, WOOD, 0);
    crow.position.set(sx, 2.32, 0);
    g.add(crow);
  }

  // Lan can boong hai bên mép.
  for (const sz of [-1, 1]) {
    const rail = box(3.0, 0.1, 0.02, SHIP_TRIM);
    rail.position.set(0, 0.92, sz * 0.35);
    g.add(rail);
  }

  return g;
}

// 20. Lễ đài Ba Đình, 2/9/1945 — bục gỗ nhiều bậc, phông + mái đơn giản, cờ
// đỏ sao vàng cắm cao. KHÔNG đặt hình người nào trên lễ đài.
function leDaiBaDinh(): THREE.Group {
  const g = new THREE.Group();

  // Ba bậc bục gỗ, to dần xuống dưới.
  const tiers: Array<[number, number, number, number]> = [
    [2.4, 0.22, 1.6, 0.11],
    [1.9, 0.22, 1.3, 0.33],
    [1.4, 0.22, 1.0, 0.55],
  ];
  for (const [w, h, d, y] of tiers) {
    const tier = box(w, h, d, WOOD);
    tier.position.y = y;
    g.add(tier);
  }

  // Phông gỗ phía sau + mái đơn giản.
  const backdrop = box(2.2, 1.7, 0.12, PODIUM_BACKDROP);
  backdrop.position.set(-0.6, 1.5, -0.5);
  g.add(backdrop);
  const roof = box(2.4, 0.14, 0.9, WOOD);
  roof.position.set(-0.6, 2.4, -0.35);
  roof.rotation.x = -0.15;
  g.add(roof);

  // Cờ đỏ sao vàng cắm cao giữa bục (bắt buộc có sao — cờ đỏ trơn là sai cờ).
  // Sửa lỗi §9: bản đầu dùng CLOTH_RED (đỏ nâu sẫm của cờ hiệu quân đội) và
  // sao quá nhỏ so với cả cụm lễ đài + cán cờ cao — nay dùng đúng màu quốc kỳ
  // riêng (FLAG_RED/FLAG_GOLD), cán cờ rút ngắn để cờ không bị "chìm" khi máy
  // ảo tự lùi ra xa cho vừa khung, và sao to hẳn lên (r=0.24, gần 2/3 chiều
  // cao vải) để không còn là "một chấm không thấy".
  const pole = cyl(0.04, 0.045, 2.2, WOOD, 6);
  pole.position.set(0.3, 1.1, 0.1);
  g.add(pole);
  const cloth = box(0.05, 0.85, 1.15, FLAG_RED);
  cloth.position.set(0.3, 1.85, 0.65);
  g.add(cloth);
  // Sao phải có ở CẢ HAI mặt vải. Bản một mặt đã dựng đúng hình nhưng chỉ nằm
  // ở mặt +X, mà góc máy ảo mặc định lúc mở mô hình lại nhìn vào mặt −X — người
  // dùng thấy một lá cờ đỏ trơn và phải tự kéo xoay nửa vòng mới thấy quốc kỳ.
  // Đo trên Chrome bằng cách chụp 4 góc mới lộ ra; ảnh một góc không đủ.
  // Chữa bằng cách xoay cả cụm cờ về phía máy ảo thì vô nghĩa: mô hình xoay
  // được nên mặt kia vẫn lộ ra. Cờ thật cũng có sao hai mặt.
  // Vải X:[0.275, 0.325]; mỗi sao dày 0,05 và cách mặt vải gần nhất 0,005.
  for (const [x, huong] of [[0.355, 1], [0.245, -1]] as const) {
    const star = makeStar(0.24, FLAG_GOLD, 0.05);
    star.rotation.y = (huong * Math.PI) / 2;
    star.position.set(x, 1.85, 0.65);
    g.add(star);
  }

  return g;
}

// 21. Pháo 105mm kéo vào trận địa Điện Biên Phủ — nòng dài, hai bánh, càng
// chữ V xoè sau, dây kéo tượng trưng phía trước.
function phaoDienBien(): THREE.Group {
  const g = new THREE.Group();

  const barrel = cyl(0.05, 0.06, 2.0, STEEL, 8);
  barrel.rotation.z = -Math.PI / 2;
  barrel.position.set(0.9, 1.0, 0);
  g.add(barrel);
  const muzzle = cyl(0.07, 0.07, 0.12, STEEL, 8);
  muzzle.rotation.z = -Math.PI / 2;
  muzzle.position.set(1.9, 1.0, 0);
  g.add(muzzle);

  const breech = box(0.5, 0.42, 0.4, MILITARY_GREEN);
  breech.position.set(0.25, 1.0, 0);
  g.add(breech);
  const shield = box(0.06, 0.75, 1.1, MILITARY_GREEN);
  shield.position.set(0.55, 1.0, 0);
  g.add(shield);

  const axle = cyl(0.04, 0.04, 0.9, STEEL, 6);
  axle.rotation.x = Math.PI / 2;
  axle.position.set(0.15, 0.55, 0);
  g.add(axle);
  for (const sz of [-1, 1]) {
    const wheel = cyl(0.32, 0.32, 0.14, DARK_STEEL, 12);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(0.15, 0.55, sz * 0.5);
    g.add(wheel);
    const hub = cyl(0.08, 0.08, 0.16, STEEL, 8);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(0.15, 0.55, sz * 0.5);
    g.add(hub);
  }

  // Càng pháo chữ V xoè phía sau — gốc đặt ĐÚNG tại bệ pháo gần trục bánh
  // (0.1, 0.55, ±0.18), nằm trong khung trục bánh x∈[0.115,0.185],
  // z∈[-0.45,0.45) — nên đầu gần luôn chạm bệ pháo bất kể góc xoè. Sửa lỗi
  // §9: bản đầu định vị theo TÂM hình trụ (`cyl` luôn tự đối xứng quanh gốc),
  // xoay lệch trục khiến đầu gần hụt cách bệ pháo hẳn nửa mét — dùng makeRod
  // (gốc ở đầu, không phải giữa) để tránh lặp lại lỗi này.
  for (const sz of [-1, 1]) {
    const trail = makeRod(1.3, 0.045, 0.035, WOOD, 6);
    trail.position.set(0.1, 0.55, sz * 0.18);
    trail.rotation.z = -1.2;
    trail.rotation.y = sz * 0.3;
    g.add(trail);
  }

  // Dây kéo tượng trưng phía trước («kéo pháo vào») — gốc đặt ĐÚNG tại đầu
  // nòng (1.96, 1.0, 0), khớp mặt trước của `muzzle`, nên luôn dính vào nòng.
  const rope = makeRod(1.1, 0.03, 0.025, DARK_STEEL, 6);
  rope.position.set(1.96, 1.0, 0);
  rope.rotation.z = Math.PI / 2 - 0.3;
  g.add(rope);

  return g;
}

// 22. Xe tăng T-54 số hiệu 390 — thân thấp bè, tháp pháo tròn, nòng dài,
// xích hai bên. Số hiệu 390 thể hiện bằng mảng màu trên tháp pháo (tránh
// dựng font low-poly méo bằng khối lập phương nhỏ).
function xeTang390(): THREE.Group {
  const g = new THREE.Group();

  const hull = box(2.3, 0.55, 1.3, MILITARY_GREEN);
  hull.position.set(0, 0.55, 0);
  g.add(hull);
  const glacis = box(0.7, 0.4, 1.2, MILITARY_GREEN);
  glacis.position.set(1.1, 0.62, 0);
  glacis.rotation.z = -0.3;
  g.add(glacis);

  const turret = cyl(0.62, 0.68, 0.5, MILITARY_GREEN, 10);
  turret.position.set(-0.1, 1.08, 0);
  g.add(turret);
  const hatch = cyl(0.14, 0.14, 0.08, MILITARY_GREEN, 8);
  hatch.position.set(-0.3, 1.37, 0);
  g.add(hatch);

  const barrel = cyl(0.045, 0.05, 1.9, STEEL, 8);
  barrel.rotation.z = -Math.PI / 2;
  barrel.position.set(0.85, 1.1, 0);
  g.add(barrel);

  // Mảng số hiệu «390».
  const plate = box(0.03, 0.28, 0.4, TANK_PLATE);
  plate.position.set(-0.1, 1.1, 0.63);
  g.add(plate);

  for (const sz of [-1, 1]) {
    const track = box(2.3, 0.36, 0.28, DARK_STEEL);
    track.position.set(0, 0.28, sz * 0.72);
    g.add(track);
    for (let i = 0; i < 5; i++) {
      const roadWheel = cyl(0.16, 0.16, 0.26, DARK_STEEL, 10);
      roadWheel.rotation.x = Math.PI / 2;
      roadWheel.position.set(-0.85 + i * 0.42, 0.28, sz * 0.72);
      g.add(roadWheel);
    }
  }

  return g;
}

// ── Registry ─────────────────────────────────────────────────────────────

export interface Figure3DDef {
  id: string;
  ten: string;
  build(): THREE.Group;
}

export const FIGURES3D: Figure3DDef[] = [
  { id: "hung-vuong", ten: "Vua Hùng", build: hungVuong },
  { id: "hai-ba-trung", ten: "Hai Bà Trưng", build: haiBaTrung },
  { id: "ngo-quyen", ten: "Ngô Quyền", build: ngoQuyen },
  { id: "dinh-bo-linh", ten: "Đinh Bộ Lĩnh", build: dinhBoLinh },
  { id: "ly-thai-to", ten: "Lý Thái Tổ", build: lyThaiTo },
  { id: "tran-hung-dao", ten: "Trần Hưng Đạo", build: tranHungDao },
  { id: "le-loi", ten: "Lê Lợi", build: leLoi },
  { id: "quang-trung", ten: "Quang Trung", build: quangTrung },
  { id: "ba-trieu", ten: "Bà Triệu", build: baTrieu },
  { id: "ly-bi", ten: "Lý Bí (Lý Nam Đế)", build: lyBi },
  { id: "mai-thuc-loan", ten: "Mai Thúc Loan (Mai Hắc Đế)", build: maiThucLoan },
  { id: "le-hoan", ten: "Lê Hoàn (Lê Đại Hành)", build: leHoan },
  { id: "ly-thuong-kiet", ten: "Lý Thường Kiệt", build: lyThuongKiet },
  { id: "tran-nhan-tong", ten: "Trần Nhân Tông", build: tranNhanTong },
  { id: "nguyen-anh", ten: "Nguyễn Ánh (Gia Long)", build: nguyenAnh },
  { id: "truong-dinh", ten: "Trương Định", build: truongDinh },
  { id: "ham-nghi", ten: "Vua Hàm Nghi", build: hamNghi },
  { id: "phan-boi-chau", ten: "Phan Bội Châu", build: phanBoiChau },
  { id: "tau-latouche-treville", ten: "Tàu Amiral Latouche-Tréville", build: tauLatoucheTreville },
  { id: "le-dai-ba-dinh", ten: "Lễ đài Ba Đình", build: leDaiBaDinh },
  { id: "phao-dien-bien", ten: "Pháo 105mm Điện Biên Phủ", build: phaoDienBien },
  { id: "xe-tang-390", ten: "Xe tăng 390", build: xeTang390 },
];

// ── Trình xem ────────────────────────────────────────────────────────────

export interface FigureHandle {
  /** Dọn renderer, geometry/material, event và animation frame. Gọi khi đóng. */
  dispose(): void;
}

/**
 * Nhúng mô hình 3D một anh hùng vào `container`, tự dựng renderer/camera/scene
 * độc lập. Auto-rotate nhẹ + kéo chuột (pointer) để xoay; chỉ animate khi canvas
 * hiển thị trong viewport (IntersectionObserver).
 *
 * @param container Phần tử bọc — canvas lấp đầy kích thước của nó.
 * @param figureId  id trong {@link FIGURES3D}. Không khớp → dùng figure đầu tiên.
 * @returns Handle có `dispose()` để dọn sạch khi gỡ.
 */
export function mountFigure3D(container: HTMLElement, figureId: string): FigureHandle {
  const def = FIGURES3D.find((f) => f.id === figureId) ?? FIGURES3D[0];

  const width = Math.max(1, container.clientWidth || 320);
  const height = Math.max(1, container.clientHeight || 320);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  const canvas = renderer.domElement;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.cursor = "grab";
  canvas.style.touchAction = "none";

  // Ánh sáng: ambient dịu + hai nguồn hướng để lộ mặt low-poly.
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 5, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5);
  fill.position.set(-4, 2, -3);
  scene.add(fill);

  // Pivot quay quanh tâm model.
  const pivot = new THREE.Group();
  scene.add(pivot);
  const model = def.build();
  pivot.add(model);

  // Căn giữa + đặt camera vừa khung theo bounding box.
  const bbox = new THREE.Box3().setFromObject(model);
  const center = bbox.getCenter(new THREE.Vector3());
  const size = bbox.getSize(new THREE.Vector3());
  model.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const fitDist = (maxDim * 0.5) / Math.tan((camera.fov * Math.PI) / 360);
  const camDist = fitDist * 1.7;
  camera.position.set(0, maxDim * 0.12, camDist);
  camera.lookAt(0, 0, 0);

  // ── Tương tác kéo chuột + auto-rotate ──
  let yaw = 0.5;
  let pitch = 0.12;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  const onPointerDown = (e: PointerEvent): void => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.style.cursor = "grabbing";
    canvas.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent): void => {
    if (!dragging) return;
    yaw += (e.clientX - lastX) * 0.01;
    pitch += (e.clientY - lastY) * 0.01;
    pitch = Math.max(-1.2, Math.min(1.2, pitch));
    lastX = e.clientX;
    lastY = e.clientY;
  };
  const onPointerUp = (e: PointerEvent): void => {
    dragging = false;
    canvas.style.cursor = "grab";
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  // ── Chỉ animate khi canvas hiển thị trong viewport ──
  let onScreen = true;
  const io = new IntersectionObserver(
    (entries) => {
      onScreen = entries[0]?.isIntersecting ?? true;
      if (onScreen) start();
    },
    { threshold: 0.01 },
  );
  io.observe(container);

  // ── Theo dõi thay đổi kích thước container ──
  const ro = new ResizeObserver(() => {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  ro.observe(container);

  // ── Vòng lặp render ──
  let raf = 0;
  const tick = (): void => {
    if (!onScreen) {
      raf = 0;
      return; // dừng loop khi ẩn; IntersectionObserver sẽ khởi động lại
    }
    if (!dragging) yaw += 0.006; // auto-rotate nhẹ
    pivot.rotation.y = yaw;
    pivot.rotation.x = pitch;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  const start = (): void => {
    if (raf === 0) raf = requestAnimationFrame(tick);
  };
  start();

  return {
    dispose(): void {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mtl = m.material;
        if (Array.isArray(mtl)) mtl.forEach((x) => x.dispose());
        else if (mtl) mtl.dispose();
      });
      renderer.dispose();
      // dispose() giải phóng tài nguyên three.js nhưng KHÔNG trả WebGL context
      // về cho trình duyệt. Đo thật: tạo 24 context rồi chỉ bỏ tham chiếu →
      // Chrome tự thu hồi 9 cái ngoài ý muốn; có forceContextLoss() → 0 cái.
      // Chrome giới hạn ~16 context, vượt là mất bản đồ.
      // KHÔNG áp cách này cho landmarks3d.ts — renderer ở đó dùng chung canvas
      // với MapLibre, huỷ context là giết luôn bản đồ.
      renderer.forceContextLoss();
      if (canvas.parentNode === container) container.removeChild(canvas);
    },
  };
}
