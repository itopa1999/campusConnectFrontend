// ========== Login with Real Backend (Store in Cookies) ==========
const loginForm = document.getElementById('loginFormElement');
const loginBtn = document.getElementById('loginBtn');
const loginOriginalText = 'Sign in';
const LOGIN_URL = `${AUTH_URL}login-user`;

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberCheck').checked;

  if (!email || !password) {
    showToast('Please fill in all fields.', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters.', 'error');
    return;
  }

  // if (!email.endsWith('@Demo University.edu.ng') && !email.endsWith('@stu.Demo University.edu.ng')) {
  //   showToast('Please use a valid @Demo University.edu.ng or @stu.Demo University.edu.ng email.', 'error');
  //   return;
  // }

  setButtonLoading(loginBtn, true, loginOriginalText);

  try {
    const response = await fetchWithAuth(LOGIN_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok && result.is_success === true) {
      
      const user = result.data.user;
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify({
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        profile_pic: user.profile_pic,
        point_bal: user.point_bal,
        trusting_score: user.trusting_score,
        is_email_verified: user.is_email_verified,
        is_hall_verified: user.is_hall_verified,
      }));

      sessionStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');

      showToast(result.message || 'Login successful! Redirecting...', 'success');

      loginForm.reset();
      document.getElementById('rememberCheck').checked = false;

      setTimeout(() => {
        const redirectCookie = getCookie("redirect_after_login");
          if (!redirectCookie) {
            window.location.href = "/dash/main.html";
            return;
        }

        const redirectPath = decodeURIComponent(redirectCookie);
        deleteCookie("redirect_after_login");
        window.location.href = redirectPath;
        
      }, 1000);
    } else {
      showToast(result.message || 'Invalid email or password.', 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    showToast('Network error. Could not connect to server.', 'error');
  } finally {
    setButtonLoading(loginBtn, false, loginOriginalText);
  }
});

// ========== Signup with Real Backend ==========
const signupForm = document.getElementById('signupFormElement');
const signupBtn = document.getElementById('signupBtn');
const signupOriginalText = 'Create free account';
const REGISTER_URL = `${AUTH_URL}register`;

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Check Terms checkbox
  const termsChecked = document.getElementById('termsCheck').checked;
  if (!termsChecked) {
    showToast('You must agree to the Terms of Service and Privacy Policy.', 'error');
    return;
  }

  // Gather fields
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const phone = document.getElementById('phoneNumber').value.trim();
  const password = document.getElementById('signupPassword').value;

  if (!firstName || !lastName || !email || !phone || !password) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters.', 'error');
    return;
  }

  setButtonLoading(signupBtn, true, signupOriginalText);

  try {
    const response = await fetchWithAuth(REGISTER_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        password: password
      })
    });

    const result = await response.json();

    if (response.ok && result.is_success === true) {
      showToast(result.message || 'Account created successfully! Please check your email for verification.', 'success');

      signupForm.reset();
      document.getElementById('termsCheck').checked = false;

      // Switch to login tab after a short delay
      setTimeout(() => {
        document.querySelector('.auth-tab[data-form="login"]').click();
        document.getElementById('loginEmail').value = email;
      }, 1500);
    } else {
      showToast(result.message || 'Registration failed. Please try again.', 'error');
    }
  } catch (err) {
    console.error('Signup error:', err);
    showToast('Network error. Could not connect to server.', 'error');
  } finally {
    setButtonLoading(signupBtn, false, signupOriginalText);
  }
});

  // ========== Smooth form switching (preserve button states) ==========
  const tabs = document.querySelectorAll('.auth-tab');
  const loginFormDiv = document.getElementById('login-form');
  const signupFormDiv = document.getElementById('signup-form');

  function switchForm(formName) {
    if (formName === 'login') {
      loginFormDiv.classList.add('active-form');
      signupFormDiv.classList.remove('active-form');
      tabs.forEach(tab => {
        if (tab.dataset.form === 'login') tab.classList.add('active');
        else tab.classList.remove('active');
      });
    } else {
      signupFormDiv.classList.add('active-form');
      loginFormDiv.classList.remove('active-form');
      tabs.forEach(tab => {
        if (tab.dataset.form === 'signup') tab.classList.add('active');
        else tab.classList.remove('active');
      });
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const form = tab.dataset.form;
      switchForm(form);
    });
  });

