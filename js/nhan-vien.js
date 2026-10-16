
document.addEventListener("DOMContentLoaded", function () {
    const STORAGE_KEY = "stayflow_nhan_vien";

    const $ = (id) => document.getElementById(id);

    const form = $("formNhanVien");
    const modalElement = $("modalNhanVien");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    const danhSachElement = $("danhSachNhanVien");
    const khongCoDuLieu = $("khongCoDuLieu");

    let nhanViens = docDuLieu();
    let danhSachHienThi = [];

    function docDuLieu() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw !== null) {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (error) {
            console.error("Không đọc được dữ liệu nhân viên:", error);
        }

        const mau = [
            {
                ma: "NV001",
                ten: "Nguyễn Minh Anh",
                dienThoai: "0901234567",
                email: "minhanh@example.com",
                chucVu: "Lễ tân",
                ngayVaoLam: "2025-01-10",
                trangThai: "Đang làm việc"
            },
            {
                ma: "NV002",
                ten: "Trần Quốc Bảo",
                dienThoai: "0912345678",
                email: "quocbao@example.com",
                chucVu: "Quản lý",
                ngayVaoLam: "2024-06-15",
                trangThai: "Đang làm việc"
            },
            {
                ma: "NV003",
                ten: "Lê Thu Hà",
                dienThoai: "0987654321",
                email: "thuha@example.com",
                chucVu: "Buồng phòng",
                ngayVaoLam: "2024-03-20",
                trangThai: "Đã nghỉ"
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
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nhanViens));
            return true;
        } catch (error) {
            alert("Không thể lưu dữ liệu trên trình duyệt. Vui lòng kiểm tra chế độ riêng tư hoặc dung lượng lưu trữ.");
            console.error(error);
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

    function vietTat(ten) {
        return ten.trim().split(/\s+/).slice(-2)
            .map(tu => tu.charAt(0))
            .join("")
            .toUpperCase();
    }

    function dinhDangNgay(ngay) {
        if (!ngay) return "—";
        const parts = ngay.split("-");
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : ngay;
    }

    function taoMaNhanVien() {
        let max = 0;

        nhanViens.forEach(nv => {
            const match = nv.ma.match(/^NV(\d+)$/i);
            if (match) max = Math.max(max, Number(match[1]));
        });

        return "NV" + String(max + 1).padStart(3, "0");
    }

    function capNhatThongKe() {
        $("tongNhanVien").textContent = nhanViens.length;
        $("nhanVienHoatDong").textContent =
            nhanViens.filter(nv => nv.trangThai === "Đang làm việc").length;
        $("nhanVienNgung").textContent =
            nhanViens.filter(nv => nv.trangThai === "Đã nghỉ").length;
    }

    function locDanhSach() {
        const tuKhoa = $("timKiemNhanVien").value.trim().toLocaleLowerCase("vi");
        const trangThai = $("locTrangThai").value;

        danhSachHienThi = nhanViens.filter(nv => {
            const noiDung = [
                nv.ma, nv.ten, nv.dienThoai, nv.email, nv.chucVu
            ].join(" ").toLocaleLowerCase("vi");

            const dungTuKhoa = noiDung.includes(tuKhoa);
            const dungTrangThai = !trangThai || nv.trangThai === trangThai;

            return dungTuKhoa && dungTrangThai;
        });

        hienThiDanhSach();
    }

    function hienThiDanhSach() {
        const gioiHan = Number($("soLuongHienThi").value) || 10;
        const danhSach = danhSachHienThi.slice(0, gioiHan);

        danhSachElement.innerHTML = danhSach.map(nv => {
            const dangLam = nv.trangThai === "Đang làm việc";
            const statusClass = dangLam ? "active" : "inactive";

            return `
                <tr>
                    <td><span class="employee-code">${escapeHTML(nv.ma)}</span></td>
                    <td>
                        <div class="employee-person">
                            <div class="employee-avatar">${escapeHTML(vietTat(nv.ten))}</div>
                            <div>
                                <strong>${escapeHTML(nv.ten)}</strong>
                                <small>${escapeHTML(nv.email)}</small>
                            </div>
                        </div>
                    </td>
                    <td>${escapeHTML(nv.dienThoai)}</td>
                    <td>${escapeHTML(nv.chucVu)}</td>
                    <td>${escapeHTML(dinhDangNgay(nv.ngayVaoLam))}</td>
                    <td>
                        <span class="employee-status ${statusClass}">
                            ${escapeHTML(nv.trangThai)}
                        </span>
                    </td>
                    <td>
                        <div class="employee-actions">
                            <button class="employee-action" type="button"
                                data-action="edit" data-ma="${escapeHTML(nv.ma)}">Sửa</button>
                            <button class="employee-action delete" type="button"
                                data-action="delete" data-ma="${escapeHTML(nv.ma)}">Xóa</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        khongCoDuLieu.hidden = danhSachHienThi.length !== 0;

        $("tongBanGhi").textContent =
            `Hiển thị ${danhSach.length}/${danhSachHienThi.length} nhân viên`;

        capNhatThongKe();
    }

    function lamMoiForm() {
        form.reset();
        $("maNhanVien").value = "";
        $("trangThaiNhanVien").value = "Đang làm việc";
        $("tieuDeModal").textContent = "Thêm nhân viên";
        $("btnLuuNhanVien").textContent = "Lưu nhân viên";
    }

    function moFormThem() {
        lamMoiForm();
        $("ngayVaoLam").value = new Date().toLocaleDateString("en-CA");
        modal.show();
        setTimeout(() => $("tenNhanVien").focus(), 200);
    }

    function moFormSua(ma) {
        const nv = nhanViens.find(item => item.ma === ma);
        if (!nv) return;

        lamMoiForm();

        $("maNhanVien").value = nv.ma;
        $("tenNhanVien").value = nv.ten;
        $("soDienThoai").value = nv.dienThoai;
        $("emailNhanVien").value = nv.email;
        $("chucVu").value = nv.chucVu;
        $("ngayVaoLam").value = nv.ngayVaoLam;
        $("trangThaiNhanVien").value = nv.trangThai;

        $("tieuDeModal").textContent = "Cập nhật nhân viên";
        $("btnLuuNhanVien").textContent = "Lưu thay đổi";

        modal.show();
    }

    $("btnThemNhanVien").addEventListener("click", moFormThem);

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const maCu = $("maNhanVien").value;
        const ten = $("tenNhanVien").value.trim();
        const dienThoai = $("soDienThoai").value.trim();
        const email = $("emailNhanVien").value.trim();
        const chucVu = $("chucVu").value;
        const ngayVaoLam = $("ngayVaoLam").value;
        const trangThai = $("trangThaiNhanVien").value;

        if (!ten || !dienThoai || !email || !chucVu || !ngayVaoLam) {
            alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }

        const trungEmail = nhanViens.some(nv =>
            nv.email.toLowerCase() === email.toLowerCase() && nv.ma !== maCu
        );

        if (trungEmail) {
            alert("Email này đã được sử dụng cho nhân viên khác.");
            $("emailNhanVien").focus();
            return;
        }

        const trungSDT = nhanViens.some(nv =>
            nv.dienThoai === dienThoai && nv.ma !== maCu
        );

        if (trungSDT) {
            alert("Số điện thoại này đã tồn tại.");
            $("soDienThoai").focus();
            return;
        }

        if (maCu) {
            const index = nhanViens.findIndex(nv => nv.ma === maCu);
            if (index === -1) return;

            nhanViens[index] = {
                ma: maCu, ten, dienThoai, email,
                chucVu, ngayVaoLam, trangThai
            };
        } else {
            nhanViens.push({
                ma: taoMaNhanVien(), ten, dienThoai, email,
                chucVu, ngayVaoLam, trangThai
            });
        }

        if (!luuDuLieu()) return;

        modal.hide();
        lamMoiForm();
        locDanhSach();
    });

    danhSachElement.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const ma = button.dataset.ma;

        if (button.dataset.action === "edit") {
            moFormSua(ma);
            return;
        }

        if (button.dataset.action === "delete") {
            const nv = nhanViens.find(item => item.ma === ma);
            if (!nv) return;

            const dongY = confirm(`Bạn có chắc muốn xóa nhân viên ${nv.ten} (${nv.ma}) không?`);
            if (!dongY) return;

            const danhSachCu = nhanViens;
            nhanViens = nhanViens.filter(item => item.ma !== ma);

            if (!luuDuLieu()) {
                nhanViens = danhSachCu;
                return;
            }

            locDanhSach();
        }
    });

    $("timKiemNhanVien").addEventListener("input", locDanhSach);
    $("locTrangThai").addEventListener("change", locDanhSach);
    $("soLuongHienThi").addEventListener("change", hienThiDanhSach);

    modalElement.addEventListener("hidden.bs.modal", lamMoiForm);

    const today = new Date();
    $("todayDate").textContent = today.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    locDanhSach();
});
