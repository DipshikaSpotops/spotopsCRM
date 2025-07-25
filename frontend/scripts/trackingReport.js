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
let filteredOrders = [];
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

function parseCustomDate(dateString) {
const months = {
Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05",
Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10",
Nov: "11", Dec: "12"
};

const parts = dateString.match(/(\d+)(?:st|nd|rd|th)\s(\w+),\s(\d+)\s(\d{2}):(\d{2})/);

if (parts) {
const day = parts[1].padStart(2, '0'); // Pad day with leading 0 if necessary
const month = months[parts[2]];
const year = parts[3];
const hour = parts[4];
const minute = parts[5];

return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
}

return null;
}
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

filteredOrders = orders.filter(order =>
  Array.isArray(order.additionalInfo) &&
  order.additionalInfo.some(info =>
    info.labelCreationDate && info.labelCreationDate.length > 0
  )
);
console.log("filtered",filteredOrders);
const ordersForPage = filteredOrders.slice(start, end);
$('#infoTable').empty(); // Clear the table
ordersForPage.forEach((item) => {
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
const formattedOrderDate = `${day}${suffix(day)} ${monthNames[date.getUTCMonth()]}, ${year}`;const orderNo = item.orderNo || "";

item.additionalInfo.forEach((info, index) => {
const trackingNo = info.trackingNo || "";
console.log("tracking",trackingNo,trackingNo.length)
const eta = info.eta || "";
const deliveredDate = info.deliveredDate || "";
const shippingType = info.shippingDetails || "";
let labelCreationD = "No Label Creation Date";
if (Array.isArray(info.labelCreationDate) && info.labelCreationDate.length > 0) {
labelCreationD = info.labelCreationDate[0];
// console.log("labelCreationD",labelCreationD)
var labelCreationDateOnly = labelCreationD.split(" ")[0] + " " + labelCreationD.split(" ")[1] + " " + labelCreationD.split(" ")[2];
console.log("labelCreationDateOnly",labelCreationDateOnly);
}
  const editButton = (team === "Team Mark" || team === "Team Sussane")
      ? ""
      : `<button class="btn edit-btn" data-id="${item.orderNo}">Edit</button>`;

    const processBtnDisabled = ["Placed", "Customer approved"].includes(item.orderStatus) ? "disabled" : "";
// Append the main row for `trackingNo`
if (trackingNo.length > 0) {
$("#infoTable").append(`
<tr>
<td>${formattedOrderDate}</td>
<td>${orderNo}</td>
<td>${trackingNo}</td>
<td>${labelCreationDateOnly || ""}</td>
<td>${shippingType}</td>
<td>${info.partShippedDate || ""}</td>
<td>${eta}</td>
<td>${deliveredDate}</td>
  <td>
          ${editButton}
          <button class="btn  process-btn" data-id="${item.orderNo}" ${processBtnDisabled}>View</button>
        </td>
</tr>
`);
}
// Additional rows for yardTrackingNumber
if (info.yardTrackingNumber) {
$("#infoTable").append(`
<tr>
<td>${formattedOrderDate}</td>
<td>${orderNo}</td>
<td>Replacement Tracking(Yard): ${info.yardTrackingNumber || ""}</td>
<td>${info.escRepYardTrackingDate || ""}</td>
<td>${info.yardShippingMethod || ""} ${info.yardOwnShipping}</td>
<td>${info.inTransitpartYardDate || ""}</td>
<td>${info.yardTrackingETA || ""}</td>
<td>${info.yardDeliveredDate || ""}</td>
  <td>
          ${editButton}
          <button class="btn  process-btn" data-id="${item.orderNo}" ${processBtnDisabled}>View</button>
        </td>
</tr>
`);
}

// Additional rows for customerTrackingNumberReplacement
if (info.customerTrackingNumberReplacement) {
$("#infoTable").append(`
<tr>
<td>${formattedOrderDate}</td>
<td>${orderNo}</td>
<td>Replacement Tracking(Cust): ${info.customerTrackingNumberReplacement}</td>
<td>${info.escRepCustTrackingDate || ""}</td>
<td>${info.customerShippingMethodReplacement || ""} ${info.custOwnShipReplacement || ""}</td>
<td>${info.inTransitpartCustDate || ""}</td>
<td>${info.customerETAReplacement || ""}</td>
<td>${info.repPartCustDeliveredDate || ""}</td>
  <td>
          ${editButton}
          <button class="btn  process-btn" data-id="${item.orderNo}" ${processBtnDisabled}>View</button>
        </td>
</tr>
`);
}

// Additional rows for returnTrackingCust
if (info.returnTrackingCust) {
$("#infoTable").append(`
<tr>
<td>${formattedOrderDate}</td>
<td>${orderNo}</td>
<td>Return Tracking: ${info.returnTrackingCust || ""}</td>
<td>${info.escRetTrackingDate || ""}</td>
<td>${info.customerShippingMethodReturn || ""} ${info.custOwnShippingReturn || ""}</td>
<td>${info.inTransitReturnDate || ""}</td>
<td>${info.custretPartETA || ""}</td>
<td>${info.returnDeliveredDate || ""}</td>
  <td>
          ${editButton}
          <button class="btn  process-btn" data-id="${item.orderNo}" ${processBtnDisabled}>View</button>
        </td>
</tr>
`);
}

// Rows for other arrays in additionalInfo
const arraysToRender = {
trackingHistory: "Tracking No",
etaHistory: "ETA",
shipperNameHistory: "Shipper Name",
trackingLinkHistory: "Tracking Link",
labelCreationDate: "Label Creation"
};
Object.entries(arraysToRender).forEach(([arrayKey, label]) => {
const array = info[arrayKey];

// Append only if `trackingHistory` array length > 0
if (arrayKey === "trackingHistory" && Array.isArray(array) && array.length > 0) {
array.forEach((value, idx) => {
const displayValue =
arrayKey === "trackingLinkHistory"
? `<a href="${value}" target="_blank">${value}</a>`
: value;

const estimatedDelivery =
arrayKey === "trackingHistory" && info.etaHistory && info.etaHistory[idx]
? info.etaHistory[idx]
: "N/A";
const labelCreationDateWithoutFirst =
info.labelCreationDate && info.labelCreationDate.length > 1
? info.labelCreationDate.slice(1) // New array excluding the first element
: [];
console.log("===",labelCreationDateWithoutFirst)
const labelCreationDateVoids =
arrayKey === "trackingHistory" &&
labelCreationDateWithoutFirst[idx] // Adjust index to match the new array
? labelCreationDateWithoutFirst[idx]
: "N/A";

$("#infoTable").append(`
<tr>
<td>${formattedOrderDate}</td>
<td>${orderNo}</td>
<td>${label}: ${displayValue}</td>
<td>${labelCreationDateVoids}</td>
<td></td>
<td></td> <!-- Empty for Label/History Details -->
<td style="color: red;">VOIDED</td>
<td></td> <!-- Est Delivery column -->
</tr>
`);
});
}
});

// for esc rep yard
const arraysToRenderRepYard = {
escRepTrackingHistoryYard: "Replacement Tracking No(Yard)",
escRepETAHistoryYard: "Replacement ETA(Yard)",
escRepShipperNameHistoryYard: "Replacement Shipper Name(Yard)",
escrepBOLhistoryYard: "Label Creation Rep(Yard)"
}

Object.entries(arraysToRenderRepYard).forEach(([arrayKey, label]) => {
const array = info[arrayKey];

// Append only if `trackingHistory` array length > 0
if (arrayKey === "escRepTrackingHistoryYard" && Array.isArray(array) && array.length > 0) {
array.forEach((value, idx) => {
const displayValueYard =
arrayKey === "escRepTrackingHistoryYard"
? `${value}`
: value;
const estimatedDeliveryYard =
arrayKey === "escRepTrackingHistoryYard" && info.escRepETAHistoryYard && info.escRepETAHistoryYard[idx]
? info.escRepETAHistoryYard[idx]
: "N/A";
const bolDoeYard =
arrayKey === "escRepTrackingHistoryYard" && info.escrepBOLhistoryYard && info.escrepBOLhistoryYard[idx]
? info.escrepBOLhistoryYard[idx]
: "N/A";
const etaYard =
arrayKey === "escRepTrackingHistoryYard" && info.escRepETAHistoryYard && info.escRepETAHistoryYard[idx]
? info.escRepETAHistoryYard[idx]
: "N/A";
$("#infoTable").append(`
<tr>
<td>${formattedOrderDate}</td>
<td>${orderNo}</td>
<td>${label}: ${displayValueYard}</td>
<td>${bolDoeYard}</td>
<td></td>
<td></td>
<td style="color: red;">VOIDED</td>
<td></td> 
</tr>
`);
});
}
});
// for esc rep cust
const arraysToRenderRepCust = {
escRepTrackingHistoryCust: "Replacement Tracking No(Cust)",
escRepETAHistoryCust: "Rep ETA(Cust)",
escRepShipperNameHistoryCust: "Rep Shipper Name(Cust)",
escrepBOLhistoryCust: "Label Creation Rep(Cust)",
};
Object.entries(arraysToRenderRepCust).forEach(([arrayKey, label]) => {
const array = info[arrayKey];
// Append only if `trackingHistory` array length > 0
if (arrayKey === "escRepTrackingHistoryCust" && Array.isArray(array) && array.length > 0) {
array.forEach((value, idx) => {
const displayValueCust =
arrayKey === "escRepTrackingHistoryCust"
? `${value}`
: value;
const estimatedDeliveryCust =
arrayKey === "escRepTrackingHistoryCust" && info.escRepETAHistoryCust && info.escRepETAHistoryCust[idx]
? info.escRepETAHistoryCust[idx]
: "N/A";
const bolDoeCust =
arrayKey === "escRepTrackingHistoryCust" && info.escrepBOLhistoryCust && info.escrepBOLhistoryCust[idx]
? info.escrepBOLhistoryCust[idx]
: "N/A";
const etaCust =
arrayKey === "escRepTrackingHistoryCust" && info.escRepETAHistoryCust && info.escRepETAHistoryCust[idx]
? info.escRepETAHistoryCust[idx]
: "N/A";
$("#infoTable").append(`
<tr>
<td>${formattedOrderDate}</td>
<td>${orderNo}</td>
<td>${label}: ${displayValueCust}</td>
<td>${bolDoeCust}</td>
<td></td>
<td></td>
<td style="color: red;">VOIDED</td>
<td></td> 
</tr>
`);
});
}
});
// for esc rep yard
const arraysToRenderReturn = {
escReturnTrackingHistory: "Return Tracking No",
escReturnETAHistory: "Return ETA",
escReturnShipperNameHistory: "Return Shipper Name",
escReturnBOLhistory: "Label Creation Return",
};

Object.entries(arraysToRenderReturn).forEach(([arrayKey, label]) => {
const array = info[arrayKey];

// Append only if `trackingHistory` array length > 0
if (arrayKey === "escReturnTrackingHistory" && Array.isArray(array) && array.length > 0) {
array.forEach((value, idx) => {
const displayValueReturn =
arrayKey === "escReturnTrackingHistory"
? `${value}`
: value;
const estimatedDeliveryReturn =
arrayKey === "escReturnTrackingHistory" && info.escReturnETAHistory && info.escReturnETAHistory[idx]
? info.escRepETAHistoryCust[idx]
: "N/A";
const bolDoeReturn =
arrayKey === "escReturnTrackingHistory" && info.escReturnBOLhistory && info.escrepBOLhistoryCust[idx]
? info.escrepBOLhistoryCust[idx]
: "N/A";
const etaReturn =
arrayKey === "escReturnTrackingHistory" && info.escReturnETAHistory && info.escReturnETAHistory[idx]
? info.escReturnETAHistory[idx]
: "N/A";
$("#infoTable").append(`
<tr>
<td>${formattedOrderDate}</td>
<td>${orderNo}</td>
<td>${label}: ${displayValueReturn}</td>
<td>${bolDoeReturn}</td>
<td></td>
<td></td>
<td style="color: red;">VOIDED</td>
<td></td> 
</tr>
`);
});
}
});
});
});
}

// <td>${sendInvoice}</td>
var firstname = localStorage.getItem("firstName");
if (firstName) {
$("#user-name").text(firstName);
}
if (!firstName) {
window.location.href = "login_signup.html";
}
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
//orders for the current month
try {
const limit = 25;
const allFetchedOrders = [];
let page = 1;
let totalPages = 1;

try {
  const firstPageResponse = await axios.get(`https://www.spotops360.com/orders/monthly`, {
    params: { month, year, page, limit },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const totalCount = firstPageResponse.data.totalCount || 0;
  totalPages = Math.ceil(totalCount / limit);
  allFetchedOrders.push(...firstPageResponse.data.orders);

  // Fetch remaining pages
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
    allFetchedOrders.push(...res.data.orders);
  });

  allOrders = allFetchedOrders;
  console.log("Total orders fetched:", allOrders.length);
} catch (error) {
  console.error("Error fetching paginated orders:", error);
}

sortedData = sortOrdersByOrderNoDesc(allOrders);
renderTableRows(currentPage);
createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));
} catch (error) {
console.error("Error fetching current month's orders:", error);
}

$("#searchInput").on("keyup", function () {
const value = $(this).val().toLowerCase();
const filteredOrders1 = filteredOrders.filter(order => {
const basicSearch = (
(order.orderDate && order.orderDate.toLowerCase().includes(value)) ||
(order.orderNo && order.orderNo.toLowerCase().includes(value)) ||
(order.salesAgent && order.salesAgent.toLowerCase().includes(value)) ||
(order.customerName && order.customerName.toLowerCase().includes(value)) ||
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

// Check if any yard detail (including stockNo) matches the search term
const yardSearch = order.additionalInfo && order.additionalInfo.some((info, index) => {
const yardLabel = `yard ${index + 1}`; // e.g., "Yard 1", "Yard 2"
return (
yardLabel.includes(value) || 
(info.yardName && info.yardName.toLowerCase().includes(value)) || 
(info.escTicked && info.escTicked.toLowerCase().includes(value)) || 
(info.status && info.status.toLowerCase().includes(value)) ||
(info.stockNo && info.stockNo.toLowerCase().includes(value)) // Added stockNo
);
});

// Return true if any of the basic fields or yard details match the search term
return basicSearch || yardSearch;
});

// If a search is active, display the filtered results, otherwise reset to the full dataset
if (filteredOrders1.length > 0 || value === "") {
renderTableRows(1, filteredOrders1); // Render the first page of filtered results
createPaginationControls(Math.ceil(filteredOrders1.length / rowsPerPage), filteredOrders1);
} else {
$("#infoTable").empty(); // Clear the table if no results are found
$("#infoTable").append(`<tr><td colspan="11">No matching results found</td></tr>`);
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

// $("#infoTable").on("click", ".process-btn", function () {
// const id = $(this).data("id");
// window.location.href = `form.html?orderNo=${id}&process=true`;
// });
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
  $("body").append('<div class="modal-overlay"></div>');
  $("body").addClass("modal-active");    
  $("#loadingMessage").show();

  const monthYear = $("#monthYearPicker").val(); 
  const [year, monthNumber] = monthYear.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[parseInt(monthNumber, 10) - 1];
  const limit = 25;

  try {
    const allFetchedOrders = [];

    // Fetch page 1
    const firstPageResponse = await axios.get(`https://www.spotops360.com/orders/monthly`, {
      params: { month, year, page: 1, limit },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const totalCount = firstPageResponse.data.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);
    allFetchedOrders.push(...firstPageResponse.data.orders);

    console.log(`📦 Page 1 fetched: ${firstPageResponse.data.orders.length}`);
    console.log(`📈 Total expected: ${totalCount}, pages: ${totalPages}`);

    // Fetch remaining pages
    const pagePromises = [];
    for (let p = 2; p <= totalPages; p++) {
      pagePromises.push(
        axios.get(`https://www.spotops360.com/orders/monthly`, {
          params: { month, year, page: p, limit },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
      );
    }

    const responses = await Promise.all(pagePromises);
    responses.forEach((res, index) => {
      console.log(`Page ${index + 2} fetched: ${res.data.orders.length}`);
      allFetchedOrders.push(...res.data.orders);
    });

    allOrders = allFetchedOrders;
    currentPage = 1;

    console.log("Total filtered orders:", allOrders.length);

    renderTableRows(currentPage);
    createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));
  } catch (error) {
    console.error("Error fetching filtered orders:", error);
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
  console.log(row.text()); // Debugging: print out the content of each row
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

  // Highlight the active arrow
  const arrowToActivate = sortAsc ? ".asc" : ".desc";
  $(this).find(arrowToActivate).addClass("active");
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
});