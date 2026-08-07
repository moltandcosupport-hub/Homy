/* =========================================================================
   HOMY — PAGE LOGIC
   -------------------------------------------------------------------------
   Draws the property cards, runs the filters on the properties page,
   builds the single-property page and handles the contact form.

   You do not need to edit this file.
   ========================================================================= */

(function () {
  "use strict";

  var H = window.HOMY;
  var DATA = window.HOMY_DATA;

  /* ================================================================ UTIL */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* Ask the image host for a smaller file on small screens. */
  function sized(url, width) {
    if (!url) return "";
    return url.replace(/([?&]w=)\d+/, "$1" + width);
  }
  function srcset(url) {
    return [600, 900, 1400, 1900].map(function (w) {
      return sized(url, w) + " " + w + "w";
    }).join(", ");
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  /* ======================================================= PROPERTY CARD */

  function cardHTML(p, index) {
    var price = H.formatPrice(p);
    var badgeClass = p.status === "rent" ? "badge badge--rent" : "badge";
    var badgeText = H.t(p.status === "rent" ? "common.forRent" : "common.forSale");
    var cover = p.images && p.images[0] ? p.images[0] : "";
    var title = H.propertyTitle(p);

    var specs =
      '<span>' + H.icons.surface + p.surface + ' ' + H.t("unit.sqm") + '</span>' +
      '<span>' + H.icons.bed + p.rooms + '</span>' +
      '<span>' + H.icons.bath + p.bathrooms + '</span>';

    return '' +
      '<a class="card" href="propriete.html?id=' + encodeURIComponent(p.id) + '"' +
        ' data-reveal data-reveal-delay="' + ((index % 3) + 1) + '">' +
        '<div class="card__media">' +
          '<span class="' + badgeClass + '">' + badgeText + '</span>' +
          '<img src="' + sized(cover, 900) + '" srcset="' + srcset(cover) + '"' +
            ' sizes="(min-width: 1060px) 33vw, (min-width: 700px) 50vw, 92vw"' +
            ' alt="' + H.escapeHtml(title) + '" loading="lazy" decoding="async" width="900" height="675">' +
        '</div>' +
        '<div class="card__body">' +
          '<p class="card__meta">' + H.t("type." + p.type) + ' · ' + H.escapeHtml(p.reference) + '</p>' +
          '<h3 class="card__title">' + H.escapeHtml(title) + '</h3>' +
          '<p class="card__place">' + H.escapeHtml(H.placeLabel(p)) + '</p>' +
          '<p class="card__price">' + price.amount + ' <span>' + price.suffix + '</span></p>' +
          '<div class="card__specs">' + specs + '</div>' +
        '</div>' +
      '</a>';
  }

  function renderCards(container, list) {
    if (!container) return;
    container.innerHTML = list.map(cardHTML).join("");
    H.observeReveals(container);
    H.guardImages(container);
  }

  /* Grey shapes shown while the property list is still loading, so the page
     never flashes an empty hole.                                          */
  function showSkeletons(container, howMany) {
    if (!container) return;
    var one =
      '<div class="card card-skeleton">' +
        '<div class="card-skeleton__media"></div>' +
        '<div class="card-skeleton__line card-skeleton__line--short"></div>' +
        '<div class="card-skeleton__line"></div>' +
        '<div class="card-skeleton__line card-skeleton__line--short"></div>' +
      '</div>';
    container.innerHTML = new Array(howMany + 1).join(one);
  }

  /* ================================================== SEARCH / FILTER UI */

  var BUDGETS = {
    sale: [1500000, 3000000, 5000000, 8000000, 12000000, 20000000],
    rent: [8500, 10000, 12000, 14000, 16000, 20000]
  };

  function fillBudget(select, status) {
    if (!select) return;
    var keep = select.value;
    var list = status === "rent" ? BUDGETS.rent : BUDGETS.sale;
    var suffix = status === "rent" ? " " + H.t("common.perMonth") : "";

    select.innerHTML =
      '<option value="">' + H.t("search.budgetAny") + '</option>' +
      list.map(function (v) {
        return '<option value="' + v + '">' + H.formatNumber(v) + " MAD" + suffix + '</option>';
      }).join("");

    if (keep && select.querySelector('option[value="' + keep + '"]')) select.value = keep;
  }

  function fillSelect(select, options, anyKey) {
    if (!select) return;
    var keep = select.value;
    select.innerHTML =
      '<option value="">' + H.t(anyKey) + '</option>' +
      options.map(function (o) {
        return '<option value="' + o.value + '">' + H.t(o.key) + '</option>';
      }).join("");
    if (keep) select.value = keep;
  }

  var STATUS_OPTIONS = [
    { value: "sale", key: "common.forSale" },
    { value: "rent", key: "common.forRent" }
  ];
  var CITY_OPTIONS = [
    { value: "casablanca", key: "city.casablanca" },
    { value: "marrakech", key: "city.marrakech" }
  ];
  var TYPE_OPTIONS = [
    { value: "apartment", key: "type.apartment" },
    { value: "villa", key: "type.villa" },
    { value: "penthouse", key: "type.penthouse" },
    { value: "riad", key: "type.riad" }
  ];

  function fillRooms(select) {
    if (!select) return;
    var keep = select.value;
    select.innerHTML =
      '<option value="">' + H.t("search.roomsAny") + '</option>' +
      [1, 2, 3, 4, 5].map(function (n) {
        return '<option value="' + n + '">' + n + "+</option>";
      }).join("");
    if (keep) select.value = keep;
  }

  function populateForm(form) {
    if (!form) return;
    fillSelect(form.querySelector('[name="status"]'), STATUS_OPTIONS, "search.statusAny");
    fillSelect(form.querySelector('[name="city"]'), CITY_OPTIONS, "search.cityAny");
    fillSelect(form.querySelector('[name="type"]'), TYPE_OPTIONS, "search.typeAny");
    fillRooms(form.querySelector('[name="rooms"]'));
    var status = form.querySelector('[name="status"]');
    fillBudget(form.querySelector('[name="budget"]'), status ? status.value : "");

    var sort = form.querySelector('[name="sort"]');
    if (sort) {
      var keep = sort.value;
      sort.innerHTML =
        '<option value="selection">' + H.t("properties.sort.recent") + '</option>' +
        '<option value="priceAsc">' + H.t("properties.sort.priceAsc") + '</option>' +
        '<option value="priceDesc">' + H.t("properties.sort.priceDesc") + '</option>' +
        '<option value="surface">' + H.t("properties.sort.surface") + '</option>';
      if (keep) sort.value = keep;
    }
  }

  /* ============================================================== HOME */

  function initHome() {
    var featured = $("#featuredGrid");
    showSkeletons(featured, 6);

    DATA.load().then(function (list) {
      var picks = list.filter(function (p) { return p.featured; }).slice(0, 6);
      if (picks.length < 6) picks = picks.concat(list.filter(function (p) { return !p.featured; })).slice(0, 6);
      renderCards(featured, picks);

      document.addEventListener("homy:langchange", function () {
        renderCards(featured, picks);
        $$(".card", featured).forEach(function (el) { el.classList.add("is-visible"); });
      });
    });

    var form = $("#heroSearch");
    if (form) {
      populateForm(form);
      var status = form.querySelector('[name="status"]');
      status.addEventListener("change", function () {
        fillBudget(form.querySelector('[name="budget"]'), status.value);
      });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var qs = new URLSearchParams();
        ["status", "city", "type", "budget", "rooms"].forEach(function (name) {
          var field = form.querySelector('[name="' + name + '"]');
          if (field && field.value) qs.set(name, field.value);
        });
        window.location.href = "proprietes.html" + (qs.toString() ? "?" + qs.toString() : "");
      });
      document.addEventListener("homy:langchange", function () { populateForm(form); });
    }
  }

  /* ======================================================== PROPERTIES */

  function initProperties() {
    var form = $("#filterForm");
    var grid = $("#propertyGrid");
    var empty = $("#emptyState");
    var count = $("#resultsCount");
    var all = [];

    function readFilters() {
      var out = {};
      ["status", "city", "type", "budget", "rooms", "sort"].forEach(function (name) {
        var field = form.querySelector('[name="' + name + '"]');
        out[name] = field ? field.value : "";
      });
      return out;
    }

    function apply() {
      var f = readFilters();

      var result = all.filter(function (p) {
        if (f.status && p.status !== f.status) return false;
        if (f.city && p.city !== f.city) return false;
        if (f.type && p.type !== f.type) return false;
        if (f.rooms && p.rooms < parseInt(f.rooms, 10)) return false;
        if (f.budget && p.price > parseInt(f.budget, 10)) return false;
        return true;
      });

      if (f.sort === "priceAsc")  result.sort(function (a, b) { return a.price - b.price; });
      if (f.sort === "priceDesc") result.sort(function (a, b) { return b.price - a.price; });
      if (f.sort === "surface")   result.sort(function (a, b) { return b.surface - a.surface; });

      renderCards(grid, result);
      grid.hidden = result.length === 0;
      empty.hidden = result.length !== 0;

      if (count) {
        count.innerHTML = "<strong>" + result.length + "</strong> " +
          H.t(result.length === 1 ? "properties.results" : "properties.resultsPlural");
      }

      var qs = new URLSearchParams();
      Object.keys(f).forEach(function (k) {
        if (f[k] && !(k === "sort" && f[k] === "selection")) qs.set(k, f[k]);
      });
      var url = window.location.pathname + (qs.toString() ? "?" + qs.toString() : "");
      if (window.history && window.history.replaceState) window.history.replaceState(null, "", url);
    }

    function applyUrlToForm() {
      var qp = params();
      ["status", "city", "type", "rooms", "sort"].forEach(function (name) {
        var field = form.querySelector('[name="' + name + '"]');
        var value = qp.get(name);
        if (field && value) field.value = value;
      });
      var status = form.querySelector('[name="status"]');
      fillBudget(form.querySelector('[name="budget"]'), status ? status.value : "");
      var budget = qp.get("budget");
      var budgetField = form.querySelector('[name="budget"]');
      if (budgetField && budget && budgetField.querySelector('option[value="' + budget + '"]')) {
        budgetField.value = budget;
      }
    }

    populateForm(form);
    applyUrlToForm();
    showSkeletons(grid, 6);

    form.addEventListener("change", function (e) {
      if (e.target.name === "status") {
        fillBudget(form.querySelector('[name="budget"]'), e.target.value);
      }
      apply();
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); apply(); });

    var reset = $("#resetFilters");
    if (reset) {
      reset.addEventListener("click", function (e) {
        e.preventDefault();
        form.reset();
        $$("select", form).forEach(function (s) { s.value = ""; });
        var sort = form.querySelector('[name="sort"]');
        if (sort) sort.value = "selection";
        fillBudget(form.querySelector('[name="budget"]'), "");
        apply();
      });
    }

    DATA.load().then(function (list) {
      all = list.slice();
      apply();
    });

    document.addEventListener("homy:langchange", function () {
      populateForm(form);
      apply();
    });
  }

  /* ==================================================== SINGLE PROPERTY */

  var galleryStep = null;      /* function that moves the gallery */
  var galleryIndex = 0;        /* photo currently on screen */
  var galleryKeysBound = false;

  function initProperty() {
    var id = params().get("id");
    var root = $("#propertyRoot");
    var notFound = $("#propertyNotFound");

    DATA.load().then(function (list) {
      var p = id ? DATA.byId(list, id) : null;

      if (!p) {
        root.hidden = true;
        notFound.hidden = false;
        return;
      }

      var similar = DATA.similar(list, p, 3);
      render(p, similar);
      describeForSearchEngines(p);

      document.addEventListener("homy:langchange", function () { render(p, similar); });
    });

    function render(p, similarList) {
      document.title = H.propertyTitle(p) + " — HOMY Premium Real Estate";

      renderGallery(p);
      renderDetails(p);
      renderCards($("#similarGrid"), similarList);
      H.translate(root);
      H.guardImages(root);
      H.observeReveals(root);
    }

    /* Describes this property to Google, and fills in the preview card that
       appears when someone shares the link on WhatsApp or Facebook.       */
    function describeForSearchEngines(p) {
      var title = H.propertyTitle(p);
      var summary = H.propertyDesc(p).slice(0, 200);

      var setMeta = function (attr, key, content) {
        var tag = document.head.querySelector("meta[" + attr + '="' + key + '"]');
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute(attr, key);
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
      };

      setMeta("name", "description", summary);
      setMeta("property", "og:title", title + " — HOMY");
      setMeta("property", "og:description", summary);
      setMeta("property", "og:type", "website");
      if (p.images && p.images[0]) setMeta("property", "og:image", p.images[0]);

      H.addStructuredData({
        "@context": "https://schema.org",
        "@type": "Residence",
        name: title,
        description: H.propertyDesc(p),
        image: p.images || [],
        numberOfRooms: p.rooms,
        numberOfBathroomsTotal: p.bathrooms,
        floorSize: { "@type": "QuantitativeValue", value: p.surface, unitCode: "MTK" },
        address: {
          "@type": "PostalAddress",
          addressLocality: H.propertyHood(p),
          addressRegion: H.t("city." + p.city),
          addressCountry: "MA"
        },
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: "MAD",
          availability: "https://schema.org/InStock",
          businessFunction: p.status === "rent"
            ? "http://purl.org/goodrelations/v1#LeaseOut"
            : "http://purl.org/goodrelations/v1#Sell"
        }
      });
    }

    /* ---- gallery ---- */
    function renderGallery(p) {
      var stage = $("#galleryStage");
      var thumbs = $("#galleryThumbs");
      var counter = $("#galleryCounter");
      var images = p.images || [];
      var index = 0;

      stage.innerHTML = images.map(function (src, i) {
        return '<img src="' + sized(src, i === 0 ? 1900 : 1400) + '" srcset="' + srcset(src) + '"' +
               ' sizes="100vw" alt="' + H.escapeHtml(H.propertyTitle(p)) + ' — ' + (i + 1) + '"' +
               ' class="' + (i === 0 ? "is-active" : "") + '"' +
               (i === 0 ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">';
      }).join("");

      thumbs.innerHTML = images.map(function (src, i) {
        return '<button type="button" class="' + (i === 0 ? "is-active" : "") + '" data-index="' + i + '"' +
               ' aria-label="' + (i + 1) + '">' +
               '<img src="' + sized(src, 300) + '" alt="" loading="lazy" decoding="async">' +
               '</button>';
      }).join("");

      function show(next) {
        if (!images.length) return;
        index = (next + images.length) % images.length;
        galleryIndex = index;
        $$("img", stage).forEach(function (img, i) { img.classList.toggle("is-active", i === index); });
        $$("button", thumbs).forEach(function (b, i) { b.classList.toggle("is-active", i === index); });
        if (counter) counter.textContent = (index + 1) + " / " + images.length;
      }

      $("#galleryPrev").onclick = function () { show(index - 1); };
      $("#galleryNext").onclick = function () { show(index + 1); };
      thumbs.onclick = function (e) {
        var btn = e.target.closest("button[data-index]");
        if (btn) show(parseInt(btn.getAttribute("data-index"), 10));
      };

      /* Left and right arrow keys move through the photos. Registered once,
         so it never overwrites another key handler on the page.            */
      galleryStep = show;
      if (!galleryKeysBound) {
        galleryKeysBound = true;
        document.addEventListener("keydown", function (e) {
          if (!galleryStep) return;
          var tag = (document.activeElement || {}).tagName;
          if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
          if (e.key === "ArrowLeft")  { galleryStep(galleryIndex - 1); }
          if (e.key === "ArrowRight") { galleryStep(galleryIndex + 1); }
        });
      }

      show(0);
    }

    /* ---- text, specs and contact ---- */
    function renderDetails(p) {
      var price = H.formatPrice(p);

      $("#propRef").textContent = H.t("common.reference") + " " + p.reference + " · " +
        H.t(p.status === "rent" ? "common.forRent" : "common.forSale");
      $("#propTitle").textContent = H.propertyTitle(p);
      $("#propPlace").textContent = H.placeLabel(p);
      $("#propPrice").innerHTML = price.amount + ' <span>' + price.suffix + '</span>';

      /* Specs — only show the ones that make sense for this property */
      var specs = [
        { value: p.surface + " " + H.t("unit.sqm"), label: H.t("spec.surface") },
        { value: p.rooms, label: H.t("spec.rooms") },
        { value: p.bathrooms, label: H.t("spec.bathrooms") }
      ];
      if (p.land)    specs.push({ value: p.land + " " + H.t("unit.sqm"), label: H.t("spec.land") });
      if (p.terrace) specs.push({ value: p.terrace + " " + H.t("unit.sqm"), label: H.t("spec.terrace") });

      /* Only show the floor when we actually know it. Leaving "floor" out of
         listings.json hides the box rather than guessing "ground floor".   */
      if (p.floor !== null && p.floor !== undefined) {
        specs.push({
          value: p.floor
            ? (p.floorsTotal ? p.floor + " / " + p.floorsTotal : p.floor)
            : H.t("spec.groundFloor"),
          label: H.t("spec.floor")
        });
      }
      if (p.parking) specs.push({ value: p.parking, label: H.t("spec.parking") });
      if (p.year)    specs.push({ value: p.year, label: H.t("spec.year") });

      $("#propSpecs").innerHTML = specs.map(function (s) {
        return '<div class="spec"><div class="spec__value">' + s.value + '</div>' +
               '<div class="spec__label">' + s.label + '</div></div>';
      }).join("");

      $("#propDescription").textContent = H.propertyDesc(p);
      $("#propNeighbourhood").textContent = H.propertyHoodDesc(p);
      $("#propFinishes").innerHTML = H.propertyFinishes(p).map(function (f) {
        return "<li>" + H.escapeHtml(f) + "</li>";
      }).join("");

      var message = H.t("property.whatsappMessage") + " " + p.reference + " — " + H.propertyTitle(p) + ".";
      $("#propWhatsapp").href = H.whatsappLink(message);

      var phone = H.config.phonePrimary || "";
      var phoneLink = $("#propPhone");
      phoneLink.href = "tel:" + phone.replace(/\s/g, "");
      phoneLink.textContent = phone;
    }
  }

  /* ============================================================ CONTACT */

  function initContact() {
    var C = H.config;

    var phones = $("#infoPhones");
    if (phones) {
      phones.innerHTML = [C.phonePrimary, C.phoneSecondary]
        .filter(Boolean)
        .map(function (n) {
          return '<a href="tel:' + String(n).replace(/[\s-]/g, "") + '">' + H.escapeHtml(n) + "</a>";
        })
        .join("<br>");
    }
    var mail = $("#infoEmail");
    if (mail) { mail.href = "mailto:" + (C.email || ""); mail.textContent = C.email || ""; }
    var wa = $("#infoWhatsapp");
    if (wa) { wa.href = H.whatsappLink(); wa.textContent = C.phonePrimary || ""; }
    var addr = $("#infoAddress");
    if (addr) {
      addr.innerHTML = H.escapeHtml(C.addressLine1 || "") + "<br>" +
                       H.escapeHtml(C.addressLine2 || "") + "<br>" +
                       H.escapeHtml(C.addressCountry || "");
    }
    var waBtn = $("#contactWhatsappBtn");
    if (waBtn) waBtn.href = H.whatsappLink();

    var map = $("#contactMap");
    if (map) {
      map.src = "https://www.google.com/maps?q=" + (C.mapQuery || "Casablanca") + "&output=embed";
    }

    function paintHours() {
      var hours = $("#infoHours");
      if (!hours || !C.hoursWeek) return;
      hours.innerHTML = H.escapeHtml(C.hoursWeek[H.lang] || C.hoursWeek.fr) + "<br>" +
                        H.escapeHtml(C.hoursSat[H.lang] || C.hoursSat.fr);
    }
    paintHours();
    document.addEventListener("homy:langchange", paintHours);

    /* Subject list needs translating on language change */
    function paintSubjects() {
      var select = $("#contactSubject");
      if (!select) return;
      var keep = select.value;
      var keys = ["buy", "sell", "rent", "valuation", "invest", "other"];
      select.innerHTML = keys.map(function (k) {
        return '<option value="' + k + '">' + H.t("contact.form.subject." + k) + "</option>";
      }).join("");
      if (keep) select.value = keep;
    }
    paintSubjects();
    document.addEventListener("homy:langchange", paintSubjects);

    /* Sending a message.
       Once the site is published on Netlify the form posts straight to
       Netlify and the message lands in your inbox. If that is unavailable —
       you are previewing the files from your own computer, or the network
       fails — we fall back to opening the visitor's email app with the
       message already written.                                            */
    var form = $("#contactForm");
    if (!form) return;

    var status = $("#formStatus");
    var submitBtn = form.querySelector('button[type="submit"]');

    function value(name) {
      var f = form.querySelector('[name="' + name + '"]');
      return f ? f.value.trim() : "";
    }

    function subjectLabel() {
      var s = $("#contactSubject");
      return s && s.selectedIndex >= 0 ? s.options[s.selectedIndex].text : "";
    }

    function say(key) {
      if (!status) return;
      status.textContent = H.t(key);
      status.classList.add("is-visible");
    }

    function openEmailApp() {
      var body = [
        H.t("contact.form.name") + ": " + value("name"),
        H.t("contact.form.email") + ": " + value("email"),
        H.t("contact.form.phone") + ": " + value("phone"),
        H.t("contact.form.subject") + ": " + subjectLabel(),
        "",
        value("message")
      ].join("\n");

      window.location.href = "mailto:" + (C.email || "") +
        "?subject=" + encodeURIComponent("HOMY — " + subjectLabel() + " — " + value("name")) +
        "&body=" + encodeURIComponent(body);

      say("contact.form.success");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var online = window.fetch && /^https?:$/.test(window.location.protocol);
      if (!online) { openEmailApp(); return; }

      if (submitBtn) submitBtn.disabled = true;
      say("contact.form.sending");

      fetch(form.getAttribute("action") || window.location.pathname, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          form.reset();
          paintSubjects();
          say("contact.form.sent");
        })
        .catch(function () {
          openEmailApp();
        })
        .then(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  /* =============================================================== BOOT */

  document.addEventListener("homy:ready", function () {
    var page = document.body.getAttribute("data-page");
    if (page === "home")       initHome();
    if (page === "properties") initProperties();
    if (page === "property")   initProperty();
    if (page === "contact")    initContact();
  });
})();
