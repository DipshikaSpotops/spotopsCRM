$(document).ready(async function () {
    $("#viewAlltasks").on("click", function () {
    window.location.href = "viewAllTasks.html";
  });
  // flatpickr setup
const fp = flatpickr("#unifiedDatePicker", {
  mode: "range",
  dateFormat: "Y-m-d",
  allowInput: true,
  onReady: function (selectedDates, dateStr, instance) {
    // Avoid duplication if calendar is reopened
    if (instance.calendarContainer.querySelector(".custom-shortcuts")) return;

    const container = document.createElement("div");
    container.className = "custom-shortcuts";
    container.style.display = "flex";
    container.style.justifyContent = "flex-end";
    container.style.gap = "10px";
    container.style.marginTop = "8px";
    container.style.paddingRight = "10px";

    const todayBtn = document.createElement("a");
    todayBtn.href = "#";
    todayBtn.innerText = "Today";
    todayBtn.style.fontSize = "13px";

    const thisMonthBtn = document.createElement("a");
    thisMonthBtn.href = "#";
    thisMonthBtn.innerText = "This Month";
    thisMonthBtn.style.fontSize = "13px";

    // TODAY handler
    todayBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const today = moment().tz("America/Chicago").format("YYYY-MM-DD");
      fp.setDate([today, today], true);
      $("#unifiedDatePicker").val(`${today} to ${today}`);
      $("#filterButton").data("filter", "today").click();
      instance.close();
    });

    // THIS MONTH handler
    thisMonthBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const start = moment().tz("America/Chicago").startOf("month").format("YYYY-MM-DD");
      const end = moment().tz("America/Chicago").endOf("month").format("YYYY-MM-DD");
      fp.setDate([start, end], true);
      $("#unifiedDatePicker").val(`${start} to ${end}`);
      $("#filterButton").click();
      instance.close();
    });

    container.appendChild(todayBtn);
    container.appendChild(thisMonthBtn);
    instance.calendarContainer.appendChild(container);
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
  // Extracting parts from the string (day, month, year, time)
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
  function sortTable(column, type) {
  console.log("type",type,column);    
  const table = $("#infoTable");
  const rows = table.find("tr").toArray();
  rows.sort((a, b) => {
  let valA = $(a).find("td").eq(column).text().trim();
  let valB = $(b).find("td").eq(column).text().trim();
  if (type === "orderdate▲") {
  console.log("orderdate▲");
  valA = parseCustomDate(valA); // Use the helper function to parse the date
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
  // Toggle sort order
  sortOrder[type] = sortOrder[type] === "asc" ? "desc" : "asc";
  // Updating the sort icon
  updateSortIcons(column, sortOrder[type]);
  }
  
  function updateSortIcons(columnIndex, order) {
  $("th .sort-icon").html("&#9650;"); // Resetting all icons to ascending
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
  // Team-based and role-based restrictions
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
  $(document).on("click", "#infoTable tr", function () {
  const isSelected = $(this).hasClass("selected");

  $("#infoTable tr").removeClass("selected");

  if (!isSelected) {
    $(this).addClass("selected");
  }
});
  // Highlight active link based on current URL
  var currentPath = window.location.pathname;
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
  const response = await axios.get(`https://www.spotops360.com/orders/placed?month=${month}&year=${year}`, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (response.status !== 200) {
  throw new Error("Failed to fetch orders");
  }
  
  var data = response.data;
  var allOrder = data;
const teamAgentsMap = {
  Shankar: ["David", "John"],
  Vinutha: ["Michael", "Mark"],
};
console.log("team",team)
if (team in teamAgentsMap) {
  allOrder = allOrder.filter(order =>
    teamAgentsMap[team].includes(order.salesAgent)
  );
}
  var totalOrders = allOrder.length;
  console.log("totalOrders",totalOrders)
  document.getElementById("showTotalOrders").innerHTML = `Placed Orders- ${totalOrders}`;
  allOrder = sortOrdersByOrderNoDesc(allOrder);
  
  renderOrders(allOrder);
  } catch (error) {
  console.error("Error fetching orders:", error);
  }
  
  $("#infoTable").on("click", ".approve-btn", async function () {
      const orderNoRow = $(this).data("id");
      currentOrderNo = orderNoRow;
      console.log("orderNo",currentOrderNo);
      $("#okButton").data("orderNo", currentOrderNo);
    $("body").append('<div class="modal-overlay"></div>');
    $("body").addClass("modal-active");
    // Show modal
    $("#myModal").modal("show");
  });
  // Add click handler for the OK button
  $("#okButton").off("click").on("click", async function () {
  const orderNo = $(this).data("orderNo"); 
  
  // Remove modal and blur
  $("#myModal").modal("hide");
  $(".modal-overlay").remove();
  $("body").removeClass("modal-active");
  
  // Log the order number
  console.log("Approving Order No:", orderNo);
  
  // Prepare update data
  const now = new Date();
  const options = {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  };
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(now);
  const formattedDate = `${parts[4].value}-${parts[0].value}-${parts[2].value} ${parts[6].value}:${parts[8].value}:${parts[10].value}`;
  const updatedData = {
  orderStatus: "Customer approved",
  firstName: firstName,
  customerApprovedDate: formattedDate,
  };
  
  // Make PUT request to update order status
  try {
  const response = await fetch(
  `https://www.spotops360.com/orders/${orderNo}?firstName=${firstName}`,
  {
  method: "PUT",
  headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(updatedData),
  }
  );
  
  if (!response.ok) {
  throw new Error("Network response was not ok");
  }
  
  const data = await response.json();
  
  // Remove row from table
  $(`#infoTable tr[data-id="${orderNo}"]`).remove();
  
  // Confirm update success
  console.log("Order status updated successfully:", data);
  } catch (error) {
  console.error("Error updating order status:", error);
  alert("An error occurred while updating the order status.");
  }
  });
  
  let orderId;
  $("#infoTable").on("click", ".cancel-btn", function () {
  orderId = $(this).data("id");
  console.log("id",orderId);
  $("#cancellingOrder").fadeIn();
  $("body").append('<div class="modal-overlay"></div>');
  $("body").addClass("modal-active");
  fetch(`https://www.spotops360.com/orders/${orderId}`)
  .then(response => response.json())
  .then(data => {
  orderPlacedDate = data.orderDate;
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
  const hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, '0');
  const daySuffix = (day) => {
  if (day > 3 && day < 21) return "th"; 
  switch (day % 10) {
  case 1: return "st";
  case 2: return "nd";
  case 3: return "rd";
  default: return "th";
  }
  
  };
  var currentDateTime= `${day}${daySuffix(day)} ${month}, ${year} ${hour}:${minute}`;
  console.log("dates",currentDateTime,orderPlacedDate)
  $(".orderedDate").val(orderPlacedDate);
  $("#cancelledDate").val(currentDateTime);
  // console.log("orderDate",orderPlacedDate)
  })
  .catch(error => console.error("Error fetching yard data:", error));
  });
  function renderOrders(item){
  $("#infoTable").empty();
  // console.log("rendering order",item);
  item.forEach(item => {
  var bAddress = item.bAddress || ""; // Default to an empty string if bAddress is undefined
  var sAddress = item.sAddress || ""; // Default to an empty string if sAddress is undefined
  
  // Split and format bAddress and sAddress only if they are non-empty
  const bParts = bAddress ? bAddress.split(',') : [];
  const firstLineB = bParts.length > 1 ? `${bParts[0].trim()}, ${bParts[1].trim()}` : "";
  const secondLineB = bParts.length > 4 ? `${bParts[2].trim()}, ${bParts[3].trim()}, ${bParts[4].trim()}` : "";
  const additionalLineB = bParts.length > 5 ? bParts.slice(5).map(part => part.trim()).join(', ') : "";
  const formattedBAddress = `${firstLineB}<br>${secondLineB}${additionalLineB ? `<br>${additionalLineB}` : ""}`;
  
  const sParts = sAddress ? sAddress.split(',') : [];
  const firstLineS = sParts.length > 1 ? `${sParts[0].trim()}, ${sParts[1].trim()}` : "";
  const secondLineS = sParts.length > 4 ? `${sParts[2].trim()}, ${sParts[3].trim()}, ${sParts[4].trim()}` : "";
  const formattedSAddress = `${firstLineS}<br>${secondLineS}<br>`;
  var expShip = item.expediteShipping;
  var dsCall = item.dsCall;
  // console.log("expediteShipping",expShip,"dsCall",dsCall);
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
  var formattedOrderDate = `${day}${suffix(day)} ${monthNames[date.getUTCMonth()]}, ${year}`;
  // Append data to the table with optional chaining and default values
  $("#infoTable").append(
  `<tr data-id="${item.orderNo}">
  <td>
  <button 
  class="btn btn-success btn-sm approve-btn" data-id="${item.orderNo}">
  Approve
  </button>
  <button 
  class="btn btn-danger btn-sm cancel-btn" data-id="${item.orderNo}">
  Cancel
  </button>
  </td>
  <td>${formattedOrderDate || ''}</td>
  <td>${item.orderNo || ''}</td>
  <td>${item.salesAgent || ''}</td>
  <td>
  Name: ${
  (item.fName && item.lName)
  ? `${item.fName} ${item.lName}`
  : (item.customerName || "")
  }<br>
  Email: ${item.email || ''}<br>
  Phone: ${item.phone || ''} | Alt Phone: ${item.altPhone || ''}<br>
  Billing Address:
  ${
  (item.bName ||  item.bAddressStreet || item.bAddressCity || item.bAddressState || item.bAddressZip || item.bAddressAcountry) 
  ? `<b>Billing Name</b>: ${item.bName || ""} <br>${item.bAddressStreet || ""},${item.bAddressCity || ""}, ${item.bAddressState || ""},${item.bAddressZip || ""}, ${item.bAddressAcountry || ""} `
  : `${formattedBAddress || ""}`
  }
  </td>
  <td>
      ${
  (item.sAddressStreet || item.sAddressCity || item.sAddressState || item.sAddressZip || item.sAddressAcountry) 
  ? `<b>Attention</b>:${item.attention}<br> ${item.sAddressStreet || ""},<br>${item.sAddressCity || ""}, ${item.sAddressState || ""},<br>${item.sAddressZip || ""}, ${item.sAddressAcountry || ""} `
  : `${formattedSAddress || ""}`
  }
  <td>Part Name: ${item.pReq || item.partName || ''}<br>
  <b>Quoted Price:</b> $${item.soldP || 0}<br>
  ${exp ? `<b>Expedite Shipping:</b> ${exp}<br>` : ''}
  ${ds ? `<b>DS Call:</b> ${ds}<br>` : ''}
  </td>
  </td>               
  <td>Year: ${item.year} | Make: ${item.make} | Model: ${item.model}</br>
  Part Description: ${item.desc}</br>
  Part No: ${item.partNo} | VIN: ${item.vin}</br>
  Warranty: ${item.warranty} days | ${item.programmingRequired === "true" ? `Programming required: ${item.programmingRequired}</br>` : ""}
  </td>
  <td>${item.orderStatus || ''}</td>
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
  console.log("filterButton found?", $("#filterButton").length);
// Filter button click event
$("#filterButton").click(async function () {
  $("body").append('<div class="modal-overlay"></div>');
  $("body").addClass("modal-active");
  $("#loadingMessage").show();

  try {
    let ordersResponse;
    const rangeValue = $("#unifiedDatePicker").val().trim();
    console.log("📅 Unified picker value:", rangeValue);

    let url = "";

    const isToday = $(this).data("filter") === "today";
    const tz = "America/Chicago";

    if (isToday) {
      const today = moment().tz(tz).format("YYYY-MM-DD");
      url = `https://www.spotops360.com/orders/placed?start=${today}&end=${today}`;
      console.log("🔘 Fetching today's orders");
    }

    else if (rangeValue.includes(" to ")) {
      // Flatpickr's default range format
      const [startStr, endStr] = rangeValue.split(" to ");
      const start = moment.tz(startStr, tz).startOf("day").toISOString();
      const end = moment.tz(endStr, tz).endOf("day").toISOString();

      url = `https://www.spotops360.com/orders/placed?start=${start}&end=${end}`;
      console.log("🗓️ Filtering orders from:", startStr, "to", endStr);
    }

    else if (moment(rangeValue, "YYYY-MM", true).isValid()) {
      // Optional: if you let users input YYYY-MM manually (fallback)
      const momentObj = moment(rangeValue, "YYYY-MM");
      const month = momentObj.format("MMM");
      const year = momentObj.format("YYYY");

      url = `https://www.spotops360.com/orders/placed?month=${month}&year=${year}`;
      console.log("📆 Filtering orders for month:", month, "year:", year);
    }

    else {
      alert("⚠️ Please select a valid date range or click 'Today'.");
      return;
    }

    const response = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    allOrders = response.data;

    const teamAgentsMap = {
      Shankar: ["David", "John"],
      Vinutha: ["Michael", "Mark"],
    };

    if (team in teamAgentsMap) {
      allOrders = allOrders.filter(order => teamAgentsMap[team].includes(order.salesAgent));
    }

    document.getElementById("showTotalOrders").innerHTML = `Placed Orders- ${allOrders.length}`;
    renderOrders(allOrders);
  } catch (error) {
    console.error("❌ Error fetching filtered orders:", error);
  } finally {
    $("#loadingMessage").hide();
    $(".modal-overlay").remove();
    $("body").removeClass("modal-active");
    $(this).data("filter", ""); // Reset state
  }
});



  $('#closeCancelled').on('click', function(e) {
  $("#cancellingOrder").fadeOut();
  $(".modal-overlay").remove();
  $("body").removeClass("modal-active");
  window.location.reload();
  });
  $('#closeApproved').on('click', function(e) {
  $("#myModal").modal("hide");
  $(".modal-overlay").remove();
  $("body").removeClass("modal-active");
  });
  function convertToISO(dateStr) {
  // Remove ordinal suffixes (st, nd, rd, th)
  const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/g, "$1");

  // Replace with format JavaScript Date can parse
  // Convert "28 May, 2025 14:26" to "May 28, 2025 14:26"
  const match = cleaned.match(/(\d{1,2}) (\w+), (\d{4}) (\d{1,2}:\d{2})/);
  if (!match) {
    console.error("❌ Unrecognized date format:", dateStr);
    return null;
  }

  const formatted = `${match[2]} ${match[1]}, ${match[3]} ${match[4]}`;
  const date = new Date(formatted);

  if (isNaN(date)) {
    console.error("Invalid date object:", formatted);
    return null;
  }

  return date.toISOString(); // Returns in "2025-05-28T14:26:00.000Z"
}

  $("#cancelledRefundSubmit").on("click", function () {
  $("#cancellingOrder").fadeOut();
 
  const userInput = $("#cancelledDate").val();
const cancelledDate = convertToISO(userInput);
if (cancelledDate) {
  console.log("ISO Date:", cancelledDate);
  // Now you can send `isoDate` to backend or insert it into your DB
}
  const cancelledRefAmount = $(".cancelledRefAmount").val();
  
  // const orderNo = urlParams.get("orderNo");
  const reason = $("#reasonCancel").val();
  
  console.log("Captured Data:");
  console.log("Cancelled Date:", cancelledDate);
  console.log("Cancelled Refund Amount:", cancelledRefAmount);
  console.log("Order No:", orderId);
  
  axios.put(`https://www.spotops360.com/orders/${orderId}/custRefund?firstName=${firstName}`, {
  cancelledDate: cancelledDate,
  cancelledRefAmount: cancelledRefAmount,
  orderNo: orderId,
  cancellationReason:reason,
  orderStatus: "Order Cancelled"
  })
  .then(function (response) {
  console.log("Refund information updated successfully:", response.data);
  $("#custRefunds").val(cancelledRefAmount);
  alert("Refund information for cancelled order updated successfully!");
  
  // Send cancellation email after successful refund update
  return axios.post(`/orders/sendCancelEmail/${orderId}?cancelledRefAmount=${cancelledRefAmount}`);
  })
  .then(function (response) {
  console.log("Cancellation email sent successfully:", response.data.message);
  alert("Cancellation email sent successfully!");
  $(".modal-overlay").remove();
  // $(".mainDiv").removeClass("blur");
  $("body").removeClass("modal-active");
  })
  .catch(function (error) {
  console.error("Error during operation:", error);
  
  if (error.response && error.response.status === 500) {
  alert("Server error occurred. Please try again.");
  } else {
  alert("An error occurred. Please try again.");
  }
  });
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
  fetchNotifications();
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
  $("#downloadCsv").on("click", function () {
    const table = $("#infoTable");
    let csvContent = "Order Date, Order No., Agent Name, Customer Info, Shipping Info, Sale Info, Part Info, Order Status\n";
    // Loop through each row of the table, excluding the Actions column
    table.find("tr").each(function () {
      const row = $(this);
      const rowData = [];
      row.find("td").each(function (index) {
        if (index !== 0) {
          let cellText = $(this).text().trim();
          if (cellText.includes(",") || cellText.includes("\n")) {
            // If the cell contains a comma or new line, wrap it in quotes
            cellText = `"${cellText.replace(/"/g, '""')}"`;  
          }
          rowData.push(cellText);
        }
      });
      csvContent += rowData.join(",") + "\n"; 
    });
    // download link and trigger the download
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", "placed_orders.csv");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    console.log("currentPath",currentPath);
    var h1Text = $("#mainHeading").text().trim();
  console.log(h1Text,"firstName",firstName); 
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