(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Nama tamu dapat dikirim melalui tautan: index.html?to=Nama%20Tamu
  const params = new URLSearchParams(window.location.search);
  const guest = params.get('to');
  if (guest) $('#guestName').textContent = guest.replace(/[<>]/g, '').slice(0, 80);

  const opening = $('#opening');
  const invitation = $('#invitation');
  const envelope = $('#envelope');
  const openButton = $('#openInvitation');
  const video = $('#heroVideo');
  const music = $('#weddingMusic');
  const musicControl = $('#musicControl');
  const musicToggle = $('#musicToggle');
  const musicLabel = $('#musicLabel');
  let opened = false;

  openButton.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    envelope.classList.add('open');
    openButton.disabled = true;
    setTimeout(() => {
      opening.classList.add('is-hidden');
      document.body.classList.remove('is-locked');
      invitation.setAttribute('aria-hidden', 'false');
      musicControl.classList.add('visible');
      video.play().catch(() => {});
      // Browser biasanya mensyaratkan interaksi pengguna sebelum audio diputar.
      music.play().then(updateMusicState).catch(() => updateMusicState());
      setTimeout(() => opening.remove(), 1200);
    }, 1050);
  });

  function updateMusicState() {
    const playing = !music.paused;
    musicControl.classList.toggle('playing', playing);
    musicLabel.textContent = playing ? 'NOW PLAYING' : 'PLAY MUSIC';
    musicToggle.setAttribute('aria-label', playing ? 'Jeda musik' : 'Putar musik');
  }
  musicToggle.addEventListener('click', () => {
    if (music.paused) music.play().then(updateMusicState).catch(() => alert('File musik belum tersedia. Tambahkan assets/musik-undangan.mp3.'));
    else { music.pause(); updateMusicState(); }
  });
  music.addEventListener('play', updateMusicState);
  music.addEventListener('pause', updateMusicState);

  // Countdown menggunakan zona waktu WIB (UTC+7), bukan zona waktu perangkat.
  const weddingDate = new Date('2026-12-20T08:00:00+07:00').getTime();
  function updateCountdown() {
    let distance = weddingDate - Date.now();
    if (distance < 0) distance = 0;
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);
    $('#days').textContent = String(days).padStart(2, '0');
    $('#hours').textContent = String(hours).padStart(2, '0');
    $('#minutes').textContent = String(minutes).padStart(2, '0');
    $('#seconds').textContent = String(seconds).padStart(2, '0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Scroll reveal dan parallax ringan pada video hero.
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => revealObserver.observe(el));
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (window.scrollY < window.innerHeight) video.style.transform = `scale(1.04) translateY(${window.scrollY * 0.12}px)`;
      ticking = false;
    });
  }, { passive: true });

  // Kelopak bunga jatuh secara berkala.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function createPetal() {
    if (reducedMotion || !opened) return;
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = Math.random() > .5 ? '✿' : '❀';
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.fontSize = `${10 + Math.random() * 13}px`;
    petal.style.setProperty('--drift', `${Math.random() * 180 - 90}px`);
    petal.style.animationDuration = `${7 + Math.random() * 6}s`;
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 14000);
  }
  setInterval(createPetal, 850);

  // Galeri lightbox dengan tombol next/previous dan swipe di layar sentuh.
  const galleryItems = $$('.gallery-item:not(.gallery-duplicate)');
  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightboxImage');
  let activeImage = 0;
  function showImage(index) {
    activeImage = (index + galleryItems.length) % galleryItems.length;
    lightboxImage.src = galleryItems[activeImage].dataset.full;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  galleryItems.forEach((item, index) => item.addEventListener('click', () => showImage(index)));
  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightboxPrev').addEventListener('click', () => showImage(activeImage - 1));
  $('#lightboxNext').addEventListener('click', () => showImage(activeImage + 1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(activeImage - 1);
    if (e.key === 'ArrowRight') showImage(activeImage + 1);
  });
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) > 45) showImage(activeImage + (delta < 0 ? 1 : -1));
  }, { passive: true });

  // RSVP diarahkan ke WhatsApp. Ganti nomor di bawah bila diperlukan.
  const whatsappNumber = '6285721279319';
  $('#rsvpForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#rsvpName').value.trim();
    const attendance = $('#attendance').value;
    const count = $('#guestCount').value;
    if (!name) return;
    const thanks = $('#rsvpThanks').value.trim().replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n');
    const prayer = $('#rsvpPrayer').value.trim().replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n');
    const message = [
      "Assalamu'alaikum,",
      '',
      'Konfirmasi Kehadiran',
      `Nama: ${name.replace(/[\r\n\t]+/g, ' ')}`,
      `Kehadiran: ${attendance}`,
      `Jumlah tamu: ${count}`,
      '',
      `Ucapan terima kasih: ${thanks || '-'}`,
      '',
      `Doa dan harapan: ${prayer || '-'}`,
      '',
      'Terima kasih atas undangannya.',
      'Sari & Hamudi'
    ].join('\n');
    const whatsappUrl = new URL(`https://wa.me/${whatsappNumber}`);
    whatsappUrl.searchParams.set('text', message);
    window.open(whatsappUrl.href, '_blank', 'noopener,noreferrer');
  });
})();
