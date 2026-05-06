AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50
  });
  // simple smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === "#" || href === "") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  window.onload = function() {
    particlesJS('particles-js', {
      "particles": {
        "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": "#2c7a5e" },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.4, "random": true },
        "size": { "value": 3, "random": true },
        "line_linked": { "enable": true, "distance": 150, "color": "#2c7a5e", "opacity": 0.2, "width": 1 },
        "move": { "enable": true, "speed": 1, "direction": "none", "random": false, "straight": false, "out_mode": "out" }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": { "enable": true, "mode": "repulse" },
          "onclick": { "enable": true, "mode": "push" },
          "resize": true
        }
      },
      "retina_detect": true
    });
  };


  /**
 * Show a toast notification (success or error)
 * @param {string} message - The text to display
 * @param {string} type - 'success' or 'error'
 * @param {number} duration - milliseconds to show (default 4000)
 */
function showToast(message, type = 'success', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;
  
  // Add icon based on type
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}

// ========== Spinner helper ==========
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

// Helper: set cookie with optional days (if days = null, session cookie)
function setCookie(name, value, days) {
  let cookieString = `${name}=${value}; path=/`;
  if (days !== null && days !== undefined) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${expires.toUTCString()}`;
  }
  // For session cookies, we omit "expires" and "max-age"
  document.cookie = cookieString;
}


// Delete only the authentication-related cookies
function deleteAuthCookies() {
  const cookiesToDelete = [
    'access_token',
    'refresh_token',
    'user_id',
    'is_email_verified'];
  cookiesToDelete.forEach(name => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  });
}


AUTH_URL = 'http://127.0.0.1:8000/user/api/auth/';