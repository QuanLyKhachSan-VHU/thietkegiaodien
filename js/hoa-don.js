
document.addEventListener("DOMContentLoaded", function () {
    const STORAGE_KEY = "stayflow_hoa_don";
    const $ = (id) => document.getElementById(id);

    const form = $("formHoaDon");
    const modalElement = $("modalHoaDon");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    const modalChiTietElement = $("modalChiTietHoaDon");
    const modalChiTiet = bootstrap.Modal.getOrCreateInstance(modalChiTietElement);

    const danhSachElement = $("danhSachHoaDon");
    const hoaDonRong = $("hoaDonRong");

    let hoaDons = docDuLieu();
    let danhSachHienThi = [];
    let hoaDonDangXem = null;

    function ngayHienTai() {
        const now = new Date();
        const nam = now.getFullYear();
        const thang = String(now.getMonth() + 1).padStart(2, "0");
        const ngay = String(now.getDate()).padStart(2, "0");
        return `${nam}-${thang}-${ngay}`;
    }

    function docDuLieu() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);

            if (raw !== null) {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (error) {
            console.error("Không đọc được dữ liệu hóa đơn:", error);
        }

        const mau = [
            {
                ma: "HD001",
                khachHang: "Nguyễn Minh Anh",
                phong: "P101",
                ngayLap: "2026-10-10",
                tongTien: 1500000,
                phuongThuc: "Tiền mặt",
                trangThai: "Đã thanh toán",
                ghiChu: "Thanh toán tiền phòng."
            },
            {
                ma: "HD002",
                khachHang: "Trần Quốc Bảo",
                phong: "P203",
                ngayLap: "2026-10-12",
                tongTien: 2200000,
                phuongThuc: "Chuyển khoản",
                trangThai: "Chưa thanh toán",
                ghiChu: "Chờ khách thanh toán."
            },
            {
                ma: "HD003",
                khachHang: "Lê Thu Hà",
                phong: "P305",
                ngayLap: "2026-10-14",
                tongTien: 1800000,
                phuongThuc: "Thẻ ngân hàng",
                trangThai: "Đã thanh toán",
                ghiChu: ""
            }
        ];

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mau));
        } catch (error) {
            console.error("Không lưu được dữ liệu mẫu:", error);
        }

        return mau;
    }

    function luuDuLieu() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(hoaDons));
            return true;
        } catch (error) {
            console.error("Không lưu được hóa đơn:", error);
            alert("Không thể lưu dữ liệu trên trình duyệt. Vui lòng kiểm tra dung lượng lưu trữ.");
            return false;
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function dinhDangTien(tien) {
        return Number(tien || 0).toLocaleString("vi-VN") + " ₫";
    }

    function dinhDangNgay(ngay) {
        if (!ngay) return "—";

        const parts = ngay.split("-");
        return parts.length === 3
            ? `${parts[2]}/${parts[1]}/${parts[0]}`
            : ngay;
    }

    function taoMaHoaDon() {
        let max = 0;

        hoaDons.forEach(hoaDon => {
            const match = String(hoaDon.ma).match(/^HD(\d+)$/i);

            if (match) {
                max = Math.max(max, Number(match[1]));
            }
        });

        return "HD" + String(max + 1).padStart(3, "0");
    }

    function capNhatThongKe() {
        $("tongHoaDon").textContent = hoaDons.length;

        $("hoaDonDaThanhToan").textContent =
            hoaDons.filter(hd => hd.trangThai === "Đã thanh toán").length;

        $("hoaDonChuaThanhToan").textContent =
            hoaDons.filter(hd => hd.trangThai === "Chưa thanh toán").length;

        const tongTien = hoaDons.reduce(
            (tong, hd) => tong + Number(hd.tongTien || 0),
            0
        );

        $("tongGiaTri").textContent = dinhDangTien(tongTien);
    }

    function locDanhSach() {
        const tuKhoa = $("timKiemHoaDon").value
            .trim()
            .toLocaleLowerCase("vi");

        const trangThai = $("locTrangThaiHoaDon").value;

        danhSachHienThi = hoaDons.filter(hd => {
            const noiDung = [
                hd.ma,
                hd.khachHang,
                hd.phong,
                hd.ngayLap,
                hd.phuongThuc,
                hd.trangThai
            ].join(" ").toLocaleLowerCase("vi");

            return noiDung.includes(tuKhoa) &&
                (!trangThai || hd.trangThai === trangThai);
        });

        hienThiDanhSach();
    }

    function hienThiDanhSach() {
        const gioiHan = Number($("soLuongHoaDon").value) || 10;
        const danhSach = danhSachHienThi.slice(0, gioiHan);

        danhSachElement.innerHTML = danhSach.map(hd => {
            const daThanhToan = hd.trangThai === "Đã thanh toán";

            return `
                <tr>
                    <td>
                        <span class="invoice-code">${escapeHTML(hd.ma)}</span>
                    </td>
                    <td>
                        <div class="invoice-customer">
                            <strong>${escapeHTML(hd.khachHang)}</strong>
                            <small>${escapeHTML(hd.phuongThuc)}</small>
                        </div>
                    </td>
                    <td>${escapeHTML(hd.phong)}</td>
                    <td>${escapeHTML(dinhDangNgay(hd.ngayLap))}</td>
                    <td>
                        <span class="invoice-amount">
                            ${escapeHTML(dinhDangTien(hd.tongTien))}
                        </span>
                    </td>
                    <td>${escapeHTML(hd.phuongThuc)}</td>
                    <td>
                        <span class="invoice-status ${daThanhToan ? "paid" : "unpaid"}">
                            ${escapeHTML(hd.trangThai)}
                        </span>
                    </td>
                    <td>
                        <div class="invoice-actions">
                            <button class="invoice-action" type="button"
                                data-action="view" data-ma="${escapeHTML(hd.ma)}">Xem</button>
                            <button class="invoice-action" type="button"
                                data-action="edit" data-ma="${escapeHTML(hd.ma)}">Sửa</button>
                            <button class="invoice-action delete" type="button"
                                data-action="delete" data-ma="${escapeHTML(hd.ma)}">Xóa</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        hoaDonRong.hidden = danhSachHienThi.length !== 0;

        $("tongBanGhiHoaDon").textContent =
            `Hiển thị ${danhSach.length}/${danhSachHienThi.length} hóa đơn`;

        capNhatThongKe();
    }

    function lamMoiForm() {
        form.reset();
        $("maHoaDonCu").value = "";
        $("ngayLapHoaDon").value = ngayHienTai();
        $("trangThaiHoaDon").value = "Chưa thanh toán";
        $("tieuDeModalHoaDon").textContent = "Tạo hóa đơn";
        $("btnLuuHoaDon").textContent = "Lưu hóa đơn";
    }

    function moFormThem() {
        lamMoiForm();
        modal.show();
        setTimeout(() => $("tenKhachHangHD").focus(), 200);
    }

    function moFormSua(ma) {
        const hd = hoaDons.find(item => item.ma === ma);
        if (!hd) return;

        lamMoiForm();

        $("maHoaDonCu").value = hd.ma;
        $("tenKhachHangHD").value = hd.khachHang;
        $("phongHoaDon").value = hd.phong;
        $("ngayLapHoaDon").value = hd.ngayLap;
        $("tongTienHoaDon").value = hd.tongTien;
        $("phuongThucThanhToan").value = hd.phuongThuc;
        $("trangThaiHoaDon").value = hd.trangThai;
        $("ghiChuHoaDon").value = hd.ghiChu || "";

        $("tieuDeModalHoaDon").textContent = "Cập nhật hóa đơn";
        $("btnLuuHoaDon").textContent = "Lưu thay đổi";

        modal.show();
    }

    function xemChiTiet(ma) {
        const hd = hoaDons.find(item => item.ma === ma);
        if (!hd) return;

        hoaDonDangXem = hd;

        $("noiDungChiTietHoaDon").innerHTML = `
            <div class="invoice-detail" id="noiDungInHoaDon">
                <div class="invoice-detail-header">
                    <h3>STAYFLOW</h3>
                    <p>HÓA ĐƠN THANH TOÁN KHÁCH SẠN</p>
                    <p>Mã hóa đơn: <strong>${escapeHTML(hd.ma)}</strong></p>
                </div>

                <div class="invoice-detail-row">
                    <span>Khách hàng</span>
                    <strong>${escapeHTML(hd.khachHang)}</strong>
                </div>

                <div class="invoice-detail-row">
                    <span>Phòng</span>
                    <strong>${escapeHTML(hd.phong)}</strong>
                </div>

                <div class="invoice-detail-row">
                    <span>Ngày lập</span>
                    <strong>${escapeHTML(dinhDangNgay(hd.ngayLap))}</strong>
                </div>

                <div class="invoice-detail-row">
                    <span>Phương thức thanh toán</span>
                    <strong>${escapeHTML(hd.phuongThuc)}</strong>
                </div>

                <div class="invoice-detail-row">
                    <span>Trạng thái</span>
                    <strong>${escapeHTML(hd.trangThai)}</strong>
                </div>

                <div class="invoice-detail-total">
                    <span>Tổng thanh toán</span>
                    <span>${escapeHTML(dinhDangTien(hd.tongTien))}</span>
                </div>

                ${hd.ghiChu ? `
                    <div class="invoice-detail-note">
                        <strong>Ghi chú</strong>
                        ${escapeHTML(hd.ghiChu)}
                    </div>
                ` : ""}
            </div>
        `;

        modalChiTiet.show();
    }

    function inHoaDon(hd) {
        if (!hd) return;

        const vungIn = document.createElement("div");
        vungIn.id = "vungInHoaDon";

        vungIn.innerHTML = `
            <div style="max-width:700px;margin:0 auto;font-family:Arial,sans-serif;color:#172b4d">
                <div style="text-align:center;border-bottom:2px solid #123b68;padding-bottom:18px;margin-bottom:20px">
                    <h1 style="margin:0;color:#123b68">STAYFLOW</h1>
                    <p style="margin:8px 0 0">HÓA ĐƠN THANH TOÁN KHÁCH SẠN</p>
                </div>

                <p><strong>Mã hóa đơn:</strong> ${escapeHTML(hd.ma)}</p>
                <p><strong>Khách hàng:</strong> ${escapeHTML(hd.khachHang)}</p>
                <p><strong>Phòng:</strong> ${escapeHTML(hd.phong)}</p>
                <p><strong>Ngày lập:</strong> ${escapeHTML(dinhDangNgay(hd.ngayLap))}</p>
                <p><strong>Phương thức thanh toán:</strong> ${escapeHTML(hd.phuongThuc)}</p>
                <p><strong>Trạng thái:</strong> ${escapeHTML(hd.trangThai)}</p>

                <div style="margin-top:25px;padding:18px;background:#f0f5fc;border-radius:8px;font-size:20px;font-weight:bold">
                    Tổng tiền: ${escapeHTML(dinhDangTien(hd.tongTien))}
                </div>

                ${hd.ghiChu ? `<p style="margin-top:18px"><strong>Ghi chú:</strong> ${escapeHTML(hd.ghiChu)}</p>` : ""}

                <p style="text-align:center;margin-top:45px;font-style:italic">
                    Cảm ơn quý khách đã sử dụng dịch vụ của StayFlow!
                </p>
            </div>
        `;

        document.body.appendChild(vungIn);

        const donDep = function () {
            if (vungIn.parentNode) {
                vungIn.remove();
            }
            window.removeEventListener("afterprint", donDep);
        };

        window.addEventListener("afterprint", donDep);

        window.print();

        setTimeout(donDep, 1500);
    }

    $("btnThemHoaDon").addEventListener("click", moFormThem);

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const maCu = $("maHoaDonCu").value;
        const khachHang = $("tenKhachHangHD").value.trim();
        const phong = $("phongHoaDon").value.trim();
        const ngayLap = $("ngayLapHoaDon").value;
        const tongTien = Number($("tongTienHoaDon").value);
        const phuongThuc = $("phuongThucThanhToan").value;
        const trangThai = $("trangThaiHoaDon").value;
        const ghiChu = $("ghiChuHoaDon").value.trim();

        if (!khachHang || !phong || !ngayLap || !phuongThuc || !trangThai) {
            alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }

        if (!Number.isFinite(tongTien) || tongTien < 0) {
            alert("Tổng tiền phải là số không âm.");
            $("tongTienHoaDon").focus();
            return;
        }

        const hoaDonMoi = {
            ma: maCu || taoMaHoaDon(),
            khachHang,
            phong,
            ngayLap,
            tongTien,
            phuongThuc,
            trangThai,
            ghiChu
        };

        const danhSachCu = hoaDons.map(hd => ({ ...hd }));

        if (maCu) {
            const index = hoaDons.findIndex(hd => hd.ma === maCu);
            if (index === -1) return;

            hoaDons[index] = hoaDonMoi;
        } else {
            hoaDons.push(hoaDonMoi);
        }

        if (!luuDuLieu()) {
            hoaDons = danhSachCu;
            return;
        }

        modal.hide();
        lamMoiForm();
        locDanhSach();
    });

    danhSachElement.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const ma = button.dataset.ma;

        if (button.dataset.action === "view") {
            xemChiTiet(ma);
            return;
        }

        if (button.dataset.action === "edit") {
            moFormSua(ma);
            return;
        }

        if (button.dataset.action === "delete") {
            const hd = hoaDons.find(item => item.ma === ma);
            if (!hd) return;

            const dongY = confirm(
                `Bạn có chắc muốn xóa hóa đơn ${hd.ma} của khách hàng ${hd.khachHang} không?`
            );

            if (!dongY) return;

            const danhSachCu = hoaDons;
            hoaDons = hoaDons.filter(item => item.ma !== ma);

            if (!luuDuLieu()) {
                hoaDons = danhSachCu;
                return;
            }

            locDanhSach();
        }
    });

    $("btnInChiTietHoaDon").addEventListener("click", function () {
        if (hoaDonDangXem) {
            inHoaDon(hoaDonDangXem);
        }
    });

    $("timKiemHoaDon").addEventListener("input", locDanhSach);
    $("locTrangThaiHoaDon").addEventListener("change", locDanhSach);
    $("soLuongHoaDon").addEventListener("change", hienThiDanhSach);

    modalElement.addEventListener("hidden.bs.modal", lamMoiForm);

    $("todayDate").textContent = new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    locDanhSach();
});
