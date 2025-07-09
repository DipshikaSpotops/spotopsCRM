$(document).ready(async function () {
  $("#viewAlltasks").on("click", function () {
  window.location.href = "viewAllTasks.html";
});
$(document).ready(function () {
  // Apply dark mode on page load
  if (localStorage.getItem("darkMode") === "true") {
    enableDarkMode();
  } else {
    disableDarkMode();
  }

  // Toggle on icon click
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
});


let debounceTimer;
$("#searchInput").on("input", function () {
  clearTimeout(debounceTimer);
  const searchTerm = $(this).val().trim();
  localStorage.setItem("viewAllOrdersSearch", searchTerm); // Save to localStorage
  debounceTimer = setTimeout(() => {
    currentPage = 1;
    fetchOrders(currentPage, searchTerm);
  }, 300);
});
let allOrders = [];


// Sorting Order Object
var team, role;
let sortOrder = {
orderDate: "asc",
orderNo: "asc",
agentName: "asc",
customerName: "asc",
partName: "asc",
yard: "asc",
orderStatus: "asc",
email: "asc",
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
$("#infoTableHeader .sort-icons .asc, .sort-icons .desc").removeClass("active");

// Highlight the active arrow correctly
const arrowToActivate = sortAsc ? ".asc" : ".desc";
$(this).find(".sort-icons").children(arrowToActivate).addClass("active");
return null;
}
// Sort the table by the Order Date column
function sortTableByDate() {
const table = $("#infoTable");
const rows = table.find("tr").toArray(); 

rows.sort((a, b) => {
let dateA = parseCustomDate($(a).find("td").eq(0).text().trim()); 
let dateB = parseCustomDate($(b).find("td").eq(0).text().trim());
if (!dateA) return 1;
if (!dateB) return -1;
if (sortOrder.orderDate === "asc") {
return dateA - dateB;
} else {
return dateB - dateA;
}
});
$.each(rows, function (index, row) {
table.append(row);
});
sortOrder.orderDate = sortOrder.orderDate === "asc" ? "desc" : "asc";
updateSortIcons(0, sortOrder.orderDate);
}
$("th").eq(0).on("click", function () {
    sortTableByDate();
});
function sortTable(column, type) {
const table = $("#infoTable");
const rows = table.find("tr").toArray();

rows.sort((a, b) => {
let valA = $(a).find("td").eq(column).text().trim();
let valB = $(b).find("td").eq(column).text().trim();
if (type === "number") {
valA = parseInt(valA.replace(/\D/g, ""), 10);
valB = parseInt(valB.replace(/\D/g, ""), 10);
}

if (sortOrder[type] === "asc") {
return valA > valB ? 1 : -1;
} else {
return valA < valB ? 1 : -1;
}
});

$.each(rows, function (index, row) {
table.append(row);
});

// Toggle sort order
sortOrder[type] = sortOrder[type] === "asc" ? "desc" : "asc";

// Update the sort icon
updateSortIcons(column, sortOrder[type]);
}

function updateSortIcons(columnIndex, order) {
$("th .sort-icon").html("&#9650;"); 
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
} else if (type === "orderno") {
th.on("click", function () {
sortTable(index, "number");
});
} else {
th.on("click", function () {
sortTable(index, type);
});
}
});
const rowsPerPage = 25;
let currentPage = 1;
const savedSearch = localStorage.getItem("viewAllOrdersSearch");
if (savedSearch) {
  $("#searchInput").val(savedSearch);
  fetchOrders(currentPage, savedSearch);
} else {
  fetchOrders(currentPage);
}
// Debounce to avoid too many API calls
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}
// Function to render rows based on the page

// <td>${sendInvoice}</td>
var firstname = localStorage.getItem("firstName");
if (firstName) {
$("#user-name").text(firstName);
}
if (!firstName) {
window.location.href = "login_signup.html";
}
let totalPages = 1 ;
var allDOrders;
 // Function to fetch orders with pagination
 async function fetchOrders(page = 1, searchTerm = "") {
  try {
    const response = await axios.get("https://www.spotops360.com/ordersPerPage", {
      params: { page, limit: rowsPerPage, searchTerm }
    });
    console.log(":rrrr",response);

    const { orders, totalPages: total } = response.data;
    totalPages = total;
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    renderTableRows(orders);
    createPaginationControls(totalPages, page);
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}

  // Function to render table rows
  function renderTableRows(orders) {
    $("#infoTable").empty(); // Clear existing rows

    orders.forEach((item) => {
      const escalationStatus = item.additionalInfo && item.additionalInfo[0]?.escTicked === "Yes" ? "Yes" : "";
      const escalationStyle = item.orderStatus === "Order Fulfilled" && escalationStatus === "Yes" ? 'style="background-color: lightgreen;"' : '';
      // const dateOnly = item.orderDate.split(" ")[0] + " " + item.orderDate.split(" ")[1] + " " + item.orderDate.split(" ")[2];
      const editButton = (team === "Team Mark" || team === "Team Sussane")
        ? "" // Hide the edit button
        : `<button class="edit-btn" data-id="${item.orderNo}" >Edit</button>`;
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
      const actions = `
        ${editButton}
        <button class="process-btn" data-id="${item.orderNo}" ${item.orderStatus === "Placed" || item.orderStatus === "Customer approved" ? "disabled" : ""}>View</button>`;

      $("#infoTable").append(`
        <tr>
          <td class="sticky-col first-col">${formattedOrderDate}</td>
          <td class="sticky-col second-col">${item.orderNo}</td>
          <td>${item.salesAgent}</td>
          <td>
  Customer Name: 
  ${
    (item.fName && item.lName) ? `${item.fName} ${item.lName}` : item.customerName || ""
  }<br>
${item.attention ? `<b>Attention</b>: ${item.attention}<br>` : ""}
${item.sAddress || ""} ${item.sAddressStreet || ""},<br>${item.sAddressCity || ""}, ${item.sAddressState || ""},<br> ${item.sAddressZip || ""}, ${item.sAddressAcountry || ""}<br>
Phone: ${item.phone} | Email: ${item.email}
</td>
<td>Year: ${item.year} | Make: ${item.make} | Model: ${item.model}</br>
Part Description: ${item.desc}</br>
Part No: ${item.partNo} | VIN: ${item.vin}</br>
Warranty: ${item.warranty} days | ${item.programmingRequired === "true" ? `Programming required: ${item.programmingRequired}</br>` : ""}
</td>
          <td>${item.additionalInfo && item.additionalInfo.length > 0 ? item.additionalInfo.map((info, index) => `<b>Yard ${index + 1}</b>:${info.yardName}<br>${info.email} ${info.phone}<br> ${info.status} ${info.stockNo || ""} <br> Part price: $${info.partPrice} | $${info.shippingDetails} | Others: $${info.others || 0}`).join("<br>") : ""}</td>
          <td>${item.orderStatus}</td>
          <td>${item.actualGP ? item.actualGP.toFixed(2) : ""}</td>
          <td ${escalationStyle}>${escalationStatus}</td>
          <td>${actions}</td>
        </tr>
      `);
    });
  }
  $("#infoTable").on("click", ".process-btn", function () {
const id = $(this).data("id");
window.location.href = `form.html?orderNo=${id}&process=true`;
});
  // Function to create pagination controls
  function createPaginationControls(totalPages, currentPage) {
  const paginationControls = $('#pagination-controls');
  paginationControls.empty(); // Clear existing buttons

  if (totalPages > 1) {
    // Left arrow for "Previous" page
    paginationControls.append(`
      <button class="previousNext" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>←</button>
    `);

    // Page number display: Page X of Y
    paginationControls.append(`
      <span class="page-info">Page ${currentPage || 1} of ${totalPages}</span>
    `);

    // Right arrow for "Next" page
    paginationControls.append(`
      <button class="previousNext" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>→</button>
    `);
  }
}

// Handle Next Page Button Click
$('#pagination-controls').on('click', '#nextPage', function () {
  if (currentPage < totalPages) {
    currentPage++;
    const searchTerm = $("#searchInput").val().trim();
    fetchOrders(currentPage, searchTerm);
  }
});

$('#pagination-controls').on('click', '#prevPage', function () {
  if (currentPage > 1) {
    currentPage--;
    const searchTerm = $("#searchInput").val().trim();
    fetchOrders(currentPage, searchTerm);
  }
});

  // Initial fetch
  fetchOrders(currentPage);

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

// // Fetch orders and apply pagination
// try {
// const [ordersResponse, cancelledOrdersResponse] = await Promise.all([
// axios.get("https://www.spotops360.com/orders", {
// headers: token ? { Authorization: `Bearer ${token}` } : {},
// })
// ]);

// if (ordersResponse.status !== 200) {
// throw new Error("Failed to fetch orders");
// }

// var orders = ordersResponse.data;
// allOrders = orders;

// // Sort and render the orders
// allOrders = sortOrdersByOrderNoDesc(allOrders);
// renderTableRows(allOrders);
// createPaginationControls(Math.ceil(allOrders.length / 25));
// } catch (error) {
// console.error("Error fetching orders:", error);
// }

// Filtering functionality
// $("#searchInput").on("keyup", function () {
//   const value = $(this).val().toLowerCase();
//   $("#infoTable tr").filter(function () {
//     $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
//   });
// });

// Filtering functionality for  the search bar
// Update search and pagination dynamically
// $("#searchInput").on(
//   "keyup",function () {
//     const searchTerm = $(this).val().trim();
//     console.log("searchTerm",searchTerm)
//     currentPage = 1;  // Reset to the first page
//     fetchOrders(currentPage, searchTerm);  // Fetch based on search
//  // Debounce by 300ms
// });
// const ordersAll = await axios.get(`https://www.spotops360.com/orders`, {
// headers: token ? { Authorization: `Bearer ${token}` } : {},
// });

//    var  searchOrders = ordersAll.data;
//    console.log('searchInpur',searchOrders);
// $("#searchInput").on("keyup", function () {
// const value = $(this).val().toLowerCase();
// // console.log("allOrders",allDOrders);
// const filteredOrders = searchOrders.filter(order => {
// const basicSearch = (
// (order.soldP && String(order.soldP).toLowerCase().includes(value)) || // Converting soldP to string
// (order.grossProfit && String(order.grossProfit).toLowerCase().includes(value)) || 
// (order.actualGP && String(order.actualGP).toLowerCase().includes(value)) || 
// (order.orderDate && order.orderDate.toLowerCase().includes(value)) ||
// (order.salesAgent && order.salesAgent.toLowerCase().includes(value)) ||
// (order.bAddressStreet && order.bAddressStreet.toLowerCase().includes(value)) ||
// (order.bAddressCity && order.bAddressCity.toLowerCase().includes(value)) ||
// (order.bAddressState && order.bAddressState.toLowerCase().includes(value)) ||
// (order.bAddressZip && order.bAddressZip.toLowerCase().includes(value)) ||
// (order.bAddressAcountry && order.bAddressAcountry.toLowerCase().includes(value)) ||
// (order.sAddressStreet && order.sAddressStreet.toLowerCase().includes(value)) ||
// (order.sAddressState && order.sAddressState.toLowerCase().includes(value)) ||
// (order.sAddressZip && order.sAddressZip.toLowerCase().includes(value)) ||
// (order.sAddressAcountry && order.sAddressAcountry.toLowerCase().includes(value)) ||
// (order.attention && order.attention.toLowerCase().includes(value)) ||
// (order.orderNo && order.orderNo.toLowerCase().includes(value)) ||
// (order.salesAgent && order.salesAgent.toLowerCase().includes(value)) ||
// (order.customerName && order.customerName.toLowerCase().includes(value)) ||
// (order.fName && order.fName.toLowerCase().includes(value)) ||
// (order.lName && order.lName.toLowerCase().includes(value)) ||
// (order.bName && order.bName.toLowerCase().includes(value)) ||
// (order.bAddress && order.bAddress.toLowerCase().includes(value)) ||
// (order.sAddress && order.sAddress.toLowerCase().includes(value)) ||
// ((order.pReq || order.partName) && (order.pReq || order.partName).toLowerCase().includes(value)) ||
// (order.orderStatus && order.orderStatus.toLowerCase().includes(value)) ||
// (order.email && order.email.toLowerCase().includes(value)) ||
// (order.additionalInfo && order.additionalInfo.some(info => 
// (info.trackingNo && String(info.trackingNo).toLowerCase().includes(value)) // Safely handle trackingNo
// )) ||
// (order.phone && order.phone.toLowerCase().includes(value)) ||  // Added phone
// (order.make && order.make.toLowerCase().includes(value)) ||    // Added make
// (order.year && order.year.toString().toLowerCase().includes(value)) || // Added year
// (order.model && order.model.toLowerCase().includes(value))     // Added model
// );

// // Check if any yard detail (including stockNo) matches the search term
// const yardSearch = order.additionalInfo && order.additionalInfo.some((info, index) => {
// const yardLabel = `yard ${index + 1}`; // e.g., "Yard 1", "Yard 2"
// return (
// yardLabel.includes(value) || 
// (info.yardName && info.yardName.toLowerCase().includes(value)) ||
// (info.phone && String(info.phone).toLowerCase().includes(value)) || 
// (info.email && info.email.toLowerCase().includes(value)) || 
// (info.escTicked && info.escTicked.toLowerCase().includes(value)) || 
// (info.status && info.status.toLowerCase().includes(value)) ||
// (info.stockNo && info.stockNo.toLowerCase().includes(value)) // Added stockNo
// );
// });

// // Return true if any of the basic fields or yard details match the search term
// return basicSearch || yardSearch;
// });

// // If a search is active, display the filtered results, otherwise reset to the full dataset
// if (filteredOrders.length > 0 || value === "") {
// renderTableRows(1, filteredOrders); // Render the first page of filtered results
// createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage), filteredOrders);
// } else {
// $("#infoTable").empty(); // Clear the table if no results are found
// $("#infoTable").append(`<tr><td colspan="11">No matching results found</td></tr>`);
// }
// });
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

// $("#infoTable").on("click", ".process-btn", function () {
// const id = $(this).data("id");
// window.location.href = `form.html?orderNo=${id}&process=true`;
// });
$("#infoTable").on("click", ".cancel-btn", function () {
const id = $(this).data("id");
console.log(`Cancel button clicked for order ID: ${id}`); // Added log

if (confirm(`Are you sure you want to cancel order ${id}?`)) {
// Change the order status to "Order Cancelled" in the HTML
$(this).closest("tr").find("td:nth-child(7)").text("Order Cancelled");

// Optionally, disable the cancel button
$(this).prop("disabled", true);

// Send a request to update the order status in the backend
fetch(`https://www.spotops360.com/orders/${id}/cancel`, {
method: "PUT",
headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "application/json"
},
body: JSON.stringify({
firstName: firstName
})
})
.then(response => {
if (!response.ok) {
console.error("Failed to update order status", response);
throw new Error("Failed to update order status");
}
return response.json();
})
.then(data => {
console.log("Order status updated successfully", data); // Added log
alert("Order status updated to 'Order Cancelled'");
})
.catch(error => {
console.error("Error updating order status:", error);
});
}
});


$("#infoTable").on("click", ".send-invoice-btn", function () {
const id = $(this).data("id");
fetch(`https://www.spotops360.com/orders/sendInvoice/${id}`, {
method: "POST",
headers: {
Authorization: `Bearer ${token}`
},
})
.then((response) => response.json())
.then((data) => {
alert(data.message);
})
.catch((error) => {
console.error("Error:", error);
});
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
// $("#infoTable").on("click", "tr", function () {
//         $("#infoTable tr").removeClass("selected");
//         $(this).addClass("selected");
//     });
$(document).on("click", "#infoTable tr", function () {
  const isSelected = $(this).hasClass("selected");

  $("#infoTable tr").removeClass("selected");

  if (!isSelected) {
    $(this).addClass("selected");
  }
});
$(".toggle-sidebar").on("click", function () {
  $("#offcanvasSidebar").toggleClass("show");
  if ($("#offcanvasSidebar").hasClass("show")) {
    $("body").addClass("no-scroll");
    $("body").append('<div class="modal-overlay"></div>'); // Add the shadow overlay
  } else {
    $("body").removeClass("no-scroll");
    $(".modal-overlay").remove(); // Remove the shadow overlay
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
  renderTableRows(allOrders);
  createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));

  // Reset all arrows
$("#infoTableHeader .sort-icons .asc, .sort-icons .desc").removeClass("active");

// Highlight the active arrow correctly
const arrowToActivate = sortAsc ? ".asc" : ".desc";
$(this).find(".sort-icons").children(arrowToActivate).addClass("active");
});
});