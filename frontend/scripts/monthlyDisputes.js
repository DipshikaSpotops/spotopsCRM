$(document).ready(async function () {
    let allDisputes = [];
  const rowsPerPage = 25;
  let currentPage = 1;
  const userId = localStorage.getItem("userId");
  const firstName = localStorage.getItem("firstName");

  if (!firstName) {
    window.location.href = "login_signup.html";
    return;
  }
  $("#user-name").text(firstName);

  let token = localStorage.getItem("token");
  if (!token) {
    try {
      const response = await axios.get(`https://www.spotops360.com/auth/token/${userId}`);
      if (response.status === 200) {
        token = response.data.token;
        localStorage.setItem("token", token);
      }
    } catch (err) {
      console.error("Token fetch failed", err);
    }
  }

  const dallasDate = new Date(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date()).replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$1-$2")
  );
  const defaultMonth = dallasDate.toISOString().slice(0, 7);
  $("#monthYearPicker").val(defaultMonth);

  await loadDisputes(defaultMonth);

  $("#filterButton").click(async function () {
    const selected = $("#monthYearPicker").val();
    if (selected) await loadDisputes(selected);
  });

  $("#searchInput").on("keyup", function () {
    const value = $(this).val().toLowerCase();
    const filtered = allDisputes.filter(order =>
      (order.orderNo || "").toLowerCase().includes(value) ||
      (order.customerName || "").toLowerCase().includes(value) ||
      (order.disputeReason || "").toLowerCase().includes(value)
    );
    renderTableRows(1, filtered);
    createPaginationControls(Math.ceil(filtered.length / rowsPerPage), filtered);
    $("#showTotalOrders").text(`Total Disputes - ${filtered.length}`);
  });

  async function loadDisputes(monthYear) {
    const [year, monthNum] = monthYear.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[parseInt(monthNum, 10) - 1];
    console.log("month",month,year)
    try {
      const res = await axios.get(`https://www.spotops360.com/orders/disputes-by-date`, {
        params: { month, year },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      console.log("res",res.data);
      if (!res.data) {
  console.warn("No dispute data received:", res);
  return;
}


const responseData = Array.isArray(res.data) ? res.data : [];

const disputes = responseData.map(order => ({
  orderNo: order.orderNo,
  orderDate: order.orderDate,
  customerName: order.customerName,
  disputeDate: extractDisputeDate(order.orderHistory || []),
  disputeReason: order.disputeReason || "-",
  custRefAmount: parseFloat(order.custRefAmount || 0) || 0,
  orderHistory: order.orderHistory || []
}));


      // Filter only disputes from selected month
      allDisputes = disputes.filter(order => {
        if (!order.disputeDate) return false;
        const date = new Date(order.disputeDate);
        return date.getFullYear() === parseInt(year) && (date.getMonth() + 1) === parseInt(monthNum);
      });

      $("#showTotalOrders").text(`Total Disputes - ${allDisputes.length}`);
      renderTableRows(1, allDisputes);
      createPaginationControls(Math.ceil(allDisputes.length / rowsPerPage), allDisputes);

    } catch (err) {
      console.error("Error loading disputes", err);
    }
  }

  function extractDisputeDate(historyArray) {
    for (const entry of historyArray) {
      if (entry.toLowerCase().includes("disputed")) {
        const match = entry.match(/on (\d{1,2}) (\w+), (\d{4})/);
        if (match) {
          return `${match[1]} ${match[2]} ${match[3]}`;
        }
      }
    }
    return null;
  }

  function formatDate(str) {
    if (!str) return "-";
    const d = new Date(str);
    return isNaN(d) ? "-" : d.toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
  }

  function renderTableRows(page, data = allDisputes) {
    const start = (page - 1) * rowsPerPage;
    const subset = data.slice(start, start + rowsPerPage);
    const tbody = $("#infoTable").empty();

    if (!subset.length) {
      tbody.append(`<tr><td colspan="7">No disputes found.</td></tr>`);
      return;
    }

    subset.forEach(order => {
      tbody.append(`
        <tr>
          <td>${order.orderNo}</td>
          <td>${formatDate(order.orderDate)}</td>
          <td>${order.customerName || "-"}</td>
          <td>${formatDate(order.disputeDate)}</td>
          <td>${order.disputeReason}</td>
          <td>$${order.custRefAmount.toFixed(2)}</td>
          <td>
            <button class="btn btn-primary btn-sm view-order" data-id="${order.orderNo}">View</button>
          </td>
        </tr>
      `);
    });
  }

  function createPaginationControls(totalPages, data = allDisputes) {
    const container = $("#pagination-controls").empty();

    if (totalPages > 1) {
      container.append(`<button class="previousNext" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>←</button>`);
      container.append(`<span class="page-info">Page ${currentPage} of ${totalPages}</span>`);
      container.append(`<button class="previousNext" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>→</button>`);
    }

    container.off("click").on("click", "#prevPage", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTableRows(currentPage, data);
        createPaginationControls(totalPages, data);
      }
    }).on("click", "#nextPage", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTableRows(currentPage, data);
        createPaginationControls(totalPages, data);
      }
    });
  }

  // Quick order nav
  const searchQuick = document.getElementById("searchInputForOrderNo");
  const resultDiv = document.getElementById("searchResult");
  if (searchQuick) {
    searchQuick.addEventListener("input", function () {
      const val = this.value.trim();
      resultDiv.innerHTML = val
        ? `<button class="btn btn-primary btn-sm" id="viewOrderBtn">View Order</button>`
        : "";
      if (val) {
        document.getElementById("viewOrderBtn").onclick = () => {
          window.location.href = `form.html?orderNo=${encodeURIComponent(val)}&process=true`;
        };
      }
    });
  }

  // View button
  $("#infoTable").on("click", ".view-order", function () {
    const id = $(this).data("id");
    window.location.href = `form.html?orderNo=${id}&process=true`;
  });
    $("#filterButton").click(async function () {
    const selected = $("#monthYearPicker").val();
    console.log("Filter clicked - selected:", selected); 
    if (selected) {
      await loadDisputes(selected); 
    }
  });

    // sorting 
let currentSortColumn = '';
let sortAsc = true;

$("#infoTableHeader th.sortable").on("click", function () {
  const column = $(this).data("column");
  if (!column) return;

  if (currentSortColumn === column) {
    sortAsc = !sortAsc;
  } else {
    currentSortColumn = column;
    sortAsc = true;
  }

  // Sort data
  allDisputes.sort((a, b) => {
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
  createPaginationControls(Math.ceil(allDisputes.length / rowsPerPage));

  // Reset all arrows
  $("#infoTableHeader .sort-icons .asc, .sort-icons .desc").removeClass("active");

  // Highlight the active arrow
  const arrowToActivate = sortAsc ? ".asc" : ".desc";
  $(this).find(arrowToActivate).addClass("active");
});
});