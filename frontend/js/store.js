/**
 * Customer Storefront & Shopping Cart Engine
 */
const store = {
  products: [],
  categories: [],
  cart: [],
  selectedCategoryId: 0,

  init() {
    this.loadCategories();
    this.loadProducts();
    this.loadCartFromStorage();
  },

  // Load Categories from API
  async loadCategories() {
    try {
      const res = await fetch(`${app.apiBase}/categories`);
      if (res.ok) {
        this.categories = await res.json();
        this.renderCategoryPills();
      }
    } catch (e) {
      console.warn('Could not load categories:', e);
    }
  },

  // Render Category Pill Filters
  renderCategoryPills() {
    const container = document.getElementById('category-pills-container');
    if (!container) return;

    let html = `<button class="pill-btn ${this.selectedCategoryId === 0 ? 'active' : ''}" onclick="store.selectCategory(0, this)">All Categories</button>`;
    
    this.categories.forEach(cat => {
      html += `<button class="pill-btn ${this.selectedCategoryId === cat.id ? 'active' : ''}" onclick="store.selectCategory(${cat.id}, this)">${cat.name}</button>`;
    });

    container.innerHTML = html;
  },

  // Select Category Filter
  selectCategory(catId, btn) {
    this.selectedCategoryId = catId;
    document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.filterProducts();
  },

  // Load Product Catalog from API
  async loadProducts() {
    try {
      const res = await fetch(`${app.apiBase}/products`);
      if (res.ok) {
        this.products = await res.json();
        this.filterProducts();
      }
    } catch (e) {
      app.showToast('Failed to load store products.', 'error');
    }
  },

  // Filter & Render Product Cards
  filterProducts() {
    const searchVal = (document.getElementById('store-search-input')?.value || '').toLowerCase();
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    let filtered = this.products;

    if (this.selectedCategoryId > 0) {
      filtered = filtered.filter(p => p.categoryId === this.selectedCategoryId);
    }

    if (searchVal) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchVal) || (p.description && p.description.toLowerCase().includes(searchVal)));
    }

    if (!filtered.length) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: white; border-radius: var(--radius-lg);">
          <i class="fa-solid fa-box-open" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <h3>No products found</h3>
          <p style="color: var(--text-muted);">Try adjusting your search criteria or category filter.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const isOutOfStock = p.stockQuantity <= 0;
      const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= 10;
      
      let stockClass = 'in-stock';
      let stockText = `In Stock (${p.stockQuantity})`;

      if (isOutOfStock) { stockClass = 'out-of-stock'; stockText = 'Out of Stock'; }
      else if (isLowStock) { stockClass = 'low-stock'; stockText = `Low Stock (${p.stockQuantity} left)`; }

      const categoryName = p.categoryName || (p.category ? p.category.name : 'Retail');

      return `
        <div class="product-card">
          <div class="product-img-wrapper">
            <span class="badge-cat">${categoryName}</span>
            <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'">
          </div>
          <div class="product-details">
            <h4 class="product-title" title="${p.name}">${p.name}</h4>
            <p class="product-desc">${p.description || 'High quality retail store item.'}</p>
            <div class="product-footer">
              <div>
                <div class="product-price">₹${p.price.toFixed(2)}</div>
                <span class="stock-indicator ${stockClass}">${stockText}</span>
              </div>
              <button class="btn btn-primary" onclick="store.addToCart(${p.id})" ${isOutOfStock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                <i class="fa-solid fa-cart-plus"></i> Add
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Cart Management Methods - Requires Authentication
  addToCart(productId) {
    // MANDATORY REQUIREMENT: Must log in / sign up before adding items to cart
    if (!app.currentUser) {
      app.showToast('Please sign in or create an account to add items to your cart!', 'warning');
      auth.switchAuthTab('register');
      app.showView('auth-view');
      return;
    }

    const product = this.products.find(p => p.id === productId);
    if (!product || product.stockQuantity <= 0) return;

    const existing = this.cart.find(item => item.product.id === productId);
    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        app.showToast(`Cannot add more. Only ${product.stockQuantity} available in stock!`, 'warning');
        return;
      }
      existing.quantity += 1;
    } else {
      this.cart.push({ product, quantity: 1 });
    }

    this.saveCart();
    app.showToast(`Added '${product.name}' to shopping cart!`, 'success');
  },

  updateCartQty(productId, delta) {
    const item = this.cart.find(i => i.product.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.cart = this.cart.filter(i => i.product.id !== productId);
    } else if (item.quantity > item.product.stockQuantity) {
      item.quantity = item.product.stockQuantity;
      app.showToast(`Maximum stock limit reached (${item.product.stockQuantity}).`, 'warning');
    }

    this.saveCart();
  },

  toggleCart(open) {
    const overlay = document.getElementById('cart-overlay');
    const drawer = document.getElementById('cart-drawer');

    if (open) {
      overlay.classList.add('active');
      drawer.classList.add('active');
    } else {
      overlay.classList.remove('active');
      drawer.classList.remove('active');
    }
  },

  saveCart() {
    localStorage.setItem('omni_retail_cart', JSON.stringify(this.cart));
    this.renderCartUI();
  },

  loadCartFromStorage() {
    const saved = localStorage.getItem('omni_retail_cart');
    if (saved) {
      try { this.cart = JSON.parse(saved); } catch (e) { this.cart = []; }
    }
    this.renderCartUI();
  },

  renderCartUI() {
    const container = document.getElementById('cart-items-container');
    const badge = document.getElementById('cart-count-badge');
    const totalDisplay = document.getElementById('cart-total-display');

    const totalItemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    if (badge) badge.textContent = totalItemCount;
    if (totalDisplay) totalDisplay.textContent = `₹${totalPrice.toFixed(2)}`;

    if (!container) return;

    if (!this.cart.length) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.4;"></i>
          <p>Your shopping cart is empty.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <img src="${item.product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'}" alt="${item.product.name}">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.product.name}</div>
          <div class="cart-item-price">₹${(item.product.price * item.quantity).toFixed(2)}</div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="store.updateCartQty(${item.product.id}, -1)">-</button>
            <span style="font-weight: 600; font-size: 0.9rem;">${item.quantity}</span>
            <button class="qty-btn" onclick="store.updateCartQty(${item.product.id}, 1)">+</button>
          </div>
        </div>
        <button onclick="store.updateCartQty(${item.product.id}, -999)" style="background: none; color: var(--danger); font-size: 1.1rem;">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `).join('');
  },

  // Checkout Modal Flow
  openCheckout() {
    if (!this.cart.length) {
      app.showToast('Your cart is empty!', 'warning');
      return;
    }

    if (!app.currentUser) {
      app.showToast('Please sign in or create an account to complete your checkout.', 'info');
      auth.switchAuthTab('login');
      app.showView('auth-view');
      this.toggleCart(false);
      return;
    }

    const totalPrice = this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    document.getElementById('checkout-total-display').textContent = `₹${totalPrice.toFixed(2)}`;
    
    if (app.currentUser.address) {
      document.getElementById('checkout-address').value = app.currentUser.address;
    }

    this.toggleCart(false);
    app.openModal('checkout-modal');
  },

  // Submit Order to API
  async submitOrder(e) {
    e.preventDefault();
    if (!app.currentUser) return;

    const shippingAddress = document.getElementById('checkout-address').value.trim();
    const paymentMethod = document.getElementById('checkout-payment').value;

    const items = this.cart.map(i => ({
      productId: i.product.id,
      quantity: i.quantity
    }));

    try {
      const res = await fetch(`${app.apiBase}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: app.currentUser.id,
          shippingAddress,
          paymentMethod,
          items
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order creation failed.');

      app.showToast(`Order #${data.id} placed successfully!`, 'success');
      this.cart = [];
      this.saveCart();
      app.closeModal('checkout-modal');
      this.loadProducts(); // Refresh stock
      app.showView('orders-view');

    } catch (err) {
      app.showToast(err.message, 'error');
    }
  },

  // Load User Orders History
  async loadUserOrders() {
    if (!app.currentUser) return;
    const tbody = document.getElementById('customer-orders-tbody');
    if (!tbody) return;

    try {
      const res = await fetch(`${app.apiBase}/orders/user/${app.currentUser.id}`);
      if (!res.ok) throw new Error('Failed to load orders.');
      
      const orders = await res.json();

      if (!orders.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">You haven't placed any orders yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = orders.map(o => {
        const dateStr = new Date(o.orderDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const itemsStr = o.items ? o.items.map(i => `${i.productName || 'Item'} x${i.quantity}`).join(', ') : 'Order Items';

        return `
          <tr>
            <td><strong>#${o.id}</strong></td>
            <td>${dateStr}</td>
            <td style="max-width: 250px;">${itemsStr}</td>
            <td><strong>₹${parseFloat(o.totalAmount).toFixed(2)}</strong></td>
            <td><span class="status-badge ${o.status}">${o.status}</span></td>
            <td style="color: var(--text-muted); font-size: 0.85rem;">${o.shippingAddress}</td>
          </tr>
        `;
      }).join('');

    } catch (err) {
      app.showToast('Could not fetch purchase history.', 'error');
    }
  }
};
