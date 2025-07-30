$(document).ready(async function () {
  // ✅ Ensure token is declared early
  let token = null;

  $("#viewAlltasks").on("click", function () {
    window.location.href = "viewAllTasks.html";
  });

  // flatpickr setup
  const fp = flatpickr("#unifiedDatePicker", {
    mode: "range",
    dateFormat: "Y-m-d",
    allowInput: true,
    onOpen: function () {
      document.querySelector(".table-wrapper").classList.add("table-blur");
    },
    onClose: function () {
      document.querySelector(".table-wrapper").classList.remove("table-blur");
    },
    onReady: function (selectedDates, dateStr, instance) {
      if (instance.calendarContainer.querySelector(".custom-shortcuts")) return;

      const container = document.createElement("div");
      container.className = "custom-shortcuts";
      container.style.display = "flex";
      container.style.justifyContent = "flex-end";
      container.style.flexWrap = "wrap";
      container.style.gap = "10px";
      container.style.marginTop = "0px";
      container.style.padding = "0 10px";

      const momentTz = moment().tz("America/Chicago");

      const todayBtn = makeLink("Today", () => {
        const today = momentTz.format("YYYY-MM-DD");
        fp.setDate([today, today], true);
        $("#unifiedDatePicker").val(`${today} to ${today}`);
        $("#filterButton").data("filter", "today").click();
        instance.close();
      });

      const thisMonthBtn = makeLink("This Month", () => {
        const start = momentTz.clone().startOf("month").format("YYYY-MM-DD");
        const end = momentTz.clone().endOf("month").format("YYYY-MM-DD");
        fp.setDate([start, end], true);
        $("#unifiedDatePicker").val(`${start} to ${end}`);
        $("#filterButton").click();
        instance.close();
      });

      // Generate last 3 months dynamically
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

      // Utility to make a styled link
      function makeLink(label, handler) {
        const link = document.createElement("a");
        link.href = "#";
        link.innerText = label;
        link.className = "shortcut-link";
        link.style.margin = "2px 5px";
        link.style.fontSize = "13px";
        link.style.color = "#007BFF";
        link.style.cursor = "pointer";
        link.addEventListener("click", (e) => {
          e.preventDefault();
          handler();
        });
        return link;
      }
    }
  });
  // flatpickr setup till here

  // Pagination related variables
  let allOrders = [];
  const rowsPerPage = 25;
  let currentPage = 1;
  let currentMonth = null;
  let currentYear = null;

  // Function to render rows based on the page
  function renderTableRows(page, orders = allOrders) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const ordersForPage = orders.slice(start, end);

    const tbody = $("#infoTable");
    tbody.empty();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const suffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    ordersForPage.forEach((item) => {
      const date = new Date(item.orderDate);
      const formattedDate = `${date.getUTCDate()}${suffix(date.getUTCDate())} ${monthNames[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;

      const escalationStatus = item.additionalInfo?.[0]?.escTicked === "Yes" ? "Yes" : "";
      const escalationStyle = (item.orderStatus === "Order Fulfilled" && escalationStatus === "Yes")
        ? 'style="background-color: #c6fbd6;"color: white""'
        : "";

      const yardInfo = item.additionalInfo?.map((info, index) => `
        <b>Yard ${index + 1}</b>: ${info.yardName}<br>
        ${info.email} | ${info.phone}<br>
        Status: <b>${info.status}</b> | Stock No.: ${info.stockNo || ""}<br>
        Part price: $${info.partPrice} ${info.shippingDetails || ""} Others: $${info.others || 0}<br>
        ${info.paymentStatus || ""} Refunds: ${info.refundedAmount || 0}
      `).join("<br>") || "";

      const editButton = (role === "Support" || role === "Sales")
        ? ""
        : `<button class="btn edit-btn" data-id="${item.orderNo}">Edit</button>`;

      const processBtnDisabled = ["Placed", "Customer approved"].includes(item.orderStatus) ? "disabled" : "";

      const currentGP = calculateCurrentGP(item);

      const customerName = item.fName && item.lName
        ? `${item.fName} ${item.lName}`
        : item.customerName || "";

      const partRequired = item.pReq || item.partName;
      const programmingRequired = (item.programmingRequired === true || item.programmingRequired === "true")
        ? `Yes ($${item.programmingCostQuoted})` : "No";

      const rowHTML = `
        <tr>
          <td>${formattedDate}</td>
          <td>${item.orderNo}</td>
          <td>${item.salesAgent}</td>
          <td>
            Customer Name: ${customerName}<br>
            ${item.attention ? `<b>Attention</b>: ${item.attention}<br>` : ""}
            ${item.sAddress || ""} ${item.sAddressStreet || ""},<br>
            ${item.sAddressCity || ""}, ${item.sAddressState || ""},<br>
            ${item.sAddressZip || ""}, ${item.sAddressAcountry || ""}<br>
            Phone: ${item.phone} | Email: ${item.email}
          </td>
          <td>Year: ${item.year} | Make: ${item.make} | Model: ${item.model}</br>
  Part Description: ${item.desc}</br>
  Part No: ${item.partNo} | VIN: ${item.vin}</br>
  Warranty: ${item.warranty} days | ${item.programmingRequired === "true" ? `Programming required: ${item.programmingRequired}</br>` : ""}
  </td>
          <td>${yardInfo}</td>
          <td>${item.orderStatus}</td>
          <td>$${item.soldP}</td>
          <td>$${item.grossProfit}</td>
          <td>$${currentGP.toFixed(2)}</td>
          <td>$${item.actualGP ? item.actualGP.toFixed(2) : 0}</td>
          <td ${escalationStyle}>${escalationStatus}</td>
          <td>
            ${editButton}
            <button class="btn  process-btn" data-id="${item.orderNo}" ${processBtnDisabled}>View</button>
          </td>
        </tr>
      `;

      tbody.append(rowHTML);
    });
  }

  function calculateCurrentGP(item) {
    let totalYardSpent = 0;

    (item.additionalInfo || []).forEach(info => {
      const yardPP = parseFloat(info.partPrice) || 0;
      const shippingValue = (info.shippingDetails?.match(/:\s*(\d+(\.\d+)?)/) || [])[1] || 0;
      const others = parseFloat(info.others) || 0;
      const refunded = parseFloat(info.refundedAmount) || 0;
      const escReturn = parseFloat(info.custOwnShippingReturn) || 0;
      const escReplace = parseFloat(info.custOwnShipReplacement) || 0;
      const yardReplace = parseFloat(info.yardOwnShipping) || 0;

      const include = info.status !== "PO cancelled" || (info.status === "PO cancelled" && info.paymentStatus === "Card charged");
      if (include) {
        totalYardSpent += yardPP + parseFloat(shippingValue) + others + escReturn + escReplace + yardReplace - refunded;
      }
    });

    const spMinusTax = (parseFloat(item.soldP) || 0) - (parseFloat(item.salestax) || 0);
    const refund = parseFloat(item.custRefundedAmount) || 0;

    return spMinusTax - refund - totalYardSpent;
  }

  // 🔥 🔥 🔥 TOKEN FIX 🔥 🔥 🔥
  async function fetchToken() {
    try {
      const response = await axios.get(`https://www.spotops360.com/auth/token/${localStorage.getItem("userId")}`);
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        token = response.data.token;
      } else {
        throw new Error("Failed to fetch token");
      }
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  }

  token = localStorage.getItem("token");
  if (!token) {
    await fetchToken();
    token = localStorage.getItem("token");
  }
    // ✅ Continue setup after token initialization
  const now = new Date();
  const options = {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(now);
  const formattedDate = `${parts[4].value}-${parts[0].value}-${parts[2].value} ${parts[6].value}:${parts[8].value}:${parts[10].value}`;
  const date = new Date(formattedDate);

  // Month utilities
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const monthMap = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04",
    May: "05", Jun: "06", Jul: "07", Aug: "08",
    Sep: "09", Oct: "10", Nov: "11", Dec: "12"
  };
  var monthNum = monthMap[month];

  $("#monthYearPicker").val(`${year}-${monthNum}`);
  console.log("month", month, "year", year);

  // Pagination controls
  function createPaginationControls(totalPages) {
    const paginationControls = $('#pagination-controls');
    paginationControls.empty();
    if (totalPages > 1) {
      paginationControls.append(`
        <button class="previousNext" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>←</button>
      `);
      paginationControls.append(`
        <span class="page-info">Page ${currentPage} of ${totalPages}</span>
      `);
      paginationControls.append(`
        <button class="previousNext" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>→</button>
      `);
    }
  }

  // ✅ Fetch a specific page dynamically
  async function fetchPage(page) {
    $("#loadingMessage").show();
    try {
      const response = await axios.get("https://www.spotops360.com/orders/monthly", {
        params: {
          month: currentMonth,
          year: currentYear,
          page,
          limit: 25,
          role: role,
          team: team
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      allOrders = response.data.orders;
      renderTableRows(page, allOrders);
      createPaginationControls(Math.ceil(response.data.totalCount / 25));
    } catch (error) {
      console.error("Error fetching page", error);
    } finally {
      $("#loadingMessage").hide();
    }
  }

  // ✅ Prev & Next page events
  $('#pagination-controls').on('click', '#prevPage', function () {
    if (currentPage > 1) {
      currentPage--;
      fetchPage(currentPage);
    }
  });

  $('#pagination-controls').on('click', '#nextPage', function () {
    currentPage++;
    fetchPage(currentPage);
  });

  // ✅ Search logic
  $("#searchInput").on("keyup", function () {
    const value = $(this).val().toLowerCase();
    const filteredOrders = allOrders.filter(order => {
      const basicSearch = (
        (order.soldP && String(order.soldP).toLowerCase().includes(value)) ||
        (order.grossProfit && String(order.grossProfit).toLowerCase().includes(value)) ||
        (order.actualGP && String(order.actualGP).toLowerCase().includes(value)) ||
        (order.orderDate && order.orderDate.toLowerCase().includes(value)) ||
        (order.salesAgent && order.salesAgent.toLowerCase().includes(value)) ||
        (order.orderNo && order.orderNo.toLowerCase().includes(value)) ||
        (order.customerName && order.customerName.toLowerCase().includes(value)) ||
        (order.fName && order.fName.toLowerCase().includes(value)) ||
        (order.lName && order.lName.toLowerCase().includes(value)) ||
        ((order.pReq || order.partName) && (order.pReq || order.partName).toLowerCase().includes(value)) ||
        (order.orderStatus && order.orderStatus.toLowerCase().includes(value)) ||
        (order.email && order.email.toLowerCase().includes(value)) ||
        (order.phone && order.phone.toLowerCase().includes(value)) ||
        (order.make && order.make.toLowerCase().includes(value)) ||
        (order.model && order.model.toLowerCase().includes(value))
      );

      const yardSearch = order.additionalInfo && order.additionalInfo.some((info, index) => {
        const yardLabel = `yard ${index + 1}`;
        return (
          yardLabel.includes(value) ||
          (info.yardName && info.yardName.toLowerCase().includes(value)) ||
          (info.phone && String(info.phone).toLowerCase().includes(value)) ||
          (info.email && info.email.toLowerCase().includes(value)) ||
          (info.status && info.status.toLowerCase().includes(value))
        );
      });

      return basicSearch || yardSearch;
    });

    if (filteredOrders.length > 0 || value === "") {
      document.getElementById("showTotalOrders").innerHTML = `Total Orders - ${filteredOrders.length}`;
      renderTableRows(1, filteredOrders);
      createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage), filteredOrders);
    } else {
      $("#infoTable").empty();
      $("#infoTable").append(`<tr><td colspan="11">No matching results found</td></tr>`);
      document.getElementById("showTotalOrders").innerHTML = `Total Orders - 0`;
    }
  });

  // ✅ Sorting logic
  let currentSortColumn = '';
  let sortAsc = true;
  const columnMap = {
    salePrice: "soldP",
    estGp: "grossProfit",
    currGp: "currentGP",
    actualGp: "actualGP",
    custRefAmount: "custRefundedAmount"
  };
  const numericCols = ["salePrice", "estGp", "currGp", "actualGp", "custRefAmount"];

  $("#infoTableHeader th.sortable").on("click", function () {
    const column = $(this).data("column");
    if (!column) return;

    currentSortColumn === column ? sortAsc = !sortAsc : (currentSortColumn = column, sortAsc = true);

    const actualColumn = columnMap[column] || column;

    allOrders.sort((a, b) => {
      let valA = a[actualColumn];
      let valB = b[actualColumn];

      if (column.toLowerCase().includes("date")) {
        valA = new Date(valA);
        valB = new Date(valB);
      }
      else if (numericCols.includes(column)) {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      }
      else {
        valA = valA?.toString().toLowerCase() || "";
        valB = valB?.toString().toLowerCase() || "";
      }

      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    currentPage = 1;
    renderTableRows(currentPage);
    createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));

    $("#infoTableHeader .sort-icons .asc, .sort-icons .desc").removeClass("active");
    $(this).find(".sort-icons").children(sortAsc ? ".asc" : ".desc").addClass("active");
  });

  // Logout
  $("#logoutLink").click(function () {
    window.localStorage.clear();
    window.location.href = "login_signup.html";
  });
    // ✅ Clear localStorage when a sidebar menu item is clicked
  $(".sidebar .nav-link").on("click", function () {
    localStorage.removeItem('selectedMonthYear');
    localStorage.removeItem('currentPage');
    console.log("Cleared saved month and page number");
  });

  // ✅ Notifications setup
  const notificationIcon = $("#notificationIcon");
  const notificationDropdown = $("#notificationDropdown");
  const notificationList = $("#notificationList");
  const notificationCountElement = $("#notificationCount");

  let unreadCount = 0;

  async function fetchNotifications() {
    try {
      const response = await axios.get("https://www.spotops360.com/notifications");
      const notifications = response.data;

      const unreadNotifications = notifications.filter(
        (notification) => !notification.readBy.includes(firstName)
      );

      unreadCount = unreadNotifications.length;
      updateUnreadCount();
      renderNotifications(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }

  function renderNotifications(notifications) {
    notificationList.empty();
    const role = localStorage.getItem('role');
    const firstName = localStorage.getItem('firstName');

    const filteredNotifications = notifications.filter(notification => {
      if (role === 'Admin') {
        return true;
      } else {
        return notification.message.includes(firstName);
      }
    });

    const lastFiveNotifications = filteredNotifications.slice(-5);
    if (lastFiveNotifications.length === 0) {
      notificationList.append(`
        <li style="margin-bottom: 5px; padding: 10px; background-color: #f0f0f0; color: black; width: 100%; border: 1px solid black;">
          No notifications
        </li>
      `);
      return;
    }

    lastFiveNotifications.forEach((notification) => {
      let backgroundColor;
      if (notification.message.includes("Warning")) backgroundColor = "#db634a";
      else if (notification.message.includes("Alert")) backgroundColor = "#fdb044";
      else if (notification.message.includes("Task Completed")) backgroundColor = "#aae3c0";
      else if (notification.message.includes("New Task added")) backgroundColor = "#c6c6c6";
      else if (notification.message.includes("Task still in Processing past deadline")) backgroundColor = "#5fa33a";
      else if (notification.message.includes("Task status changed to Processing")) backgroundColor = "#d24949";
      else if (notification.message.includes("Task marked as Incomplete (Missed Deadline)")) backgroundColor = "#d24949";
      else backgroundColor = "black";

      const lines = notification.message.split("\n");
      const firstLine = `<b>${lines[0]}</b>`;
      const remainingLines = lines.slice(1).join("<br>");
      const formattedMessage = `${firstLine}<br>${remainingLines}`;

      const notificationItem = `
        <li style="margin-bottom: 5px; padding: 10px; background-color: ${backgroundColor}; color: black; width: 100%; border: 1px solid black;">
          ${formattedMessage}
        </li>
      `;
      notificationList.append(notificationItem);
    });
  }

  async function markNotificationsAsRead() {
    try {
      const role = localStorage.getItem('role');
      const firstName = localStorage.getItem('firstName');
      if (!firstName) {
        console.error("User ID not found. Cannot mark notifications as read.");
        return;
      }
      await axios.post(`https://www.spotops360.com/mark-notifications-read`, null, {
        params: { firstName, role },
      });
      unreadCount = 0;
      updateUnreadCount();
      console.log("Notifications marked as read successfully.");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }

  async function updateUnreadCount() {
    try {
      const role = localStorage.getItem('role');
      const firstName = localStorage.getItem('firstName');
      const response = await axios.get(`https://www.spotops360.com/unread-notifications-count`, {
        params: { firstName, role },
      });
      const unreadCount = response.data.count;
      if (unreadCount > 0) {
        notificationCountElement.text(unreadCount);
        notificationCountElement.show();
      } else {
        notificationCountElement.hide();
      }
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
    }
  }

  notificationIcon.on("click", async function () {
    const isVisible = notificationDropdown.is(":visible");
    if (isVisible) {
      notificationDropdown.hide();
    } else {
      notificationDropdown.show();
      $("table.table th").css({ "z-index": 0 });
      $("body").append('<div class="modal-overlay"></div>');
      $("body").addClass("modal-active");
      await fetchNotifications();
      await markNotificationsAsRead();
    }
  });

  $(document).on("click", function (event) {
    if (
      !$(event.target).closest("#notificationIcon").length &&
      !$(event.target).closest("#notificationDropdown").length
    ) {
      notificationDropdown.hide();
      $(".modal-overlay").remove();
      $("body").removeClass("modal-active");
    }
  });

  // ✅ Dark Mode toggle
  if (localStorage.getItem("darkMode") === "true") {
    enableDarkMode();
  }
  $("#darkModeIcon").on("click", function () {
    if ($("body").hasClass("dark-mode")) {
      disableDarkMode();
    } else {
      enableDarkMode();
    }
  });

  function enableDarkMode() {
    $("body").addClass("dark-mode");
    $(".navbar").addClass("dark-mode");
    $(".sidebar").addClass("dark-mode");
    $("table").addClass("table-dark");
    $("#darkModeIcon").removeClass("fa-moon").addClass("fa-sun");
    localStorage.setItem("darkMode", "true");
  }

  function disableDarkMode() {
    $("body").removeClass("dark-mode");
    $(".navbar").removeClass("dark-mode");
    $(".sidebar").removeClass("dark-mode");
    $("table").removeClass("table-dark");
    $("#darkModeIcon").removeClass("fa-sun").addClass("fa-moon");
    localStorage.setItem("darkMode", "false");
  }

  // ✅ CSV export logic
  $("#downloadCsv").on("click", async function () {
    let csvContent = "Order Date, Order No., Agent Name, Customer Info, Part Info, Yard, Order Status, Sale Price, Est GP, Current GP, Actual GP, Escalation Status\n";

    const rowsPerPage = 25;
    let currentPage = 1;
    let totalPages = Math.ceil(allOrders.length / rowsPerPage);

    async function collectPageRows(page) {
      renderTableRows(page, allOrders);
      let pageRows = [];
      $("#infoTable tr").each(function () {
        const row = $(this);
        const rowData = [];
        row.find("td").each(function () {
          let cellText = $(this).text().trim();
          if (cellText.includes(",") || cellText.includes("\n")) {
            cellText = `"${cellText.replace(/"/g, '""')}"`;
          }
          rowData.push(cellText);
        });
        if (rowData.length > 0) {
          pageRows.push(rowData.join(","));
        }
      });
      return pageRows;
    }

    for (let page = 1; page <= totalPages; page++) {
      const pageRows = await collectPageRows(page);
      csvContent += pageRows.join("\n") + "\n";
    }

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", "orders.csv");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    console.log("CSV download triggered!");
  });

  // ✅ Sidebar toggle
  $(".toggle-sidebar").on("click", function () {
    $("#offcanvasSidebar").toggleClass("show");
    if ($("#offcanvasSidebar").hasClass("show")) {
      $("body").addClass("no-scroll");
      $("body").append('<div class="modal-overlay"></div>');
    } else {
      $("body").removeClass("no-scroll");
      $(".modal-overlay").remove();
    }
  });

  // ✅ Search by order number (Enter key)
  const searchInput = document.getElementById('searchInputForOrderNo');
  searchInput.addEventListener('keydown', function (event) {
    console.log("searching order no");
    if (event.key === 'Enter') {
      const orderNo = searchInput.value.trim();
      if (orderNo !== '') {
        window.location.href = 'form.html?orderNo=' + encodeURIComponent(orderNo) + '&process=true';
      }
    }
  });

  // ✅ Fetch initial notifications
  fetchNotifications();

});
