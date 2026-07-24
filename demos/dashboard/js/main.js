(function () {
  "use strict";

  const orders = [
    { id: "#10482", customer: "Maya Rodriguez", email: "maya@email.com", items: 2, total: 102.5, status: "pending", date: "May 24, 2026" },
    { id: "#10481", customer: "James Chen", email: "j.chen@email.com", items: 1, total: 45.0, status: "processing", date: "May 24, 2026" },
    { id: "#10480", customer: "Priya Kapoor", email: "priya.k@email.com", items: 3, total: 156.75, status: "shipped", date: "May 23, 2026" },
    { id: "#10479", customer: "Alex Turner", email: "alex.t@email.com", items: 1, total: 68.0, status: "delivered", date: "May 23, 2026" },
    { id: "#10478", customer: "Sam Wilson", email: "sam.w@email.com", items: 4, total: 189.25, status: "pending", date: "May 22, 2026" },
    { id: "#10477", customer: "Jordan Lee", email: "jlee@email.com", items: 2, total: 77.5, status: "delivered", date: "May 22, 2026" },
    { id: "#10476", customer: "Taylor Brooks", email: "t.brooks@email.com", items: 1, total: 34.0, status: "shipped", date: "May 21, 2026" },
    { id: "#10475", customer: "Casey Morgan", email: "casey.m@email.com", items: 2, total: 93.0, status: "processing", date: "May 21, 2026" },
  ];

  const customers = [
    { name: "Maya Rodriguez", email: "maya@email.com", orders: 8, spent: 642, avatar: "MR" },
    { name: "James Chen", email: "j.chen@email.com", orders: 5, spent: 310, avatar: "JC" },
    { name: "Priya Kapoor", email: "priya.k@email.com", orders: 12, spent: 1180, avatar: "PK" },
    { name: "Alex Turner", email: "alex.t@email.com", orders: 3, spent: 195, avatar: "AT" },
    { name: "Sam Wilson", email: "sam.w@email.com", orders: 6, spent: 520, avatar: "SW" },
    { name: "Jordan Lee", email: "jlee@email.com", orders: 4, spent: 288, avatar: "JL" },
  ];

  const products = [
    { name: "Stoneware Mug Set", sku: "HG-MUG-01", stock: 48, price: 34, status: "in stock" },
    { name: "Linen Throw Blanket", sku: "HG-THR-02", stock: 12, price: 68, status: "low stock" },
    { name: "Walnut Cutting Board", sku: "HG-KIT-03", stock: 24, price: 45, status: "in stock" },
    { name: "Soy Candle — Cedar", sku: "HG-GFT-04", stock: 0, price: 22, status: "out of stock" },
    { name: "Ceramic Planter", sku: "HG-HOM-05", stock: 31, price: 28, status: "in stock" },
    { name: "Pour-Over Kit", sku: "HG-KIT-06", stock: 8, price: 52, status: "low stock" },
  ];

  const notifications = [
    { text: "New order #10482 from Maya Rodriguez", time: "2 min ago" },
    { text: "Low stock: Linen Throw Blanket (12 left)", time: "1 hr ago" },
    { text: "Payment received — $156.75", time: "3 hrs ago" },
    { text: "Customer review: 5 stars on Mug Set", time: "Yesterday" },
  ];

  const revenueWeek = [4200, 5100, 4800, 6200, 5900, 7100, 6800];
  const trafficWeek = [820, 940, 880, 1100, 1050, 1280, 1190];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  let orderFilter = "all";
  let currentView = "dashboard";

  const els = {
    statsGrid: document.getElementById("statsGrid"),
    revenueChart: document.getElementById("revenueChart"),
    trafficChart: document.getElementById("trafficChart"),
    donutLegend: document.getElementById("donutLegend"),
    donutCenter: document.getElementById("donutCenter"),
    statusDonut: document.getElementById("statusDonut"),
    recentOrdersTable: document.querySelector("#recentOrdersTable tbody"),
    ordersTable: document.querySelector("#ordersTable tbody"),
    customersGrid: document.getElementById("customersGrid"),
    productsTable: document.querySelector("#productsTable tbody"),
    analyticsStats: document.getElementById("analyticsStats"),
    notifList: document.getElementById("notifList"),
    notifPanel: document.getElementById("notifPanel"),
    ordersBadge: document.getElementById("ordersBadge"),
    toast: document.getElementById("toast"),
    sidebar: document.getElementById("sidebar"),
    sidebarOverlay: document.getElementById("sidebarOverlay"),
    chartMeta: document.getElementById("chartMeta"),
  };

  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function statusClass(s) {
    return "badge badge--" + s;
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      els.toast.classList.remove("show");
    }, 2800);
  }

  function renderStats() {
    const pending = orders.filter(function (o) {
      return o.status === "pending";
    }).length;
    const revenue = orders.reduce(function (s, o) {
      return s + o.total;
    }, 0);

    const stats = [
      { label: "Total revenue", value: money(revenue * 42), change: "+12.4%", up: true, icon: "💰" },
      { label: "Orders", value: String(orders.length + 104), change: "+8.2%", up: true, icon: "📦" },
      { label: "Customers", value: String(customers.length + 248), change: "+3.1%", up: true, icon: "👥" },
      { label: "Pending", value: String(pending), change: pending + " need action", up: false, icon: "⏳" },
    ];

    els.statsGrid.innerHTML = stats
      .map(function (s) {
        return (
          '<article class="stat-card">' +
          '<span class="stat-card__icon">' +
          s.icon +
          "</span>" +
          '<p class="stat-card__label">' +
          s.label +
          "</p>" +
          '<p class="stat-card__value">' +
          s.value +
          "</p>" +
          '<span class="stat-card__change' +
          (s.up ? " is-up" : "") +
          '">' +
          s.change +
          "</span></article>"
        );
      })
      .join("");

    els.ordersBadge.textContent = pending;
  }

  function renderBarChart(container, data, color) {
    const max = Math.max.apply(null, data);
    container.innerHTML = data
      .map(function (val, i) {
        const h = Math.round((val / max) * 100);
        return (
          '<div class="chart-bar" style="--h:' +
          h +
          "%;--delay:" +
          i * 0.06 +
          's" title="' +
          days[i] +
          ": " +
          val +
          '"><span class="chart-bar__fill" style="background:' +
          color +
          '"></span><span class="chart-bar__label">' +
          days[i] +
          "</span></div>"
        );
      })
      .join("");
  }

  function renderDonut() {
    const counts = { pending: 0, processing: 0, shipped: 0, delivered: 0 };
    orders.forEach(function (o) {
      counts[o.status]++;
    });
    const total = orders.length;
    const colors = {
      pending: "#fbbf24",
      processing: "#60a5fa",
      shipped: "#a78bfa",
      delivered: "#34d399",
    };

    let gradientParts = [];
    let acc = 0;
    Object.keys(counts).forEach(function (key) {
      const pct = (counts[key] / total) * 100;
      gradientParts.push(colors[key] + " " + acc + "% " + (acc + pct) + "%");
      acc += pct;
    });

    els.statusDonut.style.background =
      "conic-gradient(" + gradientParts.join(", ") + ")";
    els.donutCenter.textContent = total;

    els.donutLegend.innerHTML = Object.keys(counts)
      .map(function (key) {
        return (
          '<li><span class="dot" style="background:' +
          colors[key] +
          '"></span>' +
          key.charAt(0).toUpperCase() +
          key.slice(1) +
          " <strong>" +
          counts[key] +
          "</strong></li>"
        );
      })
      .join("");
  }

  function orderRow(o, actions) {
    const actionCell = actions
      ? '<td><select class="status-select" data-order="' +
        o.id +
        '">' +
        ["pending", "processing", "shipped", "delivered"]
          .map(function (s) {
            return (
              '<option value="' +
              s +
              '"' +
              (o.status === s ? " selected" : "") +
              ">" +
              s.charAt(0).toUpperCase() +
              s.slice(1) +
              "</option>"
            );
          })
          .join("") +
        "</select></td>"
      : "";

    return (
      "<tr>" +
      "<td><strong>" +
      o.id +
      "</strong></td>" +
      "<td>" +
      o.customer +
      "</td>" +
      (actions ? "<td>" + o.items + "</td>" : "") +
      "<td>" +
      money(o.total) +
      "</td>" +
      '<td><span class="' +
      statusClass(o.status) +
      '">' +
      o.status +
      "</span></td>" +
      (actions ? actionCell : "<td>" + o.date + "</td>") +
      "</tr>"
    );
  }

  function renderRecentOrders() {
    els.recentOrdersTable.innerHTML = orders
      .slice(0, 5)
      .map(function (o) {
        return orderRow(o, false);
      })
      .join("");
  }

  function renderOrdersTable() {
    let list = orders;
    if (orderFilter !== "all") {
      list = orders.filter(function (o) {
        return o.status === orderFilter;
      });
    }
    els.ordersTable.innerHTML = list
      .map(function (o) {
        return orderRow(o, true);
      })
      .join("");
  }

  function renderCustomers() {
    els.customersGrid.innerHTML = customers
      .map(function (c) {
        return (
          '<article class="customer-card">' +
          '<span class="customer-card__avatar">' +
          c.avatar +
          "</span>" +
          "<h3>" +
          c.name +
          "</h3>" +
          "<p>" +
          c.email +
          "</p>" +
          '<div class="customer-card__meta">' +
          "<span>" +
          c.orders +
          " orders</span>" +
          "<strong>" +
          money(c.spent) +
          " spent</strong>" +
          "</div></article>"
        );
      })
      .join("");
  }

  function renderProducts() {
    els.productsTable.innerHTML = products
      .map(function (p) {
        const stockClass =
          p.stock === 0 ? "text-danger" : p.stock < 15 ? "text-warn" : "";
        return (
          "<tr>" +
          "<td><strong>" +
          p.name +
          "</strong></td>" +
          "<td><code>" +
          p.sku +
          "</code></td>" +
          '<td class="' +
          stockClass +
          '">' +
          p.stock +
          "</td>" +
          "<td>" +
          money(p.price) +
          "</td>" +
          '<td><span class="badge badge--' +
          p.status.replace(" ", "-") +
          '">' +
          p.status +
          "</span></td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function renderAnalyticsStats() {
    const items = [
      { label: "Page views", value: "24.8k", change: "+18%" },
      { label: "Conversion rate", value: "3.2%", change: "+0.4%" },
      { label: "Avg. order", value: "$84", change: "+$6" },
      { label: "Bounce rate", value: "42%", change: "-2%" },
    ];
    els.analyticsStats.innerHTML = items
      .map(function (s) {
        return (
          '<article class="stat-card stat-card--compact">' +
          '<p class="stat-card__label">' +
          s.label +
          "</p>" +
          '<p class="stat-card__value">' +
          s.value +
          "</p>" +
          '<span class="stat-card__change is-up">' +
          s.change +
          "</span></article>"
        );
      })
      .join("");
  }

  function renderNotifications() {
    els.notifList.innerHTML = notifications
      .map(function (n) {
        return "<li><p>" + n.text + '</p><time>' + n.time + "</time></li>";
      })
      .join("");
  }

  function switchView(view) {
    currentView = view;
    document.querySelectorAll(".view").forEach(function (v) {
      const active = v.dataset.view === view;
      v.hidden = !active;
      v.classList.toggle("is-active", active);
    });
    document.querySelectorAll(".nav-item").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.view === view);
    });
    closeSidebar();
  }

  function closeSidebar() {
    els.sidebar.classList.remove("is-open");
    els.sidebarOverlay.hidden = true;
    els.sidebarOverlay.classList.remove("is-open");
  }

  function openSidebar() {
    els.sidebar.classList.add("is-open");
    els.sidebarOverlay.hidden = false;
    requestAnimationFrame(function () {
      els.sidebarOverlay.classList.add("is-open");
    });
  }

  /* Events */
  document.getElementById("sidebarNav").addEventListener("click", function (e) {
    const btn = e.target.closest(".nav-item");
    if (!btn) return;
    switchView(btn.dataset.view);
  });

  document.querySelectorAll("[data-goto]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      switchView(this.dataset.goto);
    });
  });

  document.getElementById("orderTabs").addEventListener("click", function (e) {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.remove("is-active");
    });
    tab.classList.add("is-active");
    orderFilter = tab.dataset.status;
    renderOrdersTable();
  });

  els.ordersTable.addEventListener("change", function (e) {
    if (!e.target.classList.contains("status-select")) return;
    const id = e.target.dataset.order;
    const order = orders.find(function (o) {
      return o.id === id;
    });
    if (order) {
      order.status = e.target.value;
      renderRecentOrders();
      renderDonut();
      renderStats();
      showToast("Order " + id + " updated to " + order.status);
    }
  });

  document.getElementById("notifBtn").addEventListener("click", function (e) {
    e.stopPropagation();
    const open = els.notifPanel.hidden;
    els.notifPanel.hidden = !open;
  });

  document.addEventListener("click", function () {
    els.notifPanel.hidden = true;
  });

  els.notifPanel.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  document.getElementById("menuToggle").addEventListener("click", openSidebar);
  els.sidebarOverlay.addEventListener("click", closeSidebar);

  document.getElementById("periodSelect").addEventListener("change", function (e) {
    const labels = { 7: "This week", 30: "Last 30 days", 90: "Last 90 days" };
    els.chartMeta.textContent = labels[e.target.value] || "This week";
    renderBarChart(els.revenueChart, revenueWeek, "var(--accent)");
    showToast("Chart updated");
  });

  document.getElementById("globalSearch").addEventListener("input", function (e) {
    const q = e.target.value.trim().toLowerCase();
    if (!q) return;
    if (orders.some(function (o) {
      return o.customer.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
    })) {
      switchView("orders");
    }
  });

  document.getElementById("settingsForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const msg = document.getElementById("settingsMsg");
    msg.textContent = "Settings saved (demo).";
    msg.classList.add("form-msg--ok");
    showToast("Settings saved");
    setTimeout(function () {
      msg.textContent = "";
    }, 3000);
  });

  document.getElementById("addProductBtn").addEventListener("click", function () {
    showToast("Add product — demo only");
  });

  /* Init */
  renderStats();
  renderBarChart(els.revenueChart, revenueWeek, "var(--accent)");
  renderBarChart(els.trafficChart, trafficWeek, "var(--accent-2)");
  renderDonut();
  renderRecentOrders();
  renderOrdersTable();
  renderCustomers();
  renderProducts();
  renderAnalyticsStats();
  renderNotifications();
})();
