/**
 * Authentication & Role Session Controller
 */
const auth = {

  // Switch Auth Tab (Sign In vs Register)
  switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-register');

    if (tab === 'login') {
      loginForm.style.display = 'block';
      regForm.style.display = 'none';
      tabLogin.classList.add('active');
      tabReg.classList.remove('active');
    } else {
      loginForm.style.display = 'none';
      regForm.style.display = 'block';
      tabLogin.classList.remove('active');
      tabReg.classList.add('active');
    }
  },

  // Fill Quick Demo Accounts
  fillDemo(type) {
    this.switchAuthTab('login');
    const roleSelect = document.getElementById('login-requested-role');
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');

    if (type === 'admin') {
      roleSelect.value = 'Admin';
      emailInput.value = 'admin@retail.com';
      passInput.value = 'Admin123';
      app.showToast('Selected Demo Admin Credentials!', 'info');
    } else {
      roleSelect.value = 'Customer';
      emailInput.value = 'customer@gmail.com';
      passInput.value = 'Customer123';
      app.showToast('Selected Demo Customer Credentials!', 'info');
    }
  },

  // Handle Login Submission
  async handleLogin(e) {
    e.preventDefault();
    const requestedRole = document.getElementById('login-requested-role').value;
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const res = await fetch(`${app.apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, requestedRole })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      app.currentUser = data.user;
      localStorage.setItem('omni_retail_user', JSON.stringify(data.user));
      app.updateUserUI();

      app.showToast(`Welcome back, ${data.user.fullName}!`, 'success');

      if (data.user.role === 'Admin') {
        app.showView('admin-view');
      } else {
        app.showView('store-view');
      }

    } catch (err) {
      app.showToast(err.message, 'error');
    }
  },

  // Handle Registration Submission
  async handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;

    try {
      const res = await fetch(`${app.apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      app.showToast('Registration successful! Please log in.', 'success');
      this.switchAuthTab('login');
      document.getElementById('login-email').value = email;
      document.getElementById('login-password').value = password;

    } catch (err) {
      app.showToast(err.message, 'error');
    }
  },

  // Logout Handler
  logout() {
    app.currentUser = null;
    localStorage.removeItem('omni_retail_user');
    app.updateUserUI();
    app.showToast('Logged out successfully.', 'info');
    app.showView('store-view');
  }
};
