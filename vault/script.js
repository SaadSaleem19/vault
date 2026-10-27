// ========================
// VAULT — JavaScript
// ========================

document.addEventListener('DOMContentLoaded', () => {

  // ---- LOADER ----
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loader-fill');
  let progress = 0;
  const loaderInterval = setInterval(() => {
    progress += Math.random() * 12 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loaderInterval);
      setTimeout(() => {
        loader.classList.add('hide');
        document.body.style.overflow = '';
        triggerHeroAnimations();
      }, 300);
    }
    loaderFill.style.width = progress + '%';
  }, 80);
  document.body.style.overflow = 'hidden';

  // ---- CUSTOM CURSOR ----
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.querySelectorAll('a, button, .product-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovered');
      follower.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered');
      follower.classList.remove('hovered');
    });
  });

  // ---- NAVBAR ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ---- HAMBURGER ----
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  // ---- HERO ANIMATIONS ----
  function triggerHeroAnimations() {
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('visible');
      }, i * 100);
    });
  }

  // ---- SCROLL REVEAL ----
  const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Counter animation for stats
        const num = entry.target.querySelector('.stat-num');
        if (num) {
          animateCounter(num);
        }
        // Don't unobserve — keep for re-trigger if needed
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  scrollRevealElements.forEach(el => revealObserver.observe(el));

  // Also watch for stat-nums directly
  document.querySelectorAll('.collection-stats .scroll-reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // ---- COUNTER ANIMATION ----
  function animateCounter(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = 'true';
    const target = parseInt(el.dataset.target);
    const duration = 1500;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  // ---- CART ----
  const cartBtn = document.getElementById('cart-btn');
  const cartClose = document.getElementById('cart-close');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartCount = document.getElementById('cart-count');
  const cartItemsEl = document.getElementById('cart-items');
  const cartFooter = document.getElementById('cart-footer');
  const cartTotalPrice = document.getElementById('cart-total-price');

  let cart = [];

  function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  function updateCart() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartCount.textContent = cart.length;
    if (cart.length > 0) {
      cartCount.classList.add('visible');
      cartFooter.style.display = 'block';
      cartTotalPrice.textContent = 'PKR ' + total.toLocaleString('en-PK');
    } else {
      cartCount.classList.remove('visible');
      cartFooter.style.display = 'none';
    }

    if (cart.length === 0) {
      cartItemsEl.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <p>Your vault is empty</p>
          <span>Add some kicks first</span>
        </div>`;
    } else {
      cartItemsEl.innerHTML = cart.map((item, i) => `
        <div class="cart-item">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">PKR ${item.price.toLocaleString('en-PK')}</div>
          </div>
          <button class="cart-item-remove" data-index="${i}">Remove</button>
        </div>
      `).join('');

      cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.index);
          cart.splice(idx, 1);
          updateCart();
        });
      });
    }
  }

  // ---- ADD TO CART ----
  document.querySelectorAll('.btn-addcart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.dataset.name;
      const price = parseInt(btn.dataset.price);
      cart.push({ name, price });
      updateCart();
      showToast(`${name} added to Vault!`);
      // Animate cart button
      cartBtn.style.transform = 'scale(1.2)';
      setTimeout(() => cartBtn.style.transform = '', 200);
    });
  });

  // ---- TOAST ----
  const toast = document.getElementById('toast');
  let toastTimeout;
  function showToast(msg) {
    clearTimeout(toastTimeout);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // ---- NEWSLETTER ----
  const newsletterBtn = document.getElementById('newsletter-btn');
  const newsletterEmail = document.getElementById('newsletter-email');
  newsletterBtn.addEventListener('click', () => {
    const email = newsletterEmail.value.trim();
    if (email && email.includes('@')) {
      showToast('Welcome to the Vault! 🔒');
      newsletterEmail.value = '';
    } else {
      showToast('Enter a valid email first');
    }
  });

  // ---- PARALLAX on Hero ----
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroImg = document.querySelector('.hero-image img');
    const heroBg = document.querySelector('.hero-bg-text');
    if (heroImg) heroImg.style.transform = `translateY(${scrollY * 0.12}px) rotate(-2deg)`;
    if (heroBg) heroBg.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.06}px))`;
  });

  // ---- SMOOTH SCROLL ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- COLOR DOT SWITCHER ----
  document.querySelectorAll('.product-color-dots').forEach(dotsEl => {
    dotsEl.querySelectorAll('.dot').forEach(dot => {
      dot.addEventListener('click', () => {
        dotsEl.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
      });
    });
  });

  // Init
  updateCart();
});
