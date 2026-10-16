
document.addEventListener("DOMContentLoaded", function () {
    const STORAGE_KEY = "stayflow_hoa_don";

    const filterMonth = document.getElementById("filterMonth");
    const filterYear = document.getElementById("filterYear");
    const searchInput = document.getElementById("searchRevenue");
    const tableBody = document.getElementById("revenueTableBody");
    const chart = document.getElementById("revenueChart");

    const totalRevenueElement = document.getElementById("totalRevenue");
    const paidInvoiceCountElement = document.getElementById("paidInvoiceCount");
    const averageRevenueElement = document.getElementById("averageRevenue");
    const resultCountElement = document.getElementById("revenueResultCount");
    const chartSubtitle = document.getElementById("chartSubtitle");

    const currentYear = new Date().getFullYear();

    function getInvoices() {
        try {
            const rawData = localStorage.getItem(STORAGE_KEY);

            if (!rawData) {
                return [];
            }

            const data = JSON.parse(rawData);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Không thể đọc dữ liệu hóa đơn:", error);
            return [];
        }
    }

    function isPaid(invoice) {
        return String(invoice.trangThai || "").trim().toLowerCase()
            === "đã thanh toán";
    }

    function parseAmount(value) {
        if (typeof value === "number") {
            return Number.isFinite(value) ? value : 0;
        }

        if (typeof value !== "string") {
            return 0;
        }

        const cleaned = value.replace(/[^\d,-]/g, "").replace(/,/g, "");
        const amount = Number(cleaned);

        return Number.isFinite(amount) ? amount : 0;
    }

    function parseDate(value) {
        if (!value) {
            return null;
        }

        const text = String(value).trim();
        let match;

        // Hỗ trợ định dạng yyyy-mm-dd hoặc yyyy-mm-ddTHH:mm:ss
        match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

        if (match) {
            const date = new Date(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3])
            );

            return isNaN(date.getTime()) ? null : date;
        }

        // Hỗ trợ định dạng dd/mm/yyyy
        match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

        if (match) {
            const date = new Date(
                Number(match[3]),
                Number(match[2]) - 1,
                Number(match[1])
            );

            return isNaN(date.getTime()) ? null : date;
        }

        const date = new Date(text);
        return isNaN(date.getTime()) ? null : date;
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0
        }).format(amount);
    }

    function formatDate(value) {
        const date = parseDate(value);

        if (!date) {
            return "—";
        }

        return date.toLocaleDateString("vi-VN");
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
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

    function getPaidInvoices() {
        return getInvoices()
            .filter(isPaid)
            .map(function (invoice) {
                return {
                    ...invoice,
                    _amount: parseAmount(invoice.tongTien),
                    _date: parseDate(invoice.ngayLap)
                };
            })
            .filter(function (invoice) {
                return invoice._date !== null;
            });
    }

    function populateYears() {
        const invoices = getInvoices();
        const years = new Set([currentYear]);

        invoices.forEach(function (invoice) {
            const date = parseDate(invoice.ngayLap);

            if (date) {
                years.add(date.getFullYear());
            }
        });

        const sortedYears = Array.from(years).sort((a, b) => b - a);

        filterYear.innerHTML = sortedYears.map(function (year) {
            return `<option value="${year}">${year}</option>`;
        }).join("");

        filterYear.value = String(currentYear);
    }

    function getFilteredInvoices() {
        const selectedMonth = filterMonth.value;
        const selectedYear = Number(filterYear.value);
        const keyword = searchInput.value.trim().toLowerCase();

        return getPaidInvoices().filter(function (invoice) {
            const monthMatches =
                selectedMonth === "all" ||
                invoice._date.getMonth() + 1 === Number(selectedMonth);

            const yearMatches = invoice._date.getFullYear() === selectedYear;

            const searchableText = [
                invoice.ma,
                invoice.kh,
                invoice.khachHang,
                invoice.phong,
                invoice.phuongThuc
            ].join(" ").toLowerCase();

            return monthMatches && yearMatches && searchableText.includes(keyword);
        }).sort(function (a, b) {
            return b._date - a._date;
        });
    }

    function renderStats(invoices) {
        const total = invoices.reduce(function (sum, invoice) {
            return sum + invoice._amount;
        }, 0);

        const count = invoices.length;
        const average = count > 0 ? total / count : 0;

        totalRevenueElement.textContent = formatCurrency(total);
        paidInvoiceCountElement.textContent = count.toLocaleString("vi-VN");
        averageRevenueElement.textContent = formatCurrency(average);
    }

    function renderTable(invoices) {
        if (invoices.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <div style="color:#8490a2;font-weight:600;">
                            Chưa có hóa đơn đã thanh toán phù hợp.
                        </div>
                        <div style="color:#9aa5b4;font-size:11px;margin-top:6px;">
                            Thử đổi bộ lọc hoặc kiểm tra trạng thái hóa đơn.
                        </div>
                    </td>
                </tr>
            `;

            resultCountElement.textContent = "0 hóa đơn";
            return;
        }

        tableBody.innerHTML = invoices.map(function (invoice) {
            const invoiceCode = invoice.ma || invoice.maHD || "—";
            const customer = invoice.khachHang || invoice.kh || "—";
            const room = invoice.phong || "—";
            const payment = invoice.phuongThuc || "—";

            return `
                <tr>
                    <td>
                        <span class="revenue-invoice-code">
                            ${escapeHTML(invoiceCode)}
                        </span>
                    </td>
                    <td>
                        <span class="revenue-customer-name">
                            ${escapeHTML(customer)}
                        </span>
                    </td>
                    <td>${escapeHTML(room)}</td>
                    <td>${escapeHTML(formatDate(invoice.ngayLap))}</td>
                    <td>${escapeHTML(payment)}</td>
                    <td class="text-end revenue-amount">
                        ${escapeHTML(formatCurrency(invoice._amount))}
                    </td>
                    <td>
                        <span class="revenue-paid-badge">Đã thanh toán</span>
                    </td>
                </tr>
            `;
        }).join("");

        resultCountElement.textContent =
            `${invoices.length.toLocaleString("vi-VN")} hóa đơn`;
    }

    function renderChart() {
        const selectedMonth = filterMonth.value;
        const selectedYear = Number(filterYear.value);
        const paidInvoices = getPaidInvoices().filter(function (invoice) {
            return invoice._date.getFullYear() === selectedYear;
        });

        let monthNumbers;

        if (selectedMonth === "all") {
            monthNumbers = Array.from({ length: 12 }, (_, index) => index + 1);
            chartSubtitle.textContent = `Doanh thu từng tháng trong năm ${selectedYear}`;
        } else {
            monthNumbers = [Number(selectedMonth)];
            chartSubtitle.textContent =
                `Doanh thu tháng ${selectedMonth}/${selectedYear}`;
        }

        const monthlyTotals = monthNumbers.map(function (month) {
            const total = paidInvoices
                .filter(function (invoice) {
                    return invoice._date.getMonth() + 1 === month;
                })
                .reduce(function (sum, invoice) {
                    return sum + invoice._amount;
                }, 0);

            return { month, total };
        });

        const maxTotal = Math.max(...monthlyTotals.map(item => item.total), 0);

        chart.innerHTML = monthlyTotals.map(function (item) {
            const height = maxTotal > 0
                ? (item.total / maxTotal) * 100
                : 0;

            const displayValue = item.total > 0
                ? formatCompactCurrency(item.total)
                : "0";

            return `
                <div class="revenue-chart-column"
                     title="Tháng ${item.month}: ${escapeHTML(formatCurrency(item.total))}">
                    <div class="revenue-chart-value">${escapeHTML(displayValue)}</div>
                    <div class="revenue-chart-track">
                        <div class="revenue-chart-bar"
                             style="height:${height}%;"></div>
                    </div>
                    <div class="revenue-chart-month">T${item.month}</div>
                </div>
            `;
        }).join("");
    }

    function formatCompactCurrency(amount) {
        if (amount >= 1000000000) {
            return (amount / 1000000000).toLocaleString("vi-VN", {
                maximumFractionDigits: 1
            }) + " tỷ";
        }

        if (amount >= 1000000) {
            return (amount / 1000000).toLocaleString("vi-VN", {
                maximumFractionDigits: 1
            }) + " tr";
        }

        if (amount >= 1000) {
            return (amount / 1000).toLocaleString("vi-VN", {
                maximumFractionDigits: 0
            }) + " k";
        }

        return amount.toLocaleString("vi-VN");
    }

    function renderAll() {
        const invoices = getFilteredInvoices();

        renderStats(invoices);
        renderTable(invoices);
        renderChart();
    }

    function exportCSV() {
        const invoices = getFilteredInvoices();

        if (invoices.length === 0) {
            alert("Không có dữ liệu doanh thu để xuất.");
            return;
        }

        const headers = [
            "Mã hóa đơn",
            "Khách hàng",
            "Phòng",
            "Ngày lập",
            "Phương thức thanh toán",
            "Tổng tiền",
            "Trạng thái"
        ];

        const rows = invoices.map(function (invoice) {
            return [
                invoice.ma || invoice.maHD || "",
                invoice.khachHang || invoice.kh || "",
                invoice.phong || "",
                formatDate(invoice.ngayLap),
                invoice.phuongThuc || "",
                invoice._amount,
                "Đã thanh toán"
            ];
        });

        function csvCell(value) {
            let text = String(value ?? "");

            // Tránh dữ liệu bắt đầu bằng ký tự công thức trong Excel.
            if (/^[=+\-@]/.test(text)) {
                text = "'" + text;
            }

            return '"' + text.replace(/"/g, '""') + '"';
        }

        const csvContent = [headers, ...rows]
            .map(row => row.map(csvCell).join(","))
            .join("\r\n");

        const blob = new Blob(["\uFEFF" + csvContent], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `bao-cao-doanh-thu-${filterYear.value}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }

    filterMonth.addEventListener("change", renderAll);
    filterYear.addEventListener("change", renderAll);
    searchInput.addEventListener("input", renderAll);

    document.getElementById("resetRevenueFilter").addEventListener("click", function () {
        filterMonth.value = "all";
        filterYear.value = String(currentYear);
        searchInput.value = "";
        renderAll();
    });

    document.getElementById("exportRevenueBtn").addEventListener("click", exportCSV);

    populateYears();
    renderAll();

    // Cập nhật khi quay lại trang sau khi chỉnh sửa hóa đơn ở tab khác.
    window.addEventListener("storage", function (event) {
        if (event.key === STORAGE_KEY) {
            populateYears();
            renderAll();
        }
    });
});
