
const initialCustomers = [
    {
        id: 1,
        name: "Nguyễn Minh Anh",
        identity: "079201001234",
        phone: "0901234567",
        email: "minhanh@example.com"
    },
    {
        id: 2,
        name: "Trần Hoàng Nam",
        identity: "079201002345",
        phone: "0912345678",
        email: "hoangnam@example.com"
    },
    {
        id: 3,
        name: "Lê Ngọc Hà",
        identity: "079201003456",
        phone: "0933456789",
        email: "ngoch a@example.com".replace(" ", "")
    },
    {
        id: 4,
        name: "Phạm Quốc Bảo",
        identity: "079201004567",
        phone: "0944567890",
        email: "quocbao@example.com"
    },
    {
        id: 5,
        name: "Võ Thanh Tùng",
        identity: "079201005678",
        phone: "0965678901",
        email: "thanhtung@example.com"
    }
];

let customers = initialCustomers.map(customer => ({ ...customer }));
let editingCustomerId = null;
let customerModal = null;
let toastTimer = null;

const customerForm = document.getElementById("customerForm");
const searchInput = document.getElementById("searchCustomer");
const tableBody = document.getElementById("customerTableBody");

document.addEventListener("DOMContentLoaded", function () {
    const dateElement = document.getElementById("todayDate");

    dateElement.textContent = new Date().toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    customerModal = new bootstrap.Modal(
        document.getElementById("customerModal")
    );

    renderCustomers();
});

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

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

function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

function renderStatistics() {
    document.getElementById("totalCustomers").textContent =
        customers.length;

    document.getElementById("emailCustomers").textContent =
        customers.filter(customer => customer.email.trim() !== "").length;

    document.getElementById("phoneCustomers").textContent =
        customers.filter(customer => customer.phone.trim() !== "").length;
}

function renderCustomers() {
    const keyword = normalize(searchInput.value);

    const filteredCustomers = customers.filter(customer =>
        normalize(customer.name).includes(keyword) ||
        normalize(customer.identity).includes(keyword) ||
        normalize(customer.phone).includes(keyword) ||
        normalize(customer.email).includes(keyword)
    );

    if (filteredCustomers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">
                    Không tìm thấy khách hàng phù hợp.
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = filteredCustomers.map(customer => `
            <tr>
                <td>
                    <div class="customer-profile">
                        <div class="customer-avatar">
                            ${escapeHTML(getInitials(customer.name))}
                        </div>
                        <div>
                            <div class="customer-fullname">
                                ${escapeHTML(customer.name)}
                            </div>
                            <div class="customer-id">
                                Mã khách hàng: KH${String(customer.id).padStart(3, "0")}
                            </div>
                        </div>
                    </div>
                </td>

                <td>${escapeHTML(customer.identity)}</td>
                <td>${escapeHTML(customer.phone)}</td>
                <td class="customer-email">
                    ${customer.email
                        ? escapeHTML(customer.email)
                        : '<span class="text-secondary">Chưa cập nhật</span>'}
                </td>

                <td>
                    <div class="customer-actions">
                        <button class="btn-edit"
                                data-action="edit"
                                data-id="${customer.id}">
                            Sửa
                        </button>

                        <button class="btn-delete"
                                data-action="delete"
                                data-id="${customer.id}">
                            Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");
    }

    document.getElementById("customerResultCount").textContent =
        `Hiển thị ${filteredCustomers.length} / ${customers.length} khách hàng`;

    renderStatistics();
}

// Mở form thêm khách hàng
document.getElementById("addCustomerBtn").addEventListener("click", function () {
    editingCustomerId = null;
    customerForm.reset();

    document.getElementById("customerModalTitle").textContent =
        "Thêm khách hàng";

    document.getElementById("saveCustomerBtn").textContent =
        "Lưu thông tin";

    customerModal.show();
});

// Tìm kiếm
searchInput.addEventListener("input", renderCustomers);

// Làm mới dữ liệu mẫu
document.getElementById("refreshBtn").addEventListener("click", function () {
    customers = initialCustomers.map(customer => ({ ...customer }));
    searchInput.value = "";

    renderCustomers();
    showToast("Đã khôi phục danh sách dữ liệu mẫu.");
});

// Xử lý nút sửa và xóa
tableBody.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;
    const customer = customers.find(item => item.id === id);

    if (!customer) return;

    if (action === "edit") {
        editingCustomerId = id;

        document.getElementById("customerModalTitle").textContent =
            "Chỉnh sửa khách hàng";

        document.getElementById("saveCustomerBtn").textContent =
            "Lưu thay đổi";

        document.getElementById("customerName").value = customer.name;
        document.getElementById("customerIdentity").value = customer.identity;
        document.getElementById("customerPhone").value = customer.phone;
        document.getElementById("customerEmail").value = customer.email;

        customerModal.show();
    }

    if (action === "delete") {
        const confirmed = confirm(
            `Bro có chắc muốn xóa khách hàng "${customer.name}" khỏi danh sách mẫu không?`
        );

        if (!confirmed) return;

        customers = customers.filter(item => item.id !== id);

        renderCustomers();
        showToast("Đã xóa khách hàng khỏi danh sách mẫu.");
    }
});

// Thêm hoặc cập nhật khách hàng
customerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const identity = document.getElementById("customerIdentity").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const email = document.getElementById("customerEmail").value.trim();

    if (!name || !identity || !phone) {
        showToast("Vui lòng nhập đầy đủ thông tin bắt buộc.");
        return;
    }

    if (!/^[0-9]{9,15}$/.test(phone)) {
        showToast("Số điện thoại phải có từ 9 đến 15 chữ số.");
        return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("Địa chỉ email chưa hợp lệ.");
        return;
    }

    // Kiểm tra trùng số giấy tờ
    const duplicateIdentity = customers.some(customer =>
        normalize(customer.identity) === normalize(identity) &&
        customer.id !== editingCustomerId
    );

    if (duplicateIdentity) {
        showToast("Số giấy tờ đã tồn tại trong danh sách.");
        return;
    }

    // Kiểm tra trùng số điện thoại
    const duplicatePhone = customers.some(customer =>
        customer.phone === phone &&
        customer.id !== editingCustomerId
    );

    if (duplicatePhone) {
        showToast("Số điện thoại đã tồn tại trong danh sách.");
        return;
    }

    // Kiểm tra trùng email nếu email được nhập
    if (email) {
        const duplicateEmail = customers.some(customer =>
            normalize(customer.email) === normalize(email) &&
            customer.id !== editingCustomerId
        );

        if (duplicateEmail) {
            showToast("Email đã tồn tại trong danh sách.");
            return;
        }
    }

    if (editingCustomerId !== null) {
        const index = customers.findIndex(
            customer => customer.id === editingCustomerId
        );

        if (index === -1) {
            showToast("Không tìm thấy khách hàng cần sửa.");
            return;
        }

        customers[index] = {
            ...customers[index],
            name,
            identity,
            phone,
            email
        };

        showToast("Đã cập nhật thông tin trên giao diện mẫu.");
    } else {
        const nextId = customers.length
            ? Math.max(...customers.map(customer => customer.id)) + 1
            : 1;

        customers.push({
            id: nextId,
            name,
            identity,
            phone,
            email
        });

        showToast("Đã thêm khách hàng vào danh sách mẫu.");
    }

    customerModal.hide();
    customerForm.reset();
    editingCustomerId = null;

    renderCustomers();
});

// Thông báo
function showToast(message) {
    const toast = document.getElementById("customerToast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}
