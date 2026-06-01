  // ========== Forgot Password with Real Backend ==========
const forgotForm = document.getElementById('forgotFormElement');
const resetBtn = document.getElementById('sendLinkBtn');
const resetOriginalText = 'Send reset link';
const FORGOT_PASSWORD_URL = `${AUTH_URL}forgot-password`;
const COUNTDOWN_STORAGE_KEY = 'forgotPasswordCountdown';

// Countdown timer function (90 seconds = 1 min 30 sec)
function startCountdown(button, duration = 90) {
  let timeLeft = duration;
  button.disabled = true;
  
  // Store countdown end time in localStorage
  const endTime = Date.now() + (timeLeft * 1000);
  localStorage.setItem(COUNTDOWN_STORAGE_KEY, endTime);

  const updateButton = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const displayText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    button.textContent = displayText;
  };

  updateButton(); // Initial display

  const interval = setInterval(() => {
    timeLeft--;

    if (timeLeft <= 0) {
      clearInterval(interval);
      button.disabled = false;
      button.textContent = resetOriginalText;
      localStorage.removeItem(COUNTDOWN_STORAGE_KEY); // Clear storage
    } else {
      updateButton();
    }
  }, 1000);
}

// Check if countdown exists on page load
function checkAndRestoreCountdown() {
  const endTime = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
  
  if (endTime) {
    const now = Date.now();
    const timeLeft = Math.ceil((endTime - now) / 1000);
    
    if (timeLeft > 0) {
      // Restore countdown
      startCountdown(resetBtn, timeLeft);
    } else {
      // Countdown expired, clear it
      localStorage.removeItem(COUNTDOWN_STORAGE_KEY);
      resetBtn.disabled = false;
      resetBtn.textContent = resetOriginalText;
    }
  }
}

// Restore countdown on page load
document.addEventListener('DOMContentLoaded', checkAndRestoreCountdown);

forgotForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('resetEmail').value.trim();

  if (!email) {
    showToast('Please enter your UI email address.', 'error');
    return;
  }

  // Optional: basic UI domain hint (backend will validate anyway)
  // if (!email.endsWith('@ui.edu.ng') && !email.endsWith('@stu.ui.edu.ng')) {
  //   showToast('Please use a valid @ui.edu.ng or @stu.ui.edu.ng email.', 'error');
  //   return;
  // }

  setButtonLoading(resetBtn, true, resetOriginalText);

  try {
    const response = await fetch(FORGOT_PASSWORD_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (response.ok && result.is_success === true) {
      showToast(result.message || `Password reset link sent to ${email}. Check your inbox.`, 'success');
      
      forgotForm.reset();
      
      // Start countdown timer instead of redirecting
      startCountdown(resetBtn, 90);
      
      // Redirect to login page after 1.5 seconds
      // setTimeout(() => {
      //   window.location.href = '/auth/auth.html';
      // }, 1500);
    } else {
      showToast(result.message || 'Failed to send reset link. Please try again.', 'error');
      // Re-enable button on error
      setButtonLoading(resetBtn, false, resetOriginalText);
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    showToast('Network error. Could not connect to server.', 'error');
    // Re-enable button on error
    setButtonLoading(resetBtn, false, resetOriginalText);
  }
});
