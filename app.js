/* ======================================================
   WEDDING INVITATION — LAMIS & AYMAN  |  app.js
====================================================== */

/* ─── Wedding date ─── */
const WEDDING_DATE = new Date('2026-05-03T18:00:00');

/* ─── Music ─── */
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const iconOn = document.getElementById('icon-sound-on');
const iconOff = document.getElementById('icon-sound-off');

/* ─── Video Hero ─── */
const hero = document.getElementById('hero');
const video = document.getElementById('hero-video');
const overlay = document.getElementById('hero-overlay');
const invitation = document.getElementById('invitation');

/* ─── Welcome card slow-motion video ─── */
const welcomeVideo = document.getElementById('welcome-video');
if (welcomeVideo) {
  welcomeVideo.addEventListener('canplay', () => {
    welcomeVideo.playbackRate = 0.4;
  }, { once: true });
}

function showMusicToggle() {
  musicToggle.classList.add('visible');
}

function setMusicMuted(muted) {
  bgMusic.muted = muted;
  iconOn.style.display = muted ? 'none' : '';
  iconOff.style.display = muted ? '' : 'none';
  musicToggle.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
  musicToggle.setAttribute('title', muted ? 'Unmute music' : 'Mute music');
}

musicToggle.addEventListener('click', (e) => {
  e.stopPropagation(); // don't trigger hero click
  setMusicMuted(!bgMusic.muted);
});

let heroTriggered = false;

hero.addEventListener('click', () => {
  if (heroTriggered) return;
  heroTriggered = true;

  // 1. Fade out "Save the Date" overlay
  overlay.classList.add('fade-out');

  // 2. Start video + music simultaneously
  const videoPlay = video.play();
  bgMusic.volume = 0.7;
  bgMusic.play().then(() => {
    showMusicToggle();
  }).catch(() => {
    // Music blocked — show button anyway so user can trigger it manually
    showMusicToggle();
  });

  videoPlay.catch(() => {
    // Video blocked — roll back
    heroTriggered = false;
    overlay.classList.remove('fade-out');
    bgMusic.pause();
  });
});

// 3. When video finishes → fade hero out, reveal invitation content
video.addEventListener('ended', () => {
  // Unlock scroll immediately so users can start scrolling right away
  document.body.classList.add('hero-finished');

  // Reveal invitation content behind the fading hero
  invitation.style.display = 'block';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      invitation.style.opacity = '1';
      invitation.style.transform = 'translateY(0)';
    });
  });
  initCountdown();

  // Fade out hero and remove it after the CSS transition
  hero.classList.add('hero-done');
  setTimeout(() => {
    hero.style.display = 'none';
    invitation.scrollIntoView({ behavior: 'smooth' });
  }, 1250);
});

/* ─── Countdown ─── */
function initCountdown() {
  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMins = document.getElementById('cd-mins');
  const elSecs = document.getElementById('cd-secs');

  let timer;
  function update() {
    const now = new Date();
    const diff = WEDDING_DATE - now;
    if (diff <= 0) {
      if (elDays) elDays.textContent = '0';
      if (elHours) elHours.textContent = '00';
      if (elMins) elMins.textContent = '00';
      if (elSecs) elSecs.textContent = '00';
      clearInterval(timer);
      return;
    }
    const totalSec = Math.floor(diff / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (elDays) elDays.textContent = days;
    if (elHours) elHours.textContent = String(hours).padStart(2, '0');
    if (elMins) elMins.textContent = String(mins).padStart(2, '0');
    if (elSecs) elSecs.textContent = String(secs).padStart(2, '0');
  }

  update();
  timer = setInterval(update, 1000);
}

function animateProgress() {
  const now = Date.now();
  const daysLeft = Math.max(0, WEDDING_DATE - now);
  const totalDays = 70;
  const pct = Math.min(98, Math.max(2, ((totalDays - daysLeft / 86400000) / totalDays) * 100));
  setTimeout(() => {
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = pct.toFixed(1) + '%';
  }, 400);
}

/* ─── RSVP → Google Sheets ─── */
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbz8OKZLNe_RMP4cpKoz8hHU1IVs4ZU7dvI1SfCEipis45k494plz7yAf4URJ-glUI_w/exec';

async function submitRsvp(name, response) {
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors', // required for Apps Script — data still saves correctly
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, response })
    });
  } catch (_) { /* silent fail — sheet entry still recorded */ }
}

document.getElementById('btn-yes').addEventListener('click', async () => {
  const nameEl = document.getElementById('rsvp-name');
  const name = nameEl.value.trim();
  if (!name) { shakeInput(nameEl); return; }
  document.getElementById('modal-yes-name').textContent = name;
  submitRsvp(name, 'Yes ✓');
  openModal('modal-yes');
});

document.getElementById('btn-no').addEventListener('click', async () => {
  const nameEl = document.getElementById('rsvp-name');
  const name = nameEl.value.trim();
  if (!name) { shakeInput(nameEl); return; }
  submitRsvp(name, 'No ✗');
  openModal('modal-no');
});

function shakeInput(el) {
  el.style.borderColor = 'var(--rose)';
  el.style.animation = 'none';
  requestAnimationFrame(() => {
    el.style.animation = 'shakeField 0.4s ease';
  });
  el.addEventListener('input', () => {
    el.style.borderColor = '';
    el.style.animation = 'none';
  }, { once: true });
}

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
  const start = '20260503T180000';
  const end = '20260503T023000';
  const title = encodeURIComponent("Lamis & Ayman's Wedding");
  const loc = encodeURIComponent('Les Andalous Cenia, Tunis');
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${loc}`;
  window.open(url, '_blank');
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
