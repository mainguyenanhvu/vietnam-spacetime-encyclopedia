// Lớp landmark 3D "diorama" — lấy cảm hứng thị giác từ holetexvn/vietnam-3d-map
// nhưng TOÀN BỘ hình khối dưới đây là mã gốc của dự án này (Three.js dựng từ
// các primitive), KHÔNG sao chép mã/asset của repo đó (repo đó chưa có giấy
// phép — xem issue holetexvn/vietnam-3d-map#1). Nếu được cấp phép, có thể thay
// bằng mô hình của họ kèm ghi công.
//
// Kỹ thuật: MapLibre custom layer chia sẻ WebGL context với Three.js. Toạ độ
// scene đặt thẳng theo hệ Mercator của MapLibre nên ma trận `matrix` mà
// render() nhận (mercator → clip) chiếu trực tiếp, không cần biến đổi per-model.

import * as THREE from "three";
import { MercatorCoordinate } from "maplibre-gl";
import type { CustomLayerInterface, Map as MlMap } from "maplibre-gl";

export interface Landmarks3D {
  setVisible(v: boolean): void;
}

interface LandmarkDef {
  ten: string;
  lon: number;
  lat: number;
  build: () => THREE.Group;
}

// Màu low-poly (flat shading)
const GOLD = 0xd4af37;
const TERRACOTTA = 0xb04a2f;
const BRICK = 0x9c3b2e;
const KARST = 0x4f7a58;
const CREAM = 0xf2e2c4;
const WOOD = 0x7c4a24;
const JADE = 0x2f8f6b;

function mat(color: number): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color, flatShading: true });
}

// Kim tự tháp vuông (mái) — Cone 4 cạnh, xoay để cạnh hướng ra 4 phía
function pyramid(radius: number, height: number, color: number): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 4), mat(color));
  m.rotation.y = Math.PI / 4;
  return m;
}

function box(w: number, h: number, d: number, color: number): THREE.Mesh {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
}

// Chùa/đền nhiều tầng mái — dùng cho Hà Nội, Huế, Phú Thọ
function tieredPagoda(H: number, tiers: number, roofColor: number): THREE.Group {
  const g = new THREE.Group();
  const baseW = H * 0.42;
  const plat = box(baseW, H * 0.06, baseW, CREAM);
  plat.position.y = H * 0.03;
  g.add(plat);
  let y = H * 0.06;
  for (let i = 0; i < tiers; i++) {
    const wallW = baseW * (0.62 - i * 0.13);
    const wallH = H * (0.16 - i * 0.02);
    const wall = box(wallW, wallH, wallW, i % 2 ? BRICK : WOOD);
    wall.position.y = y + wallH / 2;
    g.add(wall);
    y += wallH;
    const roof = pyramid(wallW * 1.15, H * 0.12, roofColor);
    roof.position.y = y + H * 0.06;
    g.add(roof);
    y += H * 0.09;
  }
  const finial = new THREE.Mesh(new THREE.SphereGeometry(baseW * 0.05, 8, 8), mat(GOLD));
  finial.position.y = y + H * 0.03;
  g.add(finial);
  return g;
}

// Tháp Chăm (Po Nagar) — khối vuông thuôn dần, gạch đỏ
function chamTower(H: number): THREE.Group {
  const g = new THREE.Group();
  const steps = 5;
  let y = 0;
  for (let i = 0; i < steps; i++) {
    const w = H * (0.34 - i * 0.05);
    const h = H * 0.2 * (1 - i * 0.08);
    const b = box(w, h, w, BRICK);
    b.position.y = y + h / 2;
    g.add(b);
    y += h;
  }
  const top = pyramid(H * 0.1, H * 0.14, BRICK);
  top.position.y = y + H * 0.07;
  g.add(top);
  return g;
}

// Núi đá vôi Hạ Long — cụm nón đá xanh
function karstCluster(H: number): THREE.Group {
  const g = new THREE.Group();
  const cones: Array<[number, number, number]> = [
    [0, 1, 0],
    [H * 0.28, 0.72, H * 0.12],
    [-H * 0.24, 0.85, -H * 0.1],
  ];
  for (const [x, k, z] of cones) {
    const h = H * k;
    const c = new THREE.Mesh(new THREE.ConeGeometry(H * 0.16, h, 7), mat(KARST));
    c.position.set(x, h / 2, z);
    g.add(c);
  }
  return g;
}

// Cầu Vàng Đà Nẵng — vòm vàng trên hai trụ (bàn tay cách điệu)
function goldenArch(H: number): THREE.Group {
  const g = new THREE.Group();
  const R = H * 0.3;
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(R, H * 0.035, 10, 24, Math.PI),
    mat(GOLD),
  );
  arch.position.y = H * 0.3;
  g.add(arch);
  const deck = box(R * 2.2, H * 0.03, H * 0.12, GOLD);
  deck.position.y = H * 0.3;
  g.add(deck);
  for (const sx of [-1, 1]) {
    const hand = new THREE.Mesh(
      new THREE.CylinderGeometry(H * 0.05, H * 0.09, H * 0.3, 6),
      mat(0x9a9a9a),
    );
    hand.position.set(sx * R, H * 0.15, 0);
    g.add(hand);
  }
  return g;
}

// Nhà rông Tây Nguyên — sàn trên cột, mái dốc cao dạng lưỡi rìu
function nhaRong(H: number): THREE.Group {
  const g = new THREE.Group();
  const floorY = H * 0.22;
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(H * 0.02, H * 0.02, floorY, 6),
      mat(WOOD),
    );
    leg.position.set(sx * H * 0.12, floorY / 2, sz * H * 0.09);
    g.add(leg);
  }
  const floor = box(H * 0.34, H * 0.05, H * 0.26, WOOD);
  floor.position.y = floorY;
  g.add(floor);
  // Mái dốc cao: kim tự tháp kéo hẹp theo trục Z tạo dáng lưỡi rìu
  const roof = pyramid(H * 0.26, H * 0.55, TERRACOTTA);
  roof.scale.set(1, 1, 0.4);
  roof.position.y = floorY + H * 0.05 + H * 0.27;
  g.add(roof);
  return g;
}

// Bến Nhà Rồng — nhà thời thuộc địa, mái nhọn hai tầng, tường kem
function dragonHouse(H: number): THREE.Group {
  const g = new THREE.Group();
  const body = box(H * 0.4, H * 0.28, H * 0.24, CREAM);
  body.position.y = H * 0.14;
  g.add(body);
  const roof1 = pyramid(H * 0.28, H * 0.14, TERRACOTTA);
  roof1.position.y = H * 0.28 + H * 0.07;
  g.add(roof1);
  const tower = box(H * 0.12, H * 0.16, H * 0.12, CREAM);
  tower.position.y = H * 0.35;
  g.add(tower);
  const roof2 = pyramid(H * 0.11, H * 0.16, TERRACOTTA);
  roof2.position.y = H * 0.43 + H * 0.08;
  g.add(roof2);
  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(0, H * 0.01, H * 0.08, 4),
    mat(GOLD),
  );
  spire.position.y = H * 0.55;
  g.add(spire);
  return g;
}

const H = 110000; // "chiều cao" cách điệu (mét) — nhô rõ trên khối tỉnh (40 km)

const LANDMARKS: LandmarkDef[] = [
  { ten: "Chùa Một Cột – Hà Nội", lon: 105.8342, lat: 21.0359, build: () => tieredPagoda(H, 3, TERRACOTTA) },
  { ten: "Đền Hùng – Phú Thọ", lon: 105.2087, lat: 21.365, build: () => tieredPagoda(H * 0.95, 2, JADE) },
  { ten: "Chùa Thiên Mụ – Huế", lon: 107.545, lat: 16.4536, build: () => tieredPagoda(H * 1.15, 4, TERRACOTTA) },
  { ten: "Cầu Vàng – Đà Nẵng", lon: 108.222, lat: 16.06, build: () => goldenArch(H) },
  { ten: "Vịnh Hạ Long – Quảng Ninh", lon: 107.06, lat: 20.91, build: () => karstCluster(H) },
  { ten: "Tháp Bà Po Nagar – Khánh Hòa", lon: 109.195, lat: 12.265, build: () => chamTower(H) },
  { ten: "Nhà rông – Đắk Lắk", lon: 108.05, lat: 12.667, build: () => nhaRong(H) },
  { ten: "Bến Nhà Rồng – TP. Hồ Chí Minh", lon: 106.706, lat: 10.768, build: () => dragonHouse(H) },
];

export function createLandmarks3D(map: MlMap): Landmarks3D {
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 1.05));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(0.4, -0.7, 1).normalize();
  scene.add(sun);

  // Đặt từng landmark theo toạ độ Mercator, quy đổi mét → đơn vị Mercator,
  // xoay +Y (trục cao của model) thành +Z (trục cao của Mercator).
  for (const lm of LANDMARKS) {
    const mc = MercatorCoordinate.fromLngLat([lm.lon, lm.lat], 0);
    const s = mc.meterInMercatorCoordinateUnits();
    const g = lm.build();
    g.rotation.x = Math.PI / 2;
    g.scale.setScalar(s);
    g.position.set(mc.x, mc.y, mc.z);
    scene.add(g);
  }

  const camera = new THREE.Camera();
  let renderer: THREE.WebGLRenderer | null = null;
  let visible = false;

  const layer: CustomLayerInterface = {
    id: "landmarks-3d",
    type: "custom",
    renderingMode: "3d",
    onAdd(_map, gl) {
      renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl as WebGL2RenderingContext,
        antialias: true,
      });
      renderer.autoClear = false;
    },
    render(_gl, matrix) {
      if (!visible || !renderer) return;
      camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix as number[]);
      renderer.resetState();
      renderer.render(scene, camera);
    },
  };

  map.addLayer(layer);

  return {
    setVisible(v: boolean): void {
      visible = v;
      map.triggerRepaint();
    },
  };
}
