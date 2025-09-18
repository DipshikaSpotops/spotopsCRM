$(document).ready(async function () {
// to change the main orderStatus to Order Fulfilled when the esc part from yard gets delivered
document.addEventListener("DOMContentLoaded", function () {
    const yardShippingStatus = document.getElementById("yardShippingStatus");
    const orderStatus = document.getElementById("orderStatus"); 
    if (yardShippingStatus && orderStatus) {
        yardShippingStatus.addEventListener("change", function () {
            if (yardShippingStatus.value === "Delivered") {
                orderStatus.value = "Order Fulfilled";
            }
        });
    }
});

  $("#viewAlltasks").on("click", function () {
  window.location.href = "viewAllTasks.html";
});
const queryString = window.location.search.substring(1);
// console.log("query string",queryString);
const urlParams = new URLSearchParams(window.location.search);
var orderNo = urlParams.get("orderNo");
var commonOrderRes;
var orderPlacedDate;
var cancelledRefundAmount;
var refundedAmount;
var salePrice;
var actualGp;
var salesTax;
var currentOrderStatus;
// current datetime - US Central time
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
if (day > 3 && day < 21) return "th"; // All days between 4th and 20th get 'th'
switch (day % 10) {
case 1: return "st";
case 2: return "nd";
case 3: return "rd";
default: return "th";
}
};
var currentDateTime= `${day}${daySuffix(day)} ${month}, ${year} ${hour}:${minute}`;
// common fetch of orders
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then(response => response.json())
.then(data => {
commonOrderRes = data;
orderPlacedDate = data.orderDate;
cancelledRefundAmount = data.cancelledRefAmount || data.custRefAmount || data.custRefAmount;
salePrice = data.soldP;
actualGp = data.actualGP;
salesTax = data.salestax;
currentOrderStatus = data.orderStatus;
// console.log("orderDate",orderPlacedDate)
})
.catch(error => console.error("Error fetching yard data:", error));
// common fetch of orders ends here
$("#orderStatus").on("change", function () {
const newOrderStatus = $(this).val();
console.log("currentOrderStatus",currentOrderStatus);
if (["Dispute", "Refunded", "Order Cancelled"].includes(currentOrderStatus)) {
    const userConfirmed = confirm(`The order status previously was in ${currentOrderStatus}. Do you still want to change the status to ${newOrderStatus}?`);
}
console.log("Order Status changed to:", newOrderStatus);
if (newOrderStatus == "Dispute") { 
$(".disputedRefAmount").val(cancelledRefundAmount)
// console.log("dispute?", newOrderStatus,"order placed on:",orderPlacedDate);
const dallasNowUTC = new Date(
  new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })
).toISOString();
$("#disputedDate").val(dallasNowUTC);
// orderedDate
$(".orderedDate").val(orderPlacedDate);
$("body").append('<div class="modal-overlay"></div>');
$("body").addClass("modal-active");
$("#disputeDiv").fadeIn();
var actualGPAfterDispute = actualGp - salePrice  + cancelledRefundAmount;
console.log("actualGPAfterDispute",salePrice,actualGp,cancelledRefundAmount,actualGPAfterDispute)
// axios.put(`https://www.spotops360.com/orders/${orderNo}/updateActualGP`, { actualGPAfterDispute })
// .then(function (response) {
// // console.log("ActualGP information updated successfully:", response);
// })
// .catch(function (error) {
// console.error("Error updating actualGP:", error);
// });
} 
else if (newOrderStatus == "Refunded" || newOrderStatus == "Voided") {
// console.log("refunded?", newOrderStatus,"orderPlaced on:",orderPlacedDate);
$(".orderedDate").val(orderPlacedDate);
$(".refundedDate").val(currentDateTime);
$(".custRefundedAmount").val(cancelledRefundAmount)
$("body").append('<div class="modal-overlay"></div>');
$("#custRefund").fadeIn();
$("body").addClass("modal-active");
}
else if (newOrderStatus == "Order Cancelled") {
console.log("refunded?", newOrderStatus, "orderPlaced on:","today" ,currentDateTime);
$("body").append('<div class="modal-overlay"></div>');
$("body").addClass("modal-active");
$(".orderedDate").val(orderPlacedDate);
$("#cancelledDate").val(currentDateTime);
$('.cancelledRefAmount').val(cancelledRefundAmount);
console.log("Showing cancellation div"); // Add this line to check if it's being called
$("#cancellingOrder").css("display", "block").hide().fadeIn();
// $("#cancellingOrder").fadeIn(); // Ensure this is called
} 
else {
$("#disputeDiv").fadeOut();
$(".modal-overlay").remove();
$("body").removeClass("modal-active");
}
});
// To close the modal when clicking outside it
$(document).on("click", ".modal-overlay", function () {
$("#disputeDiv").fadeOut();
$(".modal-overlay").remove();
$("body").removeClass("modal-active");
});
//for dispute
$("#disputeSubmit").on("click", function () {
const disputedRefAmount = $(".disputedRefAmount").val();
// console.log("disputeSubmit");
$("#disputeDiv").fadeOut();
$(".modal-overlay").remove();
$("body").removeClass("modal-active");
const disputedDate = $("#disputedDate").val();
const disputeReason = $("#disputeReason").val();
// const orderNo = urlParams.get("orderNo");
// console.log("orderId:", orderNo,"disputedReason:",disputeReason,"disputedDate:",disputedDate);
const disputeData = {
disputedDate: disputedDate,
disputeReason: disputeReason,
disputedRefAmount: disputedRefAmount
};
axios.put(`https://www.spotops360.com/orders/${orderNo}/dispute`, disputeData)
.then(function (response) {
// console.log("Dispute information updated successfully:", response);
alert("Dispute information updated successfully!");
})
.catch(function (error) {
// console.error("Error updating dispute:", error);
alert("Failed to update dispute information.");
});
});
// for dispute till here
//for custRefund
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
$(".custRefundSubmit").on("click", function () {
var firstname = localStorage.getItem("firstName");
$(".custRefundSubmit").prop("disabled", true).css("filter", "blur(2px)");

const userInput = $(".refundedDate").val();
const custRefundDate = convertToISO(userInput);
if (custRefundDate) {
  console.log("ISO Date:", custRefundDate);
  // Now you can send `isoDate` to backend or insert it into your DB
}
const custRefundedAmount = $(".custRefundedAmount").val();
const orderNo = urlParams.get("orderNo");

// if (!custRefundedAmount || !yardIndex) {
//   alert("Refunded amount or yard index is missing.");
//   return;
// }

const custRefundData = {
custRefundDate,
custRefundedAmount,
orderStatus:"Refunded"
};

axios.put(`https://www.spotops360.com/orders/${orderNo}/custRefund?firstName=${firstname}`, custRefundData)
.then(function (response) {
$("#custRefunds").val(custRefundedAmount);

// Handle file upload
const fileInput = document.getElementById("pdfFileRReceipt");
const file = fileInput.files[0];
const formData = new FormData();
if (file) {
formData.append("pdfFile", file);
}

// Send cancellation email with formData (including file)
fetch(`https://www.spotops360.com/orders/sendRefundEmail/${orderNo}?yardIndex=${yardIndex}&refundedAmount=${custRefundedAmount}`, {
method: "POST",
body: formData,
})
.then((response) => {
if (!response.ok) throw new Error("Network response was not ok");
return response.json();
})
.then((result) => {
alert("Email sent to customer with refund receipt.");
console.log("Success:", result);
$(".custRefundSubmit").prop("disabled", true).css("filter", "blur(2px)");
$("#custRefund").hide();
$(".modal-overlay").remove();
// $(".mainDiv").removeClass("blur");
$("body").removeClass("modal-active");
})
.catch((error) => {
console.error("Error:", error);
alert("Failed to send email with refund receipt.");
});
})
.catch(function (error) {
console.error("Error updating refund:", error);
alert("Failed to update refund information.");
});
});


$("#cancelledRefundSubmit").on("click", function () {
$("#cancellingOrder").fadeOut();
// $(".modal-overlay").remove();
// $("body").removeClass("modal-active");
var firstname = localStorage.getItem("firstName");
const userInput = $("#cancelledDate").val();
const cancelledDate = convertToISO(userInput);
if (cancelledDate) {
  console.log("ISO Date:", cancelledDate);
  // Now you can send `isoDate` to backend or insert it into your DB
}
const custRefAmount = $(".cancelledRefAmount").val();
const orderNo = urlParams.get("orderNo");
const reason = $("#reasonCancel").val();

console.log("Captured Data:");
console.log("Cancelled Date:", cancelledDate);
// console.log("Cancelled Refund Amount:", cancelledRefAmount);
console.log("Order No:", orderNo);

axios.put(`https://www.spotops360.com/orders/${orderNo}/custRefund?firstName=${firstname}`, {
cancelledDate: cancelledDate,
custRefAmount: custRefAmount,
orderNo: orderNo,
cancellationReason:reason
})
.then(function (response) {
console.log("Refund information updated successfully:", response.data);
$("#custRefunds").val(custRefAmount);
alert("Refund information for cancelled order updated successfully!");

// Send cancellation email after successful refund update
return axios.post(`/orders/sendCancelEmail/${orderNo}?cancelledRefAmount=${custRefAmount}`);
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

// for auto-filling state,country
$("#zipYard").on("keyup", function() {
// console.log("sipp")
const zipCode = $(this).val();
if (zipCode.length === 5) {
if (zipCode) {
axios.get(`https://api.zippopotam.us/us/${zipCode}`)
.then(response => {
const data = response.data;
const city = data.places[0]['place name'];
const stateAbbr = data.places[0]['state abbreviation'];
const country = data['country abbreviation'];
// console.log("country",country);
$("#cityYard").val(city);
$("#stateYard").val(stateAbbr);
$("#countryYard").val(country); 
})
.catch(error => {
console.error("Error fetching location data:", error);
alert("Invalid ZIP code. Please check and try again.");
});
}}
else if (zipCode.length >= 3 && zipCode.includes(" ")) {
var canadaZip = zipCode.slice(0, 3); 
console.log("canadaZIP",canadaZip);
axios.get(`https://api.zippopotam.us/CA/${canadaZip}`)
.then(response => {
const data = response.data;
// const city = data.places[0]['place name'];
const stateAbbr = data.places[0]['state abbreviation'];
const country = data['country'];
// console.log("country",country);
// $("#cityYard").val(city);
$("#stateYard").val(stateAbbr);
$("#countryYard").val(country); 
})
.catch(error => {
console.error("Error fetching location data:", error);
alert("Invalid ZIP code. Please check and try again.");
});
}
});
// for us states
$('.state-select').select2({
placeholder: "Select State",
allowClear: true
});
const orderDetails = JSON.parse(localStorage.getItem('orderDetails'));
updateAddYardButton();
if (orderDetails) {
$("#orderNo").val(orderDetails.orderNo);
$("#customerName").val(orderDetails.customerName);
$("#email").val(orderDetails.email);
}
// Clear order details from localStorage after loading
localStorage.removeItem('orderDetails');
// Get the current time and the login timestamp so that the user gets automatically logged out after 12 hours
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
const savedPaymentStatus = localStorage.getItem('paymentStatus');
// console.log("paymentStatus",savedPaymentStatus);
if (savedPaymentStatus) {
$('.paymentStatus').val(savedPaymentStatus);
}
const firstName = localStorage.getItem("firstName");
const lastName = localStorage.getItem("lastName");
const token = localStorage.getItem("token");
const email = localStorage.getItem("email");
const role = localStorage.getItem("role");
const team = localStorage.getItem("team");
const isCancelled = urlParams.get('cancelled') === 'true';
const process = urlParams.get("process");
var yardIndex;
document.getElementById("orderHistory").textContent += orderNo;
document.getElementById("createTask").textContent += "-" + " " + orderNo;
$("#deadline").val(`Deadline`);
document.getElementById("yardModalLabel").textContent += orderNo;
document.getElementById("editYardDetailsModalLabel").textContent += orderNo;
var totalSpend = []; 
var totalSum = 0;    
var pStatus;
setTimeout(function() {
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then(response => response.json())
.then(data => {
// console.log("data in setTimeOut", data);
var sp = data.soldP;
var tax = data.salestax;
var spMinusTax = data.spMinusTax || 0 || sp - tax; 
var custRefundedAmount = data.custRefundedAmount || data.cancelledRefAmount || data.custRefAmount || 0;  
var currentActualGp = data.actualGP || 0;
console.log("order rn",data.orderStatus);
$("#custRefunds").val(custRefundedAmount)
$("#actualGP").val(currentActualGp.toFixed(2));
// console.log("saleP",sp,"custRefund",custRefundedAmount,"tax",tax);
// console.log("yards",data.additionalInfo)
if (
(!data.additionalInfo || data.additionalInfo.length === 0) && 
(data.orderStatus === "Order Cancelled" || data.orderStatus === "Refunded" || data.orderStatus === "Dispute"))
{
if (custRefundedAmount) {
actualGP = (sp - custRefundedAmount) - tax;
$("#actualGP").val(actualGP.toFixed(2));

if (currentActualGp !== actualGP) {
axios.put(`https://www.spotops360.com/orders/${orderNo}/updateActualGP`, { actualGP })
.then(function (response) {
// console.log("ActualGP information updated successfully:", response);
})
.catch(function (error) {
console.error("Error updating actualGP:", error);
});
} 
else {
console.log("Same actualGPS");
}
}
}


data.additionalInfo.forEach((yard, index) => {
const yardIndex = index + 1;
// Check if any entry in additionalInfo has escTicked set to "Yes"
const isEscTicked = data.additionalInfo.some(info => info.escTicked === "Yes");

if (isEscTicked) {
$("#escTickBox").prop("checked", true);
} else {
$("#escTickBox").prop("checked", false);
}
pStatus = yard.paymentStatus;
var rStatus = yard.refundStatus;
console.log("pStatus", pStatus, rStatus);
if (pStatus === "Card charged" && rStatus === "Refund collected") {
$(`.yard-btn[data-yard-index="${yardIndex}"]`).css({'background-color': '#fe8025', 'border': 'none'});
} 
else if (yard.status === "PO cancelled" && pStatus !== "Card charged") {
$(`.yard-btn[data-yard-index="${yardIndex}"]`).css({'background-color': '#c3c3c3', 'border': 'none',color: '#ffffff'});
} 
else if (pStatus === "Card charged") {
$(`.yard-btn[data-yard-index="${yardIndex}"]`).css('background-color', '#353d3f');
}

var yardStatus = yard.status;
// console.log("current yard status", yardStatus);
// Update order status based on yard status
// if (yardStatus === "Yard Located" || yardStatus === "Yard PO Sent"){
// $("#orderStatus").val("Yard Processing");
// }
// else if(yardStatus === "Label created") {
// $("#orderStatus").val("Yard Processing");
// var labelCreationDate = currentDateTime;
// }

// else if (yardStatus === "Part shipped") {
// $("#orderStatus").val("In Transit");
// var partShippedDate = currentDateTime;
// } else if (yardStatus === "Part delivered") {
// $("#orderStatus").val("Order Fulfilled");
// } else if (yardStatus === "Escalation") {
// $("#orderStatus").val("Escalation");
// } else if (yardStatus === "Collect refund") {
// $("#orderStatus").val("Escalation");
// }
if(pStatus === "Card charged"){
var yardPP = parseFloat(yard.partPrice) || 0;
var yardOSorYS = yard.shippingDetails || '';
var shippingValueYard = 0;  
if (yardOSorYS.includes("Own shipping")) {
shippingValueYard = parseFloat(yardOSorYS.split(":")[1].trim()) || 0; 
// console.log("own ship", shippingValueYard);
} else if (yardOSorYS.includes("Yard shipping")) {
shippingValueYard = parseFloat(yardOSorYS.split(":")[1].trim()) || 0;
// console.log("yard ship", shippingValueYard);
}
var yardOthers = parseFloat(yard.others) || 0;
var escOwnShipReturn = parseFloat(yard.custOwnShippingReturn) || 0;
var escOwnShipReplacement = parseFloat(yard.custOwnShipReplacement) || 0;
var yardOwnShippingReplacement = parseFloat(yard.yardOwnShipping) || 0;
var yardRefundAmount = parseFloat(yard.refundedAmount) || 0;
var escReimbursement = parseFloat(yard.reimbursementAmount) || 0;
// console.log("add",yardPP,shippingValueYard,yardOthers,escOwnShipReturn,escOwnShipReplacement,yardOwnShippingReplacement,"yardrefundAmount:",yardRefundAmount);
var yardSpent = yardPP + shippingValueYard + yardOthers + escOwnShipReturn + escOwnShipReplacement + yardOwnShippingReplacement + escReimbursement - yardRefundAmount;
console.log("yardSpent", yardSpent,shippingValueYard,yardOthers,escOwnShipReturn,escOwnShipReplacement,yardOwnShippingReplacement,yardRefundAmount,"escReimbursement",escReimbursement);
totalSpend.push(yardSpent);
totalSum += yardSpent;
// console.log("Current totalSpend array:", totalSpend);
// console.log("Total sum of all yards:", totalSum);
var subtractRefund = spMinusTax - custRefundedAmount;
actualGP = subtractRefund - totalSum;
// console.log("Calculated actualGP:", actualGP,"subtractRefund",subtractRefund)
$("#actualGP").val(actualGP.toFixed(2)); 
// updateActualGP(orderNo, actualGP);
if(currentActualGp !== actualGP && data.orderStatus !== "Dispute"){
axios.put(`https://www.spotops360.com/orders/${orderNo}/updateActualGP`, { actualGP })
.then(function (response) {
// console.log("ActualGP information updated successfully:", response);
})
.catch(function (error) {
console.error("Error updating actualGP:", error);
});
}else if (data.orderStatus === "Dispute"){
actualGP =  0 - (totalSum  + tax);
console.log("actualGPAfterDispute",totalSum,tax)
axios.put(`https://www.spotops360.com/orders/${orderNo}/updateActualGP`, { actualGP })
.then(function (response) {
// console.log("ActualGP information updated successfully:", response);
$("#actualGP").val(actualGP.toFixed(2));
})
.catch(function (error) {
console.error("Error updating actualGP:", error);
});
}
else{
console.log("same actyal gp foe card charged")
}
}else if(pStatus === "Card not charged"){
  actualGP =  0;
console.log("actualGPAfterDispute",totalSum,tax)
axios.put(`https://www.spotops360.com/orders/${orderNo}/updateActualGP`, { actualGP })
.then(function (response) {
$("#actualGP").val(actualGP.toFixed(2));
})
.catch(function (error) {
console.error("Error updating actualGP:", error);
});
}
// else{
//   actualGP = sp - tax - custRefundedAmount;
//   console.log("Calculated actualGP for card not charged:", actualGP);
//   $("#actualGP").val(actualGP.toFixed(2)); 
// }
});
})
.catch(error => console.error("Error fetching yard data:", error));
}, 500);
// part to check paymentStatus and other things like updated actualGP end here


if (firstName) {
$("#user-name").text(firstName);
$("#salesAgent").val(firstName);
}
let userRole = null;
let userEmail = null;
if (team === "Team Charlie") {
$("#submenu-reports .nav-link")
.not(':contains("My Sales Report")')
.hide();
$(
"#submenu-dashboards .view-orders-link, #submenu-dashboards .teamA-orders-link, #submenu-dashboards .teamB-orders-link, #submenu-dashboards .placed-orders-link, #submenu-dashboards .cancelled-orders-link, #submenu-dashboards .yard-info-link, #submenu-dashboards .in-transit-link"
).hide();
$(".nav-item:has(#submenu-teams)").hide();
$(".nav-item:has(#submenu-users)").hide();
}
if (role === "Admin") {
$('#submenu-reports .nav-link:contains("My Sales Report")').hide();
$("#submenu-dashboards .view-individualOrders-link").hide();
}
if (role === "Admin" && team === "Team Charlie") {
$(".sidebarOrder").hide();
$(".add-yard-btn").hide();
}

$("#profileLink").click(function () {
$("#profileFirstName").val(firstName);
$("#profileLastName").val(lastName);
$("#profileEmail").val(email);
$("#profileRole").val(role);
$("#profileModal").modal("show");
});

$("#backToOrders").click(function () {
$("#profile-content").addClass("d-none");
$("#placed-order-content").removeClass("d-none");
});

$(".toggle-btn").on("click", function () {
$("#offcanvasSidebar").toggleClass("hide");
});

$(".close-btn").on("click", function () {
$("#offcanvasSidebar").toggleClass("hide");
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
$("#offcanvasSidebar").addClass("hide");
});

$(".nav-link").on("click", function () {
const submenu = $(this).next(".submenu");
if (submenu.length) {
submenu.slideToggle();
$(this)
.find(".chevron-icon i")
.toggleClass("fa-chevron-right fa-chevron-down");
} else {
$(".nav-link").removeClass("active");
$(this).addClass("active");

const contentMap = {
"default-link": "#default-content",
"add-order-link": "#add-order-content",
"view-order-link": "#view-order-content",
};

$(".main-content>div").addClass("d-none");
$(contentMap[this.id]).removeClass("d-none");
$("#offcanvasSidebar").addClass("hide");
}
});

$.ajax({
type: "GET",
url: "https://www.spotops360.com/teams",
success: function (teams) {
const teamCharlie = $("#team-charlie");
const teamMark = $("#team-mark");
const teamSussane = $("#team-sussane");
teams.forEach((team) => {
const teamHtml = `
${team.name}<br>
${team.team}<br>
${team.role}
`;
if (team.team === "Team Charlie") {
teamCharlie.append(teamHtml);
} else if (team.team === "Team Mark") {
teamMark.append(teamHtml);
} else if (team.team === "Team Sussane") {
teamSussane.append(teamHtml);
}
});
},
error: function (error) {
alert("Error fetching teams: " + error.responseJSON.message);
},
});
function calculateProfit() {
const quotedPrice = parseFloat($("#soldP").val()) || 0;
const yardPrice = parseFloat($("#costP").val()) || 0;
const shipping = parseFloat($("#shippingFee").val()) || 0;
const salesTax = 0.05 * quotedPrice;
const grossProfit = quotedPrice - yardPrice;
const netProfit = grossProfit - shipping - salesTax;
$("#salestax").val(salesTax.toFixed(2));
$("#grossProfit").val(netProfit.toFixed(2));
}
$("#soldP, #costP, #shippingFee").on("input", calculateProfit);

function showModal(modalId) {
$(modalId).modal("show");
}
// to add yard  buttons which increments as the yards are added
function addYardButton(yardIndex, buttonText) {
const buttonHtml = `
<button type="button" class="btn btn-info yard-btn" data-yard-index="${yardIndex}">${buttonText}</button>
<div class="yard-details" id="yard-details-${yardIndex}"></div>
`;
$("#yardInfoContainer").append(buttonHtml);
}
function showYardDetails(yardIndex) {
const yardDetails = $(`#yard-details-${yardIndex}`);
if (yardDetails.is(":visible")) {
yardDetails.hide();
} else {
console.log("orderNo0",orderNo);  
// First check in the main orders collection
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
// If order is not found, a check in the cancelledOrders collection
if (!data || !data.additionalInfo) {
console.log('Order not found for showing yard details, checking in cancelled orders...');
return fetch(`https://www.spotops360.com/cancelledOrders/${orderNo}`);
} else {
return Promise.resolve({ status: 200, json: () => data });
}
})
.then((response) => {
if (response.status === 404) {
console.log("Order or cancelled order not found.");
return;
}
return response.json();
})
.then((data) => {
if (!data || !data.additionalInfo || !data.additionalInfo[yardIndex - 1]) {
return;
}
const yardData = data.additionalInfo[yardIndex - 1];
// Set the yardIndex dynamically when you're creating or showing the button
$("#cancelShipment").attr("data-yard-index", yardIndex);
// Check payment status and apply color
if (yardData.paymentStatus === "Card charged" && yardData.refundStatus === "Refund collected") {
$(`.yard-btn[data-yard-index="${yardIndex}"]`).css({'background-color': '#fe8025','border': 'none'});
}
else if (yardData.paymentStatus === "Card charged") {
$(`.yard-btn[data-yard-index="${yardIndex}"]`).css('background-color', '#353d3f');
}
let yardDetailsHtml = `
<table class="table table-bordered">
<tr><td colspan="2">${formatYardData(yardData)}</td></tr>
<tr style="display:flex">
<td colspan="2">
<button type="button" class="edit-yard" data-yard-index="${yardIndex}">Edit Status</button>
<button type="button" class="edit-yard-details" data-yard-index="${yardIndex}">Edit Details</button>
<button type="button" class="cardcharged" data-yard-index="${yardIndex}">Card Charged</button>
<button type="button" class="refundCollect" data-yard-index="${yardIndex}">Refund Status</button>
<button type="button" class="escalation" data-yard-index="${yardIndex}">Escalation</button>
</td>
</tr>
</table>
`;
yardDetails.html(yardDetailsHtml).show();
})
.catch((error) => {
console.error("Error fetching order data:", error);
});
}
}

function formatYardData(yardData) {
let dateTimeStr = yardData.escalationDate;
let datePart = "";
if(dateTimeStr){
datePart = dateTimeStr.split(' ')[0] + ' ' + dateTimeStr.split(' ')[1] + ' ' + dateTimeStr.split(' ')[2];
console.log(datePart);
}else{
console.log("come out");
}
let yardInfo = `
<table style="width: 100%;">
<tr>
<td style="width: 50%; vertical-align: top;">
Yard Name: ${yardData.yardName}<br>
Address: ${yardData.street}, ${yardData.city}, ${yardData.state}, ${yardData.zipcode}<br>
${yardData.email ? `Email: ${yardData.email}<br>` : ""}
${yardData.faxNo ? `Fax No: ${yardData.faxNo}<br>` : ""}
Phone No: ${yardData.phone}<br>
Agent Name: ${yardData.agentName}<br>
Part Price: $${yardData.partPrice}<br>
${yardData.stockNo ? `Stock No: ${yardData.stockNo || ""}<br>` : ""}
Warranty: ${yardData.warranty} days<br>
${yardData.shippingDetails ? `Shipping Method: ${yardData.shippingDetails}<br>` : ""}
${yardData.others ? `Others: ${yardData.others}<br>` : ""}
</td>
<td style="width: 50%; vertical-align: top;">
${yardData.status ? `Status: ${yardData.status}<br>` : ""}
${yardData.paymentStatus ? `Payment Status: ${yardData.paymentStatus}${yardData.cardChargedDate ? ` on ${yardData.cardChargedDate}` : ""}<br>` : ""}
${yardData.paymentDetails ? `Payment Details: ${yardData.paymentDetails}<br>` : ""}
${yardData.trackingNo ? `Cx Tracking No: ${yardData.trackingNo}<br>` : ""}
${yardData.eta ? `Tracking ETA: ${yardData.eta}<br>` : ""}
${yardData.shipperName ? `Carrier: ${yardData.shipperName}<br>` : ""}
${yardData.escalationDate ? `Escalation Date: ${datePart || ""}<br>` : ""}
${yardData.escalationCause ? `Escalation Reason: ${yardData.escalationCause}<br>` : ""}
${yardData.escProcess ? `Escalation Process: ${yardData.escProcess}<br>` : ""}
${yardData.refundStatus ? `Refund Status: ${yardData.refundStatus}${yardData.refundedDate ? ` on ${yardData.refundedDate}` : ""}<br>` : ""}
${yardData.refundedAmount ? `Refunded Amount: $${yardData.refundedAmount}<br>` : ""}
</td>
</tr>
</table>
`;

return yardInfo;
}
// to update the orderHistory for multiple scenarios
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
var vinNo = document.getElementById("vin").value;
var partNo = document.getElementById("partNo").value;
// console.log("vin");
if (orderNo) {
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
document.getElementById("estPP").textContent += data.costP;
var customerNameE = data.customerName;
const nameParts = (customerNameE || "").split(" ").filter(part => part.trim() !== "");
const firstNameE = nameParts[0] || ""; // Default to empty string if no first name
const lastNameE = nameParts[1] || "";  // Default to empty string if no last name
var fName =  data.fName || firstNameE;
var lName =  data.lName ||lastNameE ;
var notes = data.notes;
var notes1 = notes.toString();
var resultNotes = notes1.split('</br>')[0];
var onlyNotes = resultNotes.trim();
$("#orderDate").val(data.orderDate);
$("#salesAgent").val(data.salesAgent);
// $("#bAddress").val(data.bAddress);
$("#bAddress").val(
  data.bAddress && data.bAddress.trim() !== "" 
    ? data.bAddress 
    : [data.bAddressStreet, data.bAddressCity, data.bAddressState, data.bAddressZip, data.bAddressAcountry]
        .filter(Boolean) 
        .join(", ") 
      );
$("#firstName").val(fName);
$("#lastname").val(lName);
$("#sAddress").val(
  [data.sAddressStreet, data.sAddressCity, data.sAddressState, data.sAddressZip, data.sAddressAcountry]
    .filter(Boolean) // Removes empty, null, or undefined values
    .join(", ") || (data.sAddress && data.sAddress.trim() !== "" ? data.sAddress : "")
);

$("#attention").val(data.attention);
$("#email").val(data.email);
$("#phone").val(data.phone);
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
data.additionalInfo.forEach((info, index) => {
addYardButton(index + 1, `Yard ${index + 1}`);
});
if (data.trackingInfo) {
$("#trackingInfoContainer").html(data.trackingInfo);
}
updateOrderHistory(data.orderHistory);

if (process) {
$("#crmForm input, #crmForm select").attr("disabled", true);
$("#orderStatus").attr("disabled", false);
}

if (process) {
$("#orderStatus").on("change", function () {
if ($(this).val() === "yardPoSent") {
showModal("#yardModal");
}
if ($(this).val() === "trackingInfoSent") {
showModal("#trackingModal");
}
});
}
// Listen for form submission
$("#crmForm").on("submit", function (e) {
e.preventDefault(); 
const firstName = localStorage.getItem("firstName");
var cusFName = document.getElementById("firstName").value;
var cuLName = document.getElementById("lastname").value;
var customerName = cusFName + " " + cuLName;
const updateOrder = (url, existingOrderData) => {
const updatedData = {
orderNo: orderNo,
orderDate: $("#orderDate").val() || existingOrderData.orderDate, 
salesAgent: $("#salesAgent").val(),
customerName: customerName,
bAddress: $("#bAddress").val(),
sAddress: $("#sAddress").val(),
attention: $("#attention").val(),
email: $("#email").val(),
phone: $("#phone").val(),
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
vin: document.getElementById("vin").value,
partNo: document.getElementById("partNo").value,
last4digits: $("#issueOrder").val(),
notes: $("#notes").val(),
firstName: firstName,
};
// Sending the updated data to the API using the PUT method
return fetch(`${url}?firstName=${firstName}`, {
method: "PUT",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(updatedData), 
});
};
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => {
return response.json();
})
.then((existingOrderData) => {
const isCancelledOrder = existingOrderData.isCancelled || false;
const updateUrl = isCancelledOrder 
? `https://www.spotops360.com/cancelledOrders/${orderNo}` 
: `https://www.spotops360.com/orders/${orderNo}`;
return updateOrder(updateUrl, existingOrderData);
})
.then((response) => {
if (!response.ok) {
throw new Error("Network response was not ok");
}
return response.json(); 
})
.then((data) => {
updateOrderHistory(data.orderHistory);
const team = localStorage.getItem("team");
alert("Details have been updated");
window.location.reload();
// if (team === "Team Charlie") {
// window.location.href = "individualOrders.html";
// } else {
// window.location.href = "monthwiseOrders.html";
// }
})
.catch((error) => {
console.error("Error:", error);
});
});


partDesc = `
Year: ${data.year}
Make: ${data.make}
Model: ${data.model}
Part required: ${data.pReq}
Desc: ${data.desc}
VIN: ${data.vin}
Part No : ${data.partNo}
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

// for sale note 
function fetchAndDisplaySaleNotes(orderNo) {
// First, check in the main orders collection
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
// If the order is not found or doesn't contain notes, check in cancelledOrders
if (!data || !data.notes) {
console.log('Order not found, checking in cancelled orders...');
return fetch(`https://www.spotops360.com/cancelledOrders/${orderNo}`);
} else {
return Promise.resolve({ status: 200, json: () => data });
}
})
.then((response) => {
if (response.status === 404) {
console.log("Order or cancelled order not found.");
return;
}
return response.json();
})
.then((data) => {
if (!data || !data.notes) {
console.log("No sale notes found for this order.");
return;
}

// Display the sale notes
const programmingRequired = data.programmingRequired;
const expediteShipping = data.expediteShipping;
const notes = data.notes;
const programmingCostQuoted = data.programmingCostQuoted;
const saleNoteDiv = $("#saleNote"); // jQuery selector

const programmingRequiredText = programmingRequired ? "Yes" : "No";
const expediteShippingText = expediteShipping === "true" ? "Yes" : "No";

const noteHtml = `
  <div>
    <p><strong>Sale Note:</strong> ${notes}</p>
    <p><strong>Programming Required:</strong> ${programmingRequiredText || ""}</p>
    <p><strong>Programming Cost:</strong> $${programmingCostQuoted || ""}</p>
    <p><strong>Expedite Shipping:</strong> ${expediteShippingText || ""}</p>
  </div>
`;

saleNoteDiv.append($(noteHtml));


})
.catch((error) => {
console.error("Error fetching sale notes:", error);
});
}
// sale ntes till here

fetchAndDisplaySaleNotes(orderNo);
}

else {
console.log("Order not found");
}



// $("#orderStatus").on("change", function () {
// // if ($(this).val() === "Yard PO sent") {
// // showModal("#yardModal");
// // $("#divTrackingEdit").hide();
// // }
// console.log("orderStatus",$(this).val());
// if ($(this).val() === "Order Cancelled") {
// const id = $(this).data("id");
// // console.log(`Cancel for order ID: ${orderNo}`,id); 
// fetch(`https://www.spotops360.com/orders/${orderNo}`, {
// method: "DELETE",
// headers: {
// Authorization: `Bearer ${token}`
// },
// })
// .then((response) => {
// if (!response.ok) {
// // console.error("Failed to delete order", response);
// throw new Error("Failed to delete order");
// }
// return response.json();
// })
// .then((data) => {
// console.log("Order cancelled successfully", data);
// window.location.reload();
// })
// .catch((error) => {
// console.error("Error cancelling order:", error);
// });

// }
// else {
// $("#divTrackingEdit").hide();
// $("#sendEmailButton").hide();
// }
// });

$("#yardInfoContainer").on("click", ".yard-btn", function () {
yardIndex = $(this).data("yard-index");
showYardDetails(yardIndex);
});


$(".add-yard-btn").on("click", function () {
// console.log("add new yard")
// Fetch the order data first to get the order status and additionalInfo
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
const orderStatus = data.orderStatus;
// console.log("orderStatus",orderStatus);
const lastYardBtn = $("#yardInfoContainer .yard-btn").last();
if (orderStatus === "Placed") {
$('#yardModal').modal('hide'); // Hide modal
alert("You cannot add a new yard until the customer approves the order.");
} else if (lastYardBtn.length > 0) {
let yardIndex = lastYardBtn.data("yard-index");
const yardData = data.additionalInfo[yardIndex - 1];
// console.log("yardData suggestions", yardData, orderStatus);

if (yardData.status === "PO cancelled" || (yardData.status === "Escalation" && (yardData.escalationProcess === "Return" || yardData.escalationProcess === "Junk")) || yardData.status === "Collect refund"){
showModal("#yardModal"); 
} else {
$('#yardModal').modal('hide'); 
alert("You cannot add a new yard until the current yard status is either PO Cancelled or Escalation and escalation process should either be Return or Junked.");
}
} else {
showModal("#yardModal");
}
})
.catch(error => console.error("Error fetching yard data:", error));
});
// card charged part starts here
let selectedYardIndex;
// On clicking the "Card Charged" button
// Function to fetch the payment status for the specific yard index from the database
// function fetchPaymentStatus(orderNo, yardIndex) {
// return fetch(`https://www.spotops360.com/orders/${orderNo}/additionalInfo/${yardIndex}`)
// .then(response => response.json())
// .then(data => data.paymentStatus)
// .catch(error => console.error("Error fetching payment status:", error));
// }
$('#yardInfoContainer').on('click', '.cardcharged', function () {
selectedYardIndex = $(this).data('yard-index');
$("body").append('<div class="modal-overlay"></div>');
$("body").addClass("modal-active");
$("#cardCharged").modal("show"); // Show the #cardCharged div with a fade-in effect
// $(".mainDiv").addClass("blur");
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
if (!data || !data.additionalInfo || !data.additionalInfo[yardIndex - 1]) {
return;
}
const yardData = data.additionalInfo[yardIndex - 1];
$(".paymentStatus").val(yardData.paymentStatus);
$("#cardChargedDate").val(yardData.cardChargedDate);
})
});
//for refund status
$('#yardInfoContainer').on('click', '.refundCollect', function () {
selectedYardIndex = $(this).data('yard-index');
console.log("refund collected part",selectedYardIndex);
$("body").append('<div class="modal-overlay"></div>');
$("body").addClass("modal-active");
$("#refundCollect").modal("show"); 
// $(".mainDiv").addClass("blur");
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
if (!data || !data.additionalInfo || !data.additionalInfo[yardIndex - 1]) {
// console.log("Order data or additionalInfo not found.");
return;
}
const yardData = data.additionalInfo[yardIndex - 1];
$("#paymentStatusSelect").val("Refund collected");
$("#refundedAmountContainer").show()
// Prefill input fields
$("#refundedAmount").val(yardData.refundedAmount);
$("#refundToCollect").val(yardData.refundToCollect);
$("#refundReasonYard").val(yardData.refundReason);
$("#returnTrackingNo").val(yardData.returnTrackingCust);
var shippDetails = yardData.shippingDetails;
if (shippDetails && shippDetails.includes("Yard shipping")) {
var yardShippingValue = shippDetails.split(":")[1].trim();
console.log("yard ship", yardShippingValue);
}else{
var yardShippingValue = "";
}
// Ensure all values are treated as numbers
var actualRefund = yardData.yardName  + "" + "|" + yardData.phone + "" + "|" + yardData.email;
console.log("actualRefund", actualRefund);
// $("#actualRefundToCollect").text(`To be collected: $${actualRefund}`);
$("#actualRefundToCollect").text(actualRefund);
if(yardData.storeCredit){
$("#storeCreditCheckbox").prop('checked', true);
}
if(yardData.collectRefundCheckbox){
$("#collectRefundCheckbox").prop('checked', true);
}
if(yardData.upsClaimCheckbox){
$("#upsClaimCheckbox").prop('checked', true);
}
if(yardData.refundedDate){
$("#refundedDate").val(yardData.refundedDate);
}
if(yardData.refundStatus === "Refund collected"){
$("#paymentStatusSelect").val("Refund collected")
}else if(yardData.refundStatus === "Refund not collected"){
$("#paymentStatusSelect").val("Refund not collected")
$("#paymentStatusSelect").val("Refund not collected")
}else{
$("#paymentStatusSelect").val("")
}
})
});
// for esc part in yard
$('#yardInfoContainer').on('click', '.escalation', async function () {
const selectedYardIndex = $(this).data('yard-index');
const orderNo = urlParams.get("orderNo");
$("body").append('<div class="modal-overlay"></div>');
$("body").addClass("modal-active");
$("#escRMA").modal("show");
$("#saveEsc,#sendRMAEmail,#sendReimburseEmail,.custRefundSubmit, #sendRefundEmailYard").data("yard-index", selectedYardIndex);

try {
const response = await axios.get(`https://www.spotops360.com/orders/${orderNo}?firstName=${firstName}`);
if (response.status !== 200) {
throw new Error("Failed to fetch order data");
}

// Validate the data for the selectedYardIndex
const additionalInfo = response.data.additionalInfo.find(
(info, index) => index + 1 === selectedYardIndex
);

if (!additionalInfo) {
console.error("No matching additionalInfo found for the selected yard index.");
alert("No matching yard information found.");
return;
}

// Construct the yard address
var yardAddress = `${additionalInfo.street || ''}, ${additionalInfo.city || ''}, ${additionalInfo.state || ''}, ${additionalInfo.zipcode || ''}`;
console.log("yardAdd", yardAddress);

// Populate form fields only with the matching data
if (additionalInfo.escalationProcess) {
$("#escProcess").val(additionalInfo.escalationProcess);
if (additionalInfo.escalationProcess === 'Replacement') {
$('#replacementColumns').fadeIn();
$('#partFromCustomer').fadeIn();
$('#partFromYard').fadeIn();
$('#partFromCustomerReturn').fadeOut();
$('#reimbursement').fadeOut();
} else if (additionalInfo.escalationProcess === 'Return') {
$('#replacementColumns').fadeIn();
$('#partFromCustomerReturn').fadeIn();
$('#partFromCustomer').fadeOut();
$('#partFromYard').fadeOut();
$('#reimbursement').fadeOut();
$('.partsFromDropdown').hide();
if (additionalInfo.customerShippingMethodReturn == "Own shipping"){
$('#customerShippingValueReturn').fadeIn();
} else {
$('#customerShippingValueReturn').fadeOut();
}
} else if (additionalInfo.escalationProcess === 'Reimbursement') {
$('#replacementColumns').fadeOut();
$('#partFromCustomerReturn').fadeOut();
$('#partFromCustomer').fadeOut();
$('#partFromYard').fadeOut();
$('#reimbursement').fadeIn();
$('.partsFromDropdown').hide();
} else {
$('#replacementColumns').fadeOut();
$('#partFromCustomer').fadeOut();
$('#partFromYard').fadeOut();
$('#reimbursement').fadeOut();
$('.partsFromDropdown').hide();
}
}

// Populate other fields if available
$("#custReason").val(additionalInfo.custReason || "");
$("#customerShippingMethodReplacement").val(additionalInfo.customerShippingMethodReplacement || "");
$("#customerTrackingNumberReplacement").val(additionalInfo.customerTrackingNumberReplacement || "");
$("#customerShipperReplacement").val(additionalInfo.customerShipperReplacement || "");
$("#customerETAReplacement").val(additionalInfo.customerETAReplacement || "");
$("#custOwnShipReplacement").val(additionalInfo.custOwnShipReplacement || "");
$("#custOwnShipReplacement").val(additionalInfo.custOwnShipReplacement || "").parent().show();
$("#custreplacementDelivery").val(additionalInfo.custreplacementDelivery || "");
$("#yardShippingStatus").val(additionalInfo.yardShippingStatus || "");
$("#yardShippingMethod").val(additionalInfo.yardShippingMethod || "");
$("#yardownShipping").val(additionalInfo.yardOwnShipping || "").parent().show();
$("#yardShipper").val(additionalInfo.yardShipper || "");
$("#shipToReturnAdd").val(yardAddress || "");
$("#shipToRepAdd").val(yardAddress || "");
$("#yardTrackingNumber").val(additionalInfo.yardTrackingNumber || "");
$("#yardTrackingETA").val(additionalInfo.yardTrackingETA || "");
$("#yardTrackingLink").val(additionalInfo.yardTrackingLink || "");
$("#customerShippingMethodReturn").val(additionalInfo.customerShippingMethodReturn || "");
$("#custretPartETA").val(additionalInfo.custretPartETA || "");
$("#customerShipperReturn").val(additionalInfo.customerShipperReturn || "");
$("#custOwnShippingReturn").val(additionalInfo.custOwnShippingReturn || "");
$("#returnTrackingCust").val(additionalInfo.returnTrackingCust || "");
$("#custOwnShippingReturm").val(additionalInfo.custReturnDelivery || "");
$("#custReturnDelivery").val(additionalInfo.custReturnDelivery || "");
$("#reimAmount").val(additionalInfo.reimbursementAmount || "");
$('#reimbursed').prop('checked', additionalInfo.isReimbursedChecked === "true");
$('#custOwnShippingReturn').val(additionalInfo.custOwnShippingReturn);

} catch (error) {
console.error("Error fetching data:", error);
alert("Error fetching yard information");
}
});

$("#closeCardCharged").on("click", function () {
  $('#cardCharged').hide();
window.location.reload();
});


$("#closeRefundCollected").on("click", function () {
$("#refundCollect").fadeOut(); 
window.location.reload();
});


// On clicking the submit button inside the popup
// Saving the selected payment status
$('#cardChargedSbmit').on('click', function() {
$('#cardCharged').hide();
// $(".mainDiv").removeClass("blur");
$(".modal-overlay").remove();
$("body").removeClass("modal-active");
const paymentStatus = $(".paymentStatus").val();
const cardChargedDate = $("#cardChargedDate").val();
localStorage.setItem('paymentStatus', paymentStatus);
// console.log('Payment status saved to localStorage:', localStorage.getItem('paymentStatus')); 

if (paymentStatus === "Card charged") {
$(`.yard-btn[data-yard-index="${selectedYardIndex}"]`).css('background-color', '#353d3f');
}

const data1 = {
paymentStatus: paymentStatus,
cardChargedDate: cardChargedDate };
console.log("Sending update:", data1);

const updateOrder = (url) => {
return fetch(url, {
method: "PUT",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(data1),
});
};

// First attempt to update in the orders collection
updateOrder(`https://www.spotops360.com/orders/${orderNo}/additionalInfo/${selectedYardIndex}/paymentStatus?firstName=${firstName}`)
.then((response) => {
return response.json();  // Successful update in orders
})
.then((data) => {
if (data) {
console.log("Data successfully updated:", data);
alert("Yard details have been updated");

updateOrderHistory(data.orderHistory);
showYardDetails(selectedYardIndex);
fetchAndUpdateYardInfo();
window.location.reload();
}
})
.catch((error) => {
console.error("Error:", error);
// alert("Error updating yard details. Please try again.");
});
window.location.reload();
});
//  card charged part till here
// refundCollect part 
$('#refundSubmit').on('click', function () {
  // Optional: guard against double clicks
  const $btn = $(this).prop('disabled', true);

  // Close modal/overlay
  $('#refundCollect').hide();
  $('.modal-overlay').remove();
  $('body').removeClass('modal-active');

  // If there is only one status input, just read its value
  const refundStatus = $('.paymentStatusRefund').first().val() || '';

  const refundedAmount = $('#refundedAmount').val();
  const isStoreCredit = $('#storeCreditCheckbox').is(':checked');
  const collectRefundCheckbox = $('#collectRefundCheckbox').is(':checked');
  const upsClaimCheckbox = $('#upsClaimCheckbox').is(':checked'); // <-- fixed
  const refundToCollect = $('#refundToCollect').val();
  const refundedDate = $('#refundedDate').val();
  const refundReason = $('#refundReasonYard').val();

  console.log('refund reason', refundReason);
  console.log('collectRefundCheckbox', collectRefundCheckbox, 'refundToCollect', refundToCollect, 'upsClaimCheckbox', upsClaimCheckbox);

  if (refundStatus === 'Refund collected') {
    $(`.yard-btn[data-yard-index="${selectedYardIndex}"]`).css('background-color', '#fe8025');
  }

  const data1 = {
    refundStatus: refundStatus,
    refundedAmount: refundedAmount,
    storeCredit: isStoreCredit ? refundedAmount : null,
    refundedDate: refundedDate || '',
    collectRefundCheckbox: collectRefundCheckbox ? 'Ticked' : 'Unticked',
    upsClaimCheckbox: upsClaimCheckbox ? 'Ticked' : 'Unticked',
    refundToCollect: refundToCollect,
    refundReason: refundReason
  };

  const updateOrder = (url) => {
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data1)
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
      }
      // If your API returns JSON, parse it; if it returns nothing, handle gracefully
      try { return await res.json(); } catch { return null; }
    });
  };

  // Do NOT reload immediately; wait for success
  updateOrder(`https://www.spotops360.com/orders/${orderNo}/additionalInfo/${selectedYardIndex}/refundStatus?firstName=${encodeURIComponent(firstName)}`)
    .then((data) => {
      if (data && data.orderHistory) {
        updateOrderHistory(data.orderHistory);
      }
      // Update UI without reload
      showYardDetails(selectedYardIndex);
      fetchAndUpdateYardInfo();
      // If you really need a reload, do it here after success:
      // window.location.reload();
    })
    .catch((error) => {
      console.error('Error:', error);
      // Optional: show a toast/banner here
    })
    .finally(() => {
      $btn.prop('disabled', false);
    });
    window.location.reload();
});

// refundCollect part ends here
$("#yardInfoContainer").on("click", ".edit-yard", function () {
$("body").append('<div class="modal-overlay"></div>');
$("body").addClass("modal-active");
// $("#editYardPopup").show();
$("#editYardPopup").modal("show");
yardIndex = $(this).data("yard-index");
$("#editYardInfo").data("yard-index", yardIndex);
$("#yardIndexEdit").val(yardIndex);
$("#submit").data("yard-index", yardIndex);
// Fetch from the orders collection first
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => {
if (response.status === 404) {
// console.log('Order not found in orders, checking in cancelledOrders...');
return fetch(`https://www.spotops360.com/cancelledOrders/${orderNo}`);
}
return response;
})
.then((response) => response.json())
.then((data) => {
if (!data || !data.additionalInfo || !data.additionalInfo[yardIndex - 1]) {
// console.log("Order data or additionalInfo not found.");
return;
}

const yardData = data.additionalInfo[yardIndex - 1];
// if(yardData.poSentDate){
//   $("#editYardInfo").prop("disabled", true).css("filter", "blur(2px)");
// }
// Prefill input fields
$("#refund").val(yardData.status);
$("#cardCharged").val(yardData.paymentStatus);
$("#paymentStatusSelect").val(yardData.paymentStatus);
$("#refundedAmount").val(yardData.refundedAmount);
$("#esc").val(yardData.escalationCause);
$("#escProcess").val(yardData.escalationProcess);

// Handle escalation checkbox
if (yardData.status === "Yard PO Sent") {
$("#sendPOContainer").show();
}else{
  $("#sendPOContainer").hide();
}
if (yardData.status === "Escalation") {
$("#escTickBox").prop("checked", true);
$("#escalation").show();
} else {
$("#escTickBox").prop("checked", false);
$("#escalation").hide();
}
if (yardData.status === "Part shipped") {
$("#divTrackingEdit").show();
$("#sendEmailButton").show();
$("#voidLabel").hide();
$("#trackingNoEdit").val(yardData.trackingNo || "");
$("#etaEdit").val(yardData.eta || "");
$("#linkInput").val(yardData.trackingLink || "");
const predefinedShippers = ["UPS", "World Wide Express", "FedEx"];
if (predefinedShippers.includes(yardData.shipperName)) {
// If the shipper is one of the predefined ones, set the select value
$("#shipperNameEdit").val(yardData.shipperName);
$("#otherShipperInput").hide();
} else {
// If the shipper is not in the predefined list, set "Others" and show the input
$("#shipperNameEdit").val("Others");
$("#otherShipperInput").val(yardData.shipperName).show();
}
}else if (yardData.status === "Label created") {
$("#divTrackingEdit").show();
$("#sendEmailButton").hide();
$("#voidLabel").show();
$("#trackingNoEdit").val(yardData.trackingNo || "");
$("#etaEdit").val(yardData.eta || "");
$("#linkInput").val(yardData.trackingLink || "");
const predefinedShippers = ["UPS", "World Wide Express", "FedEx"];
if (predefinedShippers.includes(yardData.shipperName)) {
// If the shipper is one of the predefined ones, set the select value
$("#shipperNameEdit").val(yardData.shipperName);
$("#otherShipperInput").hide();
} else {
// If the shipper is not in the predefined list, set "Others" and show the input
$("#shipperNameEdit").val("Others");
$("#otherShipperInput").val(yardData.shipperName).show();
}
}

else {
// Hide the tracking section if not "Part shipped"
$("#divTrackingEdit").hide();
}
$("#editYardModal").modal("show");
fetchAndDisplayNotes(yardIndex);
})
.catch((error) => {
console.error("Error fetching order data:", error);
});
});

// Handle shipper selection to show or hide "Other" input
$("#shipperNameEdit").on("change", function () {
if ($(this).val() === "Others") {
$("#otherShipperInput").show();
} else {
$("#otherShipperInput").hide();
}
});

// var labelDate;
$("#editYardInfo").on("click", async function () {
console.log("clicking on save");
$(".mainDiv").removeClass("blur");
const yardIndex = $(this).data("yard-index");
let currentYardData = {};
try {
let response = await fetch(`https://www.spotops360.com/orders/${orderNo}`);
let orderData = await response.json();
let escCause = "";
const currentYardData = orderData.additionalInfo[yardIndex - 1];
const status = $("#refund").val();
if (
(status === "Yard located") &&
currentYardData
) {
alert("Wrong status selected, please select an appropriate option");
return; 
}
if (status === "Yard PO Sent" && currentYardData.poSentDate) {
alert("Wrong status selected, please select an appropriate option");
return; 
}
if (status === "PO cancelled" && currentYardData.poCancelledDate) {
alert("Wrong status selected, please select an appropriate option");
return; 
}
// Don't use const or let again, just reassign
var partShipDate = (currentYardData.partShippedDate || "").trim();

if (status === "Part shipped" && partShipDate !== "") {
    alert("Wrong status selected, please select an appropriate option");
    return;
}

// if (status === "Part delivered" && currentYardData.deliveredDate) {
// alert("Wrong status selected, please select an appropriate option");
// return;
// }
// if (status === "Escalation" && currentYardData.escalationDate) {
// alert("Wrong status selected, please select an appropriate option");
// return; 
// }
const trackingNo = $("#trackingNoEdit").val();
const eta = $("#etaEdit").val();
let shipperName =
$("#shipperNameEdit").val() === "Others"
? $("#otherShipperInput").val()
: $("#shipperNameEdit").val();
const trackingLink = $("#linkInput").val();
const paymentStatus = $(".paymentStatus").val();
const refundedAmount = $("#refundedAmount").val();
let newStatus = $("#orderStatus").val();
if (
status === "Label created" &&
(!trackingNo || !eta || !shipperName || !trackingLink)
) {
alert(
"Please fill all required fields: Tracking No, ETA, Shipper Name, and Tracking Link."
);
return; // Exit the function if validation fails
}

// Proceed only if validation passes
if (status === "Part shipped") {
newStatus = "In Transit";
var partShippedDate = currentDateTime;
} else if (status === "PO cancelled") {
newStatus = "Yard Processing";
var poCancelledDate = currentDateTime;
} else if (status === "Label created") {
newStatus = "Yard Processing";
var labelCreationDate = currentDateTime;
currentYardData.labelCreationDate = currentYardData.labelCreationDate || [];
currentYardData.labelCreationDate.push(currentDateTime);
} else if (status === "Escalation") {
newStatus = "Escalation";
var escalationDate = currentDateTime;
escCause = $("#esc").val();
var escTicked = "Yes";
$("#escTickBox").prop("checked", true);
} else if (status === "Part delivered") {
newStatus = "Order Fulfilled";
var mainOrderDeliveredDate = currentDateTime;
var deliveredDate = currentDateTime;
} else if (status === "Yard PO Sent") {
newStatus = "Yard Processing";
var poSentDate = currentDateTime;
}

const updatedData = {
...currentYardData,
status: status,
labelCreationDate: currentYardData.labelCreationDate,
poSentDate: poSentDate || currentYardData.poSentDate,
poCancelledDate: poCancelledDate || currentYardData.poCancelledDate,
partShippedDate: partShippedDate || currentYardData.partShippedDate,
deliveredDate: deliveredDate || currentYardData.deliveredDate,
trackingNo: trackingNo || currentYardData.trackingNo,
eta: eta || currentYardData.eta,
shipperName: shipperName || currentYardData.shipperName,
trackingLink: trackingLink || currentYardData.trackingLink,
refundedAmount: refundedAmount
? parseFloat(refundedAmount)
: currentYardData.refundedAmount,
escalationCause: escCause || currentYardData.escalationCause,
escalationDate: escalationDate || currentYardData.escalationDate,
escTicked: escTicked || currentYardData.escTicked,
};

const payload = {
updatedYardData: updatedData,
orderStatus: newStatus || orderData.orderStatus,
mainOrderDeliveredDate : mainOrderDeliveredDate || ""
};

console.log("Payload:", payload);

await fetch(
`https://www.spotops360.com/orders/${orderNo}/additionalInfo/${yardIndex}?firstName=${firstName}`,
{
method: "PUT",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(payload),
}
);

// Only hide the popup after successful submission
$("#editYardPopup").hide();
window.location.reload();
} catch (error) {
console.error("Error fetching or updating yard data:", error);
}
});


$("#saveEsc").on("click", async function () {
    $(".modal-overlay").remove();
    $("body").removeClass("modal-active");
    $("#escRMA").hide();

    const yardIndex = $(this).data("yard-index");
    const orderNo = urlParams.get("orderNo");
    const firstName = localStorage.getItem("firstName");
    const token = localStorage.getItem("token");
    // custOwnShippingReturn
    console.log("custOwnShippingReturn")
    const updatedFields = {
        escalationProcess: $("#escProcess").val(),
        custReason: $("#custReason").val(),
        customerShippingMethodReplacement: $("#customerShippingMethodReplacement").val(),
        custOwnShipReplacement: $("#custOwnShipReplacement").val(),
        customerShipperReplacement: $("#customerShipperReplacement").val(),
        customerTrackingNumberReplacement: $("#customerTrackingNumberReplacement").val(),
        customerETAReplacement: $("#customerETAReplacement").val(),
        custreplacementDelivery: $("#custreplacementDelivery").val(),
        yardShippingStatus: $("#yardShippingStatus").val(),
        yardShippingMethod: $("#yardShippingMethod").val(),
        yardShipper: $("#yardShipper").val(),
        yardTrackingNumber: $("#yardTrackingNumber").val(),
        yardOwnShipping: $("#yardownShipping").val(),
        yardTrackingETA: $("#yardTrackingETA").val(),
        yardTrackingLink: $("#yardTrackingLink").val(),
        customerShippingMethodReturn: $("#customerShippingMethodReturn").val(),
        custretPartETA: $("#custretPartETA").val(),
        customerShipperReturn: $("#customerShipperReturn").val(),
        returnTrackingCust: $("#returnTrackingCust").val(),
        custOwnShippingReturn: $("#custOwnShippingReturn").val(),
        custReturnDelivery: $("#custReturnDelivery").val(),
        reimbursementAmount: $("#reimAmount").val(),
        isReimbursedChecked: $("#reimbursed").prop("checked"),
    };

    try {
      console.log("orderNo",orderNo,yardIndex);
      const response = await axios.get(
            `https://www.spotops360.com/orders/${orderNo}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Response Status:", response.status);

        if (response.status !== 200) {
            console.error("Response Body:", response.data);
            alert("Failed to fetch current order data.");
            return;
        }

        const data = response.data;
        const currentAdditionalInfo = data.additionalInfo[yardIndex - 1]
        console.log("response",data,"Current Additional Info:", currentAdditionalInfo);
        const updatedData = {};
        let hasChanges = false;

        // Helper function to normalize values for comparison
        const normalizeValue = (value) => {
            if (value === null || value === undefined) return "";
            if (typeof value === "boolean") return value ? "true" : "false";
            if (typeof value === "number") return value.toString();
            return value.toString().trim();
        };

        const hasValueChanged = (oldValue, newValue) => normalizeValue(oldValue) !== normalizeValue(newValue);

        for (const [key, newValue] of Object.entries(updatedFields)) {
            const oldValue = currentAdditionalInfo[key];

            if (hasValueChanged(oldValue, newValue)) {
                if (key === "customerTrackingNumberReplacement") {
                    if (!currentAdditionalInfo.escRepCustTrackingDate && normalizeValue(newValue).length > 4) {
                        updatedData.escRepCustTrackingDate = currentDateTime;
                        console.log("Setting escRepCustTrackingDate:", currentDateTime);
                    }
                }

                if (key === "yardTrackingNumber") {
                    if (!currentAdditionalInfo.escRepYardTrackingDate && normalizeValue(newValue).length > 4) {
                        updatedData.escRepYardTrackingDate = currentDateTime;
                        console.log("Setting escRepYardTrackingDate:", currentDateTime);
                    }
                }

                if (key === "returnTrackingCust") {
    console.log("Current escRetTrackingDate value:", currentAdditionalInfo, currentAdditionalInfo.escRetTrackingDate);

    // Ensure escRetTrackingDate is not set and newValue meets the length criteria
    if (!currentAdditionalInfo.escRetTrackingDate) {
        if (normalizeValue(newValue).length > 4) {
            updatedData.escRetTrackingDate = currentDateTime;
            console.log("Setting escRetTrackingDate for the first time:", currentDateTime);
        }
        
    } else {
        console.log("escRetTrackingDate is already set, skipping update.");
    }
}

                if (key === "custreplacementDelivery") {
                    if (newValue === "In Transit" && !currentAdditionalInfo.inTransitpartCustDate) {
                        updatedData.inTransitpartCustDate = currentDateTime;
                    } else if (newValue === "Delivered" && !currentAdditionalInfo.repPartCustDeliveredDate) {
                        updatedData.repPartCustDeliveredDate = currentDateTime;
                    }
                }

                if (key === "yardShippingStatus") {
                    if (newValue === "In Transit" && !currentAdditionalInfo.inTransitpartYardDate) {
                        updatedData.inTransitpartYardDate = currentDateTime;
                    } else if (newValue === "Delivered" && !currentAdditionalInfo.yardDeliveredDate) {
                        updatedData.yardDeliveredDate = currentDateTime;
                    }
                }

                if (key === "custReturnDelivery") {
                    if (newValue === "In Transit" && !currentAdditionalInfo.inTransitReturnDate) {
                        updatedData.inTransitReturnDate = currentDateTime;
                    } else if (newValue === "Delivered" && !currentAdditionalInfo.returnDeliveredDate) {
                        updatedData.returnDeliveredDate = currentDateTime;
                    }
                }

                updatedData[key] = newValue;
                hasChanges = true;
            }
        }

        // Handle reimbursement separately
        if (updatedFields.reimbursementAmount && hasValueChanged(currentAdditionalInfo.reimbursementAmount, updatedFields.reimbursementAmount)) {
            const yardStatus = "Part delivered";
            const newOrderStatus = "Order Fulfilled";
            const reimbursementUpdate = {
                orderStatus: newOrderStatus,
                yardStatus: yardStatus,
                yardIndex: yardIndex,
            };

            console.log("Sending data for reimbursement:", reimbursementUpdate);

            try {
                const reimbursementResponse = await fetch(
                    `https://www.spotops360.com/orderAndYardStatus/${orderNo}?firstName=${firstName}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(reimbursementUpdate),
                    }
                );

                if (!reimbursementResponse.ok) {
                    throw new Error("Failed to update order and yard status.");
                }

                const reimbursementData = await reimbursementResponse.json();
                console.log("Order and Yard status updated successfully:", reimbursementData);
window.location.reload();
                if (reimbursementData.orderHistory) {
                    updateOrderHistory(reimbursementData.orderHistory);
                }
            } catch (error) {
                console.error("Error updating reimbursement details:", error);
                alert("Error updating reimbursement details.");
            }
        }

        // Send updated data to backend
        if (hasChanges) {
            console.log("Changes detected. Sending updated data:", updatedData);
            const patchResponse = await axios.put(
                `https://www.spotops360.com/orders/${orderNo}/escalation?firstName=${firstName}`,
                { ...updatedData, yardIndex, firstName, orderNo },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );

            if (patchResponse.status === 200) {
                alert("Yard Index information and orderHistory updated successfully!");
            } else {
                alert("Failed to update Yard Index information and orderHistory.");
            }
        } else {
            console.log("No changes detected, no update required.");
        }
    } catch (error) {
        console.error("Error saving Yard Index information", error);
        alert("Error saving Yard Index information.");
    }
    window.location.reload();
});


async function fetchAndDisplayNotes(yardIndex) {
console.log("yIndex", yardIndex, "oNo", orderNo);
console.log("Fetching and displaying notes...");

fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
// console.log("notes",data,yardIndex);
console.log(
"Fetched notes:",
data.additionalInfo[yardIndex-1].notes
);
displayComments(data.additionalInfo[yardIndex-1].notes);
})
.catch((error) => {
console.error("Error fetching notes:", error);
});
}

async function fetchAndUpdateYardInfo() {
const token =
"d7efef519360bf1ae968db97c52855fcdfbfab171af45c4720f8b648cf2814f3069a696b70ad12bba620b5394ee11b076f4fc31bd07baee18ace4fb4c8bfed34"; // Use your provided token here
await fetchYardInfo(token);
}

var shippingMethod;
$("#addYardInfo").on("click", function (event) {
event.preventDefault();  // Prevent form submission
console.log("Adding yard info");

const firstName = localStorage.getItem("firstName");

const requiredFields = [
$("#yardName"),
$("#agentName"),
$("#yardRating"),
$("#phoneYard"),
$("#addressYard"),
$("#cityYard"),
$("#stateYard"),
$("#zipYard"),
$("#partPrice")
];

console.log("Selected state:", $("#state").val(), $("#phoneYard").val());

// Check if all required fields are filled
let allFieldsFilled = true;
requiredFields.forEach(function (field) {
console.log("Field value:", field.val());
if (field.val().trim() === "") {
allFieldsFilled = false;
field.css("border-color", "red");
} else {
field.css("border-color", "");
}
});

if (!allFieldsFilled) {
alert("Please fill out all required fields.");
return;
}

const newOrderStatus = "Yard Processing";
console.log("New order status", newOrderStatus);
$("#orderStatus").val(newOrderStatus);

const updatedData = { orderStatus: newOrderStatus };

// Update order status on the server
fetch(`https://www.spotops360.com/orders/${orderNo}?firstName=${firstName}`, {
method: "PUT",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(updatedData),
})
.then((response) => {
if (!response.ok) {
throw new Error("Network response was not ok");
}
return response.json();
})
.then((data) => {
console.log("Order status updated successfully:", data);
updateOrderHistory(data.orderHistory);
})
.catch((error) => {
console.error("Error updating order status:", error);
});

// Proceed with form submission if all fields are filled
$(".mainDiv").removeClass("blur");  // Ensure the background blur is removed
$("#yardModal").hide();  // Hide the modal after submission
$("#refund").val("Yard located").change();  // Change refund status

const data222 = {
yardName: $("#yardName").val(),
agentName: $("#agentName").val(),
yardRating: $("#yardRating").val(),
phone: $("#phoneYard").val(),
altPhone: $("#altPhoneYard").val(),
ext: $('#ext').val(),
email: $("#emailYard").val(),
street: $("#addressYard").val(),
city: $("#cityYard").val(),
state: $("#stateYard").val(),
zipcode: $("#zipYard").val(),
address: $("#addressYard").val() + " " + $("#cityYard").val() + " " + $("#stateYard").val() + " " + $("#zipYard").val(),
country: $("#countryYard").val(),
partPrice: $("#partPrice").val(),
status: "Yard located",
shippingDetails: `${$("#ownShipping").val() ? `Own shipping: ${$("#ownShipping").val()}` : ""} ${$("#yardShipping").val() ? `Yard shipping: ${$("#yardShipping").val()}` : ""}`.trim(),
// shippingDetails: $("#ownShipping").val() ? `Own shipping: ${$("#ownShipping").val()}` : `Yard shipping: ${$("#yardShipping").val()}`,
others: $("#others").val(),
faxNo: $('#faxNoYard').val(),
expShipDate: $("#expShipDate").val(),
warranty: $("#warr").val(),
stockNo: $("#stockNo").val(),
};

fetch(`https://www.spotops360.com/orders/${orderNo}/additionalInfo?firstname=${firstName}`, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(data222),
})
.then((response) => {
if (!response.ok) {
throw new Error("Network response was not ok");
}
return response.json();
})
.then((data) => {
console.log("Yard info added:", data);
addYardButton(data.additionalInfo.length, `Yard ${data.additionalInfo.length}`);
updateOrderHistory(data.orderHistory);
fetchAndUpdateYardInfo();
})
.catch((error) => {
console.error("Error:", error);
});

// Commented out to prevent immediate page reload after the click event
window.location.reload();
});






async function fetchYardInfo(token) {
const response = await axios.get("https://www.spotops360.com/yardInfo", {
headers: { Authorization: `Bearer ${token}` },
});

if (response.status !== 200) {
throw new Error("Failed to fetch yard information");
}

const data = response.data;

let maxYards = 0;
data.forEach((item) => {
if (item.additionalInfo.length > maxYards) {
maxYards = item.additionalInfo.length;
}
});

const tableHeader = $("#tableHeader");
for (let i = 1; i <= maxYards; i++) {
tableHeader.append(`<th scope="col">Yard ${i}</th>`);
}

const yardInfoTable = $("#yardInfoTable");
yardInfoTable.empty();
data.forEach((item) => {
let yardInfoHtml = "";
for (let i = 0; i < maxYards; i++) {
const yardClass =
item.additionalInfo[i]?.paymentStatus === "Card charged"
? "highlight-red"
: "";
yardInfoHtml += `<td class="${yardClass}">${
item.additionalInfo[i]?.yardName || ""
}: ${item.additionalInfo[i]?.status || ""}</td>`;
}

yardInfoTable.append(
`<tr>
<td>${item.orderNo}</td>
<td>${item.customerName}</td>
${yardInfoHtml}
</tr>`
);
});
}

$("input[name='shippingMethod']").on("change", function () {
if ($(this).val() === "Own shipping") {
$("#ownShippingInput").show();
$("#yardShippingInput").hide();
} else if ($(this).val() === "yard_shipping") {
$("#yardShippingInput").show();
$("#ownShippingInput").hide();
}
});
$("input[name='returnValue']").on("change", function () {
console.log("our/cust clicked");
if ($(this).val() === "Our shipping") {
$("#ourShippingInput").show();
$("#customerShippingInput").hide();
} else if ($(this).val() === "Customer shipping") {
$("#customerShippingInput").show();
$("#ourShippingInput").hide();
}
});


//   var yardData;
//   fetch(`https://www.spotops360.com/orders/${orderNo}`)
// .then((response) => response.json())
// .then((data) => {
// if (!data || !data.additionalInfo || !data.additionalInfo[yardIndex - 1]) {
// // If no data is found in orders, check in cancelledOrders
// console.log("Order not found in orders, checking in cancelledOrders...");
// return fetch(`https://www.spotops360.com/cancelledOrders/${orderNo}`)
// .then((response) => response.json())
// .then((data) => {
// if (!data.additionalInfo || !data.additionalInfo[yardIndex - 1]) {
// throw new Error("Yard data not found in cancelledOrders.");
// }
// return data;  // Return the data from cancelledOrders
// });
// } else {
// return data;  // Return the data from orders
// }
// })
// .then((data) => {
//  yardData = data.additionalInfo[yardIndex - 1];
// console.log("yardData", yardData);
// })
// .catch((error) => {
// console.error("Error fetching yard data:", error);
// alert("Error fetching yard data. Please try again.");
// });
// // const yardData = data.additionalInfo[yardIndex - 1];
// if(yardData.poSentDate){
//   $("#editYardInfo").prop("disabled", true).css("filter", "blur(2px)");
// }else{
//   $("#saveEsc").prop("disabled", false) .css("filter", "none");
// }
$("#refund").on("change", function () {
const refundStatus = $(this).val();
console.log("yardStatus",refundStatus);
if (refundStatus === "Part shipped") {
$("#divTrackingEdit").show();
$(".partDeliveredEmail").hide();
$("#sendEmailButton").show();
$("#voidLabel").hide();
$("#notesContainer").show();
$("#cardCharged").hide();
$("#escalation").hide();
$("#sendPOContainer").hide();
} else if (refundStatus === "PO cancelled") {
$("#escalation").hide();
$("#divTrackingEdit").hide();
$("#sendEmailButton").hide();
$("#notesContainer").show();
$("#cardCharged").hide();
$("#sendPOContainer").hide();
$(".partDeliveredEmail").hide();
} else if (refundStatus === "Escalation") {
$("#escalation").show();
$("#divTrackingEdit").hide();
$("#sendEmailButton").hide();
$("#notesContainer").show();
$("#cardCharged").hide();
$("#sendPOContainer").hide();
$(".partDeliveredEmail").hide();
} else if (refundStatus === "Label created") {
$("#escalation").hide();    
$("#divTrackingEdit").show();
$("#sendEmailButton").hide();
$("#notesContainer").show();
$("#cardCharged").hide();
$("#voidLabel").show();
$("#sendPOContainer").hide();
$(".partDeliveredEmail").hide();
} else if (refundStatus === "Part delivered") {
$("#notesContainer").show();
$("#escalation").hide();
$("#divTrackingEdit").hide();
$("#cardCharged").hide();
$("#sendPOContainer").hide();
$(".partDeliveredEmail").show();
}
else if (refundStatus === "Collect refund") {
$("#notesContainer").show();
$("#escalation").hide();
$("#divTrackingEdit").hide();
$("#cardCharged").hide();
$(".partDeliveredEmail").hide();
}
else if (refundStatus === "Yard PO Sent") {
  $("#sendPOContainer").show();
$("#escalation").hide();
$("#divTrackingEdit").hide();
$(".partDeliveredEmail").hide();
} else if (refundStatus === "Yard located") {
$("#divTrackingEdit").hide();
$(".partDeliveredEmail").hide();
} else {
$("#divTrackingEdit").hide();
$("#sendEmailButton").hide();
$("#notesContainer").hide();
}
});



$(".paymentStatus").on("change", function () {
const paymentStatus = $(this).val();
if (
paymentStatus === "Card charged" ||
paymentStatus === "Refund collected"
) {
$("#paymentOptions").show();
} else {
$("#paymentOptions").hide();
}
});

$("#paymentYesNo").on("change", function () {
const paymentYesNo = $(this).val();
const paymentStatus = $(".paymentStatus").val();
if (paymentYesNo === "Yes") {
if (paymentStatus === "Card charged") {
$("#payment").val("Card charged");
} else if (paymentStatus === "Refund collected") {
$("#payment").val("Refund collected");
}
} else {
$("#payment").val("");
}
});
$("#shipperNameEdit").on("change", function () {
const selectedValue = $(this).val();

if (selectedValue === "Others") {
// Show the input field for "Others"
$("#otherShipperInput").show();
} else {
// Hide the input field for "Others" when another option is selected
$("#otherShipperInput").hide();
}
});
$("#sendEmailButton").on("click", function () {
$("#sendEmailButton, #editYardInfo").prop("disabled", true).css("filter", "blur(2px)");
const trackingNo = $("#trackingNoEdit").val();
const eta = $("#etaEdit").val();
var shipperName = $("#shipperNameEdit").val();
if (shipperName === "Others") {
shipperName = $("#otherShipperInput").val();
}
const link = $("#linkInput").val();
if (trackingNo && eta && shipperName && link) {
const data = {
trackingNo: trackingNo,
eta: eta,
shipperName: shipperName,
link: link,
};

fetch(`https://www.spotops360.com/orders/sendTrackingInfo/${orderNo}`, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(data),
})
.then((response) => response.json())
.then((result) => {
alert("Tracking details sent to the customer");
$("#editYardInfo")
.prop("disabled", false) 
.css("filter", "none"); 
console.log("Success:", result);
})
.catch((error) => {
console.error("Error:", error);
});
} else {
alert("Please fill in all the tracking information fields.");
$("#editYardInfo,#sendEmailButton").prop("disabled", false).css("filter", "none"); 
}
});
// part delivery email
$("#partDeliveredEmail").on("click", function () {
$("#partDeliveredEmail, #editYardInfo").prop("disabled", true).css("filter", "blur(2px)");
const trackingNo = $("#trackingNoEdit").val();
var shipperName = $("#shipperNameEdit").val();
if (shipperName === "Others") {
shipperName = $("#otherShipperInput").val();
}
const link = $("#linkInput").val();
const data = {
trackingNo: trackingNo,
shipperName: shipperName,
firstName: firstName,
link:link,
yardIndex:yardIndex,
};

fetch(`https://www.spotops360.com/orders/sendDeliveryEmail/${orderNo}`, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(data),
})
.then((response) => response.json())
.then((result) => {
alert("Delivery email sent to the customer");
$("#editYardInfo")
.prop("disabled", false) 
.css("filter", "none"); 
console.log("Success:", result);
})
.catch((error) => {
console.error("Error:", error);
});

});
// send Refund Email to the yard
$("#sendRefundEmailYard").on("click", function () {
$("#sendRefundEmailYard").prop("disabled", true).css("filter", "blur(2px)");
// const refundReason = $("#refundReasonYard").val();
const returnTracking = $("#returnTrackingNo").val();
const refundToCollect = $("#refundToCollect").val();
const refundReason = $("#refundReasonYard").val();

if (!refundToCollect){
  alert("Please enter a valid refund amount to collect.");
  $("#sendRefundEmailYard").prop("disabled", false).css("filter", "none");
  return;
}else if (!refundReason) {
  alert("Please select a refund reason.");
  $("#sendRefundEmailYard").prop("disabled", false).css("filter", "none");
  return;
}
const shipper = $("#customerShipperReturn").val();
// var shipperName = $("#shipperNameEdit").val();
// if (shipperName === "Others") {
// shipperName = $("#otherShipperInput").val();
// }
const yardIndex = $(this).data("yard-index");
const fileInput = document.getElementById("poFilePDF");
const file = fileInput.files[0] || "";
if (!file) {
  alert("Please attach the PO before sending the email.");
  $("#sendRefundEmailYard").prop("disabled", false).css("filter", "none");
  return;
}
console.log("yardddd",selectedYardIndex,yardIndex);
const formData = new FormData();
formData.append("pdfFile", file);
// formData.append("firstName", firstName);
console.log("firstName",firstName);
fetch(`https://www.spotops360.com/orders/sendRefundEmailYard/${orderNo}?yardIndex=${selectedYardIndex}&returnTracking=${returnTracking}&refundToCollect=${refundToCollect}&shipper=${shipper}&refundReason=${refundReason}&firstName=${firstName}`, {
method: "POST",
body: formData,

})
.then((response) => response.json())
.then((result) => {
alert("Refund email sent to the yard");
$("#sendRefundEmailYard")
.prop("disabled", false) 
.css("filter", "none"); 
console.log("Success:", result);
})
.catch((error) => {
console.error("Error:", error);
});


});
// send esc Return email
$("#sendRMAEmail").on("click", function () {
$("#saveEsc").prop("disabled", true).css("filter", "blur(2px)");
var escProcess = $("#escProcess").val();
var retShippingMethod = $("#customerShippingMethodReturn").val() || "";
var retETA = $("#custretPartETA").val() || "";
var repShippingMethod = $("#customerShippingMethodReplacement").val() || "";
var retAddress = $('#shipToReturnAdd').val();
var retAddressReplacement = $('#shipToRepAdd').val();
var reimburesementValue = $("#reimAmount").val();
var partsFromDropdown = $("#partsFromDropdown").val();
console.log("add",retAddress);
console.log("shippingMethod",escProcess,"return",retShippingMethod,"replacement",repShippingMethod);
const yardIndex = $(this).data("yard-index");
const fileInput = document.getElementById("pdfFile");
const file = fileInput.files[0] || "";

//   if (!file) {
//     alert("Please select a PDF file before sending the email.");
//     $("#saveEsc").prop("disabled", false).css("filter", "none");
//     return;
//   }

const formData = new FormData();
formData.append("pdfFile", file);
// for trackingInfo
const data = {
trackingNo: $("#yardTrackingNumber").val(),
eta: $("#yardTrackingETA").val(),
shipperName: $("#yardShipper").val(),
link: $("#yardTrackingLink").val(),
};
console.log("RMA return",yardIndex)
if(escProcess === "Return" && retShippingMethod === "Customer shipping"){
fetch(`https://www.spotops360.com/orders/sendReturnEmailCustomerShipping/${orderNo}?yardIndex=${yardIndex}&retAddress=${retAddress}`, {
method: "POST",
headers: {
"Content-Type": "application/json",
}
})
.then((response) => response.json())
.then((result) => {
alert("RMA(Return)_Customer-shipping email has been sent to the customer");
$("#saveEsc").prop("disabled", false) .css("filter", "none"); 
console.log("Success:", result);
})
.catch((error) => {
console.error("Error:", error);
});
}
else if(escProcess === "Replacement" && repShippingMethod === "Customer shipping" && partsFromDropdown == "Part from Customer"){
fetch(`https://www.spotops360.com/orders/sendReplaceEmailCustomerShipping/${orderNo}?yardIndex=${yardIndex}&retAddressReplacement=${retAddressReplacement}`, {
method: "POST",
headers: {
"Content-Type": "application/json",
}
})
.then((response) => response.json())
.then((result) => {
alert("RMA(Replacement)Customer shipping email has been sent to the customer");
$("#saveEsc").prop("disabled", false) .css("filter", "none"); 
console.log("Success:", result);
})
.catch((error) => {
console.error("Error:", error);
});
}
else if (escProcess === "Replacement" && (repShippingMethod === "Own shipping" || repShippingMethod === "Yard shipping") && partsFromDropdown == "Part from Customer") {
fetch(`https://www.spotops360.com/orders/sendReplaceEmailOwn_Yard/${orderNo}?yardIndex=${yardIndex}`, {
method: "POST",
body: formData, 
})
.then((response) => response.json())
.then((result) => {
alert("RMA(Replacement)_Own/Yard-shipping email with PDF has been sent to the customer");
$("#saveEsc").prop("disabled", false).css("filter", "none");
console.log("Success:", result);
})
.catch((error) => {
console.error("Error:", error);
});
}
else if (escProcess === "Replacement" && partsFromDropdown == "Part from Yard") {
fetch(`https://www.spotops360.com/orders/sendTrackingInfo/${orderNo}`, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(data),
})
.then((response) => response.json())
.then((result) => {
alert("Tracking details sent to the customer");
$("#saveEsc").prop("disabled", false) .css("filter", "none"); 
$("#editYardInfo")
.prop("disabled", false) 
.css("filter", "none"); 
console.log("Success:", result);
})
.catch((error) => {
console.error("Error:", error);
});
}
else if (escProcess === "Return" && (retShippingMethod === "Own shipping" || retShippingMethod === "Yard shipping")) {
fetch(`https://www.spotops360.com/orders/sendReturnEmailOwn_Yard/${orderNo}?yardIndex=${yardIndex}&retAddress=${retAddress}`, {
method: "POST",
body: formData, // Send FormData directly
})
.then((response) => response.json())
.then((result) => {
alert("RMA(Return)_Own/Yard-shipping email with PDF has been sent to the customer");
$("#saveEsc").prop("disabled", false).css("filter", "none");
console.log("Success:", result);
})
.catch((error) => {
console.error("Error:", error);
});
}
else if(escProcess === "Reimbursement"){
fetch(`https://www.spotops360.com/orders/sendReimburseEmail/${orderNo}?yardIndex=${yardIndex}&reimburesementValue=${reimburesementValue}`, {
method: "POST",
headers: {
"Content-Type": "application/json",
}
})
.then((response) => response.json())
.then((result) => {
alert("Reimbursement email has been sent to the customer");
$("#saveEsc").prop("disabled", false) .css("filter", "none"); 
console.log("Success:", result);
})
.catch((error) => {
console.error("Error:", error);
});
}
else{
alert("Return email cannot be sent without tracking info");
}
});

$("#yardInfoContainer").on("click", ".edit-yard-details", function () {
console.log("edit yard details");
// $(".mainDiv").addClass("blur");
$("body").append('<div class="modal-overlay"></div>');
$("body").addClass("modal-active");
yardIndex = $(this).data("yard-index");

fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
if (!data || !data.additionalInfo || !data.additionalInfo[yardIndex - 1]) {
// If no data is found in orders, check in cancelledOrders
console.log("Order not found in orders, checking in cancelledOrders...");
return fetch(`https://www.spotops360.com/cancelledOrders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
if (!data.additionalInfo || !data.additionalInfo[yardIndex - 1]) {
throw new Error("Yard data not found in cancelledOrders.");
}
return data;  // Return the data from cancelledOrders
});
} else {
return data;  // Return the data from orders
}
})
.then((data) => {
const yardData = data.additionalInfo[yardIndex - 1];
console.log("yardData", yardData);

// Set form fields with the yard data
$("#editYardName").val(yardData.yardName);
$("#editAddress").val(yardData.street);
$("#editYardRating").val(yardData.yardRating);
$("#editCity").val(yardData.city);
$("#editState").val(yardData.state);
$("#editZip").val(yardData.zipcode);
$("#editPhone").val(yardData.phone);
$("#editAltPhone").val(yardData.altPhone);
$("#editEmail").val(yardData.email);
$("#editAgentName").val(yardData.agentName);
$("#editCountry").val(yardData.country);
$("#editPartPrice").val(yardData.partPrice);
$("#editOthers").val(yardData.others);
$("#editStockNo").val(yardData.stockNo);
$("#editPaymentStatus").val(yardData.paymentStatus);
$("#editrefundAmount").val(yardData.refundedAmount);
$("#editFax").val(yardData.faxNo);
$('#editWarr').val(yardData.warranty);

const shippingDetails = yardData.shippingDetails;
console.log("shippingDetails:", shippingDetails);
if (shippingDetails.includes("Own shipping")) {
const ownShippingValue = shippingDetails.split(":")[1].trim(); 
console.log("own ship", ownShippingValue);
$("#editOwnShipping").val(ownShippingValue);
$("#editYardShipping").val('');  
} else if (shippingDetails.includes("Yard shipping")) {
const yardShippingValue = shippingDetails.split(":")[1].trim();
console.log("yard ship", yardShippingValue);
$("#editYardShipping").val(yardShippingValue);
$("#editOwnShipping").val('');  
}

// Set other fields as needed
$("#refund").val(yardData.status);
$("#paymentStatusSelect").val(yardData.paymentStatus);

if (yardData.paymentStatus === "Refund collected") {
$("#refundedAmountContainer").show();
$("#refundedAmount").val(yardData.refundedAmount);
} else {
$("#refundedAmountContainer").hide();
}

$("#esc").val(yardData.escalationCause);
$("#escProcess").val(yardData.escalationProcess);

if (yardData.status === "Escalation") {
$("#escalation").show();
} else {
$("#escalation").hide();
}

$("#editYardDetailsModal").modal("show");
$("#saveYardDetails").data("yard-index", yardIndex);
})
.catch((error) => {
console.error("Error fetching yard data:", error);
alert("Error fetching yard data. Please try again.");
});
});

$("#saveYardDetails").on("click", function () {
$('#editYardDetailsModal').hide();
$(".mainDiv").removeClass("blur");
yardIndex = $(this).data("yard-index");
let shippingDetails = "";
if ($("#editOwnShipping").val()) {
shippingDetails = `Own shipping: ${$("#editOwnShipping").val()}`;
} else if ($("#editYardShipping").val()) {
shippingDetails = `Yard shipping: ${$("#editYardShipping").val()}`;
}
const updatedData = { 
yardName: $("#editYardName").val(),
agentName: $("#editAgentName").val(),
yardRating: $("#editYardRating").val(),
phone: $("#editPhone").val(),
editAlt: $("#editAltPhone").val(),
address: $("#editAddress").val(),
ext: $("#editExt").val(),
email: $("#editEmail").val(),
country: $("#editCountry").val(),
city: $("#editCity").val(),
state: $("#editState").val(),
street: $("#editAddress").val(),
zipcode: $("#editZip").val(),
partPrice: $("#editPartPrice").val(),
others: $("#editOthers").val(),
warranty: $("#editWarr").val(),
faxNo: $("#editFax").val(),
shippingDetails: shippingDetails,
stockNo: $("#editStockNo").val(),
paymentStatus: $("#editPaymentStatus").val(),
refundedAmount: $("#editrefundAmount").val(),
escalationCause: $("#esc").val(),
escalationProcess: $("#escProcess").val(),
};
fetch(`https://www.spotops360.com/orders/${orderNo}/editYardDetails/${yardIndex}?firstName=${firstName}`, {
method: "PUT",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(updatedData),
})
.then((response) => response.json())
.then((data) => {
if (data) {
alert("Yard details have been updated");
window.location.reload();
$("#editYardDetailsModal").modal("hide");
$(".mainDiv").removeClass("blur");
updateOrderHistory(data.orderHistory);
showYardDetails(yardIndex);
fetchAndUpdateYardInfo();
}
})
.catch((error) => {
console.error("Error:", error);
});
});


$("input[name='editShippingMethod']").on("change", function () {
if ($(this).val() === "Own shipping") {
$("#editOwnShippingInput").show();
$("#editYardShippingInput").hide();
} else {
$("#editYardShippingInput").show();
$("#editOwnShippingInput").hide();
}
});
$("#paymentStatusSelect").on("change", function () {
if ($(this).val() === "Refund collected") {
$("#refundedAmountContainer").show();
} else {
$("#refundedAmountContainer").hide();
}
});


// for yard Comments
const field = document.querySelector("textarea");
const backUp = field.getAttribute("placeholder");
const btn = document.querySelector(".btn");
const clear = document.getElementById("clear");
const submit = document.querySelector("#submit");
const comments = document.getElementById("comment-box");
// const orderNo = new URLSearchParams(window.location.search).get(
//   "orderNo"
// );

$("#submit").on("click", function (event) {
event.preventDefault();
const content = $("#noteInput").val();
const yardIndex = $("#submit").data("yard-index") - 1;
const firstName = localStorage.getItem("firstName");
console.log("yardNoteDate",currentDateTime);
if (content.length > 0) {
axios
.post(
`https://www.spotops360.com/orders/${orderNo}/notes/${yardIndex}`,
{
note: content,
author: firstName,
timestamp: currentDateTime,
}
)
.then((response) => {
$("#noteInput").val("");
console.log("yindex",yardIndex);
fetchAndDisplayNotes(yardIndex + 1);
})
.catch((error) => {
console.error("Error:", error);
alert(`Failed to update notes: ${error.message}`);
});
}
});
function displayComments(notes) {
const commentBox = $("#comment-box");
commentBox.empty();

if (Array.isArray(notes)) {
console.log("notes", notes);
notes.forEach((note) => {
const noteHtml = `<p>${note}</p>`;
console.log("htmlNote", noteHtml);
commentBox.append(noteHtml);
console.log("comment", commentBox);
});
} else {
console.error("Expected notes to be an array, but got:", notes);
}
}
// yard comments till here
$("#editYardPopup").on("show.bs.modal", function () {
const yardIndex = $("#yardIndexEdit").val();
console.log("dyIndex",yardIndex);
fetchAndDisplayNotes(yardIndex - 1);
});


// const comments_arr = [];

// const display_comments = () => {
//   let list = "<ul>";
//   comments_arr.forEach((comment) => {
//     list += `<li>${comment}</li>`;
//   });
//   list += "</ul>";
//   comments.innerHTML = list;
// };



$("#closeBtnEditYard, .close").on("click", function () {
$("#editYardPopup").hide();
});

// support comment atsrts here
const commentSupport = document.getElementById("comment-boxSupport");
function handleSubmit(event) {
const content1 = $("#commentInput").val();
const wordCount = content1.trim().split(/\s+/).length; // Count words
const maxWords = 200;

if (content1.length > maxWords) {
alert(`Your comment exceeds the maximum limit of ${maxWords} characters.`);
event.preventDefault(); // Prevent the event from succeeding
return;
}

console.log("orderNo for submitting s comments", orderNo);
window.location.reload();
event.preventDefault();

const yardIndex1 = $("#submit").data("yard-index") - 1;
const firstName1 = localStorage.getItem("firstName");
console.log("commentDate", currentDateTime);

if (content1.length > 0) {
// First try to update in the orders collection
axios
.put(`https://www.spotops360.com/orders/${orderNo}/supportNotes`, {
note: content1,
author: firstName1,
timestamp: currentDateTime,
})
.then((response) => {
alert("Support comments updated successfully.");
$("#commentInput").val("");
fetchSupportComment(yardIndex1);
})
.catch((error) => {
// If order is not found in orders, search in cancelledOrders
if (error.response && error.response.status === 404) {
console.log(
"Order not found in orders, checking in cancelledOrders..."
);
axios
.put(
`https://www.spotops360.com/cancelledOrders/${orderNo}/supportNotes`,
{
note: content1,
author: firstName1,
timestamp: commentNteDate,
}
)
.then((response) => {
alert(
"Support comments updated successfully in cancelledOrders."
);
$("#commentInput").val("");
fetchSupportComment(yardIndex1);
})
.catch((error) => {
console.error("Error:", error);
alert(
`Failed to update notes in cancelledOrders: ${error.message}`
);
});
} else {
console.error("Error:", error);
alert(`Failed to update notes: ${error.message}`);
}
});
}
}

// Attach click event to the submit button
$("#submitComments").on("click", function (event) {
handleSubmit(event);
});

// Trigger the event when Enter is pressed
$("#commentInput").on("keypress", function (event) {
if (event.key === "Enter") {
handleSubmit(event);
}
});

async function fetchSupportComment(orderNo) {
console.log("Fetching and displaying support comments...",orderNo);

// First, check in the main orders collection
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
// If the order is not found or doesn't contain supportNotes, check in cancelledOrders
if (!data || !data.supportNotes) {
console.log('Order not found, checking in cancelled orders...');
return fetch(`https://www.spotops360.com/cancelledOrders/${orderNo}`);
} else {
return Promise.resolve({ status: 200, json: () => data });
}
})
.then((response) => {
if (response.status === 404) {
console.log("Order or cancelled order not found.");
return;
}
return response.json();
})
.then((data) => {
if (!data || !data.supportNotes) {
console.log("No support notes found for this order.");
return;
}

// Display the support notes
console.log("Fetched support notes:", data.supportNotes);
displaySnotes(data.supportNotes);
})
.catch((error) => {
console.error("Error fetching support notes:", error);
});
}


function displaySnotes(notes) {
const commentBox1 = $("#comment-boxSupport");
commentBox1.empty();

if (Array.isArray(notes)) {
console.log("support notes", notes);
notes.forEach((note) => {
const noteHtml = `<p>${note}</p>`;
commentBox1.append(`<h2 style="text-align: center;font-weight: 600;"></h2>`);
commentBox1.append(noteHtml);
});
} else {
console.error("Expected notes to be an array, but got:", notes);
}
}


fetchSupportComment(orderNo);
//support comments till here

$('.toggle-btn').on('click', function () {
$('.sidebar').toggleClass('hide');
});
$('.close-btn').on('click', function () {
$('.sidebar').addClass('hide');
});

$(".chevron-icon, .nav-link").on("click", function (event) {
event.stopPropagation();
const submenu = $(this).closest(".nav-item").find(".submenu");
submenu.toggle();
$(this).find("i").toggleClass("fa-chevron-right fa-chevron-down");
$(this).closest(".nav-link").toggleClass("selected");
});


const currentPath = window.location.pathname;
$(".nav-link").each(function () {
if (currentPath.includes($(this).attr("href"))) {
$(this).addClass("active");
}
});
const activeLink = $(".nav-link.active")[0];
if (activeLink) {
  activeLink.scrollIntoView({ behavior: "smooth", block: "center" });
}
$('#crossBtnEditYard').on('click', function(e) {
$('#editYardPopup').hide();
$(".modal-overlay").remove();
// $(".mainDiv").removeClass("blur");
$("body").removeClass("modal-active");
});
$('#crossEsc').on('click', function(e) {
$('#escRMA').hide();
$(".modal-overlay").remove();
$("body").removeClass("modal-active");
});
$('#closeDispute').on('click', function(e) {
$("#disputeDiv").fadeOut();
$(".modal-overlay").remove();
$("body").removeClass("modal-active");
window.location.reload();
});
$('#closeRefund').on('click', function(e) {
$("#custRefund").fadeOut();
$(".modal-overlay").remove();
$("body").removeClass("modal-active");
window.location.reload();

});
$('#closeCancelled').on('click', function(e) {
$("#cancellingOrder").fadeOut();
$(".modal-overlay").remove();
$("body").removeClass("modal-active");
window.location.reload();

});
$('#EYdetails') .on('click', function(e){
$(".modal-overlay").remove();
$("body").removeClass("modal-active");
$('#editYardDetailsModal').hide();
window.location.reload();
})     
$("#logoutLink").click(function () {
window.localStorage.clear();
window.location.href = "login_signup.html";
});


// for descBar start hre
fetchOrderDetails(orderNo)
.then((order) => {
// console.log("descBar orderNo",order,orderNo) ; 
const year = order.year;
const make = order.make;
const model = order.model;
const description = order.desc;
const partRequired = order.pReq;

// Format the part description
const partDescriptionText = `Part Required: ${partRequired} - For ${year} ${make} ${model} - Desc: ${description}`;

// Insert the part description into the appropriate div
$(".partDescFY.descBar").text(partDescriptionText);
})
.catch((error) => {
console.error("Error fetching order details:", error);
});
// Function to fetch order details
function fetchOrderDetails(orderNo) {
return fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
// If the order is not found, check in cancelledOrders collection
if (!data || Object.keys(data).length === 0) {
console.log('Order not found, checking in cancelled orders...');
return fetch(`https://www.spotops360.com/cancelledOrders/${orderNo}`)
.then((cancelledResponse) => cancelledResponse.json())
.then((cancelledData) => {
if (!cancelledData || Object.keys(cancelledData).length === 0) {
console.log('No order details found in cancelled orders.');
return null; // No data found in either collection
}
return cancelledData; // Return data from cancelledOrders
});
}
return data; // Return data from orders collection if found
})
.catch((error) => {
console.error('Error fetching order details:', error);
return null; // Handle errors and return null if needed
});
}

// Show dropdown on hover
$(".navbar .nav-item").hover(function () {
$(this).find(".dropdown-menu").stop(true, true).delay(100).fadeIn(200);
}, function () {
$(this).find(".dropdown-menu").stop(true, true).delay(100).fadeOut(200);
});

// Toggle dropdown on click
$(".nav-item .nav-link").on("click", function (event) {
event.preventDefault(); // Prevent the default behavior
const submenu = $(this).next(".dropdown-menu");
if (submenu.length) {
submenu.stop(true, true).slideToggle(200);
}
});

// Also toggle on chevron icon click
$(".chevron-icon").on("click", function (event) {
event.preventDefault
event.stopPropagation();
const submenu = $(this).closest(".nav-item").find(".dropdown-menu");
submenu.stop(true, true).slideToggle(200);
});
// function to add yards only when status is PO cancelled or Escalation
function updateAddYardButton() {
let canAddNewYard = true;
$("#yardInfoContainer .yard-btn").each(function () {
let yardIndex = $(this).data("yard-index");

fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
const yardData = data.additionalInfo[yardIndex - 1];
if (yardData.status !== "PO Cancelled" && yardData.status !== "Escalation") {
canAddNewYard = false;
}

// Disable the button if conditions are not met
if (!canAddNewYard) {
$(".add-yard-btn").prop('disabled', true);
} else {
$(".add-yard-btn").prop('disabled', false);
}
});
});
}
$("#okButton").click(function () {
window.location.reload();
});

// script for escalation button on yards

$('#escProcess').on('change', function () {
const selectedValue = $(this).val();
console.log("esc process",selectedValue);
if (selectedValue === 'Replacement') {
// Show both columns when 'Replacement' is selected
$('#replacementColumns').fadeIn();
$('#partFromCustomer').fadeIn();
$('#partFromYard').fadeIn();
$('#partFromCustomerReturn').fadeOut();
$('#reimbursement').fadeOut();
$("#attachDocument,#sendRMAEmail").show();
$('.partsFromDropdown').show();
} else if (selectedValue === 'Return') {
$('#partFromCustomerReturn').fadeIn();
$('#replacementColumns').fadeOut();
$('#partFromCustomer').fadeOut();
$('#partFromYard').fadeOut();
$('#reimbursement').fadeOut();
$("#attachDocument,#sendRMAEmail").show();
$('.partsFromDropdown').hide();
} else if (selectedValue === "Reimbursement"){
$('#reimbursement').fadeIn();   
$('#partFromCustomerReturn').fadeOut();
$('#replacementColumns').fadeOut();
$('#partFromCustomer').fadeOut();
$('#partFromYard').fadeOut();
$("#attachDocument,#sendRMAEmail").show();
$('.partsFromDropdown').hide();
}
else {
// Hide both columns for other cases like 'Junk'
$('#replacementColumns').fadeOut();
$('#reimbursement').fadeOut();
$('#partFromCustomer').fadeOut();
$('#partFromYard').fadeOut();
$('#partFromCustomerReturn').fadeOut();
$("#attachDocument,#sendRMAEmail").hide();
$('.partsFromDropdown').hide();
}
});

const selectedValue = $(this).val();
console.log("slectedValue",selectedValue);
if (selectedValue === 'Replacement') {
$('#replacementColumns').fadeIn(); 
} else {
$('#replacementColumns').fadeOut(); 
}
// in replacement, if the reason is junked disable all other inpu=t boxes
$('#custReason').on('change', function () {
if ($(this).val() === 'Junked') {
// Disable all inputs and selects inside #replacementColumns, except #custReason
$('#replacementColumns')
.find('input, select')
.not('#custReaso,#yardShippingStatus,#yardShippingMethod,#yardShipper,#yardTrackingNumber,#yardownShipping,#yardTrackingETA,#yardTrackingLink')
.prop('disabled', true);
} else {
// Enable all inputs and selects inside #replacementColumns when other values are selected
$('#replacementColumns')
.find('input, select')
.prop('disabled', false);
}
});
// Show or hide "Own Shipping" input for Part from Customer
$('#customerShippingMethodReplacement').on('change', function () {
if ($(this).val() === 'Own shipping') {
$('#replacementOwnShip').fadeIn();
} else {
$('#replacementOwnShip').fadeOut();
}
});
$('#customerShippingMethodReturn').on('change', function () {
if ($(this).val() === 'Own shipping') {
$('#customerShippingValueReturn').fadeIn();
} else {
$('#customerShippingValueReturn').fadeOut();
}
});
// Show or hide "Own Shipping" input for Part from Yard
$('#yardShippingMethod').on('change', function () {
if ($(this).val() === 'Own shipping') {
$('#yardShippingValue').fadeIn();
} else {
$('#yardShippingValue').fadeOut();
}
});
// Show the Drive link input when the attach button is clicked
$('#attachDocument').on('click', function()  {
console.log("clicked attachDocument")
document.getElementById('driveLinkContainer').style.display = 'block';
});
$('#attachRefundReceipt').on('click', function()  {
console.log("clicked attachRefundReceipt")
document.getElementById('driveLinkRefund').style.display = 'block';
});
$('#attachPO').on('click', function()  {
console.log("clicked attach PO")
document.getElementById('driveLinkContainerPO').style.display = 'block';
});
// to void label
$("#voidLabel").on("click", function () {
console.log("inside void label",yardIndex);
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
if (!data || !data.additionalInfo || !data.additionalInfo[yardIndex - 1]) {
console.error("Yard data not found.");
return;
}
const yardData = data.additionalInfo[yardIndex - 1];
yardData.status = "Yard PO Sent";

// Ensure history arrays exist or initialize them
yardData.trackingHistory = yardData.trackingHistory || [];
yardData.etaHistory = yardData.etaHistory || [];
yardData.shipperNameHistory = yardData.shipperNameHistory || [];
yardData.trackingLinkHistory = yardData.trackingLinkHistory || [];

// Push current data to the respective history arrays
if (yardData.trackingNo) yardData.trackingHistory.push(yardData.trackingNo);
if (yardData.eta) yardData.etaHistory.push(yardData.eta);
if (yardData.shipperName) yardData.shipperNameHistory.push(yardData.shipperName);
if (yardData.trackingLink) yardData.trackingLinkHistory.push(yardData.trackingLink);

// Prepare updated data for backend with cleared fields
const updatedInfo = {
...yardData,
trackingNo: "", 
eta: "", 
shipperName: "", 
trackingLink: "", 
};

// Send the updated data to the backend
fetch(`https://www.spotops360.com/orders/updateYard/${orderNo}/${yardIndex}?firstName=${firstName}`, {
method: "PUT",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${localStorage.getItem("token")}`,
},
body: JSON.stringify(updatedInfo),
})
.then((response) => {
if (response.ok) {
alert("Label voided successfully, and status updated to 'Yard PO Sent'.");
$("#editYardPopup").hide();
window.location.reload();
// $(".mainDiv").removeClass("blur");
$("body").removeClass("modal-active");
$("#divTrackingEdit input, #divTrackingEdit select").val(""); // Reset input fields
$("#divTrackingEdit").show();
} else {
console.error("Failed to update yard info.");
alert("Error updating yard info. Please try again.");
}
})
.catch((error) => {
console.error("Error updating yard info:", error);
alert("An unexpected error occurred. Please try again.");
});
})
.catch((error) => {
console.error("Error fetching yard data:", error);
alert("Error fetching yard data. Please try again.");
});
});
// to void rep part from yard label in escalation
$("#voidLabelRepPartfrYard").on("click", function () {
console.log("inside voidLabelRepPartfrYard label",yardIndex);
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
if (!data || !data.additionalInfo || !data.additionalInfo[yardIndex - 1]) {
console.error("Yard data not found.");
return;
}
const yardData = data.additionalInfo[yardIndex - 1];
console.log("voidLabelRepPartfrYard",yardData);
// Ensure history arrays exist or initialize them
yardData.escRepTrackingHistoryYard = yardData.escRepTrackingHistoryYard || [];
yardData.escRepETAHistoryYard = yardData.escRepETAHistoryYard || [];
yardData.escRepShipperNameHistoryYard = yardData.escRepShipperNameHistoryYard || [];
yardData.escrepBOLhistoryYard = yardData.escrepBOLhistoryYard || [];
// Push current data to the respective history arrays
if (yardData.yardTrackingNumber) yardData.escRepTrackingHistoryYard.push(yardData.yardTrackingNumber);
if (yardData.yardTrackingETA) yardData.escRepETAHistoryYard.push(yardData.yardTrackingETA);
if (yardData.yardShipper) yardData.escRepShipperNameHistoryYard.push(yardData.yardShipper);
if (yardData.escRepYardTrackingdate) yardData.escrepBOLhistoryYard.push(yardData.escRepYardTrackingdate);
// Prepare updated data for backend with cleared fields
const updatedInfo = {
...yardData,
yardTrackingNumber: "", 
yardTrackingETA: "",
yardShipper: "", 
yardShippingMethod: "",
yardShippingMethod: ""

};
console.log("updated yard data",updatedInfo);
// Send the updated data to the backend
fetch(`https://www.spotops360.com/orders/voidLabelRepYard/${orderNo}/${yardIndex}?firstName=${firstName}`, {
method: "PUT",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${localStorage.getItem("token")}`,
},
body: JSON.stringify(updatedInfo),
})
.then((response) => {
if (response.ok) {
alert("Label voided successfully for part from yard part in replacement.");
$("#editYardPopup").hide();
$(".modal-overlay").remove();
// $(".mainDiv").removeClass("blur");
// $("body").removeClass("modal-active");
$("#partFromYard input, #partFromYard select").val(""); // Reset input fields
// $("#divTrackingEdit").show();
} else {
console.error("Failed to update void.");
alert("Error voiding the label. Please try again.");
}
})
.catch((error) => {
console.error("Error voiding in replacement(part from customer):", error);
alert("An unexpected error occurred. Please try again.");
});
});
});
// to void rep part from customer label in escalation
$("#voidLabelRepPartfrCust").on("click", function () {
console.log("inside voidLabelRepPartfrCust label",yardIndex);
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
if (!data || !data.additionalInfo || !data.additionalInfo[yardIndex - 1]) {
console.error("Yard data not found.");
return;
}
const yardData = data.additionalInfo[yardIndex - 1];
console.log("yardData",yardData);
// Ensure history arrays exist or initialize them
yardData.escRepTrackingHistoryCust = yardData.escRepTrackingHistoryCust || [];
yardData.escRepETAHistoryCust = yardData.escRepETAHistoryCust || [];
yardData.escRepShipperNameHistoryCust = yardData.escRepShipperNameHistoryCust || [];
yardData.escrepBOLhistoryCust = yardData.escrepBOLhistoryCust || [];
// Push current data to the respective history arrays
if (yardData.customerTrackingNumberReplacement) yardData.escRepTrackingHistoryCust.push(yardData.customerTrackingNumberReplacement);
if (yardData.customerETAReplacement) yardData.escRepETAHistoryCust.push(yardData.customerETAReplacement);
if (yardData.customerShipperReplacement) yardData.escRepShipperNameHistoryCust.push(yardData.customerShipperReplacement);
if (yardData.escRepCustTrackingDate) yardData.escrepBOLhistoryCust.push(yardData.escRepCustTrackingDate);
// Prepare updated data for backend with cleared fields
const updatedInfo = {
...yardData,
customerTrackingNumberReplacement: "", 
customerETAReplacement: "", 
customerShipperReplacement: "",
customerShippingMethodReplacement: "", 
};
console.log("updated yard data",updatedInfo);
// Send the updated data to the backend
fetch(`https://www.spotops360.com/orders/voidLabelRepCust/${orderNo}/${yardIndex}?firstName=${firstName}`, {
method: "PUT",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${localStorage.getItem("token")}`,
},
body: JSON.stringify(updatedInfo),
})
.then((response) => {
if (response.ok) {
alert("Label voided successfully for part from customer part in replacement.");
$("#editYardPopup").hide();
// $(".modal-overlay").remove();
// $(".mainDiv").removeClass("blur");
// $("body").removeClass("modal-active");
$("#partFromCustomer input, #partFromCustomer select").val(""); // Reset input fields
// $("#divTrackingEdit").show();
} else {
console.error("Failed to update void.");
alert("Error voiding the label. Please try again.");
}
})
.catch((error) => {
console.error("Error voiding in replacement(part from customer):", error);
alert("An unexpected error occurred. Please try again.");
});
})
});
// to void return part from customer label in escalation
$("#voidLabelReturnPartfrCust").on("click", function () {
console.log("inside voidLabelReturnPartfrCust label",yardIndex);
fetch(`https://www.spotops360.com/orders/${orderNo}`)
.then((response) => response.json())
.then((data) => {
if (!data || !data.additionalInfo || !data.additionalInfo[yardIndex - 1]) {
console.error("Yard data not found.");
return;
}
const yardData = data.additionalInfo[yardIndex - 1];
console.log("yardData",yardData);
yardData.escReturnTrackingHistory = yardData.escReturnTrackingHistory || [];
yardData.escReturnETAHistory = yardData.escReturnETAHistory || [];
yardData.escReturnShipperNameHistory = yardData.escReturnShipperNameHistory || [];
yardData.escReturnBOLhistory = yardData.escReturnBOLhistory || [];
// Push current data to the respective history arrays
if (yardData.returnTrackingCust) yardData.escReturnTrackingHistory.push(yardData.returnTrackingCust);
if (yardData.custretPartETA) yardData.escReturnETAHistory.push(yardData.custretPartETA);
if (yardData.customerShipperReturn) yardData.escReturnShipperNameHistory.push(yardData.customerShipperReturn);
if (yardData.escRetTrackingDate) yardData.escReturnBOLhistory.push(yardData.escRetTrackingDate);
// Prepare updated data for backend with cleared fields
const updatedInfo = {
...yardData,
returnTrackingCust: "", // Clear tracking info
custretPartETA: "", // Clear ETA
escRetTrackingDate:"",
customerShipperReturn:"",
customerShippingMethodReturn: "", // Clear tracking link
};
console.log("updated yard data",updatedInfo);
// Send the updated data to the backend
fetch(`https://www.spotops360.com/orders/voidLabelReturn/${orderNo}/${yardIndex}?firstName=${firstName}`, {
method: "PUT",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${localStorage.getItem("token")}`,
},
body: JSON.stringify(updatedInfo),
})
.then((response) => {
if (response.ok) {
alert("Label voided successfully for part from customer part in return process(escalation).");
$("#editYardPopup").hide();
// $(".modal-overlay").remove();
// $(".mainDiv").removeClass("blur");
// $("body").removeClass("modal-active");
$("#partFromCustomerReturn input, #partFromCustomerReturn select").val(""); // Reset input fields
// $("#divTrackingEdit").show();
} else {
console.error("Failed to update void.");
alert("Error voiding the label. Please try again.");
}
})
.catch((error) => {
console.error("Error voiding in return(part from customer):", error);
alert("An unexpected error occurred. Please try again.");
});
})
});

// for backbutton
// document.getElementById("backButton").addEventListener("click", function () {
//     // Navigate back to the previous page in the history stack
//     console.log("back",window.history.back())
//     window.history.back();
// });
// for dark mode
// Toggle Dark Mode

const dateInput = document.getElementById("deadline");
const placeholderLabel = document.querySelector(".placeholder");

// Add event listener to detect changes
dateInput.addEventListener("change", () => {
  if (dateInput.value) {
    dateInput.style.color = "black"; // Show selected date in black
    document.querySelector(".placeholder").style.display = "none";
  } else {
    
    dateInput.style.color = "white"; // Hide default date format
    placeholderLabel.style.color = "#7e7171";
  }
});

// Initial setup to ensure placeholder behaves correctly
if (!dateInput.value) {
  dateInput.style.color = "white"; // Hide 'dd-mm-yyyy' initially
}
// createTask button to save the details
document.getElementById("createTaskButton").addEventListener("click", async () => {
  const taskName = document.getElementById('taskName').value;
  const deadline = document.getElementById("deadline").value;
  const assignedTo = document.getElementById('assignTo').value;
  const taskDescription = document.getElementById('taskDesc').value;
  const assignedBy = firstName; 
  const taskCreatedDate = currentDateTime; 
  const taskStatus = "New task added";
  const task = {
    taskName,
    orderNo,
    assignedTo,
    assignedBy,
    taskCreatedDate,
    deadline,
    taskDescription,
    taskStatus,
  };
  try {
    const response = await fetch("https://www.spotops360.com/createTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    if (response.ok) {
      const result = await response.json();
      alert("Task created successfully!");
      console.log("Task saved:", result);
    } else {
      const error = await response.json();
      alert("Failed to create task: " + error.message);
    }
    window.location.reload();
  } catch (error) {
    console.error("Error saving task:", error);
    alert("An error occurred while saving the task.");
  }
});
//myTasks display

try {
  // Fetch tasks for the specific orderNo
  const taskGroupRes = await axios.get(`https://www.spotops360.com/fetchTasks?orderNo=${orderNo}`);
  console.log("taskGroup response:", taskGroupRes.data);
  const taskDta = taskGroupRes.data;
  const firstName = localStorage.getItem("firstName");
  if (!firstName) {
    alert("No user found in local storage.");
    return;
  }
  // Filter tasks assigned to the current user
  const myTasks = taskDta.filter(task => task.assignedTo === firstName);
  const myTasksContainer = document.getElementById("myTasks");
  const myTaskTableBody = document.getElementById("task-table-body");
  const allTasksTableBody = document.getElementById("all-task-table-body");
  const allTasksContainer = document.getElementById("allTasks");
  if (myTasks.length > 0) {
    myTaskTableBody.innerHTML = "";
    myTasks.forEach((task,index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${task.taskName}</td>
        <td>${task.taskDescription}</td>
<td class="${isDeadlinePast(task.deadline) ? 'deadline-past' : ''}">
  ${formatDeadline(task.deadline)}
</td>
        <td>${task.assignedBy}</td>
        <td>${task.assignedTo}</td>
<td>
      <input 
        style="margin-left: 36%;" 
        type="checkbox" 
        class="status-checkbox" 
        ${task.taskStatus === 'Completed' ? 'checked' : ''} 
        data-index="${index}" 
        data-order="${orderNo}" 
    </td>
        <td>
          <select data-index="${index}" 
    data-order="${orderNo}" class="assign-to-dropdown">
            <option value="">Assign to</option>
            <option value="April">April</option>
            <option value="David">David</option>
            <option value="Dipshika">Dipshika</option>
            <option value="Erica">Erica</option>
            <option value="John">John</option>
            <option value="Korina">Korina</option>
            <option value="Michael">Michael</option>
            <option value="Richard">Richard</option>
            <option value="Shankar">Shankar</option>
          </select>
        </td>
      `;
      myTaskTableBody.appendChild(row);
    });
    myTasksContainer.style.display = "block";
  } else {
    myTasksContainer.style.display = "none";
  }
  if (taskDta.length > 0) {
    console.log("all Task Data",taskDta);
    allTasksTableBody.innerHTML = "";
    taskDta.forEach((task,index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${task.taskName}</td>
        <td>${task.taskDescription}</td>
<td class="${isDeadlinePast(task.deadline) ? 'deadline-past' : ''}">
  ${formatDeadline(task.deadline)}
</td>
        <td>${task.assignedBy}</td>
        <td>${task.assignedTo}</td>
       <td>
      <input 
        style="margin-left: 36%;" 
        type="checkbox" 
        class="status-checkbox" 
        ${task.taskStatus === 'Completed' ? 'checked' : ''} 
        data-index="${index}" 
        data-order="${orderNo}" 
    </td>
        <td>
          <select data-index="${index}" 
    data-order="${orderNo}" class="assign-to-dropdown">
            <option value="">Assign to</option>
            <option value="April">April</option>
            <option value="David">David</option>
            <option value="Dipshika">Dipshika</option>
            <option value="Erica">Erica</option>
            <option value="John">John</option>
            <option value="Korina">Korina</option>
            <option value="Michael">Michael</option>
            <option value="Richard">Richard</option>
            <option value="Shankar">Shankar</option>
            <option value="Tony">Tony</option>
          </select>
        </td>
      `;

      allTasksTableBody.appendChild(row);
    });
    allTasksContainer.style.display = "block";
  }
} catch (error) {
  console.error("Error fetching tasks:", error);
}

// Helper function to check if the deadline is in the past
function isDeadlinePast(deadline) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  return deadlineDate < now;
}

// Helper function to format the deadline date
function formatDeadline(deadline) {
  const options = { day: "2-digit", month: "short", year: "numeric",hour: "2-digit", minute: "2-digit",hour12: false // Optional: Set to false for 24-hour format, true for 12-hour format
 };
  return new Date(deadline).toLocaleDateString("en-US", options);
}
document.querySelectorAll('.status-checkbox').forEach(checkbox => {
  checkbox.addEventListener('click', function (event) {
    const index = event.target.getAttribute('data-index');
    const isChecked = event.target.checked;
    console.log(`Checkbox clicked at index: ${index}`);
    console.log(`Checkbox is now: ${isChecked ? 'Checked' : 'Unchecked'}`);
    updateTaskStatus(orderNo, index, isChecked ? 'Completed' : 'Processing');
  });
});
document.querySelectorAll('.assign-to-dropdown').forEach(dropdown => {
  dropdown.addEventListener('change', function (event) {
    const index = event.target.getAttribute('data-index');
    const orderNo = event.target.getAttribute('data-order');
    const newAssignedTo = event.target.value;

    if (newAssignedTo) {
      console.log(`Index: ${index}, Order No: ${orderNo}, Assigned To: ${newAssignedTo}`);

      // Example: Call a function to update the backend
      updateTaskAssignedTo(orderNo, index, newAssignedTo);
    }
  });
});


async function updateTaskStatus(orderNo, index, status) {
  try {
    await axios.put(`https://www.spotops360.com/updateTaskStatus`, {
      orderNo,
      index,
      taskStatus: status,
    });
    console.log(`Task at index ${index} updated to ${status}`);
    if(status === "Completed"){
    alert("Task status updated to Completed");
    }else{
      alert(" Task status is pending");
    }
  } catch (error) {
    console.error('Error updating task status:', error);
  }
}
async function updateTaskAssignedTo(orderNo, index, assignedTo) {
  try {
    await axios.put(`https://www.spotops360.com/updateTaskAssignedTo`, {
      orderNo,
      index,
      assignedTo,
    });
    alert(`Task assigned now to ${assignedTo}`)
  } catch (error) {
    console.error("Error updating assignedTo:", error);
  }
}
// notification
const notificationIcon = $("#notificationIcon");
const notificationDropdown = $("#notificationDropdown");
const notificationList = $("#notificationList");
const notificationCountElement = $("#notificationCount");
let unreadCount = 0;
async function fetchNotifications() {
  try {
    const response = await axios.get("https://www.spotops360.com/notifications");
        const notifications = response.data;
 const unreadNotifications = notifications.filter( // Filter unread notifications for the logged-in user
        (notification) => !notification.readBy.includes(firstName)
      );
    unreadCount = unreadNotifications.length;
    updateUnreadCount();
    renderNotifications(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
}
function renderNotifications(notifications) {// Render notifications in the dropdown
  notificationList.empty();
  const role = localStorage.getItem('role');
  const firstName = localStorage.getItem('firstName');
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
    return;
  }
  lastFiveNotifications.forEach((notification) => { // Render the last 5 notifications
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
    const notificationItem = `
      <li style="margin-bottom: 5px; padding: 10px; background-color: ${backgroundColor}; color: black; width: 100%; border: 1px solid black;">
        ${formattedMessage}
      </li>
    `;
    notificationList.append(notificationItem);
  });}
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
// upload pictures to an s3 bucket
$(".floating-icon").on("click", async function () {
  console.log("Floating icon clicked", orderNo);
  $("#orderNoForPictures").val(`Order No: ${orderNo}`);
  document.getElementById("fileUploadModal").style.display = "flex";
  document.getElementById("fileUploadModal").style.textAlign = "center";
  try {
    const response = await axios.get(`https://www.spotops360.com/getImages?orderNo=${orderNo}`);
    console.log("orderImages", response.data); 
    $("#uploadedImagesContainer").empty();
    response.data.forEach((image) => {
      const imgElement = `
        <div style="margin: 5px;">
          <a href="${image.url}" target="_blank">
            <img src="${image.url}" alt="Uploaded Image" style="width: 100px; height: auto; border: 1px solid #ccc; padding: 5px;" />
          </a>
        </div>
      `;
      $("#uploadedImagesContainer").append(imgElement);
    });
  } catch (error) {
    console.error("Error fetching and displaying images:", error);
  }
});
  $("#closeUploadModal").on("click",function(){ 
    document.getElementById("fileUploadModal").style.display = "none";
  })
  $(".uploadPicturesToS3").on("click", async function () {
  const files = document.getElementById("fileInput").files;
  if (!orderNo || files.length === 0) {
    alert("Please provide Order No and select at least one picture.");
    return;
  }
  const formData = new FormData();
  formData.append("orderNo", orderNo);
  Array.from(files).forEach((file) => {
    formData.append("pictures", file);
  });
  try {
    const response = await fetch(`https://www.spotops360.com/uploadToS3?orderNo=${orderNo}`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to upload pictures");
    }
    const data = await response.json();
    console.log("Uploaded Images:", data.uploadedImages);
    const imagesContainer = document.getElementById("uploadedImagesContainer");
    imagesContainer.innerHTML = ""; 
    // Append each uploaded image
    data.uploadedImages.forEach((url) => {
      const imgElement = document.createElement("div");
      imgElement.style.width = "16.66%";  // 100% divided by 6 images per row
      imgElement.style.boxSizing = "border-box";
      imgElement.style.padding = "5px";
      imgElement.innerHTML = `
        <a href="${url}" target="_blank">
          <img src="${url}" alt="Uploaded Image" style="width: 100%; height: auto; border: 1px solid #ccc;" />
        </a>
      `;
      imagesContainer.appendChild(imgElement);
    });
    alert("Pictures uploaded successfully!");
    document.getElementById("fileUploadModal").style.display = "none";
    window.location.reload();
  } catch (error) {
    console.error("Error uploading pictures:", error);
    alert("An error occurred. Please try again.");
  }
});
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
function displayUploadedFiles(uploadedFiles, orderNo) {// Function to Display Uploaded Files as Clickable Links
  const uploadedFilesList = document.getElementById("uploadedFilesList");
  uploadedFilesList.innerHTML = ""; // Clear previous list
  uploadedFiles.forEach((fileUrl) => {
    const listItem = document.createElement("li");
    const fileName = fileUrl.split("/").pop(); // Extract filename from URL
    listItem.innerHTML = `<a href="${fileUrl}" target="_blank">${fileName}</a>`;
    uploadedFilesList.appendChild(listItem);
  });
  document.getElementById("uploadedFilesContainer").style.display = "block";
}
$("#cancelShipment").on("click", function () {
  console.log("orderNo",orderNo);
  fetch(`https://www.spotops360.com/orders/${orderNo}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data || !data.additionalInfo) {
        console.error("Order data or additionalInfo not found.");
        return;
      }
      const yardIndex = $(this).data("yard-index");
      console.log("yardIndex",yardIndex);
      const yardData = data.additionalInfo[yardIndex - 1];
      if (!yardData) {
        console.error("Yard data not found.");
        return;
      }
      yardData.trackingNo[0] = ""; 
      yardData.status = "Yard PO Sent";
      const trNo = $("#trackingNoEdit").val();
      console.log("trNo",trNo);
      const updatedOrder = {
        ...data,
        additionalInfo: [...data.additionalInfo],
        trackingNo: trNo,
        firstName: firstName,
        yardIndex: yardIndex
      };
      console.log("dataa",updatedOrder);
      fetch(`https://www.spotops360.com/orders/${orderNo}/cancelShipment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedOrder), 
      })
        .then((response) => response.json())
        .then((responseData) => {
          alert("Shipment Cancelled");
          $("#editYardPopup").hide();
          window.location.reload();
          console.log("Order updated successfully", responseData);
        })
        .catch((error) => {
          console.error("Error updating order:", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching order data:", error);
    });
});
document.getElementById('sendPOBtn').addEventListener('click', async function () {
    document.getElementById('loadingOverlay').style.display = 'block';
    document.getElementById('refund').value = "Yard PO Sent";
  const i = yardIndex - 1;
  const order = commonOrderRes;
  const today = new Date().toLocaleDateString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const yard = order.additionalInfo[i];
  const shippingDetails = yard.shippingDetails || '';
  let shipping = 0;
let shippingValue = "-";
if (shippingDetails.includes("Own shipping")) {
  shippingValue = "Own Shipping (Auto Parts Group Corp)";
} else if (shippingDetails.includes("Yard shipping")) {
  const match = shippingDetails.match(/Yard shipping:\s*(\d+)/);
  if (match) {
    const parsed = parseFloat(match[1]);
    shipping = parsed;
    shippingValue = parsed === 0 ? "Included" : `$${parsed}`;
  }}
  const partPrice = parseFloat(yard.partPrice);
  const grandTotal = partPrice + shipping;
  const poTemplate = document.getElementById('poTemplate');
  const clone = poTemplate.cloneNode(true);
  clone.id = '';
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '-9999px';
  clone.style.zIndex = '9999';
  clone.style.width = '794px';  
  clone.style.height = '1123px'; 
  clone.style.padding = '20px';
  clone.style.boxSizing = 'border-box';
  clone.style.background = 'white';
clone.style.fontFamily = 'Arial, Helvetica, sans-serif';
  document.body.appendChild(clone);
  clone.querySelector('#po-no').textContent = order.orderNo;
  clone.querySelector('#po-date').textContent = today;
  clone.querySelector('#yard-info').innerHTML = `
    ${yard.yardName}<br>${yard.street}, ${yard.city}, ${yard.state}, ${yard.zipcode}
  `;
  clone.querySelector('#ship-to').innerHTML = `
  ${order.attention || `${order.fName} ${order.lName}`}<br>${order.sAddressStreet}, ${order.sAddressCity}, ${order.sAddressState}, ${order.sAddressZip}`;
  clone.querySelector('#part-year').textContent = order.year;
  clone.querySelector('#part-make').textContent = order.make;
  clone.querySelector('#part-model').textContent = order.model;
  clone.querySelector('#part-name').textContent = order.pReq;
  clone.querySelector('#part-desc').textContent = order.desc;
  clone.querySelector('#part-vin').textContent = order.vin || '';
  clone.querySelector('#part-no').textContent = order.partNo || '';
  clone.querySelector('#stock-no').textContent = yard.stockNo || '';
  clone.querySelector('#warranty').textContent = `${yard.warranty} days`;
  clone.querySelector('#amount').textContent = `$${partPrice}`;
  clone.querySelector('#subtotal').textContent = `$${partPrice}`;
  clone.querySelector('#shipping').textContent = shippingValue ? `${shippingValue}` : '-';
  clone.querySelector('#grand-total').innerHTML = `<strong>$${grandTotal}</strong>`;
await new Promise(resolve => requestAnimationFrame(resolve));
await new Promise(resolve => setTimeout(resolve, 500)); 
const canvas = await html2canvas(clone, {
  scale: 1.5,
  useCORS: true,
  backgroundColor: "#ffffff", 
});
console.log(canvas.width, canvas.height);
const imgData = canvas.toDataURL("image/jpeg", 0.8);
const { jsPDF } = window.jspdf;
const pdf = new jsPDF({
   unit: 'mm',
  format: 'a4',
  orientation: 'portrait'
});
const pdfWidth = 210;
const pdfHeight = 297; 
pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297); 
const pdfBlob = pdf.output('blob');
const fileName = `${order.orderNo}-PO.pdf`;
const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
const formData = new FormData();
formData.append('pdfFile', pdfFile);
  console.log("PDF blob size:", pdfBlob.size,"File size:", pdfFile.size);
  document.body.removeChild(clone);
for (let [k, v] of formData.entries()) console.log(k, v);
  const images = document.getElementById('poImages').files;
  for (let j = 0; j < images.length; j++) {
    formData.append('images', images[j]);
  }
  formData.append('orderNo', order.orderNo);
  formData.append('year', order.year);
  formData.append('make', order.make);
  formData.append('model', order.model);
  formData.append('pReq', order.pReq);
  formData.append('yardIndex', yardIndex); 
  formData.append('shippingDetails', shippingDetails.includes('Yard shipping') ? `Yard Shipping: ${shipping}` : 'Own Shipping (Auto Parts Group Corp)');
  formData.append('desc', order.desc);
var userName  = localStorage.getItem("firstName")
  fetch(`https://www.spotops360.com/sendPOEmailYard/${order.orderNo}?firstName=${userName}`, {
    method: 'POST',
    body: formData,
  })
     .then(async res => {
      console.log("Response status:", res.status);

      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        console.warn("Failed to parse JSON:", err);
      }

      if (res.ok) {
        if (data.message?.includes("No yard email provided")) {
          alert("Yard email address is missing. PO was not sent.");
        } else {
          alert("PO sent successfully!");
        }
      } else {
        alert("Failed to send PO.");
      }
    })
    .catch(err => {
      console.error('Error sending PO:', err);
      alert('An error occurred.Check if the email is valid and try again.');
    })
    .finally(() => {
      document.getElementById('loadingOverlay').style.display = 'none';
      window.location.reload()
    });
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
// ---- Yard Notes (stacked) ----
const yardNotesState = {
  activeYardIndex: null,          // 0-based
  notesByYard: []                 // Array<Array<string>>
};

async function loadYardNotes(orderNo) {
  try {
    let res = await fetch(`https://www.spotops360.com/orders/${orderNo}`);
    let data = await res.json();
    if (!data || !data.additionalInfo) {
      const r2 = await fetch(`https://www.spotops360.com/cancelledOrders/${orderNo}`);
      if (!r2.ok) { $("#yardNotesSection").hide(); return; }
      data = await r2.json();
    }
    if (!Array.isArray(data?.additionalInfo)) { $("#yardNotesSection").hide(); return; }

    yardNotesState.notesByYard = data.additionalInfo.map(y =>
      Array.isArray(y?.notes)
        ? y.notes.filter(n => String(n ?? "").trim() !== "")
        : []
    );

    const $btnWrap = $("#yardNotesButtons").empty();
    yardNotesState.notesByYard.forEach((notes, i) => {
      if (notes.length > 0) {
        $btnWrap.append(
          `<button type="button" class="btn btn-sm btn-info m-1 yard-notes-btn" data-idx="${i}">Yard ${i + 1}</button>`
        );
      }
    });

    if ($btnWrap.children().length === 0) { $("#yardNotesSection").hide(); return; }

    $("#yardNotesSection").show();
    $("#yardNotesViewer").show();

    const firstIdx = Number($("#yardNotesButtons .yard-notes-btn").first().data("idx"));
    setActiveYardForNotes(firstIdx);
  } catch (e) {
    console.error("Error loading yard notes:", e);
    $("#yardNotesSection").hide();
  }
}

function setActiveYardForNotes(idx) {
  yardNotesState.activeYardIndex = idx;

  $("#yardNotesButtons .yard-notes-btn")
    .removeClass("btn-dark active").addClass("btn-info");
  $(`#yardNotesButtons .yard-notes-btn[data-idx="${idx}"]`)
    .removeClass("btn-info").addClass("btn-dark active");

  renderAllNotesForActiveYard();
}

function renderAllNotesForActiveYard() {
  const yardIdx = yardNotesState.activeYardIndex;
  const notes = yardNotesState.notesByYard[yardIdx] || [];

  $("#yardNotesHeader").text(`Yard ${yardIdx + 1} • ${notes.length} note${notes.length !== 1 ? "s" : ""}`);

  const $list = $("#yardNotesList").empty();
  if (notes.length === 0) {
    $list.append(`<div class="text-muted"><em>No notes for this yard.</em></div>`);
    return;
  }

  notes.forEach((n, i) => {
    // Each note as its own card-ish block
    $list.append(`
      <div class="border rounded p-2">
        <div style="white-space:pre-wrap;">${typeof n === "string" ? n : JSON.stringify(n)}</div>
      </div>
    `);
  });
}

// Button click: switch yard
$("#yardNotesButtons").on("click", ".yard-notes-btn", function () {
  setActiveYardForNotes(Number($(this).data("idx")));
});
loadYardNotes(orderNo);
});


