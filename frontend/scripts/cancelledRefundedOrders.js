$(document).ready(async function () {
var firstname = localStorage.getItem("firstName");
if (firstName) {
$("#user-name").text(firstName);
}
if (!firstName) {
window.location.href = "login_signup.html";
}
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

document.addEventListener("DOMContentLoaded", async function () {
  const monthPicker = document.getElementById("monthYearPicker");
  const dallasDate = new Date(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date())
      .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$1-$2") 
  );

  const defaultMonth = dallasDate.toISOString().slice(0, 7); 
  monthPicker.value = defaultMonth;
  const [year, month] = defaultMonth.split("-");
  const monthShort = new Date(`${month}-01-2000`).toLocaleString("default", { month: "short" });

  const [cancelledOrders, refundedOrders] = await Promise.all([
    fetchOrdersByType("cancelled-by-date", monthShort, year),
    fetchOrdersByType("refunded-by-date", monthShort, year),
  ]);
  const combined = [...cancelledOrders, ...refundedOrders];
  const uniqueOrdersMap = {};
  combined.forEach(order => {
    const orderNo = order.orderNo;
    console.log("custRefundDate",order.custRefundDate);
    if (!uniqueOrdersMap[orderNo]) {
      uniqueOrdersMap[orderNo] = {
        orderNo,
        orderDate: order.orderDate,
        cancelledDate: order.cancelledDate,
        custRefundDate: order.custRefundDate,
        cancellationReason: order.cancellationReason,
        custRefAmount: order.custRefAmount,
        orderHistory: order.orderHistory || [],
      };
    }

    order.orderHistory?.forEach(entry => {
      if (entry.includes("cancelled") && !uniqueOrdersMap[orderNo].cancelledDate) {
        uniqueOrdersMap[orderNo].cancelledDate = extractDate(entry);
      }
      if (entry.includes("refunded") && !uniqueOrdersMap[orderNo].custRefundDate) {
        uniqueOrdersMap[orderNo].custRefundDate = extractDate(entry);
      }
    });
  });

  renderTable(Object.values(uniqueOrdersMap));
});

function extractDate(text) {
  const match = text.match(/on (\d{1,2}) (\w+), (\d{4})/);
  if (!match) return "-";
  return `${match[1]} ${match[2]} ${match[3]}`;
}

async function fetchOrdersByType(type, month, year) {
  try {
    const response = await axios.get(`https://www.spotops360.com/orders/${type}`, {
      params: { month, year },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${type} orders:`, error);
    return [];
  }
}

function renderTable(orders) {
  const tbody = document.getElementById("infoTable");
  tbody.innerHTML = "";

  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center">No cancelled or refunded orders for selected month.</td></tr>`;
    return;
  }

  orders.forEach(order => {
    const actions = `
            <button class="btn btn-success btn-sm process-btn" data-id="${order.orderNo}" ${order.orderStatus === "Placed" || order.orderStatus === "Customer approved" ? "disabled" : ""}>View</button>`;
    const row = `
      <tr>
        <td>${order.orderNo}</td>
        <td>${formatDate(order.orderDate)}</td>
        <td>${formatDate(order.cancelledDate)}</td>
        <td>${formatDate(order.custRefundDate)}</td>
        <td>${order.cancellationReason || "-"}</td>
        <td>$${order.custRefAmount || 0}</td>
        <td>${actions}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", row);
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return isNaN(date) ? "-" : date.toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  });
}
$("#searchInput").on("keyup", function () {
  const value = $(this).val().toLowerCase();

  const filteredOrders = allOrders.filter(order => {
    return (
      (order.orderDate && order.orderDate.toLowerCase().includes(value)) ||
      (order.orderNo && order.orderNo.toLowerCase().includes(value)) ||
      (order.salesAgent && order.salesAgent.toLowerCase().includes(value)) ||
      (order.cancellationReason && order.cancellationReason.toLowerCase().includes(value)) ||
      (order.customerName && order.customerName.toLowerCase().includes(value)) ||
      ((order.pReq || order.partName) && (order.pReq || order.partName).toLowerCase().includes(value)) ||
      (order.additionalInfo.length > 0 && order.additionalInfo[order.additionalInfo.length - 1].yardName && order.additionalInfo[order.additionalInfo.length - 1].yardName.toLowerCase().includes(value)) ||
      (order.orderStatus && order.orderStatus.toLowerCase().includes(value)) ||
      (order.additionalInfo && order.additionalInfo.some(info =>
        (info.trackingNo && String(info.trackingNo).toLowerCase().includes(value))
      )) ||
      (order.additionalInfo.length > 0 && order.additionalInfo[0].escTicked && order.additionalInfo[0].escTicked.toLowerCase().includes(value)) ||
      (order.email && order.email.toLowerCase().includes(value))
    );
  });

  // Update the Total Orders count
  document.getElementById("showTotalOrders").innerHTML = `Total Orders - ${filteredOrders.length}`;

  if (filteredOrders.length > 0 || value === "") {
    renderTableRows(1, filteredOrders);
    createPaginationControls(Math.ceil(filteredOrders.length / rowsPerPage), filteredOrders);
  } else {
    $("#infoTable").empty();
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