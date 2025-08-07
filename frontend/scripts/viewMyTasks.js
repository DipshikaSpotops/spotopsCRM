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
"#submenu-dashboards .add-order-link, .view-individualOrders-link, .teamB-orders-link, .sales-data-link"
).hide();
} else if (team === "Vinutha") {
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
// Toggle sidebar visibility on smaller screens
$(".toggle-sidebar").on("click", function () {
$("#offcanvasSidebar").toggleClass("show");
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

$("#logoutLink").click(function () {
window.localStorage.clear();
window.location.href = "login_signup.html";
});
// for dark mode
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
  console.log("Row clicked:", $(this).text()); // Debugging
  $("#infoTable tr").removeClass("selected");
  $(this).addClass("selected");
});
// dark mode till here
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

    async function calculateTotalTasks() {
        const currentMonth = new Date().getMonth(); 
        const currentYear = new Date().getFullYear();
        let totalTasks = 0;

        try {
            const taskResponse = await axios.get(`https://www.spotops360.com/totalTasks?firstName=${firstName}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("TaskRes",taskResponse.data)
            totalTasks = taskResponse.data.totalTasks;
            console.log("totalTasks",totalTasks);
            document.getElementById("total-tasks").innerHTML = `Total No of Tasks- ${totalTasks}`;

        } catch (error) {
            console.error("Error fetching task groups:", error);
        }
    }
    await calculateTotalTasks();
// notification
const notificationIcon = $("#notificationIcon");
const notificationDropdown = $("#notificationDropdown");
const notificationList = $("#notificationList");
const notificationCountElement = $("#notificationCount");

let unreadCount = 0;

// Fetch notifications from the backend
async function fetchNotifications() {
  try {
    const response = await axios.get(`https://www.spotops360.com/notifications?userId=${firstName}`);
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
// Initial fetch on page load
fetchNotifications();
// fetch all tasks
async function fetchTasks() {
  try {
    const response = await axios.get("https://www.spotops360.com/allTasks", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const taskGroups = response.data;

    const tableBody = $("#tasksTable tbody");
    tableBody.empty();

    taskGroups.forEach((group) => {
      const { orderNo, tasks } = group;

      tasks.forEach((task) => {
        const date = new Date(task.deadline);

  const day = date.getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 24-hour time to 12-hour time
  const ordinalSuffix = (n) => {
    if (n > 3 && n < 21) return "th"; // Covers 11th to 19th
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  var formattedDeadline = `${day}${ordinalSuffix(day)} ${month}, ${year} ${hours}:${minutes} ${ampm}`;
        const row = `
          <tr>
            <td>${orderNo}</td>
            <td>${task.taskName}</td>
            <td>${task.assignedTo}</td>
            <td>${task.assignedBy}</td>
            <td>${task.taskCreatedDate}</td>
            <td>${formattedDeadline}</td>
            <td>${task.taskStatus}</td>
          </tr>
        `;
        console.log("fname",firstName,"status",task.taskStatus);
        if (task.taskStatus !== "Completed" && firstName === task.assignedTo){
        tableBody.append(row);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}

// Call the function to fetch and populate tasks
// fetchTasks();
// fetch tasks for the particular user for the particular month
async function fetchTasksOngoingMonth() {
  try {
    const response = await axios.get("https://www.spotops360.com/allTasks", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const taskGroups = response.data;

    const tableBody = $("#tasksTable tbody");
    const monthlyTableBody = $("#monthlyTasksTable tbody");
    tableBody.empty();
    monthlyTableBody.empty();
    const currentDateInDallas = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
    const currentDallasDate = new Date(currentDateInDallas);
 // Get the current year

    taskGroups.forEach((group) => {
      const { orderNo, tasks } = group;

      tasks.forEach((task) => {
        // Parse task deadline and taskCreatedDate
        const deadline = new Date(task.deadline);
        const taskCreatedDate = task.taskCreatedDate;
        console.log("taskCreatedDate",taskCreatedDate);
        
        // Format the deadline date for display
        const day = deadline.getDate();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[deadline.getMonth()];
        const year = deadline.getFullYear();

        let hours = deadline.getHours();
        const minutes = deadline.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // Convert 24-hour time to 12-hour time
        const ordinalSuffix = (n) => {
          if (n > 3 && n < 21) return "th"; // Covers 11th to 19th
          switch (n % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
          }
        };

        const formattedDeadline = `${day}${ordinalSuffix(day)} ${month}, ${year} ${hours}:${minutes} ${ampm}`;
// to take month from createdDate
  const cleanedDateString = taskCreatedDate.replace(/(\d+)(st|nd|rd|th)/, '$1');
  const newtaskCreated = new Date(cleanedDateString);

  if (isNaN(newtaskCreated.getTime())) {
    console.error("Invalid date string format");
    return null;
  }
  var taskCreatedMonth = newtaskCreated.getMonth(); 
var taskCreatedYear = newtaskCreated.getFullYear();
  const currentMonth = currentDallasDate.getMonth(); // Get the current month (0-indexed)
  const currentYear = currentDallasDate.getFullYear();
  console.log("newTaskCreated",taskCreatedMonth,taskCreatedYear,"current",currentMonth,currentYear);
        // Create a row for the task
        const row = `
          <tr>
            <td>${orderNo}</td>
            <td>${task.taskName}</td>
            <td>${task.assignedTo}</td>
            <td>${task.assignedBy}</td>
            <td>${task.taskCreatedDate}</td>
            <td>${formattedDeadline}</td>
            <td>${task.taskStatus}</td>
          </tr>
        `;

        // Add row to "All Tasks" table
        if (task.taskStatus !== "Completed" && firstName === task.assignedTo) {
          tableBody.append(row);
        }

        // Add row to "Ongoing Month" table if task was created in the current month and year (Dallas time)
        if (
          taskCreatedMonth === currentMonth &&
          taskCreatedYear === currentYear &&
          firstName === task.assignedTo
        ) {
          monthlyTableBody.append(row);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}
fetchTasksOngoingMonth();

// fetch task summary
let allTasks = [];
async function fetchTaskSummary() {
      try {
        const response = await axios.get(`https://www.spotops360.com/tasks-summary?firstName=${firstName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        allTasks = response.data;
        // Update counts
        document.getElementById("completedOnTimeCount").textContent = `Count: ${allTasks.completedOnTime.length}`;
        document.getElementById("alertCount").textContent = `Count: ${allTasks.alert.length}`;
        document.getElementById("completedLateCount").textContent = `Count: ${allTasks.completedLate.length}`;
        document.getElementById("warningCount").textContent = `Count: ${allTasks.warning.length}`;
        document.getElementById("notCompletedCount").textContent = `Count: ${allTasks.notCompleted.length}`;

        // Attach data for modal
        $(".view-orders-btn").on("click", function () {
          const category = $(this).data("category");
          let orders;
          let title;

          switch (category) {
            case "completedOnTime":
              orders = allTasks.completedOnTime;
              title = "Completed On Time";
              break;
            case "alert":
              orders = allTasks.alert;
              title = "Alert";
              break;
            case "completedLate":
              orders = allTasks.completedLate;
              title = "Completed Late";
              break;
            case "warning":
              orders = allTasks.warning;
              title = "Warning";
              break;
            case "notCompleted":
              orders = allTasks.notCompleted;
              title = "Not Completed";
              break;
          }

          $("#categoryTitle").text(title);
          const ordersList = orders.map(
            (task) => `<li>${task.orderNo} - ${task.taskName}</li>`
          );
          $("#ordersList").html(ordersList.join(""));
          $("#ordersModal").modal("show");
        });
      } catch (error) {
        console.error("Error fetching task summary:", error);
      }
    }
    fetchTaskSummary();
    $("#searchInput").on("keyup", function () {
const value = $(this).val().toLowerCase();
const filteredTasks = allTasks.filter(order => {
const basicSearch = (
(allTasks.orderNo && String(allTasks.orderNo).toLowerCase().includes(value)));
const taskSearch = allTasks.tasks && allTasks.tasks.some((info, index) => {
const taskIndex = `Index ${index + 1}`; 
return (
taskIndex.includes(value) || 
(info.taskName && info.taskName.toLowerCase().includes(value)) ||
(info.assignedTo && String(info.assignedTo).toLowerCase().includes(value)) || 
(info.assignedBy && info.assignedBy.toLowerCase().includes(value)) || 
(info.taskCreatedDate && info.taskCreatedDate.toLowerCase().includes(value)) || 
(info.deadline && info.deadline.toLowerCase().includes(value)) ||
(info.taskDescription && info.taskDescription.toLowerCase().includes(value)) ||
(info.taskStatus && info.taskStatus.toLowerCase().includes(value)) ||
(info.taskCompletionTime && info.taskCompletionTime.toLowerCase().includes(value))
);
});

// Return true if any of the basic fields or yard details match the search term
return basicSearch || yardSearch;
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