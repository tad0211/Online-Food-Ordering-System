// Auth JS Operations

// Open Modal by ID
function openAuthModal(modalType) {
  // Ensure the elements exist on the current page. If not, redirect to index with query param.
  const modalOverlay = document.getElementById('auth-modal-overlay');
  if (!modalOverlay) {
    window.location.href = `/index.html?modal=${modalType}`;
    return;
  }

  const modalTitle = document.getElementById('auth-modal-title');
  const authFormContainer = document.getElementById('auth-form-container');

  modalOverlay.classList.add('active');

  if (modalType === 'login') {
    modalTitle.textContent = 'Welcome Back';
    authFormContainer.innerHTML = `
      <form id="login-form" onsubmit="handleLoginSubmit(event)">
        <div class="form-group">
          <label for="login-email">Email Address</label>
          <input type="email" id="login-email" class="form-input" required placeholder="user@test.com">
        </div>
        <div class="form-group">
          <label for="login-password">Password</label>
          <input type="password" id="login-password" class="form-input" required placeholder="••••••••">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
          <i class="fas fa-sign-in-alt"></i> Login
        </button>
      </form>
      <div class="auth-footer">
        Don't have an account? <a href="#" onclick="event.preventDefault(); openAuthModal('register')">Sign Up</a>
      </div>
    `;
  } else if (modalType === 'register') {
    modalTitle.textContent = 'Create Account';
    authFormContainer.innerHTML = `
      <form id="register-form" onsubmit="handleRegisterSubmit(event)">
        <div class="form-group">
          <label for="reg-name">Full Name</label>
          <input type="text" id="reg-name" class="form-input" required placeholder="John Doe">
        </div>
        <div class="form-group">
          <label for="reg-email">Email Address</label>
          <input type="email" id="reg-email" class="form-input" required placeholder="john@example.com">
        </div>
        <div class="form-group">
          <label for="reg-password">Password</label>
          <input type="password" id="reg-password" class="form-input" required placeholder="••••••••">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
          <i class="fas fa-user-plus"></i> Register
        </button>
      </form>
      <div class="auth-footer">
        Already have an account? <a href="#" onclick="event.preventDefault(); openAuthModal('login')">Login</a>
      </div>
    `;
  }
}

// Close Auth Modal
function closeAuthModal() {
  const modalOverlay = document.getElementById('auth-modal-overlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    // Clear URL parameters to prevent re-opening on reload
    const url = new URL(window.location);
    url.searchParams.delete('modal');
    window.history.pushState({}, '', url);
  }
}

// Login Handler
async function handleLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const btn = event.target.querySelector('button[type="submit"]');
  const origText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast(data.message || 'Login successful!', 'success');
      closeAuthModal();
      
      // Update UI and redirect based on role
      updateNavbarAuth();
      
      setTimeout(() => {
        if (data.user.role === 'admin') {
          window.location.href = '/admin/dashboard.html';
        } else {
          // If we are on home page, go to menu, else just refresh page
          if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            window.location.href = '/menu.html';
          } else {
            window.location.reload();
          }
        }
      }, 1000);
    } else {
      showToast(data.message || 'Invalid credentials', 'danger');
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Failed to connect to server', 'danger');
    btn.disabled = false;
    btn.innerHTML = origText;
  }
}

// Register Handler
async function handleRegisterSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  const btn = event.target.querySelector('button[type="submit"]');
  const origText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast('Registration successful! Welcome!', 'success');
      closeAuthModal();
      
      updateNavbarAuth();

      setTimeout(() => {
        window.location.href = '/menu.html';
      }, 1000);
    } else {
      showToast(data.message || 'Registration failed', 'danger');
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  } catch (error) {
    console.error('Registration error:', error);
    showToast('Failed to connect to server', 'danger');
    btn.disabled = false;
    btn.innerHTML = origText;
  }
}

// Trigger modals if URL contains parameters
document.addEventListener('DOMContentLoaded', () => {
  const modalParam = getUrlParam('modal');
  if (modalParam === 'login' || modalParam === 'register') {
    // Small delay to ensure everything is rendered
    setTimeout(() => {
      openAuthModal(modalParam);
    }, 200);
  }
});
