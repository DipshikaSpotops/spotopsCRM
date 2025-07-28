$(document).ready(function () {
  console.log("ready function");

  // ===== Phase 1: Critical =====
  sessionCheck();
  uiInit();
  roleRestrictions();
  
  // Run the absolutely essential UI tweaks instantly
  preloadLastThreeMonths(); // Keeps charts prepared but doesn't render yet
  fetchNotifications(); // Light call, keeps count ready
  
  // ===== Phase 2: Deferred (after UI is interactive) =====
  setTimeout(() => {
    console.log("Deferred: charts & notifications running");
    loadHeavyData();
  }, 100);

  // ===== Phase 3: Lazy (on-demand) =====
  lazyLoadFeatures();
});

/* ================================
   📌 PHASE 1: CRITICAL FUNCTIONS
================================== */

function sessionCheck() {
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
}

function uiInit() {
  // Sidebar toggle
  $(".toggle-sidebar").on("click", function () {
    $("#offcanvasSidebar").toggleClass("show");
    if ($("#offcanvasSidebar").hasClass("show")) {
      $("body").addClass("no-scroll").append('<div class="modal-overlay"></div>');
    } else {
      $("body").removeClass("no-scroll");
      $(".modal-overlay").remove();
    }
  });

  // Logout
  $("#logoutLink").click(function () {
    window.localStorage.clear();
    window.location.href = "login_signup.html";
  });

  // Dark mode setup
  initDarkMode();
}

function roleRestrictions() {
  const role = localStorage.getItem("role");
  const team = localStorage.getItem("team");

  // 🚩 All your role/team restrictions here
  if (role === "Sales") {
    $("#submenu-reports .nav-link").each(function () {
      const text = $(this).text().trim();
      if (text !== "My Sales Report" && text !== "Incentives Report") {
        $(this).hide();
      }
    });
    // ... keep the rest unchanged
  }
}

/* ================================
   📌 PHASE 2: DEFERRED FUNCTIONS
================================== */

async function loadHeavyData() {
  // ✅ Load charts after UI is interactive
  await chartLoader();

  // ✅ Notifications dropdown logic & mark read
  notificationsHandler();
}

/* ================================
   📌 PHASE 3: LAZY FUNCTIONS
================================== */

function lazyLoadFeatures() {
  // Example: Only load charts when user scrolls to them
  const chartSection = document.getElementById("dailyOrdersChart");
  if (chartSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        console.log("Lazy: Loading detailed charts");
        chartLoader();
        observer.disconnect();
      }
    });
    observer.observe(chartSection);
  }
}

/* ================================
   🔧 SUPPORT FUNCTIONS
================================== */

function chartLoader() {
  return new Promise((resolve) => {
    if (!window.Chart) {
      // Lazy-load Chart.js
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.onload = async () => {
        console.log("Chart.js loaded");
        await fetchAndRenderCharts();
        resolve();
      };
      document.head.appendChild(script);
    } else {
      fetchAndRenderCharts().then(resolve);
    }
  });
}

function notificationsHandler() {
  const notificationIcon = $("#notificationIcon");
  const notificationDropdown = $("#notificationDropdown");

  notificationIcon.on("click", async function () {
    notificationDropdown.toggle();
    await fetchNotifications();
    await markNotificationsAsRead();
  });
}

function initDarkMode() {
  const darkModeToggle = document.getElementById("darkModeIcon");
  const savedDarkMode = localStorage.getItem("darkMode");

  if (savedDarkMode === "true") {
    document.body.classList.add("dark-mode");
    darkModeToggle.classList.replace("fa-moon", "fa-sun");
  } else {
    darkModeToggle.classList.replace("fa-sun", "fa-moon");
  }

  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark ? "true" : "false");
    darkModeToggle.classList.toggle("fa-moon", !isDark);
    darkModeToggle.classList.toggle("fa-sun", isDark);
    fetchDailyOrders();
    updateDoughnutChart(doughnutMonthIndex);
    drawBarChart(latestMonthLabels, latestMonthlyGPData);
  });
}
