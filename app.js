/* ======================================================
   WEDDING INVITATION — LAMIS & AYMAN  |  app.js
====================================================== */

/* ─── Wedding date ─── */
const WEDDING_DATE = new Date('2026-05-03T16:00:00');
const ENGAGEMENT_DATE = new Date('2025-05-16');   // approx. start of countdown period

/* ─── Seal reveal ─── */
const sealBtn = document.getElementById('seal-btn');
const invitation = document.getElementById('invitation');

sealBtn.addEventListener('click', () => {
  if (document.body.classList.contains('revealed')) return;
  document.body.classList.add('revealed');

  // Show invitation after flora slide-away transition
  setTimeout(() => {
    invitation.style.display = 'block';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        invitation.style.opacity = '1';
        invitation.style.transform = 'translateY(0)';
      });
    });
    initCountdown();
    animateProgress();
    // Hide hero from document flow first (after flora animation completes),
    // then scroll so the layout shift doesn't cause a jump.
    setTimeout(() => {
      const hero = document.getElementById('hero');
      hero.style.display = 'none';
      invitation.scrollIntoView({ behavior: 'smooth' });
    }, 1600);
  }, 900);
});

/* ─── Countdown ─── */
function initCountdown() {
  function update() {
    const now = new Date();
    const diff = WEDDING_DATE - now;
    if (diff <= 0) {
      document.getElementById('cd-number').textContent = '0';
      document.getElementById('cd-unit').textContent = 'The day has arrived!';
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    document.getElementById('cd-number').textContent = days;
  }
  update();
  setInterval(update, 60000);
}

function animateProgress() {
  const now = Date.now();
  const daysLeft = Math.max(0, WEDDING_DATE - now);
  const totalDays = 70; // days from today (2026-02-22) to wedding (2026-05-03)
  const pct = Math.min(98, Math.max(2, ((totalDays - daysLeft / 86400000) / totalDays) * 100));
  setTimeout(() => {
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = pct.toFixed(1) + '%';
  }, 400);
}

/* ─── RSVP ─── */
document.getElementById('btn-yes').addEventListener('click', () => {
  const name = document.getElementById('rsvp-name').value.trim() || 'you';
  document.getElementById('modal-yes-name').textContent = name;
  openModal('modal-yes');
});

document.getElementById('btn-no').addEventListener('click', () => {
  openModal('modal-no');
});

function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.modal));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

/* ─── Add to Calendar ─── */
document.getElementById('btn-calendar').addEventListener('click', () => {
  const start = '20260516T170000';
  const end = '20260517T020000';
  const title = encodeURIComponent("Lamis & Ayman's Wedding");
  const loc = encodeURIComponent('Les Andalous Cenia, Tunis');
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${loc}`;
  window.open(url, '_blank');
});

/* ─── Subtle float animation on hero petals ─── */
document.querySelectorAll('.petal-float').forEach((el, i) => {
  el.style.animationDelay = (i * 1.3) + 's';
  el.style.animationDuration = (6 + i * 1.5) + 's';
});

/* ─── Intersection Observer for card entrance ─── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.card').forEach(card => {
  card.style.animationPlayState = 'paused';
  observer.observe(card);
});
