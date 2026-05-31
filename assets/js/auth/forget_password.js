  // ========== Forgot Password with Real Backend ==========
const forgotForm = document.getElementById('forgotFormElement');
const resetBtn = document.getElementById('sendLinkBtn');
const resetOriginalText = 'Send reset link';
const FORGOT_PASSWORD_URL = `${AUTH_URL}forgot-password`;

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
      
      // Redirect to login page after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/auth/auth.html';
      }, 1500);
    } else {
      showToast(result.message || 'Failed to send reset link. Please try again.', 'error');
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    showToast('Network error. Could not connect to server.', 'error');
  } finally {
    setButtonLoading(resetBtn, false, resetOriginalText);
  }
});
