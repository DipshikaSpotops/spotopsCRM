$("#viewAlltasks").on("click", function () {
  window.location.href = "viewAllTasks.html";
});
// to prefill the stae and the city 
$("#bZip").on("keyup", function() {
console.log("BZIP","==");
const zipCode = $(this).val();
if (zipCode.length === 5) {
if (zipCode) {
axios.get(`https://api.zippopotam.us/us/${zipCode}`)
.then(response => {
const data = response.data;
const city = data.places[0]['place name'];
const stateAbbr = data.places[0]['state abbreviation'];
const country = data['country abbreviation'];
console.log("country",country,stateAbbr);
$("#bCity").val(city);
$("#bState").val(stateAbbr);
$("#bCountry").val(country); 
})
.catch(error => {
console.error("Error fetching location data:", error);
alert("Invalid ZIP code. Please check and try again.");
});
}}else if (zipCode.length >= 3 && zipCode.includes(" ")) {
var canadaZip = zipCode.slice(0, 3); 
console.log("canadaZIP",canadaZip);
axios.get(`https://api.zippopotam.us/CA/${canadaZip}`)
.then(response => {
const data = response.data;
const stateAbbr = data.places[0]['state abbreviation'];
const country = data['country'];
$("#bState").val(stateAbbr);
$("#bCountry").val(country);
})
.catch(error => {
console.error("Error fetching location data:", error);
alert("Invalid ZIP code. Please check and try again.");
});
}
});
$("#sZip").on("keyup", function() {
console.log("BZIP","==");
const zipCode = $(this).val();
if (zipCode.length === 5) {
if (zipCode) {
axios.get(`https://api.zippopotam.us/us/${zipCode}`)
.then(response => {
const sdata = response.data;
const scity = sdata.places[0]['place name'];
const sstateAbbr = sdata.places[0]['state abbreviation'];
const scountry = sdata['country abbreviation'];
console.log(scountry);
$("#sCity").val(scity);
$("#sState").val(sstateAbbr);
$("#sCountry").val(scountry); 
})
.catch(error => {
console.error("Error fetching location data:", error);
alert("Invalid ZIP code. Please check and try again.");
});
}}else if (zipCode.length >= 3 && zipCode.includes(" ")) {
var canadaZip = zipCode.slice(0, 3); 
console.log("canadaZIP",canadaZip);
axios.get(`https://api.zippopotam.us/CA/${canadaZip}`)
.then(response => {
const data = response.data;
const stateAbbr = data.places[0]['state abbreviation'];
const country = data['country'];
$("#sState").val(stateAbbr);
$("#sCountry").val(country);
})
.catch(error => {
console.error("Error fetching location data:", error);
alert("Invalid ZIP code. Please check and try again.");
});
}
});
// Get the current time and the login timestamp
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
const firstName = localStorage.getItem("firstName");
const lastName = localStorage.getItem("lastName");
const email = localStorage.getItem("email");
const role = localStorage.getItem("role");
const team = localStorage.getItem("team");
// var newOrderNo;



if (firstName) {
$("#user-name").text(firstName);
$("#salesAgent").val(firstName);
}
console.log("firstName",firstName);
if (firstName === "John") {
console.log("first",firstName);
$("#submenu-dashboards .view-All-orders-link").show();
} else{
$("#submenu-dashboards .view-All-orders-link").hide();
}
// Get the current date in America/Chicago time
const now = new Date();

// Options to adjust to Dallas time (America/Chicago)
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

// Format the date to match 'YYYY-MM-DDTHH:mm:ss.sssZ'
const formatter = new Intl.DateTimeFormat('en-US', options);
const formattedParts = formatter.formatToParts(now);

// Extract and combine the parts to form ISO-style date
const year = formattedParts.find((part) => part.type === 'year').value;
const month = formattedParts.find((part) => part.type === 'month').value.padStart(2, '0');
const day = formattedParts.find((part) => part.type === 'day').value.padStart(2, '0');
const hour = formattedParts.find((part) => part.type === 'hour').value.padStart(2, '0');
const minute = formattedParts.find((part) => part.type === 'minute').value.padStart(2, '0');
const second = formattedParts.find((part) => part.type === 'second').value.padStart(2, '0');

// Construct ISO string without timezone offset
const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}.000-06:00`;

console.log("ISO String in Dallas Time (America/Chicago):", isoString);

// var orderDateAdd= `${day}${daySuffix(day)} ${month}, ${year}`;
console.log("orderDate",isoString);

const today = new Date().toISOString().split("T")[0];
$("#orderDate").val(isoString);

const token = localStorage.getItem("token");

function calculateProfit() {
  const quoted = parseFloat($("#soldP").val()) || 0;
  const yardPrice = parseFloat($("#costP").val()) || 0;
  const shipping = parseFloat($("#shippingFee").val()) || 0;
  const salesTax = 0.05 * quoted;
  console.log("quoted",quoted,yardPrice,shipping,salesTax)
  const grossProfit = quoted - yardPrice - shipping - salesTax;
  $("#salestax").val(salesTax.toFixed(2));
  $("#grossProfit").val(grossProfit.toFixed(2));
}

$("#soldP, #costP, #shippingFee").on("input", calculateProfit);
// Function to extract the highest order number from a collection
function getHighestOrderNo(orderArr, existingOrderNo) {
if (orderArr.length === 0) return existingOrderNo;
const lastElement = orderArr[orderArr.length - 1];
const lastOrderNo = lastElement.orderNo;
const numberPart = parseInt(lastOrderNo.slice(7), 10);
return numberPart;
}

var spMinusTax;
  // On form submission
  function updateOrderHistory(orderHistory) {
const orderHistoryList = $("#orderHistoryList");
orderHistoryList.empty();
orderHistory.forEach((historyItem) => {
const [heading, ...details] = historyItem.split(" by ");
const listItem = `
<li class="timeline-item">
<div class="timeline-panel">
<div class="timeline-heading">${heading}</div>
<div class="timeline-body">
<p>${details.join(" by ")}</p>
</div>
</div>
</li>`;
orderHistoryList.append(listItem);
});
}
const urlParams = new URLSearchParams(window.location.search);
var orderNo = urlParams.get("orderNo");
if (orderNo) {
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
  $("#programmingCostQuoted").val(data.programmingCostQuoted || "");
if (data.programmingRequired === "true") {
  $("#programmingCostQuoted").show();
}
// document.getElementById("estPP").textContent += data.costP;
var customerNameE = data.customerName;
const nameParts = (customerNameE || "").split(" ").filter(part => part.trim() !== "");
const firstNameE = nameParts[0] || ""; // Default to empty string if no first name
const lastNameE = nameParts[1] || "";  // Default to empty string if no last name
var notes = data.notes;
var notes1 = notes.toString();
var resultNotes = notes1.split('</br>')[0];
var onlyNotes = resultNotes.trim();
$("#firstName").val(data.fName || firstNameE);
$("#lastName").val(data.lName || lastNameE);
$("#orderNo").val(data.orderNo);
$("#orderDate").val(data.orderDate);
$("#salesAgent").val(data.salesAgent);
$("#bAddress").val(data.bAddressStreet);
$("#bCity").val(data.bAddressCity);
$("#bState").val(data.bAddressState);
$("#bZip").val(data.bAddressZip);
$("#bCountry").val(data.bAddressAcountry);
// $("#bAddress").val(data.bAddressStreet);
$("#bAttention").val(data.bName);
$("#sAddress").val(data.sAddressStreet);
$("#sCity").val(data.sAddressCity);
$("#sState").val(data.sAddressState);
$("#sZip").val(data.sAddressZip);
$("#sCountry").val(data.sAddressAcountry);
// $("#bAddress").val(data.bAddress);
// $("#firstName").val(firstNameE);
// $("#lastname").val(lastNameE);
// $("#sAddress").val(data.sAddress);
$("#sAttention").val(data.attention);
$("#email").val(data.email);
$("#phone").val(data.phone);
$("#altPhone").val(data.altPhone);
$("#make").val(data.make);
$("#model").val(data.model);
$("#year").val(data.year);
$("#pReq").val(data.pReq);
$("#desc").val(data.desc);
$("#warranty").val(data.warranty);
$("#soldP").val(data.soldP);
$("#costP").val(data.costP);
$("#shippingFee").val(data.shippingFee);
$("#salestax").val(data.salestax);
$("#grossProfit").val(data.grossProfit);
$("#orderStatus").val(data.orderStatus);
$("#vin").val(data.vin);
$("#partNo").val(data.partNo);
$("#issueOrder").val(data.last4digits);
$("#notes").val(`${onlyNotes}`);
$("#sBusinessName").val(data.businessName);
$("#dsCallCheckbox").prop("checked", data.dsCall === "true");
$("#expeditorNot").prop("checked", data.expediteShipping === "true");
$("#programmingRequiredCheckbox").prop("checked", data.programmingRequired === "true");
$("#programmingCostQuoted").val(data.programmingCostQuoted),
// data.additionalInfo.forEach((info, index) => {
// addYardButton(index + 1, `Yard ${index + 1}`);
// });
// if (data.trackingInfo) {
// $("#trackingInfoContainer").html(data.trackingInfo);
// }
updateOrderHistory(data.orderHistory);
partDesc = `
Year: ${data.year}
Make: ${data.make}
Model: ${data.model}
Part required: ${data.pReq}
Desc: ${data.desc}
VIN: ${data.vin}
Warranty: ${data.warranty}`;
});


$(".nav-link").on("click", function () {
const submenu = $(this).next(".submenu");
if (submenu.length) {
submenu.slideToggle();
$(this)
.find(".chevron-icon i")
.toggleClass("fa-chevron-right fa-chevron-down");
}
});


}

else {
console.log("Order not found");
}

$("#newOrderForm").on("submit", function (e) {
        e.preventDefault();

        const firstName = localStorage.getItem("firstName");
        const cusFName = $("#firstName").val();
        const cusLName = $("#lastName").val();
        const customerName = `${cusFName} ${cusLName}`;
        const orderNoInput = $("#orderNo").val();
const newEntry = urlParams.get("newEntry");
        if (newEntry || !orderNo) {
            // Create a new order
            const newOrderData = {
                orderNo: orderNoInput,
                orderDate: $("#orderDate").val(),
                salesAgent: $("#salesAgent").val(),
                // customerName: customerName,
                fName: $("#firstName").val(),
                lName: $("#lastName").val(),
                bAddressStreet: $("#bAddress").val(),
                bAddressCity: $("#bCity").val(),
                bAddressState: $("#bState").val(),
                bAddressZip: $("#bZip").val(),
                bAddressAcountry: $("#bCountry").val(),
                bName: $("#bAttention").val(),
                sAddressStreet: $("#sAddress").val(),
                sAddressCity: $("#sCity").val(),
                sAddressState: $("#sState").val(),
                sAddressZip: $("#sZip").val(),
                sAddressAcountry: $("#sCountry").val(),
                attention: $("#sAttention").val(),
                email: $("#email").val(),
                phone: $("#phone").val(),
                altPhone: $("#altPhone").val(),
                make: $("#make").val(),
                model: $("#model").val(),
                year: $("#year").val(),
                pReq: $("#pReq").val(),
                desc: $("#desc").val(),
                warranty: $("#warranty").val(),
                soldP: $("#soldP").val(),
                costP: $("#costP").val(),
                shippingFee: $("#shippingFee").val(),
                salestax: $("#salestax").val(),
                grossProfit: $("#grossProfit").val(),
                orderStatus: "Placed",
                vin: $("#vin").val(),
                partNo: $("#partNo").val(),
                last4digits: $("#issueOrder").val(),
                notes: $("#notes").val(),
                dsCall: $("#dsCallCheckbox").prop("checked") ? true : false,
                expediteShipping: $("#expeditorNot").prop("checked") ? true : false,
                businessName: $("#sBusinessName").val(),
                programmingRequired: $("#programmingRequiredCheckbox").prop("checked") ? true : false, 
                programmingCostQuoted: $("#programmingCostQuoted").val(),
            };

            fetch(`https://www.spotops360.com/orders?firstName=${firstName}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newOrderData),
            })
                .then((response) => {
                    alert(`Order ${orderNoInput} has been successfully created.`);
                    window.location.reload();
                })
                .catch((error) => {
                    console.error("Error saving new order:", error);
                    alert("An error occurred while saving the order. Please try again.");
                });
        } else {
          fetch(`https://www.spotops360.com/orders/${orderNo}`)
      .then(res => res.json())
      .then(existingData => {
        const loggedInUser = localStorage.getItem("firstName");
        const updatedOrderData = {
          // your usual form data here...
          orderNo: orderNoInput,
          orderDate: $("#orderDate").val(),
          salesAgent: $("#salesAgent").val(),
          customerName: customerName,
          bAddressStreet: $("#bAddress").val(),
          bAddressCity: $("#bCity").val(),
          bAddressState: $("#bState").val(),
          bAddressZip: $("#bZip").val(),
          bAddressAcountry: $("#bCountry").val(),
          bName: $("#bAttention").val(),
          sAddressStreet: $("#sAddress").val(),
          sAddressCity: $("#sCity").val(),
          sAddressState: $("#sState").val(),
          sAddressZip: $("#sZip").val(),
          sAddressAcountry: $("#sCountry").val(),
          attention: $("#sAttention").val(),
          email: $("#email").val(),
          phone: $("#phone").val(),
          altPhone: $("#altPhone").val(),
          make: $("#make").val(),
          model: $("#model").val(),
          year: $("#year").val(),
          pReq: $("#pReq").val(),
          desc: $("#desc").val(),
          warranty: $("#warranty").val(),
          soldP: $("#soldP").val(),
          costP: $("#costP").val(),
          shippingFee: $("#shippingFee").val(),
          salestax: $("#salestax").val(),
          grossProfit: $("#grossProfit").val(),
          orderStatus: $("#orderStatus").val(),
          vin: $("#vin").val(),
          partNo: $("#partNo").val(),
          last4digits: $("#issueOrder").val(),
          notes: $("#notes").val(),
          dsCall: $("#dsCallCheckbox").prop("checked"),
          expediteShipping: $("#expeditorNot").prop("checked"),
          businessName: $("#sBusinessName").val(),
          programmingRequired: $("#programmingRequiredCheckbox").prop("checked"),
          programmingCostQuoted: $("#programmingCostQuoted").val()
        };

        const orderHistory = [];

        for (let key in updatedOrderData) {
          const oldVal = existingData[key] ?? "";
          const newVal = updatedOrderData[key] ?? "";
          if (oldVal.toString() !== newVal.toString()) {
            const readableKey = key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
            orderHistory.push(`${readableKey} changed from "${oldVal}" to "${newVal}" by ${loggedInUser}`);
          }
        }

        updatedOrderData.orderHistory = [...(existingData.orderHistory || []), ...orderHistory];

        // Step 2: Now PUT with updatedOrderData + orderHistory
        return fetch(`https://www.spotops360.com/orders/${orderNo}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedOrderData)
        });
      })
      .then(res => {
        if (!res.ok) throw new Error("Update failed");
        return res.json();
      })
      .then(() => {
        alert(`Order ${orderNoInput} updated successfully with history.`);
        window.location.reload();
      })
      .catch(err => {
        console.error("Error while updating order with history:", err);
        alert("An error occurred during update.");
      });
        }
    });

  function getFormattedOrderDate() {
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

    return `${day}${daySuffix(day)} ${month}, ${year} ${hour}:${minute}`;
  }

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
function fetchSalesData() {
const token = localStorage.getItem("token");
const currentMonth = new Date().getMonth(); // Get current month
const currentYear = new Date().getFullYear(); // Get current year

axios
.get(`https://www.spotops360.com/orders`, {
headers: { Authorization: `Bearer ${token}` },
})
.then((response) => {
const data = response.data.filter((order) => order.salesAgent === firstName);
let validOrders = [];
updateOrdersUI(validOrders);
})
.catch((error) => {
console.error("Error fetching orders:", error);
});
}

function updateOrdersUI(validOrders) {
const totalOrders = validOrders.length;
console.log(`Total Orders for this month: ${totalOrders}`);
$("#totalOrders").text(`Total Orders: ${totalOrders}`);
}
fetchSalesData();

$(".toggle-sidebar").on("click", function () {
$("#offcanvasSidebar").toggleClass("show");
});

$(".chevron-icon").on("click", function (event) {
event.stopPropagation();
const submenu = $(this).closest(".nav-item").find(".submenu");
submenu.toggle();
$(this).find("i").toggleClass("fa-chevron-right fa-chevron-down");
$(this).closest(".nav-link").toggleClass("selected");
});

$(".nav-link.menu").on("click", function (event) {
event.stopPropagation();
const submenu = $(this).next(".submenu");
submenu.toggle();
$(this).find("i").toggleClass("fa-chevron-right fa-chevron-down");
$(this).toggleClass("selected");
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


// Event listener for "Same as Billing Address" checkbox
$("input[type='checkbox'][value='Same as Billing Adress']").on("change", function () {
if ($(this).is(":checked")) {
// Copy the values from billing address fields to shipping address fields
$("#sAddress").val($("#bAddress").val());
$("#sCity").val($("#bCity").val());
$("#sState").val($("#bState").val());
$("#sCountry").val($("#bCountry").val());
$("#sZip").val($("#bZip").val());
$("#sAttention").val($("#bAttention").val());
} else {
// Clear the shipping address fields if the checkbox is unchecked
$("#sAddress").val("");
$("#sCity").val("");
$("#sState").val("");
$("#sCountry").val("");
$("#sZip").val("");
$("#sAttention").val("");
}
});
// $("#orderNo").on("blur", function () {
// const orderNo = $(this).val();
// console.log("on click",orderNo);
// if (orderNo) {
// axios.get(`https://www.spotops360.com/orders/checkOrderNo/${orderNo}`)
// .then(response => {
// if (response.data.exists) {
// alert("Order No. already exists. Please enter a unique Order No.");
// $(this).val(""); 
// }
// })
// .catch(error => {
// console.error("Error checking Order No:", error);
// });
// }
// });
// Check localStorage for the dark mode preference
const isDarkMode = localStorage.getItem("darkMode") === "true";

if (isDarkMode) {
enableDarkMode();
}

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

$("#logoutLink").click(function () {
window.localStorage.clear();
window.location.href = "login_signup.html";
});

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
loadParts();
// below is the part to add a new part and dynamically add the value to the dropdown list
    const partDropdown = document.getElementById("pReq");
    const newPartModalElement = document.getElementById("newPartModal");
    const newPartModal = new bootstrap.Modal(newPartModalElement);
    const newPartNameInput = document.getElementById("newPartName");
    const saveNewPartBtn = document.getElementById("saveNewPart");
    // Open modal when "Add New Part" is selected
    partDropdown.addEventListener("change", function () {
        if (partDropdown.value === "add_new_part") {
            newPartNameInput.value = "";
            newPartModal.show();
        }
});
    async function saveNewPart() {
        const newPartName = newPartNameInput.value.trim();
        if (!newPartName) {
            alert("Please enter a part name.");
            return;
        }
        try {
            const response = await fetch("https://www.spotops360.com/addNewPart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newPartName })
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.error || "Failed to add part.");
                return;
            }
            // Reload parts after saving
            await loadParts();
            // Select the newly added part
            partDropdown.value = newPartName;
            newPartModal.hide();
        } catch (error) {
            console.error("Error saving new part:", error);
            alert("Failed to add part.");
        }
    }
    saveNewPartBtn.addEventListener("click", saveNewPart);
    // Load parts from the database
    var parts;
    async function loadParts() {
    try {
        const response = await axios.get("https://www.spotops360.com/getParts");
        console.log("partNames", response.data);

        if (!Array.isArray(response.data)) {
            throw new Error("Invalid response format. Expected an array.");
        }

        const parts = response.data;

        // Clear existing options before adding new ones
        partDropdown.innerHTML = "";

        // Populate dropdown
        parts.forEach(part => {
            const option = document.createElement("option");
            option.value = part.name;
            option.textContent = part.name;
            partDropdown.appendChild(option);
        });

        // Add "Add New Part" option at the end
        const addNewOption = document.createElement("option");
        addNewOption.value = "add_new_part";
        addNewOption.textContent = "➕ Add New Part";
        partDropdown.appendChild(addNewOption);

    } catch (error) {
        console.error("Error loading parts:", error);
    }
}
// Show/hide programming cost input based on checkbox
$("#programmingRequiredCheckbox").on("change", function () {
  if ($(this).is(":checked")) {
    $("#programmingCostQuoted").show();
  } else {
    $("#programmingCostQuoted").hide().val("");
  }
});