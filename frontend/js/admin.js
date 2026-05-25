// Admin Operations JS

// Check Auth & Role before doing anything
function checkAdminAuth() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    showToast('Admin login required', 'danger');
    window.location.href = '/index.html?modal=login';
    return null;
  }

  const user = JSON.parse(userStr);
  if (user.role !== 'admin') {
    showToast('Access denied: Administrators only', 'danger');
    window.location.href = '/menu.html';
    return null;
  }

  return token;
}

document.addEventListener('DOMContentLoaded', () => {
  const token = checkAdminAuth();
  if (!token) return;

  // Determine current admin view
  const pathname = window.location.pathname;
  if (pathname.includes('dashboard.html')) {
    initDashboard(token);
  } else if (pathname.includes('manage-menu.html')) {
    initManageMenu(token);
  } else if (pathname.includes('manage-orders.html')) {
    initManageOrders(token);
  }
});

// 1. Dashboard Functions
async function initDashboard(token) {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.success) {
      const stats = data.stats;

      // Update counters
      document.getElementById('stat-total-orders').textContent = stats.totalOrders || 0;
      document.getElementById('stat-total-revenue').textContent = formatCurrency(stats.totalRevenue || 0);
      document.getElementById('stat-active-users').textContent = stats.activeUsers || 0;

      // Update popular items list
      const popularList = document.getElementById('dashboard-popular-list');
      if (popularList) {
        if (stats.popularItems && stats.popularItems.length > 0) {
          popularList.innerHTML = stats.popularItems.map(item => `
            <div class="popular-item animate-fade-in">
              <span class="popular-item-name">${item.name}</span>
              <span class="popular-item-qty">${item.total_quantity} sold</span>
            </div>
          `).join('');
        } else {
          popularList.innerHTML = '<p style="color: var(--text-secondary);">No sales recorded yet.</p>';
        }
      }

      // Render Sales Chart
      renderSalesChart(stats.salesHistory);
    } else {
      showToast(data.message || 'Failed to fetch dashboard stats', 'danger');
    }
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    showToast('Server connection failed', 'danger');
  }
}

function renderSalesChart(salesHistory) {
  const ctx = document.getElementById('salesChart');
  if (!ctx) return;

  // If no sales history, add mock labels/data for design preview
  let labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let revenues = [0, 0, 0, 0, 0, 0, 0];

  if (salesHistory && salesHistory.length > 0) {
    labels = salesHistory.map(item => item.date);
    revenues = salesHistory.map(item => parseFloat(item.revenue));
  }

  // Ensure Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js is not loaded');
    return;
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Revenue (₹)',
        data: revenues,
        borderColor: '#FF6B2B',
        backgroundColor: 'rgba(255, 107, 43, 0.15)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#FF6B2B',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: 'var(--text-secondary)' }
        },
        y: {
          grid: { color: 'var(--border-color)' },
          ticks: { color: 'var(--text-secondary)' },
          beginAtZero: true
        }
      }
    }
  });
}

// 2. Menu Management Functions
let categoriesList = [];
async function initManageMenu(token) {
  await loadCategoriesSelect(token);
  await loadFoodItemsTable(token);

  // Setup form submit handlers
  const itemForm = document.getElementById('food-item-form');
  if (itemForm) {
    itemForm.addEventListener('submit', (e) => handleFoodItemSubmit(e, token));
  }

  const catForm = document.getElementById('category-form');
  if (catForm) {
    catForm.addEventListener('submit', (e) => handleCategorySubmit(e, token));
  }
}

async function loadCategoriesSelect(token) {
  try {
    const res = await fetch(`${API_BASE}/food/categories`);
    const data = await res.json();
    if (data.success) {
      categoriesList = data.categories;
      
      const select = document.getElementById('item-category-id');
      const catList = document.getElementById('admin-categories-list');
      
      if (select) {
        select.innerHTML = '<option value="">Select Category</option>' + 
          categoriesList.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      }

      if (catList) {
        catList.innerHTML = categoriesList.map(c => `
          <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 15px;">
              <img src="${c.image_url || 'https://via.placeholder.com/50'}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
              <strong>${c.name}</strong>
            </div>
            <button class="table-action-btn action-delete" onclick="deleteCategory(${c.id})" title="Delete Category">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `).join('');
      }
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

async function loadFoodItemsTable(token) {
  const tableBody = document.getElementById('food-items-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading dishes...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/food/items`);
    const data = await res.json();

    if (data.success) {
      if (data.items.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No food items in the database. Add one above!</td></tr>';
        return;
      }

      tableBody.innerHTML = data.items.map(item => `
        <tr class="animate-fade-in">
          <td><img src="${item.image_url || 'https://via.placeholder.com/50'}" alt="${item.name}"></td>
          <td style="font-weight: 600;">${item.name}</td>
          <td>${item.category_name || 'N/A'}</td>
          <td style="font-weight: 700; color: var(--accent);">${formatCurrency(item.price)}</td>
          <td>
            <span class="order-status-badge ${item.is_available ? 'status-delivered' : 'status-cancelled'}" style="font-size: 0.75rem;">
              ${item.is_available ? 'In Stock' : 'Out of Stock'}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="table-action-btn action-edit" onclick="openEditFoodItemModal(${JSON.stringify(item).replace(/"/g, '&quot;')})" title="Edit Item">
                <i class="fas fa-edit"></i>
              </button>
              <button class="table-action-btn action-delete" onclick="deleteFoodItem(${item.id})" title="Delete Item">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading food items:', error);
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--danger);">Failed to load food menu.</td></tr>';
  }
}

// Add/Edit Food Item Form Submit
async function handleFoodItemSubmit(event, token) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);

  const itemId = document.getElementById('item-id').value;
  const isEdit = itemId !== '';
  
  const url = isEdit ? `${API_BASE}/admin/items/${itemId}` : `${API_BASE}/admin/items`;
  const method = isEdit ? 'PUT' : 'POST';

  const btn = form.querySelector('button[type="submit"]');
  const origText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData // Send as multipart form data for uploads
    });

    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Food item saved successfully!', 'success');
      form.reset();
      document.getElementById('item-id').value = '';
      document.getElementById('form-mode-title').textContent = 'Add New Dish';
      btn.innerHTML = '<i class="fas fa-plus"></i> Add Item';
      
      // Close modal if editing
      if (isEdit) closeItemModal();

      await loadFoodItemsTable(token);
    } else {
      showToast(data.message || 'Error saving food item', 'danger');
    }
  } catch (error) {
    console.error('Error submitting food item:', error);
    showToast('Server connection failed', 'danger');
  } finally {
    btn.disabled = false;
  }
}

// Add Category Submit
async function handleCategorySubmit(event, token) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      showToast('Category created successfully!', 'success');
      form.reset();
      await loadCategoriesSelect(token);
    } else {
      showToast(data.message || 'Error creating category', 'danger');
    }
  } catch (error) {
    console.error('Error submitting category:', error);
    showToast('Server connection failed', 'danger');
  } finally {
    btn.disabled = false;
  }
}

// Edit Item modal triggers
function openEditFoodItemModal(item) {
  document.getElementById('item-id').value = item.id;
  document.getElementById('item-name').value = item.name;
  document.getElementById('item-description').value = item.description || '';
  document.getElementById('item-price').value = item.price;
  document.getElementById('item-category-id').value = item.category_id;
  
  // Set Availability toggle
  const availSelect = document.getElementById('item-available');
  if (availSelect) {
    availSelect.value = item.is_available ? 'true' : 'false';
  }

  document.getElementById('form-mode-title').textContent = 'Edit Dish Details';
  
  const submitBtn = document.getElementById('food-item-submit-btn');
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
  }

  // Scroll to edit form
  document.getElementById('food-item-form-card').scrollIntoView({ behavior: 'smooth' });
}

// Cancel edit and reset form
function resetItemForm() {
  document.getElementById('item-id').value = '';
  document.getElementById('food-item-form').reset();
  document.getElementById('form-mode-title').textContent = 'Add New Dish';
  const submitBtn = document.getElementById('food-item-submit-btn');
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Item';
  }
}

// Delete item
async function deleteFoodItem(id) {
  if (!confirm('Are you sure you want to delete this food item?')) return;

  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_BASE}/admin/items/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    if (data.success) {
      showToast('Food item deleted successfully', 'success');
      await loadFoodItemsTable(token);
    } else {
      showToast(data.message || 'Failed to delete item', 'danger');
    }
  } catch (error) {
    console.error('Delete food item error:', error);
    showToast('Failed to connect to server', 'danger');
  }
}

// Delete category
async function deleteCategory(id) {
  if (!confirm('Warning: Deleting this category will set the category of existing items in this group to NULL. Proceed?')) return;

  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    if (data.success) {
      showToast('Category deleted successfully', 'success');
      await loadCategoriesSelect(token);
      await loadFoodItemsTable(token); // Update table category names
    } else {
      showToast(data.message || 'Failed to delete category', 'danger');
    }
  } catch (error) {
    console.error('Delete category error:', error);
    showToast('Failed to connect to server', 'danger');
  }
}

// 3. Orders Management Functions
async function initManageOrders(token) {
  await loadAdminOrdersTable(token);
  
  // Set up auto-refresh every 30 seconds
  setInterval(() => {
    loadAdminOrdersTable(token);
  }, 30000);
}

async function loadAdminOrdersTable(token) {
  const tableBody = document.getElementById('admin-orders-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Fetching orders...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/admin/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.success) {
      if (data.orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No orders recorded in the system.</td></tr>';
        return;
      }

      tableBody.innerHTML = data.orders.map(order => {
        const dateFormatted = new Date(order.created_at).toLocaleString();
        
        // Summarize items
        const itemSummary = order.items.map(i => `${i.food_name} (x${i.quantity})`).join(', ');

        return `
          <tr class="animate-fade-in">
            <td>#ORD-${order.id}</td>
            <td>
              <strong>${order.user_name}</strong><br>
              <span style="font-size: 0.8rem; color: var(--text-secondary);">${order.user_email}</span>
            </td>
            <td style="max-width: 250px;">
              <div style="font-size: 0.9rem; font-weight: 500;">${itemSummary}</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 5px;">
                <i class="fas fa-map-marker-alt"></i> ${order.delivery_address}
              </div>
            </td>
            <td style="font-weight: 700; color: var(--accent);">${formatCurrency(order.total_amount)}</td>
            <td>${dateFormatted}</td>
            <td>
              <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                <option value="Placed" ${order.status === 'Placed' ? 'selected' : ''}>Placed</option>
                <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      showToast(data.message || 'Error loading orders', 'danger');
    }
  } catch (error) {
    console.error('Error loading admin orders:', error);
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--danger);">Failed to load orders. Check database connection.</td></tr>';
  }
}

// Update order status call
async function updateOrderStatus(orderId, newStatus) {
  const token = localStorage.getItem('token');
  
  try {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
    } else {
      showToast(data.message || 'Failed to update order status', 'danger');
    }
  } catch (error) {
    console.error('Update status error:', error);
    showToast('Failed to connect to server', 'danger');
  }
}
