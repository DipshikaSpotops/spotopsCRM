$(document).ready(async function () {
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
    const monthName = monthMoment.format("MMMM"); // e.g., "June"
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
  let allOrders = [];
  const rowsPerPage = 25;
  let currentPage = 1;
  const userId = localStorage.getItem("userId");
  const firstName = localStorage.getItem("firstName");

  if (!firstName) {
    window.location.href = "login_signup.html";
    return;
  }
  $("#user-name").text(firstName);

  // Token logic
  let token = localStorage.getItem("token");
  if (!token) {
    try {
      const response = await axios.get(`https://www.spotops360.com/auth/token/${userId}`);
      if (response.status === 200) {
        token = response.data.token;
        localStorage.setItem("token", token);
      }
    } catch (err) {
      console.error("Token fetch failed", err);
    }
  }

  // Set Dallas month default
  const dallasDate = new Date(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date()).replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$1-$2")
  );
  const defaultMonth = moment().tz("America/Chicago").format("YYYY-MM");
  $("#unifiedDatePicker").val(defaultMonth);

  // Load data on page load
  await loadOrdersFromPicker();
  // Filter button
$("#filterButton").click(async function () {
  await loadOrdersFromPicker();
});
  // Search input
$("#searchInput").on("keyup", function () {
  const value = $(this).val().toLowerCase();

  // Filter the entire allOrders dataset based on the search term
  const filteredOrders = allOrders.filter(order => {
    return (
      (order.orderDate && order.orderDate.toLowerCase().includes(value)) ||
      (order.orderNo && order.orderNo.toLowerCase().includes(value)) ||
      (order.salesAgent && order.salesAgent.toLowerCase().includes(value)) ||
      (order.cancellationReason && order.cancellationReason.toLowerCase().includes(value)) ||
      (order.customerName && order.customerName.toLowerCase().includes(value)) ||
      ((order.pReq || order.partName) && (order.pReq || order.partName).toLowerCase().includes(value)) ||
      (order.email && order.email.toLowerCase().includes(value))
    );
  });

  const totalRefundedAmount = filteredOrders
    .filter(order => order.custRefundDate) 
    .reduce((sum, order) => sum + (parseFloat(order.custRefAmount) || 0), 0);

  $("#showTotalOrders").text(`Total Orders - ${filteredOrders.length} | Amount: $${totalRefundedAmount.toFixed(2)}`);

  if (filteredOrders.length > 0 || value === "") {
    renderTableRows(1, filteredOrders); // Render the first page of filtered results
    createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage), filteredOrders);
  } else {
    $("#infoTable").empty(); // Clear the table if no results are found
    $("#infoTable").append(`<tr><td colspan="11">No matching results found</td></tr>`);
  }
});

  // Search input for quick nav
  const searchQuick = document.getElementById("searchInputForOrderNo");
  const resultDiv = document.getElementById("searchResult");
  if (searchQuick) {
    searchQuick.addEventListener("input", function () {
      const val = this.value.trim();
      resultDiv.innerHTML = val
        ? `<button class="btn btn-primary btn-sm" id="viewOrderBtn">View Order</button>`
        : "";
      if (val) {
        document.getElementById("viewOrderBtn").onclick = () => {
          window.location.href = `form.html?orderNo=${encodeURIComponent(val)}&process=true`;
        };
      }
    });
  }

  // Core data loader
async function loadOrdersFromPicker() {
  const pickerVal = $("#unifiedDatePicker").val().trim();
  const tz = "America/Chicago";

  let queryParams = {};

  if (pickerVal.includes(" to ")) {
    const [startStr, endStr] = pickerVal.split(" to ");
    queryParams = {
      start: moment.tz(startStr, tz).startOf("day").toISOString(),
      end: moment.tz(endStr, tz).endOf("day").toISOString()
    };
  } else if (moment(pickerVal, "YYYY-MM", true).isValid()) {
    const m = moment(pickerVal, "YYYY-MM");
    queryParams = {
      month: m.format("MMM"),
      year: m.format("YYYY")
    };
  } else if (moment(pickerVal, "YYYY-MM-DD", true).isValid()) {
    const date = moment.tz(pickerVal, tz);
    queryParams = {
      start: date.startOf("day").toISOString(),
      end: date.endOf("day").toISOString()
    };
  } else {
    alert("⚠️ Please select a valid date, range, or month.");
    return;
  }

  const [cancelled, refunded] = await Promise.all([
    fetchOrders("cancelled-by-date", queryParams),
    fetchOrders("refunded-by-date", queryParams)
  ]);

  const combined = [...cancelled, ...refunded];
  const unique = {};

  combined.forEach(order => {
    const o = unique[order.orderNo] ??= {
      orderNo: order.orderNo,
      orderDate: order.orderDate,
      cancellationReason: order.cancellationReason,
      custRefAmount: order.custRefAmount,
      custRefundDate: order.custRefundDate,
      cancelledDate: order.cancelledDate,
      customerName: order.customerName,
      orderHistory: order.orderHistory || [],
    };
    order.orderHistory?.forEach(entry => {
      if (entry.includes("cancelled") && !o.cancelledDate) o.cancelledDate = extractDate(entry);
      if (entry.includes("refunded") && !o.custRefundDate) o.custRefundDate = extractDate(entry);
    });
  });

  allOrders = Object.values(unique);
  const totalRefundedAmount = allOrders
    .filter(order => order.custRefundDate)
    .reduce((sum, order) => sum + (parseFloat(order.custRefAmount) || 0), 0);

  $("#showTotalOrders").text(`Total Orders - ${allOrders.length} | Amount: $${totalRefundedAmount.toFixed(2)}`);
  renderTableRows(1);
  createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));
}

async function fetchOrders(type, queryParams) {
  try {
    const res = await axios.get(`https://www.spotops360.com/orders/${type}`, {
      params: queryParams,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  } catch (err) {
    console.error(`Error fetching ${type}`, err);
    return [];
  }
}


  function extractDate(text) {
    const match = text.match(/on (\\d{1,2}) (\\w+), (\\d{4})/);
    return match ? `${match[1]} ${match[2]} ${match[3]}` : "-";
  }

  function formatDate(str) {
    if (!str) return "-";
    const d = new Date(str);
    return isNaN(d) ? "-" : d.toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
  }

  function renderTableRows(page, orders = allOrders) {
    const start = (page - 1) * rowsPerPage;
    const data = orders.slice(start, start + rowsPerPage);
    const tbody = $("#infoTable").empty();

    if (!data.length) {
      tbody.append(`<tr><td colspan="7">No orders found.</td></tr>`);
      return;
    }

    data.forEach(order => {
      tbody.append(`
        <tr>
          <td>${order.orderNo}</td>
          <td>${formatDate(order.orderDate)}</td>
          <td>${formatDate(order.cancelledDate)}</td>
          <td>${formatDate(order.custRefundDate)}</td>
          <td>${order.cancellationReason || "-"}</td>
          <td>$${order.custRefAmount || 0}</td>
          <td>
            <button class="btn btn-success btn-sm process-btn" data-id="${order.orderNo}">View</button>
          </td>
        </tr>
      `);
    });
  }

  function createPaginationControls(totalPages) {
  const paginationControls = $('#pagination-controls');
  console.log("pages", totalPages, "currentPage", currentPage);

  paginationControls.empty();

  if (totalPages > 1) {
    // Left arrow for "Previous" page
    paginationControls.append(`
      <button class="previousNext" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>←</button>
    `);

    // Page number display
    paginationControls.append(`
      <span class="page-info">Page ${currentPage} of ${totalPages}</span>
    `);

    // Right arrow for "Next" page
    paginationControls.append(`
      <button class="previousNext" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>→</button>
    `);
  }
}
$('#pagination-controls').on('click', '#prevPage', function () {
  if (currentPage > 1) {
    currentPage--;
    renderTableRows(currentPage);
    createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));
    localStorage.setItem('currentPage', currentPage);
  }
});

$('#pagination-controls').on('click', '#nextPage', function () {
  const totalPages = Math.ceil(allOrders.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTableRows(currentPage);
    createPaginationControls(totalPages);
    localStorage.setItem('currentPage', currentPage);
  }
});

  // Table row click highlights
  $(document).on("click", "#infoTable tr", function () {
    $("#infoTable tr").removeClass("selected");
    $(this).addClass("selected");
  });

  // View button click
  $("#infoTable").on("click", ".process-btn", function () {
    const id = $(this).data("id");
    window.location.href = `form.html?orderNo=${id}&process=true`;
  });
  const currentPath = window.location.pathname + "?newEntry=true";
console.log("currentPath",currentPath)
$(".nav-link").each(function () {
if (currentPath.includes($(this).attr("href"))) {
$(this).addClass("active");
}
});
const activeLink = $(".nav-link.active")[0];
if (activeLink) {
  activeLink.scrollIntoView({ behavior: "smooth", block: "center" });
}
// sorting 
let currentSortColumn = '';
let sortAsc = true;

$("#infoTableHeader th.sortable").on("click", function () {
  const column = $(this).data("column");
  if (!column) return;
  console.log("Current sort column:", currentSortColumn);
  if (currentSortColumn === column) {
    sortAsc = !sortAsc;
  } else {
    currentSortColumn = column;
    sortAsc = true;
  }

  // Sort data
  allOrders.sort((a, b) => {
    let valA = a[column] ?? '';
    let valB = b[column] ?? '';

    if (column.toLowerCase().includes("date")) {
      valA = new Date(valA);
      valB = new Date(valB);
    } else if (column === "custRefAmount") {
      valA = parseFloat(valA) || 0;
      valB = parseFloat(valB) || 0;
    } else {
      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();
    }

    return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  currentPage = 1;
  renderTableRows(currentPage);
  createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));

  // Reset all arrows
  $("#infoTableHeader .sort-icons .asc, .sort-icons .desc").removeClass("active");

  // Highlight the active arrow
  const arrowToActivate = sortAsc ? ".asc" : ".desc";
  $(this).find(arrowToActivate).addClass("active");
});

$("#reason-popup-trigger").on("click", function () {
  const statsMap = {};

  allOrders.forEach(order => {
    if(!order.cancellationReason){
      console.log("orderNos",order.orderNo);
    }
    const reason = order.cancellationReason || "";
    if (!statsMap[reason]) {
      statsMap[reason] = { count: 0, amount: 0 };
    }
    statsMap[reason].count += 1;
    if (order.custRefundDate) {
      statsMap[reason].amount += parseFloat(order.custRefAmount || 0);
    }
  });

  const tableBody = $("#reasonStatsTable").empty();
  Object.entries(statsMap).forEach(([reason, data]) => {
    tableBody.append(`
      <tr>
        <td>${reason}</td>
        <td>${data.count}</td>
        <td>$${data.amount.toFixed(2)}</td>
      </tr>
    `);
  });

  $("#reasonModal").modal("show");
});

});


