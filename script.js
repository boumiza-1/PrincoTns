
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  // Menu mobile
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Fermer le menu" : "Ouvrir le menu"
      );
      menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Ouvrir le menu");
        menuToggle.textContent = "☰";
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
      }
    });
  }

  // Recherche sur les services et les projets
  const searchInput = document.getElementById("siteSearch");
  const searchFeedback = document.getElementById("searchFeedback");
  const emptyState = document.getElementById("emptyState");
  const serviceCards = [
    ...document.querySelectorAll("#serviceGrid .service-card")
  ];
  const projectCards = [
    ...document.querySelectorAll("#portfolio .project")
  ];

  function normalizeText(value) {
    return value
      .toLocaleLowerCase("fr")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function runSearch() {
    if (!searchInput) return;

    const query = normalizeText(searchInput.value);
    let visibleServices = 0;
    let visibleProjects = 0;

    serviceCards.forEach(card => {
      const content = normalizeText(
        card.innerText + " " + (card.dataset.search || "")
      );
      const matches = !query || content.includes(query);

      card.hidden = !matches;
      if (matches) visibleServices++;
    });

    projectCards.forEach(card => {
      const content = normalizeText(
        card.innerText + " " + (card.dataset.search || "")
      );
      const matches = !query || content.includes(query);

      card.hidden = !matches;
      if (matches) visibleProjects++;
    });

    if (emptyState) {
      emptyState.hidden = visibleServices + visibleProjects > 0;
    }

    if (searchFeedback) {
      if (!query) {
        searchFeedback.textContent = "";
      } else {
        searchFeedback.textContent =
          `${visibleServices} service(s) et ${visibleProjects} projet(s) trouvé(s).`;
      }
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", runSearch);

    searchInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("services")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  }

  // Animations d'apparition
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach(element => observer.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add("visible"));
  }

  // Formulaire : préparer une demande et l'ouvrir sur WhatsApp
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", event => {
      event.preventDefault();

      if (!contactForm.reportValidity()) return;

      const name = document.getElementById("clientName").value.trim();
      const phone = document.getElementById("clientPhone").value.trim();
      const service = document.getElementById("clientService").value;
      const message = document.getElementById("clientMessage").value.trim();

      const whatsappMessage = [
        "Bonjour PRINCO ! Je souhaite demander des informations.",
        "",
        `Nom : ${name}`,
        `Téléphone : ${phone || "Non renseigné"}`,
        `Service : ${service}`,
        `Projet : ${message}`
      ].join("\n");

      const url =
        "https://wa.me/21696206615?text=" +
        encodeURIComponent(whatsappMessage);

      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  // Année automatique dans le footer
  const yearElement = document.getElementById("currentYear");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});