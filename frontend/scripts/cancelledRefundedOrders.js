
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
    if (!uniqueOrdersMap[orderNo]) {
      uniqueOrdersMap[orderNo] = {
        orderNo,
        orderDate: order.orderDate,
        cancelledDate: null,
        refundedDate: null,
        orderHistory: order.orderHistory || [],
      };
    }

    order.orderHistory?.forEach(entry => {
      if (entry.includes("cancelled") && !uniqueOrdersMap[orderNo].cancelledDate) {
        uniqueOrdersMap[orderNo].cancelledDate = extractDate(entry);
      }
      if (entry.includes("refunded") && !uniqueOrdersMap[orderNo].refundedDate) {
        uniqueOrdersMap[orderNo].refundedDate = extractDate(entry);
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
    const row = `
      <tr>
        <td>${order.orderNo}</td>
        <td>${formatDate(order.orderDate)}</td>
        <td>${order.cancelledDate || "-"}</td>
        <td>${order.custRefundDate || "-"}</td>
        <td>${order.custRefAmount || "-"}</td>
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
