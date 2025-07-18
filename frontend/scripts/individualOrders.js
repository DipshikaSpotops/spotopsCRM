$(document).ready(async function () {    
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
let sortedData = [];
const rowsPerPage = 25;
let currentPage = 1; 
function sortOrdersByOrderNoDesc(orders) {
console.log("Sorting orders by orderNo in descending order");

return orders.sort((a, b) => {
const orderANum = parseInt(a.orderNo.replace(/\D/g, ''), 10);  
const orderBNum = parseInt(b.orderNo.replace(/\D/g, ''), 10); 
if (isNaN(orderANum) || isNaN(orderBNum)) {
return 0;  
}
return orderBNum - orderANum; 
});
}
let totalCount = 0;

async function fetchOrdersByPage(page = 1) {
  const rangeValue = $("#unifiedDatePicker").val().trim();
  const tz = "America/Chicago";
  const loggedInUser = localStorage.getItem("firstName");
  const isFetchAll = $("#fetchAllToggle").is(":checked");
  const effectiveLimit = isFetchAll ? 0 : rowsPerPage;

  let queryParams = {
    salesAgent: loggedInUser,
    page,
    limit: effectiveLimit,
  };

  if (!rangeValue) {
    alert("Invalid date format. Please pick a valid date or range.");
    return;
  }

  if (rangeValue.includes(" to ")) {
    const [startStr, endStr] = rangeValue.split(" to ");
    queryParams.start = moment.tz(startStr, tz).startOf("day").toISOString();
    queryParams.end = moment.tz(endStr, tz).endOf("day").toISOString();
  } else if (moment(rangeValue, "YYYY-MM", true).isValid()) {
    const m = moment(rangeValue, "YYYY-MM");
    queryParams.month = m.format("MM");
    queryParams.year = m.format("YYYY");
  } else if (moment(rangeValue, "YYYY-MM-DD", true).isValid()) {
    const date = moment.tz(rangeValue, tz);
    queryParams.start = date.startOf("day").toISOString();
    queryParams.end = date.endOf("day").toISOString();
  } else {
    alert("Invalid date format. Please pick a valid date or range.");
    return;
  }

  try {
    const response = await axios.get(`https://www.spotops360.com/salespersonWiseOrders`, {
      params: queryParams,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const { orders, totalCount: fetchedCount } = response.data;
    totalCount = fetchedCount;
    sortedData = sortOrdersByOrderNoDesc(orders);
    currentPage = page;

    renderTableRows(currentPage, sortedData);

    if (!isFetchAll) {
      createPaginationControls(Math.ceil(totalCount / rowsPerPage), sortedData);
    } else {
      $("#pagination-controls").empty();
    }

    updateOrderStats(orders);
  } catch (error) {
    console.error("Error fetching paginated orders:", error);
  }
}


function updateOrderStats(filteredData) {
  let totalGrossProfit = 0;
  let totalActualGP = 0;
  let totalCancelled = 0;
  let totalRefunded = 0;
  let totalDisputed = 0;

  filteredData.forEach((item) => {
    const estGP = item.grossProfit || 0;
    const actualGP = item.actualGP || 0;
    totalActualGP += actualGP;
    totalGrossProfit += estGP;
    if (item.orderStatus === "Order Cancelled") totalCancelled++;
    else if (item.orderStatus === "Refunded") totalRefunded++;
    else if (item.orderStatus === "Dispute") totalDisputed++;
  });

  const cancellationRate =
    filteredData.length > 0
      ? ((totalCancelled + totalRefunded + totalDisputed) / filteredData.length) * 100
      : 0;

  document.getElementById("showTotalOrders").innerHTML = `Total Orders- ${filteredData.length}`;
  document.getElementById("showTotalEstGP").innerHTML = `Est GP- ${totalGrossProfit.toFixed(2)}`;
  document.getElementById("showTotalActualGP").innerHTML = `Actual GP- ${totalActualGP.toFixed(2)}`;
  document.getElementById("showCancellationRate").innerHTML = `Cancellation Rate- ${cancellationRate.toFixed(2)}%`;
}

let sortOrder = {
orderDate: "asc",
orderNo: "asc",
customerName: "asc",
partName: "asc",
soldP: "asc",
salestax: "asc",
costP: "asc",
shippingFee: "asc",
grossProfit: "asc",
actualGP: "asc",
estGP: "asc",
orderStatus: "asc",
};
function parseCustomDate(dateString) {
const months = {
Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05",
Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10",
Nov: "11", Dec: "12"
};

// Extract parts from the string (day, month, year, time)
const parts = dateString.match(/(\d+)(?:st|nd|rd|th)\s(\w+),\s(\d+)\s(\d{2}):(\d{2})/);

if (parts) {
const day = parts[1].padStart(2, '0'); // Pad day with leading 0 if necessary
const month = months[parts[2]];
const year = parts[3];
const hour = parts[4];
const minute = parts[5];

// Return a valid date string for comparison
return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
}

return null;
}
// Function to sort the table
function sortTable(column, type) {
const table = $("#infoTable");
const rows = table.find("tr").toArray();

rows.sort((a, b) => {
let valA = $(a).find("td").eq(column).text().trim();
let valB = $(b).find("td").eq(column).text().trim();

if (type === "date") {
valA = parseCustomDate(valA); // Use the helper function to parse the date
valB = parseCustomDate(valB);
} else if (type === "number") {
valA = parseFloat(valA.replace(/\D/g, ""));
valB = parseFloat(valB.replace(/\D/g, ""));
}

if (sortOrder[type] === "asc") {
return valA > valB ? 1 : -1;
} else {
return valA < valB ? 1 : -1;
}
});

// Append sorted rows to the table
$.each(rows, function (index, row) {
table.append(row);
});

// Toggle sort order
sortOrder[type] = sortOrder[type] === "asc" ? "desc" : "asc";

// Update the sort icon
updateSortIcons(column, sortOrder[type]);
}

// Function to update the sort icons
function updateSortIcons(columnIndex, order) {
$("th .sort-icon").html("&#9650;"); // Reset all icons to ascending
$("th").each(function (index) {
if (index === columnIndex) {
$(this).find(".sort-icon").html(order === "asc" ? "&#9650;" : "&#9660;");
}
});
}

// Event listeners for sorting
$("th").each(function (index) {
const th = $(this);
let type = th.text().trim().toLowerCase().replace(/\s/g, "");

if (type === "orderdate") {
th.on("click", function () {
sortTable(index, "date");
});
} else if (type === "orderno" || type === "saleprice" || type === "salestax" || type === "estpartprice" || type === "estshippingprice" || type === "estgp" || type === "actualgp") {
th.on("click", function () {
sortTable(index, "number");
});
} else {
th.on("click", function () {
sortTable(index, type);
});
}
});
// Get the current time and the login timestamp
const currentTime = Date.now();
const loginTimestamp = localStorage.getItem("loginTimestamp");
if (loginTimestamp) {
const timeDifference =
(currentTime - loginTimestamp) / (1000 * 60 * 60);
if (timeDifference >= 12) {
alert(
"Your session has expired. You will be redirected to the login page."
);
window.localStorage.clear(); 
window.location.href = "login_signup.html";
}
} else {
window.location.href = "login_signup.html";
}
const firstName = localStorage.getItem("firstName");
const lastName = localStorage.getItem("lastName");
const email = localStorage.getItem("email");
const role = localStorage.getItem("role");
const token = localStorage.getItem("token");

// order data display till here
if (firstName) {
$("#user-name").text(firstName);
}
if (!firstName) {
window.location.href = "login_signup.html";
}
if (firstName === "John") {
console.log("first",firstName);
$("#submenu-dashboards .view-all-orders-monthly-link").show();
} else{
$("#submenu-dashboards .view-all-orders-monthly-link").hide();
}

// Hide specific sections based on team
const team = localStorage.getItem("team");
if (team === "Team Charlie" || role === "Sales") {
// Hide specific reports links for Team Charlie
$("#submenu-reports .nav-link")
.not(':contains("My Sales Report")')
.hide();
// Hide specific dashboards links for Team Charlie
$(
"#submenu-dashboards .in-transit-link, #submenu-dashboards .view-fulfilled-link,.escalation,.view-ordersSheet-link, .customer-approved-link, #submenu-dashboards .teamA-orders-link, #submenu-dashboards .teamB-orders-link, #submenu-dashboards .placed-orders-link, #submenu-dashboards .cancelled-orders-link, #submenu-dashboards .refunded-orders-link, #submenu-dashboards .yard-info-link, #submenu-dashboards .escalated-orders, #submenu-dashboards .ongoingEscalated-orders,#submenu-dashboards .yard-located-orders, #submenu-dashboards .sales-data-link, #submenu-dashboards .view-myTasks-link, #submenu-dashboards .view-myTasks-link"
).hide();
// Hide teams and users sections for Team Charlie
$(".nav-item:has(#submenu-teams)").hide();
$(".nav-item:has(#submenu-users)").hide();
$(".nav-item:has(#submenu-invoices)").hide();
} else if (team === "Team Mark") {
$('#submenu-reports .nav-link:contains("My Sales Report")').hide();
$(".nav-item:has(#submenu-teams)").hide();
$(".nav-item:has(#submenu-users)").hide();
$(
"#submenu-dashboards .add-order-link, .view-individualOrders-link, .teamB-orders-link, .sales-data-link"
).hide();
} else if (team === "Team Sussane") {
$('#submenu-reports .nav-link:contains("My Sales Report")').hide();
$(".nav-item:has(#submenu-teams)").hide();
$(".nav-item:has(#submenu-users)").hide();
$('#submenu-reports .nav-link:contains("Escalation Resolutions")').hide();
// escalationResolvingTime
$(
"#submenu-dashboards .add-order-link, .view-individualOrders-link, .teamA-orders-link, .sales-data-link"
).hide();

} 
// else if (role === "Admin" && firstName === "John") {
//   console.log("===");
// // Hide specific reports links for Admin
// $('#submenu-reports .nav-link:contains("My Sales Report")').show();
// $("#submenu-dashboards .view-individualOrders-link").show();
// // Hide specific dashboards links for Admin
// }
else if (role === "Admin") {
  console.log("=D==");
// Hide specific reports links for Admin
$('#submenu-reports .nav-link:contains("My Sales Report")').hide();
$('#submenu-reports .nav-link:contains("Refund Report")').show();
$('#submenu-reports .nav-link:contains("Collect Refund")').show();
// Hide specific dashboards links for Admin
$("#submenu-dashboards .view-individualOrders-link").hide();
}
const tz = "America/Chicago";
const momentTz = moment().tz(tz);
const thisMonthStart = momentTz.clone().startOf("month").format("YYYY-MM-DD");
const thisMonthEnd = momentTz.clone().endOf("month").format("YYYY-MM-DD");
$("#unifiedDatePicker").val(`${thisMonthStart} to ${thisMonthEnd}`);
// Fetch orders specific to the logged-in salesperson
try {
  await fetchOrdersByPage(1); 
} catch (error) {
  console.error("Error fetching orders:", error);
}

// Function to render table rows based on page
function renderTableRows(page,data) {
  $("#infoTable").empty();

  // Only show current page slice
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  paginatedData.forEach((item) => {
    const estGrossP = item.grossProfit || 0;
    const actualGP = item.actualGP || 0;

    const datetime = item.orderDate;
    const date = new Date(datetime);
    const day = date.getUTCDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = date.getUTCFullYear();

    const suffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };
    const formattedOrderDate = `${day}${suffix(day)} ${monthNames[date.getUTCMonth()]}, ${year}`;
    const actions = `<button class="btn btn-primary btn-sm edit-btn" data-id="${item.orderNo}">Edit</button>`;

    $("#infoTable").append(`
      <tr>
        <td>${formattedOrderDate}</td>
        <td>${item.orderNo}</td>
        <td>${item.fName ? `${item.fName} ${item.lName}` : item.customerName || ""}</td>
        <td>${item.pReq || item.partName}</td>
        <td>$${item.soldP}</td>
        <td>$${actualGP.toFixed(2)}</td>
        <td>$${estGrossP.toFixed(2)}</td>
        <td>${
          item.additionalInfo?.length
            ? item.additionalInfo.map(info => info.trackingNo || "").join("<br>")
            : ""
        }</td>
        <td>${item.orderStatus}</td>
        <td>${actions}</td>
      </tr>
    `);
  });
}
// Pagination function
function createPaginationControls(totalPages, dataToRender) {
  const paginationControls = $('#pagination-controls');
  paginationControls.empty(); // Clear existing buttons

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
$('#pagination-controls').on('click', '#prevPage', function () {
  if (currentPage > 1) {
    currentPage--;
    renderTableRows(currentPage,sortedData);
    createPaginationControls(Math.ceil(sortedData.length / rowsPerPage));
  }
});

$('#pagination-controls').on('click', '#nextPage', function () {
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTableRows(currentPage,sortedData);
    createPaginationControls(totalPages);
  }
});

let filteredResults = []; 

$("#searchInput").on("keyup", function () {
  const value = $(this).val().toLowerCase();

  filteredResults = sortedData.filter(order => {
    return (
      (order.orderDate && order.orderDate.toLowerCase().includes(value)) ||
      (order.orderNo && order.orderNo.toLowerCase().includes(value)) ||
      (order.salesAgent && order.salesAgent.toLowerCase().includes(value)) ||
      (order.customerName && order.customerName.toLowerCase().includes(value)) ||
      ((order.pReq || order.partName) && (order.pReq || order.partName).toLowerCase().includes(value)) ||
      (order.additionalInfo && order.additionalInfo.some(info =>
        (info.trackingNo && String(info.trackingNo).toLowerCase().includes(value))
      )) ||
      (order.orderStatus && order.orderStatus.toLowerCase().includes(value)) ||
      (order.email && order.email.toLowerCase().includes(value))
    );
  });

  if (filteredResults.length > 0 || value === "") {
    currentPage = 1; // Reset to first page for new results
    renderTableRows(currentPage, filteredResults);
    createPaginationControls(Math.ceil(filteredResults.length / rowsPerPage), filteredResults);
  } else {
    $("#infoTable").empty();
    $("#infoTable").append(`<tr><td colspan="11">No matching results found</td></tr>`);
    $("#pagination-controls").empty();
  }
});

$(".toggle-btn").on("click", function () {
$("#offcanvasSidebar").toggleClass("show");
});

$(".chevron-icon, .nav-link").on("click", function (event) {
event.stopPropagation();
const submenu = $(this).closest(".nav-item").find(".submenu");
submenu.toggle();
$(this).find("i").toggleClass("fa-chevron-right fa-chevron-down");
$(this).closest(".nav-link").toggleClass("selected");
});

$('#profileLink').click(function () {
$('#profileFirstName').val(firstName);
$('#profileLastName').val(lastName);
$('#profileEmail').val(email);
$('#profileRole').val(role);
$('#profileModal').modal('show');
});

$('.close').click(function () {
location.reload();
});
// Highlight active link based on current URL
const currentPath = window.location.pathname;
$(".nav-link").each(function () {
if (currentPath.includes($(this).attr("href"))) {
$(this).addClass("active");
}
});
const activeLink = $(".nav-link.active")[0];
if (activeLink) {
  activeLink.scrollIntoView({ behavior: "smooth", block: "center" });
}

// function to filter out data with month and year
$("#filterButton").click(async function () {
  $("body").append('<div class="modal-overlay"></div>');
  $("body").addClass("modal-active");
  $("#loadingMessage").show();

  const rangeValue = $("#unifiedDatePicker").val().trim();
  const tz = "America/Chicago";

  let queryParams = {
    limit: "all",
    salesAgent: firstName,
  };

  if (!rangeValue) {
    alert("Please select a valid date, range, or month.");
    $("#loadingMessage").hide();
    $(".modal-overlay").remove();
    $("body").removeClass("modal-active");
    return;
  }

  if (rangeValue.includes(" to ")) {
    const [startStr, endStr] = rangeValue.split(" to ");
    queryParams.start = moment.tz(startStr, tz).startOf("day").toISOString();
    queryParams.end = moment.tz(endStr, tz).endOf("day").toISOString();
  } else if (moment(rangeValue, "YYYY-MM", true).isValid()) {
    const m = moment(rangeValue, "YYYY-MM");
    queryParams.month = m.format("MM");
    queryParams.year = m.format("YYYY");
  } else if (moment(rangeValue, "YYYY-MM-DD", true).isValid()) {
    const date = moment.tz(rangeValue, tz);
    queryParams.start = date.startOf("day").toISOString();
    queryParams.end = date.endOf("day").toISOString();
  } else {
    alert("Invalid date format selected.");
    $("#loadingMessage").hide();
    $(".modal-overlay").remove();
    $("body").removeClass("modal-active");
    return;
  }

  try {
    const ordersResponse = await axios.get(`https://www.spotops360.com/salespersonWiseOrders`, {
      params: queryParams,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (ordersResponse.status !== 200) {
      throw new Error("Failed to fetch orders");
    }

    const { orders, totalCount } = ordersResponse.data;
    sortedData = sortOrdersByOrderNoDesc(orders);

    let totalGrossProfit = 0;
    let totalActualGP = 0;
    let totalCancelled = 0;
    let totalRefunded = 0;
    let totalDisputed = 0;

    orders.forEach((item) => {
      const estGP = parseFloat(item.grossProfit) || 0;
      const actualGP = parseFloat(item.actualGP) || 0;
      totalGrossProfit += estGP;
      totalActualGP += actualGP;

      switch (item.orderStatus) {
        case "Order Cancelled":
          totalCancelled++;
          break;
        case "Refunded":
          totalRefunded++;
          break;
        case "Dispute":
          totalDisputed++;
          break;
      }
    });

    const totalOrders = orders.length;
    const cancellationRate = totalOrders > 0
      ? ((totalCancelled + totalRefunded + totalDisputed) / totalOrders) * 100
      : 0;

    $("#showTotalOrders").text(`Total Orders- ${totalOrders}`);
    $("#showTotalEstGP").text(`Est GP- ${totalGrossProfit.toFixed(2)}`);
    $("#showTotalActualGP").text(`Actual GP- ${totalActualGP.toFixed(2)}`);
    $("#showCancellationRate").text(`Cancellation Rate- ${cancellationRate.toFixed(2)}%`);

    renderTableRows(1, sortedData);
    createPaginationControls(Math.ceil(sortedData.length / rowsPerPage));

  } catch (error) {
    console.error("Error fetching filtered orders:", error);
  } finally {
    $("#loadingMessage").hide();
    $(".modal-overlay").remove();
    $("body").removeClass("modal-active");
  }
});

$("#infoTable").on("click", ".edit-btn", function () {
const id = $(this).data("id");
window.location.href = `addOrders.html?orderNo=${id}`;
});
$('#logoutLink').on('click', function() {
window.localStorage.clear();
window.location.href = 'login_signup.html';
});
// notification
const notificationIcon = $("#notificationIcon");
const notificationDropdown = $("#notificationDropdown");
const notificationList = $("#notificationList");
const notificationCountElement = $("#notificationCount");

let unreadCount = 0;

// Fetch notifications from the backend
async function fetchNotifications() {
  try {
    const response = await axios.get("https://www.spotops360.com/notifications");
        const notifications = response.data;
 // Filter unread notifications for the logged-in user
 const unreadNotifications = notifications.filter(
        (notification) => !notification.readBy.includes(firstName)
      );

    // Update the unread count
    unreadCount = unreadNotifications.length;
    updateUnreadCount();
    renderNotifications(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
}

// Render notifications in the dropdown
function renderNotifications(notifications) {
  notificationList.empty(); // Clear the notification list
  const role = localStorage.getItem('role');
  const firstName = localStorage.getItem('firstName');

  // Filter notifications based on role and firstName
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
    return; // Exit the function early
  }

  // Render the last 5 notifications
  lastFiveNotifications.forEach((notification) => {
    let backgroundColor;
    if (notification.message.includes("Warning")) {
      backgroundColor = "#db634a";
    } else if (notification.message.includes("Alert")) {
      backgroundColor = "#fdb044";
    } else if (notification.message.includes("Task Completed")) {
      backgroundColor = "#aae3c0";
    } else if (notification.message.includes("New Task added")) {
      backgroundColor = "#c6c6c6";
    } else if (notification.message.includes("Task still in Processing past deadline")) {
      backgroundColor = "#5fa33a";
    } else if (notification.message.includes("Task status changed to Processing")) {
      backgroundColor = "#d24949";
    } else if (notification.message.includes("Task marked as Incomplete (Missed Deadline)")) {
      backgroundColor = "#d24949";
    } else {
      backgroundColor = "black";
    }

    // Split the message into lines
    const lines = notification.message.split("\n");
    const firstLine = `<b>${lines[0]}</b>`;
    const remainingLines = lines.slice(1).join("<br>");
    const formattedMessage = `${firstLine}<br>${remainingLines}`;

    // Create the notification item
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
// Toggle notification dropdown visibility
notificationIcon.on("click", async function () {
  const isVisible = notificationDropdown.is(":visible");

  if (isVisible) {
    notificationDropdown.hide();
  } else {
    notificationDropdown.show();
    $("table.table th").css({
     "z-index": 0,
    });
    $(".modal-overlay").css({
      "z-index":1,
    })
    $("body").append('<div class="modal-overlay"></div>');
$("body").addClass("modal-active");    
    await fetchNotifications();
    await markNotificationsAsRead();
  }
});

// Close dropdown when clicking outside
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
fetchNotifications();
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
$(document).on("click", "#infoTable tr", function () {
  const isSelected = $(this).hasClass("selected");

  $("#infoTable tr").removeClass("selected");

  if (!isSelected) {
    $(this).addClass("selected");
  }
});
 // sorting
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

    // Handle dates
    if (column.toLowerCase().includes("date")) {
      valA = new Date(valA);
      valB = new Date(valB);
    }
    // Handle numbers
    else if (numericCols.includes(column)) {
      valA = parseFloat(valA) || 0;
      valB = parseFloat(valB) || 0;
    }
    // Default string sorting
    else {
      valA = valA?.toString().toLowerCase() || "";
      valB = valB?.toString().toLowerCase() || "";
    }

    return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  currentPage = 1;
  renderTableRows(currentPage);
  createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));

  // Update arrows
  $("#infoTableHeader .sort-icons .asc, .sort-icons .desc").removeClass("active");
  $(this).find(".sort-icons").children(sortAsc ? ".asc" : ".desc").addClass("active");
});
});