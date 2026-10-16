
// ===== DỮ LIỆU DỊCH VỤ MẪU =====

const duLieuDichVuBanDau = [
    { ma: "DV001", ten: "Giặt ủi", donVi: "Kg", donGia: 25000, trangThai: "active" },
    { ma: "DV002", ten: "Ăn sáng", donVi: "Suất", donGia: 80000, trangThai: "active" },
    { ma: "DV003", ten: "Nước suối", donVi: "Chai", donGia: 15000, trangThai: "active" },
    { ma: "DV004", ten: "Thuê xe máy", donVi: "Ngày", donGia: 150000, trangThai: "active" },
    { ma: "DV005", ten: "Đưa đón sân bay", donVi: "Lượt", donGia: 300000, trangThai: "inactive" },
    { ma: "DV006", ten: "Dịch vụ spa", donVi: "Lượt", donGia: 250000, trangThai: "active" }
];

let danhSachDichVu = duLieuDichVuBanDau.map(dv => ({ ...dv }));
let modalDichVu;
let dangSuaMa = null;

// ===== KHỞI TẠO =====

document.addEventListener("DOMContentLoaded", function () {
    const modalElement = document.getElementById("modalDichVu");

    if (modalElement && window.bootstrap) {
        modalDichVu = new bootstrap.Modal(modalElement);
    }

    ganSuKien();
    hienThiDichVu();
});

// ===== SỰ KIỆN =====

function ganSuKien() {
    document.getElementById("btnThemDichVu").addEventListener("click", moFormThem);

    document.getElementById("formDichVu").addEventListener("submit", function (event) {
        event.preventDefault();
        luuDichVu();
    });

    document.getElementById("timKiemDichVu").addEventListener("input", hienThiDichVu);
    document.getElementById("locTrangThai").addEventListener("change", hienThiDichVu);

    document.getElementById("danhSachDichVu").addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        if (button.dataset.action === "edit") {
            moFormSua(button.dataset.ma);
        }

        if (button.dataset.action === "delete") {
            xoaDichVu(button.dataset.ma);
        }
    });
}

// ===== TIỆN ÍCH =====

function dinhDangTien(soTien) {
    return Number(soTien).toLocaleString("vi-VN") + " ₫";
}

function taoMaDichVu() {
    let soLonNhat = 0;

    danhSachDichVu.forEach(function (dv) {
        const ketQua = dv.ma.match(/^DV(\d+)$/);

        if (ketQua) {
            soLonNhat = Math.max(soLonNhat, Number(ketQua[1]));
        }
    });

    return "DV" + String(soLonNhat + 1).padStart(3, "0");
}

// ===== HIỂN THỊ DANH SÁCH =====

function hienThiDichVu() {
    const tuKhoa = document
        .getElementById("timKiemDichVu")
        .value.trim()
        .toLocaleLowerCase("vi");

    const locTrangThai = document.getElementById("locTrangThai").value;

    const danhSachLoc = danhSachDichVu.filter(function (dv) {
        const noiDungTimKiem = `${dv.ma} ${dv.ten} ${dv.donVi}`.toLocaleLowerCase("vi");

        const khopTuKhoa = noiDungTimKiem.includes(tuKhoa);
        const khopTrangThai =
            locTrangThai === "all" || dv.trangThai === locTrangThai;

        return khopTuKhoa && khopTrangThai;
    });

    const tbody = document.getElementById("danhSachDichVu");
    const emptyState = document.getElementById("khongCoDuLieu");

    tbody.innerHTML = "";

    danhSachLoc.forEach(function (dv) {
        const dangHoatDong = dv.trangThai === "active";
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td><span class="service-code"></span></td>
            <td><span class="service-name"></span></td>
            <td><span class="service-unit"></span></td>
            <td><span class="service-price"></span></td>
            <td>
                <span class="status-badge ${dangHoatDong ? "status-active" : "status-inactive"}">
                    ${dangHoatDong ? "Đang hoạt động" : "Ngừng hoạt động"}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button type="button" class="action-btn"
                        data-action="edit" data-ma="${dv.ma}"
                        title="Sửa dịch vụ" aria-label="Sửa dịch vụ">✎</button>
                    <button type="button" class="action-btn delete"
                        data-action="delete" data-ma="${dv.ma}"
                        title="Xóa dịch vụ" aria-label="Xóa dịch vụ">×</button>
                </div>
            </td>
        `;

        tr.querySelector(".service-code").textContent = dv.ma;
        tr.querySelector(".service-name").textContent = dv.ten;
        tr.querySelector(".service-unit").textContent = dv.donVi;
        tr.querySelector(".service-price").textContent = dinhDangTien(dv.donGia);

        tbody.appendChild(tr);
    });

    emptyState.hidden = danhSachLoc.length > 0;

    document.getElementById("soLuongHienThi").textContent =
        danhSachLoc.length + " dịch vụ";

    document.getElementById("tongBanGhi").textContent = danhSachLoc.length;

    capNhatThongKe();
}

// ===== THỐNG KÊ =====

function capNhatThongKe() {
    const tong = danhSachDichVu.length;

    const dangHoatDong = danhSachDichVu.filter(function (dv) {
        return dv.trangThai === "active";
    }).length;

    document.getElementById("tongDichVu").textContent = tong;
    document.getElementById("dichVuHoatDong").textContent = dangHoatDong;
    document.getElementById("dichVuNgung").textContent = tong - dangHoatDong;
}

// ===== FORM THÊM =====

function moFormThem() {
    dangSuaMa = null;

    document.getElementById("formDichVu").reset();
    document.getElementById("tieuDeModal").textContent = "Thêm dịch vụ";
    document.getElementById("btnLuuDichVu").textContent = "Lưu dịch vụ";
    document.getElementById("trangThaiDichVu").value = "active";

    modalDichVu.show();
}

// ===== FORM SỬA =====

function moFormSua(ma) {
    const dv = danhSachDichVu.find(item => item.ma === ma);

    if (!dv) {
        alert("Không tìm thấy dịch vụ cần sửa.");
        return;
    }

    dangSuaMa = ma;

    document.getElementById("tenDichVu").value = dv.ten;
    document.getElementById("donViTinh").value = dv.donVi;
    document.getElementById("donGia").value = dv.donGia;
    document.getElementById("trangThaiDichVu").value = dv.trangThai;

    document.getElementById("tieuDeModal").textContent = "Cập nhật dịch vụ";
    document.getElementById("btnLuuDichVu").textContent = "Lưu thay đổi";

    modalDichVu.show();
}

// ===== LƯU DỊCH VỤ =====

function luuDichVu() {
    const ten = document.getElementById("tenDichVu").value.trim();
    const donVi = document.getElementById("donViTinh").value.trim();
    const donGia = Number(document.getElementById("donGia").value);
    const trangThai = document.getElementById("trangThaiDichVu").value;

    if (!ten || !donVi) {
        alert("Vui lòng nhập đầy đủ tên dịch vụ và đơn vị tính.");
        return;
    }

    if (!Number.isFinite(donGia) || donGia <= 0) {
        alert("Đơn giá phải lớn hơn 0.");
        return;
    }

    const tenBiTrung = danhSachDichVu.some(function (dv) {
        return dv.ten.toLocaleLowerCase("vi") === ten.toLocaleLowerCase("vi")
            && dv.ma !== dangSuaMa;
    });

    if (tenBiTrung) {
        alert("Tên dịch vụ đã tồn tại. Vui lòng nhập tên khác.");
        return;
    }

    if (dangSuaMa) {
        const viTri = danhSachDichVu.findIndex(dv => dv.ma === dangSuaMa);

        if (viTri === -1) {
            alert("Không tìm thấy dịch vụ cần cập nhật.");
            return;
        }

        danhSachDichVu[viTri] = {
            ...danhSachDichVu[viTri],
            ten,
            donVi,
            donGia,
            trangThai
        };

        modalDichVu.hide();
        hienThiDichVu();
        alert("Cập nhật dịch vụ thành công.");
        return;
    }

    danhSachDichVu.unshift({
        ma: taoMaDichVu(),
        ten,
        donVi,
        donGia,
        trangThai
    });

    modalDichVu.hide();
    hienThiDichVu();
    alert("Thêm dịch vụ thành công.");
}

// ===== XÓA DỊCH VỤ =====

function xoaDichVu(ma) {
    const dv = danhSachDichVu.find(item => item.ma === ma);

    if (!dv) {
        alert("Không tìm thấy dịch vụ cần xóa.");
        return;
    }

    if (!confirm(`Bạn có chắc muốn xóa dịch vụ "${dv.ten}" không?`)) {
        return;
    }

    danhSachDichVu = danhSachDichVu.filter(item => item.ma !== ma);

    hienThiDichVu();
    alert("Đã xóa dịch vụ khỏi danh sách mẫu.");
}
