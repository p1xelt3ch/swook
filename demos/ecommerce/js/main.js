(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const FALLBACK =
    "https://images.unsplash.com/photo-1616046229476-7971a0d56235?auto=format&fit=crop&w=600&q=85";

  const products = [
    { id: 1, name: "Stoneware Mug Set", price: 34, cat: "kitchen", badge: "Bestseller", img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=85", desc: "Set of 4 handmade mugs, dishwasher safe." },
    { id: 2, name: "Linen Throw Blanket", price: 68, cat: "home", img: "https://plus.unsplash.com/premium_photo-1678375722586-b5eef2972f4f?auto=format&fit=crop&w=600&q=85", desc: "Soft washed linen in natural oat tone." },
    { id: 3, name: "Walnut Cutting Board", price: 45, cat: "kitchen", img: "https://images.unsplash.com/photo-1645743714610-b46ff94f658d?auto=format&fit=crop&w=600&q=85", desc: "End-grain walnut, oil-finished." },
    { id: 4, name: "Soy Candle — Cedar", price: 22, cat: "gifts", badge: "New", img: "https://plus.unsplash.com/premium_photo-1669824023993-273720598b14?auto=format&fit=crop&w=600&q=85", desc: "40hr burn, phthalate-free fragrance." },
    { id: 5, name: "Ceramic Planter", price: 28, cat: "home", img: "https://images.unsplash.com/photo-1588440691140-09155c1be58a?auto=format&fit=crop&w=600&q=85", desc: "Matte white, drainage hole included." },
    { id: 6, name: "Pour-Over Kit", price: 52, cat: "kitchen", img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=85", desc: "Glass carafe, filter, and scoop." },
    { id: 7, name: "Gift Box — Tea Trio", price: 38, cat: "gifts", img: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=600&q=85", desc: "Three loose-leaf blends in tins." },
    { id: 8, name: "Woven Storage Basket", price: 41, cat: "home", img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=85", desc: "Natural seagrass, medium size." },
  ];

  let cart = [];
  let filterCat = "all";
  let searchQuery = "";
  let sortBy = "featured";

  const els = {
    products: document.getElementById("products"),
    resultCount: document.getElementById("resultCount"),
    cartCount: document.getElementById("cartCount"),
    cartItems: document.getElementById("cartItems"),
    cartEmpty: document.getElementById("cartEmpty"),
    cartSubtotal: document.getElementById("cartSubtotal"),
    cartShipping: document.getElementById("cartShipping"),
    cart: document.getElementById("cart"),
    cartOverlay: document.getElementById("cartOverlay"),
    openCheckout: document.getElementById("openCheckout"),
    checkoutModal: document.getElementById("checkoutModal"),
    checkoutOverlay: document.getElementById("checkoutOverlay"),
    checkoutSummary: document.getElementById("checkoutSummary"),
    checkoutForm: document.getElementById("checkoutForm"),
    success: document.getElementById("success"),
    successMsg: document.getElementById("successMsg"),
    quickView: document.getElementById("quickView"),
    qvOverlay: document.getElementById("qvOverlay"),
    toast: document.getElementById("toast"),
    header: document.getElementById("header"),
    promo: document.getElementById("promo"),
  };

  function imgTag(src, alt) {
    return (
      '<img src="' +
      src +
      '" alt="' +
      alt +
      '" loading="lazy" onerror="this.onerror=null;this.src=\'' +
      FALLBACK +
      "'\" />"
    );
  }

  function getProduct(id) {
    return products.find(function (p) {
      return p.id === id;
    });
  }

  function formatMoney(n) {
    return "$" + n.toFixed(2);
  }

  function getFilteredProducts() {
    let list = products.slice();

    if (filterCat !== "all") {
      list = list.filter(function (p) {
        return p.cat === filterCat;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(function (p) {
        return (
          p.name.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          p.cat.includes(q)
        );
      });
    }

    if (sortBy === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
    else if (sortBy === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
    else if (sortBy === "name") list.sort(function (a, b) { return a.name.localeCompare(b.name); });

    return list;
  }

  function renderProducts() {
    const list = getFilteredProducts();
    els.resultCount.textContent =
      list.length + " product" + (list.length === 1 ? "" : "s");

    if (!list.length) {
      els.products.innerHTML =
        '<p class="no-results">No products match your search.</p>';
      return;
    }

    els.products.innerHTML = list
      .map(function (p, i) {
        const badge = p.badge
          ? '<span class="product__badge">' + p.badge + "</span>"
          : "";
        return (
          '<article class="product reveal" style="transition-delay:' +
          i * 0.05 +
          's" data-id="' +
          p.id +
          '">' +
          badge +
          '<button type="button" class="product__qv" data-qv="' +
          p.id +
          '" aria-label="Quick view ' +
          p.name +
          '">Quick view</button>' +
          '<div class="product__img">' +
          imgTag(p.img, p.name) +
          "</div>" +
          '<div class="product__body">' +
          '<span class="product__cat">' +
          p.cat +
          "</span>" +
          "<h3>" +
          p.name +
          "</h3>" +
          '<p class="product__price">' +
          formatMoney(p.price) +
          "</p>" +
          '<button type="button" class="btn btn--add" data-add="' +
          p.id +
          '">Add to cart</button>' +
          "</div></article>"
        );
      })
      .join("");

    observeReveals(els.products.querySelectorAll(".reveal"));
  }

  function cartTotals() {
    const sub = cart.reduce(function (s, i) {
      return s + i.price * i.qty;
    }, 0);
    const shipping = sub >= 50 || sub === 0 ? 0 : 5.99;
    const count = cart.reduce(function (n, i) {
      return n + i.qty;
    }, 0);
    return { sub, shipping, total: sub + shipping, count };
  }

  function updateCartUI() {
    const t = cartTotals();
    els.cartCount.textContent = t.count;
    els.cartCount.classList.toggle("pop", t.count > 0);
    setTimeout(function () {
      els.cartCount.classList.remove("pop");
    }, 400);

    els.cartEmpty.hidden = t.count > 0;
    els.openCheckout.disabled = t.count === 0;

    els.cartItems.innerHTML = cart
      .map(function (item) {
        return (
          '<li class="cart-item">' +
          '<div class="cart-item__img">' +
          imgTag(item.img, item.name) +
          "</div>" +
          '<div class="cart-item__info">' +
          "<h4>" +
          item.name +
          "</h4>" +
          "<p>" +
          formatMoney(item.price) +
          "</p>" +
          '<div class="qty">' +
          '<button type="button" data-dec="' +
          item.id +
          '" aria-label="Decrease">−</button>' +
          "<span>" +
          item.qty +
          "</span>" +
          '<button type="button" data-inc="' +
          item.id +
          '" aria-label="Increase">+</button>' +
          "</div>" +
          "</div>" +
          '<button type="button" class="cart-item__remove" data-remove="' +
          item.id +
          '" aria-label="Remove">&times;</button>' +
          "</li>"
        );
      })
      .join("");

    els.cartSubtotal.textContent = formatMoney(t.sub);
    els.cartShipping.textContent =
      t.count === 0
        ? "Calculated at checkout"
        : t.shipping === 0
          ? "Free"
          : formatMoney(t.shipping);
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      els.toast.classList.remove("show");
    }, 2600);
  }

  function addToCart(id, qty) {
    qty = qty || 1;
    const p = getProduct(id);
    if (!p) return;
    const existing = cart.find(function (c) {
      return c.id === id;
    });
    if (existing) existing.qty += qty;
    else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty: qty });
    updateCartUI();
    showToast(p.name + " added to cart");
  }

  function openCart() {
    els.cart.hidden = false;
    els.cartOverlay.hidden = false;
    requestAnimationFrame(function () {
      els.cart.classList.add("is-open");
      els.cartOverlay.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    els.cart.classList.remove("is-open");
    els.cartOverlay.classList.remove("is-open");
    setTimeout(function () {
      els.cart.hidden = true;
      els.cartOverlay.hidden = true;
      if (!els.checkoutModal.open && els.quickView.hidden) {
        document.body.style.overflow = "";
      }
    }, 450);
  }

  function openQuickView(id) {
    const p = getProduct(id);
    if (!p) return;
    els.quickView.innerHTML =
      '<button type="button" class="qv__close" id="closeQv">&times;</button>' +
      '<div class="qv__img">' +
      imgTag(p.img, p.name) +
      "</div>" +
      '<div class="qv__body">' +
      (p.badge ? '<span class="product__badge">' + p.badge + "</span>" : "") +
      '<span class="product__cat">' +
      p.cat +
      "</span>" +
      "<h2>" +
      p.name +
      "</h2>" +
      '<p class="product__price">' +
      formatMoney(p.price) +
      "</p>" +
      "<p>" +
      p.desc +
      "</p>" +
      '<button type="button" class="btn btn--primary" data-add="' +
      p.id +
      '">Add to cart</button>' +
      "</div>";

    els.quickView.hidden = false;
    els.qvOverlay.hidden = false;
    requestAnimationFrame(function () {
      els.quickView.classList.add("is-open");
      els.qvOverlay.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";

    document.getElementById("closeQv").addEventListener("click", closeQuickView);
    els.quickView.querySelector("[data-add]").addEventListener("click", function () {
      addToCart(p.id);
      closeQuickView();
      openCart();
    });
  }

  function closeQuickView() {
    els.quickView.classList.remove("is-open");
    els.qvOverlay.classList.remove("is-open");
    setTimeout(function () {
      els.quickView.hidden = true;
      els.qvOverlay.hidden = true;
      if (!els.cart.classList.contains("is-open") && !els.checkoutModal.open) {
        document.body.style.overflow = "";
      }
    }, 400);
  }

  function renderCheckoutSummary() {
    const t = cartTotals();
    els.checkoutSummary.innerHTML =
      "<h3>Order summary</h3>" +
      cart
        .map(function (i) {
          return (
            '<div class="co-line"><span>' +
            i.name +
            " × " +
            i.qty +
            "</span><span>" +
            formatMoney(i.price * i.qty) +
            "</span></div>"
          );
        })
        .join("") +
      '<div class="co-line"><span>Subtotal</span><span>' +
      formatMoney(t.sub) +
      "</span></div>" +
      '<div class="co-line co-line--muted"><span>Shipping</span><span>' +
      (t.shipping === 0 ? "Free" : formatMoney(t.shipping)) +
      "</span></div>" +
      '<div class="co-line co-line--total"><span>Total</span><strong>' +
      formatMoney(t.total) +
      "</strong></div>";
  }

  function openCheckout() {
    if (!cart.length) return;
    renderCheckoutSummary();
    closeCart();
    els.checkoutOverlay.hidden = false;
    els.checkoutModal.showModal();
    document.body.style.overflow = "hidden";
  }

  function closeCheckout() {
    els.checkoutModal.close();
    els.checkoutOverlay.hidden = true;
    if (!els.cart.classList.contains("is-open") && els.quickView.hidden) {
      document.body.style.overflow = "";
    }
  }

  function observeReveals(nodes) {
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) {
        n.classList.add("visible");
      });
      return;
    }
    const obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    nodes.forEach(function (n) {
      obs.observe(n);
    });
  }

  /* Events */
  document.getElementById("filters").addEventListener("click", function (e) {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    document.querySelectorAll(".filter").forEach(function (b) {
      b.classList.remove("is-active");
    });
    btn.classList.add("is-active");
    filterCat = btn.dataset.cat;
    renderProducts();
  });

  document.getElementById("search").addEventListener("input", function (e) {
    searchQuery = e.target.value.trim();
    renderProducts();
  });

  document.getElementById("sort").addEventListener("change", function (e) {
    sortBy = e.target.value;
    renderProducts();
  });

  els.products.addEventListener("click", function (e) {
    const add = e.target.closest("[data-add]");
    if (add) {
      addToCart(+add.dataset.add);
      return;
    }
    const qv = e.target.closest("[data-qv]");
    if (qv) openQuickView(+qv.dataset.qv);
  });

  els.cartItems.addEventListener("click", function (e) {
    const id = +(e.target.dataset.remove || e.target.dataset.inc || e.target.dataset.dec);
    if (!id) return;
    const item = cart.find(function (c) {
      return c.id === id;
    });
    if (!item) return;
    if (e.target.dataset.remove) {
      cart = cart.filter(function (c) {
        return c.id !== id;
      });
    } else if (e.target.dataset.inc) {
      item.qty++;
    } else if (e.target.dataset.dec) {
      item.qty--;
      if (item.qty <= 0) {
        cart = cart.filter(function (c) {
          return c.id !== id;
        });
      }
    }
    updateCartUI();
  });

  document.getElementById("openCart").addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);
  els.cartOverlay.addEventListener("click", closeCart);
  els.openCheckout.addEventListener("click", openCheckout);
  document.getElementById("closeCheckout").addEventListener("click", closeCheckout);
  els.checkoutOverlay.addEventListener("click", closeCheckout);
  els.qvOverlay.addEventListener("click", closeQuickView);

  els.checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!els.checkoutForm.reportValidity()) return;
    const t = cartTotals();
    const name = document.getElementById("coName").value.trim();
    closeCheckout();
    cart = [];
    updateCartUI();
    els.checkoutForm.reset();
    els.successMsg.textContent =
      "Thanks, " +
      name.split(" ")[0] +
      "! Your demo order of " +
      formatMoney(t.total) +
      " is confirmed.";
    els.success.hidden = false;
    showToast("Order placed successfully!");
  });

  document.getElementById("successClose").addEventListener("click", function () {
    els.success.hidden = true;
  });

  document.getElementById("closePromo").addEventListener("click", function () {
    els.promo.hidden = true;
    document.body.classList.remove("has-promo");
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
      els.header.classList.toggle("header--solid", window.scrollY > 30);
    },
    { passive: true }
  );

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeCart();
      closeQuickView();
      closeCheckout();
    }
  });

  document.body.classList.add("has-promo");
  els.success.hidden = true;
  renderProducts();
  updateCartUI();
  observeReveals(document.querySelectorAll(".reveal"));
})();
