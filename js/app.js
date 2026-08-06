/* =========================================================================
   HOMY — SHARED SITE ENGINE
   -------------------------------------------------------------------------
   Builds the header, the footer and the floating WhatsApp button on every
   page, handles the French / English switch, the mobile menu and the
   scroll animations.

   You do not need to edit this file.
   ========================================================================= */

(function () {
  "use strict";

  var CFG  = window.HOMY_CONFIG || {};
  var TEXT = window.HOMY_TEXT || {};
  var STORE_KEY = "homy-language";

  /* ----------------------------------------------------------- LANGUAGE */

  function readLang() {
    var saved;
    try { saved = window.localStorage.getItem(STORE_KEY); } catch (e) { saved = null; }
    if (saved === "fr" || saved === "en") return saved;
    return "fr"; // French is the default
  }

  var lang = readLang();

  function t(key) {
    var entry = TEXT[key];
    if (!entry) return key;
    return entry[lang] || entry.fr || key;
  }

  function setLang(next) {
    if (next !== "fr" && next !== "en") return;
    if (next === lang) return;
    lang = next;
    try { window.localStorage.setItem(STORE_KEY, next); } catch (e) { /* private mode */ }
    document.documentElement.setAttribute("lang", next);
    translate(document);
    syncLangButtons();
    document.dispatchEvent(new CustomEvent("homy:langchange", { detail: { lang: next } }));
  }

  /* Replace the text of every element carrying a data-i18n attribute. */
  function translate(root) {
    root = root || document;

    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    root.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    root.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });

    if (root === document) {
      var pageTitle = document.body.getAttribute("data-title-key");
      if (pageTitle && TEXT[pageTitle]) {
        document.title = t(pageTitle) + " — HOMY Premium Real Estate";
      }
    }
  }

  function syncLangButtons() {
    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang ? "true" : "false");
    });
  }

  /* -------------------------------------------------------- FORMATTING */

  function formatNumber(value) {
    try {
      return new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB").format(value);
    } catch (e) {
      return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
  }

  /* Returns { amount: "8 900 000 MAD", suffix: "/ mois" } */
  function formatPrice(property) {
    if (!property || !property.price) {
      return { amount: t("common.priceOnRequest"), suffix: "" };
    }
    return {
      amount: formatNumber(property.price) + " MAD",
      suffix: property.status === "rent" ? t("common.perMonth") : ""
    };
  }

  function propertyTitle(p) { return (p.title && (p.title[lang] || p.title.fr)) || ""; }
  function propertyDesc(p)  { return (p.description && (p.description[lang] || p.description.fr)) || ""; }
  function propertyHood(p)  { return (p.neighbourhood && (p.neighbourhood[lang] || p.neighbourhood.fr)) || ""; }
  function propertyHoodDesc(p) {
    return (p.neighbourhoodDescription && (p.neighbourhoodDescription[lang] || p.neighbourhoodDescription.fr)) || "";
  }
  function propertyFinishes(p) {
    return (p.finishes && (p.finishes[lang] || p.finishes.fr)) || [];
  }

  function placeLabel(p) {
    return propertyHood(p) + ", " + t("city." + p.city);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* ------------------------------------------------------------- ICONS */

  var ICON = {
    surface: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 3h18v18H3z"/><path d="M3 9h6V3M21 15h-6v6"/></svg>',
    bed:     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 18v-6a2 2 0 012-2h16a2 2 0 012 2v6M2 18h20M2 18v2M22 18v2"/><path d="M6 10V7a1 1 0 011-1h10a1 1 0 011 1v3"/></svg>',
    bath:    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 11h18v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3z"/><path d="M6 11V5a2 2 0 013.5-1.3M6 18l-1 3M18 18l1 3"/></svg>',
    stairs:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 20h5v-4h4v-4h4V8h5"/></svg>',
    arrow:   '<svg width="15" height="9" viewBox="0 0 20 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M0 5h18M14 1l4 4-4 4"/></svg>',
    check:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12l5 5L20 6"/></svg>',
    phone:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.2a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z"/></svg>',
    mail:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 6h20v12H2z"/><path d="M2 7l10 7 10-7"/></svg>',
    pin:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 22s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="11" r="2.6"/></svg>',
    clock:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    whatsapp:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.2s-.7 1-.9 1.2c-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.4.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2m0 1.7a8.3 8.3 0 016.7 13.2 8.3 8.3 0 01-10.9 2.4l-.4-.2-3 .8.8-3-.2-.4A8.3 8.3 0 0112 3.7"/></svg>',
    instagram:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z"/></svg>',
    linkedin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 8.5h-3V21h3V8.5zM5 3.2a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6zM21 14c0-3.2-1.7-4.7-4-4.7-1.8 0-2.6 1-3 1.7V8.5H11V21h3v-6.9c0-1.4.6-2.3 1.9-2.3s1.8.9 1.8 2.3V21h3.3V14z"/></svg>'
  };

  /* ------------------------------------------------------------ WHATSAPP */

  function whatsappLink(message) {
    var number = String(CFG.whatsapp || "").replace(/\D/g, "");
    var base = "https://wa.me/" + number;
    return message ? base + "?text=" + encodeURIComponent(message) : base;
  }

  /* ------------------------------------------------- HEADER AND FOOTER */

  var PAGES = [
    { key: "nav.home",       href: "index.html",      id: "home" },
    { key: "nav.properties", href: "proprietes.html", id: "properties" },
    { key: "nav.about",      href: "a-propos.html",   id: "about" },
    { key: "nav.invest",     href: "investir.html",   id: "invest" },
    { key: "nav.contact",    href: "contact.html",    id: "contact" }
  ];

  function currentPage() {
    return document.body.getAttribute("data-page") || "";
  }

  function brandMarkup() {
    return '<a class="brand" href="index.html" aria-label="HOMY Premium Real Estate">' +
             '<span class="brand__name">HOMY</span>' +
             '<span class="brand__line" data-i18n="brand.line">Premium Real Estate</span>' +
           '</a>';
  }

  function navLinks(cls) {
    var page = currentPage();
    return PAGES.map(function (p) {
      var active = p.id === page;
      return '<a class="' + cls + (active ? " is-active" : "") + '" href="' + p.href + '"' +
             (active ? ' aria-current="page"' : "") + ' data-i18n="' + p.key + '"></a>';
    }).join("");
  }

  function buildHeader() {
    var host = document.querySelector("[data-header]");
    if (!host) return;

    var transparent = host.hasAttribute("data-header-transparent");

    host.outerHTML =
      '<header class="site-header' + (transparent ? " site-header--transparent" : "") + '" id="siteHeader">' +
        '<div class="container">' +
          brandMarkup() +
          '<nav class="nav" aria-label="Menu">' + navLinks("nav__link") + '</nav>' +
          '<div class="header-tools">' +
            '<div class="lang" role="group" data-i18n-aria="a11y.language">' +
              '<button type="button" class="lang__btn" data-lang="fr">FR</button>' +
              '<button type="button" class="lang__btn" data-lang="en">EN</button>' +
            '</div>' +
            '<a class="btn btn--gold btn--sm header-cta" href="contact.html" data-i18n="nav.cta"></a>' +
            '<button type="button" class="burger" id="burger" data-i18n-aria="a11y.menu" aria-expanded="false">' +
              '<span></span><span></span><span></span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</header>' +
      '<div class="mobile-nav" id="mobileNav">' +
        '<nav aria-label="Menu">' + navLinks("mobile-nav__link") + '</nav>' +
        '<div class="mobile-nav__footer">' +
          '<a class="btn btn--gold" href="' + whatsappLink() + '" target="_blank" rel="noopener" data-i18n="cta.whatsapp"></a>' +
          '<div class="mobile-nav__contact">' +
            '<a href="tel:' + String(CFG.phonePrimary || "").replace(/\s/g, "") + '">' + escapeHtml(CFG.phonePrimary || "") + '</a>' +
            '<a href="mailto:' + escapeHtml(CFG.email || "") + '">' + escapeHtml(CFG.email || "") + '</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* A phone line in the footer — nothing at all if the number is empty. */
  function phoneListItem(number) {
    if (!number) return "";
    return '<li><a href="tel:' + String(number).replace(/[\s-]/g, "") + '">' +
           escapeHtml(number) + "</a></li>";
  }

  function buildFooter() {
    var host = document.querySelector("[data-footer]");
    if (!host) return;

    var socials = "";
    if (CFG.instagram) socials += '<a href="' + CFG.instagram + '" target="_blank" rel="noopener" aria-label="Instagram">' + ICON.instagram + '</a>';
    if (CFG.facebook)  socials += '<a href="' + CFG.facebook  + '" target="_blank" rel="noopener" aria-label="Facebook">'  + ICON.facebook  + '</a>';
    if (CFG.linkedin)  socials += '<a href="' + CFG.linkedin  + '" target="_blank" rel="noopener" aria-label="LinkedIn">'  + ICON.linkedin  + '</a>';

    var year = new Date().getFullYear();

    host.outerHTML =
      '<footer class="site-footer">' +
        '<div class="container">' +
          '<div class="footer-grid">' +

            '<div class="footer-brand">' +
              brandMarkup() +
              '<p class="footer-about" data-i18n="footer.about"></p>' +
            '</div>' +

            '<div>' +
              '<p class="footer-title" data-i18n="footer.navigate"></p>' +
              '<ul class="footer-list">' +
                PAGES.map(function (p) {
                  return '<li><a href="' + p.href + '" data-i18n="' + p.key + '"></a></li>';
                }).join("") +
              '</ul>' +
            '</div>' +

            '<div>' +
              '<p class="footer-title" data-i18n="footer.contact"></p>' +
              '<ul class="footer-list">' +
                phoneListItem(CFG.phonePrimary) +
                phoneListItem(CFG.phoneSecondary) +
                '<li><a href="mailto:' + escapeHtml(CFG.email || "") + '">' + escapeHtml(CFG.email || "") + '</a></li>' +
                '<li>' + escapeHtml(CFG.addressLine1 || "") + '</li>' +
                '<li>' + escapeHtml(CFG.addressLine2 || "") + '</li>' +
              '</ul>' +
            '</div>' +

            '<div>' +
              '<p class="footer-title" data-i18n="footer.follow"></p>' +
              '<div class="socials">' + socials + '</div>' +
            '</div>' +

          '</div>' +
          '<div class="footer-bottom">' +
            '<p>© ' + year + ' HOMY Premium Real Estate. <span data-i18n="footer.rights"></span></p>' +
            '<nav>' +
              '<a href="contact.html" data-i18n="footer.legal"></a>' +
              '<a href="contact.html" data-i18n="footer.privacy"></a>' +
            '</nav>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  /* A "skip to content" link for keyboard and screen-reader users. It stays
     invisible until it receives focus.                                     */
  function buildSkipLink() {
    var target = document.getElementById("main") ||
                 document.querySelector("main") ||
                 document.querySelector("body > section");
    if (!target) return;

    target.id = target.id || "main";
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");

    var link = document.createElement("a");
    link.className = "skip-link";
    link.href = "#" + target.id;
    link.setAttribute("data-i18n", "a11y.skip");
    document.body.insertBefore(link, document.body.firstChild);
  }

  function buildWhatsAppFloat() {
    if (document.querySelector(".wa-float")) return;
    var a = document.createElement("a");
    a.className = "wa-float";
    a.href = whatsappLink();
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("data-i18n-aria", "a11y.whatsapp");
    a.innerHTML = ICON.whatsapp;
    document.body.appendChild(a);
  }

  /* --------------------------------------------------- STRUCTURED DATA --
     A hidden block of information that tells Google and Apple Maps who the
     agency is, so the business shows up properly in search results.       */

  function addStructuredData(data) {
    var tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(data);
    document.head.appendChild(tag);
  }

  function buildAgencyData() {
    var socials = [CFG.instagram, CFG.facebook, CFG.linkedin].filter(Boolean);

    addStructuredData({
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: "HOMY Premium Real Estate",
      description: t("footer.about"),
      telephone: CFG.phonePrimary || undefined,
      email: CFG.email || undefined,
      foundingDate: String(CFG.foundedYear || ""),
      areaServed: ["Casablanca", "Marrakech"],
      address: {
        "@type": "PostalAddress",
        streetAddress: CFG.addressLine1 || "",
        addressLocality: "Casablanca",
        addressCountry: "MA"
      },
      sameAs: socials.length ? socials : undefined
    });
  }

  /* ---------------------------------------------------------- BEHAVIOUR */

  function wireHeaderBehaviour() {
    var header = document.getElementById("siteHeader");
    var burger = document.getElementById("burger");
    var drawer = document.getElementById("mobileNav");

    if (header && header.classList.contains("site-header--transparent")) {
      var onScroll = function () {
        header.classList.toggle("is-stuck", window.scrollY > 40);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    if (burger && drawer) {
      var setMenu = function (open) {
        drawer.classList.toggle("is-open", open);
        burger.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        burger.setAttribute("aria-label", t(open ? "a11y.closeMenu" : "a11y.menu"));
        document.body.classList.toggle("no-scroll", open);
      };

      burger.addEventListener("click", function () {
        setMenu(!drawer.classList.contains("is-open"));
      });

      drawer.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () { setMenu(false); });
      });

      /* Escape closes the menu and returns focus to the button. */
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && drawer.classList.contains("is-open")) {
          setMenu(false);
          burger.focus();
        }
      });
    }

    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-lang]");
      if (btn) setLang(btn.getAttribute("data-lang"));
    });
  }

  /* ---------------------------------------------- SCROLL REVEAL EFFECTS */

  var revealObserver = null;

  function observeReveals(root) {
    root = root || document;
    var items = root.querySelectorAll("[data-reveal]:not(.is-visible)");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    }
    items.forEach(function (el) { revealObserver.observe(el); });
  }

  /* --------------------------------------------- IMAGE SAFETY NET -------
     If a photo ever fails to load — a broken link, a slow connection, a
     typo in listings.json — we swap in the elegant HOMY placeholder that
     lives in img/placeholder.svg. The site never shows a broken image.   */

  var PLACEHOLDER = "img/placeholder.svg";

  function guardImages(root) {
    (root || document).querySelectorAll("img:not([data-guarded])").forEach(function (img) {
      img.setAttribute("data-guarded", "1");

      var swap = function () {
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        if (img.getAttribute("src") !== PLACEHOLDER) img.src = PLACEHOLDER;
      };

      img.addEventListener("error", swap, { once: true });

      /* The photo may already have failed before this script ran. */
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) swap();
    });
  }

  /* ------------------------------------------------------------- PUBLIC */

  window.HOMY = {
    get lang() { return lang; },
    setLang: setLang,
    t: t,
    translate: translate,
    icons: ICON,
    formatNumber: formatNumber,
    formatPrice: formatPrice,
    propertyTitle: propertyTitle,
    propertyDesc: propertyDesc,
    propertyHood: propertyHood,
    propertyHoodDesc: propertyHoodDesc,
    propertyFinishes: propertyFinishes,
    placeLabel: placeLabel,
    whatsappLink: whatsappLink,
    escapeHtml: escapeHtml,
    observeReveals: observeReveals,
    guardImages: guardImages,
    addStructuredData: addStructuredData,
    config: CFG
  };

  /* --------------------------------------------------------------- BOOT */

  function boot() {
    document.documentElement.setAttribute("lang", lang);
    buildHeader();
    buildFooter();
    buildSkipLink();
    buildWhatsAppFloat();
    translate(document);
    syncLangButtons();
    buildAgencyData();
    wireHeaderBehaviour();
    observeReveals(document);
    guardImages(document);
    document.dispatchEvent(new CustomEvent("homy:ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
