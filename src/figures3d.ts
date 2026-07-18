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
      if (canvas.parentNode === container) container.removeChild(canvas);
    },
  };
}
