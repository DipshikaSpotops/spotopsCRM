$(document).ready(async function () {
  let team = localStorage.getItem('team');
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
  const label = moment(start).format("MMMM YYYY"); // July 2025

  fp.setDate([start, end], true);
  $("#unifiedDatePicker").val(label); // Show pretty label
  $("#unifiedDateRangeRaw").val(`${start} to ${end}`); // Store real range
  $("#filterButton").click();
  instance.close();
});


  // Generate last 3 months dynamically
  for (let i = 1; i <= 3; i++) {
    const monthMoment = momentTz.clone().subtract(i, "months");
    const monthName = monthMoment.format("MMMM"); // e.g., "June"
    const start = monthMoment.startOf("month").format("YYYY-MM-DD");
    const end = monthMoment.endOf("month").format("YYYY-MM-DD");
    const label = moment(start).format("MMMM YYYY"); // "June 2025"
    const monthBtn = makeLink(monthName, () => {
  fp.setDate([start, end], true);
  $("#unifiedDatePicker").val(label);
  $("#unifiedDateRangeRaw").val(`${start} to ${end}`);  // ← Add this line
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
},
onChange: function (selectedDates) {
  if (selectedDates.length === 2) {
    const start = moment(selectedDates[0]);
    const end = moment(selectedDates[1]);
    const sameMonth = start.month() === end.month() && start.year() === end.year();
    const label = sameMonth
      ? start.format("MMMM YYYY")
      : `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
    
    $("#unifiedDatePicker").val(label);
    $("#unifiedDateRangeRaw").val(`${start.format("YYYY-MM-DD")} to ${end.format("YYYY-MM-DD")}`);
  } else {
    $("#unifiedDatePicker").val("");
    $("#unifiedDateRangeRaw").val("");
  }
}
});
  // flatpickr setup till here
  // Set default date range to current month on initial load
if (!sessionStorage.getItem("selectedDateRange")) {
  const momentTz = moment().tz("America/Chicago");
  const startOfMonth = momentTz.clone().startOf("month").format("YYYY-MM-DD");
  const endOfMonth = momentTz.clone().endOf("month").format("YYYY-MM-DD");
  
  fp.setDate([startOfMonth, endOfMonth], true); 
  const label = moment(startOfMonth).format("MMMM YYYY"); // "July 2025"
  $("#unifiedDatePicker").val(label); // Show pretty label
  $("#unifiedDateRangeRaw").val(`${startOfMonth} to ${endOfMonth}`); 
}
// Pagination related variables
let allOrders = [];
const rowsPerPage = 25;
let currentPage = 1;
// Function to render rows based on the page
function renderTableRows(page, orders = allOrders) {
    // Filter orders that don't match "Placed", "Customer approved", or "Order Fulfilled"
    const filteredOrders = orders.filter(item => {
        return (item.orderStatus === "Refunded");
    });

    // Pagination logic after filtering
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const ordersForPage = filteredOrders.slice(start, end); // Slice filtered orders for pagination

    $('#infoTable').empty(); // Clear the table

    ordersForPage.forEach((item) => {
        const escalationStatus = item.additionalInfo &&
            item.additionalInfo[0] &&
            item.additionalInfo[0].escTicked === "Yes" ? "Yes" : "";

        let escalationStyle = '';
        if (item.orderStatus === "Order Fulfilled" && escalationStatus === "Yes") {
            escalationStyle = 'style="background-color: lightgreen;"';
        }
        const actions = `
            <button class="btn btn-success btn-sm process-btn" data-id="${item.orderNo}" ${item.orderStatus === "Placed" || item.orderStatus === "Customer approved" ? "disabled" : ""}>View</button>`;

        const yardlength = item.additionalInfo.length;
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
        const custRefundDatedateOnly = item.custRefundDate;
const dateObj = new Date(custRefundDatedateOnly);

const day1 = dateObj.getUTCDate();
const month1 = dateObj.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
const year1 = dateObj.getUTCFullYear();
const hours = String(dateObj.getUTCHours()).padStart(2, '0');
const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');

const getDaySuffix = (d) => {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const formattedDate = `${day1}${getDaySuffix(day1)} ${month1}, ${year1} ${hours}:${minutes}`;
console.log(formattedDate); 
$("#infoTable").append(`
<tr>
<td>${formattedOrderDate}</td>
<td>${item.orderNo}</td>
<td>$${item.soldP}</td>
<td>${item.salesAgent}</td>
<td>${
    (item.fName && item.lName) ? `${item.fName} ${item.lName}` : item.customerName || ""
  }</td>
<td>${item.pReq || item.partName}</td>
<td>${
  item.additionalInfo && item.additionalInfo.length > 0
    ? item.additionalInfo
        .map((info, index) => {
          const yardName = info.yardName || "Unknown Yard";
          const shippingCost = info.shippingDetails 
            ? parseFloat(info.shippingDetails.split(":")[1]?.trim()) || 0 
            : 0;
          const partPrice = parseFloat(info.partPrice || 0);
          const others = parseFloat(info.others || 0);
          const refundedAmount = parseFloat(info.refundedAmount || 0);
          const custOwnShipReplacement = parseFloat(info.custOwnShipReplacement || 0);
          const yardOwnShipping = parseFloat(info.yardOwnShipping || 0);
          const custOwnShippingReturn = parseFloat(info.custOwnShippingReturn || 0);
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
          const shippingDetails = info.shippingDetails || "";
          return `
            <b>Yard ${index + 1}</b>: ${yardName}<br> 
            Part price: $${partPrice} | ${shippingDetails} <br>
            Others: $${others} | Esc spending: ${escSpending}<br>
            Yard Spend: $${yardSpendTotal.toFixed(2)}<br>
            Yard refund: $${refundedAmount}
          `;
        })
        .join("<br>")
    : "No Yard Info"
}</td>
<td>
${
item.orderHistory
.filter(entry => entry.includes("Order status changed to Refunded"))
.map(entry => {
const parts = entry.split(" by ");
return parts[1]?.split(" on ")[0] || "Unknown";
})
.join(", ") || ""
}
</td>
<td>${formattedDate}</td>
<td>$${item.custRefAmount || item.custRefundedAmount || ""}</td>
<td>${item.orderStatus}</td>
<td>
${
item.additionalInfo && item.additionalInfo.length > 0
? item.additionalInfo
.map((info,index) => {
const shippingCost = info.shippingDetails
? parseFloat(info.shippingDetails.match(/\d+/)?.[0]) || 0
: 0;
const partPrice = parseFloat(info.partPrice || 0);
const others = parseFloat(info.others || 0);
const refundedAmount = parseFloat(info.refundedAmount || 0);
const yardOwnShipping = parseFloat(info.yardOwnShipping || 0);
const custOwnShippingReturn = parseFloat(info.custOwnShippingReturn || 0);
const custOwnShipReplacement = parseFloat(info.custOwnShipReplacement || 0);
const yardSpendTotal =
partPrice + 
shippingCost + 
others - 
refundedAmount + 
yardOwnShipping + 
custOwnShippingReturn - 
custOwnShipReplacement;

// Return the calculated total for display
return `Yard ${index + 1} Spend: $${yardSpendTotal.toFixed(2)}`;
})
.join("<br>")
: ""
}
</td>
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
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const lastVisitedPage = sessionStorage.getItem("lastVisitedPage");

    if (lastVisitedPage && document.referrer.includes("form.html")) {
        let savedMonthYear = sessionStorage.getItem("selectedMonthYear");
        let savedPage = sessionStorage.getItem("currentPage");

        if (savedMonthYear) {
            $("#monthYearPicker").val(savedMonthYear); // Restore month filter
        }

        if (savedPage) {
            currentPage = parseInt(savedPage); // Restore page
        }

        sessionStorage.removeItem("lastVisitedPage"); // Clear after restoring
    }else {
    const momentTz = moment().tz("America/Chicago");
    const start = momentTz.clone().startOf("month").format("YYYY-MM-DD");
    const end = momentTz.clone().endOf("month").format("YYYY-MM-DD");
    $("#unifiedDatePicker").val(`${start} to ${end}`);
    fp.setDate([start, end], true);
}

    const rangeValue = $("#unifiedDateRangeRaw").val().trim();
const tz = "America/Chicago";

let queryParams = {};

if (rangeValue.includes(" to ")) {
  const [startStr, endStr] = rangeValue.split(" to ");
  const start = moment.tz(startStr, tz).startOf("day").toISOString();
  const end = moment.tz(endStr, tz).endOf("day").toISOString();
  queryParams.start = start;
  queryParams.end = end;
} else if (moment(rangeValue, "YYYY-MM-DD", true).isValid()) {
  const date = moment.tz(rangeValue, tz);
  queryParams.start = date.startOf("day").toISOString();
  queryParams.end = date.endOf("day").toISOString();
} else if (moment(rangeValue, "YYYY-MM", true).isValid()) {
  const m = moment(rangeValue, "YYYY-MM");
  queryParams.month = m.format("MMM");
  queryParams.year = m.format("YYYY");
} else {
  alert("Invalid or missing date. Please select a valid date range.");
  return;
}

const ordersResponse = await axios.get("https://www.spotops360.com/orders/refunded", {
  params: queryParams,
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});
allOrders = ordersResponse.data;

// Optional team filtering
const teamAgentsMap = {
  Shankar: ["David", "John"],
  Vinutha: ["Michael", "Mark"],
};

if (team in teamAgentsMap) {
  allOrders = allOrders.filter(order =>
    teamAgentsMap[team].includes(order.salesAgent)
  );
}

// Show total
const totalRefundedAmount = allOrders.reduce((sum, order) => {
  const amt = parseFloat(order.custRefAmount || order.custRefundedAmount || 0);
  return sum + (isNaN(amt) ? 0 : amt);
}, 0);

document.getElementById("showTotalOrders").innerHTML = 
  `Refunded Orders - ${allOrders.length} | Amount: $${totalRefundedAmount.toFixed(2)}`;

// Show results
renderTableRows(currentPage);
createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));
    // Clear stored filters when visiting another menu
    $(".nav-link").on("click", function () {
        sessionStorage.removeItem("selectedDateRange");
        sessionStorage.removeItem("currentPage");
    });

// Filtering functionality for  the search bar
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
      (order.additionalInfo.length > 0 && order.additionalInfo[order.additionalInfo.length - 1].yardName &&
        order.additionalInfo[order.additionalInfo.length - 1].yardName.toLowerCase().includes(value)) ||
      (order.orderStatus && order.orderStatus.toLowerCase().includes(value)) ||
      (order.additionalInfo && order.additionalInfo.some(info =>
        (info.trackingNo && String(info.trackingNo).toLowerCase().includes(value))
      )) ||
      (order.additionalInfo.length > 0 && order.additionalInfo[0].escTicked &&
        order.additionalInfo[0].escTicked.toLowerCase().includes(value)) ||
      (order.email && order.email.toLowerCase().includes(value))
    );
  });

  // Update the Total Orders count display
  document.getElementById("showTotalOrders").innerHTML = `Total Orders - ${filteredOrders.length}`;

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

$("#infoTable").on("click", ".process-btn", function () {
    const id = $(this).data("id");
    sessionStorage.setItem("lastVisitedPage", window.location.href);
    sessionStorage.setItem("selectedDateRange", $("#unifiedDatePicker").val());
    sessionStorage.setItem("currentPage", currentPage);
    window.location.href = `form.html?orderNo=${id}&process=true`;
});
$(document).on("click", "#infoTable tr", function () {
  const isSelected = $(this).hasClass("selected");

  $("#infoTable tr").removeClass("selected");

  if (!isSelected) {
    $(this).addClass("selected");
  }
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

const role = localStorage.getItem("role");
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
// filter buttom
$("#filterButton").click(async function () {
  $("body").append('<div class="modal-overlay"></div>');
  $("body").addClass("modal-active");
  $("#loadingMessage").show();

  const rangeValue = $("#unifiedDateRangeRaw").val().trim();
  const tz = "America/Chicago";
  const queryParams = { limit: "all" };

  if (!rangeValue) {
    alert("Please select a valid date, range, or month.");
    cleanupOverlay();
    return;
  }

  if (rangeValue.includes(" to ")) {
    const [startStr, endStr] = rangeValue.split(" to ");
    queryParams.start = moment.tz(startStr, tz).startOf("day").toISOString();
    queryParams.end = moment.tz(endStr, tz).endOf("day").toISOString();
  } else if (moment(rangeValue, "YYYY-MM-DD", true).isValid()) {
    const singleDate = moment.tz(rangeValue, tz);
    queryParams.start = singleDate.startOf("day").toISOString();
    queryParams.end = singleDate.endOf("day").toISOString();
  } else if (moment(rangeValue, "YYYY-MM", true).isValid()) {
    const monthMoment = moment(rangeValue, "YYYY-MM");
    queryParams.month = monthMoment.format("MMM");
    queryParams.year = monthMoment.format("YYYY");
  } else {
    alert("Invalid date format. Please use YYYY-MM-DD or YYYY-MM.");
    cleanupOverlay();
    return;
  }

  try {
    const response = await axios.get("https://www.spotops360.com/orders/refunded", {
      params: queryParams,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (response.status !== 200) {
      throw new Error("Failed to fetch refunded orders.");
    }

    allOrders = response.data;

    const teamAgentsMap = {
      Shankar: ["David", "John"],
      Vinutha: ["Michael", "Mark"],
    };

    if (team in teamAgentsMap) {
      allOrders = allOrders.filter(order =>
        teamAgentsMap[team].includes(order.salesAgent)
      );
    }

    const totalRefunded = allOrders.reduce((sum, order) => {
      const amount = parseFloat(order.custRefAmount || order.custRefundedAmount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    $("#showTotalOrders").text(
      `Refunded Orders - ${allOrders.length} | Amount: $${totalRefunded.toFixed(2)}`
    );

    renderTableRows(1); // Reset to page 1
    createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));

  } catch (error) {
    console.error("Error fetching filtered refunded orders:", error);
    alert("An error occurred while fetching refunded orders. Please try again.");
  } finally {
    cleanupOverlay();
  }

  function cleanupOverlay() {
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
  const searchInput = document.getElementById('searchInputForOrderNo');
  const resultDiv = document.getElementById('searchResult');

  searchInput.addEventListener('keydown', function (event) {
  console.log("searching order no");
  if (event.key === 'Enter') {
    const orderNo = searchInput.value.trim();
    if (orderNo !== '') {
      window.location.href = 'form.html?orderNo=' + encodeURIComponent(orderNo) + '&process=true';
    }
  }
});
  // sorting 
let currentSortColumn = '';
let sortAsc = true;
const columnMap = {
  totalYardSpend: "yardSpent",
  refundedAmount: "custRefAmount",
  refundedBy: "refundedBy",
  refundedDate: "refundedDateRaw"
};

const numericCols = ["yardSpent", "custRefAmount"];
const dateCols = ["refundedDateRaw"];
$("#infoTableHeader th.sortable").on("click", function () {
  const column = $(this).data("column");
  if (!column) return;

  currentSortColumn === column ? sortAsc = !sortAsc : (currentSortColumn = column, sortAsc = true);

  const actualColumn = columnMap[column] || column;

  allOrders.sort((a, b) => {
    let valA = a[actualColumn];
    let valB = b[actualColumn];

    if (dateCols.includes(actualColumn)) {
      valA = new Date(valA);
      valB = new Date(valB);
    } else if (numericCols.includes(actualColumn)) {
      valA = parseFloat(valA) || 0;
      valB = parseFloat(valB) || 0;
    } else {
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

});