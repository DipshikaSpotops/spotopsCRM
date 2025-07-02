$(document).ready(async function () {
  let allOrders = [];
  const rowsPerPage = 25;
  let currentPage = 1;
  const userId = localStorage.getItem("userId");
  const firstName = localStorage.getItem("firstName");

  if (!firstName) {
    window.location.href = "login_signup.html";
    return;
  }
  $("#user-name").text(firstName);

  // Token logic
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

  // Set Dallas month default
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

  // Load data on page load
  await loadOrders(defaultMonth);

  // Filter button
  $("#filterButton").click(async function () {
    const selected = $("#monthYearPicker").val();
    if (selected) await loadOrders(selected);
  });

  // Search input
  $("#searchInput").on("keyup", function () {
    const value = $(this).val().toLowerCase();
    const filtered = allOrders.filter(order =>
      order.orderNo?.toLowerCase().includes(value) ||
      order.cancellationReason?.toLowerCase().includes(value) ||
      order.customerName?.toLowerCase().includes(value)
    );
    $("#showTotalOrders").text(`Total Orders - ${filtered.length}`);
    renderTableRows(1, filtered);
    createPaginationControls(Math.ceil(filtered.length / rowsPerPage), filtered);
  });

  // Search input for quick nav
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

  // Core data loader
  async function loadOrders(monthYear) {
    const [year, monthNum] = monthYear.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[parseInt(monthNum, 10) - 1];
    const [cancelled, refunded] = await Promise.all([
      fetchOrders("cancelled-by-date", month, year),
      fetchOrders("refunded-by-date", month, year)
    ]);
    const combined = [...cancelled, ...refunded];
    const unique = {};

    combined.forEach(order => {
      const o = unique[order.orderNo] ??= {
        orderNo: order.orderNo,
        orderDate: order.orderDate,
        cancellationReason: order.cancellationReason,
        custRefAmount: order.custRefAmount,
        custRefundDate: order.custRefundDate,
        cancelledDate: order.cancelledDate,
        customerName: order.customerName,
        orderHistory: order.orderHistory || [],
      };
      order.orderHistory?.forEach(entry => {
        if (entry.includes("cancelled") && !o.cancelledDate) o.cancelledDate = extractDate(entry);
        if (entry.includes("refunded") && !o.custRefundDate) o.custRefundDate = extractDate(entry);
      });
    });

    allOrders = Object.values(unique);
    $("#showTotalOrders").text(`Total Orders - ${allOrders.length}`);
    renderTableRows(1);
    createPaginationControls(Math.ceil(allOrders.length / rowsPerPage));
  }

  async function fetchOrders(type, month, year) {
    try {
      const res = await axios.get(`https://www.spotops360.com/orders/${type}`, {
        params: { month, year },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.data;
    } catch (err) {
      console.error(`Error fetching ${type}`, err);
      return [];
    }
  }

  function extractDate(text) {
    const match = text.match(/on (\\d{1,2}) (\\w+), (\\d{4})/);
    return match ? `${match[1]} ${match[2]} ${match[3]}` : "-";
  }

  function formatDate(str) {
    if (!str) return "-";
    const d = new Date(str);
    return isNaN(d) ? "-" : d.toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
  }

  function renderTableRows(page, orders = allOrders) {
    const start = (page - 1) * rowsPerPage;
    const data = orders.slice(start, start + rowsPerPage);
    const tbody = $("#infoTable").empty();

    if (!data.length) {
      tbody.append(`<tr><td colspan="7">No orders found.</td></tr>`);
      return;
    }

    data.forEach(order => {
      tbody.append(`
        <tr>
          <td>${order.orderNo}</td>
          <td>${formatDate(order.orderDate)}</td>
          <td>${formatDate(order.cancelledDate)}</td>
          <td>${formatDate(order.custRefundDate)}</td>
          <td>${order.cancellationReason || "-"}</td>
          <td>$${order.custRefAmount || 0}</td>
          <td>
            <button class="btn btn-success btn-sm process-btn" data-id="${order.orderNo}">View</button>
          </td>
        </tr>
      `);
    });
  }

  function createPaginationControls(totalPages, orders = allOrders) {
    const container = $("#pagination-controls").empty();
    if (totalPages <= 1) return;

    container.append(`<button class="previousNext" id="prevPage">Previous</button>`);
    for (let i = 1; i <= totalPages; i++) {
      container.append(`<button class="pageNos btn ${i === currentPage ? 'active-page' : ''} page-btn" data-page="${i}">${i}</button>`);
    }
    container.append(`<button class="previousNext" id="nextPage">Next</button>`);

    container.off("click").on("click", ".page-btn", function () {
      currentPage = parseInt($(this).data("page"));
      renderTableRows(currentPage, orders);
    });

    container.on("click", "#prevPage", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTableRows(currentPage, orders);
      }
    });

    container.on("click", "#nextPage", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTableRows(currentPage, orders);
      }
    });
  }

  // Table row click highlights
  $(document).on("click", "#infoTable tr", function () {
    $("#infoTable tr").removeClass("selected");
    $(this).addClass("selected");
  });

  // View button click
  $("#infoTable").on("click", ".process-btn", function () {
    const id = $(this).data("id");
    window.location.href = `form.html?orderNo=${id}&process=true`;
  });
});
