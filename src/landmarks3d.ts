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
import { createOceanMesh } from "./ocean3d";
import { mauCua, VAT_LIEU_DIEM } from "./mohinh-lop-phu";
import type { DiemMoHinh, KieuMoHinh } from "./mohinh-diem";

export interface Landmarks3D {
  setVisible(v: boolean): void;
  /**
   * Bật/tắt riêng mặt biển động.
   *
   * Mặt biển là một mặt phẳng lớn ở cao độ 0, đúng cao độ của lớp tô tỉnh. Ở
   * mức nhìn cả nước nó nằm gọn ngoài bờ và cảnh diorama đẹp. Nhưng phóng sâu
   * thì mặt phẳng đó trải kín khung nhìn và ĐÈ LÊN cả nền bản đồ lẫn lớp tô
   * tỉnh — zoom 13 đo được: toàn màn hình một màu nước, không còn đường sá,
   * không còn bờ biển. Đây chính là "bản đồ 3D bị lỗi".
   */
  setBienHien(v: boolean): void;
  /**
   * Thay toàn bộ mô hình 3D của các điểm di tích đang hiện trong khung nhìn.
   * Gọi lại mỗi lần người dùng dời/phóng bản đồ hoặc bật tắt lớp phủ.
   */
  capNhatDiem(ds: DiemMoHinh[]): void;
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

// ---------------------------------------------------------------------------
// Mô hình cho ĐIỂM lớp phủ — "biểu tượng ở bản đồ 3D cũng phải dựng 3D theo".
//
// 8 landmark ở trên là mô hình chọn tay cho 8 địa danh cố định. Còn hàng nghìn
// điểm lớp phủ thì không thể dựng tay từng cái: chọn một trong 12 NGUYÊN MẪU
// theo loại đối tượng (xem mohinh-diem.ts), mỗi nguyên mẫu là đúng một
// BufferGeometry đã nướng màu vào đỉnh (xem mohinh-lop-phu.ts) nên cả một cụm
// cùng loại chỉ tốn ĐÚNG MỘT lệnh vẽ.
//
// Mẫu được chuẩn hoá về chiều cao 1. Kích thước thật đặt mỗi khung hình theo
// mức phóng (xem caoDiemTheoZoom) nhân với hệ số cỡ riêng của từng điểm, nếu
// không thì cùng một con số mét sẽ bé như hạt bụi ở tầm tỉnh và cao bằng dãy
// núi ở tầm phố.
// ---------------------------------------------------------------------------

/**
 * Chiều cao biểu kiến của mô hình điểm, tính bằng pixel màn hình, theo mức phóng.
 *
 * Không dùng được một con số duy nhất. Ở tầm phố, 46px là một ngôi chùa vừa mắt
 * đứng cạnh con đường. Ở tầm cả nước thì hình chữ S chỉ rộng chừng 350px, mà
 * riêng lớp di tích quốc gia đặc biệt đã có 152 điểm — 152 mô hình cao 46px
 * dựng chi chít lên một dải đất 350px thì không còn nhìn thấy đất nước nữa,
 * đo được bằng ảnh chụp. Ở mức đó mô hình phải lùi về vai trò cái chấm có khối.
 *
 * Trên zoom 13 (tầm phường/phố) lại thu bớt: ở mức đó bản đồ nền đã có đường
 * sá và số nhà, mô hình cao 46px xếp liền nhau sẽ che mất chính thứ người dùng
 * phóng vào để xem.
 */
const caoDiemTheoZoom = (z: number): number => {
  if (z <= 5) return 20;
  if (z <= 9) return 20 + ((46 - 20) * (z - 5)) / 4;
  if (z <= 13) return 46;
  if (z >= 15) return 36;
  return 46 - ((46 - 36) * (z - 13)) / 2;
};
/** Landmark là mốc chủ đạo nên giữ nguyên cỡ ở mọi mức — chỉ có 8 cái. */
const CAO_PX_MOC = 58;

/** Một cụm điểm cùng loại hình — cả cụm là ĐÚNG MỘT InstancedMesh, 1 lệnh vẽ. */
interface CumDiem {
  diem: Array<{ x: number; y: number; z: number; metTrenDonVi: number; co: number }>;
  luoi: THREE.InstancedMesh;
}

// +Y (cao của model) → +Z (cao của Mercator).
const QUAY_DUNG = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(Math.PI / 2, 0, 0),
);


// Tâm biển (giữa Biển Đông – Việt Nam) và tỉ lệ đơn vị-cục-bộ → Mercator.
const OCEAN_CENTER: [number, number] = [108, 14];
// 0,0022 phủ chừng 47° kinh độ — chưa đủ. Ở mức nhìn cả nước với góc nghiêng
// 55°, tầm nhìn vượt ra ngoài mép mặt phẳng nước và để lộ một ĐƯỜNG CHÉO SẮC
// cắt ngang đỉnh màn hình, chỗ nền trời gặp mép lưới. Nới rộng để mép rơi ra
// ngoài khung nhìn; lưới vẫn 200×200 nên sóng thưa hơn, không đáng kể ở mức
// nhìn này.
const OCEAN_UNIT = 0.006;

export function createLandmarks3D(map: MlMap): Landmarks3D {
  const camera = new THREE.Camera();
  let renderer: THREE.WebGLRenderer | null = null;
  let visible = false;
  let bienHien = true;

  const ensureRenderer = (gl: WebGLRenderingContext | WebGL2RenderingContext) => {
    if (renderer) return;
    renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl as WebGL2RenderingContext,
      antialias: true,
    });
    renderer.autoClear = false;
  };
  const setCamera = (matrix: unknown) => {
    camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix as number[]);
  };

  // --- Lớp biển động (đặt DƯỚI các lớp tỉnh để đất phủ lên biển) ---
  const oceanScene = new THREE.Scene();
  const ocean = createOceanMesh();
  {
    const mc = MercatorCoordinate.fromLngLat(OCEAN_CENTER, 0);
    ocean.mesh.scale.setScalar(OCEAN_UNIT);
    ocean.mesh.position.set(mc.x, mc.y, 0);
    oceanScene.add(ocean.mesh);
  }
  const oceanLayer: CustomLayerInterface = {
    id: "ocean-3d",
    type: "custom",
    renderingMode: "3d",
    onAdd(_map, gl) {
      ensureRenderer(gl);
    },
    render(_gl, matrix) {
      if (!visible || !bienHien || !renderer) return;
      ocean.update((performance.now() / 1000) * 0.5);
      setCamera(matrix);
      renderer.resetState();
      renderer.render(oceanScene, camera);
      map.triggerRepaint(); // vòng lặp animate khi đang bật 3D
    },
  };

  // --- Lớp landmark 3D (đặt TRÊN cùng) ---
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 1.05));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(0.4, -0.7, 1).normalize();
  scene.add(sun);
  // 8 landmark cố định cũng phải co theo mức phóng, y như mô hình điểm. Trước
  // đây chúng ghim cứng H = 110 km: ở tầm cả nước thì vừa mắt (~55px), nhưng
  // phóng tới tầm tỉnh thì một ngôi chùa cao 110 km che kín nửa màn hình và đè
  // lên mọi thứ khác. Giữ tỉ lệ Mercator gốc, chỉ nhân thêm hệ số theo zoom.
  const moc: Array<{ g: THREE.Group; metTrenDonVi: number }> = [];
  for (const lm of LANDMARKS) {
    const mc = MercatorCoordinate.fromLngLat([lm.lon, lm.lat], 0);
    const g = lm.build();
    g.rotation.x = Math.PI / 2; // +Y (cao của model) → +Z (cao của Mercator)
    g.position.set(mc.x, mc.y, mc.z);
    scene.add(g);
    // Mẫu dựng ở H mét, nên chia H để quy về chiều cao đơn vị như mô hình điểm.
    moc.push({ g, metTrenDonVi: mc.meterInMercatorCoordinateUnits() / H });
  }
  // Mô hình các điểm di tích — nhóm riêng để thay cả cụm mà không đụng vào 8
  // landmark cố định ở trên.
  const nhomDiem = new THREE.Group();
  scene.add(nhomDiem);
  let cumDiem: CumDiem[] = [];
  /** Chiều cao lần đặt ma trận gần nhất — đổi zoom mới phải tính lại. */
  let caoTruoc = -1;

  const vTri = new THREE.Vector3();
  const vTiLe = new THREE.Vector3();
  const mGoc = new THREE.Matrix4();

  /**
   * Đặt lại ma trận cho mọi thực thể. Chỉ chạy khi mức phóng đổi hoặc tập điểm
   * đổi — nếu chạy mỗi khung hình thì mỗi lần lại đẩy cả bộ đệm ma trận lên GPU.
   */
  const datMaTran = (cao: number): void => {
    for (const c of cumDiem) {
      for (let i = 0; i < c.diem.length; i++) {
        const d = c.diem[i];
        // `co` là hệ số cỡ riêng của điểm: loại đối tượng × tầm quan trọng của
        // lớp phủ. Nhờ mẫu đã chuẩn hoá cao đúng 1, đây là phép nhân thẳng lên
        // chiều cao biểu kiến tính bằng pixel.
        const s = d.metTrenDonVi * cao * d.co;
        vTri.set(d.x, d.y, d.z);
        vTiLe.set(s, s, s);
        mGoc.compose(vTri, QUAY_DUNG, vTiLe);
        c.luoi.setMatrixAt(i, mGoc);
      }
      c.luoi.instanceMatrix.needsUpdate = true;
    }
  };

  /** Số mét ứng với 1 pixel màn hình ở mức phóng và vĩ độ hiện tại. */
  const metMoiPixel = (): number =>
    (40075016.686 * Math.cos((map.getCenter().lat * Math.PI) / 180)) /
    (512 * Math.pow(2, map.getZoom()));

  const landmarkLayer: CustomLayerInterface = {
    id: "landmarks-3d",
    type: "custom",
    renderingMode: "3d",
    onAdd(_map, gl) {
      ensureRenderer(gl);
    },
    render(_gl, matrix) {
      if (!visible || !renderer) return;
      // Giữ chiều cao BIỂU KIẾN cố định: mô hình dựng ở H = 1 nên tỉ lệ cần
      // đặt là (đơn vị Mercator mỗi mét) × (số mét muốn cao).
      const mpp = metMoiPixel();
      const caoMoc = CAO_PX_MOC * mpp;
      for (const d of moc) d.g.scale.setScalar(d.metTrenDonVi * caoMoc);
      const cao = caoDiemTheoZoom(map.getZoom()) * mpp;
      if (cumDiem.length && cao !== caoTruoc) {
        caoTruoc = cao;
        datMaTran(cao);
      }
      setCamera(matrix);
      renderer.resetState();
      renderer.render(scene, camera);
    },
  };

  // Ocean chèn ngay dưới lớp tỉnh đầu tiên; landmark thêm lên trên cùng.
  // Dò lớp era ĐANG CÓ theo đúng thứ tự vẽ thật, không hard-code một era.
  // Trước đây ghim "era-phapthuoc-fill": đúng một cách tình cờ vì map.on("load")
  // tạo cả 3 era ngay lúc mở trang. Từ khi era nạp lười, lớp đó thường CHƯA tồn
  // tại → beforeId thành undefined → MapLibre chèn lớp biển lên TRÊN CÙNG, phủ
  // kín đất liền ở mọi thời kỳ trừ Pháp thuộc.
  const firstEra = map
    .getStyle()
    .layers.find((l) => /^era-.+-fill$/.test(l.id))?.id;
  map.addLayer(oceanLayer, firstEra);
  map.addLayer(landmarkLayer);

  return {
    setVisible(v: boolean): void {
      visible = v;
      map.triggerRepaint();
    },
    setBienHien(v: boolean): void {
      if (bienHien === v) return;
      bienHien = v;
      map.triggerRepaint();
    },
    capNhatDiem(ds: DiemMoHinh[]): void {
      for (const c of cumDiem) {
        nhomDiem.remove(c.luoi);
        c.luoi.dispose(); // chỉ bỏ bộ đệm thực thể — hình và vật liệu dùng chung
      }
      cumDiem = [];
      const theoKieu = new Map<KieuMoHinh, DiemMoHinh[]>();
      for (const d of ds) {
        const a = theoKieu.get(d.kieu);
        if (a) a.push(d);
        else theoKieu.set(d.kieu, [d]);
      }
      for (const [kieu, nhom] of theoKieu) {
        const luoi = new THREE.InstancedMesh(mauCua(kieu), VAT_LIEU_DIEM, nhom.length);
        // Bao hình của InstancedMesh tính một lần lúc tạo, mà tỉ lệ mô hình
        // đổi theo từng mức phóng — để mặc định thì cả cụm bị cắt oan.
        luoi.frustumCulled = false;
        nhomDiem.add(luoi);
        cumDiem.push({
          diem: nhom.map((d) => {
            const mc = MercatorCoordinate.fromLngLat([d.lon, d.lat], 0);
            return {
              x: mc.x,
              y: mc.y,
              z: mc.z,
              metTrenDonVi: mc.meterInMercatorCoordinateUnits(),
              co: d.co,
            };
          }),
          luoi,
        });
      }
      caoTruoc = -1; // buộc đặt lại ma trận ở khung hình kế tiếp
      map.triggerRepaint();
    },
  };
}
