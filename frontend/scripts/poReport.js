$(document).ready(async function () {
  $("#viewAlltasks").on("click", function () {
  window.location.href = "viewAllTasks.html";
});
let yardOrders = [];
const rowsPerPage = 25;
let currentPage = 1;  
let currentSort = {
column: "",
order: "asc", // ascending by default
};

function sortTable(column, order, isDateColumn, isYardColumn) {
const tbody = $("#yardInfoTable");
const rows = tbody.find("tr").toArray();
rows.sort(function (a, b) {
let cellA = $(a).find("td").eq(column).text().trim();
let cellB = $(b).find("td").eq(column).text().trim();
if (isDateColumn) {
// Convert date strings into Date objects for sorting
cellA = new Date(cellA);
cellB = new Date(cellB);
return order === "asc" ? cellA - cellB : cellB - cellA;
} else if (isYardColumn) {
// Sort Yard columns alphabetically
return order === "asc"
? cellA.localeCompare(cellB)
: cellB.localeCompare(cellA);
} else {
// General string comparison for other columns
return order === "asc"
? cellA.localeCompare(cellB)
: cellB.localeCompare(cellA);
}
});

// Append sorted rows back to the table body
$.each(rows, function (index, row) {
tbody.append(row);
});
}

// Click event for sorting columns with numerical values and dates
$(document).on("click", ".onlyNumber", function () {
const column = $(this).closest("th").index();
const sortBy = $(this).closest("th").data("sort");

// Ensure sortBy is defined before using it
if (!sortBy) return;

// Determine if the column is a date column or Yard column
const isDateColumn = sortBy === "orderDate";
const isYardColumn = sortBy.startsWith("yard");

// Toggle the sort order
currentSort.order =
currentSort.column === sortBy && currentSort.order === "asc"
? "desc"
: "asc";
currentSort.column = sortBy;

sortTable(column, currentSort.order, isDateColumn, isYardColumn);

// Update sort icon
$(".sort-icon").html("&#9650;"); 
$(this)
.find(".sort-icon")
.html(currentSort.order === "asc" ? "&#9650;" : "&#9660;"); 
});
// Click event for sorting Yard columns
$(document).on("click", ".fYardName", function () {
const column = $(this).closest("th").index();
const sortBy = $(this).closest("th").data("sort");
const isYardColumn = sortBy.startsWith("yard");
currentSort.order =
currentSort.column === sortBy && currentSort.order === "asc"
? "desc"
: "asc";
currentSort.column = sortBy;

sortTable(column, currentSort.order, false, isYardColumn);
$(".fYardName").html("&#9650;");
$(this).html(currentSort.order === "asc" ? "&#9650;" : "&#9660;");
});

$(document).on(
"click",
"th[data-sort], th[data-sort] .sort-icon",
function (event) {
const $target = $(event.target);
const $th = $target.closest("th");
const column = $th.index();
const sortBy = $th.data("sort");
const isDateColumn = sortBy === "orderDate";
const isYardColumn = sortBy.startsWith("yard");
currentSort.order =
currentSort.column === sortBy && currentSort.order === "asc"
? "desc"
: "asc";
currentSort.column = sortBy;

sortTable(column, currentSort.order, isDateColumn, isYardColumn);
$("th[data-sort] .sort-icon").html("&#9650;"); 
$th
.find(".sort-icon")
.html(currentSort.order === "asc" ? "&#9650;" : "&#9660;"); 
}
);

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

const token = localStorage.getItem("token");
var team;
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
await fetchYardInfo(month, year);

async function fetchAllMonthlyOrders({ month, year, token }) {
  let page = 1;
  const limit = 100;
  let allOrders = [];
  let hasMore = true;

  while (hasMore) {
    const response = await axios.get("https://www.spotops360.com/orders/monthly", {
      params: { month, year, page, limit },
      headers: { Authorization: `Bearer ${token}` }
    });

    const orders = response.data.orders;
    if (!orders.length) break;

    allOrders = allOrders.concat(orders);
    page++;
    hasMore = orders.length === limit;
  }

  return allOrders;
}
// Fetch yard info data for a specific month and 
async function fetchYardInfo(month, year) {
  try {
    $("#loadingMessage").show();

    const allOrders = await fetchAllMonthlyOrders({ month, year, token });
    yardOrders = allOrders.filter(order =>
      order.additionalInfo.some(info => info.paymentStatus === "Card charged")
    );

    // Calculate spends
    let totalSpend = 0;
    yardOrders.forEach(order => {
      let orderSpend = 0;
      order.additionalInfo.forEach(info => {
        if (info.paymentStatus === "Card charged") {
          const shippingCost = info.shippingDetails
            ? parseFloat(info.shippingDetails.split(":")[1]?.trim()) || 0
            : 0;
          const partPrice = parseFloat(info.partPrice || 0);
          const others = parseFloat(info.others || 0);
          const refundedAmount = parseFloat(info.refundedAmount || 0);

          const itemSpend = partPrice + others + shippingCost - refundedAmount;
          orderSpend += itemSpend;
        }
      });
      order.totalSpend = orderSpend;
      totalSpend += orderSpend;
    });

    console.log("Total spend:", totalSpend);
    currentPage = 1;
    renderTableRows(currentPage, yardOrders);
    createPaginationControls(Math.ceil(yardOrders.length / rowsPerPage));

  } catch (error) {
    console.error("Error fetching yard info:", error);
    alert("Failed to fetch data");
  } finally {
    $("#loadingMessage").hide();
  }
}

function renderTableRows(page, data = yardOrders) {
const start = (page - 1) * 25;
const end = start + 25;
const pageData = data.slice(start, end);
const tableHeader = $("#tableHeader");
const tableFooter = $("#tableFooter");
$("#yardInfoTable").empty();
let maxYards = 0;
let totalPartPriceSum = 0;
let totalShippingSum = 0;
let totalOverallSum = 0;
let totalRefundsSum = 0;
let totalOthersSum = 0;
let totalOverallRefund = 0;
$("#yardInfoTable").empty();
pageData.forEach((item) => {
if (item.additionalInfo.length > maxYards) {
maxYards = item.additionalInfo.length;
}
});
tableHeader.find("th:gt(1)").remove(); 
for (let i = 1; i <= maxYards; i++) {
tableHeader.append(
`<th style="text-align:center;cursor: pointer" scope="col" data-sort="yard${i}">Yard ${i} <span class="sort-icon fYardName">&#9650;</span></th>`
);
}
tableHeader.append(
'<th "style="text-align:center;cursor: pointer" scope="col" data-sort="totalPartPrice">Total Part Price <span class="sort-icon onlyNumber">&#x25B2;</span></th>'
);
tableHeader.append(
'<th style="text-align:center;cursor: pointer" scope="col" data-sort="totalShipping">Total Shipping($) <span class="sort-icon onlyNumber">&#x25B2;</span></th>'
);
tableHeader.append(
'<th style="text-align:center;cursor: pointer" scope="col" data-sort="others">Other Charges($) <span class="sort-icon onlyNumber">&#x25B2;</span></th>'
);
tableHeader.append(
'<th style="text-align:center;cursor: pointer" scope="col" data-sort="refunds">Refunds($) <span class="sort-icon onlyNumber">&#x25B2;</span></th>'
);
tableHeader.append(
'<th style="text-align:center;cursor: pointer" scope="col" data-sort="overallSum">Overall Purchase Cost($) <span class="sort-icon onlyNumber">&#x25B2;</span></th>'
);
tableHeader.append('<th scope="col">Actions</th>');

pageData.forEach((item) => {
let appendOrder = false;
let yardInfoHtml = "";
let totalPartPrice = 0;
let totalShipping = 0;
let otherCharges = 0;
let overallPurchaseCost = 0;
let totalOveralls = 0;
let overAllwithRefund = 0;
let tRefunds = 0;
let overallAppend = 0;

for (let i = 0; i < maxYards; i++) {
if (item.additionalInfo[i]) {
appendOrder = true;
const partPrice = parseFloat(
item.additionalInfo[i].partPrice || 0
);
let otherC = parseFloat(item.additionalInfo[i].others || 0);
let shippingDetails = item.additionalInfo[i].shippingDetails;
let shippingCharge = 0;
let shippingType = "";
let refunds = parseFloat(
item.additionalInfo[i].refundedAmount || 0
);
console.log("refunds", refunds);
if (shippingDetails) {
const shippingArray = shippingDetails.split(":");
shippingCharge = parseFloat(shippingArray[1]?.trim() || 0);
shippingType = shippingDetails.split(":")[0].trim();
}
totalPartPrice += partPrice;
totalShipping += shippingCharge;
otherCharges += otherC;
tRefunds += refunds;
overallPurchaseCost = partPrice + shippingCharge + otherC;
overAllwithRefund = overallPurchaseCost - refunds;
console.log(
overallPurchaseCost,
"overall with refunds",
overAllwithRefund
);
totalOveralls += overAllwithRefund;
console.log("yotalOveralls", totalOveralls);
yardInfoHtml += `<td>
${item.additionalInfo[i].yardName || ""}${
item.additionalInfo[i].yardName ? "" : ""
}<br>
${item.additionalInfo[i].email || ""}<br>
${item.additionalInfo[i].phone || ""}<br>
Part price: ${item.additionalInfo[i].partPrice}  | ${item.additionalInfo[i].shippingDetails} |  Others: ${item.additionalInfo[i].others} <br>
</td>`;
} else {
yardInfoHtml += "<td></td>";
}
}

if (appendOrder) {
totalPartPriceSum += totalPartPrice;
totalShippingSum += totalShipping;
totalOthersSum += otherCharges;
totalOverallSum += overAllwithRefund;
totalRefundsSum += tRefunds;
console.log("overall after refund", totalOverallSum);
const datetime = item.orderDate;
const date = new Date(datetime);
const day = date.getUTCDate();  // Use UTC day
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const year = date.getUTCFullYear();  // Use UTC year

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
$("#yardInfoTable").append(
`<tr>
<td>${item.orderNo}</td>
<td>${formattedOrderDate}</td>
${yardInfoHtml}
<td>${totalPartPrice.toFixed(2)}</td>
<td>${totalShipping.toFixed(2)}</td>
<td>${otherCharges.toFixed(2)}</td>
<td>${tRefunds.toFixed(2)}</td>
<td>${totalOveralls.toFixed(2)}</td>
<td><button class="btn btn-success btn-sm process-btn" data-id="${
item.orderNo
}" style="background-color: #cae8c9;
border: none;
color: #61a55e;">View</button></td>
</tr>`
);
}
});

let footerHtml = "<tr>";
for (let i = 0; i <= maxYards + 1; i++) {
footerHtml += "<td></td>";
}
footerHtml += `
<td id="totalPartPrice" style="text-align:center;">$${totalPartPriceSum.toFixed(
2
)}</td>
<td id="totalShipping" style="text-align:center;">$${totalShippingSum.toFixed(
2
)}</td>
<td id="others" style="text-align:center;">$${totalOthersSum.toFixed(
2
)}</td>
<td></td>
</tr>`;
tableFooter.html(footerHtml);
}

$("#yardInfoTable").on("click", ".process-btn", function () {
const id = $(this).data("id");
window.location.href = `form.html?orderNo=${id}&process=true`;
});

function createPaginationControls(totalPages, orders = yardOrders) {
const paginationControls = $('#pagination-controls');
paginationControls.empty(); // Clear pagination controls

if (totalPages > 1) {
paginationControls.append(`<button class="previousNext" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`);

for (let i = 1; i <= totalPages; i++) {
paginationControls.append(`<button class="pageNos btn ${i === currentPage ? 'active-page' : ''} page-btn" data-page="${i}">${i}</button>`);}

paginationControls.append(`<button class="previousNext" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`);
}
}


// Event listener for pagination buttons
$('#pagination-controls').on('click', '.page-btn', function () {
const page = $(this).data('page');
currentPage = page;
renderTableRows(currentPage);
createPaginationControls(Math.ceil(yardOrders.length / 25));
});

// "Previous" and "Next" button functionality
$('#pagination-controls').on('click', '#prevPage', function () {
  if (currentPage > 1) {
    currentPage--;
    renderTableRows(currentPage, yardOrders);
    createPaginationControls(Math.ceil(yardOrders.length / rowsPerPage));
  }
});

$('#pagination-controls').on('click', '#nextPage', function () {
  const totalPages = Math.ceil(yardOrders.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTableRows(currentPage, yardOrders);
    createPaginationControls(totalPages);
  }
});
// Filter by month and year
$("#filterButton").click(async function () {
const monthYear = $("#monthYearPicker").val(); 
const [year, monthNumber] = monthYear.split("-");
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const month = months[parseInt(monthNumber, 10) - 1];
await fetchYardInfo(month, year);
currentPage = 1;
renderTableRows(currentPage);
createPaginationControls(Math.ceil(yardOrders.length / 25));
});

// Search functionality
$("#searchInput").on("keyup", function () {
const searchValue = $(this).val().toLowerCase();
const filteredData = yardOrders.filter(order => {
return (
order.orderNo.toString().includes(searchValue) ||
order.orderDate.toLowerCase().includes(searchValue)
);
});
renderTableRows(1, filteredData);
createPaginationControls(Math.ceil(filteredData.length / 25));
});



var firstName = localStorage.getItem("firstName");
const lastName = localStorage.getItem("lastName");
const role = localStorage.getItem("role");
const email = localStorage.getItem("email");

if (firstName) {
$("#user-name").text(firstName);
}
if (!firstName) {
window.location.href = "login_signup.html";
}

const currentPath = window.location.pathname;
$(".nav-link").each(function () {
if (currentPath.includes($(this).attr("href"))) {
$(this).addClass("active");
}
});

$("#profileLink").click(function () {
$("#profileFirstName").val(firstName);
$("#profileLastName").val(lastName);
$("#profileEmail").val(email);
$("#profileRole").val(role);
$("#profileModal").modal("show");
});

$("#backToOrders").click(function () {
$("#profile-content").addClass("d-none");
$("#purchases-content").removeClass("d-none");
});

$("#searchInput").on("keyup", function () {
let value = $(this).val().toLowerCase();
let totalPartPriceSum = 0;
let totalShippingSum = 0;
let totalOthersSum = 0;
let totalOverallSum = 0;
let totalRefundsSum = 0;

$("#yardInfoTable tr").filter(function () {
const isMatch = $(this).text().toLowerCase().indexOf(value) > -1;
$(this).toggle(isMatch);

if (isMatch) {
const partPrice =
parseFloat($(this).find("td").eq(-6).text().replace("$", "")) ||
0;
const shipping =
parseFloat($(this).find("td").eq(-5).text().replace("$", "")) ||
0;
const others =
parseFloat($(this).find("td").eq(-3).text().replace("$", "")) ||
0;
const refunds =
parseFloat($(this).find("td").eq(-2).text().replace("$", "")) ||
0;
const overall =
parseFloat($(this).find("td").eq(-1).text().replace("$", "")) ||
0;

totalPartPriceSum += partPrice;
totalShippingSum += shipping;
totalOthersSum += others;
totalOverallSum += overall;
totalRefundsSum += refunds;
}
});

$("#totalPartPrice").text(`$${totalPartPriceSum.toFixed(2)}`);
$("#totalShipping").text(`$${totalShippingSum.toFixed(2)}`);
$("#others").text(`$${totalOthersSum.toFixed(2)}`);
$("#overallSum").text(`$${totalOverallSum.toFixed(2)}`);
$("#overallSum").text(`$${totalRefundsSum.toFixed(2)}`);
});

$(".toggle-sidebar").on("click", function () {
$("#offcanvasSidebar").toggleClass("show");
});

$(".nav-link").on("click", function () {
$(".nav-link").removeClass("active selected");
$(this).addClass("selected");

const contentMap = {
"default-link": "#purchases-content",
"add-order-link": "#add-order-content",
"view-order-link": "#view-order-content",
};

$(".main-content > div").addClass("d-none");
$(contentMap[this.id]).removeClass("d-none");
$("#offcanvasSidebar").removeClass("show");
});

$(".chevron-icon, .nav-link").on("click", function (event) {
event.stopPropagation();
const submenu = $(this).closest(".nav-item").find(".submenu");
submenu.toggle();
$(this).find("i").toggleClass("fa-chevron-right fa-chevron-down");
$(this).closest(".nav-link").toggleClass("selected");
});

team = localStorage.getItem("team");
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

$("#logoutLink").on("click", function () {
window.localStorage.clear();
window.location.href = "login_signup.html";
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

  searchInput.addEventListener('input', function () {
    const orderNo = searchInput.value.trim();

    if (orderNo !== '') {
      resultDiv.innerHTML = `
        <button class="btn btn-primary btn-sm" id="viewOrderBtn">View Order</button>
      `;

      document.getElementById('viewOrderBtn').addEventListener('click', function () {
       window.location.href = 'form.html?orderNo=' + encodeURIComponent(orderNo) + '&process=true';

      });
    } else {
      resultDiv.innerHTML = '';
    }
  });
fetchNotifications();
});
