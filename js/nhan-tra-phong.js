// ===== NHẬN / TRẢ PHÒNG - STAYFLOW =====

// Dữ liệu mẫu để xây dựng giao diện.
// Khi kết nối backend, thay dữ liệu này bằng dữ liệu từ API.

const initialBookings = [
    {
        id: 1,
        name: "Nguyễn Minh Anh",
        phone: "0901234567",
        room: "101",
        checkin: "2026-10-15",
        checkout: "2026-10-17",
        status: "waiting"
    },
    {
        id: 2,
        name: "Trần Hoàng Nam",
        phone: "0912345678",
        room: "102",
        checkin: "2026-10-15",
        checkout: "2026-10-16",
        status: "waiting"
    },
    {
        id: 3,
        name: "Lê Ngọc Hà",
        phone: "0933456789",
        room: "201",
        checkin: "2026-10-15",
        checkout: "2026-10-18",
        status: "waiting"
    },
    {
        id: 4,
        name: "Phạm Quốc Bảo",
        phone: "0944567890",
        room: "202",
        checkin: "2026-10-13",
        checkout: "2026-10-15",
        status: "checkout"
    },
    {
        id: 5,
        name: "Võ Thanh Tùng",
        phone: "0965678901",
        room: "301",
        checkin: "2026-10-12",
        checkout: "2026-10-16",
        status: "staying"
    },
    {
        id: 6,
        name: "Đặng Thu Trang",
        phone: "0976789012",
        room: "302",
        checkin: "2026-10-12",
        checkout: "2026-10-17",
        status: "staying"
    },
    {
        id: 7,
        name: "Bùi Đức Huy",
        phone: "0987890123",
        room: "103",
        checkin: "2026-10-11",
        checkout: "2026-10-15",
        status: "checkout"
    },
    {
        id: 8,
        name: "Ngô Phương Linh",
        phone: "0909876543",
        room: "203",
        checkin: "2026-10-14",
        checkout: "2026-10-19",
        status: "staying"
    },
    {
        id: 9,
        name: "Hoàng Gia Hân",
        phone: "0918765432",
        room: "303",
        checkin: "2026-10-10",
        checkout: "2026-10-14",
        status: "completed"
    },
    {
        id: 10,
        name: "Đỗ Thành Đạt",
        phone: "0927654321",
        room: "104",
        checkin: "2026-10-14",
        checkout: "2026-10-16",
        status: "staying"
    }
];

let bookings = initialBookings.map(item => ({ ...item }));
let pendingBookingId = null;
let pendingAction = null;
let confirmModal = null;
let toastTimer = null;

const statusLabels = {
    waiting: "Chờ nhận phòng",
    staying: "Đang lưu trú",
    checkout: "Chờ trả phòng",
    completed: "Đã trả phòng"
};

const statusClasses = {
    waiting: "status-waiting",
    staying: "status-staying",
    checkout: "status-checkout",
    completed: "status-completed"
};

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const tableBody = document.getElementById("bookingTableBody");
const confirmActionButton = document.getElementById("confirmAction");

// Khởi tạo trang
document.addEventListener("DOMContentLoaded", function () {
    const dateElement = document.getElementById("todayDate");

    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString("vi-VN", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

    const modalElement = document.getElementById("confirmModal");

    if (modalElement && window.bootstrap) {
        confirmModal = new bootstrap.Modal(modalElement);
    }

    renderBookings();
});

// Định dạng ngày tháng
function formatDate(dateString) {
    if (!dateString) return "—";

    const parts = dateString.split("-");

    if (parts.length !== 3) return dateString;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Lấy chữ viết tắt tên khách
function getInitials(name) {
    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (
        words[words.length - 2][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}

// Chống lỗi hiển thị ký tự HTML từ dữ liệu
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

// Cập nhật số liệu thống kê
function renderStatistics() {
    const waiting = bookings.filter(item => item.status === "waiting").length;
    const staying = bookings.filter(item => item.status === "staying").length;
    const checkout = bookings.filter(item => item.status === "checkout").length;

    document.getElementById("waitingCount").textContent = waiting;
    document.getElementById("stayingCount").textContent = staying;
    document.getElementById("checkoutCount").textContent = checkout;
}

// Hiển thị danh sách
function renderBookings() {
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    const filteredBookings = bookings.filter(item => {
        const matchesKeyword =
            item.name.toLowerCase().includes(keyword) ||
            item.phone.toLowerCase().includes(keyword) ||
            item.room.toLowerCase().includes(keyword);

        const matchesStatus =
            selectedStatus === "all" ||
            item.status === selectedStatus;

        return matchesKeyword && matchesStatus;
    });

    if (filteredBookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">
                    Không tìm thấy dữ liệu phù hợp.
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = filteredBookings.map(item => {
            let actionHTML = "";

            if (item.status === "waiting") {
                actionHTML = `
                    <button class="action-button action-checkin"
                            data-action="checkin"
                            data-id="${item.id}">
                        Nhận phòng
                    </button>
                `;
            } else if (
                item.status === "staying" ||
                item.status === "checkout"
            ) {
                actionHTML = `
                    <button class="action-button action-checkout"
                            data-action="checkout"
                            data-id="${item.id}">
                        Trả phòng
                    </button>
                `;
            } else {
                actionHTML = `
                    <button class="action-button action-done" disabled>
                        Hoàn tất
                    </button>
                `;
            }

            return `
                <tr>
                    <td>
                        <div class="customer-cell">
                            <div class="customer-avatar">
                                ${escapeHTML(getInitials(item.name))}
                            </div>
                            <div>
                                <div class="customer-name">
                                    ${escapeHTML(item.name)}
                                </div>
                                <div class="customer-phone">
                                    ${escapeHTML(item.phone)}
                                </div>
                            </div>
                        </div>
                    </td>

                    <td>
                        <span class="room-number">
                            ${escapeHTML(item.room)}
                        </span>
                    </td>

                    <td>${formatDate(item.checkin)}</td>
                    <td>${formatDate(item.checkout)}</td>

                    <td>
                        <span class="status-badge ${statusClasses[item.status]}">
                            ${statusLabels[item.status]}
                        </span>
                    </td>

                    <td>${actionHTML}</td>
                </tr>
            `;
        }).join("");
    }

    document.getElementById("resultCount").textContent =
        `Hiển thị ${filteredBookings.length} / ${bookings.length} bản ghi`;

    renderStatistics();
}

// Tìm kiếm
searchInput.addEventListener("input", renderBookings);

// Lọc trạng thái
statusFilter.addEventListener("change", renderBookings);

// Làm mới dữ liệu mẫu về ban đầu
document.getElementById("refreshBtn").addEventListener("click", function () {
    bookings = initialBookings.map(item => ({ ...item }));

    searchInput.value = "";
    statusFilter.value = "all";

    renderBookings();
    showToast("Đã làm mới danh sách dữ liệu mẫu.");
});

// Mở hộp thoại khi nhấn nhận phòng hoặc trả phòng
tableBody.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;
    const booking = bookings.find(item => item.id === id);

    if (!booking) return;

    // Không cho phép thực hiện sai trạng thái
    if (action === "checkin" && booking.status !== "waiting") {
        showToast("Khách này không ở trạng thái chờ nhận phòng.");
        return;
    }

    if (
        action === "checkout" &&
        !["staying", "checkout"].includes(booking.status)
    ) {
        showToast("Khách này không thể thực hiện trả phòng.");
        return;
    }

    pendingBookingId = id;
    pendingAction = action;

    document.getElementById("modalTitle").textContent =
        action === "checkin" ? "Xác nhận nhận phòng" : "Xác nhận trả phòng";

    document.getElementById("modalMessage").textContent =
        action === "checkin"
            ? "Bro có chắc muốn xác nhận khách hàng này nhận phòng không?"
            : "Bro có chắc muốn xác nhận khách hàng này đã trả phòng không?";

    document.getElementById("modalCustomer").innerHTML = `
        <strong>Khách hàng:</strong> ${escapeHTML(booking.name)}<br>
        <strong>Số phòng:</strong> ${escapeHTML(booking.room)}<br>
        <strong>Ngày nhận:</strong> ${formatDate(booking.checkin)}<br>
        <strong>Ngày trả dự kiến:</strong> ${formatDate(booking.checkout)}
    `;

    confirmActionButton.textContent =
        action === "checkin" ? "Xác nhận nhận phòng" : "Xác nhận trả phòng";

    if (confirmModal) {
        confirmModal.show();
    }
});

// Xác nhận thao tác
confirmActionButton.addEventListener("click", function () {
    const booking = bookings.find(item => item.id === pendingBookingId);

    if (!booking || !pendingAction) return;

    if (pendingAction === "checkin" && booking.status === "waiting") {
        booking.status = "staying";

        showToast(
            `Đã cập nhật trạng thái nhận phòng cho khách ${booking.name} trên giao diện mẫu.`
        );
    } else if (
        pendingAction === "checkout" &&
        ["staying", "checkout"].includes(booking.status)
    ) {
        booking.status = "completed";

        showToast(
            `Đã cập nhật trạng thái trả phòng cho khách ${booking.name} trên giao diện mẫu.`
        );
    } else {
        showToast("Trạng thái đã thay đổi. Vui lòng kiểm tra lại.");
    }

    pendingBookingId = null;
    pendingAction = null;

    if (confirmModal) {
        confirmModal.hide();
    }

    renderBookings();
});

// Hiển thị thông báo
function showToast(message) {
    const toast = document.getElementById("toastMessage");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}