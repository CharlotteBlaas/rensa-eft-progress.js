(function () {
  // voorkom dubbele init (GTM kan soms opnieuw injecteren)
  if (window.__rensaEftProgressLoaded) return;
  window.__rensaEftProgressLoaded = true;

  function parsePoints(raw) {
    raw = (raw || "").toString().trim();
    // accepteert ook "123,0" of "1.234,56" of "123 Magische punten"
    raw = raw.replace(/[^0-9.,-]/g, "");

    var lastDot = raw.lastIndexOf(".");
    var lastComma = raw.lastIndexOf(",");
    var decPos = Math.max(lastDot, lastComma);

    var normalized;
    if (decPos > -1) {
      var intPart = raw.slice(0, decPos).replace(/[.,]/g, "");
      var decPart = raw.slice(decPos + 1).replace(/[.,]/g, "");
      normalized = intPart + "." + decPart;
    } else {
      normalized = raw.replace(/[.,]/g, "");
    }

    var points = parseFloat(normalized);
    if (!isFinite(points) || points < 0) points = 0;
    return points;
  }

  function initCard(card) {
    // al gedaan?
    if (card.getAttribute("data-eftp-init") === "1") return;
    card.setAttribute("data-eftp-init", "1");

    var raw = card.getAttribute("data-points") || "";
    var points = parsePoints(raw);

    var maxTickets = 8;
    var pointsPerTicket = 16;
    var maxPoints = maxTickets * pointsPerTicket; // 128

    var clamped = Math.min(points, maxPoints);

    var tickets = Math.floor(clamped / pointsPerTicket);
    if (tickets > maxTickets) tickets = maxTickets;

    var remainder = clamped % pointsPerTicket;
    var toNext = tickets >= maxTickets ? 0 : (pointsPerTicket - remainder);
    if (toNext === pointsPerTicket) toNext = 0;

    var pct = maxPoints === 0 ? 0 : (clamped / maxPoints) * 100;
    pct = Math.max(0, Math.min(100, pct));

    // scoped
    var pointsEl  = card.querySelector("#rensa-eftp-points");
    var fillEl    = card.querySelector("#rensa-eftp-fill");
    var ticketsEl = card.querySelector("#rensa-eftp-tickets");
    var nextEl    = card.querySelector("#rensa-eftp-next");

    if (pointsEl) pointsEl.textContent = String(Math.round(points)) + " Magische punten";
    if (fillEl)   fillEl.style.width = pct.toFixed(1) + "%";
    if (ticketsEl) ticketsEl.textContent = String(tickets);
    if (nextEl)   nextEl.textContent = String(Math.round(toNext));

    // sparkle alleen als voortgang > 0
    if (fillEl && pct > 0) fillEl.classList.add("rensa-eftp-fill--sparkle");

    // milestones
    var ms = card.querySelectorAll(".rensa-eftp-ms");
    for (var i = 0; i < ms.length; i++) {
      var idx = parseInt(ms[i].getAttribute("data-i"), 10);
      if (idx <= tickets) ms[i].classList.add("rensa-eftp-ms--on");
      else ms[i].classList.remove("rensa-eftp-ms--on");
    }

    // debug (handig in console)
    window.__rensaEftProgressDebug = {
      found: true,
      rawPoints: raw,
      parsedPoints: points,
      pct: pct,
      tickets: tickets,
      toNext: toNext
    };
  }

  function tryInit() {
    var card = document.getElementById("rensa-eftp-card");
    if (card) initCard(card);
    return !!card;
  }

  // 1) Direct proberen
  if (tryInit()) return;

  // 2) Pollen (voor late renders)
  var tries = 0;
  var maxTries = 60; // ~15 sec
  var timer = setInterval(function () {
    tries++;
    if (tryInit() || tries >= maxTries) clearInterval(timer);
  }, 250);

  // 3) Observer (voor SPA/Angular updates)
  if (window.MutationObserver) {
    var obs = new MutationObserver(function () {
      if (tryInit()) obs.disconnect();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
