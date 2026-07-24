(function () {
  "use strict";

  if (window.__portfolioInitialized) {
    return;
  }
  window.__portfolioInitialized = true;

  const header = document.getElementById("header");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const contactForm = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");
  const toast = document.getElementById("toast");
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ----- Sticky header ----- */
  if (header) {
    function onScroll() {
      if (window.scrollY > 40) {
        header.classList.add("header--scrolled");
      } else {
        header.classList.remove("header--scrolled");
      }
      updateActiveNav();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ----- Mobile nav ----- */
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open);
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  /* ----- Active nav link ----- */
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav__link[href^='#']");

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      const id = section.getAttribute("id");
      const top = section.offsetTop;
      const height = section.offsetHeight;

      if (scrollPos >= top && scrollPos < top + height) {
        navAnchors.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + id);
        });
      }
    });
  }

  /* ----- Coming-soon demo cards ----- */
  const soonLinks = document.querySelectorAll(".project-card__link--soon");

  function showToast() {
    if (!toast) return;
    toast.hidden = false;
    toast.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () {
        toast.hidden = true;
      }, 400);
    }, 3200);
  }

  soonLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      showToast();
    });
  });

  /* ----- Contact form (front-end only) ----- */
  if (contactForm && formNote) {
    contactForm.addEventListener("submit", function (e) {
      //e.preventDefault();
      formNote.className = "form-note";
      formNote.textContent = "";

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();

      if (!name || !email || !message) {
        formNote.className = "form-note error";
        formNote.textContent = "Please fill in all required fields.";
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        formNote.className = "form-note error";
        formNote.textContent = "Please enter a valid email address.";
        return;
      }

      formNote.className = "form-note success";
      formNote.textContent =
        "Thanks! Wire this form to your email service (Formspree, Netlify Forms, etc.) when you go live.";
      contactForm.reset();
    });
  }
})();
