$(document).ready(async function () {
  $("#viewAlltasks").on("click", function () {
  window.location.href = "viewAllTasks.html";
});
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
const hour = date.getHours();
const minute = date.getMinutes().toString().padStart(2, '0');
const daySuffix = (day) => {
if (day > 3 && day < 21) return "th"; // All days between 4th and 20th get 'th'
switch (day % 10) {
case 1: return "st";
case 2: return "nd";
case 3: return "rd";
default: return "th";
}
};
var currentDateTime= `${day}${daySuffix(day)} ${month}, ${year} ${hour}:${minute}`; 
console.log("current datetime",currentDateTime)   
// Pagination related variables
let allOrders = [];
const rowsPerPage = 25;
let currentPage = 1;
var lastInfo ;
// Function to render rows based on the page
function renderTableRows(page, orders = allOrders) {
    const filteredOrders = orders.filter((item) => {
  const InfoArray = item.additionalInfo;
  if (!InfoArray || InfoArray.length === 0) return false;

  return InfoArray.some((info) => {
    return info.storeCredit !== null && info.storeCredit !== undefined && !isNaN(info.storeCredit);
  });
});

const start = (page - 1) * rowsPerPage;
const end = start + rowsPerPage;
const ordersForPage = filteredOrders.slice(start, end);
$('#infoTable').empty();
ordersForPage.forEach((item) => {
  let totalStoreCredit = 0;
  let totalCardCharged = 0;
  let refundedBreakdown = '';
  let chargedBreakdown = '';
  let yardInfoDisplay = '';

  item.additionalInfo.forEach((info, index) => {
    if (info.storeCredit !== undefined && !isNaN(info.storeCredit)) {
      const storeCredit = Number(info.storeCredit);
      totalStoreCredit += storeCredit;

      const yardName = info.yardName || `Yard ${index + 1}`;
      const partPrice = Number(info.partPrice) || 0;
      const others = Number(info.others) || 0;

      let shipping = 0;
      if (info.shippingDetails && info.shippingDetails.includes("Yard shipping")) {
        const parts = info.shippingDetails.split(":");
        if (parts.length > 1) {
          shipping = parseFloat(parts[1].trim()) || 0;
        }
      }

      const yardTotal = partPrice + shipping + others;
      totalCardCharged += yardTotal;

      refundedBreakdown += `From ${yardName}: $${storeCredit}<br>`;
      chargedBreakdown += `From ${yardName}: $${yardTotal}<br>`;

      yardInfoDisplay += `
        <div>
          <strong>${yardName}</strong><br>
          Part price: $${partPrice} | Yard shipping: $${shipping} | Others: $${others}<br><br>
        </div>`;
    }
  });

  const datetime = item.orderDate;
  const date = new Date(datetime);
  const day = date.getUTCDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const year = date.getUTCFullYear();
  const suffix = (day) => (day > 3 && day < 21 ? "th" : ["st", "nd", "rd"][day % 10 - 1] || "th");
  const formattedOrderDate = `${day}${suffix(day)} ${monthNames[date.getUTCMonth()]}, ${year}`;
  const actions = generateActions(item);

  const row = `
    <tr>
      <td>${formattedOrderDate}</td>
      <td>${item.orderNo}</td>
      <td>${yardInfoDisplay}</td>
      <td>$${totalCardCharged}<br><small>${chargedBreakdown}</small></td>
      <td>$${totalStoreCredit}<br><small>${refundedBreakdown}</small></td>
      <td>${actions}</td>
    </tr>
  `;

  $('#infoTable').append(row);
});


createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage), filteredOrders);
}

// Helper function to generate action buttons
function generateActions(item) {
  const processButton = `<button class="process-btn" data-id="${item.orderNo}">View</button>`;
  const useButton = `<button class="user-btn" data-id="${item.orderNo}">Use</button>`;
  const usedForButton = `<button class="usedForButton-btn" data-id="${item.orderNo}">Used For</button>`;

  return `
    <div style="display: flex; gap: 6px; flex-wrap: nowrap; align-items: center;">
      ${processButton}
      ${useButton}
      ${usedForButton}
    </div>
  `;
}




// Function to create pagination controls based on filtered data
function createPaginationControls(totalPages, filteredOrders = filteredOrders) {
const paginationControls = $('#pagination-controls');
paginationControls.empty(); 
if (totalPages > 1) {
for (let i = 1; i <= totalPages; i++) {
paginationControls.append(`<button class="pageNos btn ${i === currentPage ? 'active-page' : ''} page-btn" data-page="${i}">${i}</button>`);
}
paginationControls.append(`<button class="previousNext" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`);
}
}

// Event listener for pagination buttons
$('#pagination-controls').on('click', '.page-btn', function () {
const page = $(this).data('page');
currentPage = page;
renderTableRows(currentPage); // Use the filtered orders
});

$('#pagination-controls').on('click', '#prevPage', function () {
if (currentPage > 1) {
currentPage--;
renderTableRows(currentPage); // Use the filtered orders
}
});

$('#pagination-controls').on('click', '#nextPage', function () {
const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
if (currentPage < totalPages) {
currentPage++;
renderTableRows(currentPage); 
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

try {
const [ordersResponse] = await Promise.all([
axios.get("https://www.spotops360.com/orders/storeCredits", {
headers: token ? { Authorization: `Bearer ${token}` } : {},
})
]);
if (ordersResponse.status !== 200) {
throw new Error("Failed to fetch orders");
}
const orders = ordersResponse.data;
allOrders = orders;
// Filter orders based on the required conditions
 filteredOrders = allOrders.filter((item) => {
  const InfoArray = item.additionalInfo;
  if (!InfoArray || InfoArray.length === 0) return false;

  return InfoArray.some((info) => {
    return info.storeCredit !== null && info.storeCredit !== undefined && !isNaN(info.storeCredit);
  });
});

allOrders = sortOrdersByOrderNoDesc(filteredOrders); // Optional sorting
renderTableRows(currentPage); // Render the first page of filtered data
createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage), filteredOrders);
} catch (error) {
console.error("Error fetching orders:", error);
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
(order.additionalInfo.length > 0 && order.additionalInfo[order.additionalInfo.length - 1].yardName && order.additionalInfo[order.additionalInfo.length - 1].yardName.toLowerCase().includes(value)) ||
(order.orderStatus && order.orderStatus.toLowerCase().includes(value)) ||
(order.additionalInfo && order.additionalInfo.some(info => 
(info.trackingNo && String(info.trackingNo).toLowerCase().includes(value)) // Safely handle trackingNo
)) ||
(order.additionalInfo.length > 0 && order.additionalInfo[0].escTicked && order.additionalInfo[0].escTicked.toLowerCase().includes(value)) ||
(order.email && order.email.toLowerCase().includes(value))
);
});

// If a search is active, display the filtered results, otherwise reset to the full dataset
if (filteredOrders.length > 0 || value === "") {
renderTableRows(1, filteredOrders); // Render the first page of filtered results
createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage), filteredOrders);
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


const currentPath = window.location.pathname;
console.log("currentPath",currentPath)
$(".nav-link").each(function () {
if (currentPath.includes($(this).attr("href"))) {
$(this).addClass("active");
}
const activeLink = $(".nav-link.active")[0];
if (activeLink) {
  activeLink.scrollIntoView({ behavior: "smooth", block: "center" });
}

});
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
fetchNotifications();
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
  console.log("Row clicked:", $(this).text()); 
  $("#infoTable tr").removeClass("selected");
  $(this).addClass("selected");
});
// for using store credit
let usedCredits = []; 
let totalStoreCredit = 500;
var orderNoUsingCredit;
$('#infoTable').on('click', '.user-btn', function () {
     orderNoUsingCredit = $(this).data('id'); 
    $('#userModal').modal('show');
    
    // Clear previous inputs
    $('#partialAmount').val('');
    $('#orderNo').val('');
    $('#partialAmountDiv').hide();
    
    // Set up event listeners for radio buttons
    $('input[name="usageType"]').change(function () {
        if ($(this).val() === 'partial') {
            $('#partialAmountDiv').show(); // Show input for partial amount
        } else {
            $('#partialAmountDiv').hide(); // Hide input for partial amount
        }
    });
  });
    // Display the Used For modal with order credit usage details
$('#infoTable').on('click', '.usedForButton-btn', function () {
  const orderNo = $(this).data('id');  
  const order = allOrders.find(o => o.orderNo === orderNo);
  
  if (!order) {
    alert('Order not found!');
    return;
  }
  const usedForData = order.additionalInfo
    .flatMap(info => info.storeCreditUsedFor)  
    .map(data => `Order No: ${data.orderNo}    Amount: $${data.amount}`);  
  const usedForMessage = usedForData.length > 0 ? usedForData.join('<br>') : 'No store credits used for this order.';
  $('#usedForModal .modal-body').html(usedForMessage);
  $('#usedForModal').modal('show');  
});

    $('#submitUsage').on('click', async function () {
  const usageType = $('input[name="usageType"]:checked').val();
  const amount = usageType === 'partial' ? parseFloat($('#partialAmount').val()) : totalStoreCredit;
  const orderNoUsedFor = $('#orderNo').val();  // This is the order number for which the credit is being used
  const orderNo = orderNoUsingCredit;  // The order number from which credit is being used
  console.log("orderNoUsingCredit",orderNoUsingCredit)
  if (usageType === 'partial' && (isNaN(amount) || amount <= 0 || amount > totalStoreCredit)) {
    alert('Invalid amount for partial use!');
    return;
  }

  try {
    const response = await axios.patch(`/orders/${orderNo}/storeCredits`, {
      usageType: usageType,
      amountUsed: amount,
      orderNoUsedFor: orderNoUsedFor,  // Send the orderNo from which the credit is being used
    });

    // Handle success (e.g., update UI)
    alert('Store credit successfully updated!');
    $('#userModal').modal('show');
    window.location.reload();
  } catch (error) {
    alert('Error updating store credit!');
    $('#userModal').modal('show');
    window.location.reload();
    console.error(error);
  }
});

  function updateUsedCreditsDisplay() {
    // Display the used order numbers and amounts
    const usedList = usedCredits.map(item => `<li>Order No: ${item.orderNo} | Amount Used: $${item.amountUsed}</li>`).join('');
    $('#usedCreditsList').html(usedList);
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
    const reason = order.cancellationReason || "Unknown";
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