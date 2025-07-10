$(document).ready(async function () {
  $("#viewAlltasks").on("click", function () {
  window.location.href = "viewAllTasks.html";
});
// Pagination related variables
let allOrders = [];
const rowsPerPage = 25;
let currentPage = 1;

// Function to render rows based on the page
function renderTableRows(page, orders = allOrders) {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const ordersForPage = orders.slice(start, end);;

  const tbody = $("#infoTable");
  tbody.empty(); // Clear old rows

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
    // const escalationStatus = item.additionalInfo?.[0]?.escTicked === "Yes" ? "Yes" : "";
    // const escalationStyle = (item.orderStatus === "Order Fulfilled" && escalationStatus === "Yes") 
    //                         ? 'style="background-color: #c6fbd6;"color: white""' 
    //                         : "";

    const yardInfo = item.additionalInfo?.map((info, index) => `
      <b>Yard ${index + 1}</b>: ${info.yardName}<br>
      Shipping: ${info.shippingDetails || ""}<br>
    `).join("<br>") || "";

    const editButton = (team === "Team Mark" || team === "Team Sussane")
      ? ""
      : `<button class="btn edit-btn" data-id="${item.orderNo}">Edit</button>`;

    const processBtnDisabled = ["Placed", "Customer approved"].includes(item.orderStatus) ? "disabled" : "";

    const customerName = item.fName && item.lName 
      ? `${item.fName} ${item.lName}` 
      : item.customerName || "";
    const rowHTML = `
      <tr>
        <td>${formattedDate}</td>
        <td>${item.orderNo}</td>
        <td>${item.salesAgent}</td>
        <td>${customerName}</td>
        <td>${yardInfo}</td>
        <td>${item.orderStatus}</td>
        <td>
          ${editButton}
          <button class="btn  process-btn" data-id="${item.orderNo}" ${processBtnDisabled}>View</button>
        </td>
      </tr>
    `;

    tbody.append(rowHTML);
  });
}


// <td>${sendInvoice}</td>
var firstname = localStorage.getItem("firstName");
if (firstname) {
$("#user-name").text(firstName);
}
if (!firstname) {
window.location.href = "login_signup.html";
}
// Function to create pagination controls
function createPaginationControls(totalPages) {
  const paginationControls = $('#pagination-controls');
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
    renderTableRows(currentPage, allOrders);
    createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));
  }
});

$('#pagination-controls').on('click', '#nextPage', function () {
  const totalPages = Math.ceil(allOrders.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTableRows(currentPage, allOrders);
    createPaginationControls(totalPages);
  }
});


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
console.log("month",month,"year",year);
// //orders for the current month
// try {
// const ordersResponse = await axios.get(`https://www.spotops360.com/orders/monthly?month=${month}&year=${year}`, {
// headers: token ? { Authorization: `Bearer ${token}` } : {},
// });

// if (ordersResponse.status !== 200) {
// throw new Error("Failed to fetch current month's orders");
// }


// allOrders = ordersResponse.data.orders;
// const ordersWithMultipleAdditionalInfo = allOrders
//   .filter(order => order.additionalInfo && order.additionalInfo.length > 1)
//   .map(order => order.orderNo);
// // console.log("OrderNos with additionalInfo length > 1:", ordersWithMultipleAdditionalInfo);
// var totalOrders = allOrders.length;
// console.log("totalOrders",totalOrders)
// document.getElementById("showTotalOrders").innerHTML = `Total Orders This Month- ${totalOrders}`;
// sortedData = sortOrdersByOrderNoDesc(allOrders);
// renderTableRows(currentPage, allOrders);
// createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));
// } catch (error) {
// console.error("Error fetching current month's orders:", error);
// }

$("#searchInput").on("keyup", function () {
  const value = $(this).val().toLowerCase();
  const filteredOrders = allOrders.filter(order => {
    const basicSearch = (
      (order.soldP && String(order.soldP).toLowerCase().includes(value)) ||
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
      (order.customerName && order.customerName.toLowerCase().includes(value)) ||
      (order.fName && order.fName.toLowerCase().includes(value)) ||
      (order.lName && order.lName.toLowerCase().includes(value)) ||
      (order.bName && order.bName.toLowerCase().includes(value)) ||
      (order.bAddress && order.bAddress.toLowerCase().includes(value)) ||
      (order.sAddress && order.sAddress.toLowerCase().includes(value)) ||
      ((order.pReq || order.partName) && (order.pReq || order.partName).toLowerCase().includes(value)) ||
      (order.orderStatus && order.orderStatus.toLowerCase().includes(value)) ||
      (order.email && order.email.toLowerCase().includes(value)) ||
      (order.additionalInfo && order.additionalInfo.some(info =>
        (info.trackingNo && String(info.trackingNo).toLowerCase().includes(value))
      )) ||
      (order.phone && order.phone.toLowerCase().includes(value)) ||
      (order.make && order.make.toLowerCase().includes(value)) ||
      (order.year && order.year.toString().toLowerCase().includes(value)) ||
      (order.model && order.model.toLowerCase().includes(value))
    );

    const yardSearch = order.additionalInfo && order.additionalInfo.some((info, index) => {
      const yardLabel = `yard ${index + 1}`;
      return (
        yardLabel.includes(value) ||
        (info.yardName && info.yardName.toLowerCase().includes(value)) ||
        (info.phone && String(info.phone).toLowerCase().includes(value)) ||
        (info.email && info.email.toLowerCase().includes(value)) ||
        (info.escTicked && info.escTicked.toLowerCase().includes(value)) ||
        (info.status && info.status.toLowerCase().includes(value)) ||
        (info.shippingDetails && info.shippingDetails.toLowerCase().includes(value)) ||
        (info.stockNo && info.stockNo.toLowerCase().includes(value))
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
    const monthYear = $("#monthYearPicker").val();  // e.g., "2025-01"
    localStorage.setItem('selectedMonthYear', monthYear); 
    $("#loadingMessage").show(); 
    await fetchOrdersForSelectedMonth(monthYear);
    $("#loadingMessage").hide();
});

// On page load, check for previously selected month/year
    const savedMonthYear = localStorage.getItem('selectedMonthYear');
    if (savedMonthYear) {
    $("#monthYearPicker").val(savedMonthYear);
    await fetchOrdersForSelectedMonth(savedMonthYear); 
} else {
    const now = new Date();
    const month = now.toLocaleString("default", { month: "2-digit" });
    const year = now.getFullYear();
    const defaultMonthYear = `${year}-${month}`;
    $("#monthYearPicker").val(defaultMonthYear);
    await fetchOrdersForSelectedMonth(defaultMonthYear); 
}
    const savedPage = localStorage.getItem('currentPage');
    currentPage = savedPage ? parseInt(savedPage) : 1;
    renderTableRows(currentPage);
    createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));

async function fetchOrdersForSelectedMonth(monthYear) {
  const [year, month] = monthYear.split("-");
  const limit = 25;
  $("#loadingMessage").show();

  try {
    const firstResponse = await axios.get("https://www.spotops360.com/orders/monthly", {
      params: { month, year, page: 1, limit },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const totalCount = firstResponse.data.totalCount;
    const totalPages = Math.ceil(totalCount / limit);
    let orders = [...firstResponse.data.orders];

    const requests = [];
    for (let p = 2; p <= totalPages; p++) {
      requests.push(
        axios.get("https://www.spotops360.com/orders/monthly", {
          params: { month, year, page: p, limit },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
      );
    }

    const responses = await Promise.all(requests);
    responses.forEach(res => {
      orders.push(...res.data.orders);
    });
    const teamAgentsMap = {
      Shankar: ["Mark", "John"],
      Vinutha: ["Michael", "David"]
    };
    console.log("team", team);
    if (team in teamAgentsMap) {
      orders = orders.filter(order =>
        teamAgentsMap[team].includes(order.salesAgent)
      );
    }

    allOrders = orders;
    currentPage = 1;
    let totalShipping = 0;

allOrders.forEach(order => {
  if (Array.isArray(order.additionalInfo)) {
    order.additionalInfo.forEach(info => {
      if (info.paymentStatus === "Card charged") {
        const match = info.shippingDetails?.match(/(\d+(\.\d+)?)/);
        const shippingValue = match ? parseFloat(match[0]) : 0;
        totalShipping += shippingValue;
      }
    });
  }
});

document.getElementById("showTotalOrders").innerText = `Total Shipping: $${totalShipping.toFixed(2)}`;
    renderTableRows(currentPage, allOrders);
    createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));
  } catch (error) {
    console.error("Error fetching orders:", error);
  } finally {
    $("#loadingMessage").hide();
  }
}



$("#logoutLink").click(function () {
window.localStorage.clear();
window.location.href = "login_signup.html";
});
// Clear localStorage when a sidebar menu item is clicked
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
$("#infoTable tr").each(function () {
  const row = $(this);
  // console.log(row.text()); // Debugging: print out the content of each row
});

  $("#downloadCsv").on("click", async function () {
    let csvContent = "Order Date, Order No., Agent Name, Customer Info, Part Info, Yard, Order Status, Sale Price, Est GP, Current GP, Actual GP, Escalation Status\n";
  
    // Number of rows per page
    const rowsPerPage = 25;
    let currentPage = 1; // Track current page
    let totalPages = Math.ceil(allOrders.length / rowsPerPage); // Calculate the total pages

    // Function to collect rows for the current page
    async function collectPageRows(page) {
        // Render the table rows for the current page
        renderTableRows(page, allOrders); // Assuming renderTableRows handles rendering for the current page

        // Collect the rows for this page
        let pageRows = [];
        $("#infoTable tr").each(function () {
            const row = $(this);
            const rowData = [];
            row.find("td").each(function () {
                let cellText = $(this).text().trim();
                if (cellText.includes(",") || cellText.includes("\n")) {
                    // If the cell contains a comma or new line, wrap it in quotes
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

    // Loop through all pages and collect rows
    for (let page = 1; page <= totalPages; page++) {
        const pageRows = await collectPageRows(page); // Collect rows for the current page
        csvContent += pageRows.join("\n") + "\n"; // Add the collected rows to the CSV content
    }

    // Create a download link and trigger the download
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", "orders.csv");  // Set the filename
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    console.log("CSV download triggered!");
});
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
 
});