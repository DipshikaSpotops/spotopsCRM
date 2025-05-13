$(document).ready(async function () {
console.log("ready function");
$("#viewAlltasks").on("click", function () {
  window.location.href = "viewAllTasks.html";
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
$("#submenu-reports .nav-link")
.not(':contains(`Incentives Report`)')
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
$('#submenu-reports .nav-link:contains("Incentives Report")').hide();
} else if (team === "Team Sussane") {
$('#submenu-reports .nav-link:contains("My Sales Report")').hide();
$(".nav-item:has(#submenu-teams)").hide();
$(".nav-item:has(#submenu-users)").hide();
$('#submenu-reports .nav-link:contains("Escalation Resolutions")').hide();
$('#submenu-reports .nav-link:contains("Incentives Report")').hide();
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
// for rendering charts
// Fetch and render data for each chart
async function fetchAndRenderCharts() {
await fetchDailyOrders();
await fetchLatestThreeMonthsOrders();
// await fetchSalespersonPerformance();
// await fetchYearlyProgress();
}

// Fetch daily orders and display them in a chart
// Global variable to track the daily orders chart
let dailyOrdersChartInstance = null;

function getChartColors() {
  const isDarkMode = document.body.classList.contains("dark-mode");

  return {
    totalOrdersColor: isDarkMode ? "#c1627e" : "#006666", 
    actualGPColor: isDarkMode ? "#6a74fb" : "rgba(54, 162, 235, 1)", 
    totalOrdersBg: isDarkMode ? "white" : "white",
    actualGPBg: isDarkMode ? "#29638c" : "rgba(54, 162, 235, 0.2)",

    axisColor: isDarkMode ? "#FFFFFF" : "#555555",
    gridColor: isDarkMode ? "white" : "white", 
    legendColor: isDarkMode ? "#FFFFFF" : "#000000", 

    // Monthly chart colors
    pieChartBgColors: isDarkMode
      ? ["#8B5CF6", "#A78BFA", "#6366F1", "#60A5FA", "#22D3EE", "#34D399", "#F87171", "#FACC15", "#E879F9"]
      : ["#d5f0c0", "#ffe5a0", "#97d8fb", "#c3d5fa", "#f8aaa8", "#a7cf90", "#dd412b", "#5a3286", "#e6cff2"],
    pieChartBorderColor: isDarkMode ? "#B3B3B3" : "#C0C0C0",
    pieChartLegendColor: isDarkMode ? "#FFFFFF" : "#555555",

    // Bar chart colors for Monthly Sales Progress Chart
    monthlySalesBgColor: isDarkMode ? "#696ffb" : "rgba(54, 162, 235, 0.2)", // Yellow for dark mode, Blue for light
    monthlySalesBorderColor: isDarkMode ? "#FFC107" : "black",
    monthlySalesTitleColor: isDarkMode ? "#FFFFFF" : "#555555"
  };
}


async function fetchDailyOrders() {
  const now = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  const currentDallasDate = new Date(now);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[currentDallasDate.getMonth()];
  const year = currentDallasDate.getFullYear();

  try {
    console.log(`Fetching data for ${month} ${year}`);
    const response = await axios.get(`https://www.spotops360.com/orders/monthly?month=${month}&year=${year}`);
    const orders = response.data;

    if (!orders || !Array.isArray(orders)) {
      console.error("Invalid orders data.");
      return;
    }

    const daysInMonth = new Date(year, currentDallasDate.getMonth() + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
    const totalOrdersData = Array(daysInMonth).fill(0);
    const totalGPData = Array(daysInMonth).fill(0);

    orders.forEach(order => {
      const orderDateInDallas = new Date(
        new Date(order.orderDate).toLocaleString("en-US", { timeZone: "America/Chicago" })
      );
      const orderDay = orderDateInDallas.getDate() - 1;

      if (orderDay >= 0 && orderDay < daysInMonth) {
        totalOrdersData[orderDay] += 1;
        totalGPData[orderDay] += order.actualGP || 0;
      }
    });

    console.log("Total Orders Data (daily):", totalOrdersData);
    console.log("Total GP Data (daily):", totalGPData);

    const ctx = document.getElementById("dailyOrdersChart");
    if (!ctx) {
      console.error("dailyOrdersChart element not found.");
      return;
    }

    // Destroy the previous chart instance if it exists
    if (dailyOrdersChartInstance) {
      dailyOrdersChartInstance.destroy();
    }

    // Get correct colors based on the mode
    const colors = getChartColors();

    // Create new chart
    dailyOrdersChartInstance = new Chart(ctx.getContext("2d"), {
        type: "line", // change to stepLine style via options
        data: {
          labels: labels,
          datasets: [
            {
              label: "Total Orders",
              backgroundColor: colors.totalOrdersBg,
              borderColor: colors.totalOrdersColor,
              pointBackgroundColor: colors.totalOrdersColor,
              pointBorderColor: "#fff",
              data: totalOrdersData,
              fill: true,
              tension: 0, // <-- remove smooth curves
              stepped: true // <-- ADD THIS LINE for step look
            },
            // {
            //   label: "Actual GP",
            //   backgroundColor: colors.actualGPBg,
            //   borderColor: colors.actualGPColor,
            //   pointBackgroundColor: colors.actualGPColor,
            //   pointBorderColor: "#fff",
            //   data: totalGPData,
            //   fill: true,
            //   tension: 0, // <-- remove smooth curves
            //   stepped: true // <-- ADD THIS LINE for step look
            // }
          ]
        },
      
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: "Day of the Month", color: colors.axisColor },
            ticks: { color: colors.axisColor },
            grid: { color: colors.gridColor },
          },
          y: {
            title: { display: true, text: "Actual GP", color: colors.axisColor },
            ticks: { color: colors.axisColor },
            grid: { color: colors.gridColor },
            min: -5, 
          },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'center',
                labels: {
                  color: colors.legendColor,
                  boxWidth: 20,
                  padding: 20 
                }
              }
              ,
          title: {
            display: true,
            color: colors.axisColor,
          },
        },
      },
    });

    console.log("Chart rendered successfully.");
  } catch (error) {
    console.error("Error fetching daily orders:", error);
  }
}


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

fetchDailyOrders();

// monthly overview report start here
let chartInstances = {}; // Store chart instances by month
let cachedOrders = {}; // Store cached orders data
let isNavigating = false; // Prevent rapid multiple clicks

// function getLastThreeMonths() {
// const now = new Date();
// const months = [];
// for (let i = 2; i >= 0; i--) {
// const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
// months.push({
// name: date.toLocaleString("default", { month: "long" }),
// number: date.getMonth() + 1,
// year: date.getFullYear(),
// });
// }
// return months;
// }

// const lastThreeMonths = getLastThreeMonths();
// let currentMonthIndex = 0;

// // generateCarouselContent();
// // preloadOrders(); // Fetch all orders once on load

// // Generate carousel content
// async function renderAllMonthlyCharts() {
// const lastThreeMonths = getLastThreeMonths();

// // Loop through each month and render its chart
// for (let i = 0; i < lastThreeMonths.length; i++) {
// const month = lastThreeMonths[i];
// const orders = await fetchMonthlyOrders(month);
// updateMonthlyChart(i + 1, month.name, orders);
// }
// }




async function fetchAndDisplayThreeMonthsData() {
  const monthlyGPData = []; // Store GP data for each of the last three months
  const monthLabels = [];   // Store month names for chart labels

  try {
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Loop through the current and last two months
    for (let i = 0; i < 3; i++) {
      const pastDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = months[pastDate.getMonth()];
      const year = pastDate.getFullYear();

      monthLabels.unshift(`${monthStr} ${year}`);

      // Fetch and render each month’s data
      try {
        const response = await axios.get(`https://www.spotops360.com/orders/monthly`, {
          params: { month: monthStr, year },
        });

        if (response.status === 200) {
          const orders = response.data;
          const monthName = `${monthStr} ${year}`;
          updateMonthlyChart(i + 1, monthName, orders);

          // Calculate the total GP for the month and add it to the array
          const totalGP = orders.reduce((sum, order) => sum + (order.actualGP || 0), 0);
          monthlyGPData.unshift(totalGP); // Add the GP data in reverse order for chronological display
        } else {
          console.error(`Failed to fetch orders for ${monthStr} ${year}`);
        }
      } catch (error) {
        console.error(`Error fetching orders for ${monthStr} ${year}`, error);
      }
    }

    // Now initialize the Monthly Sales Progress Chart with GP data
    initializeMonthlySalesProgressChart(monthLabels, monthlyGPData);

  } catch (error) {
    console.error("Error setting up the date or fetching monthly data:", error);
  }
}

// Function to initialize the Monthly Sales Progress Chart
let monthlySalesProgressChartInstance = null;

function initializeMonthlySalesProgressChart(labels, data) {
  const colors = getChartColors();
  const ctx = document
    .getElementById("monthlySalesProgressChart")
    .getContext("2d");

  // Destroy the previous chart instance if it exists
  if (monthlySalesProgressChartInstance) {
    monthlySalesProgressChartInstance.destroy();
  }

  // Create a new chart
  monthlySalesProgressChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Monthly Sales Progress (Total Actual GP)",
          color: colors.axisColor,
          data: data,
          backgroundColor: colors.monthlySalesBgColor,
          // borderColor: "black",
          borderWidth: 1,
          fill: true
        },
      ],
    },
    options: {
      
      responsive: true,
        scales: {
          x: {
            title: { display: true, text: "Month", color: colors.axisColor },
            ticks: { color: colors.axisColor },
            grid: { color: colors.gridColor },
          },
          y: {
            title: { display: true, text: "Actual GP", color: colors.axisColor },
            ticks: { color: colors.axisColor },
            grid: { color: colors.gridColor },
            min: 0, // Prevent negative values
          },
        },
        plugins: {
          legend: {
            labels: {
              color: colors.legendColor,
            },
          },
          title: {
            display: true,
            color: colors.axisColor,
          },
        },
    },
  });
}
// Call the main function to fetch and display data for the three months
function updateMonthlyChart(index, monthName, orders) {
  const ctx = document.getElementById(`chart-month-${index}`).getContext("2d");
  if (chartInstances[index]) {
    chartInstances[index].destroy();
  }
  const isDarkMode = document.body.classList.contains("dark-mode");
  const colors = {
    backgroundColors: isDarkMode
      ? ["#8B5CF6", "#A78BFA", "#6366F1", "#60A5FA", "#22D3EE", "#34D399", "#F87171", "#FACC15", "#E879F9"]
      : ["#d5f0c0", "#ffe5a0", "#97d8fb", "#c3d5fa", "#f8aaa8", "#a7cf90", "#dd412b", "#5a3286", "#e6cff2"],
    borderColor: isDarkMode ? "#B3B3B3" : "#C0C0C0",
    legendColor: isDarkMode ? "#FFFFFF" : "#000000",
    titleColor: isDarkMode ? "#FFFFFF" : "#000000",
  };
  const statusLabels = [
    "Placed",
    "Customer Approved",
    "Yard Processing",
    "In Transit",
    "Escalation",
    "Order Fulfilled",
    "Order Cancelled",
    "Refunded",
    "Dispute",
  ];

  const statusCounts = statusLabels.map((status) =>
    orders.filter((order) => order.orderStatus === status).length
  );

  // Calculate the required metrics
  const totalOrders = orders.length;
  const totalFulfilled = orders.filter((order) => order.orderStatus === "Order Fulfilled").length;
  const totalEscalated = orders.filter((order) => order.orderStatus === "Escalation").length;
  const totalCancelled = orders.filter((order) => order.orderStatus === "Order Cancelled").length;
  const totalRefunded = orders.filter((order) => order.orderStatus === "Refunded").length;
  const totalDisputed = orders.filter((order) => order.orderStatus === "Dispute").length

  // Compute rates
  const successRate = totalOrders > 0 ? ((totalFulfilled / totalOrders) * 100).toFixed(2) : 0;
  const escalationRate = totalOrders > 0 ? ((totalEscalated / totalOrders) * 100).toFixed(2) : 0;
  const cancellationRate = totalOrders > 0 ? (((totalCancelled + totalRefunded + totalDisputed) / totalOrders) * 100).toFixed(2) : 0;

  // Create and store the new chart
  chartInstances[index] = new Chart(ctx, {
    type: "pie",
    data: {
      labels: statusLabels,
      datasets: [
        {
          label: `Order Status Distribution for ${monthName}`,
          data: statusCounts,
          backgroundColor: colors.backgroundColors,
          borderColor: colors.borderColor,
          borderWidth: 1,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: colors.legendColor, // Legend text color
          },
          position: "right",
        },
        title: {
          display: true,
          text: `Order Status Distribution for ${monthName}`,
          color: colors.titleColor, // Chart title color
        },
      },
    },
  });

  // Set the month name in the header
  document.getElementById(`month-name-${index}`).innerText = monthName;

  // Update the summary metrics below each chart
  document.getElementById(`rates-month-${index}`).innerHTML = `
    <div class="rate-item rate-success">
      <span><i class="fas fa-check-circle"></i> Success Rate:</span>
      <strong>${successRate}%</strong>
    </div>
    <div class="rate-item rate-escalation">
      <span><i class="fas fa-exclamation-triangle"></i> Escalation Rate:</span>
      <strong>${escalationRate}%</strong>
    </div>
    <div class="rate-item rate-cancellation">
      <span><i class="fas fa-times-circle"></i> Cancellation Rate:</span>
      <strong>${cancellationRate}%</strong>
    </div>
    <div class="rate-item total-orders">
      <span><i class="fas fa-shopping-cart"></i> Total Orders:</span>
      <strong>${totalOrders}</strong>
    </div>
  `;
}



fetchAndDisplayThreeMonthsData();
// for dark mode
// Add click event to toggle dark mode
darkModeToggle.addEventListener("click", toggleDarkMode);
// dark mode till here
const currentPath = window.location.pathname + "?newEntry=true";
console.log("currentPath",currentPath)
$(".nav-link").each(function () {
if (currentPath.includes($(this).attr("href"))) {
$(this).addClass("active");
}
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
});