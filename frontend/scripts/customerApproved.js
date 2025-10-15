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
const parts = dateString.match(/(\d+)(?:st|nd|rd|th)\s(\w+),\s(\d+)\s(\d{2}):(\d{2})/);

if (parts) {
const day = parts[1].padStart(2, '0'); 
const month = months[parts[2]];
const year = parts[3];
const hour = parts[4];
const minute = parts[5];
return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
}
return null;
}
function sortTable(column, type) {
console.log("type",type,column);    
const table = $("#infoTable");
const rows = table.find("tr").toArray();

rows.sort((a, b) => {
let valA = $(a).find("td").eq(column).text().trim();
let valB = $(b).find("td").eq(column).text().trim();
if (type === "orderdate▲") {
console.log("orderdate▲");
valA = parseCustomDate(valA); 
valB = parseCustomDate(valB);
} else if (type === "number") {
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
sortOrder[type] = sortOrder[type] === "asc" ? "desc" : "asc";
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
const team = localStorage.getItem("team");
let token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
if (role === 'Admin') {
    $("#downloadCsv").show();
  } else {
    $("#downloadCsv").hide();
  }
if (firstName) {
$("#user-name").text(firstName);
}
if (!firstName) {
window.location.href = "login_signup.html";
}

async function fetchToken() {
try {
const response = await axios.get(
`https://www.spotops360.com/auth/token/${userId}`
);
if (response.status === 200) {
token = response.data.token;
} else {
throw new Error("Failed to fetch token");
}
} catch (error) {
console.error("Error fetching token:", error);
}
}

if (!token) {
await fetchToken();
}

// Apply team-based and role-based restrictions
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
} else if (team === "Shankar") {
$('#submenu-reports .nav-link:contains("My Sales Report")').hide();
$(".nav-item:has(#submenu-teams)").hide();
$(".nav-item:has(#submenu-users)").hide();
$(
"#submenu-dashboards #add-order-link, .view-individualOrders-link, .teamB-orders-link, .sales-data-link"
).hide();
} else if (team === "Vinutha") {
$('#submenu-reports .nav-link:contains("My Sales Report")').hide();
$(".nav-item:has(#submenu-teams)").hide();
$(".nav-item:has(#submenu-users)").hide();
$('#submenu-reports .nav-link:contains("Escalation Resolutions")').hide();
// escalationResolvingTime
$(
"#submenu-dashboards #add-order-link, .view-individualOrders-link, .teamA-orders-link, .sales-data-link"
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

$(".toggle-sidebar").on("click", function () {
  $("#offcanvasSidebar").toggleClass("show");

  // Toggle the body's class to control the background shadow and scrolling behavior
  if ($("#offcanvasSidebar").hasClass("show")) {
    $("body").addClass("no-scroll");
    $("body").append('<div class="modal-overlay"></div>'); // Add the shadow overlay
  } else {
    $("body").removeClass("no-scroll");
    $(".modal-overlay").remove(); // Remove the shadow overlay
  }
});

$(".nav-link").on("click", function (event) {
const hasSubmenu = $(this).next(".submenu").length > 0;
if (!hasSubmenu) {
$(".nav-link").removeClass("active selected");
$(this).addClass("selected");

const contentMap = {
"default-link": "#default-content",
"add-order-link": "#add-order-content",
"view-order-link": "#view-order-content",
};

$(".main-content > div").addClass("d-none");
$(contentMap[this.id]).removeClass("d-none");
$("#offcanvasSidebar").removeClass("show");
} else {
$(this)
.find(".chevron-icon i")
.toggleClass("fa-chevron-right fa-chevron-down");
$(this).next(".submenu").toggle();
event.stopPropagation();
}
});

$("#profileLink").click(function () {
$("#profileFirstName").val(firstName);
$("#profileLastName").val(lastName);
$("#profileEmail").val(email);
$("#profileRole").val(role);
$("#profileModal").modal("show");
});

$("#searchInput").on("keyup", function () {
  let value = $(this).val().toLowerCase();
  let visibleCount = 0;

  $("#infoTable tr").filter(function () {
    const isMatch = $(this).text().toLowerCase().indexOf(value) > -1;
    $(this).toggle(isMatch);
    if (isMatch) visibleCount++;
  });
  $("#showTotalOrders").text(`Total Orders - ${visibleCount}`);
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
const response = await axios.get(`https://www.spotops360.com/orders/customerApproved?month=${month}&year=${year}`, {
headers: token ? { Authorization: `Bearer ${token}` } : {},
});

if (response.status !== 200) {
throw new Error("Failed to fetch orders");
}

var allOrder = response.data;
const teamAgentsMap = {
  Shankar: ["David", "John"],
  Vinutha: ["Michael", "Mark"],
  // etc.
};

if (team in teamAgentsMap) {
  allOrder = allOrder.filter(order =>
    teamAgentsMap[team].includes(order.salesAgent)
  );
}
var totalOrders = allOrder.length;
console.log("totalOrders",totalOrders)
document.getElementById("showTotalOrders").innerHTML = `Customer Approved Orders- ${totalOrders}`;
// console.log("dataL",data.length);
allOrder = sortOrdersByOrderNoDesc(allOrder);
renderOrders(allOrder);
} catch (error) {
console.error("Error fetching orders:", error);
}

function renderOrders(item){
$("#infoTable").empty();
item.forEach(item => {
var bAddress = item.bAddress || ""; 
const bParts = bAddress ? bAddress.split(',') : [];
const firstLineB = bParts.length > 1 ? `${bParts[0].trim()}, ${bParts[1].trim()}` : "";
const secondLineB = bParts.length > 4 ? `${bParts[2].trim()}, ${bParts[3].trim()}, ${bParts[4].trim()}` : "";
const formattedBAddress = `${firstLineB}<br>${secondLineB}`;

var sAddress = item.sAddress || ""; 
const sParts = sAddress.split(',');
const firstLineS = (sParts[0] ? sParts[0].trim() : "") +
    (sParts[1] ? `, ${sParts[1].trim()}` : "");
const secondLineS = (sParts[2] ? sParts[2].trim() : "") +
    (sParts[3] ? `, ${sParts[3].trim()}` : "") +
    (sParts[4] ? `, ${sParts[4].trim()}` : "") +
    (sParts[5] ? `, ${sParts[5].trim()}` : "");

// Safely construct formatted S address
const formattedSAddress = `${firstLineS}<br>${secondLineS}`;
var expShip = item.expediteShipping;
var dsCall = item.dsCall;
var exp;
var ds;
if(expShip == "true"){
exp = "Expedite shipping";
}else{
exp = "";
}
if(dsCall == "true"){
ds = "DS Call";
}else{
ds = "";
}
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
// Append data to the table with optional chaining and default values
$("#infoTable").append(
`<tr>
<td><button class="btn btn-sm process-btn" data-id="${item.orderNo}" >Process</button></td>
<td>${formattedOrderDate}</td>
<td>${item.orderNo}</td>
<td>${item.salesAgent}</td>
<td>
  Name: ${
    (item.fName || item.lName) 
      ? `${item.fName || ""} ${item.lName || ""}` 
      : item.customerName || ""
  }</br>
Email: ${item.email}</br>
Phone: ${item.phone} | Alt Phone: ${item.altPhone}</br>
Billing Name: ${item.bName}<br>
Billing Address: ${
(item.bAddressStreet || item.bAddressCity || item.bAddressState || item.bAddressZip || item.bAddressAcountry) 
? ` ${item.bAddressStreet || ""}, ${item.bAddressCity || ""}, ${item.bAddressState || ""}, ${item.bAddressZip || ""}, ${item.sAddressAcountry || ""} `
: `${formattedBAddress || ""}`
}
</td>
<td>  ${
(item.sAddressStreet || item.sAddressCity || item.sAddressState || item.sAddressZip || item.sAddressAcountry) 
? `<b>Attention</b>:${item.attention}<br> ${item.sAddressStreet || ""},<br>${item.sAddressCity || ""}, ${item.sAddressState || ""},<br>${item.sAddressZip || ""}, ${item.sAddressAcountry || ""} `
: `${formattedSAddress || ""}`
}</td> 
<td><b>Part Name</b>: ${item.pReq || item.partName || ''}<br>
<b>Quoted Price:</b> $${item.soldP || 0}<br>
${item.costP ? `<b>Est. Part Price:</b> $${item.costP}<br>` : ''}
${exp ? `<b>Expedite Shipping:</b> ${exp}<br>` : ''}
${ds ? `<b>DS Call:</b> ${ds}<br>` : ''}
</td>               
<td>Year: ${item.year} | Make: ${item.make} | Model: ${item.model}</br>
Part Description: ${item.desc}</br>
Part No: ${item.partNo} | VIN: ${item.vin}</br>
Warranty: ${item.warranty} days | ${item.programmingRequired === "true" ? `Programming required: ${item.programmingRequired}</br>` : ""}
</td>
<td>${item.orderStatus}</td>
</tr>`
);
})
}
// Sorting orders by orderNo in descending order
function sortOrdersByOrderNoDesc(orders) {
console.log("sort in ascending order initially")  
return orders.sort((a, b) => {
const orderNoA = parseInt(a.orderNo.replace(/\D/g, ""), 10);
const orderNoB = parseInt(b.orderNo.replace(/\D/g, ""), 10);
return orderNoB - orderNoA;
});
}
// filterButton
$("#filterButton").click(async function () {
  $("body").append('<div class="modal-overlay"></div>');
  $("body").addClass("modal-active");
  $("#loadingMessage").show();

  try {
    const rangeValue = $("#unifiedDatePicker").val().trim();
    const tz = "America/Chicago";
    let queryParams = {};

    if (!rangeValue) {
      alert("⚠️ Please select a date or range first.");
      return;
    }

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
      alert("Invalid date format selected.");
      return;
    }

    const ordersResponse = await axios.get(`https://www.spotops360.com/orders/customerApproved`, {
      params: queryParams,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (ordersResponse.status !== 200) {
      throw new Error("Failed to fetch filtered orders");
    }

    allOrders = ordersResponse.data;
    const teamAgentsMap = {
      Shankar: ["David", "John"],
      Vinutha: ["Michael", "Mark"],
    };
    if (team in teamAgentsMap) {
      allOrders = allOrders.filter(order =>
        teamAgentsMap[team].includes(order.salesAgent)
      );
    }
    const totalOrders = allOrders.length;
    $("#showTotalOrders").text(`Customer Approved Orders - ${totalOrders}`);
    allOrders = sortOrdersByOrderNoDesc(allOrders);
    renderOrders(allOrders);

  } catch (error) {
    console.error("Error during filtering:", error);
  } finally {
    $("#loadingMessage").hide();
    $(".modal-overlay").remove();
    $("body").removeClass("modal-active");
  }
});

$('#closeCancelled').on('click', function(e) {
$("#cancellingOrder").fadeOut();
$(".modal-overlay").remove();
$("body").removeClass("modal-active");
window.location.reload();

});
$(document).on("click", "#infoTable tr", function () {
  const isSelected = $(this).hasClass("selected");

  $("#infoTable tr").removeClass("selected");

  if (!isSelected) {
    $(this).addClass("selected");
  }
});

$("#infoTable").on("click", ".process-btn", function () {
const id = $(this).data("id");
window.location.href = `formNew.html?orderNo=${id}&process=true`;
});
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
fetchNotifications();
$("#downloadCsv").on("click", function () {
  const table = $("#infoTable");
  let csvContent = "Order Date, Order No., Agent Name, Customer Info, Shipping Info, Sale Info, Part Info, Order Status\n";
  
  // Loop through each row of the table
  table.find("tr").each(function () {
    const row = $(this);
    
    // Skip empty rows or header row if any
    if (row.find("td").length === 0) return;  // Skip rows with no data (empty rows)
    
    const rowData = [];
    
    row.find("td").each(function (index) {
      // Skip the first column (Actions column)
      if (index === 0) return; // Skip first column (Actions)
      
      let cellText = $(this).text().trim();
      
      // If the cell contains a comma or newline, wrap it in quotes
      if (cellText.includes(",") || cellText.includes("\n")) {
        cellText = `"${cellText.replace(/"/g, '""')}"`;
      }
      
      rowData.push(cellText);
    });
    
    // Only add the row if it has data
    if (rowData.length > 0) {
      csvContent += rowData.join(",") + "\n";
    }
  });

  // Trigger CSV download
  const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
  const downloadLink = document.createElement("a");
  downloadLink.setAttribute("href", encodedUri);
  downloadLink.setAttribute("download", "customer_orders.csv");
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // Debugging the generated CSV content
  console.log("Generated CSV Content:", csvContent);
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

// Highlight the active arrow correctly
const arrowToActivate = sortAsc ? ".asc" : ".desc";
$(this).find(".sort-icons").children(arrowToActivate).addClass("active");
});
});