// Cart Management JS

// Get current cart from localStorage
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

// Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  syncCartBadge();
}

// Add Item to Cart
function addToCart(item, showNotification = true) {
  let cart = getCart();
  const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    // Save minimal item data to prevent localStorage bloating
    cart.push({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      image_url: item.image_url,
      quantity: 1
    });
  }

  saveCart(cart);

  if (showNotification) {
    showToast(`Added ${item.name} to cart`, 'success');
  }

  // If there are quantity controls on the current page menu grid, refresh them
  updateMenuQtyControls();
}

// Decrement Item in Cart
function decrementCart(itemId, showNotification = true) {
  let cart = getCart();
  const existingItemIndex = cart.findIndex(cartItem => cartItem.id === itemId);

  if (existingItemIndex > -1) {
    const itemName = cart[existingItemIndex].name;
    cart[existingItemIndex].quantity -= 1;
    
    if (cart[existingItemIndex].quantity <= 0) {
      cart.splice(existingItemIndex, 1);
      if (showNotification) showToast(`Removed ${itemName} from cart`, 'warning');
    }

    saveCart(cart);
  }

  updateMenuQtyControls();
  
  // If we are on the cart page, re-render
  if (window.location.pathname.endsWith('cart.html')) {
    renderCartPage();
  }
}

// Completely remove item from cart
function removeFromCart(itemId) {
  let cart = getCart();
  const existingItemIndex = cart.findIndex(cartItem => cartItem.id === itemId);

  if (existingItemIndex > -1) {
    const itemName = cart[existingItemIndex].name;
    cart.splice(existingItemIndex, 1);
    saveCart(cart);
    showToast(`Removed ${itemName} from cart`, 'danger');
  }

  updateMenuQtyControls();

  // If we are on the cart page, re-render
  if (window.location.pathname.endsWith('cart.html')) {
    renderCartPage();
  }
}

// Clear the entire cart
function clearCart() {
  localStorage.removeItem('cart');
  syncCartBadge();
  updateMenuQtyControls();
}

// Update quantity controls on menu list if elements exist
function updateMenuQtyControls() {
  const cart = getCart();
  
  // Look for elements with data-food-id attributes
  const foodCards = document.querySelectorAll('.food-card');
  foodCards.forEach(card => {
    const foodIdAttr = card.getAttribute('data-food-id');
    if (!foodIdAttr) return;
    const foodId = parseInt(foodIdAttr, 10);

    const cartItem = cart.find(item => item.id === foodId);
    const qtyControl = card.querySelector('.qty-control-wrapper');
    const addBtn = card.querySelector('.add-to-cart-btn');

    if (cartItem) {
      if (addBtn) addBtn.style.display = 'none';
      if (qtyControl) {
        qtyControl.style.display = 'flex';
        const qtyVal = qtyControl.querySelector('.qty-val');
        if (qtyVal) qtyVal.textContent = cartItem.quantity;
      }
    } else {
      if (addBtn) addBtn.style.display = 'inline-flex';
      if (qtyControl) qtyControl.style.display = 'none';
    }
  });
}

// Calculate Cart Totals
function calculateCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // GST Tax is 5%
  const gst = parseFloat((subtotal * 0.05).toFixed(2));
  
  // Delivery Fee: free above ₹500, else ₹40
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;
  
  const grandTotal = parseFloat((subtotal + gst + deliveryFee).toFixed(2));

  return { subtotal, gst, deliveryFee, grandTotal };
}

// Render Cart Page Elements
function renderCartPage() {
  const itemsContainer = document.getElementById('cart-items-list');
  const summaryContainer = document.getElementById('cart-summary-card');
  if (!itemsContainer || !summaryContainer) return;

  const cart = getCart();

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="glass-card cart-empty-state">
        <i class="fas fa-shopping-basket"></i>
        <h3>Your Cart is Empty</h3>
        <p style="color: var(--text-secondary); margin: 10px 0 25px;">Looks like you haven't added anything to your cart yet.</p>
        <a href="/menu.html" class="btn btn-primary"><i class="fas fa-utensils"></i> Browse Food Menu</a>
      </div>
    `;
    summaryContainer.style.display = 'none';
    return;
  }

  summaryContainer.style.display = 'block';

  // Render items
  let itemsHTML = '';
  cart.forEach(item => {
    itemsHTML += `
      <div class="glass-card cart-item animate-fade-in">
        <img src="${item.image_url || 'https://via.placeholder.com/150'}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatCurrency(item.price)}</div>
        </div>
        <div class="qty-control">
          <button class="qty-btn" onclick="decrementCart(${item.id})">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="addToCart({ id: ${item.id}, name: '${item.name.replace(/'/g, "\\'")}', price: ${item.price}, image_url: '${item.image_url}' })">+</button>
        </div>
        <div style="font-weight: 700; width: 80px; text-align: right; color: var(--text-primary);">
          ${formatCurrency(item.price * item.quantity)}
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remove item">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
  });
  itemsContainer.innerHTML = itemsHTML;

  // Render Summary
  const { subtotal, gst, deliveryFee, grandTotal } = calculateCartTotals();

  summaryContainer.innerHTML = `
    <div class="glass-card cart-summary">
      <h3 class="summary-title">Order Summary</h3>
      <div class="summary-row">
        <span>Items Subtotal</span>
        <span>${formatCurrency(subtotal)}</span>
      </div>
      <div class="summary-row">
        <span>GST (5%)</span>
        <span>${formatCurrency(gst)}</span>
      </div>
      <div class="summary-row">
        <span>Delivery Partner Fee</span>
        <span>${deliveryFee === 0 ? '<strong style="color: var(--success);">FREE</strong>' : formatCurrency(deliveryFee)}</span>
      </div>
      ${deliveryFee > 0 ? `<div style="font-size: 0.75rem; text-align: right; color: var(--text-secondary); margin-top: -10px; margin-bottom: 15px;">Add ${formatCurrency(500 - subtotal)} more for free delivery</div>` : ''}
      <div class="summary-row total">
        <span>Grand Total</span>
        <span>${formatCurrency(grandTotal)}</span>
      </div>
      <button class="btn btn-primary hover-scale" style="width: 100%; margin-top: 20px;" onclick="goToCheckout()">
        Proceed to Checkout <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  `;
}

// Redirect to Checkout page
function goToCheckout() {
  const token = localStorage.getItem('token');
  if (!token) {
    showToast('Please login to check out and place your order', 'warning');
    openAuthModal('login');
    return;
  }
  window.location.href = '/checkout.html';
}

// Render Checkout Page Elements
function renderCheckoutPage() {
  const checkoutSummary = document.getElementById('checkout-summary-card');
  if (!checkoutSummary) return;

  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = '/cart.html';
    return;
  }

  const { subtotal, gst, deliveryFee, grandTotal } = calculateCartTotals();

  let itemsListHTML = '';
  cart.forEach(item => {
    itemsListHTML += `
      <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 8px;">
        <span>${item.name} (x${item.quantity})</span>
        <span>${formatCurrency(item.price * item.quantity)}</span>
      </div>
    `;
  });

  checkoutSummary.innerHTML = `
    <div class="glass-card cart-summary" style="padding: 25px;">
      <h3 class="summary-title" style="font-size: 1.25rem;">Your Order</h3>
      <div style="margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
        ${itemsListHTML}
      </div>
      <div class="summary-row">
        <span>Items Subtotal</span>
        <span>${formatCurrency(subtotal)}</span>
      </div>
      <div class="summary-row">
        <span>GST (5%)</span>
        <span>${formatCurrency(gst)}</span>
      </div>
      <div class="summary-row">
        <span>Delivery Fee</span>
        <span>${deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}</span>
      </div>
      <div class="summary-row total" style="font-size: 1.1rem; padding-top: 10px; margin-bottom: 0;">
        <span>Total Amount</span>
        <span>${formatCurrency(grandTotal)}</span>
      </div>
    </div>
  `;
}

// Handle checkout address submission
async function handleCheckoutSubmit(event) {
  event.preventDefault();
  
  const token = localStorage.getItem('token');
  if (!token) {
    showToast('Please login to place your order', 'danger');
    openAuthModal('login');
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty', 'danger');
    return;
  }

  const address = document.getElementById('delivery-address').value;
  const landmark = document.getElementById('delivery-landmark').value;
  const fullAddress = address + (landmark ? `, Landmark: ${landmark}` : '');

  const btn = event.target.querySelector('button[type="submit"]');
  const origText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';

  // Construct items matching backend requirements (food_item_id, quantity)
  const items = cart.map(item => ({
    food_item_id: item.id,
    quantity: item.quantity
  }));

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        delivery_address: fullAddress,
        items
      })
    });

    const data = await res.json();

    if (data.success) {
      showToast('Order placed successfully!', 'success');
      clearCart();
      
      // Redirect to orders tracking page for this specific order
      setTimeout(() => {
        window.location.href = `/orders.html?id=${data.orderId}`;
      }, 1500);
    } else {
      showToast(data.message || 'Failed to place order', 'danger');
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showToast('Server connection failed', 'danger');
    btn.disabled = false;
    btn.innerHTML = origText;
  }
}
