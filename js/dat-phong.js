const bookingForm = document.getElementById("bookingForm");
const confirmOverlay = document.getElementById("confirmOverlay");

const tenKhach = document.getElementById("tenKhach");
const soDienThoai = document.getElementById("soDienThoai");
const giayTo = document.getElementById("giayTo");
const emailKhach = document.getElementById("emailKhach");

const ngayNhan = document.getElementById("ngayNhan");
const ngayTra = document.getElementById("ngayTra");
const soNguoi = document.getElementById("soNguoi");

const moneyFormat = amount =>
    Number(amount).toLocaleString("vi-VN") + " ₫";

const dateFormat = value => {
    if (!value) return "--/--/----";

    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
};

function getSelectedRoom() {
    const selected = document.querySelector('input[name="phongChon"]:checked');

    if (!selected) return null;

    return {
        number: selected.value,
        price: Number(selected.dataset.price),
        capacity: Number(selected.dataset.capacity),
        card: selected.closest(".selectable-room"),
        name: selected.closest(".selectable-room")
            .querySelector(".selectable-room-top strong").textContent,
        type: selected.closest(".selectable-room")
            .querySelector(".selectable-room-type").textContent
    };
}

function getNights() {
    if (!ngayNhan.value || !ngayTra.value) return 0;

    const checkIn = new Date(ngayNhan.value + "T00:00:00");
    const checkOut = new Date(ngayTra.value + "T00:00:00");

    return Math.round((checkOut - checkIn) / 86400000);
}

function updateBookingSummary() {
    const room = getSelectedRoom();
    const nights = getNights();

    document.getElementById("summaryCheckIn").textContent =
        dateFormat(ngayNhan.value);

    document.getElementById("summaryCheckOut").textContent =
        dateFormat(ngayTra.value);

    document.getElementById("summaryNights").textContent =
        `${Math.max(0, nights)} đêm`;

    if (room) {
        document.getElementById("summaryRoomName").textContent = room.name;
        document.getElementById("summaryRoomType").textContent = room.type;
        document.getElementById("summaryPrice").textContent =
            moneyFormat(room.price);
    }

    const total = room && nights > 0 ? room.price * nights : 0;

    document.getElementById("summaryTotal").textContent =
        moneyFormat(total);
}

function setMinimumDates() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const todayString = `${year}-${month}-${day}`;

    ngayNhan.min = todayString;

    if (!ngayNhan.value) {
        ngayNhan.value = todayString;
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowString =
        `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    ngayTra.min = ngayNhan.value
        ? getNextDate(ngayNhan.value)
        : tomorrowString;

    if (!ngayTra.value || ngayTra.value <= ngayNhan.value) {
        ngayTra.value = ngayTra.min;
    }

    updateBookingSummary();
}

function getNextDate(dateString) {
    const date = new Date(dateString + "T00:00:00");
    date.setDate(date.getDate() + 1);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

ngayNhan.addEventListener("change", () => {
    ngayTra.min = getNextDate(ngayNhan.value);

    if (!ngayTra.value || ngayTra.value <= ngayNhan.value) {
        ngayTra.value = ngayTra.min;
    }

    updateBookingSummary();
});

ngayTra.addEventListener("change", updateBookingSummary);

soNguoi.addEventListener("change", () => {
    updateBookingSummary();
});

document.querySelectorAll('input[name="phongChon"]').forEach(input => {
    input.addEventListener("change", updateBookingSummary);
});

function validateBooking() {
    const room = getSelectedRoom();
    const nights = getNights();

    if (!tenKhach.value.trim()) {
        alert("Vui lòng nhập họ và tên khách hàng.");
        tenKhach.focus();
        return false;
    }

    if (!soDienThoai.value.trim()) {
        alert("Vui lòng nhập số điện thoại.");
        soDienThoai.focus();
        return false;
    }

    if (!/^[0-9+\s()-]{9,15}$/.test(soDienThoai.value.trim())) {
        alert("Số điện thoại chưa đúng định dạng.");
        soDienThoai.focus();
        return false;
    }

    if (!giayTo.value.trim()) {
        alert("Vui lòng nhập số giấy tờ tùy thân.");
        giayTo.focus();
        return false;
    }

    if (emailKhach.value.trim() && !emailKhach.checkValidity()) {
        alert("Email chưa đúng định dạng.");
        emailKhach.focus();
        return false;
    }

    if (!ngayNhan.value || !ngayTra.value || nights <= 0) {
        alert("Ngày trả phòng phải sau ngày nhận phòng.");
        ngayTra.focus();
        return false;
    }

    if (!room) {
        alert("Vui lòng chọn phòng.");
        return false;
    }

    if (Number(soNguoi.value) > room.capacity) {
        alert("Số người vượt quá sức chứa của phòng đã chọn.");
        return false;
    }

    return true;
}

bookingForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!validateBooking()) return;

    const room = getSelectedRoom();
    const nights = getNights();
    const total = room.price * nights;

    const details = [
        ["Khách hàng", tenKhach.value.trim()],
        ["Số điện thoại", soDienThoai.value.trim()],
        ["Số giấy tờ", giayTo.value.trim()],
        ["Phòng", room.name],
        ["Ngày nhận", dateFormat(ngayNhan.value)],
        ["Ngày trả", dateFormat(ngayTra.value)],
        ["Thời gian", `${nights} đêm`],
        ["Số người", `${soNguoi.value} người`],
        ["Tổng tiền dự kiến", moneyFormat(total)]
    ];

    const container = document.getElementById("confirmDetails");
    container.replaceChildren();

    details.forEach(([label, value]) => {
        const item = document.createElement("div");
        item.className = "confirm-detail-item";

        const labelElement = document.createElement("span");
        labelElement.textContent = label;

        const valueElement = document.createElement("strong");
        valueElement.textContent = value;

        item.append(labelElement, valueElement);
        container.appendChild(item);
    });

    confirmOverlay.hidden = false;

    document.getElementById("stepTwo").classList.add("active");
    document.getElementById("stepThree").classList.add("active");
});

document.getElementById("btnSuaDatPhong").addEventListener("click", () => {
    confirmOverlay.hidden = true;
});

document.getElementById("btnHoanTat").addEventListener("click", () => {
    alert(
        "Thông tin đã được kiểm tra trên giao diện mẫu. Chưa có dữ liệu đặt phòng nào được lưu vào cơ sở dữ liệu."
    );

    confirmOverlay.hidden = true;
});

confirmOverlay.addEventListener("click", event => {
    if (event.target === confirmOverlay) {
        confirmOverlay.hidden = true;
    }
});

setMinimumDates();