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
// Pagination related variables
let allOrders = [];
const rowsPerPage = 25;
let currentPage = 1;

// Sorting Order Object
var team, role;
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

// function parseCustomDate(dateString) {
// const months = {
// Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05",
// Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10",
// Nov: "11", Dec: "12"
// };

// // Extract parts from the string (day, month, year, time)
// const parts = dateString.match(/(\d+)(?:st|nd|rd|th)\s(\w+),\s(\d+)\s(\d{2}):(\d{2})/);

// if (parts) {
// const day = parts[1].padStart(2, '0'); // Pad day with leading 0 if necessary
// const month = months[parts[2]];
// const year = parts[3];
// const hour = parts[4];
// const minute = parts[5];

// // Return a valid date string for comparison
// return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
// }

// return null;
// }
// Sort the table by the Order Date column
function sortTableByDate() {
const table = $("#infoTable");
const rows = table.find("tr").toArray(); 

rows.sort((a, b) => {
let dateA = parseCustomDate($(a).find("td").eq(0).text().trim()); 
let dateB = parseCustomDate($(b).find("td").eq(0).text().trim());
if (!dateA) return 1;
if (!dateB) return -1;
if (sortOrder.orderDate === "asc") {
return dateA - dateB;
} else {
return dateB - dateA;
}
});
$.each(rows, function (index, row) {
table.append(row);
});
sortOrder.orderDate = sortOrder.orderDate === "asc" ? "desc" : "asc";
updateSortIcons(0, sortOrder.orderDate);
}
$("th").eq(0).on("click", function () {
sortTableByDate();
});
function sortTable(column, type) {
const table = $("#infoTable");
const rows = table.find("tr").toArray();

rows.sort((a, b) => {
let valA = $(a).find("td").eq(column).text().trim();
let valB = $(b).find("td").eq(column).text().trim();
if (type === "number") {
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

// Toggle sort order
sortOrder[type] = sortOrder[type] === "asc" ? "desc" : "asc";

// Update the sort icon
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

// Event listeners for sorting
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

// Function to render rows based on the page
function renderTableRows(page, orders = allOrders) {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const ordersForPage = orders.slice(start, end);

  const tbody = $("#infoTable");
  tbody.empty(); // Clear old rows

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const suffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  ordersForPage.forEach((item) => {
    const date = new Date(item.orderDate);
    const formattedDate = `${date.getUTCDate()}${suffix(date.getUTCDate())} ${monthNames[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;

    const escalationStatus = item.additionalInfo?.[0]?.escTicked === "Yes" ? "Yes" : "";
    const escalationStyle = (item.orderStatus === "Order Fulfilled" && escalationStatus === "Yes") 
                            ? 'style="background-color: lightgreen;"' 
                            : "";

    const yardInfo = item.additionalInfo?.map((info, index) => `
      <b>Yard ${index + 1}</b>: ${info.yardName}<br>
      ${info.email} | ${info.phone}<br>
      Status: <b>${info.status}</b> | Stock No.: ${info.stockNo || ""}<br>
      Part price: $${info.partPrice} ${info.shippingDetails || ""} Others: $${info.others || 0}<br>
      ${info.paymentStatus || ""} Refunds: ${info.refundedAmount || 0}
    `).join("<br>") || "";

    const editButton = (team === "Team Mark" || team === "Team Sussane")
      ? ""
      : `<button class="btn btn-primary btn-sm edit-btn" data-id="${item.orderNo}">Edit</button>`;

    const processBtnDisabled = ["Placed", "Customer approved"].includes(item.orderStatus) ? "disabled" : "";

    const currentGP = calculateCurrentGP(item);

    const customerName = item.fName && item.lName 
      ? `${item.fName} ${item.lName}` 
      : item.customerName || "";

    const partRequired = item.pReq || item.partName;
    const programmingRequired = (item.programmingRequired === true || item.programmingRequired === "true")
      ? `Yes ($${item.programmingCostQuoted})` : "No";

    const rowHTML = `
      <tr>
        <td>${formattedDate}</td>
        <td>${item.orderNo}</td>
        <td>${item.salesAgent}</td>
        <td>
          Customer Name: ${customerName}<br>
          ${item.attention ? `<b>Attention</b>: ${item.attention}<br>` : ""}
          ${item.sAddress || ""} ${item.sAddressStreet || ""},<br>
          ${item.sAddressCity || ""}, ${item.sAddressState || ""},<br>
          ${item.sAddressZip || ""}, ${item.sAddressAcountry || ""}<br>
          Phone: ${item.phone} | Email: ${item.email}
        </td>
        <td>
          Part required: ${partRequired}<br>
          ${item.year} ${item.make} ${item.model}<br>
          Part Description: ${item.desc}<br>
          Part No: ${item.partNo}<br>
          VIN: ${item.vin}<br>
          Warranty: ${item.warranty} days<br>
          Programming required: ${programmingRequired}
        </td>
        <td>${yardInfo}</td>
        <td>${item.orderStatus}</td>
        <td>$${item.soldP}</td>
        <td>$${item.grossProfit}</td>
        <td>$${currentGP.toFixed(2)}</td>
        <td>$${item.actualGP ? item.actualGP.toFixed(2) : 0}</td>
        <td ${escalationStyle}>${escalationStatus}</td>
        <td>
          ${editButton}
          <button class="btn btn-sm process-btn" data-id="${item.orderNo}" ${processBtnDisabled}>View</button>
        </td>
      </tr>
    `;

    tbody.append(rowHTML);
  });
}
function calculateCurrentGP(item) {
  let totalYardSpent = 0;

  (item.additionalInfo || []).forEach(info => {
    const yardPP = parseFloat(info.partPrice) || 0;
    const shippingValue = (info.shippingDetails?.match(/:\s*(\d+(\.\d+)?)/) || [])[1] || 0;
    const others = parseFloat(info.others) || 0;
    const refunded = parseFloat(info.refundedAmount) || 0;
    const escReturn = parseFloat(info.custOwnShippingReturn) || 0;
    const escReplace = parseFloat(info.custOwnShipReplacement) || 0;
    const yardReplace = parseFloat(info.yardOwnShipping) || 0;

    const include = info.status !== "PO cancelled" || (info.status === "PO cancelled" && info.paymentStatus === "Card charged");
    if (include) {
      totalYardSpent += yardPP + parseFloat(shippingValue) + others + escReturn + escReplace + yardReplace - refunded;
    }
  });

  const spMinusTax = (parseFloat(item.soldP) || 0) - (parseFloat(item.salestax) || 0);
  const refund = parseFloat(item.custRefundedAmount) || 0;

  return spMinusTax - refund - totalYardSpent;
}

// <td>${sendInvoice}</td>
var firstname = localStorage.getItem("firstName");
if (firstName) {
$("#user-name").text(firstName);
}
if (!firstName) {
window.location.href = "login_signup.html";
}
// Function to create pagination controls
function createPaginationControls(totalPages) {
  const paginationControls = $('#pagination-controls');
  paginationControls.empty(); // Clear existing buttons

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
console.log("month",month,"year",year);
// //orders for the current month
// try {
// const ordersResponse = await axios.get(`https://www.spotops360.com/orders/monthly?month=${month}&year=${year}`, {
// headers: token ? { Authorization: `Bearer ${token}` } : {},
// });

// if (ordersResponse.status !== 200) {
// throw new Error("Failed to fetch current month's orders");
// }


// allOrders = ordersResponse.data.orders;
// const ordersWithMultipleAdditionalInfo = allOrders
//   .filter(order => order.additionalInfo && order.additionalInfo.length > 1)
//   .map(order => order.orderNo);
// // console.log("OrderNos with additionalInfo length > 1:", ordersWithMultipleAdditionalInfo);
// var totalOrders = allOrders.length;
// console.log("totalOrders",totalOrders)
// document.getElementById("showTotalOrders").innerHTML = `Total Orders This Month- ${totalOrders}`;
// sortedData = sortOrdersByOrderNoDesc(allOrders);
// renderTableRows(currentPage, allOrders);
// createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));
// } catch (error) {
// console.error("Error fetching current month's orders:", error);
// }

$("#searchInput").on("keyup", function () {
  const value = $(this).val().toLowerCase();
  const filteredOrders = allOrders.filter(order => {
    const basicSearch = (
      (order.soldP && String(order.soldP).toLowerCase().includes(value)) ||
      (order.grossProfit && String(order.grossProfit).toLowerCase().includes(value)) || 
      (order.actualGP && String(order.actualGP).toLowerCase().includes(value)) || 
      (order.orderDate && order.orderDate.toLowerCase().includes(value)) ||
      (order.salesAgent && order.salesAgent.toLowerCase().includes(value)) ||
      (order.bAddressStreet && order.bAddressStreet.toLowerCase().includes(value)) ||
      (order.bAddressCity && order.bAddressCity.toLowerCase().includes(value)) ||
      (order.bAddressState && order.bAddressState.toLowerCase().includes(value)) ||
      (order.bAddressZip && order.bAddressZip.toLowerCase().includes(value)) ||
      (order.bAddressAcountry && order.bAddressAcountry.toLowerCase().includes(value)) ||
      (order.sAddressStreet && order.sAddressStreet.toLowerCase().includes(value)) ||
      (order.sAddressState && order.sAddressState.toLowerCase().includes(value)) ||
      (order.sAddressZip && order.sAddressZip.toLowerCase().includes(value)) ||
      (order.sAddressAcountry && order.sAddressAcountry.toLowerCase().includes(value)) ||
      (order.attention && order.attention.toLowerCase().includes(value)) ||
      (order.orderNo && order.orderNo.toLowerCase().includes(value)) ||
      (order.customerName && order.customerName.toLowerCase().includes(value)) ||
      (order.fName && order.fName.toLowerCase().includes(value)) ||
      (order.lName && order.lName.toLowerCase().includes(value)) ||
      (order.bName && order.bName.toLowerCase().includes(value)) ||
      (order.bAddress && order.bAddress.toLowerCase().includes(value)) ||
      (order.sAddress && order.sAddress.toLowerCase().includes(value)) ||
      ((order.pReq || order.partName) && (order.pReq || order.partName).toLowerCase().includes(value)) ||
      (order.orderStatus && order.orderStatus.toLowerCase().includes(value)) ||
      (order.email && order.email.toLowerCase().includes(value)) ||
      (order.additionalInfo && order.additionalInfo.some(info =>
        (info.trackingNo && String(info.trackingNo).toLowerCase().includes(value))
      )) ||
      (order.phone && order.phone.toLowerCase().includes(value)) ||
      (order.make && order.make.toLowerCase().includes(value)) ||
      (order.year && order.year.toString().toLowerCase().includes(value)) ||
      (order.model && order.model.toLowerCase().includes(value))
    );

    const yardSearch = order.additionalInfo && order.additionalInfo.some((info, index) => {
      const yardLabel = `yard ${index + 1}`;
      return (
        yardLabel.includes(value) ||
        (info.yardName && info.yardName.toLowerCase().includes(value)) ||
        (info.phone && String(info.phone).toLowerCase().includes(value)) ||
        (info.email && info.email.toLowerCase().includes(value)) ||
        (info.escTicked && info.escTicked.toLowerCase().includes(value)) ||
        (info.status && info.status.toLowerCase().includes(value)) ||
        (info.shippingDetails && info.shippingDetails.toLowerCase().includes(value)) ||
        (info.stockNo && info.stockNo.toLowerCase().includes(value))
      );
    });

    return basicSearch || yardSearch;
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



// Sort orders by Order No in descending order
function sortOrdersByOrderNoDesc(orders) {
return orders.sort((a, b) => {
const orderNoA = parseInt(a.orderNo.replace(/\D/g, ""), 10);
const orderNoB = parseInt(b.orderNo.replace(/\D/g, ""), 10);
return orderNoB - orderNoA;
});
}
$("#infoTable").on("click", ".edit-btn", function () {
const id = $(this).data("id");
window.location.href = `form.html?orderNo=${id}`;
});

$("#infoTable").on("click", ".process-btn", function () {
const id = $(this).data("id");
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
// function to filter out data with month and year
$("#filterButton").click(async function () {
    const monthYear = $("#monthYearPicker").val();  // e.g., "2025-01"
    localStorage.setItem('selectedMonthYear', monthYear); 
    $("#loadingMessage").show(); 
    await fetchOrdersForSelectedMonth(monthYear);
    $("#loadingMessage").hide();
});

// On page load, check for previously selected month/year
    const savedMonthYear = localStorage.getItem('selectedMonthYear');
    if (savedMonthYear) {
    $("#monthYearPicker").val(savedMonthYear);
    await fetchOrdersForSelectedMonth(savedMonthYear); 
} else {
    const now = new Date();
    const month = now.toLocaleString("default", { month: "2-digit" });
    const year = now.getFullYear();
    const defaultMonthYear = `${year}-${month}`;
    $("#monthYearPicker").val(defaultMonthYear);
    await fetchOrdersForSelectedMonth(defaultMonthYear); 
}
    const savedPage = localStorage.getItem('currentPage');
    currentPage = savedPage ? parseInt(savedPage) : 1;
    renderTableRows(currentPage);
    createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));

async function fetchOrdersForSelectedMonth(monthYear) {
  const [year, month] = monthYear.split("-");
  $("#loadingMessage").show();

  const limit = 25;
  let allOrdersCombined = [];

  try {
    // Step 1: Fetch first page
    const firstResponse = await axios.get(`https://www.spotops360.com/orders/monthly`, {
      params: { month, year, page: 1, limit },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    allOrdersCombined.push(...firstResponse.data.orders);
    const totalCount = firstResponse.data.totalCount;
    const totalPages = Math.ceil(totalCount / limit);

    // Step 2: Fetch remaining pages in parallel
    const promises = [];
    for (let p = 2; p <= totalPages; p++) {
      promises.push(
        axios.get(`https://www.spotops360.com/orders/monthly`, {
          params: { month, year, page: p, limit },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
      );
    }

    const responses = await Promise.all(promises);
    responses.forEach(res => {
      allOrdersCombined.push(...res.data.orders);
    });
    const teamAgentsMap = {
  Shankar: ["Mark", "John"],
  Vinutha: ["Michael", "David"]
};
console.log("team",team)
if (team in teamAgentsMap) {
  allOrdersCombined = allOrdersCombined.filter(order =>
    teamAgentsMap[team].includes(order.salesAgent)
  );
}
    allOrders = allOrdersCombined;

    document.getElementById("showTotalOrders").innerHTML = `Total Orders This Month - ${totalCount}`;
    renderTableRows(1, allOrders);
    createPaginationControls(Math.ceil(allOrders.length / 25));
  } catch (error) {
    console.error("Error fetching orders:", error);
  }

  $("#loadingMessage").hide();
}


$("#logoutLink").click(function () {
window.localStorage.clear();
window.location.href = "login_signup.html";
});
// Clear localStorage when a sidebar menu item is clicked
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
$(document).on("click", "#infoTable tr", function () {
  console.log("Row clicked:", $(this).text()); // Debugging
  $("#infoTable tr").removeClass("selected");
  $(this).addClass("selected");
});
$("#infoTable tr").each(function () {
  const row = $(this);
  // console.log(row.text()); // Debugging: print out the content of each row
});

  $("#downloadCsv").on("click", async function () {
    let csvContent = "Order Date, Order No., Agent Name, Customer Info, Part Info, Yard, Order Status, Sale Price, Est GP, Current GP, Actual GP, Escalation Status\n";
  
    // Number of rows per page
    const rowsPerPage = 25;
    let currentPage = 1; // Track current page
    let totalPages = Math.ceil(allOrders.length / rowsPerPage); // Calculate the total pages

    // Function to collect rows for the current page
    async function collectPageRows(page) {
        // Render the table rows for the current page
        renderTableRows(page, allOrders); // Assuming renderTableRows handles rendering for the current page

        // Collect the rows for this page
        let pageRows = [];
        $("#infoTable tr").each(function () {
            const row = $(this);
            const rowData = [];
            row.find("td").each(function () {
                let cellText = $(this).text().trim();
                if (cellText.includes(",") || cellText.includes("\n")) {
                    // If the cell contains a comma or new line, wrap it in quotes
                    cellText = `"${cellText.replace(/"/g, '""')}"`;  
                }
                rowData.push(cellText);
            });
            if (rowData.length > 0) {
                pageRows.push(rowData.join(","));
            }
        });

        return pageRows;
    }

    // Loop through all pages and collect rows
    for (let page = 1; page <= totalPages; page++) {
        const pageRows = await collectPageRows(page); // Collect rows for the current page
        csvContent += pageRows.join("\n") + "\n"; // Add the collected rows to the CSV content
    }

    // Create a download link and trigger the download
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", "orders.csv");  // Set the filename
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    console.log("CSV download triggered!");
});
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
fetchNotifications();

});