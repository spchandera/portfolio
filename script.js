const body = document.body;
const loader = document.getElementById("loader");
const header = document.querySelector(".site-header");
const navToggle = document.getElementById("nav-toggle");
const siteNav = document.getElementById("site-nav");
const themeToggle = document.getElementById("theme-toggle");
const scrollTopButton = document.getElementById("scroll-top");
const typingTarget = document.getElementById("typing-text");
const counters = document.querySelectorAll(".counter");
const revealElements = document.querySelectorAll(".reveal");
const skillMeters = document.querySelectorAll(".skill-meter span");
const navLinks = document.querySelectorAll(".site-nav a");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const currentYear = document.getElementById("year");

const typingWords = [
  "custom Shopify themes",
  "performance optimization",
  "API and Klaviyo integrations",
  "conversion-friendly storefront UX"
];

let typingIndex = 0;
let charIndex = 0;
let isDeleting = false;

function hideLoader() {
  if (!loader) {
    return;
  }

  window.setTimeout(() => {
    loader.classList.add("is-hidden");
  }, 700);
}

function applyTheme(theme) {
  body.dataset.theme = theme;
  localStorage.setItem("portfolio-theme", theme);
  themeToggle?.setAttribute("aria-pressed", String(theme === "light"));
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("portfolio-theme");
  const preferredTheme = savedTheme === "light" ? "light" : "dark";
  applyTheme(preferredTheme);
}

function toggleMenu() {
  if (!navToggle || !siteNav) {
    return;
  }

  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
}

function closeMenu() {
  if (!navToggle || !siteNav) {
    return;
  }

  siteNav.classList.remove("is-open");
  navToggle.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}

function typeEffect() {
  if (!typingTarget) {
    return;
  }

  const currentWord = typingWords[typingIndex];
  const speed = isDeleting ? 45 : 90;

  typingTarget.textContent = currentWord.slice(0, charIndex);

  if (!isDeleting && charIndex < currentWord.length) {
    charIndex += 1;
  } else if (isDeleting && charIndex > 0) {
    charIndex -= 1;
  } else if (!isDeleting && charIndex === currentWord.length) {
    isDeleting = true;
    window.setTimeout(typeEffect, 1300);
    return;
  } else {
    isDeleting = false;
    typingIndex = (typingIndex + 1) % typingWords.length;
  }

  window.setTimeout(typeEffect, speed);
}

function animateCounter(counter) {
  if (counter.dataset.counted === "true") {
    return;
  }

  const target = Number(counter.dataset.target || 0);
  const suffix = counter.dataset.suffix || "";
  const duration = 1400;
  const startTime = performance.now();

  counter.dataset.counted = "true";

  function updateCounter(timestamp) {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = `${Math.round(target * eased)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }

  requestAnimationFrame(updateCounter);
}

function revealOnScroll() {
  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    skillMeters.forEach((meter) => {
      meter.style.width = meter.dataset.width || "100%";
    });
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");

        if (entry.target.classList.contains("stat-card")) {
          const counter = entry.target.querySelector(".counter");
          if (counter) {
            animateCounter(counter);
          }
        }

        if (entry.target.classList.contains("skill-card")) {
          const meter = entry.target.querySelector(".skill-meter span");
          if (meter) {
            meter.style.width = meter.dataset.width || "100%";
          }
        }

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function updateScrollState() {
  const scrolled = window.scrollY > 18;
  header?.classList.toggle("is-scrolled", scrolled);
  scrollTopButton?.classList.toggle("is-visible", window.scrollY > 500);
}

function updateActiveNavLink() {
  const sections = [...document.querySelectorAll("main section[id]")];
  const scrollPosition = window.scrollY + 140;

  let currentSectionId = "";

  sections.forEach((section) => {
    if (scrollPosition >= section.offsetTop) {
      currentSectionId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentSectionId}`;
    link.classList.toggle("is-active", isActive);
  });
}

function validateField(field) {
  const wrapper = field.closest(".form-field");
  const errorElement = wrapper?.querySelector(".error-message");
  const value = field.value.trim();

  let error = "";

  if (!value) {
    error = "This field is required.";
  } else if (field.name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    error = "Please enter a valid email address.";
  } else if (field.name === "message" && value.length < 12) {
    error = "Please enter at least 12 characters.";
  } else if (field.name === "name" && value.length < 2) {
    error = "Please enter at least 2 characters.";
  }

  if (wrapper) {
    wrapper.classList.toggle("is-error", Boolean(error));
  }

  if (errorElement) {
    errorElement.textContent = error;
  }

  return !error;
}

function handleFormSubmit(event) {
  event.preventDefault();

  if (!contactForm || !formStatus) {
    return;
  }

  const fields = [...contactForm.querySelectorAll("input, textarea")];
  const isValid = fields.every((field) => validateField(field));

  formStatus.classList.remove("is-success", "is-error");

  if (!isValid) {
    formStatus.textContent = "Please fix the highlighted fields and try again.";
    formStatus.classList.add("is-error");
    return;
  }

  formStatus.textContent = "Thanks for reaching out — I'll get back to you shortly.";
  formStatus.classList.add("is-success");
  contactForm.reset();
}

function initializeEvents() {
  themeToggle?.addEventListener("click", () => {
    const nextTheme = body.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });

  navToggle?.addEventListener("click", toggleMenu);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  scrollTopButton?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", () => {
    updateScrollState();
    updateActiveNavLink();
  });

  document.addEventListener("click", (event) => {
    if (!siteNav || !navToggle) {
      return;
    }

    const clickedInsideNav = siteNav.contains(event.target);
    const clickedToggle = navToggle.contains(event.target);

    if (!clickedInsideNav && !clickedToggle) {
      closeMenu();
    }
  });

  if (contactForm) {
    const formFields = contactForm.querySelectorAll("input, textarea");

    formFields.forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.closest(".form-field")?.classList.contains("is-error")) {
          validateField(field);
        }
      });
    });

    contactForm.addEventListener("submit", handleFormSubmit);
  }
}

window.addEventListener("load", hideLoader);

initializeTheme();
initializeEvents();
revealOnScroll();
typeEffect();
updateScrollState();
updateActiveNavLink();

if (currentYear) {
  currentYear.textContent = new Date().getFullYear().toString();
}
