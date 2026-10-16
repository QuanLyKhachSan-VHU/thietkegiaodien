
// Hiển thị ngày hiện tại theo định dạng Việt Nam
const todayDate = document.getElementById("todayDate");

if (todayDate) {
    todayDate.textContent = new Intl.DateTimeFormat("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(new Date());
}
