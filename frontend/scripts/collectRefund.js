// $(document).ready(() => {
//     (async function () {
$("#viewAlltasks").on("click", function () {
    window.location.href = "viewAllTasks.html";
  });
  let yardOrders = [];
  const rowsPerPage = 25;
  let currentPage = 1; 
  let currentSort = {
  column: "",
  order: "asc", 
  };
  
  function sortTable(column, order, isDateColumn, isYardColumn) {
  const tbody = $("#yardInfoTable");
  const rows = tbody.find("tr").toArray();
  
  rows.sort(function (a, b) {
  let cellA = $(a).find("td").eq(column).text().trim();
  let cellB = $(b).find("td").eq(column).text().trim();
  
  if (isDateColumn) {
  // Convert date strings into Date objects for sorting
  cellA = new Date(cellA);
  cellB = new Date(cellB);
  return order === "asc" ? cellA - cellB : cellB - cellA;
  } else if (isYardColumn) {
  // Sort Yard columns alphabetically
  return order === "asc"
  ? cellA.localeCompare(cellB)
  : cellB.localeCompare(cellA);
  } else {
  // General string comparison for other columns
  return order === "asc"
  ? cellA.localeCompare(cellB)
  : cellB.localeCompare(cellA);
  }
  });
  
  // Append sorted rows back to the table body
  $.each(rows, function (index, row) {
  tbody.append(row);
  });
  }
  
  // Click event for sorting columns with numerical values and dates
  $(document).on("click", ".onlyNumber", function () {
  const column = $(this).closest("th").index();
  const sortBy = $(this).closest("th").data("sort");
  
  // Ensure sortBy is defined before using it
  if (!sortBy) return;
  
  // Determine if the column is a date column or Yard column
  const isDateColumn = sortBy === "orderDate";
  const isYardColumn = sortBy.startsWith("yard");
  
  // Toggle the sort order
  currentSort.order =
  currentSort.column === sortBy && currentSort.order === "asc"
  ? "desc"
  : "asc";
  currentSort.column = sortBy;
  
  sortTable(column, currentSort.order, isDateColumn, isYardColumn);
  
  // Update sort icon
  $(".sort-icon").html("&#9650;"); // Reset all icons to ascending
  $(this)
  .find(".sort-icon")
  .html(currentSort.order === "asc" ? "&#9650;" : "&#9660;"); 
  });
  // Click event for sorting Yard columns
  $(document).on("click", ".fYardName", function () {
  const column = $(this).closest("th").index();
  const sortBy = $(this).closest("th").data("sort");
  
  // Determine if the column is a Yard column
  const isYardColumn = sortBy.startsWith("yard");
  
  // Toggle the sort order
  currentSort.order =
  currentSort.column === sortBy && currentSort.order === "asc"
  ? "desc"
  : "asc";
  currentSort.column = sortBy;
  
  sortTable(column, currentSort.order, false, isYardColumn);
  
  // Update sort icon
  $(".fYardName").html("&#9650;"); // Reset all icons to ascending
  $(this).html(currentSort.order === "asc" ? "&#9650;" : "&#9660;"); // Toggle current column icon
  });
  
  // Click event for sorting any sortable column
  $(document).on(
  "click",
  "th[data-sort], th[data-sort] .sort-icon",
  function (event) {
  const $target = $(event.target);
  const $th = $target.closest("th");
  const column = $th.index();
  const sortBy = $th.data("sort");
  
  // Determine if the column is a date column or a yard column
  const isDateColumn = sortBy === "orderDate";
  const isYardColumn = sortBy.startsWith("yard");
  
  // Toggle the sort order
  currentSort.order =
  currentSort.column === sortBy && currentSort.order === "asc"
  ? "desc"
  : "asc";
  currentSort.column = sortBy;
  
  sortTable(column, currentSort.order, isDateColumn, isYardColumn);
  
  // Update sort icon
  $("th[data-sort] .sort-icon").html("&#9650;"); // Reset all icons to ascending
  $th
  .find(".sort-icon")
  .html(currentSort.order === "asc" ? "&#9650;" : "&#9660;"); // Toggle current column icon
  }
  );
  
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
  
  const token = localStorage.getItem("token");
  var team;
  let yardData = [];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const lastVisitedPage = sessionStorage.getItem("lastVisitedPage");
  
  if (lastVisitedPage && document.referrer.includes("form.html")) {
      let savedMonthYear = sessionStorage.getItem("selectedMonthYear");
      let savedPage = sessionStorage.getItem("currentPage");
      let savedSearch = sessionStorage.getItem("searchValue"); 
      if (savedMonthYear) $("#monthYearPicker").val(savedMonthYear);
      if (savedPage) currentPage = parseInt(savedPage);
  
      if (savedSearch) {
          $("#searchInput").val(savedSearch);
          setTimeout(() => {
              $("#searchInput").trigger("keyup"); 
          }, 200); // Ensure DOM is ready
      }
  
      sessionStorage.removeItem("lastVisitedPage");
  } else {
          // If coming from another menu, set it to the current month
          const now = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
          const date = new Date(now);
          const month = months[date.getMonth()];
          const year = date.getFullYear();
          $("#monthYearPicker").val(`${year}-${String(date.getMonth() + 1).padStart(2, "0")}`);
      }
  
      const [year, monthNumber] = $("#monthYearPicker").val().split("-");
      const month = months[parseInt(monthNumber, 10) - 1];
  await fetchYardInfo(month, year);
  // Fetch yard info data for a specific month and 
  async function fetchYardInfo(month, year) {
  try {
  $("#loadingMessage").show();
  const response = await axios.get(`https://www.spotops360.com/orders/monthly`, {
  headers: { Authorization: `Bearer ${token}` },
  params: {
    month,
    year,
    limit: "all"
  }
});
  
 const allOrders = response.data.orders || [];

yardOrders = allOrders.filter(order =>
  order.additionalInfo.some(info =>
    info.collectRefundCheckbox === "Ticked"
  )
);

  
  let totalSpend = 0;
  yardOrders.forEach(order => {
  let orderSpend = 0;
  order.additionalInfo.forEach(info => {
  // if (info.paymentStatus === "Card charged") {
  const shippingCost = info.shippingDetails
  ? parseFloat(info.shippingDetails.split(":")[1]?.trim()) || 0
  : 0;
  const partPrice = parseFloat(info.partPrice || 0);
  const others = parseFloat(info.others || 0);
  const refundedAmount = parseFloat(info.refundedAmount || 0);
  
  const itemSpend = partPrice + others + shippingCost;
  console.log("iem",itemSpend);
  orderSpend += itemSpend;
  // }
  });
  order.totalSpend = orderSpend;
  totalSpend += orderSpend;
  });
  
  console.log("Total spend across all orders:", totalSpend);
  console.log("yardOrders with calculated spends", yardOrders);
  renderTable(currentPage, yardOrders);
  createPaginationControls(Math.ceil(yardOrders.length / 25));
  } catch (error) {
  console.error("Error fetching yard info:", error);
  alert("Failed to fetch data");
  } finally {
  $("#loadingMessage").hide();
  }
  }
  setTimeout(() => {
      const restoredSearch = $("#searchInput").val();
      if (restoredSearch) {
          $("#searchInput").trigger("keyup");
      }
  }, 300);
  
  
  
  function renderTable(page, data = yardOrders) {
      const tableHeader = $("#tableHeader");
      const tableFooter = $("#tableFooter");
      $("#yardInfoTable").empty();
      let maxYards = 0;
      let totalPartPriceSum = 0;
      let totalShippingSum = 0;
      let totalOthersSum = 0;
      let totalOverallSum = 0;
      let totalRefundsSum = 0;
      let totalToBeRefundedSum = 0;
      let totalRefundToCollect = 0; // Initialize the total refund to collect
  
      data.forEach((item) => {
          if (Array.isArray(item.additionalInfo)) {
              item.additionalInfo.forEach((info, index) => {
                  if (info.collectRefundCheckbox === "Ticked" && index + 1 > maxYards) {
                      maxYards = index + 1;
                  }
              });
          }
      });
  
      tableHeader.find("th:gt(1)").remove(); // Remove all columns after Order Date
      for (let i = 1; i <= maxYards; i++) {
          tableHeader.append(
              `<th style="text-align:center;cursor: pointer" scope="col" data-sort="yard${i}">Yard ${i} <span class="sort-icon fYardName">&#9650;</span></th>`
          );
      }
  
      tableHeader.append(
          '<th style="text-align:center;cursor: pointer" scope="col" data-sort="totalPartPrice">Total Part Price <span class="sort-icon onlyNumber">&#x25B2;</span></th>'
      );
      tableHeader.append(
          '<th style="text-align:center;cursor: pointer" scope="col" data-sort="totalShipping">Total Shipping($) <span class="sort-icon onlyNumber">&#x25B2;</span></th>'
      );
      tableHeader.append(
          '<th style="text-align:center;cursor: pointer" scope="col" data-sort="others">Other Charges($) <span class="sort-icon onlyNumber">&#x25B2;</span></th>'
      );
      tableHeader.append(
          '<th style="text-align:center;cursor: pointer" scope="col" data-sort="overallToBeRefunded">To Be Refunded($) <span class="sort-icon onlyNumber">&#x25B2;</span></th>'
      );
      tableHeader.append(
          '<th style="text-align:center;cursor: pointer" scope="col" data-sort="refunds">Refunded($) <span class="sort-icon onlyNumber">&#x25B2;</span></th>'
      );
      tableHeader.append(
          '<th style="text-align:center;cursor: pointer" scope="col" data-sort="overallSum">Overall Purchase Cost($) <span class="sort-icon onlyNumber">&#x25B2;</span></th>'
      );
      tableHeader.append('<th scope="col">Actions</th>');
  
      data.forEach((item) => {
          let appendOrder = false;
          let yardInfoHtml = "";
          let totalPartPrice = 0;
          let totalShipping = 0;
          let otherCharges = 0;
          let overallPurchaseCost = 0;
          let totalOveralls = 0;
          let overAllwithRefund = 0;
          let tRefunds = 0;
          let totalToBeRefunded = 0;
  
          if (Array.isArray(item.additionalInfo)) {
              for (let i = 0; i < maxYards; i++) {
                  const additionalInfo = item.additionalInfo[i];
  
                  if (
                      additionalInfo &&
                      additionalInfo.collectRefundCheckbox === "Ticked"
                  ) {
                      appendOrder = true;
  
                      const partPrice = parseFloat(additionalInfo.partPrice || 0);
                      let otherC = parseFloat(additionalInfo.others || 0);
                      let shippingDetails = additionalInfo.shippingDetails;
                      let shippingCharge = 0;
                      let refunds = parseFloat(additionalInfo.refundedAmount || 0);
                      console.log("refunds",refunds);
                      let toBeRefunded = parseFloat(additionalInfo.refundToCollect || 0);
  
                      if (shippingDetails) {
                          shippingCharge = parseFloat(shippingDetails.split(":")[1]?.trim() || 0);
                      }
  
                      if (refunds === 0) {
                          totalRefundToCollect += toBeRefunded;
                      }
  
                      totalPartPrice += partPrice;
                      totalShipping += shippingCharge;
                      otherCharges += otherC;
                      tRefunds += refunds;
                      totalToBeRefunded += toBeRefunded;
                      overallPurchaseCost = partPrice + shippingCharge + otherC;
                      overAllwithRefund = overallPurchaseCost - refunds;
                      totalOveralls += overAllwithRefund;
  
                      yardInfoHtml += `<td>
                          ${additionalInfo.yardName || ""}<br>
                          ${additionalInfo.partPrice ? ` Part Price: ${additionalInfo.partPrice}` : ""}
                          ${shippingDetails ? ` | ${shippingDetails}` : ""}<br>
                          ${additionalInfo.status ? `  Status: ${additionalInfo.status}` : ""}
                      </td>`;
                  } else {
                      yardInfoHtml += "<td></td>";
                  }
              }
          }
  
          if (appendOrder) {
              totalPartPriceSum += totalPartPrice;
              totalShippingSum += totalShipping;
              totalOthersSum += otherCharges;
              totalOverallSum += totalOveralls;
              totalRefundsSum += tRefunds;
              totalToBeRefundedSum += totalToBeRefunded;
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
              $("#yardInfoTable").append(
                  `<tr>
                  <td>${item.orderNo}</td>
                  <td>${formattedOrderDate}</td>
                  ${yardInfoHtml}
                  <td>${totalPartPrice.toFixed(2)}</td>
                  <td>${totalShipping.toFixed(2)}</td>
                  <td>${otherCharges.toFixed(2)}</td>
                  <td>${totalToBeRefunded.toFixed(2)}</td>
                  <td>${tRefunds.toFixed(2)}</td>
                  <td>${totalOveralls.toFixed(2)}</td>
                  <td><button class="btn btn-success btn-sm process-btn" data-id="${item.orderNo}" >View</button></td>
                  </tr>`
              );
          }
      });
  
      // Update footer
      let footerHtml = "<tr>";
      for (let i = 0; i <= maxYards + 1; i++) {
          footerHtml += "<td></td>";
      }
      footerHtml += `
          <td id="totalPartPrice" style="text-align:center;">$${totalPartPriceSum.toFixed(2)}</td>
          <td id="totalShipping" style="text-align:center;">$${totalShippingSum.toFixed(2)}</td>
          <td id="others" style="text-align:center;">$${totalOthersSum.toFixed(2)}</td>
          <td id="toBeRefunded" style="text-align:center;">$${totalToBeRefundedSum.toFixed(2)}</td>
          <td id="refunds" style="text-align:center;">$${totalRefundsSum.toFixed(2)}</td>
          <td id="overallSum" style="text-align:center;">$${totalOverallSum.toFixed(2)}</td>
          <td></td>`;
      footerHtml += "</tr>";
  
      tableFooter.html(footerHtml);
  
      // Update total refunds to collect
      document.getElementById(
          "showTotalOrders"
      ).innerHTML = `Total Refund To Collect - $${totalRefundToCollect.toFixed(2)}`;
  }
  
  
  $("#yardInfoTable").on("click", ".process-btn", function () {
  const id = $(this).data("id");
  // Save session data
  sessionStorage.setItem("lastVisitedPage", "collectRefund");
      sessionStorage.setItem("currentPage", currentPage);
      sessionStorage.setItem("selectedMonthYear", $("#monthYearPicker").val());
      sessionStorage.setItem("searchValue", $("#searchInput").val());
  window.location.href = `form.html?orderNo=${id}&process=true`;
  });
  
  function createPaginationControls(totalPages, orders = yardOrders) {
  const paginationControls = $('#pagination-controls');
  paginationControls.empty(); // Clear pagination controls
  
  if (totalPages > 1) {
  paginationControls.append(`<button class="previousNext" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`);
  
  for (let i = 1; i <= totalPages; i++) {
  paginationControls.append(`<button class="pageNos btn ${i === currentPage ? 'active-page' : ''} page-btn" data-page="${i}">${i}</button>`);}
  
  paginationControls.append(`<button class="previousNext" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`);
  }
  }
  
  
  // Event listener for pagination buttons
  $('#pagination-controls').on('click', '.page-btn', function () {
  const page = $(this).data('page');
  currentPage = page;
  renderTable(currentPage);
  createPaginationControls(Math.ceil(yardOrders.length / 25));
  });
  
  // "Previous" and "Next" button functionality
  $('#pagination-controls').on('click', '#prevPage', function () {
  if (currentPage > 1) {
  currentPage--;
  renderTable(currentPage);
  createPaginationControls(Math.ceil(yardOrders.length / 25));
  }
  });
  
  $('#pagination-controls').on('click', '#nextPage', function () {
  const totalPages = Math.ceil(yardOrders.length / 25);
  if (currentPage < totalPages) {
  currentPage++;
  renderTable(currentPage);
  createPaginationControls(totalPages);
  }
  });
  // Filter by month and year
  $("#filterButton").click(async function () {
  const monthYear = $("#monthYearPicker").val(); 
  const [year, monthNumber] = monthYear.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[parseInt(monthNumber, 10) - 1];
  await fetchYardInfo(month, year);
  currentPage = 1;
  renderTable(currentPage);
  createPaginationControls(Math.ceil(yardOrders.length / 25));
  });
  
  
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  
  if (firstName) {
  $("#user-name").text(firstName);
  }
  if (!firstName) {
  window.location.href = "login_signup.html";
  }
  
  const currentPath = window.location.pathname;
  $(".nav-link").each(function () {
  if (currentPath.includes($(this).attr("href"))) {
  $(this).addClass("active");
  }
  });
  
  $("#profileLink").click(function () {
  $("#profileFirstName").val(firstName);
  $("#profileLastName").val(lastName);
  $("#profileEmail").val(email);
  $("#profileRole").val(role);
  $("#profileModal").modal("show");
  });
  
  $("#backToOrders").click(function () {
  $("#profile-content").addClass("d-none");
  $("#purchases-content").removeClass("d-none");
  });
  
  $("#searchInput").on("keyup", function () {
  let value = $(this).val().toLowerCase();
  let totalPartPriceSum = 0;
  let totalShippingSum = 0;
  let totalOthersSum = 0;
  let totalOverallSum = 0;
  let totalRefundsSum = 0;
  
  $("#yardInfoTable tr").filter(function () {
  const isMatch = $(this).text().toLowerCase().indexOf(value) > -1;
  $(this).toggle(isMatch);
  
  if (isMatch) {
  const partPrice =
  parseFloat($(this).find("td").eq(-6).text().replace("$", "")) ||
  0;
  const shipping =
  parseFloat($(this).find("td").eq(-5).text().replace("$", "")) ||
  0;
  const others =
  parseFloat($(this).find("td").eq(-3).text().replace("$", "")) ||
  0;
  const refunds =
  parseFloat($(this).find("td").eq(-2).text().replace("$", "")) ||
  0;
  const overall =
  parseFloat($(this).find("td").eq(-1).text().replace("$", "")) ||
  0;
  
  totalPartPriceSum += partPrice;
  totalShippingSum += shipping;
  totalOthersSum += others;
  totalOverallSum += overall;
  totalRefundsSum += refunds;
  }
  });
  
  $("#totalPartPrice").text(`$${totalPartPriceSum.toFixed(2)}`);
  $("#totalShipping").text(`$${totalShippingSum.toFixed(2)}`);
  $("#others").text(`$${totalOthersSum.toFixed(2)}`);
  $("#overallSum").text(`$${totalOverallSum.toFixed(2)}`);
  $("#overallSum").text(`$${totalRefundsSum.toFixed(2)}`);
  });
  
  $(".toggle-sidebar").on("click", function () {
  $("#offcanvasSidebar").toggleClass("show");
  });
  
  $(".nav-link").on("click", function () {
  $(".nav-link").removeClass("active selected");
  $(this).addClass("selected");
  
  const contentMap = {
  "default-link": "#purchases-content",
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
    // // Theme toggle functionality
    // const themeToggle = document.getElementById("darkModeToggle");
    // themeToggle.addEventListener("click", () => {
    //   const currentTheme = document.documentElement.getAttribute("data-theme");
    //   const newTheme = currentTheme === "dark" ? "light" : "dark";
    //   document.documentElement.setAttribute("data-theme", newTheme);
    //   localStorage.setItem("theme", newTheme);
    // });
    // // Load the user's preferred theme
    // const savedTheme = localStorage.getItem("theme") || "light";
    // document.documentElement.setAttribute("data-theme", savedTheme);
  $("#logoutLink").on("click", function () {
  window.localStorage.clear();
  window.location.href = "login_signup.html";
  });
  const savedPage = localStorage.getItem('currentPage');
      currentPage = savedPage ? parseInt(savedPage) : 1;
      renderTable(currentPage);
      createPaginationControls(Math.ceil(yardOrders.length / rowsPerPage));
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
  $("#yardInfoTable").on("click", "tr", function () {
          // Remove selection from all rows
          $("#yardInfoTable tr").removeClass("selected");
  
          // Add selection to the clicked row
          $(this).addClass("selected");
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
    console.log("Row clicked:", $(this).text()); // Debugging
    $("#infoTable tr").removeClass("selected");
    $(this).addClass("selected");
  });
