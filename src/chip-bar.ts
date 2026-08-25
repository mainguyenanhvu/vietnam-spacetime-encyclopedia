// ═══════════════════════════════════════════════════════════════════════
// THANH CHIP NHÓM LỚP PHỦ — điều hướng nhanh kiểu hàng chip danh mục ngay
// dưới thanh tìm kiếm (học Google Maps). Mỗi chip = một cụm OVERLAY_GROUPS;
// bấm chip bật/tắt CẢ cụm.
//
// Cố ý KHÔNG có đường bật lớp riêng: chip tìm đúng checkbox
// `input[name=overlay]` trong #layer-control rồi dispatch "change" — mọi
// logic nạp lười / 3D / visibility vẫn đi qua toggleOverlay() như cũ.
//
// Gắn vào TRONG #topbar (hàng full-width): ResizeObserver của main.ts đồng
// bộ --topbar-h nên các panel nổi tự dời xuống theo, không đụng hệ định vị.
// ═══════════════════════════════════════════════════════════════════════

import { OVERLAYS, OVERLAY_GROUPS } from "./overlays-config";

interface NhomChip {
  id: string;
  nhan: string;
  icon: string;
  ids: string[];
}

// Cùng công thức gom nhóm với buildLayerControl(): lớp chưa gán nhóm dồn về
// "Khác" để không lớp nào biến mất khỏi lối tắt.
function cacNhom(): NhomChip[] {
  const daGom = new Set(OVERLAY_GROUPS.flatMap((g) => g.ids));
  const conLai = OVERLAYS.filter((o) => !daGom.has(o.id));
  const nhom: NhomChip[] = conLai.length
    ? [...OVERLAY_GROUPS, { id: "khac", nhan: "Khác", icon: "📦", ids: conLai.map((o) => o.id) }]
    : [...OVERLAY_GROUPS];
  return nhom
    .map((g) => ({ ...g, ids: g.ids.filter((id) => OVERLAYS.some((o) => o.id === id)) }))
    .filter((g) => g.ids.length > 0);
}

function checkboxCua(id: string): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>(
    `#layer-control input[name=overlay][value="${id}"]`,
  );
}

export function initChipBar(): void {
  const topbar = document.getElementById("topbar");
  const lc = document.getElementById("layer-control");
  if (!topbar || !lc) return;

  const nhom = cacNhom();
  const bar = document.createElement("div");
  bar.id = "chip-bar";
  bar.setAttribute("role", "toolbar");
  bar.setAttribute("aria-label", "Lối tắt nhóm lớp phủ");
  bar.innerHTML =
    `<button type="button" class="chip chip-tat" id="chip-tat-het" hidden>✕ Tắt hết</button>` +
    nhom
      .map(
        (g) =>
          `<button type="button" class="chip" data-nhom="${g.id}" aria-pressed="false">` +
          `<span aria-hidden="true">${g.icon}</span> <span class="chip-nhan">${g.nhan}</span>` +
          `<span class="chip-dem" hidden></span></button>`,
      )
      .join("");
  // Khung bọc: hai mũi tên nằm ngoài vùng cuộn, nếu không chúng cuộn theo
  // và trôi khỏi màn hình đúng lúc cần tới nhất.
  const khung = document.createElement("div");
  khung.id = "chip-khung";
  khung.innerHTML =
    `<button type="button" class="chip-mui chip-mui-trai" aria-label="Cuộn nhóm lớp phủ sang trái" hidden>‹</button>` +
    `<button type="button" class="chip-mui chip-mui-phai" aria-label="Cuộn nhóm lớp phủ sang phải" hidden>›</button>`;
  khung.insertBefore(bar, khung.querySelector(".chip-mui-phai"));
  topbar.appendChild(khung);

  const muiTrai = khung.querySelector<HTMLButtonElement>(".chip-mui-trai");
  const muiPhai = khung.querySelector<HTMLButtonElement>(".chip-mui-phai");

  /**
   * Bật/tắt mũi tên + dải mờ ở mép theo lượng còn cuộn được.
   *
   * Ngưỡng 4px chứ không phải 0: bề rộng bố cục là số thực, so bằng 0 thì mũi
   * tên nhấp nháy ở đúng hai đầu rãnh.
   */
  const capNhatCuon = (): void => {
    const conTrai = bar.scrollLeft > 4;
    const conPhai = bar.scrollLeft + bar.clientWidth < bar.scrollWidth - 4;
    if (muiTrai) muiTrai.hidden = !conTrai;
    if (muiPhai) muiPhai.hidden = !conPhai;
    khung.classList.toggle("con-trai", conTrai);
    khung.classList.toggle("con-phai", conPhai);
  };

  khung.addEventListener("click", (e) => {
    const mui = (e.target as HTMLElement).closest<HTMLButtonElement>(".chip-mui");
    if (!mui) return;
    // Cuộn 80% khung: chừa lại một chip đã thấy làm mốc mắt, đỡ mất phương hướng.
    const buoc = bar.clientWidth * 0.8;
    bar.scrollBy({ left: mui.classList.contains("chip-mui-trai") ? -buoc : buoc, behavior: "smooth" });
  });

  // Chuột bàn phím không có bánh xe ngang. Đổi lăn dọc thành cuộn ngang KHI
  // hàng chip thật sự tràn — không thì cướp mất cú lăn của cả trang.
  bar.addEventListener(
    "wheel",
    (e) => {
      if (e.deltaY === 0 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (bar.scrollWidth <= bar.clientWidth) return;
      e.preventDefault();
      bar.scrollLeft += e.deltaY;
    },
    { passive: false },
  );

  bar.addEventListener("scroll", capNhatCuon, { passive: true });
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(capNhatCuon).observe(bar);
  capNhatCuon();

  const capNhat = (): void => {
    let coLopBat = false;
    for (const g of nhom) {
      const btn = bar.querySelector<HTMLButtonElement>(`button[data-nhom="${g.id}"]`);
      if (!btn) continue;
      const cbs = g.ids.map(checkboxCua).filter((c): c is HTMLInputElement => c !== null);
      const bat = cbs.filter((c) => c.checked).length;
      coLopBat = coLopBat || bat > 0;
      btn.setAttribute("aria-pressed", bat > 0 ? "true" : "false");
      btn.classList.toggle("chip-active", bat > 0);
      const dem = btn.querySelector<HTMLSpanElement>(".chip-dem");
      if (dem) {
        // Chỉ hiện bộ đếm khi cụm bật MỘT PHẦN — bật đủ thì màu active đã nói
        // hết, thêm "5/5" chỉ là nhiễu.
        const mot_phan = bat > 0 && bat < cbs.length;
        dem.hidden = !mot_phan;
        if (mot_phan) dem.textContent = `${bat}/${cbs.length}`;
      }
    }
    const tatHet = bar.querySelector<HTMLButtonElement>("#chip-tat-het");
    if (tatHet) tatHet.hidden = !coLopBat;
  };

  bar.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button.chip");
    if (!btn) return;
    if (btn.id === "chip-tat-het") {
      for (const cb of document.querySelectorAll<HTMLInputElement>(
        "#layer-control input[name=overlay]:checked",
      )) {
        cb.checked = false;
        cb.dispatchEvent(new Event("change", { bubbles: true }));
      }
      capNhat();
      return;
    }
    const g = nhom.find((x) => x.id === btn.dataset.nhom);
    if (!g) return;
    btn.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    const cbs = g.ids.map(checkboxCua).filter((c): c is HTMLInputElement => c !== null);
    // Đang có lớp nào bật → tắt cả cụm; sạch trơn → bật cả cụm.
    const dich = !cbs.some((c) => c.checked);
    for (const cb of cbs) {
      if (cb.checked !== dich) {
        cb.checked = dich;
        cb.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    capNhat();
  });

  // Người dùng tick từng lớp trong bảng thì chip cũng phải đổi trạng thái theo.
  lc.addEventListener("change", capNhat);
  capNhat();
}
