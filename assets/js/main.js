// ========== UTILITIES (always safe) ==========
const AUTH_URL = 'http://127.0.0.1:8000/user/api/auth/';
const REPORT_URL = 'http://127.0.0.1:8000/user/api/report/';
const CAMPUS_URL = 'http://127.0.0.1:8000/campus/api/campus/';
const DASHBOARD_URL = `${CAMPUS_URL}dashboard`;

function showToast(message, type = 'success', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
  toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function setButtonLoading(btn, isLoading, originalText) {
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-spinner"></span> ${originalText}`;
    btn.setAttribute('data-original-text', originalText);
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.getAttribute('data-original-text') || originalText;
  }
}

function setCookie(name, value, days) {
  let cookieString = `${name}=${encodeURIComponent(value)}; path=/`;

  if (days != null) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${expires.toUTCString()}`;
  }
  document.cookie = cookieString;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function getAuthHeaders() {
  const token = getCookie('access_token') || getCookie('auth_token') || getCookie('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function deleteAuthCookies() {
  ['access_token', 'refresh_token', 'user_id', 'is_email_verified'].forEach(name => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  });
}


function initOptionalFeatures() {
  // AOS
  if (typeof AOS !== 'undefined' && AOS.init) {
    AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 50 });
  }
  // Smooth scroll for anchor links
  const anchors = document.querySelectorAll('a[href^="#"]');
  if (anchors.length) {
    anchors.forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
  // ParticlesJS
  if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
    particlesJS('particles-js', {
      particles: {
        number: { value: 60, density: { enable: true, value_area: 800 } },
        color: { value: '#2c7a5e' },
        shape: { type: 'circle' },
        opacity: { value: 0.4, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: '#2c7a5e', opacity: 0.2, width: 1 },
        move: { enable: true, speed: 1, direction: 'none', random: false, straight: false, out_mode: 'out' }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'repulse' },
          onclick: { enable: true, mode: 'push' },
          resize: true
        }
      },
      retina_detect: true
    });
  }
}

function initScrollToTop() {
  const scrollTopBtn = document.querySelector('[data-scroll-top]');
  if (!scrollTopBtn) return;

  const toggleScrollButton = () => {
    scrollTopBtn.classList.toggle('is-visible', window.scrollY > 360);
  };

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleScrollButton, { passive: true });
  toggleScrollButton();
}

// ========== MODAL SYSTEM ==========
class FormModal {
  constructor() {
    this.modal = document.getElementById('formModal');
    if (!this.modal) return;
    this.titleEl = document.getElementById('formModalTitle');
    this.bodyEl = document.getElementById('formModalBody');
    this.footerEl = document.getElementById('formModalFooter');
    this.closeBtn = document.getElementById('closeFormModalBtn');
    this.isOpen = false;
    this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });
    this.closeBtn?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.isOpen) this.close(); });
  }
  open({ title, formHtml, onSubmit, submitLabel = 'Submit', cancelLabel = 'Cancel', onClose = null }) {
    if (!this.modal) return;
    this.titleEl.textContent = title;
    this.bodyEl.innerHTML = `<form id="dynamicFormModalForm">${formHtml}</form>`;
    this.footerEl.innerHTML = '';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = cancelLabel;
    cancelBtn.className = 'btn-secondary';
    cancelBtn.addEventListener('click', () => this.close());
    const submitBtn = document.createElement('button');
    submitBtn.textContent = submitLabel;
    submitBtn.className = 'btn-primary';
    submitBtn.addEventListener('click', async () => {
      const form = document.getElementById('dynamicFormModalForm');
      if (onSubmit) await onSubmit(form);
    });
    this.footerEl.appendChild(cancelBtn);
    this.footerEl.appendChild(submitBtn);
    this.onCloseCallback = onClose;
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    this.isOpen = true;
  }
  close() {
    if (!this.modal) return;
    this.modal.style.display = 'none';
    document.body.style.overflow = '';
    this.isOpen = false;
    if (this.onCloseCallback) this.onCloseCallback();
  }
}

class ConfirmModal {
  constructor() {
    this.modal = document.getElementById('confirmModal');
    if (!this.modal) return;
    this.titleEl = document.getElementById('confirmModalTitle');
    this.messageEl = document.getElementById('confirmMessage');
    this.footerEl = document.getElementById('confirmModalFooter');
    this.closeBtn = document.getElementById('closeConfirmModalBtn');
    this.isOpen = false;
    this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });
    this.closeBtn?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.isOpen) this.close(); });
  }
  open({ title = 'Confirm Action', message, onConfirm, onCancel = null, confirmText = 'Confirm', cancelText = 'Cancel' }) {
    if (!this.modal) return;
    this.titleEl.textContent = title;
    this.messageEl.textContent = message;
    this.footerEl.innerHTML = '';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = cancelText;
    cancelBtn.className = 'btn-secondary';
    cancelBtn.addEventListener('click', () => {
      if (onCancel) onCancel();
      this.close();
    });
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = confirmText;
    confirmBtn.className = 'btn-primary';
    if (confirmText.toLowerCase().includes('delete')) confirmBtn.classList.add('btn-danger');
    confirmBtn.addEventListener('click', async () => {
      if (onConfirm) await onConfirm();
      this.close();
    });
    this.footerEl.appendChild(cancelBtn);
    this.footerEl.appendChild(confirmBtn);
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    this.isOpen = true;
  }
  close() {
    if (!this.modal) return;
    this.modal.style.display = 'none';
    document.body.style.overflow = '';
    this.isOpen = false;
  }
}

// Global modal instances (will be null if containers missing)
let formModal = null;
let confirmModal = null;

// Initialize modals only if their HTML containers exist
if (document.getElementById('formModal')) formModal = new FormModal();
if (document.getElementById('confirmModal')) confirmModal = new ConfirmModal();

// ========== START EVERYTHING AFTER DOM READY ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initOptionalFeatures();
    initScrollToTop();
  });
} else {
  initOptionalFeatures();
  initScrollToTop();
}
