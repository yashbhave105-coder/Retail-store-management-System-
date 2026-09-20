/**
 * Core Application Framework & State Manager
 */
const app = {
  // Base API endpoint URL (Auto detects environment)
  apiBase: '/api',

  // Current Active User State
  currentUser: null,

  // App Initialization
  init() {
    this.checkSession();
    this.showView(this.currentUser ? (this.currentUser.role === 'Admin' ? 'admin-view' : 'store-view') : 'store-view');
    store.init();
  },

  // Check stored user session in localStorage
  checkSession() {
    const savedUser = localStorage.getItem('omni_retail_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.updateUserUI();
      } catch (e) {
        localStorage.removeItem('omni_retail_user');
      }
    } else {
      this.updateUserUI();
    }
  },

  // Update UI Elements based on logged-in user state
  updateUserUI() {
    const userBar = document.getElementById('user-info-bar');
    const loginNavBtn = document.getElementById('login-nav-btn');
    const userNameDisplay = document.getElementById('user-name-display');
    const userRoleDisplay = document.getElementById('user-role-display');
    const cartTriggerBtn = document.getElementById('cart-trigger-btn');
    const navAdminBtn = document.getElementById('nav-admin-btn');
    const navMyOrdersBtn = document.getElementById('nav-myorders-btn');

    if (this.currentUser) {
      if (userBar) userBar.style.display = 'flex';
      if (loginNavBtn) loginNavBtn.style.display = 'none';
      if (cartTriggerBtn) cartTriggerBtn.style.display = 'flex';

      if (userNameDisplay) userNameDisplay.textContent = this.currentUser.fullName || this.currentUser.email;
      if (userRoleDisplay) {
        userRoleDisplay.textContent = this.currentUser.role;
        userRoleDisplay.className = `role-pill ${this.currentUser.role.toLowerCase()}`;
      }

      // Show/Hide Role Specific Nav Tabs
      if (this.currentUser.role === 'Admin') {
        if (navAdminBtn) navAdminBtn.style.display = 'inline-flex';
        if (navMyOrdersBtn) navMyOrdersBtn.style.display = 'none';
      } else {
        if (navAdminBtn) navAdminBtn.style.display = 'none';
        if (navMyOrdersBtn) navMyOrdersBtn.style.display = 'inline-flex';
      }
    } else {
      if (userBar) userBar.style.display = 'none';
      if (loginNavBtn) loginNavBtn.style.display = 'inline-flex';
      if (cartTriggerBtn) cartTriggerBtn.style.display = 'flex';
      if (navAdminBtn) navAdminBtn.style.display = 'none';
      if (navMyOrdersBtn) navMyOrdersBtn.style.display = 'none';
    }
  },

  // View Routing Handler
  showView(viewId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

    const targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.add('active');

    // Highlight active navbar button
    if (viewId === 'store-view') document.getElementById('nav-store-btn')?.classList.add('active');
    if (viewId === 'orders-view') document.getElementById('nav-myorders-btn')?.classList.add('active');
    if (viewId === 'admin-view') document.getElementById('nav-admin-btn')?.classList.add('active');

    // View specific initialization hooks
    if (viewId === 'store-view') store.loadProducts();
    if (viewId === 'orders-view') store.loadUserOrders();
    if (viewId === 'admin-view') admin.init();
  },

  // Modal Open/Close Controls
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  // Toast Notification System
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
