// Global API Base URL
const API_BASE = '/api';

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  syncCartBadge();
  updateNavbarAuth();
  initFloatingCart();
});

// Toast Notification System
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} toast-enter`;
  
  let iconClass = 'fa-check-circle';
  if (type === 'danger') iconClass = 'fa-times-circle';
  if (type === 'warning') iconClass = 'fa-exclamation-triangle';
  
  toast.innerHTML = `<i class="fas ${iconClass}"></i><span>${message}</span>`;
  container.appendChild(toast);

  // Auto remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.replace('toast-enter', 'toast-exit');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3000);
}

// Light / Dark Theme toggle logic
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(toggleBtn, currentTheme);

  toggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(toggleBtn, newTheme);
    showToast(`Switched to ${newTheme} mode`, 'success');
  });
}

function updateThemeIcon(btn, theme) {
  if (theme === 'dark') {
    btn.innerHTML = '<i class="fas fa-sun"></i>';
    btn.setAttribute('title', 'Switch to Light Mode');
  } else {
    btn.innerHTML = '<i class="fas fa-moon"></i>';
    btn.setAttribute('title', 'Switch to Dark Mode');
  }
}

// Cart Badge Update
function syncCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const badgeNav = document.getElementById('cart-badge-nav');
  const badgeFloat = document.getElementById('cart-badge-float');

  if (badgeNav) {
    badgeNav.textContent = itemCount;
    badgeNav.style.display = itemCount > 0 ? 'flex' : 'none';
  }
  if (badgeFloat) {
    badgeFloat.textContent = itemCount;
    badgeFloat.style.display = itemCount > 0 ? 'flex' : 'none';
  }

  const floatingCartDiv = document.getElementById('floating-cart-container');
  if (floatingCartDiv) {
    floatingCartDiv.style.display = itemCount > 0 ? 'flex' : 'none';
  }
}

// Floating Cart Setup
function initFloatingCart() {
  const cartFloat = document.getElementById('floating-cart-container');
  if (!cartFloat) return;

  cartFloat.addEventListener('click', () => {
    window.location.href = '/cart.html';
  });
}

// Update UI based on User Login Status
function updateNavbarAuth() {
  const userStr = localStorage.getItem('user');
  const navActions = document.getElementById('nav-auth-actions');
  const navLinks = document.getElementById('nav-links-container');
  if (!navActions) return;

  if (userStr) {
    const user = JSON.parse(userStr);
    
    // Add My Orders to Nav Links if not present
    if (navLinks && !document.getElementById('nav-orders-link')) {
      const ordersLi = document.createElement('li');
      ordersLi.id = 'nav-orders-link';
      ordersLi.innerHTML = '<a href="/orders.html">My Orders</a>';
      
      // If admin, add dashboard link too
      if (user.role === 'admin') {
        const adminLi = document.createElement('li');
        adminLi.id = 'nav-admin-link';
        adminLi.innerHTML = '<a href="/admin/dashboard.html">Admin Panel</a>';
        navLinks.appendChild(adminLi);
      }
      navLinks.appendChild(ordersLi);
    }

    // Replace login button with user profile and logout
    navActions.innerHTML = `
      <div class="user-profile-menu" style="display: flex; align-items: center; gap: 15px;">
        <span class="user-greeting" style="font-weight: 500;">Hello, <strong>${user.name}</strong></span>
        <button id="logout-btn" class="btn btn-secondary btn-sm" onclick="logoutUser()">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    `;
  } else {
    // Guest view
    navActions.innerHTML = `
      <a href="/index.html?modal=login" class="btn btn-secondary btn-sm"><i class="fas fa-sign-in-alt"></i> Login</a>
      <a href="/index.html?modal=register" class="btn btn-primary btn-sm"><i class="fas fa-user-plus"></i> Sign Up</a>
    `;

    // Remove My Orders / Admin Panel if present
    const ordersLink = document.getElementById('nav-orders-link');
    if (ordersLink) ordersLink.remove();
    const adminLink = document.getElementById('nav-admin-link');
    if (adminLink) adminLink.remove();
  }
}

// Logout Utility
function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showToast('Logged out successfully', 'success');
  setTimeout(() => {
    window.location.href = '/index.html';
  }, 1000);
}

// Format Currency
function formatCurrency(amount) {
  return '₹' + parseFloat(amount).toFixed(2);
}

// Parse URL Parameters
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Loading Spinner Helpers
function showSkeletonLoader(containerId, count = 4) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let skeletonHTML = '';
  for (let i = 0; i < count; i++) {
    skeletonHTML += `
      <div class="glass-card food-card skeleton-card" style="position: relative;">
        <div class="skeleton skeleton-img"></div>
        <div class="food-card-content" style="padding: 20px;">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
          <div class="food-card-footer" style="margin-top: 20px; display: flex; justify-content: space-between;">
            <div class="skeleton skeleton-text" style="width: 60px; height: 30px;"></div>
            <div class="skeleton skeleton-btn"></div>
          </div>
        </div>
      </div>
    `;
  }
  container.innerHTML = skeletonHTML;
}
