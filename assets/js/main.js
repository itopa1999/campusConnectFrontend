// ========== UTILITIES (always safe) ==========
const AUTH_URL = 'http://127.0.0.1:8000/user/api/auth/';
const REPORT_URL = 'http://127.0.0.1:8000/user/api/report/';
const CAMPUS_URL = 'http://127.0.0.1:8000/campus/api/campus/';
const REFRESH_URL = 'http://127.0.0.1:8000/user/api/';


// ─── Global Refresh Spinner (injected dynamically) ──────────────
function createRefreshOverlay() {
  if (document.getElementById('refreshGlobalOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'refreshGlobalOverlay';
  overlay.style.cssText = `
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    align-items: center;
    justify-content: center;
    flex-direction: column;
  `;

  overlay.innerHTML = `
    <div class="spinner-border text-success" style="width: 3.5rem; height: 3.5rem;" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p class="mt-3 text-muted fw-semibold" style="font-size: 1rem;">Updating balance…</p>
  `;

  document.body.appendChild(overlay);
}

function showRefreshSpinner() {
  createRefreshOverlay();
  const overlay = document.getElementById('refreshGlobalOverlay');
  if (overlay) overlay.style.display = 'flex';
}

function hideRefreshSpinner() {
  const overlay = document.getElementById('refreshGlobalOverlay');
  if (overlay) overlay.style.display = 'none';
}


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

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let html = '';
    for (let i = 0; i < full; i++) html += '<i class="fas fa-star"></i>';
    if (half) html += '<i class="fas fa-star-half-alt"></i>';
    for (let i = full + (half ? 1 : 0); i < 5; i++) html += '<i class="far fa-star"></i>';
    return html;
  }

function getConditionDisplay(badge) {
    const mapping = {
      'new': { text: 'New', icon: '<i class="fas fa-star-of-life me-1"></i>' },
      'almost_new': { text: 'Almost New', icon: '<i class="fas fa-check-circle me-1"></i>' },
      'fair': { text: 'Fair', icon: '<i class="fas fa-exchange-alt me-1"></i>' },
      'bundle': { text: 'Bundle', icon: '<i class="fas fa-layer-group me-1"></i>' },
      'other': { text: 'Misc', icon: '<i class="fas fa-ellipsis-h me-1"></i>' }
    };
    return mapping[badge] || { text: 'None', icon: '<i class="fas fa-cancel me-1"></i>' };
}

/**
 * Close the mobile navigation menu (Bootstrap collapse) if it's open.
 */
function closeMobileMenu() {
  const menu = document.getElementById('navbarMain');
  const menuButton = document.querySelector('.navbar-toggler');
  if (!menu) return;

  // Check if the menu is visible (has the 'show' class)
  if (menu.classList.contains('show')) {
    // Try Bootstrap's Collapse API first
    try {
      const bsCollapse = bootstrap.Collapse.getInstance(menu);
      if (bsCollapse) {
        bsCollapse.hide();
      } else {
        // Fallback: toggle class and aria attribute
        menu.classList.remove('show');
        if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
      }
    } catch (e) {
      // If Bootstrap is not available, use the fallback
      menu.classList.remove('show');
      if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
    }
  }
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

function ensureToastContainer() {
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
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
    'trusting_score',
    'redirect_after_login'
  ];


function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

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
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    setCookie('redirect_after_login', currentPath, 1);
 
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
    cancelBtn.setAttribute('data-bs-toggle', 'tooltip');
    cancelBtn.setAttribute('title', 'Close form');
    cancelBtn.addEventListener('click', () => this.close());

    const submitBtn = document.createElement('button');
    submitBtn.textContent = submitLabel;
    submitBtn.className = 'btn-primary';
    submitBtn.setAttribute('data-bs-toggle', 'tooltip');
    submitBtn.setAttribute('title', submitLabel);
    submitBtn.addEventListener('click', async () => {
      const form = document.getElementById('dynamicFormModalForm');
      if (onSubmit) await onSubmit(form, submitBtn);
    });

    this.footerEl.appendChild(cancelBtn);
    this.footerEl.appendChild(submitBtn);
    if (typeof initTooltips === 'function') setTimeout(initTooltips, 100);

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
    cancelBtn.setAttribute('data-bs-toggle', 'tooltip');
    cancelBtn.setAttribute('title', cancelText);
    cancelBtn.addEventListener('click', () => {
      if (onCancel) onCancel();
      this.close();
    });

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = confirmText;
    confirmBtn.className = 'btn-primary';
    confirmBtn.setAttribute('data-bs-toggle', 'tooltip');
    confirmBtn.setAttribute('title', confirmText);
    if (confirmText.toLowerCase().includes('delete')) confirmBtn.classList.add('btn-danger');
    confirmBtn.addEventListener('click', async () => {
      if (onConfirm) await onConfirm();
      this.close();
    });

    this.footerEl.appendChild(cancelBtn);
    this.footerEl.appendChild(confirmBtn);
    if (typeof initTooltips === 'function') setTimeout(initTooltips, 100);

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

// ========== REPORT LOST ITEM FEATURE (safe to call on any page) ==========
function initReportLostFeature() {
  const reportBtn = document.getElementById('reportLostBtn');
  if (!reportBtn) return;

  reportBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if (!formModal || typeof formModal.open !== 'function') {
      showToast('Modal system not ready. Please refresh the page.', 'error');
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
          <input type="date" name="date_found" id="date_found" class="form-control" placeholder=" " required>
          <label class="form-label required" for="date_found">Date found</label>
        </div>

        <hr class="my-4">
        <h6 class="fw-bold">🔐 Owner verification questions (only the true owner will know these)</h6>
        <p class="small text-muted">When someone claims this item, we'll ask them the same questions. If answers match, we'll share your contact details with them.</p>

        <div class="form-floating-label">
          <input type="text" name="verification1" id="verification1" class="form-control" placeholder=" " required>
          <label class="form-label required" for="verification1">Verification question 1</label>
        </div>

        <div class="form-floating-label">
          <input type="text" name="answer1" id="answer1" class="form-control" placeholder=" " required>
          <label class="form-label required" for="answer1">Answer to question 1</label>
          <div class="form-text">⚠️ Keep this answer safe. Only the real owner will know it.</div>
        </div>

        <div class="form-floating-label">
          <input type="text" name="verification2" id="verification2" class="form-control" placeholder=" " required>
          <label class="form-label required" for="verification2">Verification question 2</label>
        </div>

        <div class="form-floating-label">
          <input type="text" name="answer2" id="answer2" class="form-control" placeholder=" " required>
          <label class="form-label required" for="answer2">Answer to question 2</label>
          <div class="form-text">⚠️ Keep this answer safe. Only the real owner will know it.</div>
        </div>

        <hr class="my-4">
        <h6 class="fw-bold">📞 Your contact details (finder)</h6>

        <div class="form-floating-label">
          <input type="text" name="full_name" id="full_name" class="form-control" placeholder=" " required>
          <label class="form-label required" for="full_name">Your full name (finder)</label>
        </div>

        <div class="form-floating-label">
          <input type="email" name="email" id="email" class="form-control" placeholder=" " required>
          <label class="form-label required" for="email">Your email</label>
        </div>

        <div class="form-floating-label">
          <input type="tel" name="phone" id="phone" class="form-control" placeholder=" " required>
          <label class="form-label" for="phone">Your phone number (optional)</label>
          <div class="form-text">We'll use this to contact you if the owner is found.</div>
        </div>

        <div class="form-floating-label">
          <input type="text" name="department" id="department" class="form-control" placeholder=" " required>
          <label class="form-label required" for="department">Your department</label>
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
      onSubmit: async (form, submitBtn) => {
        const formData = new FormData(form);
        const fileInput = document.getElementById('fileInput');

        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="btn-spinner"></span> Submitting...`;


        if (fileInput && fileInput.files.length > 0) {
          formData.append('image', fileInput.files[0]);
        }

        const required = ['item_name', 'description', 'location', 'date_found', 
                          'verification1', 'answer1', 'verification2', 'answer2',
                          'full_name', 'phone', 'email', 'department'];
        for (let field of required) {
          if (!formData.get(field)) {
            showToast(`Please fill in the "${field.replace('_', ' ')}" field.`, 'error');
            return;
          }
        }

        try {
          const response = await fetchWithAuth(CAMPUS_URL + 'report-lost-item', {
            method: 'POST',
            body: formData
          });
          if (!response.ok) throw new Error('Server error');
          const result = await response.json();

          if (typeof fetchItems === 'function') {
            fetchItems();
          }

          if (confirmModal && typeof confirmModal.open === 'function') {
            confirmModal.open({
              title: 'Item Reported ✅',
              message: 'Thank you for helping! If someone claims the item, we’ll match details and connect you with the owner.',
              confirmText: 'OK',
              onConfirm: () => formModal.close()
            });
          } else {
            showToast('Reported successfully!', 'error');
            formModal.close();
          }
        } catch (err) {
          showToast('Failed to report. Please try again later.', 'error');
          console.error(err);
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
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
          showToast('Please drop an image file.', 'error');
        }
      });
      fileInput.addEventListener('change', () => {
        if (fileInput.files.length) previewImage(fileInput.files[0]);
      });
    }, 200);
  });
}

function logout() {
  closeMobileMenu();
  if (typeof confirmModal !== 'undefined' && confirmModal && typeof confirmModal.open === 'function') {
    confirmModal.open({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Yes, Logout',
      cancelText: 'Cancel',
      onConfirm: function() {
        performLogout();
      },
      onCancel: function() {
      }
    });
  } else {
    if (confirm('Are you sure you want to logout?')) {
      performLogout();
    }
  }
}

async function performLogout() {
  try {
    const refreshToken = getCookie('refresh_token');
    const accessToken = getCookie('access_token');

    if (refreshToken && accessToken) {
      const response = await fetchWithAuth(`${AUTH_URL}logout-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      const result = await response.json();

      if (response.ok && result.message) {
        showToast('✅ Logged out successfully. Redirecting...', 'success');
      } else {
        showToast('Logged out. Redirecting...', 'info');
      }
    } else {
      showToast('Logging out...', 'info');
    }
  } catch (err) {
    console.error('Logout API error:', err);
    showToast('Logout failed, but session cleared. Redirecting...', 'info');
  }

  if (typeof deleteAuthCookies === 'function') {
    deleteAuthCookies();
  } else {
    const authCookies = [
      'access_token', 'refresh_token', 'user_id',
      'is_email_verified', 'is_hall_verified',
      'first_name', 'last_name', 'user_email',
      'profile_pic', 'point_bal', 'trusting_score'
    ];
    authCookies.forEach(name => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    });
  }

  setTimeout(() => {
    window.location.href = '../index.html';
  }, 3000);
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

  let profilePic = getCookie('profile_pic') || null;
  if (profilePic) {
    profilePic = decodeURIComponent(profilePic);
  }

   // ─── Desktop profile picture ──────────────────────────────
  const desktopImg = document.getElementById('desktopAvatarImg');
  const desktopIcon = document.getElementById('desktopAvatarIcon');
  if (profilePic && desktopImg) {
    desktopImg.src = profilePic;
    desktopImg.style.display = 'inline-block';
    if (desktopIcon) desktopIcon.style.display = 'none';
  } else {
    if (desktopImg) desktopImg.style.display = 'none';
    if (desktopIcon) desktopIcon.style.display = 'inline-block';
  }

  // ─── Mobile profile picture ──────────────────────────────
  const mobileImg = document.getElementById('mobileAvatarImg');
  const mobileIcon = document.getElementById('mobileAvatarIcon');
  if (profilePic && mobileImg) {
    mobileImg.src = profilePic;
    mobileImg.style.display = 'block';
    if (mobileIcon) mobileIcon.style.display = 'none';
  } else {
    if (mobileImg) mobileImg.style.display = 'none';
    if (mobileIcon) mobileIcon.style.display = 'block';
  }

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


// ========== NETWORK ERROR OVERLAY (injected globally) ==========
(function() {
  // Avoid duplicate injection
  if (document.getElementById('networkErrorOverlay')) return;

  // Build overlay HTML
  const overlayHTML = `
    <div id="networkErrorOverlay" style="display: none;">
      <div class="network-error-card">
        <div class="network-error-icon">
          <i class="fas fa-wifi"></i>
        </div>
        <h2>Connection Lost</h2>
        <p class="network-error-message">
          We're having trouble reaching the server. Please check your internet connection and try again.
        </p>
          <button class="btn btn-primary-custom" id="retryNetworkBtn" data-bs-toggle="tooltip" title="Retry connection">
          <i class="fas fa-sync-alt me-2"></i>Retry
        </button>
        <button class="btn btn-outline-custom mt-2" id="reloadPageBtn" data-bs-toggle="tooltip" title="Reload page">
          <i class="fas fa-redo me-2"></i>Reload Page
        </button>
      </div>
    </div>
  `;

  // Inject styles (only once)
  const styleID = 'network-error-styles';
  if (!document.getElementById(styleID)) {
    const style = document.createElement('style');
    style.id = styleID;
    style.textContent = `
      #networkErrorOverlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        animation: fadeInOverlay 0.3s ease;
      }
      @keyframes fadeInOverlay {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .network-error-card {
        max-width: 480px;
        width: 100%;
        background: white;
        border-radius: 2rem;
        padding: 2.5rem 2rem;
        text-align: center;
        box-shadow: 0 24px 48px rgba(31, 94, 72, 0.12);
        border: 1px solid rgba(44, 122, 94, 0.08);
        animation: slideUp 0.4s ease;
      }
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .network-error-icon {
        font-size: 3.5rem;
        color: var(--accent, #2c7a5e);
        background: var(--accent-light, #eaf7f0);
        width: 80px;
        height: 80px;
        line-height: 80px;
        border-radius: 50%;
        margin: 0 auto 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .network-error-icon i {
        font-size: 2.8rem;
        color: var(--accent-dark, #1f5e48);
      }
      .network-error-card h2 {
        font-weight: 700;
        font-size: 1.6rem;
        color: var(--text-dark, #1e2a2c);
        margin-bottom: 0.75rem;
      }
      .network-error-message {
        color: var(--text-muted, #5a6e6f);
        font-size: 0.95rem;
        line-height: 1.6;
        margin-bottom: 2rem;
      }
      #networkErrorOverlay .btn {
        min-width: 140px;
        padding: 0.8rem 1.8rem;
        font-weight: 600;
        border-radius: 40px;
      }
      #networkErrorOverlay .btn + .btn {
        margin-left: 0.75rem;
      }
      @media (max-width: 576px) {
        #networkErrorOverlay .btn {
          display: block;
          width: 100%;
          margin-bottom: 0.75rem;
        }
        #networkErrorOverlay .btn + .btn {
          margin-left: 0;
        }
        .network-error-card {
          padding: 2rem 1.5rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Append overlay to body
  document.body.insertAdjacentHTML('beforeend', overlayHTML);

  // Expose global show/hide functions
  window.showNetworkError = function() {
    const overlay = document.getElementById('networkErrorOverlay');
    if (overlay) overlay.style.display = 'flex';
  };

  window.hideNetworkError = function() {
    const overlay = document.getElementById('networkErrorOverlay');
    if (overlay) overlay.style.display = 'none';
  };

  // Attach button events after DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    const retryBtn = document.getElementById('retryNetworkBtn');
    const reloadBtn = document.getElementById('reloadPageBtn');

    if (retryBtn) {
      retryBtn.addEventListener('click', function() {
        window.hideNetworkError();
        location.reload();
      });
    }
    if (reloadBtn) {
      reloadBtn.addEventListener('click', function() {
        location.reload();
      });
    }
  });
})();


let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
}

async function refreshAccessToken() {
  const refreshToken = getCookie('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const response = await fetchWithAuth(`${AUTH_URL}refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  const data = await response.json();
  if (!response.ok || !data.is_success) {
    throw new Error(data.message || 'Refresh failed');
  }
  const d = data.data;
  const expiryDays = 3;
  setCookie('access_token', d.access_token, expiryDays);
  if (d.refresh_token) setCookie('refresh_token', d.refresh_token, expiryDays);
  if (d.user_id) setCookie('user_id', d.user_id, expiryDays);
  if (d.is_email_verified !== undefined) setCookie('is_email_verified', d.is_email_verified, expiryDays);
  if (d.is_hall_verified !== undefined) setCookie('is_hall_verified', d.is_hall_verified, expiryDays);
  if (d.first_name) setCookie('first_name', d.first_name, expiryDays);
  if (d.last_name) setCookie('last_name', d.last_name, expiryDays);
  if (d.email) setCookie('user_email', encodeURIComponent(d.email), expiryDays);
  if (d.profile_pic) setCookie('profile_pic', d.profile_pic, expiryDays);
  if (d.point_bal !== undefined) setCookie('point_bal', d.point_bal, expiryDays);
  if (d.trusting_score !== undefined) setCookie('trusting_score', d.trusting_score, expiryDays);
  if (typeof populateUserProfile === 'function') {
    populateUserProfile();
  }
  return d.access_token;
}


// ─── Rate Limit Modal (self-contained) ──────────────────────
function showRateLimitModal(message = "Too many requests. Please wait a moment and try again.") {
  const existing = document.getElementById('rateLimitModal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'rateLimitModal';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    animation: fadeIn 0.3s ease;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    max-width: 420px;
    width: 100%;
    background: white;
    border-radius: 1.5rem;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 24px 48px rgba(0,0,0,0.15);
    animation: slideUp 0.4s ease;
  `;

  modal.innerHTML = `
    <div style="font-size: 3rem; color: #f5b042; margin-bottom: 1rem;">
      <i class="fas fa-exclamation-triangle"></i>
    </div>
    <h2 style="font-weight: 700; font-size: 1.5rem; color: #1e2a2c; margin-bottom: 0.75rem;">Rate Limit Reached</h2>
    <p style="color: #5a6e6f; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem;">
      ${escapeHtml(message)}
    </p>
    <button id="rateLimitRetryBtn" class="btn btn-primary-custom" style="min-width: 140px; padding: 0.6rem 1.5rem; border-radius: 40px; font-weight: 600; border: none; cursor: pointer;">
      <i class="fas fa-check-circle me-2"></i> Okay
    </button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Add styles for animations if not already present
  if (!document.getElementById('rate-limit-styles')) {
    const style = document.createElement('style');
    style.id = 'rate-limit-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  // Handle retry button
  const retryBtn = document.getElementById('rateLimitRetryBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function() {
      overlay.remove();
    });
  }

  // Allow clicking outside to close (but only if they really want to)
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

async function fetchWithAuth(url, options = {}) {
  const headers = options.headers || {};
  const token = getCookie('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  options.headers = headers;

  let response = await fetch(url, options);

  if (response.status === 429) {
    showRateLimitModal();
    throw new Error('Rate limit exceeded');
  }

  if (response.status === 401) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          options.headers['Authorization'] = `Bearer ${newToken}`;
          resolve(fetch(url, options));
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      options.headers['Authorization'] = `Bearer ${newToken}`;
      onTokenRefreshed(newToken);
      response = await fetch(url, options);
      isRefreshing = false;
      return response;
    } catch (refreshError) {
      isRefreshing = false;
      deleteAuthCookies();

      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      if (currentPath && !currentPath.includes('index.html') && currentPath !== '/') {
        setCookie('redirect_after_login', currentPath, 1);
      }

      showToast('Session expired. Please log in again.', 'error');
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 2000);
      throw refreshError;
    }
  }

  if (response.status === 403) {
    window.location.href = '403.html';
    throw new Error('Forbidden');
  }
  return response;
}


// ========== NAVIGATION INJECTION ==========
function injectNavigation() {
  // Avoid duplicate injection
  if (document.getElementById('mainNav')) return;

  const placeholder = document.getElementById('nav-placeholder');
  if (!placeholder) return;

  // Build the navigation HTML (same structure as before)
  const navHTML = `
    <header class="site-header fixed-top" id="mainNav">
      <nav class="navbar navbar-expand-lg" aria-label="Main navigation">
        <div class="container header-inner">
          <a class="site-brand" href="main.html" aria-label="CampusConnect UI home" data-bs-toggle="tooltip" title="Go to dashboard">
            <img src="../assets/img/icon.jpg" alt="CampusConnect UI logo" class="site-brand-logo">
            <span class="site-brand-name">
              <span class="brand-full">CampusConnect UI</span>
              <span class="brand-short">CampusConnect</span>
            </span>
          </a>
          
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain" aria-controls="navbarMain" aria-expanded="false" aria-label="Toggle navigation" data-tooltip="true" title="Open menu">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarMain">
            <!-- Desktop dropdown -->
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center d-none d-md-flex">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-tooltip="true" title="Open account menu">
                  <span id="desktopAvatarWrapper">
                    <img id="desktopAvatarImg" src="" alt="Profile" style="display:none; width:36px; height:36px; border-radius:50%; object-fit:cover; margin-right:0.5rem;">
                    <i id="desktopAvatarIcon" class="fas fa-user-circle fa-lg me-1"></i>
                  </span>
                  <span id="desktopUserName">Null</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-2" aria-labelledby="userDropdown">
                  <li><a class="dropdown-item" href="profile.html" data-bs-toggle="tooltip" title="View profile"><i class="fas fa-id-card me-2"></i>My Profile</a></li>
                  <li><a class="dropdown-item" href="create-listing.html" data-bs-toggle="tooltip" title="Post listing"><i class="fas fa-plus-circle me-2"></i>Post a Listing</a></li>
                  <li><a class="dropdown-item" href="listings.html" data-bs-toggle="tooltip" title="Browse listings"><i class="fas fa-list me-2"></i>Browse Listings</a></li>
                  <li><a class="dropdown-item" href="buy-points.html" data-bs-toggle="tooltip" title="Buy points"><i class="fas fa-bolt me-2"></i>Buy Points</a></li>
                  <li><a class="dropdown-item" href="../t/report-issue.html" data-bs-toggle="tooltip" title="Report issue"><i class="fas fa-flag me-2"></i>Report Issue</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" onclick="logout(); return false;" data-bs-toggle="tooltip" title="Sign out"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                </ul>
              </li>
            </ul>

            <!-- Mobile profile card -->
            <div class="mobile-profile-card d-md-none p-3">
              <div class="text-center mb-3">
                <div id="mobileAvatarWrapper" class="text-center mb-3">
                  <img id="mobileAvatarImg" src="" alt="Profile" style="display:none; width:80px; height:80px; border-radius:50%; object-fit:cover; margin:0 auto;">
                  <i id="mobileAvatarIcon" class="fas fa-user-circle fa-4x text-success"></i>
                </div>
                <h5 class="mt-2 mb-0" id="mobileFullName">Null</h5>
                <div class="small text-muted" id="mobileUserEmail">Null</div>
              </div>
              <div class="row text-center g-2 mb-3">
                <div class="col-6">
                  <div class="bg-light rounded-3 p-2">
                    <div class="small text-muted">Points</div>
                    <strong id="mobilePointsBalance">0</strong>
                  </div>
                </div>
                <div class="col-6">
                  <div class="bg-light rounded-3 p-2">
                    <div class="small text-muted">Trust Score</div>
                    <strong id="mobileTrustScore">0%</strong>
                  </div>
                </div>
              </div>
              <hr class="my-2">
              <ul class="nav flex-column">
                <li class="nav-item"><a class="nav-link py-2" href="profile.html" data-bs-toggle="tooltip" title="View profile"><i class="fas fa-id-card me-2"></i> My Profile</a></li>
                <li class="nav-item"><a class="nav-link py-2" href="create-listing.html" data-bs-toggle="tooltip" title="Post listing"><i class="fas fa-plus-circle me-2"></i> Post a Listing</a></li>
                <li class="nav-item"><a class="nav-link py-2" href="listings.html" data-bs-toggle="tooltip" title="Browse listings"><i class="fas fa-list me-2"></i> Browse Listings</a></li>
                <li class="nav-item"><a class="nav-link py-2" href="buy-points.html" data-bs-toggle="tooltip" title="Buy points"><i class="fas fa-bolt me-2"></i> Buy Points</a></li>
                <li class="nav-item"><a class="nav-link py-2" href="../t/report-issue.html" data-bs-toggle="tooltip" title="Report issue"><i class="fas fa-flag me-2"></i> Report Issue</a></li>
                <li><hr class="my-2"></li>
                <li class="nav-item"><a class="nav-link text-danger py-2" href="#" onclick="logout(); return false;" data-bs-toggle="tooltip" title="Sign out"><i class="fas fa-sign-out-alt me-2"></i> Logout</a></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  `;

  placeholder.innerHTML = navHTML;

  // Now populate user profile using the newly injected elements
  populateUserProfile();
}


async function refreshPointBalance() {
  // ─── Show spinner + blur ───
  showRefreshSpinner();

  try {
    const response = await fetchWithAuth(REFRESH_URL, {
      headers: { 'Accept': 'application/json', ...getAuthHeaders() }
    });
    if (!response.ok) throw new Error('Failed to refresh dashboard');
    const result = await response.json();
    if (!result.is_success || !result.data) throw new Error(result.message || 'Invalid response');

    const newBalance = result.data.points_balance;

    // Update all displays
    const pointsBalanceValue = document.getElementById('pointsBalanceValue');
    const summaryPointsBalance = document.getElementById('summaryPointsBalance');
    const pointsBalanceDisplay = document.getElementById('pointsBalanceDisplay');

    if (pointsBalanceDisplay) pointsBalanceDisplay.innerText = newBalance;
    if (pointsBalanceValue) pointsBalanceValue.innerText = newBalance;
    if (summaryPointsBalance) summaryPointsBalance.innerText = newBalance;

    setCookie('point_bal', newBalance, 10);

    const mainmobilePointsBalance = document.getElementById('mobilePointsBalance');
    if (mainmobilePointsBalance) mainmobilePointsBalance.textContent = newBalance;

    showToast('Point balance updated', 'success');
  } catch (err) {
    console.error('Refresh error:', err);
    showToast('Failed to refresh Point balance', 'error');
  } finally {
    // ─── Hide spinner + blur ───
    hideRefreshSpinner();
  }
}


function injectBreadcrumb(pageTitle) {
  const placeholder = document.getElementById('breadcrumb-placeholder');
  if (!placeholder) return;

  if (!document.getElementById('dashboard-breadcrumb-styles')) {
    const style = document.createElement('style');
    style.id = 'dashboard-breadcrumb-styles';
    style.textContent = `
      .dashboard-breadcrumb-shell {
        padding-top: 76px;
        background: rgba(250, 252, 251, 0.92);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(44, 122, 94, 0.12);
        position: relative;
        z-index: 20;
      }
      .dashboard-breadcrumb {
        min-height: 48px;
        display: flex;
        align-items: center;
        gap: 0.65rem;
        flex-wrap: wrap;
        color: var(--text-muted, #5a6e6f);
        font-size: 0.9rem;
      }
      .dashboard-breadcrumb .breadcrumb-back-btn {
        border-radius: 999px;
        padding: 0.35rem 0.8rem;
        font-weight: 600;
      }
      .dashboard-breadcrumb .breadcrumb-home {
        color: var(--accent-dark, #1f5e48);
        text-decoration: none;
        font-weight: 600;
      }
      .dashboard-breadcrumb .breadcrumb-current {
        color: var(--text-dark, #1e2a2c);
        font-weight: 700;
      }
      @media (max-width: 576px) {
        .dashboard-breadcrumb-shell {
          padding-top: 68px;
        }
        .dashboard-breadcrumb {
          min-height: 44px;
          font-size: 0.82rem;
        }
        .dashboard-breadcrumb .breadcrumb-back-btn {
          padding: 0.3rem 0.65rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  placeholder.innerHTML = `
    <nav aria-label="Breadcrumb" class="dashboard-breadcrumb-shell">
      <div class="container dashboard-breadcrumb">
        <button type="button" class="btn btn-sm btn-outline-custom breadcrumb-back-btn" onclick="history.back()" data-bs-toggle="tooltip" title="Go back">
          <i class="fas fa-arrow-left me-1"></i> Back
        </button>
        <a class="breadcrumb-home" href="main.html" data-bs-toggle="tooltip" title="Go to dashboard">Dashboard</a>
        <span aria-hidden="true">/</span>
        <span class="breadcrumb-current" aria-current="page">${escapeHtml(pageTitle)}</span>
      </div>
    </nav>
  `;

  // Re-initialise tooltips if the global function exists
  if (typeof initTooltips === 'function') {
    setTimeout(initTooltips, 100);
  }
}

function initTooltips() {
  if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) return;
  
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"], [data-tooltip="true"]'));
  
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    let tooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
    if (tooltip) {
      tooltip.dispose();
    }
  });

  setTimeout(function() {
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
      if (document.body.contains(tooltipTriggerEl)) {
        new bootstrap.Tooltip(tooltipTriggerEl, {
          trigger: 'hover focus',
          container: 'body'
        });
      }
    });
  }, 50);
}



// ========== START EVERYTHING AFTER DOM READY ==========
function initAll() {
  injectNavigation();
  initOptionalFeatures();
  initScrollToTop();
  initMobileMenu();
  initMobileMenuOutsideClick();
  initReportLostFeature();
  initTooltips();
  ensureToastContainer();


  if (!formModal && document.getElementById('formModal')) {
    formModal = new FormModal();
  }
  if (!confirmModal && document.getElementById('confirmModal')) {
    confirmModal = new ConfirmModal();
  }

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
