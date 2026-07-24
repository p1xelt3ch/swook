(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const services = [
    { id: "haircut", name: "Signature Haircut", duration: "45 min", price: 65, icon: "✂️", desc: "Consultation, wash, cut & style" },
    { id: "color", name: "Full Color", duration: "2 hrs", price: 120, icon: "🎨", desc: "Root-to-tip color with gloss finish" },
    { id: "facial", name: "Glow Facial", duration: "60 min", price: 85, icon: "✨", desc: "Deep cleanse, mask & hydration" },
    { id: "massage", name: "Deep Tissue Massage", duration: "75 min", price: 95, icon: "💆", desc: "Targeted relief for neck & back" },
    { id: "nails", name: "Luxury Manicure", duration: "50 min", price: 55, icon: "💅", desc: "Shape, buff, polish & hand massage" },
    { id: "brows", name: "Brow Sculpt", duration: "30 min", price: 40, icon: "👁", desc: "Mapping, wax & tint optional" },
  ];

  const ALL_SLOTS = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  ];

  const state = {
    step: 1,
    service: null,
    date: null,
    time: null,
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth(),
  };

  const els = {
    servicePicks: document.getElementById("servicePicks"),
    servicesGrid: document.getElementById("servicesGrid"),
    calDays: document.getElementById("calDays"),
    calLabel: document.getElementById("calLabel"),
    timeSlots: document.getElementById("timeSlots"),
    timeHint: document.getElementById("timeHint"),
    btnBack: document.getElementById("btnBack"),
    btnNext: document.getElementById("btnNext"),
    bookNav: document.getElementById("bookNav"),
    detailsForm: document.getElementById("detailsForm"),
    progress: document.getElementById("progress"),
    sumService: document.getElementById("sumService"),
    sumDate: document.getElementById("sumDate"),
    sumTime: document.getElementById("sumTime"),
    sumDuration: document.getElementById("sumDuration"),
    sumPrice: document.getElementById("sumPrice"),
    confirmCard: document.getElementById("confirmCard"),
    confirmText: document.getElementById("confirmText"),
    nextSlot: document.getElementById("nextSlot"),
    toast: document.getElementById("toast"),
    header: document.getElementById("header"),
  };

  function getService(id) {
    return services.find(function (s) {
      return s.id === id;
    });
  }

  function formatDate(d) {
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function dateKey(d) {
    return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
  }

  function getBookedSlots(date) {
    const seed = date.getDate() + date.getMonth() * 7;
    return ALL_SLOTS.filter(function (_, i) {
      return (seed + i * 3) % 5 === 0;
    });
  }

  function renderServiceCards(container, pickMode) {
    container.innerHTML = services
      .map(function (s) {
        const selected = state.service === s.id ? " is-selected" : "";
        const tag = pickMode ? "button" : "article";
        const attrs = pickMode
          ? ' type="button" class="service-pick' + selected + '" data-id="' + s.id + '"'
          : ' class="service-card reveal" data-id="' + s.id + '"';

        return (
          "<" +
          tag +
          attrs +
          ">" +
          '<span class="service-pick__icon">' +
          s.icon +
          "</span>" +
          "<h4>" +
          s.name +
          "</h4>" +
          "<p>" +
          s.desc +
          "</p>" +
          '<div class="service-pick__meta">' +
          "<span>" +
          s.duration +
          "</span>" +
          "<strong>$" +
          s.price +
          "</strong>" +
          "</div>" +
          (pickMode ? "" : '<button type="button" class="btn btn--small service-card__book" data-book="' + s.id + '">Book</button>') +
          "</" +
          tag +
          ">"
        );
      })
      .join("");
  }

  function updateSummary() {
    const s = state.service ? getService(state.service) : null;
    els.sumService.textContent = s ? s.name : "—";
    els.sumDuration.textContent = s ? s.duration : "—";
    els.sumPrice.textContent = s ? "$" + s.price : "—";
    els.sumDate.textContent = state.date ? formatDate(state.date) : "—";
    els.sumTime.textContent = state.time || "—";
  }

  function setStep(step) {
    state.step = step;

    document.querySelectorAll(".panel").forEach(function (p) {
      const n = +p.dataset.panel;
      if (n) {
        p.hidden = n !== step;
        p.classList.toggle("is-active", n === step);
      }
    });

    document.getElementById("panelConfirm").hidden = step !== 5;

    els.progress.querySelectorAll(".progress__step").forEach(function (el) {
      const n = +el.dataset.step;
      el.classList.toggle("is-active", n === step);
      el.classList.toggle("is-done", n < step);
    });

    els.btnBack.disabled = step <= 1 || step === 5;
    els.btnNext.textContent = step === 4 ? "Confirm booking" : "Continue";
    els.btnNext.hidden = step === 5;
    els.btnBack.hidden = step === 5;
    els.bookNav.hidden = step === 5;

    updateNextDisabled();
    updateSummary();

    if (step === 2) renderCalendar();
    if (step === 3) renderTimeSlots();
  }

  function updateNextDisabled() {
    if (state.step === 1) els.btnNext.disabled = !state.service;
    else if (state.step === 2) els.btnNext.disabled = !state.date;
    else if (state.step === 3) els.btnNext.disabled = !state.time;
    else if (state.step === 4) els.btnNext.disabled = false;
  }

  function renderCalendar() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const y = state.calYear;
    const m = state.calMonth;
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);

    els.calLabel.textContent = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    let startPad = first.getDay() - 1;
    if (startPad < 0) startPad = 6;

    let html = "";
    for (let i = 0; i < startPad; i++) {
      html += '<span class="cal-day cal-day--empty"></span>';
    }

    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(y, m, d);
      const isPast = date < today;
      const isSun = date.getDay() === 0;
      const disabled = isPast || isSun;
      const selected =
        state.date && dateKey(state.date) === dateKey(date) ? " cal-day--selected" : "";
      const classes =
        "cal-day" +
        (disabled ? " cal-day--disabled" : "") +
        selected +
        (isSun ? " cal-day--closed" : "");

      html +=
        '<button type="button" class="' +
        classes +
        '" data-date="' +
        date.toISOString() +
        '" ' +
        (disabled ? "disabled" : "") +
        ">" +
        d +
        "</button>";
    }

    els.calDays.innerHTML = html;
  }

  function renderTimeSlots() {
    if (!state.date) return;
    const booked = getBookedSlots(state.date);
    els.timeHint.textContent = "Available slots for " + formatDate(state.date);

    els.timeSlots.innerHTML = ALL_SLOTS.map(function (slot) {
      const taken = booked.includes(slot);
      const selected = state.time === slot ? " is-selected" : "";
      return (
        '<button type="button" class="time-slot' +
        (taken ? " is-taken" : "") +
        selected +
        '" data-time="' +
        slot +
        '" ' +
        (taken ? "disabled" : "") +
        ">" +
        slot +
        (taken ? '<span class="time-slot__tag">Booked</span>' : "") +
        "</button>"
      );
    }).join("");
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      els.toast.classList.remove("show");
    }, 2800);
  }

  function confirmBooking() {
    const form = els.detailsForm;
    if (!form.reportValidity()) return;

    const name = form.clientName.value.trim();
    const s = getService(state.service);

    els.confirmText.textContent = "Thanks, " + name.split(" ")[0] + "! Your appointment is confirmed (demo).";
    els.confirmCard.innerHTML =
      "<p><strong>" +
      s.name +
      "</strong></p>" +
      "<p>" +
      formatDate(state.date) +
      " at " +
      state.time +
      "</p>" +
      "<p>" +
      s.duration +
      " · $" +
      s.price +
      "</p>";

    setStep(5);
    document.getElementById("panelConfirm").hidden = false;
    showToast("Booking confirmed!");
  }

  function resetBooking() {
    state.service = null;
    state.date = null;
    state.time = null;
    els.detailsForm.reset();
    renderServiceCards(els.servicePicks, true);
    setStep(1);
    document.getElementById("book").scrollIntoView({ behavior: "smooth" });
  }

  function pickService(id) {
    state.service = id;
    state.date = null;
    state.time = null;
    renderServiceCards(els.servicePicks, true);
    updateSummary();
    updateNextDisabled();
    showToast(getService(id).name + " selected");
  }

  /* Next available slot hint */
  function updateNextSlotHint() {
    const today = new Date();
    let d = new Date(today);
    while (d.getDay() === 0) d.setDate(d.getDate() + 1);
    const booked = getBookedSlots(d);
    const free = ALL_SLOTS.find(function (s) {
      return !booked.includes(s);
    });
    els.nextSlot.textContent = free || "Tomorrow";
  }

  /* Events */
  els.servicePicks.addEventListener("click", function (e) {
    const btn = e.target.closest(".service-pick");
    if (!btn) return;
    pickService(btn.dataset.id);
  });

  els.servicesGrid.addEventListener("click", function (e) {
    const book = e.target.closest("[data-book]");
    if (book) {
      pickService(book.dataset.book);
      setStep(1);
      document.getElementById("book").scrollIntoView({ behavior: "smooth" });
      setTimeout(function () {
        setStep(2);
      }, 400);
      return;
    }
    const card = e.target.closest(".service-card");
    if (card) pickService(card.dataset.id);
  });

  els.calDays.addEventListener("click", function (e) {
    const btn = e.target.closest(".cal-day:not(.cal-day--disabled):not(.cal-day--empty)");
    if (!btn) return;
    state.date = new Date(btn.dataset.date);
    state.time = null;
    renderCalendar();
    updateNextDisabled();
    updateSummary();
  });

  document.getElementById("calPrev").addEventListener("click", function () {
    state.calMonth--;
    if (state.calMonth < 0) {
      state.calMonth = 11;
      state.calYear--;
    }
    renderCalendar();
  });

  document.getElementById("calNext").addEventListener("click", function () {
    state.calMonth++;
    if (state.calMonth > 11) {
      state.calMonth = 0;
      state.calYear++;
    }
    renderCalendar();
  });

  els.timeSlots.addEventListener("click", function (e) {
    const btn = e.target.closest(".time-slot:not(.is-taken)");
    if (!btn) return;
    state.time = btn.dataset.time;
    renderTimeSlots();
    updateNextDisabled();
    updateSummary();
  });

  els.btnNext.addEventListener("click", function () {
    if (state.step === 4) {
      confirmBooking();
      return;
    }
    if (state.step < 4) setStep(state.step + 1);
  });

  els.btnBack.addEventListener("click", function () {
    if (state.step > 1) setStep(state.step - 1);
  });

  document.getElementById("bookAgain").addEventListener("click", resetBooking);

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
      els.header.classList.toggle("header--solid", window.scrollY > 40);
    },
    { passive: true }
  );

  /* Scroll reveal */
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      obs.observe(el);
    });
  }

  /* Init */
  renderServiceCards(els.servicePicks, true);
  renderServiceCards(els.servicesGrid, false);
  setStep(1);
  updateNextDisabled();
  updateNextSlotHint();
})();
