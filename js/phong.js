const roomGrid = document.getElementById("roomGrid");
const roomForm = document.getElementById("roomForm");
const roomModal = document.getElementById("roomModal");
const detailModal = document.getElementById("detailModal");

const timPhong = document.getElementById("timPhong");
const locTrangThai = document.getElementById("locTrangThai");
const locLoaiPhong = document.getElementById("locLoaiPhong");

let selectedRoomNumber = null;

const statusLabels = {
    SAN_SANG: "Phòng trống",
    DANG_SU_DUNG: "Đang sử dụng",
    DA_DAT: "Đã đặt",
    BAO_TRI: "Bảo trì"
};

const statusClasses = {
    SAN_SANG: "status-green",
    DANG_SU_DUNG: "status-orange",
    DA_DAT: "status-blue",
    BAO_TRI: "status-red"
};

function getRooms() {
    return Array.from(roomGrid.querySelectorAll(".room-card"));
}

function updateRoomStats() {
    const rooms = getRooms();

    document.getElementById("tongPhong").textContent = rooms.length;
    document.getElementById("phongTrong").textContent =
        rooms.filter(room => room.dataset.status === "SAN_SANG").length;
    document.getElementById("phongDangDung").textContent =
        rooms.filter(room => room.dataset.status === "DANG_SU_DUNG").length;
    document.getElementById("phongDaDat").textContent =
        rooms.filter(room => room.dataset.status === "DA_DAT").length;
}

function filterRooms() {
    const keyword = timPhong.value.trim().toLowerCase();
    const status = locTrangThai.value;
    const type = locLoaiPhong.value;

    let visibleCount = 0;

    getRooms().forEach(room => {
        const matchesNumber =
            room.dataset.room.toLowerCase().includes(keyword);

        const matchesStatus =
            !status || room.dataset.status === status;

        const matchesType =
            !type || room.dataset.type === type;

        const visible = matchesNumber && matchesStatus && matchesType;

        room.hidden = !visible;

        if (visible) visibleCount++;
    });

    document.getElementById("roomEmpty").hidden = visibleCount !== 0;
}

function openRoomModal(room = null) {
    roomForm.reset();

    document.getElementById("maPhongCu").value = room
        ? room.dataset.room
        : "";

    document.getElementById("modalTitle").textContent = room
        ? "Sửa thông tin phòng"
        : "Thêm phòng mới";

    if (room) {
        document.getElementById("soPhong").value = room.dataset.room;
        document.getElementById("loaiPhong").value = room.dataset.type;
        document.getElementById("tangPhong").value =
            room.querySelector(".room-type").textContent.match(/Tầng (\d+)/)?.[1] || 1;

        document.getElementById("giaPhong").value =
            room.querySelector(".room-price").textContent
                .replace(/[^\d]/g, "");

        document.getElementById("trangThaiPhong").value = room.dataset.status;
    }

    roomModal.hidden = false;
    document.getElementById("soPhong").focus();
}

function closeRoomModal() {
    roomModal.hidden = true;
}

function closeDetailModal() {
    detailModal.hidden = true;
}

function createRoomCard(data) {
    const room = document.createElement("article");
    room.className = "room-card";

    room.dataset.room = data.number;
    room.dataset.status = data.status;
    room.dataset.type = data.type;

    const floor = Number(data.floor);
    const capacity = data.type === "Phòng đơn"
        ? "1–2 người"
        : data.type === "Phòng đôi"
            ? "2–3 người"
            : "2–4 người";

    const illustrationClass = {
        SAN_SANG: "room-blue",
        DANG_SU_DUNG: "room-orange",
        DA_DAT: "room-purple",
        BAO_TRI: "room-gray"
    }[data.status];

    room.innerHTML = `
        <div class="room-card-top">
            <span class="room-number"></span>
            <span class="status-badge"></span>
        </div>

        <div class="room-illustration ${illustrationClass}">▤</div>

        <div class="room-type"></div>

        <div class="room-price">
            <span class="price-value"></span>
            <small>/ đêm</small>
        </div>

        <div class="room-card-bottom">
            <span class="room-capacity"></span>
            <button class="btn-room-detail" type="button">Chi tiết →</button>
        </div>
    `;

    room.querySelector(".room-number").textContent = `Phòng ${data.number}`;

    const badge = room.querySelector(".status-badge");
    badge.className = `status-badge ${statusClasses[data.status]}`;
    badge.textContent = statusLabels[data.status];

    room.querySelector(".room-type").textContent = `${data.type} · Tầng ${floor}`;

    room.querySelector(".price-value").textContent =
        Number(data.price).toLocaleString("vi-VN") + " ₫";

    room.querySelector(".room-capacity").textContent = `♙ ${capacity}`;

    room.querySelector(".btn-room-detail").dataset.detail = data.number;

    return room;
}

roomForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const oldNumber = document.getElementById("maPhongCu").value;
    const number = document.getElementById("soPhong").value.trim();
    const type = document.getElementById("loaiPhong").value;
    const floor = document.getElementById("tangPhong").value;
    const price = document.getElementById("giaPhong").value;
    const status = document.getElementById("trangThaiPhong").value;

    const duplicate = getRooms().some(room =>
        room.dataset.room === number && room.dataset.room !== oldNumber
    );

    if (duplicate) {
        alert("Số phòng này đã tồn tại. Vui lòng nhập số phòng khác.");
        return;
    }

    if (!number || !type || !floor || price === "" || Number(price) < 0) {
        alert("Vui lòng kiểm tra lại thông tin phòng.");
        return;
    }

    const data = { number, type, floor, price, status };

    if (oldNumber) {
        const oldRoom = getRooms().find(room => room.dataset.room === oldNumber);

        if (oldRoom) {
            oldRoom.replaceWith(createRoomCard(data));
        }
    } else {
        roomGrid.appendChild(createRoomCard(data));
    }

    closeRoomModal();
    updateRoomStats();
    filterRooms();

    alert(oldNumber
        ? "Đã cập nhật thông tin phòng mẫu."
        : "Đã thêm phòng mẫu thành công.");
});

document.getElementById("btnThemPhong").addEventListener("click", () => {
    openRoomModal();
});

document.getElementById("btnDongModal").addEventListener("click", closeRoomModal);
document.getElementById("btnHuyPhong").addEventListener("click", closeRoomModal);
document.getElementById("btnDongChiTiet").addEventListener("click", closeDetailModal);

roomModal.addEventListener("click", event => {
    if (event.target === roomModal) closeRoomModal();
});

detailModal.addEventListener("click", event => {
    if (event.target === detailModal) closeDetailModal();
});

roomGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-detail]");

    if (!button) return;

    const number = button.dataset.detail;
    const room = getRooms().find(item => item.dataset.room === number);

    if (!room) return;

    selectedRoomNumber = number;

    document.getElementById("detailTitle").textContent = `Phòng ${number}`;

    const roomType = room.querySelector(".room-type").textContent;
    const price = room.querySelector(".room-price .price-value")?.textContent
        || room.querySelector(".room-price").textContent.trim();
    const status = statusLabels[room.dataset.status];

    const details = [
        ["Số phòng", number],
        ["Loại phòng", roomType],
        ["Giá mỗi đêm", price],
        ["Trạng thái", status]
    ];

    const container = document.getElementById("detailContent");
    container.replaceChildren();

    details.forEach(([label, value]) => {
        const item = document.createElement("div");
        item.className = "detail-item";

        const title = document.createElement("span");
        title.textContent = label;

        const content = document.createElement("strong");
        content.textContent = value;

        item.append(title, content);
        container.appendChild(item);
    });

    detailModal.hidden = false;
});

document.getElementById("btnSuaPhong").addEventListener("click", () => {
    const room = getRooms().find(item => item.dataset.room === selectedRoomNumber);

    closeDetailModal();

    if (room) openRoomModal(room);
});

document.getElementById("btnXoaPhong").addEventListener("click", () => {
    const room = getRooms().find(item => item.dataset.room === selectedRoomNumber);

    if (!room) return;

    if (room.dataset.status === "DANG_SU_DUNG" || room.dataset.status === "DA_DAT") {
        alert("Không thể xóa phòng đang sử dụng hoặc đã có đặt phòng. Hãy kiểm tra thông tin đặt phòng trước.");
        return;
    }

    const confirmed = confirm(
        `Bro có chắc muốn xóa phòng ${selectedRoomNumber} khỏi danh sách mẫu không?`
    );

    if (!confirmed) return;

    room.remove();
    closeDetailModal();
    updateRoomStats();
    filterRooms();
});

timPhong.addEventListener("input", filterRooms);
locTrangThai.addEventListener("change", filterRooms);
locLoaiPhong.addEventListener("change", filterRooms);

updateRoomStats();
filterRooms();