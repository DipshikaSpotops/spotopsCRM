let cachedDailyOrders = [];
let cachedDallasDate = null;
let dailyOrdersChartInstance = null;
let monthlySalesProgressChartInstance = null;
let doughnutChartInstance = null;
let allFetchedMonthlyData = [];
let doughnutMonthIndex = 0;
let latestMonthLabels = [];
let latestMonthlyGPData = [];
let chartInstances = {};
let cachedOrders = {};
let isNavigating = false;
async function fetchCancelledOrders(month, year) {
  const res = await axios.get("https://www.spotops360.com/orders/cancelled-by-date", {
    params: { month, year }
  });
  return res.data;
}
  async function fetchRefundedOrders(month, year) {
  const res = await axios.get("https://www.spotops360.com/orders/refunded-by-date", {
    params: { month, year }
  });
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
  const existing = document.getElementById("dynamicSalesModal");
  if (existing) existing.remove();

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

  const content = document.createElement("div");
  content.style.backgroundColor = "#fff";
  content.style.padding = "20px";
  content.style.borderRadius = "8px";
  content.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
  content.style.maxWidth = "400px";
  content.style.width = "90%";
  content.style.position = "relative";
  content.style.textAlign = "center";

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

  const agent = topAgentToday?.[0] || "N/A";
  const agentAmount = topAgentToday?.[1] != null ? topAgentToday[1].toFixed(2) : "N/A";
  const bestDayAmount = bestDay?.[1] != null ? bestDay[1].toFixed(2) : "N/A";
  const bestDayDate = bestDay?.[0] || "N/A";

  const formattedBestDay = new Date(bestDayDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const title = document.createElement("h4");
  title.style.textAlign = "left";
  title.innerText = "Sales Insights";

  const agentLine = document.createElement("p");
  agentLine.style.textAlign = "left";
  agentLine.style.fontSize = "15px";
  agentLine.innerHTML = `<strong>Top Salesagent:</strong> ${agent} ($${agentAmount})`;

  const dayLine = document.createElement("p");
  dayLine.style.textAlign = "left";
  dayLine.style.fontSize = "15px";
  dayLine.innerHTML = `<strong>Best Sales Day:</strong> ${formattedBestDay} ($${bestDayAmount})`;

  content.appendChild(title);
  content.appendChild(agentLine);
  content.appendChild(dayLine);

  modal.appendChild(content);
  document.body.appendChild(modal);

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}
function calculateTopAgent(orders) {
  const agentSales = {};
  const todayDallas = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  const todayDate = new Date(todayDallas).toISOString().split("T")[0];

  orders.forEach(order => {
    const orderDate = new Date(order.orderDate).toISOString().split("T")[0];
    if (orderDate !== todayDate) return;
    const agent = order.salesAgent;
    const value = parseFloat(order.grossProfit || 0);
    if (!agentSales[agent]) agentSales[agent] = 0;
    agentSales[agent] += value;
  });

  return Object.entries(agentSales).sort((a, b) => b[1] - a[1])[0];
}
function calculateBestSalesDay(orders) {
  const dailySales = {};
  orders.forEach(order => {
    const dateKey = new Date(order.orderDate).toISOString().split("T")[0];
    const value = parseFloat(order.grossProfit || 0);
    if (!dailySales[dateKey]) dailySales[dateKey] = 0;
    dailySales[dateKey] += value;
  });

  return Object.entries(dailySales).sort((a, b) => b[1] - a[1])[0];
}
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

  try {
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
      return isFutureDay ? null : 0;
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

    const ctx = document.getElementById("dailyOrdersChart");
    if (!ctx) {
      console.error("dailyOrdersChart element not found.");
      return;
    }

    if (dailyOrdersChartInstance) {
      dailyOrdersChartInstance.destroy();
    }

    const colors = getChartColors();

    dailyOrdersChartInstance = new Chart(ctx.getContext("2d"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "Total Orders",
          backgroundColor: colors.totalOrdersBg,
          borderColor: colors.totalOrdersColor,
          pointBackgroundColor: colors.totalOrdersColor,
          pointBorderColor: colors.totalOrdersColor,
          data: totalOrdersData,
          fill: true,
          tension: 0,
          stepped: true,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 3,
          pointRadius: 5,
        }]
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
            labels: { color: colors.legendColor }
          }
        }
      },
    });

    return { orders, currentDallasDate };
  } catch (error) {
    console.error("Error fetching daily orders:", error);
  }
}
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
    pieChartBgColors: isDarkMode
      ? ["#8B5CF6", "#A78BFA", "#6366F1", "#60A5FA", "#22D3EE", "#34D399", "#F87171", "#FACC15", "#E879F9"]
      : ["#037894", "#ffe5a0", "#1c80b6", "#7887a4", "#b27473", "#60978c", "#780914", "#5a3286", "#9251b4"],
    pieChartBorderColor: isDarkMode ? "#B3B3B3" : "#C0C0C0",
    pieChartLegendColor: isDarkMode ? "#FFFFFF" : "#555555",
    monthlySalesBgColor: isDarkMode ? "#696ffb" : "#037894",
    monthlySalesBorderColor: isDarkMode ? "#FFC107" : "black",
    monthlySalesTitleColor: isDarkMode ? "#FFFFFF" : "#555555"
  };
}
$(document).ready(async function () {
  console.log("ready function");

  // ✅ CRITICAL: Session check FIRST
  const currentTime = Date.now();
  const loginTimestamp = localStorage.getItem("loginTimestamp");
  if (loginTimestamp) {
    const timeDifference = (currentTime - loginTimestamp) / (1000 * 60 * 60);
    if (timeDifference >= 12) {
      alert("Your session has expired. You will be redirected to the login page.");
      window.localStorage.clear(); 
      window.location.href = "login_signup.html";
    }
  } else {
    window.location.href = "login_signup.html";
  }

  // ✅ Basic user info setup
  const firstName = localStorage.getItem("firstName");
  $("#user-name").text(firstName);
  const lastName = localStorage.getItem("lastName");
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  const team = localStorage.getItem("team");

  // ✅ Simple click binds (critical UI)
  $("#viewAlltasks").on("click", () => window.location.href = "viewAllTasks.html");
  $("#logoutLink").click(() => {
    window.localStorage.clear();
    window.location.href = "login_signup.html";
  });

  // ✅ Sidebar toggle
  $(".toggle-sidebar").on("click", function () {
    $("#offcanvasSidebar").toggleClass("show");
    if ($("#offcanvasSidebar").hasClass("show")) {
      $("body").addClass("no-scroll").append('<div class="modal-overlay"></div>');
    } else {
      $("body").removeClass("no-scroll");
      $(".modal-overlay").remove();
    }
  });

  // ✅ Role-based restrictions (Sales, Admin, Team Mark, Team Sussane)
  console.log("role:", role);
  if (role === "Sales") {
    // 👉 Sales restrictions code
    $("#submenu-reports .nav-link").each(function () {
      const text = $(this).text().trim();
      if (text !== "My Sales Report" && text !== "Incentives Report") {
        $(this).hide();
      }
    });
    $("#submenu-dashboards .in-transit-link, #submenu-dashboards .view-fulfilled-link, .escalation, .view-ordersSheet-link, .customer-approved-link, #submenu-dashboards .teamA-orders-link, #submenu-dashboards .teamB-orders-link, #submenu-dashboards .placed-orders-link, #submenu-dashboards .cancelled-orders-link, #submenu-dashboards .refunded-orders-link, #submenu-dashboards .yard-info-link, #submenu-dashboards .escalated-orders, #submenu-dashboards .ongoingEscalated-orders, #submenu-dashboards .yard-located-orders, #submenu-dashboards .sales-data-link, #submenu-dashboards .view-myTasks-link")
      .hide();
    $(".nav-item:has(#submenu-teams)").hide();
    $(".nav-item:has(#submenu-users)").hide();
    $(".nav-item:has(#submenu-invoices)").hide();

  } else if (team === "Team Mark") {
    // 👉 Team Mark restrictions code goes here (currently empty)
    // example:
    // $('#submenu-reports .nav-link:contains("My Sales Report")').hide();
    // $(".nav-item:has(#submenu-teams)").hide();
    // ...

  } else if (team === "Team Sussane") {
    // 👉 Team Sussane restrictions code goes here

  } else if (role === "Admin") {
    // 👉 Admin restrictions code goes here
  }

  // ✅ Profile modal
  $("#profile").click(function () {
    $("#profileFirstName").val(firstName);
    $("#profileLastName").val(lastName);
    $("#profileEmail").val(email);
    $("#profileRole").val(role);
    $("#profileModal").modal("show");
  });

  $(".close").click(() => location.reload());
});

setTimeout(async () => {
  console.log("Deferred: Loading heavy data...");
  
  preloadLastThreeMonths();     // ✅ loads last 3 months for doughnut chart
  await fetchAndRenderCharts(); // ✅ heavy chart work
  fetchNotifications();         // ✅ load notifications count
}, 50);
const chartSection = document.getElementById("dailyOrdersChart");
if (chartSection) {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      console.log("Lazy: Loading detailed charts");
      fetchAndRenderCharts(); // only load when user scrolls to it
      observer.disconnect();
    }
  });
  observer.observe(chartSection);
}
function getLastThreeMonths() {
  const now = new Date();
  const months = [];
  
  for (let i = 2; i >= 0; i--) {  // Get current month, last month, month before that
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: date.toLocaleString("default", { month: "long", year: "numeric" }),
      month: date.toLocaleString("default", { month: "short" }),
      year: date.getFullYear()
    });
  }

  return months;
}

async function preloadLastThreeMonths() {
  const lastThree = getLastThreeMonths();
  allFetchedMonthlyData = [];
  for (let month of lastThree) {
    const orders = await fetchMonthlyOrders(month.month, month.year);
    allFetchedMonthlyData.push({ label: month.label, orders });
  }
  doughnutMonthIndex = allFetchedMonthlyData.length - 1;
  updateDoughnutChart(doughnutMonthIndex);
}
// setTimeout(() => preloadLastThreeMonths(), 50);

