// Gom nút topbar. 12 module tự thêm nút vào #topbar-nav khi khởi tạo, kết quả
// là một bức tường 12 viên thuốc xếp 2 hàng ăn ~180px đỉnh màn hình — không có
// thứ bậc, tất cả cùng hét lên, và trên di động thì tệ hơn.
//
// Giữ lại 3 nút THẬT SỰ là hành động khung (chế độ xem, 3D, thư viện), dồn phần
// còn lại vào một menu «Khám phá». 12 mục xuống 4.
//
// Chạy SAU mọi init* — nó di chuyển nút đã tồn tại chứ không tự tạo, nên module
// nào thêm nút muộn hơn vẫn hiện ra ngoài (thấy được, chỉ là không được gom).

/** Nút ở lại thanh chính. Mọi nút khác rơi vào menu «Khám phá». */
const GIU_NGOAI = ["che-do-btn", "threed-btn", "library-btn"];

export function gomNutTopbar(): void {
  const nav = document.getElementById("topbar-nav");
  if (!nav) return;

  const nut = [...nav.querySelectorAll<HTMLElement>(":scope > button")];
  const donVao = nut.filter((b) => !GIU_NGOAI.includes(b.id));

  // Gọi lại được: một số module (Nam tiến) thêm nút BÊN TRONG map.on("load"),
  // tức là sau lượt gom đầu. Lần sau chỉ hút nốt nút đến muộn vào khay có sẵn.
  const daCo = document.getElementById("nav-kham-pha");
  if (daCo) {
    const khaySan = daCo.querySelector(".nav-menu-khay");
    if (khaySan) for (const b of donVao) khaySan.appendChild(b);
    return;
  }

  if (donVao.length < 3) return; // ít nút thì gom chỉ tổ thêm một cú bấm

  const hop = document.createElement("details");
  hop.id = "nav-kham-pha";
  hop.className = "nav-menu";
  const nhan = document.createElement("summary");
  nhan.textContent = "Khám phá";
  nhan.setAttribute("aria-label", `Khám phá — ${donVao.length} mục`);
  hop.appendChild(nhan);

  const khay = document.createElement("div");
  khay.className = "nav-menu-khay";
  for (const b of donVao) khay.appendChild(b);
  hop.appendChild(khay);
  nav.appendChild(hop);

  // Bấm một mục thì đóng menu — nếu không nó che mất chính panel vừa mở.
  khay.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("button")) hop.open = false;
  });
  // Bấm ra ngoài hoặc Escape thì đóng. Escape ở đây KHÔNG stopPropagation:
  // main.ts còn dùng Escape để đóng panel, đóng cả hai cùng lúc là đúng ý.
  document.addEventListener("click", (e) => {
    if (hop.open && !hop.contains(e.target as Node)) hop.open = false;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hop.open = false;
  });

  // Hút nút đến muộn. Gọi lại gomNutTopbar() ở vài mốc cố định KHÔNG đủ: một số
  // module thêm nút sau một lượt fetch (Nam tiến), nên không có mốc nào chắc
  // chắn là "sau cùng". MutationObserver bắt mọi trường hợp — panels.ts đã dùng
  // đúng cách này cho việc ẩn panel.
  new MutationObserver(() => {
    const muon = [...nav.querySelectorAll<HTMLElement>(":scope > button")].filter(
      (b) => !GIU_NGOAI.includes(b.id),
    );
    for (const b of muon) khay.appendChild(b);
  }).observe(nav, { childList: true });
}
