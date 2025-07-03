$(document).ready(async function () {
console.log("ready function");
let cachedDailyOrders = [];
let cachedDallasDate = null;
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
console.log("role:",role);
if (role === "Sales") {
// Hide specific reports links for Team Charlie
$("#submenu-reports .nav-link").each(function () {
  const text = $(this).text().trim();
  if (text !== "My Sales Report" && text !== "Incentives Report") {
    $(this).hide();
  }
});
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
async function fetchCancelledOrders(month, year) {
  const res = await axios.get("https://www.spotops360.com/orders/cancelled-by-date", {
    params: { month, year }
  });
  // console.log("cancelled",res.data);
  return res.data;
}

async function fetchRefundedOrders(month, year) {
  const res = await axios.get("https://www.spotops360.com/orders/refunded-by-date", {
    params: { month, year }
  });
  // console.log("refunded",res.data);
  return res.data;
}

async function fetchAndRenderCharts() {
const result = await fetchDailyOrders();
if (!result) return;

const { orders, currentDallasDate } = result;
cachedDailyOrders = orders;
cachedDallasDate = currentDallasDate;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const shortMonth = months[currentDallasDate.getMonth()];
  const year = currentDallasDate.getFullYear();
  await loadMonthlyCancellationRefundData(shortMonth, year); 

  updateSummaryCards(orders);
  await analyzeTopAgentAndBestSalesDay(orders, currentDallasDate);
  await fetchAndDisplayThreeMonthsData();
}
function showSalesInsightsPopup(topAgentToday, bestDay) {
  // Remove existing modal if any
  const existing = document.getElementById("dynamicSalesModal");
  if (existing) existing.remove();

  // Create modal overlay
  const modal = document.createElement("div");
  modal.id = "dynamicSalesModal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.backgroundColor = "rgba(0,0,0,0.5)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "9999";

  // Create content box
  const content = document.createElement("div");
  content.style.backgroundColor = "#fff";
  content.style.padding = "20px";
  content.style.borderRadius = "8px";
  content.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
  content.style.maxWidth = "400px";
  content.style.width = "90%";
  content.style.position = "relative";
  content.style.textAlign = "center";

  // Close button (×)
  const closeBtn = document.createElement("span");
  closeBtn.innerHTML = "&times;";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "10px";
  closeBtn.style.right = "15px";
  closeBtn.style.fontSize = "28px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.color = "#000";
  closeBtn.addEventListener("click", () => modal.remove());

  content.appendChild(closeBtn);

  // Sales info
  const agent = topAgentToday?.[0] || "N/A";
  const agentAmount = topAgentToday?.[1] != null ? topAgentToday[1].toFixed(2) : "N/A";
const bestDayAmount = bestDay?.[1] != null ? bestDay[1].toFixed(2) : "N/A";

  const bestDayDate = bestDay?.[0] || "N/A";
const formattedBestDay = new Date(bestDayDate).toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric"
});
  content.innerHTML += `
    <h4 style="text-align:left;">Sales Insights</h4>
    <p style="text-align:left;font-size: 15px"><strong>Top Salesagent:</strong> ${agent} ($${agentAmount})</p>
    <p style="text-align:left;font-size: 15px"><strong>Best Sales Day:</strong> ${formattedBestDay} ($${bestDayAmount})</p>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}
document.getElementById("salesInfoIcon").addEventListener("click", () => {
  try {
    if (!cachedDailyOrders.length || !cachedDallasDate) {
      alert("Sales data not available yet.");
      return;
    }

    // Calculate top agent & best day
    const topAgentToday = calculateTopAgent(cachedDailyOrders);
    const bestDay = calculateBestSalesDay(cachedDailyOrders);
    console.log("Top Agent Data:", topAgentToday);
    console.log("Best Sales Day Data:", bestDay);
    showSalesInsightsPopup(topAgentToday, bestDay);

  } catch (err) {
    console.error("Error showing popup:", err);
  }
});
function calculateTopAgent(orders) {
  const agentSales = {};
  orders.forEach(order => {
    const agent = order.salesAgent;
    const value = parseFloat(order.grossProfit || 0);  
    if (!agentSales[agent]) agentSales[agent] = 0;
    agentSales[agent] += value;
  });

  let topAgent = Object.entries(agentSales).sort((a, b) => b[1] - a[1])[0];
  return topAgent;
}

function calculateBestSalesDay(orders) {
  const dailySales = {};
  orders.forEach(order => {
    const dateKey = new Date(order.orderDate).toISOString().split("T")[0];
    const value = parseFloat(order.grossProfit || 0);  
    if (!dailySales[dateKey]) dailySales[dateKey] = 0;
    dailySales[dateKey] += value;
  });

  let bestDay = Object.entries(dailySales).sort((a, b) => b[1] - a[1])[0];
  return bestDay;
}

document.getElementById("closeInsightsModal").addEventListener("click", () => {
  document.getElementById("salesInsightsModal").style.display = "none";
});
// Fetch daily orders and display them in a chart
// Global variable to track the daily orders chart
let dailyOrdersChartInstance = null;

function getChartColors() {
  const isDarkMode = document.body.classList.contains("dark-mode");

  return {
    totalOrdersColor: isDarkMode ? "#696ffb" : "#037894", 
    actualGPColor: isDarkMode ? "#6a74fb" : "rgba(54, 162, 235, 1)", 
    totalOrdersBg: isDarkMode ? "#2c3e50" : "white",
    actualGPBg: isDarkMode ? "#29638c" : "rgba(54, 162, 235, 0.2)",

    axisColor: isDarkMode ? "#FFFFFF" : "#555555",
    gridColor: isDarkMode ? "#2c3e50" : "white", 
    legendColor: isDarkMode ? "#FFFFFF" : "#000000", 

    // Monthly chart colors
    pieChartBgColors: isDarkMode
      ? ["#8B5CF6", "#A78BFA", "#6366F1", "#60A5FA", "#22D3EE", "#34D399", "#F87171", "#FACC15", "#E879F9"]
      : ["#037894", "#ffe5a0", "#1c80b6", "#7887a4", "#b27473", "#60978c", "#780914", "#5a3286", "#9251b4"],
    pieChartBorderColor: isDarkMode ? "#B3B3B3" : "#C0C0C0",
    pieChartLegendColor: isDarkMode ? "#FFFFFF" : "#555555",

    // Bar chart colors for Monthly Sales Progress Chart
    monthlySalesBgColor: isDarkMode ? "#696ffb" : "#037894", 
    monthlySalesBorderColor: isDarkMode ? "#FFC107" : "black",
    monthlySalesTitleColor: isDarkMode ? "#FFFFFF" : "#555555"
  };
}

let month;
let year;
async function fetchDailyOrders(monthShort = null, year = null) {
  const now = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  const currentDallasDate = new Date(now);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
if (!monthShort || !year) {
  monthShort = months[currentDallasDate.getMonth()];
  year = currentDallasDate.getFullYear();
}
const displayMonthName = new Date(`${monthShort} 1, ${year}`).toLocaleString("default", {
  month: "long",
  year: "numeric"
});
document.getElementById("dailyOrdersTitle").innerText = `Daily Orders (${displayMonthName})`;
console.log("month",monthShort,"year",year);
  try {
    console.log(`Fetching data for ${monthShort} ${year}`);
const response = await axios.get(`https://www.spotops360.com/orders/monthly`, {
  params: { month: monthShort, year, limit: 1000 },
});

const { orders } = response.data;
cachedDailyOrders = orders;
cachedDallasDate = currentDallasDate;
    if (!orders || !Array.isArray(orders)) {
      console.error("Invalid orders data.");
      return;
    }

const daysInMonth = new Date(currentDallasDate.getFullYear(), currentDallasDate.getMonth() + 1, 0).getDate();
const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
const totalOrdersData = Array.from({ length: daysInMonth }, (_, i) => {
  const isCurrentMonth = monthShort === months[currentDallasDate.getMonth()] && year === currentDallasDate.getFullYear();
  const isFutureDay = isCurrentMonth && i + 1 > currentDallasDate.getDate();
  return isFutureDay ? null : 0; // Null for future days, 0 for past/today
});
orders.forEach(order => {
  const orderDateInDallas = new Date(
    new Date(order.orderDate).toLocaleString("en-US", { timeZone: "America/Chicago" })
  );
  const orderMonth = orderDateInDallas.getMonth();
  const expectedMonthIndex = months.indexOf(monthShort);

  if (orderMonth === expectedMonthIndex) {
    const day = orderDateInDallas.getDate() - 1;
    if (day >= 0 && day < totalOrdersData.length) {
      totalOrdersData[day] = (totalOrdersData[day] || 0) + 1;
    }
  }
});
    console.log("Total Orders Data (daily):", totalOrdersData);
    const ctx = document.getElementById("dailyOrdersChart");
    if (!ctx) {
      console.error("dailyOrdersChart element not found.");
      return;
    }
    // Destroying the previous chart instance if it exists
    if (dailyOrdersChartInstance) {
      dailyOrdersChartInstance.destroy();
    }
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
              pointBorderColor: colors.totalOrdersColor,
              data: totalOrdersData,
              fill: true,
              tension: 0, // <-- remove smooth curves
              stepped: true ,
              // pointBackgroundColor: "#fff",
                pointBorderWidth: 2,
                pointHoverBorderWidth: 3,
                pointRadius: 5,
                fill: true,
                tension: 0.4,
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
        maintainAspectRatio: false,
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
            min: -1, 
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
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ${value}`;
              }
            },
            backgroundColor: '#fff',
            titleColor: '#000',
            bodyColor: '#000',
            borderColor: '#ccc',
            borderWidth: 1,
            titleFont: { weight: 'bold' },
            bodyFont: { weight: 'bold' },
          },
        },
        interaction: {
            mode: 'index',
            intersect: false,
          },
          hover: {
            mode: 'index',
            intersect: false,
          },          
      },
    });
    console.log("Chart rendered successfully.");
    return { orders, currentDallasDate };
  } catch (error) {
    console.error("Error fetching daily orders:", error);
  }
}

function analyzeTopAgentAndBestSalesDay(orders) {
  if (!orders || orders.length === 0) {
    console.warn("No orders to analyze.");
    return;
  }

  const agentSales = {};
  const daySales = {};
console.log("length",orders.length);
  orders.forEach(order => {
    const agent = order.salesAgent;
    const date = new Date(order.orderDate).toISOString().split("T")[0]; // 'YYYY-MM-DD'
    const sold = parseFloat(order.grossProfit);
    
    if (!isNaN(sold)) {
      agentSales[agent] = (agentSales[agent] || 0) + sold;
      daySales[date] = (daySales[date] || 0) + sold;
    } else {
      console.warn("Invalid or missing soldP:", order.orderNo, order.soldP);
    }
  });

  // Determine top agent
  const topAgentToday = Object.entries(agentSales).reduce((max, entry) => {
    return entry[1] > max[1] ? entry : max;
  }, ["", 0]);

  // Determine best sales day
  const bestDay = Object.entries(daySales).reduce((max, entry) => {
    return entry[1] > max[1] ? entry : max;
  }, ["", 0]);

  console.log("Top Agent Data:", topAgentToday);
  console.log("Best Sales Day Data:", bestDay);
}

function cleanDateString(dateStr) {
  if (!dateStr) return null;

  // Remove ordinal suffixes
  let cleaned = dateStr.replace(/\b(\d{1,2})(st|nd|rd|th)\b/, '$1');

  // Convert "22 May, 2025 9:54" → "May 22, 2025 9:54"
  const dateRegex = /^(\d{1,2}) (\w+), (\d{4}) (.+)$/;
  if (dateRegex.test(cleaned)) {
    cleaned = cleaned.replace(dateRegex, "$2 $1, $3 $4");
  }

  return cleaned;
}
// async function fetchAllOrders() {
//   try {
//     const response = await axios.get("https://www.spotops360.com/orders");
//     console.log(response.data.length);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching all orders:", error);
//     return [];
//   }
// }

function analyzeMonthlyCancelRefunds(cancelledOrders, refundedOrders) {
  const cancelled = cancelledOrders.length;
  const refunded = refundedOrders.length;
  const totalRefundAmount = refundedOrders.reduce((sum, order) => {
    const amt = parseFloat(order.custRefAmount || 0);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

console.log(`Cancelled Orders This Month: ${cancelledOrders.length}`);
console.log(`Refunded Orders This Month: ${cancelledOrders.length}`);
  console.log(`Totals → Cancelled: ${cancelled}, Refunded: ${refunded}, Refund Amount: $${totalRefundAmount.toFixed(2)}`);

  document.getElementById("monthlyCancelRefundBox").innerHTML = `
  <div class="text-center p-2">
    <h5 class="text-warning" style="color: #ffffff !important;">Monthly Cancellations & Refunds</h5>
    <p><strong>Cancelled Orders:</strong> ${cancelled}</p>
    <p><strong>Refunded Orders:</strong> ${refunded}</p>
    <p><strong>Total Refund Amount:</strong> $${totalRefundAmount.toFixed(2)}</p>
  </div>
`;
// document.getElementById("runMigrationBtn").onclick = async function handleMigrateDates() {
//   if (!window.confirm("Are you sure you want to run the date migration?")) return;

//   try {
//     const response = await fetch("/migrate-dates");
//     const result = await response.text();
//     alert(result);
//   } catch (err) {
//     console.error("Migration failed", err);
//     alert("Migration failed. Check console.");
//   }
// };
}


function analyzeMonthlyReimbursements(orders, currentDallasDate) {
  const currentMonth = currentDallasDate.getMonth();
  const currentYear = currentDallasDate.getFullYear();

  let totalReimbursed = 0;
  let reimbursedOrderCount = 0;
  const reimbursedOrdersDetails = [];

  orders.forEach(order => {
    if (!Array.isArray(order.orderHistory) || !Array.isArray(order.additionalInfo)) return;

    // Look for "escalationProcess: Reimbursement" in orderHistory
    const reimbursementEntry = order.orderHistory.find(entry =>
      entry.includes("Reimbursement")
    );

    if (reimbursementEntry) {
      const match = reimbursementEntry.match(/on (\d{1,2}) (\w+), (\d{4})/);
      if (match) {
        const [_, day, monthStr, yearStr] = match;
        const reimbursementDate = new Date(`${monthStr} ${day}, ${yearStr}`);

        if (
          !isNaN(reimbursementDate) &&
          reimbursementDate.getMonth() === currentMonth &&
          reimbursementDate.getFullYear() === currentYear
        ) {
          // Sum reimbursementAmount(s)
          let orderReimbursementTotal = 0;

          order.additionalInfo.forEach(info => {
            const amt = parseFloat(info.reimbursementAmount);
            if (!isNaN(amt)) {
              totalReimbursed += amt;
              orderReimbursementTotal += amt;
            }
          });

          if (orderReimbursementTotal > 0) {
            reimbursedOrderCount += 1;
            reimbursedOrdersDetails.push({
              orderNo: order.orderNo || "(unknown)",
              amount: orderReimbursementTotal.toFixed(2),
            });
          }
        }
      }
    }
  });

  // Log each order reimbursement
  console.log("Orders Reimbursed This Month:");
  reimbursedOrdersDetails.forEach(detail =>
    console.log(`Order: ${detail.orderNo} | Reimbursed: $${detail.amount}`)
  );
  console.log(`Total Reimbursed Orders: ${reimbursedOrderCount}`);
  console.log(`Total Reimbursed Amount: $${totalReimbursed.toFixed(2)}`);

  // Append to UI
  const box = document.createElement("div");
  box.style.textAlign = "center";
  box.style.padding = "10px";
  box.style.backgroundColor = "#9dbfc9";
  box.innerHTML = `
    <h5 class="text-success" style="color: #ffffff !important;">Monthly Reimbursements</h5>
    <p><strong>Reimbursed Orders:</strong> ${reimbursedOrderCount}</p>
    <p><strong>Total Reimbursed Amount:</strong> $${totalReimbursed.toFixed(2)}</p>
  `;
  document.getElementById("monthlyCancelRefundBox").insertAdjacentElement("afterend", box);
}



const darkModeToggle = document.getElementById("darkModeIcon");

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode ? "true" : "false");

  darkModeToggle.classList.toggle("fa-moon", !isDarkMode);
  darkModeToggle.classList.toggle("fa-sun", isDarkMode);
  fetchDailyOrders();
  updateDoughnutChart(doughnutMonthIndex);
  drawBarChart(latestMonthLabels, latestMonthlyGPData);
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



let latestMonthLabels = [];
let latestMonthlyGPData = [];

async function fetchAndDisplayThreeMonthsData() {
  const monthLabels = [];
  const monthlyGPData = [];

  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based index (0 = Jan, 11 = Dec)

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthValue = now.toISOString().slice(0, 7); // YYYY-MM
    document.getElementById("customMonth").value = currentMonthValue;

    for (let i = 0; i <= currentMonth; i++) {
      const monthStr = months[i];
      monthLabels.push(`${monthStr} ${currentYear}`);

      const response = await axios.get("https://www.spotops360.com/orders/monthly", {
        params: {
          month: monthStr,
          year: currentYear,
          limit: 1000,
        }
      });

      if (response.status === 200) {
        const orders = response.data.orders || [];
        const totalGP = orders.reduce((sum, order) => sum + (order.actualGP || 0), 0);
        monthlyGPData.push(totalGP);
      } else {
        console.warn(`Failed to fetch data for ${monthStr} ${currentYear}`);
        monthlyGPData.push(0);
      }
    }

    latestMonthLabels = monthLabels;
    latestMonthlyGPData = monthlyGPData;

    drawBarChart(monthLabels, monthlyGPData);
  } catch (err) {
    console.error("Error fetching and displaying YTD data:", err);
  }
}


// Function to initialize the Monthly Sales Progress Chart
let monthlySalesProgressChartInstance = null;

function drawBarChart(labels, data) {
  const colors = getChartColors();
  const ctx = document.getElementById("monthlySalesProgressChart").getContext("2d");

  if (monthlySalesProgressChartInstance) {
    monthlySalesProgressChartInstance.destroy();
  }

  monthlySalesProgressChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Monthly Sales Progress (Total Actual GP)",
        data,
        backgroundColor: colors.monthlySalesBgColor,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: "Month", color: colors.axisColor },
          ticks: { color: colors.axisColor },
          grid: { color: colors.gridColor }
        },
        y: {
          title: { display: true, text: "Actual GP", color: colors.axisColor },
          ticks: { color: colors.axisColor },
          grid: { color: colors.gridColor },
          min: -1
        }
      },
      plugins: {
        legend: {
          labels: { color: colors.legendColor }
        },
        title: {
          display: true,
          color: colors.axisColor
        }
      }
    }
  });
}
let doughnutChartInstance = null;
let allFetchedMonthlyData = [];
let doughnutMonthIndex = 0;

function getLastThreeMonths() {
  const now = new Date();
  const months = [];
  for (let i = 2; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: date.toLocaleString("default", { month: "long", year: "numeric" }),
      month: date.toLocaleString("default", { month: "short" }),
      year: date.getFullYear()
    });
  }
  return months;
}

async function fetchMonthlyOrders(month, year) {
  console.log("month'''",month,year)
  try {
    const response = await axios.get(`https://www.spotops360.com/orders/monthly`, {
      params: { month, year, limit: 500 } 
    });
    return response.data.orders || [];

  } catch (err) {
    console.error("Error fetching monthly data:", err);
    return [];
  }
}

function updateDoughnutChart(monthIndex) {
  const monthData = allFetchedMonthlyData[monthIndex];
  if (!monthData) return;

  const { label, orders } = monthData;
  document.getElementById("monthDisplay").innerText = label;

  const statusLabels = [
    "Placed", "Customer Approved", "Yard Processing", "In Transit",
    "Escalation", "Order Fulfilled", "Order Cancelled", "Refunded", "Dispute"
  ];

  const statusCounts = statusLabels.map(status =>
    orders.filter(order => order.orderStatus === status).length
  );

  const totalOrders = orders.length;
  const totalFulfilled = orders.filter(o => o.orderStatus === "Order Fulfilled").length;
  const totalEscalated = orders.filter(o => o.orderStatus === "Escalation").length;
  const totalCancelled = orders.filter(o =>
    ["Order Cancelled", "Refunded", "Dispute"].includes(o.orderStatus)).length;

  const successRate = totalOrders ? ((totalFulfilled / totalOrders) * 100).toFixed(2) : 0;
  const escalationRate = totalOrders ? ((totalEscalated / totalOrders) * 100).toFixed(2) : 0;
  const cancellationRate = totalOrders ? ((totalCancelled / totalOrders) * 100).toFixed(2) : 0;

  const ctx = document.getElementById("monthlyDoughnutChart").getContext("2d");

  if (doughnutChartInstance) doughnutChartInstance.destroy();

  const colors = getChartColors();

  doughnutChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: statusLabels,
      datasets: [{
        data: statusCounts,
        backgroundColor: colors.pieChartBgColors,
        borderColor: colors.pieChartBorderColor,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: colors.pieChartLegendColor },
          position: "right"
        },
        title: {
          display: true,
          text: `Order Status Distribution for ${label}`,
          color: colors.pieChartLegendColor
        }
      }
    }
  });

  // Update metrics
  document.getElementById("monthlyRates").innerHTML = `
    <div class="rate-item rate-success">Success Rate: ${successRate}%</div>
    <div class="rate-item rate-escalation">Escalation Rate: ${escalationRate}%</div>
    <div class="rate-item rate-cancellation">Cancellation Rate: ${cancellationRate}%</div>
    <div class="rate-item total-orders">Total Orders: ${totalOrders}</div>
  `;
}

async function preloadLastThreeMonths() {
  const lastThree = getLastThreeMonths();
  allFetchedMonthlyData = [];
  for (let month of lastThree) {
    const orders = await fetchMonthlyOrders(month.month, month.year);
    allFetchedMonthlyData.push({ label: month.label, orders });
  }
  doughnutMonthIndex = allFetchedMonthlyData.length - 1; // Latest month
  updateDoughnutChart(doughnutMonthIndex);
}
function updateMonthlyFinancialSummary(index) {
  const data = allFetchedMonthlyData[index];
  if (!data || !Array.isArray(data.orders)) return;

  const orders = data.orders;

  let sales = 0;
  let estRevenue = 0;
  let actualRevenue = 0;
  let purchases = 0;
  let cancelled = 0;
  let refunded = 0;
  let refundAmount = 0;

  orders.forEach(order => {
    sales += parseFloat(order.soldP) || 0;
    estRevenue += parseFloat(order.grossProfit) || 0;
    actualRevenue += parseFloat(order.actualGP) || 0;

    if (order.orderStatus === "Order Cancelled") cancelled++;
    if (order.orderStatus === "Refunded") {
      refunded++;
      refundAmount += parseFloat(order.custRefAmount || order.custRefundedAmount || 0);
    }
console.log("lengthdd",order.length);
if (Array.isArray(order.additionalInfo)) {
  console.log("additionalInfo is an array of length", order.additionalInfo.length);

  order.additionalInfo.forEach(info => {
    console.log("Inspecting info:", info);  

    if (info.paymentStatus === "Card charged") {
      const partPrice = parseFloat(info.partPrice) || 0;

      let shipping = 0;
      if (typeof info.shippingDetails === "string" && info.shippingDetails.includes(":")) {
        const parts = info.shippingDetails.split(":");
        shipping = parseFloat(parts[1]) || 0;
      }

      const others = parseFloat(info.others) || 0;
      const sum = partPrice + shipping + others;

      purchases += sum;
      console.log("Added to purchases:", sum, "Running total:", purchases);
    }
  });
} else {
  console.warn("order.additionalInfo is not an array!", order.additionalInfo);
}
  });

  // Update DOM (assumes you have elements with these IDs)
  $("#salesTotal").text(`$${sales.toFixed(2)}`);
  $("#grossProfitTotal").text(`$${estRevenue.toFixed(2)}`);
  $("#actualGPTotal").text(`$${actualRevenue.toFixed(2)}`);
  $("#purchaseTotal").text(`$${purchases.toFixed(2)}`);

  // Cancel/Refund box (optional custom container)
  $("#monthlyCancelRefundBox").html(`
    <div class="text-center p-2">
      <h5 class="text-warning" style="color: #ffffff !important;">Monthly Cancellations & Refunds</h5>
      <p><strong>Cancelled Orders:</strong> ${cancelled}</p>
      <p><strong>Refunded Orders:</strong> ${refunded}</p>
      <p><strong>Total Refund Amount:</strong> $${refundAmount.toFixed(2)}</p>
    </div>
  `);
}
async function loadMonthlyCancellationRefundData(monthShort, year) {
  const [cancelledOrders, refundedOrders] = await Promise.all([
    fetchCancelledOrders(monthShort, year),
    fetchRefundedOrders(monthShort, year)
  ]);

  analyzeMonthlyCancelRefunds(cancelledOrders, refundedOrders);
}
// Event listeners
document.getElementById("prevMonthBtn").addEventListener("click", async () => {
  if (doughnutMonthIndex > 0) {
    doughnutMonthIndex--;
    updateDoughnutChart(doughnutMonthIndex);
    updateMonthlyFinancialSummary(doughnutMonthIndex);

    const { label } = allFetchedMonthlyData[doughnutMonthIndex];
    const [monthName, yearStr] = label.split(" ");
    const monthShort = monthName.slice(0, 3);

    await loadMonthlyCancellationRefundData(monthShort, parseInt(yearStr));
    await fetchDailyOrders(monthShort, parseInt(yearStr)); // 👈 Update chart here
  }
});
document.getElementById("nextMonthBtn").addEventListener("click", async () => {
  if (doughnutMonthIndex < allFetchedMonthlyData.length - 1) {
    doughnutMonthIndex++;
    updateDoughnutChart(doughnutMonthIndex);
    updateMonthlyFinancialSummary(doughnutMonthIndex);

    const { label } = allFetchedMonthlyData[doughnutMonthIndex];
    const [monthName, yearStr] = label.split(" ");
    const monthShort = monthName.slice(0, 3);

    await loadMonthlyCancellationRefundData(monthShort, parseInt(yearStr));
    await fetchDailyOrders(monthShort, parseInt(yearStr));
  }
});
document.getElementById("goToMonthBtn").addEventListener("click", async () => {
  const monthInput = document.getElementById("customMonth").value;
  if (!monthInput) return;

  const [year, monthNum] = monthInput.split("-");
  const date = new Date(year, monthNum - 1);
  const monthShort = date.toLocaleString("default", { month: "short" });
  const label = date.toLocaleString("default", { month: "long", year: "numeric" });

  const orders = await fetchMonthlyOrders(monthShort, parseInt(year));
  allFetchedMonthlyData.push({ label, orders });
  doughnutMonthIndex = allFetchedMonthlyData.length - 1;

  updateDoughnutChart(doughnutMonthIndex);
  updateMonthlyFinancialSummary(doughnutMonthIndex);
  await loadMonthlyCancellationRefundData(monthShort, parseInt(year));
  await fetchDailyOrders(monthShort, parseInt(year)); 
});

// Initial call
preloadLastThreeMonths();

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
const activeLink = $(".nav-link.active")[0];
if (activeLink) {
  activeLink.scrollIntoView({ behavior: "smooth", block: "center" });
}
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

function updateSummaryCards(orders) {
  let totalSales = 0;
  let totalGrossProfit = 0;
  let totalActualGP = 0;
  let totalPurchases = 0;

  orders.forEach(order => {
    // Sales (soldP)
    const soldP = parseFloat(order.soldP) || 0;
    totalSales += soldP;

    // Gross Profit
    const gp = parseFloat(order.grossProfit) || 0;
    totalGrossProfit += gp;

    // Actual GP (only if present)
    if (order.actualGP !== undefined && !isNaN(order.actualGP)) {
      totalActualGP += parseFloat(order.actualGP);
    }

    // Purchases
    if (Array.isArray(order.additionalInfo)) {
      order.additionalInfo.forEach(info => {
        if (info.paymentStatus === "Card charged") {
        const partPrice = parseFloat(info.partPrice) || 0;
        let shipping = 0;
        const shippingStr = info.shippingDetails || "";
        const shippingMatch = shippingStr.match(/(\d+(\.\d+)?)/);
        if (shippingMatch) {
          shipping = parseFloat(shippingMatch[1]);
        }
        console.log("shipping",shippingStr,shipping);
        const others = parseFloat(info.others) || 0;
        const refundedAmount = parseFloat(info.refundedAmount) || 0;
        totalPurchases += partPrice + shipping + others - refundedAmount;
        console.log("totalPurchases",totalPurchases);
      }
      });
    }
  });

  // Update the UI
  document.getElementById("salesTotal").innerText = `$${totalSales.toFixed(2)}`;
  document.getElementById("grossProfitTotal").innerText = `$${totalGrossProfit.toFixed(2)}`;
  document.getElementById("actualGPTotal").innerText = `$${totalActualGP.toFixed(2)}`;
  document.getElementById("purchaseTotal").innerText = `$${totalPurchases.toFixed(2)}`;
}

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
const handleMigrateDates = async () => {
  if (!window.confirm("Are you absolutely sure you want to run the migration? This will modify order dates.")) return;

  try {
    const response = await fetch("/admin/migrate-dates", {
      method: "GET"
    });

    const text = await response.text();
    alert(text);
  } catch (error) {
    console.error("Migration failed", error);
    alert("Migration failed. Check console.");
  }
};
  const searchInput = document.getElementById('searchInput');
  const resultDiv = document.getElementById('searchResult');

  searchInput.addEventListener('input', function () {
    const orderNo = searchInput.value.trim();

    // Check if input is not empty
    if (orderNo !== '') {
      resultDiv.innerHTML = `
        <button class="btn btn-primary btn-sm" id="viewOrderBtn">View Order</button>
      `;

      // Add click event each time the button is created
      document.getElementById('viewOrderBtn').addEventListener('click', function () {
        // Assuming you redirect to a page that accepts orderNo as a query parameter
       window.location.href = 'form.html?orderNo=' + encodeURIComponent(orderNo) + '&process=true';

      });
    } else {
      // Clear result if input is empty
      resultDiv.innerHTML = '';
    }
  });
    const searchInputForOrderNo = document.getElementById('searchInputForOrderNo');
  const resultOrder = document.getElementById('searchResult');

  searchInput.addEventListener('input', function () {
    const orderNo = searchInputForOrderNo.value.trim();

    if (orderNo !== '') {
      resultOrder.innerHTML = `
        <button class="btn btn-primary btn-sm" id="viewOrderBtn">View Order</button>
      `;

      document.getElementById('viewOrderBtn').addEventListener('click', function () {
       window.location.href = 'form.html?orderNo=' + encodeURIComponent(orderNo) + '&process=true';

      });
    } else {
      resultDiv.innerHTML = '';
    }
  });
fetchNotifications();
await fetchAndRenderCharts()
});

