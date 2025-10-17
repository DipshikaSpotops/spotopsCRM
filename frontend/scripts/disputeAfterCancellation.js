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
// Pagination related variables
let allOrders = [];
const rowsPerPage = 25;
let currentPage = 1;
// Function to render rows based on the page
var filteredOrders;
function renderTableRows(page, orders = allOrders) {
    console.log("orders ofr d",orders);
// Filter orders that don't match "Placed", "Customer approved", or "Order Fulfilled"
 filteredOrders = orders;

// Pagination logic after filtering
const start = (page - 1) * rowsPerPage;
const end = start + rowsPerPage;
const ordersForPage = filteredOrders.slice(start, end);
console.log("ordersForPage",ordersForPage);
$('#infoTable').empty();
ordersForPage.forEach((item) => {
const escalationStatus = item.additionalInfo &&
item.additionalInfo[0] &&
item.additionalInfo[0].escTicked === "Yes" ? "Yes" : "";
let escalationStyle = '';
if (item.orderStatus === "Order Fulfilled" && escalationStatus === "Yes") {
escalationStyle = 'style="background-color: lightgreen;"';
}

const team = localStorage.getItem('team');

const actions = `
<button class="btn btn-success btn-sm process-btn" data-id="${item.orderNo}" ${item.orderStatus === "Placed" || item.orderStatus === "Customer approved" ? "disabled" : ""}>View</button>`;

const yardlength = item.additionalInfo.length;
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
// const cancelleddateOnly = item.cancelledDate.split(" ")[0] + " " + item.cancelledDate.split(" ")[1] + " " + item.cancelledDate.split(" ")[2];
$("#infoTable").append(`
<tr>
<td>${formattedOrderDate}</td>
<td>${item.orderNo}</td>
<td>${item.soldP}</td>
<td>${item.salesAgent}</td>
<td>${
(item.fName && item.lName)
? `${item.fName} ${item.lName}`
: (item.customerName || "")
}</td>
<td>${item.pReq || item.partName}</td>
<td>${
item.additionalInfo && item.additionalInfo.length > 0
? item.additionalInfo
.map((info, index) => {
const yardName = info.yardName || "Unknown Yard";
const shippingDetails = info.shippingDetails || "Unknown Shipping Details";
const partPrice = parseFloat(info.partPrice) || 0;
const others = parseFloat(info.others) || 0;
const refundedAmount = parseFloat(info.refundedAmount) || 0;
const custOwnShipReplacement = parseFloat(info.custOwnShipReplacement) || 0;
const yardOwnShipping = parseFloat(info.yardOwnShipping) || 0;
const custOwnShippingReturn = parseFloat(info.custOwnShippingReturn) || 0;
const shippingCost = parseFloat(shippingDetails.match(/\d+/)?.[0]) || 0;
const yardSpendTotal =
            partPrice + 
            shippingCost + 
            others - 
            refundedAmount + 
            yardOwnShipping + 
            custOwnShippingReturn - 
            custOwnShipReplacement;
            const escSpending = yardOwnShipping + 
            custOwnShippingReturn + 
            custOwnShipReplacement;
return `
<b>Yard ${index + 1}</b>: ${yardName}<br> 
Part price: $${partPrice} | ${shippingDetails} <br>
Others: $${others} |Esc spending: $${escSpending}<br>
Status: ${info.status} ${info.paymentStatus} ${
  info.paymentStatus === "Card charged" ? `Yard Spend: $${yardSpendTotal}` : ""
}<br>
Yard refund: $${refundedAmount}
`;
})
.join("<br>")
: "No Yard Info"
}</td>
<td>${item.orderStatus}</td>
<td style="justify-content: center;">${actions}</td>
</tr>
`);
});

createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage), filteredOrders);
}

// Function to create pagination controls based on filtered data
function createPaginationControls(totalPages) {
  const paginationControls = $('#pagination-controls');
  console.log("pages",totalPages,"currentPage",currentPage);
  paginationControls.empty(); 
  if (totalPages > 1) {
    // Left arrow for "Previous" page
    paginationControls.append(`
      <button class="previousNext" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>←</button>
    `);

    // Page number display: Page X of Y
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
  }
});

$('#pagination-controls').on('click', '#nextPage', function () {
  const totalPages = Math.ceil(allOrders.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTableRows(currentPage);
    createPaginationControls(totalPages);
  }
});
var firstname = localStorage.getItem("firstName");
if (firstName) {
$("#user-name").text(firstName);
}
if (!firstName) {
window.location.href = "login_signup.html";
}
// Token fetching logic
async function fetchToken() {
try {
const response = await axios.get(`https://www.spotops360.com/auth/token/${localStorage.getItem("userId")}`);
if (response.status === 200) {
localStorage.setItem("token", response.data.token);
} else {
throw new Error("Failed to fetch token");
}
} catch (error) {
console.error("Error fetching token:", error);
}
}

let token = localStorage.getItem("token");
if (!token) {
await fetchToken();
token = localStorage.getItem("token");
}

// Fetch orders and apply pagination
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
// Array of month names
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
//orders for the current month
try {
const ordersResponse = await axios.get(`https://www.spotops360.com/orders/disputesAfterCancellation?month=${month}&year=${year}`, {
headers: token ? { Authorization: `Bearer ${token}` } : {},
});
if (ordersResponse.status !== 200) {
throw new Error("Failed to fetch current month's orders");
}
allOrders = ordersResponse.data;
var team = localStorage.getItem("team");
const teamAgentsMap = {
  Shankar: ["David", "John"],
  Vinutha: ["Michael", "Mark"],
};

if (team in teamAgentsMap) {
  allOrders = allOrders.filter(order =>
    teamAgentsMap[team].includes(order.salesAgent)
  );
}
var totalOrders = allOrders.length;
console.log("totalOrders",totalOrders)
document.getElementById("showTotalOrders").innerHTML = `Total Disputes after Cancllation- ${totalOrders}`;
sortedData = sortOrdersByOrderNoDesc(allOrders);
renderTableRows(currentPage);
createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));
} catch (error) {
console.error("Error fetching current month's orders:", error);
}
// Filtering functionality for  the search bar
$("#searchInput").on("keyup", function () {
  const value = $(this).val().toLowerCase();

  // Filter the entire allOrders dataset based on the search term
  const filteredOrders = allOrders.filter(order => {
    return (
      (order.orderDate && order.orderDate.toLowerCase().includes(value)) ||
      (order.orderNo && order.orderNo.toLowerCase().includes(value)) ||
      (order.salesAgent && order.salesAgent.toLowerCase().includes(value)) ||
      (order.customerName && order.customerName.toLowerCase().includes(value)) ||
      ((order.pReq || order.partName) && (order.pReq || order.partName).toLowerCase().includes(value)) ||
      (order.additionalInfo.length > 0 &&
        order.additionalInfo[order.additionalInfo.length - 1].yardName &&
        order.additionalInfo[order.additionalInfo.length - 1].yardName.toLowerCase().includes(value)) ||
      (order.orderStatus && order.orderStatus.toLowerCase().includes(value)) ||
      (order.additionalInfo && order.additionalInfo.some(info =>
        (info.trackingNo && String(info.trackingNo).toLowerCase().includes(value))
      )) ||
      (order.additionalInfo.length > 0 &&
        order.additionalInfo[0].escTicked &&
        order.additionalInfo[0].escTicked.toLowerCase().includes(value)) ||
      (order.email && order.email.toLowerCase().includes(value))
    );
  });

  // Update the Total Orders count
  document.getElementById("showTotalOrders").innerHTML = `Total Orders - ${filteredOrders.length}`;

  // Render results or show "no results" message
  if (filteredOrders.length > 0 || value === "") {
    renderTableRows(1, filteredOrders); // First page of filtered results
    createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage), filteredOrders);
  } else {
    $("#infoTable").empty(); 
    $("#infoTable").append(`<tr><td colspan="11">No matching results found</td></tr>`);
  }
});



// Sort orders by Order No in descending order
function sortOrdersByOrderNoDesc(orders) {
return orders.sort((a, b) => {
const orderNoA = parseInt(a.orderNo.replace(/\D/g, ""), 10);
const orderNoB = parseInt(b.orderNo.replace(/\D/g, ""), 10);
return orderNoB - orderNoA;
});
}

$("#infoTable").on("click", ".process-btn", function () {
const id = $(this).data("id");
window.location.href = `formNew.html?orderNo=${id}&process=true`;
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

role = localStorage.getItem("role");
team = localStorage.getItem("team");
if (team === "Team Charlie") {
$("#submenu-reports .nav-link")
.not(':contains("My Sales Report")')
.hide();
$(
"#submenu-dashboards .in-transit-link, #submenu-dashboards .view-orders-link,#submenu-dashboards .customer-approved-link,#submenu-dashboards .view-all-ordersSheetMode-link ,#submenu-dashboards .fulfilled-orders ,#submenu-dashboards .escalated-orders,#submenu-dashboards .teamA-orders-link, #submenu-dashboards .teamB-orders-link, #submenu-dashboards .placed-orders-link, #submenu-dashboards .cancelled-orders-link, #submenu-dashboards .yard-info-link"
).hide();
$(".nav-item:has(#submenu-teams)").hide();
$(".nav-item:has(#submenu-users)").hide();
} else if (team === "Shankar") {
$('#submenu-reports .nav-link:contains("My Sales Report")').hide();
$(".nav-item:has(#submenu-teams)").hide();
$(".nav-item:has(#submenu-users)").hide();
$("#submenu-dashboards #add-orderS-link, #submenu-dashboards .view-individualOrders-link, .teamB-orders-link").hide();
} else if (team === "Vinutha") {
$('#submenu-reports .nav-link:contains("My Sales Report")').hide();
$(".nav-item:has(#submenu-teams)").hide();
$(".nav-item:has(#submenu-users)").hide();
$("#submenu-dashboards #add-orderS-link, #submenu-dashboards .view-individualOrders-link, .teamA-orders-link").hide();
} else if (role === "Admin" && firstName === "John") {
  console.log("===");
$('#submenu-reports .nav-link:contains("My Sales Report")').show();
$("#submenu-dashboards .view-individualOrders-link").show();
}else if (role === "Admin") {
$('#submenu-reports .nav-link:contains("My Sales Report")').hide();
$('#submenu-reports .nav-link:contains("Refund Report")').show();
$('#submenu-reports .nav-link:contains("Collect Refund")').show();
$("#submenu-dashboards .view-individualOrders-link").hide();
}
$("#filterButton").click(async function () {
  $("body").append('<div class="modal-overlay"></div>');
  $("body").addClass("modal-active");
  $("#loadingMessage").show();

  try {
    let ordersResponse;
    const rangeValue = $("#unifiedDatePicker").val().trim();
    console.log("📅 Unified picker value:", rangeValue);

    let url = "";
    const isToday = $(this).data("filter") === "today";
    const tz = "America/Chicago";

    if (isToday) {
      const today = moment().tz(tz).format("YYYY-MM-DD");
      url = `https://www.spotops360.com/orders/disputesAfterCancellation?start=${today}&end=${today}`;
    } else if (rangeValue.includes(" to ")) {
      const [startStr, endStr] = rangeValue.split(" to ");
      const start = moment.tz(startStr, tz).startOf("day").toISOString();
      const end = moment.tz(endStr, tz).endOf("day").toISOString();
      url = `https://www.spotops360.com/orders/disputesAfterCancellation?start=${start}&end=${end}`;
    } else if (moment(rangeValue, "YYYY-MM", true).isValid()) {
      const momentObj = moment(rangeValue, "YYYY-MM");
      const month = momentObj.format("MMM");
      const year = momentObj.format("YYYY");
      url = `https://www.spotops360.com/orders/disputesAfterCancellation?month=${month}&year=${year}`;
    } else {
      alert("⚠️ Please select a valid date range or click 'Today'.");
      return;
    }

    const response = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    allOrders = response.data;

    const teamAgentsMap = {
      Shankar: ["David", "John"],
      Vinutha: ["Michael", "Mark"],
    };

    const team = localStorage.getItem("team");
    if (team in teamAgentsMap) {
      allOrders = allOrders.filter(order => teamAgentsMap[team].includes(order.salesAgent));
    }

    const filtereddisputesAfterCancellation = allOrders.filter(item => item.orderStatus === "Dispute");

    document.getElementById("showTotalOrders").innerHTML = `Total Disputes after Cancllation - ${filtereddisputesAfterCancellation.length}`;
    renderTableRows(1, filtereddisputesAfterCancellation);
    createPaginationControls(Math.ceil(filtereddisputesAfterCancellation.length / rowsPerPage));
  } catch (error) {
    console.error("Error fetching filtered disputesAfterCancellation:", error);
  } finally {
    $("#loadingMessage").hide();
    $(".modal-overlay").remove();
    $("body").removeClass("modal-active");
    $(this).data("filter", ""); 
  }
});

$("#logoutLink").click(function () {
window.localStorage.clear();
window.location.href = "login_signup.html";
});
const savedMonth = localStorage.getItem('currentMonth');
    currentPage = savedMonth ? parseInt(savedMonth) : 1;
    renderTableRows(currentPage);
    createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage));
$(".sidebar .nav-link").on("click", function () {
    localStorage.removeItem('selectedMonthYear');
    localStorage.removeItem('currentPage');
    console.log("Cleared saved month and page number");
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
 // Toggle Dark Mode
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
  const searchInput = document.getElementById('searchInputForOrderNo');
  const resultDiv = document.getElementById('searchResult');

  searchInput.addEventListener('keydown', function (event) {
  console.log("searching order no");
  if (event.key === 'Enter') {
    const orderNo = searchInput.value.trim();
    if (orderNo !== '') {
      window.location.href = 'formNew.html?orderNo=' + encodeURIComponent(orderNo) + '&process=true';
    }
  }
});
fetchNotifications();
$("#infoTable").on("click", "tr", function () {
        $("#infoTable tr").removeClass("selected");
        $(this).addClass("selected");
    });
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
console.log(column,"---");
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

// Highlight the active arrow correctly
const arrowToActivate = sortAsc ? ".asc" : ".desc";
$(this).find(".sort-icons").children(arrowToActivate).addClass("active");
});
});