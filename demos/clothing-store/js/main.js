(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const products = [
    {
      id: 1,
      name: "Meridian Wool Coat",
      price: 489,
      category: "outerwear",
      tag: "Bestseller",
      desc: "Double-faced Italian wool with horn buttons. Fully lined for crisp structure.",
      img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=700&q=85",
    },
    {
      id: 2,
      name: "Silk Column Dress",
      price: 320,
      category: "dresses",
      tag: "New in",
      desc: "Fluid silk crepe with a bias cut that moves with every step.",
      img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=85",
    },
    {
      id: 3,
      name: "Structured Blazer",
      price: 275,
      category: "outerwear",
      tag: "Essential",
      desc: "Tailored shoulders, satin lapels, and a silhouette that sharpens any look.",
      img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=700&q=85",
    },
    {
      id: 4,
      name: "Draped Midi Dress",
      price: 198,
      category: "dresses",
      tag: "Limited",
      desc: "Asymmetric hem with a soft drape — day to evening in one piece.",
      img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=700&q=85",
    },
    {
      id: 5,
      name: "Leather Tote",
      price: 420,
      category: "accessories",
      tag: "Handmade",
      desc: "Vegetable-tanned leather with brushed gold hardware.",
      img: "https://images.unsplash.com/photo-1584917865442-de89a76e3c48?auto=format&fit=crop&w=700&q=85",
    },
    {
      id: 6,
      name: "Cashmere Scarf",
      price: 145,
      category: "accessories",
      tag: "Soft",
      desc: "Grade-A cashmere in a generous wrap size. Available in four tones.",
      img: "https://images.unsplash.com/photo-1520903923159-96551eddf829?auto=format&fit=crop&w=700&q=85",
    },
  ];

  const FALLBACK_IMG =
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=85";

  let bag = [];
  let lastScroll = 0;

  const header = document.getElementById("header");
  const grid = document.getElementById("products");
  const bagCount = document.getElementById("bagCount");
  const bagItems = document.getElementById("bagItems");
  const bagEmpty = document.getElementById("bagEmpty");
  const bagTotal = document.getElementById("bagTotal");
  const bagEl = document.getElementById("bag");
  const bagOverlay = document.getElementById("bagOverlay");
  const toast = document.getElementById("toast");
  const modalOverlay = document.getElementById("modalOverlay");
  const quickView = document.getElementById("quickView");

  function imgWithFallback(src, alt) {
    return `<img src="${src}" alt="${alt}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'" />`;
  }

  function renderProducts(filter) {
    const list =
      filter === "all" ? products : products.filter((p) => p.category === filter);

    grid.classList.add("is-filtering");

    setTimeout(function () {
      grid.innerHTML = list
        .map(function (p, i) {
          return `
        <article class="product reveal" data-category="${p.category}" style="animation-delay:${i * 0.08}s">
          <div class="product__img is-loading">
            <div class="product__shimmer"></div>
            ${imgWithFallback(p.img, p.name)}
            <div class="product__actions">
              <button type="button" class="product__add" data-id="${p.id}">Add to bag</button>
              <button type="button" class="product__quick" data-quick="${p.id}">Quick view</button>
            </div>
          </div>
          <span class="product__tag">${p.tag}</span>
          <h3>${p.name}</h3>
          <p class="product__price">$${p.price}</p>
        </article>`;
        })
        .join("");

      grid.classList.remove("is-filtering");
      bindProductImages();
      observeReveals(grid.querySelectorAll(".reveal"));
    }, 220);
  }

  function bindProductImages() {
    grid.querySelectorAll(".product__img").forEach(function (wrap) {
      const img = wrap.querySelector("img");
      if (!img) return;

      function done() {
        wrap.classList.remove("is-loading");
        wrap.classList.add("loaded");
      }

      if (img.complete) done();
      else {
        img.addEventListener("load", done);
        img.addEventListener("error", done);
      }
    });
  }

  function updateBagUI() {
    const count = bag.reduce(function (n, i) {
      return n + i.qty;
    }, 0);

    bagCount.textContent = count;
    bagCount.classList.toggle("pop", count > 0);
    setTimeout(function () {
      bagCount.classList.remove("pop");
    }, 450);

    bagEmpty.hidden = count > 0;

    bagItems.innerHTML = bag
      .map(function (i) {
        return `
      <li class="bag__item">
        ${imgWithFallback(i.img, i.name)}
        <div>
          <p class="bag__item-name">${i.name}</p>
          <p class="bag__item-price">$${i.price} × ${i.qty}</p>
        </div>
        <button type="button" class="bag__item-remove" data-remove="${i.id}" aria-label="Remove">×</button>
      </li>`;
      })
      .join("");

    const total = bag.reduce(function (s, i) {
      return s + i.price * i.qty;
    }, 0);
    bagTotal.textContent = "$" + total;
  }

  function showToast(name) {
    toast.innerHTML = "Added <strong>" + name + "</strong> to your bag";
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("show");
    }, 2800);
  }

  function openBag() {
    bagEl.hidden = false;
    bagOverlay.hidden = false;
    requestAnimationFrame(function () {
      bagEl.classList.add("is-open");
      bagOverlay.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
  }

  function closeBag() {
    bagEl.classList.remove("is-open");
    bagOverlay.classList.remove("is-open");
    setTimeout(function () {
      bagEl.hidden = true;
      bagOverlay.hidden = true;
    }, 500);
    document.body.style.overflow = "";
  }

  function openQuickView(id) {
    const p = products.find(function (x) {
      return x.id === id;
    });
    if (!p) return;

    quickView.innerHTML = `
      <button type="button" class="quick-view__close" id="closeQuick" aria-label="Close">×</button>
      <div class="quick-view__img">${imgWithFallback(p.img, p.name)}</div>
      <div class="quick-view__body">
        <span class="product__tag">${p.tag}</span>
        <h2>${p.name}</h2>
        <p class="product__price">$${p.price}</p>
        <p>${p.desc}</p>
        <button type="button" class="btn btn--gold product__add" data-id="${p.id}">Add to bag</button>
      </div>`;

    quickView.hidden = false;
    modalOverlay.hidden = false;
    requestAnimationFrame(function () {
      quickView.classList.add("is-open");
      modalOverlay.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";

    document.getElementById("closeQuick").addEventListener("click", closeQuickView);
    quickView.querySelector(".product__add").addEventListener("click", function () {
      addToBag(p.id);
      closeQuickView();
    });
  }

  function closeQuickView() {
    quickView.classList.remove("is-open");
    modalOverlay.classList.remove("is-open");
    setTimeout(function () {
      quickView.hidden = true;
      modalOverlay.hidden = true;
      if (!bagEl.classList.contains("is-open")) {
        document.body.style.overflow = "";
      }
    }, 450);
  }

  function addToBag(id) {
    const p = products.find(function (x) {
      return x.id === id;
    });
    if (!p) return;

    const existing = bag.find(function (x) {
      return x.id === p.id;
    });
    if (existing) existing.qty++;
    else bag.push(Object.assign({}, p, { qty: 1 }));

    updateBagUI();
    showToast(p.name);
    openBag();
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach(function (el) {
      obs.observe(el);
    });
  }

  /* Header scroll */
  window.addEventListener(
    "scroll",
    function () {
      const y = window.scrollY;
      header.classList.toggle("header--solid", y > 60);
      if (y > lastScroll && y > 200) {
        header.classList.add("header--hidden");
      } else {
        header.classList.remove("header--hidden");
      }
      lastScroll = y;
    },
    { passive: true }
  );

  /* Hero parallax */
  const heroVisual = document.querySelector(".hero__visual");
  if (heroVisual && window.matchMedia("(pointer: fine)").matches) {
    document.querySelector(".hero").addEventListener("mousemove", function (e) {
      const rect = heroVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroVisual.style.transform =
        "translate(" + x * 12 + "px, " + y * 12 + "px)";
    });
  }

  /* Filters */
  document.getElementById("filters").addEventListener("click", function (e) {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    document.querySelectorAll(".filter").forEach(function (b) {
      b.classList.remove("is-active");
    });
    btn.classList.add("is-active");
    renderProducts(btn.dataset.filter);
  });

  /* Product grid clicks */
  grid.addEventListener("click", function (e) {
    const addBtn = e.target.closest(".product__add");
    if (addBtn) {
      addToBag(+addBtn.dataset.id);
      return;
    }
    const quickBtn = e.target.closest(".product__quick");
    if (quickBtn) {
      openQuickView(+quickBtn.dataset.quick);
    }
  });

  bagItems.addEventListener("click", function (e) {
    const id = +e.target.dataset.remove;
    if (!id) return;
    bag = bag.filter(function (i) {
      return i.id !== id;
    });
    updateBagUI();
  });

  document.getElementById("openBag").addEventListener("click", openBag);
  document.getElementById("closeBag").addEventListener("click", closeBag);
  bagOverlay.addEventListener("click", closeBag);

  document.getElementById("menuToggle").addEventListener("click", function () {
    const open = document.getElementById("navLinks").classList.toggle("open");
    this.setAttribute("aria-expanded", open);
  });

  modalOverlay.addEventListener("click", closeQuickView);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeBag();
      closeQuickView();
    }
  });

  /* Init */
  renderProducts("all");
  observeReveals(document.querySelectorAll(".reveal"));
  updateBagUI();

  /* Duplicate marquee for seamless loop */
  const track = document.querySelector(".marquee__track");
  if (track) {
    track.innerHTML += track.innerHTML;
  }
})();
