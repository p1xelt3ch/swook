(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const menuItems = {
    coffee: [
      { name: "House Espresso", desc: "Double shot, chocolate & caramel notes", price: 3.5, badge: "Popular" },
      { name: "Oat Flat White", desc: "Silky microfoam, medium roast blend", price: 4.75 },
      { name: "Pour Over", desc: "Single-origin, rotated weekly", price: 5.5, badge: "Chef's pick" },
      { name: "Cortado", desc: "Equal parts espresso & steamed milk", price: 4.25 },
      { name: "Mocha Noir", desc: "70% dark chocolate, sea salt", price: 5.25 },
      { name: "Cold Brew", desc: "18-hour steep, served over ice", price: 4.5 },
    ],
    brunch: [
      { name: "Avocado Toast", desc: "Sourdough, chili flakes, poached egg +2", price: 12 },
      { name: "Shakshuka", desc: "Baked eggs, harissa, grilled bread", price: 14, badge: "Weekend" },
      { name: "Granola Bowl", desc: "Yogurt, honey, seasonal fruit", price: 11 },
      { name: "Breakfast Burrito", desc: "Scramble, black beans, salsa verde", price: 13.5 },
      { name: "Truffle Mushroom Toast", desc: "Wild mushrooms, thyme, parmesan", price: 15 },
    ],
    pastries: [
      { name: "Butter Croissant", desc: "Baked daily, plain or almond", price: 4.5, badge: "Fresh" },
      { name: "Cinnamon Roll", desc: "Cream cheese frosting", price: 5 },
      { name: "Banana Bread", desc: "Walnuts, served warm", price: 4.75 },
      { name: "Seasonal Tart", desc: "Ask your barista — changes weekly", price: 6.5 },
      { name: "Chocolate Chip Cookie", desc: "Soft center, flaky salt", price: 3.25 },
    ],
    drinks: [
      { name: "Iced Matcha", desc: "Ceremonial grade, oat or dairy", price: 5.5 },
      { name: "Hibiscus Spritz", desc: "House soda, lime, mint", price: 4.5, badge: "Refreshing" },
      { name: "Fresh Orange Juice", desc: "Squeezed to order", price: 5 },
      { name: "Kombucha on Tap", desc: "Local brewery rotation", price: 4.75 },
      { name: "Lemon Ginger Tonic", desc: "Homemade syrup, sparkling", price: 4.25 },
    ],
  };

  const menuGrid = document.getElementById("menuGrid");
  const menuTabs = document.getElementById("menuTabs");
  const header = document.getElementById("header");
  const reserveModal = document.getElementById("reserveModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const reserveForm = document.getElementById("reserveForm");
  const reserveMsg = document.getElementById("reserveMsg");
  const toast = document.getElementById("toast");
  function renderMenu(tab) {
    const items = menuItems[tab] || [];
    menuGrid.classList.add("is-switching");

    setTimeout(function () {
      menuGrid.innerHTML = items
        .map(function (item, i) {
          const badge = item.badge
            ? '<span class="menu-item__badge">' + item.badge + "</span>"
            : "";
          return (
            '<article class="menu-item reveal" style="transition-delay:' +
            i * 0.06 +
            's">' +
            badge +
            '<div class="menu-item__top">' +
            "<h3>" +
            item.name +
            "</h3>" +
            '<span class="menu-item__price">$' +
            item.price.toFixed(2) +
            "</span>" +
            "</div>" +
            "<p>" +
            item.desc +
            "</p>" +
            '<button type="button" class="menu-item__fav" aria-label="Add to favorites">♡</button>' +
            "</article>"
          );
        })
        .join("");

      menuGrid.classList.remove("is-switching");
      observeReveals(menuGrid.querySelectorAll(".reveal"));
      bindFavorites();
    }, 200);
  }

  function bindFavorites() {
    menuGrid.querySelectorAll(".menu-item__fav").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const on = btn.classList.toggle("is-on");
        btn.textContent = on ? "♥" : "♡";
        btn.setAttribute("aria-label", on ? "Remove from favorites" : "Add to favorites");
        if (on) {
          showToast("Saved to favorites (demo)");
        }
      });
    });
  }

  function observeReveals(els) {
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("visible");
      });
      return;
    }
    const obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    els.forEach(function (el) {
      obs.observe(el);
    });
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("show");
    }, 2600);
  }

  function openReserve() {
    modalOverlay.hidden = false;
    reserveModal.showModal();
    document.body.style.overflow = "hidden";
  }

  function closeReserve() {
    reserveModal.close();
    modalOverlay.hidden = true;
    document.body.style.overflow = "";
  }

  menuTabs.addEventListener("click", function (e) {
    const tab = e.target.closest(".menu-tab");
    if (!tab) return;
    menuTabs.querySelectorAll(".menu-tab").forEach(function (b) {
      b.classList.remove("is-active");
    });
    tab.classList.add("is-active");
    renderMenu(tab.dataset.tab);
  });

  ["openReserve", "openReserveHero", "openReserveVisit"].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", openReserve);
  });

  document.getElementById("closeReserve").addEventListener("click", closeReserve);
  modalOverlay.addEventListener("click", closeReserve);

  reserveModal.addEventListener("cancel", function (e) {
    e.preventDefault();
    closeReserve();
  });

  reserveForm.addEventListener("submit", function (e) {
    e.preventDefault();
    reserveMsg.textContent = "";
    reserveMsg.className = "form-msg";

    const name = reserveForm.name.value.trim();
    const email = reserveForm.email.value.trim();
    if (!name || !email || !reserveForm.date.value || !reserveForm.time.value || !reserveForm.guests.value) {
      reserveMsg.textContent = "Please fill in all fields.";
      reserveMsg.classList.add("form-msg--error");
      return;
    }

    reserveMsg.textContent = "You're booked, " + name.split(" ")[0] + "! (Demo — no email sent.)";
    reserveMsg.classList.add("form-msg--success");
    showToast("Reservation confirmed (demo)");
    setTimeout(function () {
      reserveForm.reset();
      closeReserve();
      reserveMsg.textContent = "";
    }, 2200);
  });

  document.getElementById("menuToggle").addEventListener("click", function () {
    const open = document.getElementById("navLinks").classList.toggle("open");
    this.setAttribute("aria-expanded", open);
  });

  document.getElementById("navLinks").addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      document.getElementById("navLinks").classList.remove("open");
      document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener(
    "scroll",
    function () {
      header.classList.toggle("header--solid", window.scrollY > 50);
    },
    { passive: true }
  );

  const track = document.querySelector(".marquee__track");
  if (track) track.innerHTML += track.innerHTML;

  const dateInput = document.getElementById("resDate");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }

  renderMenu("coffee");
  observeReveals(document.querySelectorAll(".reveal"));
})();
