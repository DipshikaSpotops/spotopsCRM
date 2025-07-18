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
// Restore saved month if it exists
const savedMonth = localStorage.getItem("selectedMonth");
if (savedMonth && /^\d{4}-\d{2}$/.test(savedMonth)) {
    $("#monthYearPicker").val(savedMonth);
    $("#filterButton").trigger("click");
}

// Restore search value and apply it
const savedSearch = localStorage.getItem("searchValue");
if (savedSearch) {
    $("#searchInput").val(savedSearch);
    $("#searchInput").trigger("keyup");
}

// Pagination related variables
let allOrders = [];
const rowsPerPage = 25;
let currentPage = 1;

function renderTableRows(page, orders = allOrders) {
  const filteredOrders = orders.filter(item => item.orderStatus === "Yard Processing");
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const ordersForPage = filteredOrders.slice(start, end);

  $('#infoTable').empty();

  if (filteredOrders.length === 0) {
    $("#infoTable").append(`<tr><td colspan="9">No 'Yard Processing' orders found.</td></tr>`);
    $("#pagination-controls").empty(); // Clear pagination if no results
    return;
  }

  ordersForPage.forEach((item) => {
    const escalationStatus = item.additionalInfo &&
      item.additionalInfo[0] &&
      item.additionalInfo[0].escTicked === "Yes" ? "Yes" : "";
    let escalationStyle = '';
    if (item.orderStatus === "Order Fulfilled" && escalationStatus === "Yes") {
      escalationStyle = 'style="background-color: lightgreen;"';
    }

    const yardlength = item.additionalInfo.length;
    const date = new Date(item.orderDate);
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
// Get logged-in user's firstName
const userFirstName = localStorage.getItem("firstName") || "";
let myLastNote = "";

if (Array.isArray(item.supportNotes) && item.supportNotes.length > 0) {
  const rawNote = item.supportNotes[item.supportNotes.length - 1];

  if (typeof rawNote === "string" && rawNote.trim()) {
    const words = rawNote.trim().split(/\s+/); 
    myLastNote = words.reduce((acc, word, idx) => {
      return acc + word + ((idx + 1) % 5 === 0 ? "<br>" : " ");
    }, "").trim();
  }
}
    const actions = `
      <button class="btn btn-success btn-sm process-btn" data-id="${item.orderNo}" ${
        item.orderStatus === "Placed" || item.orderStatus === "Customer approved" ? "disabled" : ""
      }>View</button>`;

    $("#infoTable").append(`
      <tr ${escalationStyle}>
        <td>${formattedOrderDate}</td>
        <td>${item.orderNo}</td>
        <td>${item.salesAgent}</td>
        <td>${
          (item.fName && item.lName) ? `${item.fName} ${item.lName}` : item.customerName || ""
        }</td>
        <td>${item.pReq || item.partName}</td>
        <td>
  ${item.additionalInfo && yardlength > 0
    ? `${item.additionalInfo[yardlength - 1].yardName}<br> 
       <b>${item.additionalInfo[yardlength - 1].status}</b> <br> 
       <b>Expected Shipping Date: ${item.additionalInfo[yardlength - 1].expShipDate || ""}</b><br>
       <b>Expedite Shipping: ${item.expediteShipping === "true" ? "Yes" : "No"}</b>`
    : ""}
</td>

        <td>${myLastNote}</td>
        <td>${item.orderStatus}</td>
        <td>${
          item.additionalInfo && item.additionalInfo.length > 0
            ? (() => {
                let totalYardSpent = 0;
                item.additionalInfo.forEach(info => {
                  const yardPP = parseFloat(info.partPrice) || 0;
                  const shippingStr = info.shippingDetails || '';
                  let shippingVal = 0;
                  if (shippingStr.includes(":")) {
                    shippingVal = parseFloat(shippingStr.split(":")[1].trim()) || 0;
                  }
                  const yardOthers = parseFloat(info.others) || 0;
                  const escReturn = parseFloat(info.custOwnShippingReturn) || 0;
                  const escReplace = parseFloat(info.custOwnShipReplacement) || 0;
                  const yardOwnShip = parseFloat(info.yardOwnShipping) || 0;
                  const refund = parseFloat(info.refundedAmount) || 0;

                  if (info.status !== "PO cancelled" || (info.status === "PO cancelled" && info.paymentStatus === "Card charged")) {
                    totalYardSpent += yardPP + shippingVal + yardOthers + escReturn + escReplace + yardOwnShip - refund;
                  }
                });

                const spMinusTax = item.soldP - item.salestax;
                const custRefund = item.custRefundedAmount || 0;
                const currentGP = spMinusTax - custRefund - totalYardSpent;
                return `$${currentGP.toFixed(2)}`;
              })()
            : ""
        }</td>
        <td>${actions}</td>
      </tr>
    `);
  });

  // Ensure correct pagination is shown for filtered data
  createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage), filteredOrders.length);
}


// Function to create pagination controls
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
const ordersResponse = await axios.get(`https://www.spotops360.com/orders/yardProcessing?month=${month}&year=${year}`, {
headers: token ? { Authorization: `Bearer ${token}` } : {},
});
if (ordersResponse.status !== 200) {
throw new Error("Failed to fetch current month's orders");
}
allOrders = ordersResponse.data;
const teamAgentsMap = {
  Shankar: ["David", "John"],
  Vinutha: ["Michael", "Mark"],
};
var team = localStorage.getItem("team");
if (team in teamAgentsMap) {
  allOrders = allOrders.filter(order =>
    teamAgentsMap[team].includes(order.salesAgent)
  );
}
var totalOrders = allOrders.length;
console.log("totalOrders",totalOrders)
document.getElementById("showTotalOrders").innerHTML = `Total Orders - ${totalOrders}`;
// sortedData = sortOrdersByOrderNoDesc(allOrders);
renderTableRows(currentPage);
createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));
} catch (error) {
console.error("Error fetching current month's orders:", error);
}
// Filtering functionality
// $("#searchInput").on("keyup", function () {
//   const value = $(this).val().toLowerCase();
//   $("#infoTable tr").filter(function () {
//     $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
//   });
// });

// Filtering functionality for  the search bar
$("#searchInput").on("keyup", function () {
  const value = $(this).val().toLowerCase();
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
        (info.trackingNo && String(info.trackingNo).toLowerCase().includes(value)) ||
        (info.status && String(info.status).toLowerCase().includes(value))  
      )) ||
      (order.additionalInfo.length > 0 && order.additionalInfo[0].escTicked && order.additionalInfo[0].escTicked.toLowerCase().includes(value)) ||
      (order.email && order.email.toLowerCase().includes(value)) ||
      (order.expediteShipping && order.expediteShipping.toLowerCase().includes(value))
    );
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

function sortOrdersByOrderNoDesc(orders) {
return orders.sort((a, b) => {
const orderNoA = parseInt(a.orderNo.replace(/\D/g, ""), 10);
const orderNoB = parseInt(b.orderNo.replace(/\D/g, ""), 10);
return orderNoB - orderNoA;
});
}
$("#infoTable").on("click", ".edit-btn", function () {
const id = $(this).data("id");
const selectedMonth = $("#monthYearPicker").val();
    const searchValue = $("#searchInput").val();
    localStorage.setItem("selectedMonth", selectedMonth);
    localStorage.setItem("searchValue", searchValue);
window.location.href = `form.html?orderNo=${id}`;
});

$("#infoTable").on("click", ".process-btn", function () {
    const id = $(this).data("id");
    const selectedMonth = $("#monthYearPicker").val();
    const searchValue = $("#searchInput").val();
    sessionStorage.setItem("lastVisitedPage", "collectRefund");
      sessionStorage.setItem("currentPage", currentPage);
      sessionStorage.setItem("selectedMonthYear", $("#monthYearPicker").val());
      sessionStorage.setItem("searchValue", $("#searchInput").val());
    localStorage.setItem("selectedMonth", selectedMonth);
    localStorage.setItem("searchValue", searchValue);

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

$("#filterButton").click(async function () {
  const rangeValue = $("#unifiedDatePicker").val().trim();
  localStorage.setItem("selectedMonth", rangeValue);

  $("body").append('<div class="modal-overlay"></div>');
  $("body").addClass("modal-active");
  $("#loadingMessage").show();

  const tz = "America/Chicago";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let queryParams = {};

  // Handle session restore if coming back from form.html
  const lastVisitedPage = sessionStorage.getItem("lastVisitedPage");
  if (lastVisitedPage && document.referrer.includes("form.html")) {
    const savedMonthYear = sessionStorage.getItem("selectedMonthYear");
    const savedPage = sessionStorage.getItem("currentPage");
    const savedSearch = sessionStorage.getItem("searchValue");

    if (savedMonthYear) $("#unifiedDatePicker").val(savedMonthYear);
    if (savedPage) currentPage = parseInt(savedPage);
    if (savedSearch) {
      $("#searchInput").val(savedSearch);
      setTimeout(() => {
        $("#searchInput").trigger("keyup");
      }, 200);
    }

    sessionStorage.removeItem("lastVisitedPage");
  }

  // Determine query parameters
  if (rangeValue.includes(" to ")) {
    const [startStr, endStr] = rangeValue.split(" to ");
    queryParams = {
      start: moment.tz(startStr, tz).startOf("day").toISOString(),
      end: moment.tz(endStr, tz).endOf("day").toISOString()
    };
  } else if (moment(rangeValue, "YYYY-MM", true).isValid()) {
    const m = moment(rangeValue, "YYYY-MM");
    queryParams = {
      month: m.format("MMM"),
      year: m.format("YYYY")
    };
  } else if (moment(rangeValue, "YYYY-MM-DD", true).isValid()) {
    const date = moment.tz(rangeValue, tz);
    queryParams = {
      start: date.startOf("day").toISOString(),
      end: date.endOf("day").toISOString()
    };
  } else {
    alert("Please select a valid date, range, or month.");
    $("#loadingMessage").hide();
    $(".modal-overlay").remove();
    $("body").removeClass("modal-active");
    return;
  }

  try {
    const ordersResponse = await axios.get(
      "https://www.spotops360.com/orders/yardProcessing",
      {
        params: queryParams,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (ordersResponse.status !== 200) {
      throw new Error("Failed to fetch filtered orders");
    }

    allOrders = ordersResponse.data;

    const teamAgentsMap = {
      Shankar: ["David", "John"],
      Vinutha: ["Michael", "Mark"],
    };
    const team = localStorage.getItem("team");

    if (team in teamAgentsMap) {
      allOrders = allOrders.filter(order =>
        teamAgentsMap[team].includes(order.salesAgent)
      );
    }
    const total = allOrders.length;
    $("#showTotalOrders").text(`Total Orders - ${total}`);
    renderTableRows(currentPage);
    createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));
  } catch (error) {
    console.error("Error fetching yardProcessing orders:", error);
  } finally {
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
fetchNotifications();
// sorting
let currentSortColumn = '';
let sortAsc = true;

const numericCols = ["currGp"];

$("#infoTableHeader th.sortable").on("click", function () {
  const column = $(this).data("column");
  if (!column) return;

  currentSortColumn === column ? (sortAsc = !sortAsc) : (currentSortColumn = column, sortAsc = true);

  const colIndex = $(this).index();

  const rows = $("#infoTable tr").get();

  rows.sort((rowA, rowB) => {
    const cellA = $(rowA).children().eq(colIndex).text().replace(/[^0-9.-]+/g, "");
    const cellB = $(rowB).children().eq(colIndex).text().replace(/[^0-9.-]+/g, "");

    let valA = numericCols.includes(column) ? parseFloat(cellA) || 0 : cellA.toLowerCase();
    let valB = numericCols.includes(column) ? parseFloat(cellB) || 0 : cellB.toLowerCase();

    return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  $("#infoTable").empty().append(rows);

  // Update sort icons
  $("#infoTableHeader .sort-icons .asc, .sort-icons .desc").removeClass("active");
  const arrow = sortAsc ? ".asc" : ".desc";
  $(this).find(".sort-icons").children(arrow).addClass("active");
});

});