$(document).ready(async function () {

  /* ─────────────── GLOBAL VARIABLES ─────────────── */
  let allOrders = [];          // All orders loaded for the month
  let filteredOrders = [];     // Orders after search/filter
  const rowsPerPage = 25;
  let currentPage = 1;
  let currentMonth = null;
  let currentYear = null;

  let role = localStorage.getItem("role");
  let team = localStorage.getItem("team");
  let firstName = localStorage.getItem("firstName");

  // ✅ Redirect if not logged in
  if (!firstName) {
    window.location.href = "login_signup.html";
  } else {
    $("#user-name").text(firstName);
  }

  /* ─────────────── FLATPICKR DATE PICKER ─────────────── */
  const fp = flatpickr("#unifiedDatePicker", {
    mode: "range",
    dateFormat: "Y-m-d",
    allowInput: true,
    onOpen: () => $(".table-wrapper").addClass("table-blur"),
    onClose: () => $(".table-wrapper").removeClass("table-blur"),
    onReady: function (selectedDates, dateStr, instance) {
      if (instance.calendarContainer.querySelector(".custom-shortcuts")) return;

      const container = document.createElement("div");
      container.className = "custom-shortcuts";
      Object.assign(container.style, {
        display: "flex",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: "10px",
        marginTop: "0px",
        padding: "0 10px"
      });

      const momentTz = moment().tz("America/Chicago");

      function makeLink(label, handler) {
        const link = document.createElement("a");
        link.href = "#";
        link.innerText = label;
        Object.assign(link.style, { margin: "2px 5px", fontSize: "13px", color: "#007BFF", cursor: "pointer" });
        link.addEventListener("click", (e) => { e.preventDefault(); handler(); });
        return link;
      }

      // Today shortcut
      const todayBtn = makeLink("Today", () => {
        const today = momentTz.format("YYYY-MM-DD");
        fp.setDate([today, today], true);
        $("#unifiedDatePicker").val(`${today} to ${today}`);
        $("#filterButton").click();
        instance.close();
      });

      // This Month shortcut
      const thisMonthBtn = makeLink("This Month", () => {
        const start = momentTz.clone().startOf("month").format("YYYY-MM-DD");
        const end = momentTz.clone().endOf("month").format("YYYY-MM-DD");
        fp.setDate([start, end], true);
        $("#unifiedDatePicker").val(`${start} to ${end}`);
        $("#filterButton").click();
        instance.close();
      });

      // Last 3 months
      for (let i = 1; i <= 3; i++) {
        const monthMoment = momentTz.clone().subtract(i, "months");
        const monthName = monthMoment.format("MMMM");
        const start = monthMoment.startOf("month").format("YYYY-MM-DD");
        const end = monthMoment.endOf("month").format("YYYY-MM-DD");
        const monthBtn = makeLink(monthName, () => {
          fp.setDate([start, end], true);
          $("#unifiedDatePicker").val(`${start} to ${end}`);
          $("#filterButton").click();
          instance.close();
        });
        container.appendChild(monthBtn);
      }

      container.prepend(thisMonthBtn);
      container.prepend(todayBtn);
      instance.calendarContainer.appendChild(container);
    }
  });

  /* ─────────────── RENDER TABLE ROWS ─────────────── */
  function renderTableRows(page) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const ordersForPage = filteredOrders.slice(start, end);

    const tbody = $("#infoTable");
    tbody.empty();

    ordersForPage.forEach((item) => {
      const rowHTML = `
        <tr>
          <td>${item.orderDate}</td>
          <td>${item.orderNo}</td>
          <td>${item.salesAgent}</td>
          <td>${item.customerName || ""}</td>
          <td>${item.make} ${item.model}</td>
          <td>${item.orderStatus}</td>
          <td>$${item.soldP}</td>
          <td>
            <button class="btn process-btn" data-id="${item.orderNo}">View</button>
          </td>
        </tr>`;
      tbody.append(rowHTML);
    });
  }

  /* ─────────────── PAGINATION UI ─────────────── */
  function createPaginationControls(totalPages) {
    const paginationControls = $('#pagination-controls');
    paginationControls.empty();
    if (totalPages > 1) {
      paginationControls.append(`<button class="previousNext" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>←</button>`);
      paginationControls.append(`<span class="page-info">Page ${currentPage} of ${totalPages}</span>`);
      paginationControls.append(`<button class="previousNext" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>→</button>`);
    }
  }

  /* ─────────────── FETCH ORDERS ─────────────── */
  async function fetchOrdersForSelectedMonth(monthYear) {
    const [year, month] = monthYear.split("-");
    currentMonth = month;
    currentYear = year;

    $("#loadingMessage").show();
    try {
      const response = await axios.get("https://www.spotops360.com/orders/monthly", {
        params: { month, year, page: 1, limit: 9999 }, // ✅ fetch ALL rows for search/filter
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      allOrders = response.data.orders;
      filteredOrders = [...allOrders];

      document.getElementById("showTotalOrders").innerHTML = `Total Orders - ${allOrders.length}`;
      currentPage = 1;
      renderTableRows(currentPage);
      createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage));

    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      $("#loadingMessage").hide();
    }
  }

  /* ─────────────── SEARCH (works across ALL pages) ─────────────── */
  $("#searchInput").on("keyup", function () {
    const value = $(this).val().toLowerCase();
    if (!value) {
      filteredOrders = [...allOrders];
    } else {
      filteredOrders = allOrders.filter(order =>
        (order.orderNo && order.orderNo.toLowerCase().includes(value)) ||
        (order.customerName && order.customerName.toLowerCase().includes(value)) ||
        (order.salesAgent && order.salesAgent.toLowerCase().includes(value)) ||
        (order.make && order.make.toLowerCase().includes(value)) ||
        (order.model && order.model.toLowerCase().includes(value))
      );
    }
    currentPage = 1;
    renderTableRows(currentPage);
    createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage));
  });

  /* ─────────────── INITIAL LOAD ─────────────── */
  const now = new Date();
  const month = now.toLocaleString("default", { month: "2-digit" });
  const year = now.getFullYear();
  await fetchOrdersForSelectedMonth(`${year}-${month}`);

  /* ─────────────── PAGINATION CLICK HANDLERS ─────────────── */
  $('#pagination-controls').on('click', '#prevPage', function () {
    if (currentPage > 1) {
      currentPage--;
      renderTableRows(currentPage);
      createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage));
    }
  });

  $('#pagination-controls').on('click', '#nextPage', function () {
    if (currentPage < Math.ceil(filteredOrders.length / rowsPerPage)) {
      currentPage++;
      renderTableRows(currentPage);
      createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage));
    }
  });

  /* ─────────────── CSV EXPORT (ALL DATA) ─────────────── */
  $("#downloadCsv").on("click", function () {
    let csvContent = "Order Date,Order No,Agent,Customer,Make-Model,Status,Sale Price\n";
    allOrders.forEach(order => {
      csvContent += `${order.orderDate},${order.orderNo},${order.salesAgent},${order.customerName || ""},${order.make} ${order.model},${order.orderStatus},${order.soldP}\n`;
    });

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", "orders.csv");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  });

  /* ─────────────── DARK MODE ─────────────── */
  if (localStorage.getItem("darkMode") === "true") enableDarkMode();

  $("#darkModeIcon").on("click", function () {
    if ($("body").hasClass("dark-mode")) disableDarkMode();
    else enableDarkMode();
  });

  function enableDarkMode() {
    $("body,.navbar,.sidebar,table").addClass("dark-mode");
    $("#darkModeIcon").removeClass("fa-moon").addClass("fa-sun");
    localStorage.setItem("darkMode", "true");
  }

  function disableDarkMode() {
    $("body,.navbar,.sidebar,table").removeClass("dark-mode");
    $("#darkModeIcon").removeClass("fa-sun").addClass("fa-moon");
    localStorage.setItem("darkMode", "false");
  }

  /* ─────────────── NOTIFICATIONS ─────────────── */
  const notificationIcon = $("#notificationIcon");
  const notificationDropdown = $("#notificationDropdown");
  const notificationList = $("#notificationList");
  const notificationCountElement = $("#notificationCount");

  async function fetchNotifications() {
    try {
      const response = await axios.get("https://www.spotops360.com/notifications");
      const notifications = response.data;

      const unread = notifications.filter(n => !n.readBy.includes(firstName));
      notificationCountElement.text(unread.length > 0 ? unread.length : "");
      notificationCountElement.toggle(unread.length > 0);

      renderNotifications(notifications);
    } catch (e) {
      console.error("Notification fetch failed", e);
    }
  }

  function renderNotifications(notifications) {
    notificationList.empty();
    const lastFive = notifications.slice(-5);

    if (lastFive.length === 0) {
      notificationList.append(`<li style="padding:10px;">No notifications</li>`);
      return;
    }

    lastFive.forEach(n => {
      notificationList.append(`<li style="padding:10px;border-bottom:1px solid #ddd;">${n.message}</li>`);
    });
  }

  notificationIcon.on("click", async function () {
    notificationDropdown.toggle();
    if (notificationDropdown.is(":visible")) await fetchNotifications();
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest("#notificationIcon").length && !$(e.target).closest("#notificationDropdown").length) {
      notificationDropdown.hide();
    }
  });

});
