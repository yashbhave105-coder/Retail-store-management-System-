/**
 * Admin Panel & Inventory Management Controller
 */
const admin = {
  products: [],
  orders: [],

  init() {
    if (!app.currentUser || app.currentUser.role !== 'Admin') {
      app.showToast('Access denied. Administrator login required.', 'error');
      app.showView('auth-view');
      return;
    }

    this.loadStats();
    this.loadAdminProducts();
    this.loadAdminOrders();
  },

  // Load Dashboard Statistics
  async loadStats() {
    try {
      const res = await fetch(`${app.apiBase}/admin/stats`);
      if (res.ok) {
        const stats = await res.json();
        document.getElementById('stat-revenue').textContent = `₹${parseFloat(stats.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        document.getElementById('stat-orders').textContent = stats.totalOrders;
        document.getElementById('stat-products').textContent = stats.totalProducts;
        document.getElementById('stat-lowstock').textContent = stats.lowStockProducts;
      }
    } catch (e) {
      console.warn('Could not load dashboard stats:', e);
    }
  },

  // Populate Categories in Product Form Select
  populateCategorySelect() {
    const select = document.getElementById('prod-category');
    if (!select) return;

    select.innerHTML = store.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  },

  // Open Product Modal (Create or Edit mode)
  openProductModal(product = null) {
    this.populateCategorySelect();
    const modalTitle = document.getElementById('product-modal-title');
    const form = document.getElementById('product-form');
    form.reset();

    if (product) {
      modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Product`;
      document.getElementById('prod-id').value = product.id;
      document.getElementById('prod-name').value = product.name;
      document.getElementById('prod-category').value = product.categoryId || (store.categories[0]?.id || 1);
      document.getElementById('prod-price').value = product.price;
      document.getElementById('prod-stock').value = product.stockQuantity;
      document.getElementById('prod-image').value = product.imageUrl || '';
      document.getElementById('prod-desc').value = product.description || '';
    } else {
      modalTitle.innerHTML = `<i class="fa-solid fa-box-archive"></i> Add New Product`;
      document.getElementById('prod-id').value = '';
    }

    app.openModal('product-modal');
  },

  // Save Product (Create/Update)
  async saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('prod-id').value;
    const name = document.getElementById('prod-name').value.trim();
    const categoryId = parseInt(document.getElementById('prod-category').value);
    const price = parseFloat(document.getElementById('prod-price').value);
    const stockQuantity = parseInt(document.getElementById('prod-stock').value);
    const imageUrl = document.getElementById('prod-image').value.trim();
    const description = document.getElementById('prod-desc').value.trim();

    const payload = { name, categoryId, price, stockQuantity, imageUrl, description };
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `${app.apiBase}/products/${id}` : `${app.apiBase}/products`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save product.');

      app.showToast(`Product '${name}' ${id ? 'updated' : 'added'} successfully!`, 'success');
      app.closeModal('product-modal');
      this.loadStats();
      this.loadAdminProducts();
      store.loadProducts(); // Sync store catalog

    } catch (err) {
      app.showToast(err.message, 'error');
    }
  },

  // Load Admin Products Table
  async loadAdminProducts() {
    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;

    try {
      const res = await fetch(`${app.apiBase}/products`);
      if (res.ok) {
        this.products = await res.json();

        tbody.innerHTML = this.products.map(p => {
          const categoryName = p.categoryName || (p.category ? p.category.name : 'General');
          const isLow = p.stockQuantity <= 10;
          const isOut = p.stockQuantity <= 0;

          let badge = '<span class="status-badge Delivered">Normal</span>';
          if (isOut) badge = '<span class="status-badge Cancelled">Out of Stock</span>';
          else if (isLow) badge = '<span class="status-badge Pending">Low Stock Warning</span>';

          return `
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
                  <strong>${p.name}</strong>
                </div>
              </td>
              <td>${categoryName}</td>
              <td><strong>₹${p.price.toFixed(2)}</strong></td>
              <td>
                <span style="font-weight: 700; ${isLow || isOut ? 'color: var(--danger);' : ''}">${p.stockQuantity} units</span>
              </td>
              <td>${badge}</td>
              <td>
                <button class="btn btn-secondary" onclick='admin.editProductById(${p.id})' style="padding: 0.4rem 0.75rem; font-size: 0.82rem;">
                  <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="admin.deleteProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}')" style="padding: 0.4rem 0.75rem; font-size: 0.82rem; margin-left: 0.25rem;">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    } catch (e) {
      console.warn('Could not load admin products:', e);
    }
  },

  editProductById(id) {
    const prod = this.products.find(p => p.id === id);
    if (prod) this.openProductModal(prod);
  },

  // Delete Product
  async deleteProduct(id, name) {
    if (!confirm(`Are you sure you want to delete '${name}'?`)) return;

    try {
      const res = await fetch(`${app.apiBase}/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed.');

      app.showToast(`Product '${name}' deleted!`, 'info');
      this.loadStats();
      this.loadAdminProducts();
      store.loadProducts();

    } catch (err) {
      app.showToast(err.message, 'error');
    }
  },

  // Load Admin Orders Table
  async loadAdminOrders() {
    const tbody = document.getElementById('admin-orders-tbody');
    if (!tbody) return;

    try {
      const res = await fetch(`${app.apiBase}/orders`);
      if (res.ok) {
        this.orders = await res.json();

        if (!this.orders.length) {
          tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No customer orders found.</td></tr>`;
          return;
        }

        tbody.innerHTML = this.orders.map(o => {
          const dateStr = new Date(o.orderDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          const customerName = o.customerName || (o.customer ? o.customer.fullName : 'Customer');

          return `
            <tr>
              <td><strong>#${o.id}</strong></td>
              <td>${customerName}</td>
              <td>${dateStr}</td>
              <td><strong>₹${parseFloat(o.totalAmount).toFixed(2)}</strong></td>
              <td><span class="status-badge ${o.status}">${o.status}</span></td>
              <td>
                <select class="form-input" style="padding: 0.3rem 0.6rem; font-size: 0.85rem; width: auto;" onchange="admin.updateOrderStatus(${o.id}, this.value)">
                  <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                  <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                  <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                  <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                  <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
              </td>
            </tr>
          `;
        }).join('');
      }
    } catch (e) {
      console.warn('Could not load admin orders:', e);
    }
  },

  // Update Order Status
  async updateOrderStatus(orderId, newStatus) {
    try {
      const res = await fetch(`${app.apiBase}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Status update failed.');

      app.showToast(`Order #${orderId} status updated to '${newStatus}'`, 'success');
      this.loadStats();
      this.loadAdminOrders();

    } catch (err) {
      app.showToast(err.message, 'error');
    }
  }
};
