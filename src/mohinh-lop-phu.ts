// Bộ mô hình 3D low-poly cho ĐIỂM lớp phủ trên bản đồ.
//
// Vì sao tách khỏi landmarks3d.ts: file kia lo phần MapLibre custom layer (chia
// sẻ WebGL context, ma trận Mercator, vòng lặp render). File này chỉ lo HÌNH —
// dựng 12 nguyên mẫu rồi nướng mỗi cái thành đúng MỘT BufferGeometry.
//
// ── Vì sao "nướng" thành một geometry duy nhất ──────────────────────────────
// Bản trước rã mẫu thành từng mảnh mesh rồi tạo một InstancedMesh cho MỖI mảnh:
// một ngôi chùa 8 mảnh = 8 lệnh vẽ, dù có 1 hay 400 điểm. Với 5 kiểu thì ~30
// lệnh vẽ; nếu giữ cách đó mà lên 12 kiểu thì thành ~100.
//
// Gộp toàn bộ mảnh của một mẫu vào một BufferGeometry và NƯỚNG MÀU VÀO ĐỈNH
// (vertexColors) thì mỗi kiểu chỉ còn ĐÚNG 1 lệnh vẽ, và cả 12 kiểu dùng chung
// một material. Trần lệnh vẽ: 12 — ít hơn bản 5 kiểu cũ.
//
// Mẫu được dựng LƯỜI (chỉ kiểu nào thật sự xuất hiện trên màn hình mới tốn), và
// mọi mẫu được chuẩn hoá về chiều cao ĐÚNG BẰNG 1, chân chạm mặt phẳng y = 0,
// tâm ngang ở gốc — nhờ vậy hệ số cỡ trong mohinh-diem.ts nói đúng nghĩa đen.
//
// TOÀN BỘ hình khối là mã gốc dựng từ primitive Three.js — không tải asset ngoài.

import * as THREE from "three";
import type { KieuMoHinh } from "./mohinh-diem";

// ── Bảng màu ───────────────────────────────────────────────────────────────
// Màu CHỈ để trang trí. Người mù màu phải phân biệt được 12 kiểu bằng dáng
// hình: số tầng mái, có lỗ châu mai hay không, có lá cờ, có con rùa, có hàng
// cột, có nhịp cầu… Đừng bao giờ để một kiểu chỉ khác kiểu khác ở màu.
const GACH = 0xa8483a; // gạch Chăm
const NGOI = 0xc2603f; // ngói mái
const GO = 0x96683c; // gỗ
const DA = 0x9aa0a6; // đá xám
const DA_SAM = 0x5f6773; // đá sẫm
const KEM = 0xf2e2c4; // vôi kem
const VANG = 0xd4af37; // vàng (chóp, sao)
const LUC = 0x4f7a58; // đá vôi phủ cây
const LA = 0x3f7d46; // lá cây
const DO = 0xb3312c; // cờ đỏ
const DONG = 0xb08d3e; // đồng (tượng)
const THEP = 0x8d99a6; // thép (mặt cầu)
const NUOC = 0x35708f; // mặt nước

function mat(color: number): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color, flatShading: true });
}

function box(w: number, h: number, d: number, color: number): THREE.Mesh {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
}

/** Chóp kim tự tháp (mái dốc). seg = 4 thì xoay để cạnh hướng ra 4 phía. */
function chop(r: number, h: number, color: number, seg = 4): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat(color));
  if (seg === 4) m.rotation.y = Math.PI / 4;
  return m;
}

function tru(rT: number, rB: number, h: number, color: number, seg = 6): THREE.Mesh {
  return new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, seg), mat(color));
}

function cau(r: number, color: number): THREE.Mesh {
  return new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat(color));
}

/**
 * Lăng trụ tam giác — mái đầu hồi (nóc nhọn, đùn dọc trục Z).
 *
 * `thetaStart = π` đặt đỉnh tam giác về phía −Z; sau khi xoay X một góc π/2 thì
 * đỉnh quay lên trên. Không có mẹo này thì mái lộn ngược.
 */
function maiDauHoi(r: number, dai: number, color: number): THREE.Mesh {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, dai, 3, 1, false, Math.PI),
    mat(color),
  );
  m.rotation.x = Math.PI / 2;
  return m;
}

// ── 12 nguyên mẫu ──────────────────────────────────────────────────────────
// Quy ước: MẶT TRƯỚC của mọi mẫu hướng +Z (cửa đền, cổng thành, mặt tiền bảo
// tàng, đầu rùa…). nungMau() xoay 180° quanh Y ở bước cuối để mặt đó quay về
// phía máy quay của MapLibre — xem ghi chú ở đó.
// Tỉ lệ tuyệt đối không quan trọng: nungMau() chuẩn hoá chiều cao về 1.

/**
 * Đền · đình · miếu — thân gỗ có cửa đỏ, HAI tầng mái loe, bốn đầu đao hất lên.
 *
 * Bản đầu để mái dưới rộng 0,6 đơn vị trên thân cao 0,24: nhìn từ góc nghiêng
 * 55° của bản đồ thì mái che kín thân, mỗi ngôi đền thành một tấm đỏ bẹt và ở
 * tầm tỉnh chúng dính liền thành mảng (đo bằng ảnh chụp z 12,2 và z 8,6). Thân
 * được nâng lên và mái thu lại để bóng dáng còn đọc ra là một ngôi nhà.
 */
function mauDen(): THREE.Group {
  const g = new THREE.Group();
  const be = box(0.78, 0.07, 0.6, DA);
  be.position.y = 0.035;
  g.add(be);

  const than = box(0.56, 0.34, 0.4, GO);
  than.position.y = 0.24;
  g.add(than);

  const cua = box(0.17, 0.24, 0.02, DO);
  cua.position.set(0, 0.19, 0.21);
  g.add(cua);

  for (const sx of [-1, 1]) {
    const cot = box(0.05, 0.34, 0.05, NGOI);
    cot.position.set(sx * 0.24, 0.24, 0.215);
    g.add(cot);
  }

  const maiDuoi = chop(0.48, 0.15, NGOI);
  maiDuoi.scale.z = 0.85;
  maiDuoi.position.y = 0.485;
  g.add(maiDuoi);

  const maiTren = chop(0.32, 0.2, NGOI);
  maiTren.scale.z = 0.85;
  maiTren.position.y = 0.66;
  g.add(maiTren);

  // Bốn đầu đao — chi tiết nhận dạng chính của mái đình Việt: nón nhỏ hất
  // chếch lên ở bốn góc mái dưới.
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const dao = chop(0.045, 0.2, NGOI);
    dao.position.set(sx * 0.28, 0.54, sz * 0.23);
    dao.rotation.set(-sz * 0.85, 0, sx * 0.85);
    g.add(dao);
  }

  const boNoc = box(0.22, 0.035, 0.05, VANG);
  boNoc.position.y = 0.775;
  g.add(boNoc);
  return g;
}

/** Chùa · thiền viện — tháp CAO, bốn tầng thu nhỏ dần, chóp bút vàng. */
function mauChua(): THREE.Group {
  const g = new THREE.Group();
  const be = box(0.52, 0.07, 0.52, DA);
  be.position.y = 0.035;
  g.add(be);

  let y = 0.07;
  for (let i = 0; i < 4; i++) {
    const w = 0.4 - i * 0.075;
    const h = 0.16 - i * 0.02;
    const tang = box(w, h, w, i % 2 ? GACH : KEM);
    tang.position.y = y + h / 2;
    g.add(tang);
    y += h;
    const mai = chop(w * 1.32, 0.085, NGOI);
    mai.position.y = y + 0.042;
    g.add(mai);
    y += 0.06;
  }

  const canChop = tru(0.014, 0.028, 0.1, VANG, 5);
  canChop.position.y = y + 0.05;
  g.add(canChop);
  const binh = cau(0.038, VANG);
  binh.position.y = y + 0.13;
  g.add(binh);
  return g;
}

/** Tháp Chăm — khối gạch đặc thuôn dần, gờ dọc bốn góc, cửa giả mặt trước. */
function mauThap(): THREE.Group {
  const g = new THREE.Group();
  let y = 0;
  for (let i = 0; i < 5; i++) {
    const w = 0.44 - i * 0.055;
    const h = 0.17 * (1 - i * 0.09);
    const khoi = box(w, h, w, GACH);
    khoi.position.y = y + h / 2;
    g.add(khoi);
    y += h;
  }
  // Gờ dọc (trụ ốp) — thứ làm tháp Chăm khác hẳn tháp Phật nhiều tầng mái.
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const go = box(0.045, 0.42, 0.045, NGOI);
    go.position.set(sx * 0.2, 0.21, sz * 0.2);
    g.add(go);
  }
  const cuaGia = box(0.13, 0.21, 0.03, 0x5c241c);
  cuaGia.position.set(0, 0.105, 0.225);
  g.add(cuaGia);
  const dinh = chop(0.1, 0.17, GACH);
  dinh.position.y = y + 0.085;
  g.add(dinh);
  return g;
}

/** Thành · cung điện — tường vuông có LỖ CHÂU MAI, bốn vọng lâu, cổng vòm. */
function mauThanh(): THREE.Group {
  const g = new THREE.Group();
  const tuong = box(0.86, 0.22, 0.72, DA);
  tuong.position.y = 0.11;
  g.add(tuong);

  // Lỗ châu mai: răng cưa trên mặt tường trước và sau. Đây là dấu nhận dạng —
  // bỏ nó đi thì thành chỉ còn là một cái hộp.
  for (const sz of [-1, 1]) {
    for (const sx of [-1, 0, 1]) {
      const rang = box(0.11, 0.08, 0.06, DA);
      rang.position.set(sx * 0.26, 0.26, sz * 0.33);
      g.add(rang);
    }
  }

  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const lau = box(0.14, 0.17, 0.14, GACH);
    lau.position.set(sx * 0.36, 0.305, sz * 0.29);
    g.add(lau);
    const maiLau = chop(0.12, 0.09, NGOI);
    maiLau.position.set(sx * 0.36, 0.435, sz * 0.29);
    g.add(maiLau);
  }

  const cong = box(0.24, 0.26, 0.12, GACH);
  cong.position.set(0, 0.13, 0.37);
  g.add(cong);
  const vom = box(0.11, 0.15, 0.04, 0x3a2a22);
  vom.position.set(0, 0.095, 0.44);
  g.add(vom);
  const maiCong = chop(0.21, 0.11, NGOI);
  maiCong.position.set(0, 0.31, 0.37);
  g.add(maiCong);
  return g;
}

/** Khoa bảng · văn miếu — bia tiến sĩ dựng trên lưng RÙA. */
function mauBiaRua(): THREE.Group {
  const g = new THREE.Group();
  const mai = cau(0.3, LUC);
  mai.scale.set(1.2, 0.42, 0.95);
  mai.position.y = 0.13;
  g.add(mai);

  const dau = cau(0.1, LUC);
  dau.scale.set(0.9, 0.8, 1.2);
  dau.position.set(0, 0.11, 0.32);
  g.add(dau);

  const duoi = box(0.05, 0.04, 0.11, LUC);
  duoi.position.set(0, 0.1, -0.33);
  g.add(duoi);

  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const chan = box(0.08, 0.09, 0.1, LUC);
    chan.position.set(sx * 0.22, 0.045, sz * 0.18);
    g.add(chan);
  }

  const bia = box(0.4, 0.52, 0.055, KEM);
  bia.position.y = 0.44;
  g.add(bia);
  // Trán bia bo tròn — nét dễ nhận nhất của bia tiến sĩ Văn Miếu.
  const tran = tru(0.2, 0.2, 0.055, KEM, 9);
  tran.rotation.x = Math.PI / 2;
  tran.position.y = 0.7;
  g.add(tran);
  for (const y of [0.52, 0.43]) {
    const chu = box(0.26, 0.022, 0.008, DA_SAM);
    chu.position.set(0, y, 0.031);
    g.add(chu);
  }
  return g;
}

/** Lăng mộ · nghĩa trang liệt sĩ — đài tưởng niệm cao giữa hai hàng bia thấp. */
function mauLang(): THREE.Group {
  const g = new THREE.Group();
  const san = box(0.92, 0.05, 0.72, DA);
  san.position.y = 0.025;
  g.add(san);

  const cap1 = box(0.44, 0.06, 0.34, KEM);
  cap1.position.y = 0.08;
  g.add(cap1);
  const cap2 = box(0.34, 0.06, 0.26, KEM);
  cap2.position.y = 0.14;
  g.add(cap2);

  const dai = tru(0.055, 0.1, 0.62, KEM, 4);
  dai.rotation.y = Math.PI / 4;
  dai.position.y = 0.48;
  g.add(dai);
  const dinh = chop(0.08, 0.12, VANG);
  dinh.position.y = 0.85;
  g.add(dinh);

  // Ngôi sao vàng năm cánh gắn mặt trước đài.
  const sao = chop(0.09, 0.03, VANG, 5);
  sao.rotation.x = Math.PI / 2;
  sao.position.set(0, 0.6, 0.09);
  g.add(sao);

  // Hai hàng bia mộ thấp — thứ phân biệt nghĩa trang với một cái đài đơn độc.
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const bia = box(0.08, 0.12, 0.035, DA);
      bia.position.set(sx * 0.34, 0.09, sz * 0.2);
      g.add(bia);
    }
  }
  return g;
}

/** Trận đánh · chiến dịch — cột cờ đỏ sao vàng và hai ngọn giáo bắt chéo. */
function mauTran(): THREE.Group {
  const g = new THREE.Group();
  const go = tru(0.3, 0.42, 0.1, DA_SAM, 6);
  go.position.y = 0.05;
  g.add(go);

  // Hai ngọn giáo bắt chéo phía sau cột cờ.
  for (const s of [-1, 1]) {
    const can = box(0.028, 0.66, 0.028, GO);
    can.position.set(s * 0.14, 0.38, -0.12);
    can.rotation.z = s * 0.42;
    g.add(can);
    const mui = chop(0.055, 0.15, THEP);
    mui.position.set(s * 0.28, 0.72, -0.12);
    mui.rotation.z = s * 0.42;
    g.add(mui);
  }

  const cot = tru(0.022, 0.028, 0.88, KEM, 5);
  cot.position.y = 0.49;
  g.add(cot);

  const co = box(0.32, 0.2, 0.014, DO);
  co.position.set(0.18, 0.8, 0);
  g.add(co);
  const sao = chop(0.05, 0.014, VANG, 5);
  sao.rotation.x = Math.PI / 2;
  sao.position.set(0.18, 0.8, 0.014);
  g.add(sao);
  return g;
}

/** Bảo tàng · bảo vật — nhà mặt tiền HÀNG CỘT với mái đầu hồi tam giác. */
function mauBaoTang(): THREE.Group {
  const g = new THREE.Group();
  const them1 = box(0.88, 0.05, 0.6, DA);
  them1.position.y = 0.025;
  g.add(them1);
  const them2 = box(0.76, 0.05, 0.5, DA);
  them2.position.y = 0.075;
  g.add(them2);

  const tuong = box(0.66, 0.34, 0.3, KEM);
  tuong.position.set(0, 0.27, -0.06);
  g.add(tuong);

  const cua = box(0.14, 0.22, 0.02, DA_SAM);
  cua.position.set(0, 0.21, 0.1);
  g.add(cua);

  for (const sx of [-1.5, -0.5, 0.5, 1.5]) {
    const cot = tru(0.04, 0.045, 0.34, KEM, 6);
    cot.position.set(sx * 0.19, 0.27, 0.19);
    g.add(cot);
  }

  const doNgang = box(0.78, 0.06, 0.5, KEM);
  doNgang.position.y = 0.47;
  g.add(doNgang);

  const fronton = maiDauHoi(0.2, 0.5, KEM);
  fronton.scale.x = 1.9;
  fronton.position.y = 0.6;
  g.add(fronton);
  return g;
}

/** Danh thắng thiên nhiên — cụm núi đá vôi, một tán cây và mặt nước. */
function mauNui(): THREE.Group {
  const g = new THREE.Group();
  const nuoc = box(0.92, 0.02, 0.7, NUOC);
  nuoc.position.y = 0.01;
  g.add(nuoc);

  const dinh: Array<[number, number, number, number]> = [
    [0, 0.86, 0, 0.2],
    [0.27, 0.6, 0.13, 0.15],
    [-0.25, 0.68, -0.11, 0.16],
  ];
  for (const [x, h, z, r] of dinh) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), mat(LUC));
    c.position.set(x, h / 2, z);
    g.add(c);
  }

  const than = box(0.035, 0.16, 0.035, GO);
  than.position.set(0.34, 0.09, -0.24);
  g.add(than);
  const tan = cau(0.11, LA);
  tan.position.set(0.34, 0.24, -0.24);
  g.add(tan);
  return g;
}

/** Làng nghề · nghệ nhân — nhà xưởng mở, bàn xoay gốm và chiếc bình trên đó. */
function mauNghe(): THREE.Group {
  const g = new THREE.Group();
  const nen = box(0.8, 0.05, 0.58, DA);
  nen.position.y = 0.025;
  g.add(nen);

  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const cot = box(0.045, 0.34, 0.045, GO);
    cot.position.set(sx * 0.3, 0.22, sz * 0.2);
    g.add(cot);
  }

  const mai = maiDauHoi(0.26, 0.62, NGOI);
  mai.scale.x = 1.5;
  mai.position.y = 0.52;
  g.add(mai);

  // Bàn xoay gốm trước xưởng — dấu nhận dạng "nghề thủ công".
  const chanBan = tru(0.035, 0.05, 0.18, GO, 6);
  chanBan.position.set(0, 0.11, 0.34);
  g.add(chanBan);
  const banXoay = tru(0.14, 0.14, 0.035, DA_SAM, 8);
  banXoay.position.set(0, 0.21, 0.34);
  g.add(banXoay);
  const binh = tru(0.055, 0.09, 0.15, 0x8a4a2a, 8);
  binh.position.set(0, 0.3, 0.34);
  g.add(binh);
  const co = tru(0.032, 0.05, 0.06, 0x8a4a2a, 8);
  co.position.set(0, 0.4, 0.34);
  g.add(co);
  return g;
}

/** Nhân vật — tượng bán thân bằng đồng trên bệ ba cấp có biển tên. */
function mauTuong(): THREE.Group {
  const g = new THREE.Group();
  const cap1 = box(0.52, 0.06, 0.42, DA);
  cap1.position.y = 0.03;
  g.add(cap1);
  const cap2 = box(0.42, 0.07, 0.34, DA);
  cap2.position.y = 0.095;
  g.add(cap2);
  const be = box(0.32, 0.3, 0.26, KEM);
  be.position.y = 0.28;
  g.add(be);
  const bien = box(0.2, 0.09, 0.015, DONG);
  bien.position.set(0, 0.28, 0.135);
  g.add(bien);

  const than = tru(0.1, 0.17, 0.34, DONG, 6);
  than.position.y = 0.6;
  g.add(than);
  for (const s of [-1, 1]) {
    const vai = box(0.07, 0.22, 0.08, DONG);
    vai.position.set(s * 0.14, 0.6, 0);
    vai.rotation.z = -s * 0.18;
    g.add(vai);
  }
  const co = tru(0.04, 0.05, 0.05, DONG, 6);
  co.position.y = 0.79;
  g.add(co);
  const dau = cau(0.095, DONG);
  dau.scale.set(0.9, 1.05, 0.95);
  dau.position.y = 0.88;
  g.add(dau);
  return g;
}

/** Công trình kỷ lục — cầu dây văng: nhịp ngang, hai tháp chữ A, dây văng. */
function mauCau(): THREE.Group {
  const g = new THREE.Group();
  const nuoc = box(1.0, 0.02, 0.42, NUOC);
  nuoc.position.y = 0.01;
  g.add(nuoc);

  for (const sx of [-1, 1]) {
    const mo = box(0.1, 0.18, 0.26, DA);
    mo.position.set(sx * 0.42, 0.09, 0);
    g.add(mo);
  }

  const nhip = box(0.94, 0.045, 0.2, THEP);
  nhip.position.y = 0.2;
  g.add(nhip);

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const thanh = box(0.04, 0.52, 0.04, KEM);
      thanh.position.set(sx * 0.17, 0.46, sz * 0.07);
      thanh.rotation.x = -sz * 0.14;
      g.add(thanh);
    }
    const dinh = cau(0.032, KEM);
    dinh.position.set(sx * 0.17, 0.72, 0);
    g.add(dinh);
    // Dây văng: hai sợi mảnh từ đỉnh tháp xuống mặt cầu, đủ để đọc ra "cầu
    // dây văng" chứ không phải một cây cầu hộp.
    for (const s of [-1, 1]) {
      const day = box(0.012, 0.46, 0.012, THEP);
      day.position.set(sx * 0.17 + s * 0.11, 0.47, 0);
      day.rotation.z = -s * 0.46;
      g.add(day);
    }
  }
  return g;
}

const DUNG_MAU: Record<KieuMoHinh, () => THREE.Group> = {
  den: mauDen,
  chua: mauChua,
  thap: mauThap,
  thanh: mauThanh,
  "bia-rua": mauBiaRua,
  lang: mauLang,
  tran: mauTran,
  "bao-tang": mauBaoTang,
  nui: mauNui,
  nghe: mauNghe,
  tuong: mauTuong,
  cau: mauCau,
};

/**
 * Vật liệu dùng chung cho MỌI mô hình điểm.
 *
 * Màu đi theo đỉnh (`vertexColors`) chứ không theo material, nên 12 kiểu × ~18
 * mảnh vẫn chỉ cần một material duy nhất. Đây là điều kiện để gộp được lệnh vẽ.
 */
export const VAT_LIEU_DIEM = new THREE.MeshLambertMaterial({
  vertexColors: true,
  flatShading: true,
});

/**
 * Bề ngang tối đa cho phép so với chiều cao khi chuẩn hoá.
 *
 * Chuẩn hoá THUẦN theo chiều cao là chưa đủ: mái đình toả rộng gấp 1,7 lần
 * chiều cao của nó, nên ở tầm tỉnh đồng bằng sông Hồng — nơi hàng trăm điểm
 * chen nhau — các mái dính thành một mảng đỏ liền, đo được bằng ảnh chụp
 * (z 8,6, 6 lớp phủ). Mẫu nào bè hơn ngưỡng này thì thu nhỏ cả khối để bề
 * ngang vừa đúng ngưỡng, đổi lại chiều cao thấp hơn 1 — đó chính là điều nên
 * xảy ra với một toà thành so với một ngọn tháp.
 */
const BE_NGANG_TOI_DA = 1.05;

/**
 * Gộp mọi mesh của một mẫu thành MỘT geometry, nướng màu material vào đỉnh.
 *
 * Kết quả được chuẩn hoá: chân ở y = 0, tâm ngang ở gốc, cao ≤ 1 và bề ngang
 * ≤ BE_NGANG_TOI_DA — nhờ vậy hệ số cỡ ở mohinh-diem.ts là số nhân trực tiếp
 * lên chiều cao biểu kiến tính bằng pixel.
 *
 * Bỏ `uv` có chủ ý: không mô hình nào dùng texture, giữ lại chỉ tốn bộ nhớ.
 */
function nungMau(g: THREE.Group): THREE.BufferGeometry {
  g.updateMatrixWorld(true);
  const viTri: number[] = [];
  const phapTuyen: number[] = [];
  const mauSac: number[] = [];
  const chiSo: number[] = [];
  const c = new THREE.Color();

  g.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const geo = o.geometry.clone();
    geo.applyMatrix4(o.matrixWorld);
    const p = geo.getAttribute("position");
    const n = geo.getAttribute("normal");
    const goc = viTri.length / 3;
    c.copy((o.material as THREE.MeshLambertMaterial).color);
    for (let i = 0; i < p.count; i++) {
      viTri.push(p.getX(i), p.getY(i), p.getZ(i));
      phapTuyen.push(n.getX(i), n.getY(i), n.getZ(i));
      mauSac.push(c.r, c.g, c.b);
    }
    const ix = geo.getIndex();
    if (ix) for (let i = 0; i < ix.count; i++) chiSo.push(goc + ix.getX(i));
    else for (let i = 0; i < p.count; i++) chiSo.push(goc + i);
    geo.dispose();
    o.geometry.dispose();
    (o.material as THREE.Material).dispose();
  });

  const ra = new THREE.BufferGeometry();
  ra.setAttribute("position", new THREE.Float32BufferAttribute(viTri, 3));
  ra.setAttribute("normal", new THREE.Float32BufferAttribute(phapTuyen, 3));
  ra.setAttribute("color", new THREE.Float32BufferAttribute(mauSac, 3));
  ra.setIndex(chiSo);

  ra.computeBoundingBox();
  const bb = ra.boundingBox as THREE.Box3;
  const cao = bb.max.y - bb.min.y;
  const be = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z);
  const chuan = Math.max(cao, be / BE_NGANG_TOI_DA, 1e-6);
  ra.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
  ra.scale(1 / chuan, 1 / chuan, 1 / chuan);
  // Mẫu dựng với mặt trước hướng +Z. Máy quay của MapLibre ở chế độ nghiêng
  // đứng phía NAM nhìn về bắc, mà +Z của mẫu sau phép dựng đứng lại thành hướng
  // bắc — tức mặt trước quay lưng về phía người xem. Xoay 180° ở đây để mọi mẫu
  // đều khoe mặt tiền, thay vì phải nhớ quy ước ngược trong cả 12 hàm dựng.
  ra.rotateY(Math.PI);
  ra.computeBoundingSphere();
  return ra;
}

const KHO = new Map<KieuMoHinh, THREE.BufferGeometry>();

/**
 * Geometry đã nướng của một kiểu, dựng lười và nhớ lại.
 *
 * Người chỉ bật một lớp phủ không phải trả giá dựng cả 12 nguyên mẫu.
 */
export function mauCua(kieu: KieuMoHinh): THREE.BufferGeometry {
  let geo = KHO.get(kieu);
  if (!geo) {
    geo = nungMau(DUNG_MAU[kieu]());
    KHO.set(kieu, geo);
  }
  return geo;
}
