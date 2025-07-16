$(document).ready(async function () {
  $("#viewAlltasks").on("click", function () {
  window.location.href = "viewAllTasks.html";
});
// Pagination related variables
let allOrders = [];
const rowsPerPage = 25;
let currentPage = 1;

function calculateAndUpdateTotals(orders) {
    let totalEstGP = 0;
    let totalCurrentGP = 0;
    let totalActualGP = 0;

    orders.forEach(order => {
        totalEstGP += order.grossProfit || 0;
        totalCurrentGP += calculateCurrentGP(order);
        totalActualGP += order.actualGP || 0;
    });

    // Update the totals in the UI
    document.getElementById("totalEstGP").innerHTML = `<i class="fas fa-chart-line"></i>Est GP: <strong>$${totalEstGP.toFixed(2)}</strong>`;
    document.getElementById("totalCurrentGP").innerHTML = `<i class="fas fa-dollar-sign"></i>Current GP: <strong>$${totalCurrentGP.toFixed(2)}</strong>`;
    document.getElementById("totalActualGP").innerHTML = `<i class="fas fa-check-circle"></i>Actual GP: <strong>$${totalActualGP.toFixed(2)}</strong>`;
}


function renderFilteredOrders(agentName) {
// Filter orders based on the salesAgent field
filteredOrders = allOrders.filter(order =>
order.salesAgent?.toLowerCase().includes(agentName.toLowerCase())
);

// Update totals dynamically
calculateAndUpdateTotals(filteredOrders);

// Update the total orders dynamically
document.getElementById("showTotalOrders").innerHTML = `Total No. of Orders: ${filteredOrders.length}`;

// Render the filtered orders in the table
renderTableRows(1, filteredOrders);
createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage), currentPage);
}

// Attach change event to the dropdown
let filteredOrders = []; 
$("#userDropdown").on("change", function () {
    const selectedAgent = $(this).val();

    // Reset page to 1
    currentPage = 1;

    if (selectedAgent && selectedAgent !== "All") {
        filteredOrders = allOrders.filter(order =>
            order.salesAgent?.toLowerCase().includes(selectedAgent.toLowerCase())
        );

        calculateAndUpdateTotals(filteredOrders);
        document.getElementById("showTotalOrders").innerHTML = `Total No. of Orders: ${filteredOrders.length}`;

        renderTableRows(currentPage, filteredOrders);
        createPaginationControls(
            Math.ceil(filteredOrders.length / rowsPerPage),
            filteredOrders
        );
    } else {
        filteredOrders = allOrders;

        calculateAndUpdateTotals(allOrders);
        document.getElementById("showTotalOrders").innerHTML = `Total No. of Orders: ${allOrders.length}`;

        renderTableRows(currentPage, allOrders);
        createPaginationControls(
            Math.ceil(allOrders.length / rowsPerPage),
            allOrders
        );
    }
});

// Calculate totals at initial load
calculateAndUpdateTotals(allOrders);

// Function to render rows based on the page
function renderTableRows(page, orders= allOrders) {
const start = (page - 1) * rowsPerPage;
const end = start + rowsPerPage;
const ordersForPage = orders.slice(start, end);

$("#infoTable").empty(); // Clear the table

ordersForPage.forEach(order => {
const currentGP = calculateCurrentGP(order); // Dynamically calculate `currentGP`
let actualG = order.actualGP;
if(actualG !== undefined){
  actualG = order.actualGP;
  actualG.toFixed(2)
}else{
  actualG = 0;
}
console.log("actualG",actualG);
const datetime = order.orderDate;
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
$("#infoTable").append(`
<tr>
<td>${formattedOrderDate}</td>
<td>${order.orderNo}</td>
<td>${order.salesAgent}</td>
<td>${
(order.fName && order.lName)
? `${order.fName} ${order.lName}`
: (order.customerName || "")
}</td>
<td>${order.pReq || ''}</td>
<td>${order.orderStatus || ''}</td>
<td>$${order.soldP || 0}</td>
<td>$${order.grossProfit || 0}</td>
<td>$${currentGP.toFixed(2)}</td>
<td>$${actualG.toFixed(2)|| 0}</td>
</tr>
`);
});
}

function calculateCurrentGP(order) {
if (!order.additionalInfo || order.additionalInfo.length === 0) return 0;

let totalYardSpent = 0;

order.additionalInfo.forEach(info => {
const yardPP = parseFloat(info.partPrice) || 0;
const yardOSorYS = info.shippingDetails || '';
let shippingValueYard = 0;

if (yardOSorYS.includes("Own shipping")) {
shippingValueYard = parseFloat(yardOSorYS.split(":")[1].trim()) || 0;
} else if (yardOSorYS.includes("Yard shipping")) {
shippingValueYard = parseFloat(yardOSorYS.split(":")[1].trim()) || 0;
}

const yardOthers = parseFloat(info.others) || 0;
const escOwnShipReturn = parseFloat(info.custOwnShippingReturn) || 0;
const escOwnShipReplacement = parseFloat(info.custOwnShipReplacement) || 0;
const yardOwnShippingReplacement = parseFloat(info.yardOwnShipping) || 0;
const yardRefundAmount = parseFloat(info.refundedAmount) || 0;

// Include only valid expenses based on conditions
if (
info.status !== "PO cancelled" ||
(info.status === "PO cancelled" && info.paymentStatus === "Card charged")
) {
totalYardSpent +=
yardPP +
shippingValueYard +
yardOthers +
escOwnShipReturn +
escOwnShipReplacement +
yardOwnShippingReplacement -
yardRefundAmount;
}
});

const spMinusTax = order.soldP - (order.salestax || 0);
const custRefundedAmount = parseFloat(order.custRefundedAmount) || 0;
const subtractRefund = spMinusTax - custRefundedAmount;

return subtractRefund - totalYardSpent;
}
// <td>${sendInvoice}</td>
var firstname = localStorage.getItem("firstName");
if (firstName) {
$("#user-name").text(firstName);
}
if (!firstName) {
window.location.href = "login_signup.html";
}
// Function to create pagination controls
function createPaginationControls(totalPages,currentPageArg = 1) {
  const paginationControls = $('#pagination-controls');
  paginationControls.empty(); // Clear existing buttons

  if (totalPages > 1) {
    // Left arrow for "Previous" page
    paginationControls.append(`
      <button class="previousNext" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>←</button>
    `);

    // Page number display: Page X of Y
    paginationControls.append(`
      <span class="page-info">Page ${currentPageArg} of ${totalPages}</span>
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
    renderTableRows(currentPage, filteredOrders.length ? filteredOrders : allOrders);
    createPaginationControls(totalPages, currentPage);
  }
});

$('#pagination-controls').on('click', '#nextPage', function () {
  const totalPages = Math.ceil((filteredOrders.length ? filteredOrders.length : allOrders.length) / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTableRows(currentPage, filteredOrders.length ? filteredOrders : allOrders);
    createPaginationControls(totalPages, currentPage);
  }
});
// Token fetching logic
var token;
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

token = localStorage.getItem("token");
if (!token) {
await fetchToken();
token = localStorage.getItem("token");
}

// //orders for the current month
// try {
// const ordersResponse = await axios.get(`https://www.spotops360.com/orders/monthly?month=${month}&year=${year}`, {
// headers: token ? { Authorization: `Bearer ${token}` } : {},
// });

// if (ordersResponse.status !== 200) {
// throw new Error("Failed to fetch current month's orders");
// }

// allOrders = ordersResponse.data;
// var totalOrders = allOrders.length;
// console.log("totalOrders",totalOrders)
// document.getElementById("showTotalOrders").innerHTML = `Total Orders This Month- ${totalOrders}`;
// calculateAndUpdateTotals(allOrders);
// sortedData = sortOrdersByOrderNoDesc(allOrders);
// renderTableRows(currentPage);
// createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));
// } catch (error) {
// console.error("Error fetching current month's orders:", error);
// }
// Initial data fetch and rendering
async function fetchOrders() {
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
try {
const ordersResponse = await axios.get(
  `https://www.spotops360.com/orders/monthly?month=${month}&year=${year}&limit=all`,
  {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }
);
if (ordersResponse.status !== 200) {
throw new Error("Failed to fetch current month's orders");
}

allOrders = ordersResponse.data.orders;
document.getElementById("showTotalOrders").innerHTML = `Total No. of Orders: ${allOrders.length}`;

// Calculate totals and render the first page
calculateAndUpdateTotals(allOrders);
createPaginationControls(Math.ceil(allOrders.length / rowsPerPage), 1);
renderTableRows(1, allOrders); // Render the first page
} catch (error) {
console.error("Error fetching orders:", error);
}
}

await fetchOrders();

$("#searchInput").on("keyup", function () {
const value = $(this).val().toLowerCase();
const filteredOrders = allOrders.filter(order => {
const basicSearch = (
(order.soldP && String(order.soldP).toLowerCase().includes(value)) || // Converting soldP to string
(order.grossProfit && String(order.grossProfit).toLowerCase().includes(value)) || 
(order.actualGP && String(order.actualGP).toLowerCase().includes(value)) || 
(order.orderDate && order.orderDate.toLowerCase().includes(value)) ||
(order.salesAgent && order.salesAgent.toLowerCase().includes(value)) ||
(order.bAddressStreet && order.bAddressStreet.toLowerCase().includes(value)) ||
(order.bAddressCity && order.bAddressCity.toLowerCase().includes(value)) ||
(order.bAddressState && order.bAddressState.toLowerCase().includes(value)) ||
(order.bAddressZip && order.bAddressZip.toLowerCase().includes(value)) ||
(order.bAddressAcountry && order.bAddressAcountry.toLowerCase().includes(value)) ||
(order.sAddressStreet && order.sAddressStreet.toLowerCase().includes(value)) ||
(order.sAddressState && order.sAddressState.toLowerCase().includes(value)) ||
(order.sAddressZip && order.sAddressZip.toLowerCase().includes(value)) ||
(order.sAddressAcountry && order.sAddressAcountry.toLowerCase().includes(value)) ||
(order.attention && order.attention.toLowerCase().includes(value)) ||
(order.orderNo && order.orderNo.toLowerCase().includes(value)) ||
(order.salesAgent && order.salesAgent.toLowerCase().includes(value)) ||
(order.customerName && order.customerName.toLowerCase().includes(value)) ||
(order.bAddress && order.bAddress.toLowerCase().includes(value)) ||
(order.sAddress && order.sAddress.toLowerCase().includes(value)) ||
((order.pReq || order.partName) && (order.pReq || order.partName).toLowerCase().includes(value)) ||
(order.orderStatus && order.orderStatus.toLowerCase().includes(value)) ||
(order.email && order.email.toLowerCase().includes(value)) ||
(order.additionalInfo && order.additionalInfo.some(info => 
(info.trackingNo && String(info.trackingNo).toLowerCase().includes(value)) // Safely handle trackingNo
)) ||
(order.phone && order.phone.toLowerCase().includes(value)) ||  // Added phone
(order.make && order.make.toLowerCase().includes(value)) ||    // Added make
(order.year && order.year.toString().toLowerCase().includes(value)) || // Added year
(order.model && order.model.toLowerCase().includes(value))     // Added model
);

// Check if any yard detail (including stockNo) matches the search term
const yardSearch = order.additionalInfo && order.additionalInfo.some((info, index) => {
const yardLabel = `yard ${index + 1}`; // e.g., "Yard 1", "Yard 2"
return (
yardLabel.includes(value) || 
(info.yardName && info.yardName.toLowerCase().includes(value)) ||
(info.email && info.email.toLowerCase().includes(value)) || 
(info.escTicked && info.escTicked.toLowerCase().includes(value)) || 
(info.status && info.status.toLowerCase().includes(value)) ||
(info.stockNo && info.stockNo.toLowerCase().includes(value)) // Added stockNo
);
});

// Return true if any of the basic fields or yard details match the search term
return basicSearch || yardSearch;
});

// If a search is active, display the filtered results, otherwise reset to the full dataset
if (filteredOrders.length > 0 || value === "") {
renderTableRows(1, filteredOrders); // Render the first page of filtered results
createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage), currentPage);
} else {
$("#infoTable").empty(); // Clear the table if no results are found
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
$("#infoTable").on("click", ".edit-btn", function () {
const id = $(this).data("id");
window.location.href = `form.html?orderNo=${id}`;
});

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

role = localStorage.getItem("role");
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
// function to filter out data with month and year
$("#filterButton").click(async function () {
    $("body").append('<div class="modal-overlay"></div>');
    $("body").addClass("modal-active");
    $("#loadingMessage").show();

    const monthYear = $("#monthYearPicker").val();
    const [year, monthNumber] = monthYear.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[parseInt(monthNumber, 10) - 1];

    try {
        const ordersResponse = await axios.get(
  `https://www.spotops360.com/orders/monthly?month=${month}&year=${year}&limit=all`,
  {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }
);

        if (ordersResponse.status !== 200) {
            throw new Error("Failed to fetch filtered orders");
        }

        // Update the orders and display them
        allOrders = ordersResponse.data.orders;
        document.getElementById("showTotalOrders").innerHTML = `Total No. of Orders: ${allOrders.length}`;

        // Recalculate totals and update them
        calculateAndUpdateTotals(allOrders);
     $("#userDropdown").val("Select");
        // Render the filtered orders
        renderTableRows(1, allOrders);
        createPaginationControls(Math.ceil(allOrders.length / rowsPerPage), 1);


    } catch (error) {
        console.error("Error fetching filtered orders:", error);
    } finally {
        // Hide the loading message and overlay
        $("#loadingMessage").hide();
        $(".modal-overlay").remove();
        $("body").removeClass("modal-active");
    }
});

$("#logoutLink").click(function () {
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
fetchNotifications(); 
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