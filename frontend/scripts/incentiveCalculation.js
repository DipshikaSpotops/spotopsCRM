$(document).ready(async function () {
console.log("ready function");
$("#viewAlltasks").on("click", function () {
  window.location.href = "viewAllTasks.html";
});
const agentList = ["David", "John", "Mark", "Michael"];
const now = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
const date = new Date(now);
const months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];

let displayLabels = [], monthIndices = [], displayYear = date.getFullYear();

const currentMonth = date.getMonth(); // 0-based, July = 6

for (let i = 0; i < 3; i++) {
    const agentTotals = {};
  const monthIndex = (currentMonth - i + 12) % 12;
  monthIndices.push(monthIndex);
}

displayLabels = monthIndices.map(i => `${months[i]} ${i > currentMonth ? displayYear - 1 : displayYear}`);



  $("#monthIncentive").text(`Incentive for ${displayLabels[0]}`);
  $("#prevMonth1").text(`Incentive for ${displayLabels[1]}`);
  $("#prevMonth2").text(`Incentive for ${displayLabels[2]}`);
  const monthMap = ["firstTableBody", "secondTableBody", "thirdTableBody"];

  for (let i = 0; i < 3; i++) {
    const [month, year] = displayLabels[i].split(" ");
    const lockedRes = await axios.get(`https://www.spotops360.com/getLockedGP?month=${month.substring(0, 3)}&year=${year}`);
    const limit = 25;
let page = 1;
let orders = [];
const agentTotals = {}; 
try {
  // First page request to get total count
  const firstRes = await axios.get(`https://www.spotops360.com/orders/monthly`, {
    params: {
      month: month.substring(0, 3),
      year,
      page,
      limit
    }
  });

  const totalCount = firstRes.data.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit);

  orders.push(...firstRes.data.orders);

  // Fetch remaining pages (if any)
  const pageRequests = [];
  for (let p = 2; p <= totalPages; p++) {
    pageRequests.push(
      axios.get(`https://www.spotops360.com/orders/monthly`, {
        params: {
          month: month.substring(0, 3),
          year,
          page: p,
          limit
        }
      })
    );
  }

  const responses = await Promise.all(pageRequests);
  responses.forEach(res => orders.push(...res.data.orders));
} catch (err) {
  console.error(`Error fetching paginated orders for ${month} ${year}`, err);
}

const lockedAgents = Array.isArray(lockedRes.data) ? lockedRes.data : (lockedRes.data.lockedAgents || []);


    orders.forEach(o => {
      const a = o.salesAgent;
      if (!agentTotals[a]) agentTotals[a] = { salePrice: 0, salestax: 0, costP: 0, shippingFee: 0, actualGP: 0 };
      agentTotals[a].salePrice += +o.soldP || 0;
      agentTotals[a].salestax += +o.salestax || 0;
      agentTotals[a].costP += +o.costP || 0;
      agentTotals[a].shippingFee += +o.shippingFee || 0;
      agentTotals[a].actualGP += +o.actualGP || 0;
    });

    const isLockDay = (i === 0 && date.getDate() === 15);
    agentList.forEach(agent => {
      const totals = agentTotals[agent] || { salePrice: 0, salestax: 0, costP: 0, shippingFee: 0, actualGP: 0 };
      const totalGP = totals.salePrice - totals.salestax - totals.costP - totals.shippingFee;
      const actualGP = totals.actualGP;
      const locked = lockedAgents.find(e => e.salesAgent === agent)?.lockedActualGp;
      const lockedVal = locked || 0;
      let diff = 0;
      if(lockedVal){
       diff = Math.abs(actualGP - lockedVal);
      }
      const row = `<tr>
        <td class="salesAgent">${agent}</td>
        <td class="totalGP">$${totalGP.toFixed(2)}</td>
        <td class="actualGP">$${actualGP.toFixed(2)}</td>
        <td class="locked">${locked ? `$${locked.toFixed(2)}` : ""}</td>
        <td class="difference">$${diff.toFixed(2)}</td>
      </tr>`;
      $(`#${monthMap[i]}`).append(row);

      if (isLockDay && !locked) {
        axios.post("https://www.spotops360.com/lockedGP", {
          salesAgent: agent,
          month: month.substring(0, 3),
          year,
          lockedActualGp: actualGP
        }).then(r => console.log(`Locked GP for ${agent}`, r.data))
          .catch(e => console.error(`Error locking ${agent}`, e));
      }
    });
  }

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
$("#user-name").text(firstName);
const lastName = localStorage.getItem("lastName");
const email = localStorage.getItem("email");
const role = localStorage.getItem("role");
const team = localStorage.getItem("team");

console.log("hhhh",firstName);

// if (firstName) {
//         $("#user-name").text(firstName);
//     }
const token = localStorage.getItem("token");

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
  if ($("#offcanvasSidebar").hasClass("show")) {
    $("body").addClass("no-scroll");
    $("body").append('<div class="modal-overlay"></div>'); 
  } else {
    $("body").removeClass("no-scroll");
    $(".modal-overlay").remove(); 
  }
});
$(".nav-link").on("click", function () {
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
});

$(".chevron-icon, .nav-link").on("click", function (event) {
event.stopPropagation();
const submenu = $(this).closest(".nav-item").find(".submenu");
submenu.toggle();
$(this).find("i").toggleClass("fa-chevron-right fa-chevron-down");
$(this).closest(".nav-link").toggleClass("selected");
});

$("#profile").click(function () {
$("#profileFirstName").val(firstName);
$("#profileLastName").val(lastName);
$("#profileEmail").val(email);
$("#profileRole").val(role);
$("#profileModal").modal("show");
});

$(".close").click(function () {
console.log("close button clicked");
location.reload();
});

$("#logoutLink").click(function () {
window.localStorage.clear();
window.location.href = "login_signup.html";
});
const darkModeToggle = document.getElementById("darkModeIcon");

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode ? "true" : "false");

  // Change icon
  darkModeToggle.classList.toggle("fa-moon", !isDarkMode);
  darkModeToggle.classList.toggle("fa-sun", isDarkMode);

  // Re-fetch chart with correct colors
  fetchDailyOrders();
  fetchAndDisplayThreeMonthsData();
  initializeMonthlySalesProgressChart();
}

// Check stored preference and apply dark mode if needed
const savedDarkMode = localStorage.getItem("darkMode");
if (savedDarkMode === "true") {
  document.body.classList.add("dark-mode");
  darkModeToggle.classList.remove("fa-moon");
  darkModeToggle.classList.add("fa-sun");
} else {
  darkModeToggle.classList.add("fa-moon");
  darkModeToggle.classList.remove("fa-sun");
}

// Event listener for dark mode toggle
darkModeToggle.addEventListener("click", toggleDarkMode);

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
fetchNotifications();
});