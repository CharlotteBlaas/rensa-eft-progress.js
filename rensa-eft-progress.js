/* =========================
   rensa-eft-progress.js
   - zet dit bestand in GitHub
   - laad via GTM (Custom HTML tag)
   ========================= */
(function () {
  function parsePoints(raw) {
    raw = (raw || '').toString().trim();
    raw = raw.replace(/[^0-9.,-]/g, '');

    var lastDot = raw.lastIndexOf('.');
    var lastComma = raw.lastIndexOf(',');
    var decPos = Math.max(lastDot, lastComma);

    var normalized;
    if (decPos > -1) {
      var intPart = raw.slice(0, decPos).replace(/[.,]/g, '');
      var decPart = raw.slice(decPos + 1).replace(/[.,]/g, '');
      normalized = intPart + '.' + decPart;
    } else {
      normalized = raw.replace(/[.,]/g, '');
    }

    var points = parseFloat(normalized);
    if (!isFinite(points) || points < 0) points = 0;
    return points;
  }

  function initCard(card) {
    var raw = card.getAttribute('data-points') || '';
    var points = parsePoints(raw);

    var maxTickets = 8;
    var pointsPerTicket = 16;
    var maxPoints = maxTickets * pointsPerTicket; // 128

    var clamped = Math.min(points, maxPoints);

    var tickets = Math.floor(clamped / pointsPerTicket);
    if (tickets > maxTickets) tickets = maxTickets;

    var remainder = clamped % pointsPerTicket;
    var toNext = (tickets >= maxTickets) ? 0 : (pointsPerTicket - remainder);
    if (toNext === pointsPerTicket) toNext = 0;

    var pct = (maxPoints === 0) ? 0 : (clamped / maxPoints) * 100;
    pct = Math.max(0, Math.min(100, pct));

    // scoped query binnen dit card element
    var pointsEl  = card.querySelector('#rensa-eftp-points');
    var fillEl    = card.querySelector('#rensa-eftp-fill');
    var ticketsEl = card.querySelector('#rensa-eftp-tickets');
    var nextEl    = card.querySelector('#rensa-eftp-next');

    if (pointsEl) pointsEl.textContent = String(Math.round(points)) + ' Magische punten';
    if (fillEl)   fillEl.style.width = pct.toFixed(1) + '%';
    if (ticketsEl) ticketsEl.textContent = String(tickets);
    if (nextEl)   nextEl.textContent = String(Math.round(toNext));

    // sparkle sweep alleen bij voortgang > 0
    if (fillEl && pct > 0) fillEl.classList.add('rensa-eftp-fill--sparkle');

    // Milestones activeren
    var ms = card.querySelectorAll('.rensa-eftp-ms');
    for (var i = 0; i < ms.length; i++) {
      var idx = parseInt(ms[i].getAttribute('data-i'), 10);
      if (idx <= tickets) ms[i].classList.add('rensa-eftp-ms--on');
      else ms[i].classList.remove('rensa-eftp-ms--on');
    }
  }

  function initAll() {
    var cards = document.querySelectorAll('#rensa-eftp-card');
    for (var i = 0; i < cards.length; i++) initCard(cards[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
