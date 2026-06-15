// ========== UTILITIES (always safe) ==========
const AUTH_URL = 'http://127.0.0.1:8000/user/api/auth/';
const REPORT_URL = 'http://127.0.0.1:8000/user/api/report/';
const CAMPUS_URL = 'http://127.0.0.1:8000/campus/api/campus/';


function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function getConditionDisplay(badge) {
    const mapping = {
      'new': { text: 'New', icon: '<i class="fas fa-star-of-life me-1"></i>' },
      'almost_new': { text: 'Almost New', icon: '<i class="fas fa-check-circle me-1"></i>' },
      'fair': { text: 'Fair', icon: '<i class="fas fa-exchange-alt me-1"></i>' },
      'bundle': { text: 'Bundle', icon: '<i class="fas fa-layer-group me-1"></i>' },
      'other': { text: 'Misc', icon: '<i class="fas fa-ellipsis-h me-1"></i>' }
    };
    return mapping[badge] || { text: 'Good', icon: '<i class="fas fa-check-circle me-1"></i>' };
}



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

const authCookies = [
    'access_token', 
    'refresh_token', 
    'user_id', 
    'is_email_verified', 
    'is_hall_verified',
    'first_name',
    'last_name',
    'user_email',
    'profile_pic',
    'point_bal',
    'trusting_score'
  ];

function deleteAuthCookies() {
  authCookies.forEach(name => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  });
}

function isAuthenticated() {
  const accessToken = getCookie('access_token');
  const refreshToken = getCookie('refresh_token');
  if (!accessToken || !refreshToken) {
    deleteAuthCookies()
    window.location.href = '../index.html';
  }
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

// ========== MOBILE MENU TOGGLE (fallback if Bootstrap is missing) ==========
function initMobileMenu() {
  // Only run if Bootstrap is not available
  if (window.bootstrap) return;

  const menuButton = document.querySelector('.mobile-menu-button');
  const menu = document.getElementById('navbarMain');

  if (!menuButton || !menu) return;

  menuButton.addEventListener('click', function () {
    const isOpen = menu.classList.toggle('show');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
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
    this.onCloseCallback = null;

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  open({ title, formHtml, onSubmit, submitLabel = 'Submit', cancelLabel = 'Cancel', onClose = null }) {
    if (!this.modal) {
      console.warn('FormModal: modal container not found');
      return;
    }
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
    this.onCloseCallback = null;
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

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  open({ title = 'Confirm Action', message, onConfirm, onCancel = null, confirmText = 'Confirm', cancelText = 'Cancel' }) {
    if (!this.modal) {
      console.warn('ConfirmModal: modal container not found');
      return;
    }
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

// Global modal instances (may be null if containers missing)
let formModal = null;
let confirmModal = null;

// Initialize modals only if their HTML containers exist
if (document.getElementById('formModal')) formModal = new FormModal();
if (document.getElementById('confirmModal')) confirmModal = new ConfirmModal();

// ========== REPORT LOST ITEM FEATURE (safe to call on any page) ==========
function initReportLostFeature() {
  const reportBtn = document.getElementById('reportLostBtn');
  if (!reportBtn) return;

  reportBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if (!formModal || typeof formModal.open !== 'function') {
      alert('Modal system not ready. Please refresh the page.');
      return;
    }

    formModal.open({
      title: 'Report Lost Item',
      formHtml: `
        <div class="form-floating-label">
          <input type="text" name="item_name" id="item_name" class="form-control" placeholder=" " required>
          <label class="form-label required" for="item_name">Item name</label>
        </div>

        <div class="form-floating-label">
          <textarea name="description" id="description" class="form-control" placeholder=" " rows="3" required></textarea>
          <label class="form-label required" for="description">Description</label>
        </div>

        <div class="form-floating-label">
          <input type="text" name="location" id="location" class="form-control" placeholder=" " required>
          <label class="form-label required" for="location">Where was it found?</label>
        </div>

        <div class="form-floating-label">
          <input type="date" name="date" id="date" class="form-control" placeholder=" " required>
          <label class="form-label required" for="date">Date found</label>
        </div>

        <hr class="my-4">
        <h6 class="fw-bold">🔐 Owner verification questions (only the true owner will know these)</h6>
        <p class="small text-muted">When someone claims this item, we'll ask them the same questions. If answers match, we'll share your contact details with them.</p>

        <div class="form-floating-label">
          <input type="text" name="verify_q1" id="verify_q1" class="form-control" placeholder=" " required>
          <label class="form-label required" for="verify_q1">Verification question 1</label>
        </div>

        <div class="form-floating-label">
          <input type="text" name="verify_a1" id="verify_a1" class="form-control" placeholder=" " required>
          <label class="form-label required" for="verify_a1">Answer to question 1</label>
          <div class="form-text">⚠️ Keep this answer safe. Only the real owner will know it.</div>
        </div>

        <div class="form-floating-label">
          <input type="text" name="verify_q2" id="verify_q2" class="form-control" placeholder=" " required>
          <label class="form-label required" for="verify_q2">Verification question 2</label>
        </div>

        <div class="form-floating-label">
          <input type="text" name="verify_a2" id="verify_a2" class="form-control" placeholder=" " required>
          <label class="form-label required" for="verify_a2">Answer to question 2</label>
          <div class="form-text">⚠️ Keep this answer safe. Only the real owner will know it.</div>
        </div>

        <hr class="my-4">
        <h6 class="fw-bold">📞 Your contact details (finder)</h6>

        <div class="form-floating-label">
          <input type="text" name="finder_name" id="finder_name" class="form-control" placeholder=" " required>
          <label class="form-label required" for="finder_name">Your full name (finder)</label>
        </div>

        <div class="form-floating-label">
          <input type="email" name="finder_email" id="finder_email" class="form-control" placeholder=" " required>
          <label class="form-label required" for="finder_email">Your email</label>
        </div>

        <div class="form-floating-label">
          <input type="tel" name="finder_phone" id="finder_phone" class="form-control" placeholder=" " required>
          <label class="form-label required" for="finder_phone">Your phone number</label>
        </div>

        <div class="form-floating-label">
          <input type="text" name="finder_department" id="finder_department" class="form-control" placeholder=" " required>
          <label class="form-label required" for="finder_department">Your department</label>
        </div>

        <div class="mb-3">
          <label class="form-label optional">Upload image of the item</label>
          <div class="drop-area" id="dropArea" style="border: 2px dashed rgba(44, 122, 94, 0.25); border-radius: 16px; padding: 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s ease; background: #fafcfb;">
            <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: #2c7a5e; margin-bottom: 0.5rem;"></i>
            <p style="margin: 0; font-size: 0.85rem; color: #6c757d;">Drag & drop an image here or click to browse</p>
            <input type="file" id="fileInput" accept="image/*" hidden>
            <div class="small text-muted mt-1">JPEG, PNG up to 2MB</div>
          </div>
          <div class="image-preview" id="imagePreview" style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;"></div>
        </div>
      `,
      submitLabel: 'Report Item',
      onSubmit: async (form) => {
        const formData = new FormData(form);
        const fileInput = document.getElementById('fileInput');
        if (fileInput && fileInput.files.length > 0) {
          formData.append('image', fileInput.files[0]);
        }

        if (!formData.get('item_name') || !formData.get('description') || !formData.get('location') || !formData.get('finder_email')) {
          alert('Please fill all required fields');
          return;
        }

        try {
          const response = await fetch('/api/lost-and-found/report/', {
            method: 'POST',
            body: formData
          });
          if (!response.ok) throw new Error('Server error');
          const result = await response.json();

          if (confirmModal && typeof confirmModal.open === 'function') {
            confirmModal.open({
              title: 'Item Reported ✅',
              message: 'Thank you for helping! If someone claims the item, we’ll match details and connect you with the owner.',
              confirmText: 'OK',
              onConfirm: () => formModal.close()
            });
          } else {
            alert('Reported successfully!');
            formModal.close();
          }
        } catch (err) {
          alert('Failed to report. Please try again later.');
          console.error(err);
        }
      }
    });

    setTimeout(() => {
      const dropArea = document.getElementById('dropArea');
      const fileInput = document.getElementById('fileInput');
      const previewContainer = document.getElementById('imagePreview');
      if (!dropArea) return;

      const previewImage = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => { previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview">`; };
        reader.readAsDataURL(file);
      };

      dropArea.addEventListener('click', () => fileInput.click());
      dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.classList.add('drag-over'); });
      dropArea.addEventListener('dragleave', () => { dropArea.classList.remove('drag-over'); });
      dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          fileInput.files = e.dataTransfer.files;
          previewImage(file);
        } else {
          alert('Please drop an image file.');
        }
      });
      fileInput.addEventListener('change', () => {
        if (fileInput.files.length) previewImage(fileInput.files[0]);
      });
    }, 200);
  });
}

function logout() {
    if (typeof deleteAuthCookies === 'function') {
      deleteAuthCookies();
    } else {
      ['access_token', 'refresh_token', 'user_id', 'is_email_verified'].forEach(name => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      });
    }
    window.location.href = '../index.html';
  }


// Close mobile menu when clicking outside with smooth animation
function initMobileMenuOutsideClick() {
  const menuButton = document.querySelector('.navbar-toggler');
  const menu = document.getElementById('navbarMain');
  if (!menuButton || !menu) return;
  
  // Get Bootstrap Collapse instance
  let bsCollapse = null;
  try {
    bsCollapse = new bootstrap.Collapse(menu, { toggle: false });
  } catch(e) {
    // Fallback if Bootstrap not available
    bsCollapse = null;
  }
  
  document.addEventListener('click', function(event) {
    const isMenuOpen = menu.classList.contains('show');
    if (!isMenuOpen) return;
    
    const isClickInside = menu.contains(event.target) || menuButton.contains(event.target);
    if (!isClickInside) {
      if (bsCollapse) {
        bsCollapse.hide(); // this triggers smooth CSS transition
      } else {
        menu.classList.remove('show');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    }
  });
}


function populateUserProfile() {
  // Read cookies
  const firstName = getCookie('first_name') || '';
  const lastName = getCookie('last_name') || '';
  const userEmailRaw = getCookie('user_email') || '';
  const userEmail = decodeURIComponent(userEmailRaw);
  const pointBal = getCookie('point_bal') || '0';
  const trustScore = getCookie('trusting_score') || '0';

  // Determine display name
  let fullName = '';
  if (firstName || lastName) {
    fullName = `${firstName} ${lastName}`.trim();
  }
  const displayName = fullName || userEmail.split('@')[0] || 'Student';

  // Update desktop user name (dropdown toggle)
  const desktopUserNameSpan = document.getElementById('desktopUserName');
  if (desktopUserNameSpan) {
    desktopUserNameSpan.textContent = displayName;
  }

  // Update mobile profile card
  const mobileFullName = document.getElementById('mobileFullName');
  if (mobileFullName) {
    mobileFullName.textContent = fullName || displayName;
  }
  const mobileUserEmailSpan = document.getElementById('mobileUserEmail');
  if (mobileUserEmailSpan && userEmail) {
    mobileUserEmailSpan.textContent = userEmail;
  }
  const mobilePointsBalance = document.getElementById('mobilePointsBalance');
  if (mobilePointsBalance) {
    mobilePointsBalance.textContent = pointBal;
  }
  const mobileTrustScore = document.getElementById('mobileTrustScore');
  if (mobileTrustScore) {
    mobileTrustScore.textContent = `${trustScore}%`;
  }
}

// ========== START EVERYTHING AFTER DOM READY ==========
function initAll() {
  populateUserProfile();
  initOptionalFeatures();
  initScrollToTop();
  initMobileMenu();      
  initMobileMenuOutsideClick();
  initReportLostFeature();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}