// Trình xem model 3D low-poly ĐỘC LẬP cho panel hồ sơ tỉnh.
//
// Khác với landmarks3d.ts (chạy trong MapLibre custom layer, chia sẻ WebGL
// context của bản đồ), module NÀY tự tạo renderer / camera / scene / ánh sáng
// riêng, gắn canvas vào một <div> container bất kỳ, tự animate xoay nhẹ và cho
// kéo chuột để xoay. Dùng để nhúng mô hình đặc trưng tỉnh (con vật, trái cây,
// món ăn, biểu tượng) vào giao diện hồ sơ.
//
// TOÀN BỘ hình khối là mã gốc dựng từ primitive Three.js — KHÔNG tải asset
// ngoài (.glb/.obj/texture). Màu hoàn toàn bằng material.

import * as THREE from "three";

// ── Bảng màu low-poly ────────────────────────────────────────────────────
const BRONZE = 0xb08d3e; // đồng (trống đồng, chim lạc)
const BUFFALO = 0x4a4f57; // da trâu xám đen
const HORN = 0xe8e2d0; // sừng ngà
const ELEPHANT = 0x8a8f98; // da voi xám
const IVORY = 0xf4efe2; // ngà voi
const LYCHEE = 0xc0392b; // vỏ vải đỏ
const DRAGON = 0xe4467f; // vỏ thanh long hồng
const LEAF = 0x3f9d5a; // xanh lá (vảy thanh long, lá sen)
const LOTUS = 0xf2a6c2; // cánh sen hồng
const LOTUS_CORE = 0xe0c65a; // gương sen vàng
const BOWL = 0xf3f1ea; // bát sứ trắng ngà
const BROTH = 0xb5702a; // nước dùng phở
const NOODLE = 0xf5e6b8; // sợi phở
const WOOD = 0x8a5a2b; // gỗ (đũa)
const STEM = 0x5b7d3a; // cuống trái cây
const HAT = 0xe9d8a6; // lá nón

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

// ── Con vật ────────────────────────────────────────────────────────────────

// Con trâu — thân trụ ngang, đầu, cặp sừng cong, bốn chân, đuôi.
function conTrau(): THREE.Group {
  const g = new THREE.Group();
  const body = ball(0.62, BUFFALO);
  body.scale.set(1.5, 0.85, 0.85);
  body.position.y = 0.9;
  g.add(body);

  const head = ball(0.42, BUFFALO);
  head.scale.set(1, 0.85, 1.1);
  head.position.set(1.05, 1.0, 0);
  g.add(head);

  const snout = box(0.42, 0.3, 0.4, BUFFALO);
  snout.position.set(1.4, 0.82, 0);
  g.add(snout);

  // Cặp sừng cong: nửa vòng xuyến hướng ra hai bên.
  for (const sz of [-1, 1]) {
    const horn = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.05, 6, 10, Math.PI * 0.85),
      mat(HORN),
    );
    horn.position.set(1.05, 1.35, sz * 0.28);
    horn.rotation.set(Math.PI / 2, 0, sz > 0 ? -0.5 : 0.5 + Math.PI);
    g.add(horn);
  }

  for (const [sx, sz] of [
    [0.55, 0.32],
    [0.55, -0.32],
    [-0.55, 0.32],
    [-0.55, -0.32],
  ]) {
    const leg = cyl(0.11, 0.13, 0.9, BUFFALO, 6);
    leg.position.set(sx, 0.45, sz);
    g.add(leg);
  }

  const tail = cyl(0.03, 0.06, 0.7, BUFFALO, 5);
  tail.position.set(-1.05, 0.75, 0);
  tail.rotation.z = 0.5;
  g.add(tail);
  return g;
}

// Con voi — thân lớn, đầu, vòi cong thuôn dần, ngà, tai bẹt, bốn chân trụ.
function conVoi(): THREE.Group {
  const g = new THREE.Group();
  const body = ball(0.85, ELEPHANT);
  body.scale.set(1.35, 1, 0.95);
  body.position.y = 1.35;
  g.add(body);

  const head = ball(0.6, ELEPHANT);
  head.position.set(1.15, 1.5, 0);
  g.add(head);

  // Vòi: chuỗi trụ nhỏ dần uốn xuống.
  const trunkSegs = 5;
  let tx = 1.6;
  let ty = 1.4;
  for (let i = 0; i < trunkSegs; i++) {
    const r = 0.22 - i * 0.03;
    const seg = cyl(r, r + 0.03, 0.34, ELEPHANT, 6);
    seg.position.set(tx, ty, 0);
    seg.rotation.z = -0.4 - i * 0.28;
    g.add(seg);
    tx += 0.16;
    ty -= 0.28;
  }

  for (const sz of [-1, 1]) {
    const ear = box(0.12, 0.7, 0.55, ELEPHANT);
    ear.position.set(0.95, 1.55, sz * 0.55);
    ear.rotation.x = sz * 0.3;
    g.add(ear);

    const tusk = cyl(0.02, 0.06, 0.5, IVORY, 5);
    tusk.position.set(1.6, 1.15, sz * 0.22);
    tusk.rotation.set(0, 0, Math.PI / 2 - 0.3);
    g.add(tusk);
  }

  for (const [sx, sz] of [
    [0.7, 0.42],
    [0.7, -0.42],
    [-0.7, 0.42],
    [-0.7, -0.42],
  ]) {
    const leg = cyl(0.22, 0.26, 1.0, ELEPHANT, 6);
    leg.position.set(sx, 0.5, sz);
    g.add(leg);
  }
  return g;
}

// Chim lạc — chim mỏ dài bay ngang (họa tiết trên trống đồng Đông Sơn).
function chimLac(): THREE.Group {
  const g = new THREE.Group();
  const body = ball(0.4, BRONZE);
  body.scale.set(1.6, 0.7, 0.7);
  body.position.y = 1.4;
  g.add(body);

  // Cổ + đầu vươn về phía trước.
  const neck = cyl(0.1, 0.14, 0.6, BRONZE, 6);
  neck.position.set(0.85, 1.6, 0);
  neck.rotation.z = -0.7;
  g.add(neck);
  const head = ball(0.16, BRONZE);
  head.position.set(1.15, 1.8, 0);
  g.add(head);

  // Mỏ dài nhọn.
  const beak = cyl(0.005, 0.08, 0.7, BRONZE, 5);
  beak.position.set(1.55, 1.78, 0);
  beak.rotation.z = Math.PI / 2 - 0.15;
  g.add(beak);

  // Đuôi dài xòe về sau.
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.0, 4), mat(BRONZE));
  tail.position.set(-0.95, 1.42, 0);
  tail.rotation.z = Math.PI / 2 + 0.15;
  g.add(tail);

  // Đôi cánh giương lên như đang bay.
  for (const sz of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.9, 4), mat(BRONZE));
    wing.position.set(0.05, 1.75, sz * 0.35);
    wing.rotation.set(sz * 0.9, 0, 0.2);
    wing.scale.set(1, 1, 0.4);
    g.add(wing);
  }

  // Đôi chân dài.
  for (const sz of [-1, 1]) {
    const leg = cyl(0.02, 0.03, 0.8, BRONZE, 5);
    leg.position.set(0.1, 0.85, sz * 0.12);
    g.add(leg);
  }
  return g;
}

// ── Trái cây ─────────────────────────────────────────────────────────────

// Quả vải — chùm hai quả sần đỏ (icosahedron facet) trên cuống.
function quaVai(): THREE.Group {
  const g = new THREE.Group();
  const positions: Array<[number, number, number]> = [
    [-0.35, 1.1, 0],
    [0.35, 0.95, 0.1],
  ];
  for (const [x, y, z] of positions) {
    const fruit = ball(0.55, LYCHEE, 1);
    fruit.position.set(x, y, z);
    g.add(fruit);
    const stalk = cyl(0.03, 0.03, 0.5, STEM, 5);
    stalk.position.set(x * 0.5, y + 0.55, z);
    stalk.rotation.z = -x * 0.4;
    g.add(stalk);
  }
  const leaf = box(0.08, 0.35, 0.22, LEAF);
  leaf.position.set(0.1, 1.7, 0);
  leaf.rotation.z = 0.4;
  g.add(leaf);
  return g;
}

// Quả thanh long — thân bầu hồng với các vảy (tai) xanh nhọn nhô ra.
function thanhLong(): THREE.Group {
  const g = new THREE.Group();
  const body = ball(0.75, DRAGON);
  body.scale.set(0.9, 1.3, 0.9);
  body.position.y = 1.2;
  g.add(body);

  // Vảy xanh xếp xoắn quanh thân.
  const scales = 10;
  for (let i = 0; i < scales; i++) {
    const t = i / scales;
    const ang = t * Math.PI * 3;
    const y = 0.6 + t * 1.3;
    const r = 0.7 * Math.sin(t * Math.PI) + 0.35;
    const scale = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.5, 4), mat(LEAF));
    scale.position.set(Math.cos(ang) * r, y, Math.sin(ang) * r);
    scale.rotation.set(Math.PI / 2, 0, -ang + Math.PI / 2);
    scale.rotation.x = 1.2;
    g.add(scale);
  }

  // Chỏm vảy trên đỉnh.
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 4), mat(LEAF));
  crown.position.y = 2.05;
  g.add(crown);
  return g;
}

// ── Ẩm thực ──────────────────────────────────────────────────────────────

// Bát phở — bát sứ (lathe), nước dùng, sợi phở, hai đũa gác ngang.
function batPho(): THREE.Group {
  const g = new THREE.Group();

  // Thành bát bằng LatheGeometry (mặt cắt cong loe).
  const profile: THREE.Vector2[] = [
    new THREE.Vector2(0.25, 0),
    new THREE.Vector2(0.55, 0.15),
    new THREE.Vector2(0.85, 0.55),
    new THREE.Vector2(0.95, 0.62),
  ];
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(profile, 20), mat(BOWL, 0.4));
  bowl.material.side = THREE.DoubleSide;
  bowl.position.y = 0.75;
  g.add(bowl);

  // Mặt nước dùng.
  const broth = new THREE.Mesh(new THREE.CircleGeometry(0.82, 20), mat(BROTH, 0.3));
  broth.rotation.x = -Math.PI / 2;
  broth.position.y = 1.28;
  g.add(broth);

  // Vài lát sợi phở nổi trên mặt.
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const noodle = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.03, 5, 10, Math.PI * 1.2),
      mat(NOODLE),
    );
    noodle.position.set(Math.cos(ang) * 0.3, 1.31, Math.sin(ang) * 0.3);
    noodle.rotation.set(-Math.PI / 2, 0, ang);
    g.add(noodle);
  }

  // Hành lá (đốm xanh).
  const scallion = box(0.1, 0.04, 0.1, LEAF);
  scallion.position.set(0.15, 1.32, -0.15);
  g.add(scallion);

  // Hai chiếc đũa gác chéo miệng bát.
  for (const off of [-0.08, 0.08]) {
    const stick = cyl(0.02, 0.025, 1.4, WOOD, 5);
    stick.position.set(0.1 + off, 1.45, off);
    stick.rotation.set(0.3, 0.4, Math.PI / 2 - 0.35);
    g.add(stick);
  }
  return g;
}

// ── Biểu tượng ───────────────────────────────────────────────────────────

// Trống đồng Đông Sơn — thân trống (lathe: mặt phẳng, tang phình, lưng thắt,
// chân loe) với ngôi sao nổi giữa mặt.
function trongDong(): THREE.Group {
  const g = new THREE.Group();
  const profile: THREE.Vector2[] = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.95, 0),
    new THREE.Vector2(0.95, 0.05),
    new THREE.Vector2(0.75, 0.35),
    new THREE.Vector2(0.6, 0.85),
    new THREE.Vector2(0.62, 1.25),
    new THREE.Vector2(0.82, 1.6),
    new THREE.Vector2(0.82, 1.66),
  ];
  const drum = new THREE.Mesh(new THREE.LatheGeometry(profile, 24), mat(BRONZE, 0.5));
  drum.material.side = THREE.DoubleSide;
  g.add(drum);

  // Ngôi sao nhiều cánh ở tâm mặt trống.
  const star = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.08, 12), mat(0xd8b24a, 0.4));
  star.position.y = 0.06;
  g.add(star);

  // Vành tròn nổi quanh sao.
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.03, 6, 24), mat(0xcaa23f, 0.4));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.05;
  g.add(ring);
  return g;
}

// Hoa sen — vòng cánh hồng xòe, gương sen vàng ở giữa, lá sen xanh dưới đáy.
function hoaSen(): THREE.Group {
  const g = new THREE.Group();

  const pad = new THREE.Mesh(new THREE.CircleGeometry(1.05, 16), mat(LEAF));
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = 0.05;
  g.add(pad);

  // Hai vòng cánh (ngoài xòe, trong dựng).
  const rings: Array<[number, number, number, number]> = [
    [8, 0.55, 0.9, 1.15],
    [6, 0.35, 1.1, 0.6],
  ];
  for (const [count, radius, tilt, y] of rings) {
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 4), mat(LOTUS));
      petal.scale.set(1, 1, 0.35);
      petal.position.set(Math.cos(ang) * radius, y, Math.sin(ang) * radius);
      petal.rotation.set(Math.PI / 2 - tilt, -ang, 0);
      g.add(petal);
    }
  }

  const core = cyl(0.32, 0.24, 0.28, LOTUS_CORE, 10);
  core.position.y = 1.25;
  g.add(core);
  return g;
}

// Nón lá — chóp nón (cone), vành đáy và quai nón.
function nonLa(): THREE.Group {
  const g = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.3, 18, 1, true), mat(HAT, 0.6));
  cone.material.side = THREE.DoubleSide;
  cone.position.y = 1.0;
  g.add(cone);

  const brim = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.04, 6, 20), mat(HAT, 0.6));
  brim.rotation.x = Math.PI / 2;
  brim.position.y = 0.36;
  g.add(brim);

  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), mat(WOOD));
  tip.position.y = 1.68;
  g.add(tip);

  // Quai nón (nửa vòng dưới vành).
  const strap = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.02, 5, 16, Math.PI),
    mat(0xd94c6a),
  );
  strap.position.y = 0.36;
  g.add(strap);
  return g;
}

// ── Registry ─────────────────────────────────────────────────────────────

export type ModelGroup = "con-vat" | "trai-cay" | "am-thuc" | "bieu-tuong";

export interface Model3DDef {
  id: string;
  ten: string;
  nhom: ModelGroup;
  build(): THREE.Group;
}

export const MODELS3D: Model3DDef[] = [
  { id: "con-trau", ten: "Con trâu", nhom: "con-vat", build: conTrau },
  { id: "con-voi", ten: "Con voi", nhom: "con-vat", build: conVoi },
  { id: "chim-lac", ten: "Chim lạc", nhom: "con-vat", build: chimLac },
  { id: "qua-vai", ten: "Quả vải", nhom: "trai-cay", build: quaVai },
  { id: "thanh-long", ten: "Quả thanh long", nhom: "trai-cay", build: thanhLong },
  { id: "bat-pho", ten: "Bát phở", nhom: "am-thuc", build: batPho },
  { id: "trong-dong", ten: "Trống đồng Đông Sơn", nhom: "bieu-tuong", build: trongDong },
  { id: "hoa-sen", ten: "Hoa sen", nhom: "bieu-tuong", build: hoaSen },
  { id: "non-la", ten: "Nón lá", nhom: "bieu-tuong", build: nonLa },
];

// ── Trình xem ────────────────────────────────────────────────────────────

export interface Model3DHandle {
  /** Dọn renderer, geometry/material, event và animation frame. Gọi khi đóng panel. */
  dispose(): void;
}

/**
 * Nhúng một model 3D vào `container`, tự dựng renderer/camera/scene độc lập.
 *
 * Auto-rotate nhẹ và cho kéo chuột (pointer) để xoay. Chỉ animate khi canvas
 * đang hiển thị trong viewport (IntersectionObserver) để tiết kiệm GPU.
 *
 * @param container Phần tử bọc — canvas sẽ lấp đầy kích thước của nó.
 * @param modelId   id trong {@link MODELS3D}. Không khớp → dùng model đầu tiên.
 * @returns Handle có `dispose()` để dọn sạch khi gỡ panel.
 */
export function mountModel3D(container: HTMLElement, modelId: string): Model3DHandle {
  const def = MODELS3D.find((m) => m.id === modelId) ?? MODELS3D[0];

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

  // Pivot quay quanh tâm model; model được dời để tâm trùng gốc pivot.
  const pivot = new THREE.Group();
  scene.add(pivot);
  const model = def.build();
  pivot.add(model);

  // Căn giữa model và đặt camera vừa khung theo bounding box.
  const bbox = new THREE.Box3().setFromObject(model);
  const center = bbox.getCenter(new THREE.Vector3());
  const size = bbox.getSize(new THREE.Vector3());
  model.position.sub(center); // tâm model → gốc pivot
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const fitDist = (maxDim * 0.5) / Math.tan((camera.fov * Math.PI) / 360);
  const camDist = fitDist * 1.7;
  camera.position.set(0, maxDim * 0.15, camDist);
  camera.lookAt(0, 0, 0);

  // ── Tương tác kéo chuột + auto-rotate ──
  let yaw = 0.4;
  let pitch = 0.15;
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
      // Giải phóng geometry + material của toàn bộ cây scene.
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
