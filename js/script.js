/* =========================================
   ELITE FIT — MAIN JAVASCRIPT
   ========================================= */

'use strict';

/* ---- NAVBAR: scroll class + hamburger ---- */
const navbar   = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu  = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
  });
});

/* ---- SCROLL REVEAL ---- */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

/* ---- ANIMATED COUNTERS ---- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, 16);
}

const counters = document.querySelectorAll('.stat-number');
let countersStarted = false;

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersStarted) {
      countersStarted = true;
      counters.forEach(c => animateCounter(c));
      counterObserver.disconnect();
    }
  });
}, { threshold: 0.4 });

if (counters.length) {
  counterObserver.observe(counters[0].closest('.stats-row'));
}

/* ---- ABOUT IMAGE CAROUSEL ---- */
(function () {
  const carousel  = document.getElementById('about-carousel');
  if (!carousel) return;

  const imgs  = carousel.querySelectorAll('.about-carousel-img');
  const dots  = document.querySelectorAll('.acdot');
  let current = 0;
  let timer   = null;

  function showSlide(idx) {
    imgs[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + imgs.length) % imgs.length;
    imgs[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { showSlide(current + 1); }

  function startAuto() { timer = setInterval(next, 4000); }
  function stopAuto()  { clearInterval(timer); }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopAuto();
      showSlide(parseInt(dot.dataset.idx, 10));
      startAuto();
    });
  });

  startAuto();
})();

/* ---- TESTIMONIALS SLIDER ---- */
const slider     = document.getElementById('testimonial-slider');
const dotsWrap   = document.getElementById('slider-dots');
const btnPrev    = document.getElementById('slider-prev');
const btnNext    = document.getElementById('slider-next');
const cards      = slider ? slider.querySelectorAll('.testimonial-card') : [];

let currentSlide = 0;
let slidesVisible = getSlidesVisible();
let totalSlides   = Math.ceil(cards.length / slidesVisible);
let autoplayTimer = null;

function getSlidesVisible() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function buildDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = '';
  totalSlides = Math.ceil(cards.length / slidesVisible);
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  }
}

function updateDots() {
  if (!dotsWrap) return;
  dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });
}

function goToSlide(index) {
  currentSlide = (index + totalSlides) % totalSlides;
  const cardWidth = cards[0] ? cards[0].offsetWidth + 24 : 0; // 24 = gap
  slider.style.transform = `translateX(-${currentSlide * slidesVisible * cardWidth}px)`;
  updateDots();
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

function startAutoplay() {
  autoplayTimer = setInterval(nextSlide, 4000);
}
function stopAutoplay() {
  clearInterval(autoplayTimer);
}

if (slider && cards.length) {
  buildDots();
  startAutoplay();

  btnNext && btnNext.addEventListener('click', () => { stopAutoplay(); nextSlide(); startAutoplay(); });
  btnPrev && btnPrev.addEventListener('click', () => { stopAutoplay(); prevSlide(); startAutoplay(); });

  // Touch/swipe support
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      stopAutoplay();
      diff > 0 ? nextSlide() : prevSlide();
      startAutoplay();
    }
  });

  window.addEventListener('resize', () => {
    const newVisible = getSlidesVisible();
    if (newVisible !== slidesVisible) {
      slidesVisible = newVisible;
      currentSlide = 0;
      buildDots();
      goToSlide(0);
    }
  });
}

/* ---- CONTACT FORM: Open WhatsApp with pre-filled message ---- */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('form-name').value.trim();
    const phone   = document.getElementById('form-phone').value.trim();
    const email   = document.getElementById('form-email').value.trim();
    const goalEl  = document.getElementById('form-goal');
    const goal    = goalEl.options[goalEl.selectedIndex]?.text || 'Not specified';
    const message = document.getElementById('form-message').value.trim();

    if (!name || !phone) {
      alert('Please fill in your name and phone number.');
      return;
    }

    // Build a nicely formatted WhatsApp message
    const waText = [
      `*New Enquiry from Website*`,
      ``,
      `*Name:* ${name}`,
      `*Phone:* ${phone}`,
      `*Email:* ${email || 'Not provided'}`,
      `*Fitness Goal:* ${goal}`,
      message ? `*Message:* ${message}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    // Anshul's WhatsApp number (no + or spaces)
    const waNumber = '918580934783';
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

    // Show brief success state, then open WhatsApp
    const btn     = document.getElementById('form-submit');
    const success = document.getElementById('form-success');

    btn.innerHTML = '<i class="fab fa-whatsapp"></i> Opening WhatsApp...';
    btn.disabled  = true;

    setTimeout(() => {
      window.open(waUrl, '_blank');

      btn.style.display     = 'none';
      success.style.display = 'flex';
      contactForm.reset();

      // Reset form UI after 6 seconds
      setTimeout(() => {
        btn.innerHTML     = 'Send Message <i class="fas fa-paper-plane"></i>';
        btn.disabled      = false;
        btn.style.display = '';
        success.style.display = 'none';
      }, 6000);
    }, 400);
  });
}

/* ---- SMOOTH ACTIVE NAV ON SCROLL ---- */
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    const top    = sec.offsetTop;
    const height = sec.offsetHeight;
    const id     = sec.getAttribute('id');
    const link   = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active-link', scrollY >= top && scrollY < top + height);
    }
  });
}, { passive: true });

/* ---- FLOAT WA: hide on scroll up, show on scroll down ---- */
const floatWa = document.getElementById('float-wa');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const dir = window.scrollY > lastScrollY ? 'down' : 'up';
  lastScrollY = window.scrollY;
  if (floatWa) {
    floatWa.style.opacity = dir === 'up' && window.scrollY > 300 ? '0.4' : '1';
  }
}, { passive: true });
