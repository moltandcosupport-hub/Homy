/* =========================================================================
   HOMY — PROPERTY LOADER
   -------------------------------------------------------------------------
   Reads listings.json and hands the properties to the pages.

   Note for the curious: web browsers block a page from reading a .json file
   when you open the HTML file straight from your computer (a security rule).
   So if that happens, the site quietly falls back to the copy stored in
   js/listings-backup.js, which lets you preview everything by simply
   double-clicking index.html.

   Once the site is online (Netlify, or any web host), listings.json is
   always the file that is used.

   You do not need to edit this file.
   ========================================================================= */

(function () {
  "use strict";

  var cache = null;

  function fromBackup() {
    return Array.isArray(window.HOMY_LISTINGS_BACKUP) ? window.HOMY_LISTINGS_BACKUP : [];
  }

  function load() {
    if (cache) return Promise.resolve(cache);

    if (!window.fetch || window.location.protocol === "file:") {
      cache = fromBackup();
      return Promise.resolve(cache);
    }

    return fetch("listings.json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        cache = Array.isArray(data) ? data : [];
        return cache;
      })
      .catch(function () {
        cache = fromBackup();
        return cache;
      });
  }

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  /* Properties that resemble the given one: same status first, then the
     closest price, preferring the same city.                             */
  function similar(list, property, limit) {
    limit = limit || 3;
    return list
      .filter(function (p) { return p.id !== property.id; })
      .map(function (p) {
        var score = 0;
        if (p.status === property.status) score += 100;
        if (p.city === property.city) score += 50;
        if (p.type === property.type) score += 30;
        var gap = Math.abs(p.price - property.price) / Math.max(property.price, 1);
        score += Math.max(0, 40 - gap * 40);
        return { property: p, score: score };
      })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, limit)
      .map(function (entry) { return entry.property; });
  }

  window.HOMY_DATA = { load: load, byId: byId, similar: similar };
})();
