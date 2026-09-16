// ===== BACKGROUND ANIMASI RINGAN =====
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let W, H;

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Partikel - jumlah dikurangi
const particles = [];
const PARTICLE_COUNT = 80; // dari 150 ke 80

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.size = Math.random() * 1.8 + 0.5; // lebih kecil
    this.speedX = (Math.random() - 0.5) * 0.2; // lebih lambat
    this.speedY = (Math.random() - 0.8) * 0.3 - 0.1;
    this.opacity = Math.random() * 0.4 + 0.1;
    this.trail = [];
    this.maxTrail = Math.floor(Math.random() * 5) + 3; // lebih pendek
    this.isRocket = Math.random() < 0.02; // 2% (dari 5%)
    this.rocketSize = this.isRocket ? Math.random() * 3 + 2 : 0;
    this.sparkTimer = 0;
  }
  update() {
    // Simpan jejak
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) {
      this.trail.shift();
    }

    this.x += this.speedX;
    this.y += this.speedY;

    // Efek roket - lebih jarang
    if (this.isRocket) {
      this.sparkTimer++;
      if (this.sparkTimer > 100 && Math.random() < 0.008) {
        this.speedY = -3 - Math.random() * 3;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 2.5 + 1.5;
        this.sparkTimer = 0;
        // Percikan dikurangi
        if (Math.random() < 0.3) {
          for (let i = 0; i < 2; i++) {
            const spark = new Particle();
            spark.x = this.x + (Math.random() - 0.5) * 15;
            spark.y = this.y + (Math.random() - 0.5) * 15;
            spark.size = Math.random() * 1.5 + 0.5;
            spark.speedX = (Math.random() - 0.5) * 1.5;
            spark.speedY = (Math.random() - 0.5) * 1.5 - 0.5;
            spark.opacity = Math.random() * 0.5 + 0.2;
            spark.maxTrail = 2;
            particles.push(spark);
          }
        }
      }
    }

    // Perlambatan
    this.speedY += 0.002;
    this.speedX *= 0.999;

    // Reset jika keluar layar
    if (this.y > H + 20 || this.x < -20 || this.x > W + 20) {
      this.reset();
      this.y = -10;
      this.x = Math.random() * W;
    }
  }
  draw() {
    // Gambar jejak - lebih ringan
    for (let i = 0; i < this.trail.length; i++) {
      const alpha = (i / this.trail.length) * this.opacity * 0.2;
      const trailSize = this.size * (i / this.trail.length) * 0.4 + 0.2;
      ctx.beginPath();
      ctx.arc(this.trail[i].x, this.trail[i].y, trailSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
      ctx.fill();
    }

    // Gambar partikel utama
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.fill();

    // Glow untuk roket - lebih kecil
    if (this.isRocket && this.size > 1.5) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
      gradient.addColorStop(0, `rgba(150, 200, 255, ${this.opacity * 0.2})`);
      gradient.addColorStop(1, 'rgba(150, 200, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Ekor roket - lebih sederhana
      if (this.speedY < -0.5) {
        ctx.beginPath();
        ctx.moveTo(this.x - this.size * 0.3, this.y + this.size * 1.5);
        ctx.lineTo(this.x, this.y + this.size * 3);
        ctx.lineTo(this.x + this.size * 0.3, this.y + this.size * 1.5);
        ctx.fillStyle = `rgba(255, 200, 100, ${this.opacity * 0.3})`;
        ctx.fill();
      }
    }
  }
}

// Buat partikel
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}

// Tambahkan beberapa partikel awal sebagai roket
for (let i = 0; i < 3; i++) {
  const p = new Particle();
  p.isRocket = true;
  p.y = Math.random() * H * 0.3;
  p.speedY = -1 - Math.random() * 2;
  particles.push(p);
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);

  // Bintang statis - dikurangi
  for (let i = 0; i < 60; i++) {
    const x = (i * 137.5 + 42) % W;
    const y = (i * 97.3 + 13) % H;
    const size = (i % 3 === 0) ? 0.5 : 0.3;
    const brightness = 0.03 + (i % 4) * 0.015;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${brightness})`;
    ctx.fill();
  }

  // Gambar partikel
  const len = particles.length;
  for (let i = 0; i < len; i++) {
    particles[i].update();
    particles[i].draw();
  }

  // Batasi jumlah partikel (hapus yang berlebihan)
  if (particles.length > PARTICLE_COUNT + 20) {
    particles.splice(PARTICLE_COUNT + 20);
  }

  requestAnimationFrame(animateParticles);
}

animateParticles();

// ===== MENU TOGGLE =====
const toggle = document.getElementById('menuToggle');
const nav = document.querySelector('nav ul');

toggle.addEventListener('click', () => {
  nav.classList.toggle('active');
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    const target = link.getAttribute('href');
    if (target.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(target);
      if (el) {
        nav.classList.remove('active');
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// ===== TYPING EFFECT =====
const typed = document.getElementById('typed-text');
const roles = ['Full Stack Developer', 'Creative Technologist', 'Editor & Videographer'];
let i = 0,
  j = 0,
  del = false;

function type() {
  const current = roles[i];
  if (del) {
    typed.textContent = current.substring(0, j - 1);
    j--;
  } else {
    typed.textContent = current.substring(0, j + 1);
    j++;
  }
  let speed = del ? 35 : 80;
  if (!del && j === current.length) {
    speed = 1200;
    del = true;
  } else if (del && j === 0) {
    del = false;
    i = (i + 1) % roles.length;
    speed = 400;
  }
  setTimeout(type, speed);
}
document.addEventListener('DOMContentLoaded', type);

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    alert('Semua bidang harus diisi!');
    return;
  }

  alert(`Terima kasih, ${name}! Pesan terkirim.`);
  e.target.reset();
});

// ===== SCROLL REVEAL =====
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section:not(.home)');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.08 });
  sections.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(20px)';
    s.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(s);
  });
});