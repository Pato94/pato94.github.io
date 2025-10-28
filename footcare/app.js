// Simple localStorage cart utilities
const STORAGE_KEY = 'footcare_cart_v1';
const USER_KEY = 'footcare_user_id_v1';
// Coupon should not be persisted; keep it in-memory for this session only
let currentCouponCode = '';

function getOrCreateUserId() {
  let id = localStorage.getItem(USER_KEY);
  if (!id) {
    // Generate a 26-char base36 ID with prefix
    id = 'usr_' + Math.random().toString(36).slice(2, 11) + Math.random().toString(36).slice(2, 11);
    localStorage.setItem(USER_KEY, id);
  }
  return id;
}

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch (e) {
    return { items: [] };
  }
}

function writeCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function getCartCount(cart) {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
  const cart = readCart();
  const el = document.querySelector('[data-cart-count]');
  if (el) el.textContent = getCartCount(cart);
}

function addToCart(product) {
  const cart = readCart();
  const existing = cart.items.find((i) => i.id === product.id);
  if (existing) {
    existing.quantity += product.quantity;
  } else {
    cart.items.push(product);
  }
  writeCart(cart);
  updateCartBadge();
}

function removeFromCart(id) {
  const cart = readCart();
  const next = { items: cart.items.filter((i) => i.id !== id) };
  writeCart(next);
  renderCart();
  updateCartBadge();
}

function updateQuantity(id, quantity) {
  const cart = readCart();
  const item = cart.items.find((i) => i.id === id);
  if (item) {
    item.quantity = Math.max(1, quantity | 0);
    writeCart(cart);
    renderCart();
    updateCartBadge();
  }
}

function clearCart() {
  writeCart({ items: [] });
  updateCartBadge();
}

// Helper to read coupon from input or in-memory value
function getCouponFromUI() {
  const el = document.querySelector('[data-coupon-input]');
  if (el && typeof el.value === 'string') return el.value.trim();
  return currentCouponCode;
}

function formatCurrency(n) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
}

// Render cart table when on the cart page
function renderCart() {
  const tableBody = document.querySelector('[data-cart-body]');
  const subtotalEl = document.querySelector('[data-cart-subtotal]');
  const discountEl = document.querySelector('[data-cart-discount]');
  const discountRow = document.querySelector('[data-discount-row]');
  const subtotalRow = document.querySelector('[data-subtotal-row]');
  const totalEl = document.querySelector('[data-cart-total]');
  if (!tableBody || !totalEl) return;

  const cart = readCart();
  tableBody.innerHTML = '';

  if (cart.items.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="cart-empty">Your cart is empty</td></tr>`;
    totalEl.textContent = formatCurrency(0);
    return;
  }

  let subtotal = 0;
  for (const item of cart.items) {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.name}</td>
      <td class="right">${formatCurrency(item.price)}</td>
      <td class="right">
        <input type="number" min="1" value="${item.quantity}" style="width:64px;" data-qty="${item.id}">
      </td>
      <td class="right">${formatCurrency(lineTotal)}</td>
      <td class="right"><button class="btn-secondary" data-remove="${item.id}">Remove</button></td>
    `;
    tableBody.appendChild(tr);
  }

  // Calculate discount if coupon present
  const hasCoupon = !!getCouponFromUI();
  const discount = hasCoupon ? subtotal * 0.10 : 0;
  const total = Math.max(0, subtotal - discount);

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (discountEl) discountEl.textContent = `-${formatCurrency(discount)}`;
  const showDiscount = discount > 0;
  if (discountRow) discountRow.style.display = showDiscount ? 'table-row' : 'none';
  if (subtotalRow) subtotalRow.style.display = showDiscount ? 'table-row' : 'none';
  totalEl.textContent = formatCurrency(total);

  // Bind qty inputs
  document.querySelectorAll('[data-qty]').forEach((input) => {
    input.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-qty');
      const qty = parseInt(e.target.value, 10) || 1;
      updateQuantity(id, qty);
    });
  });

  // Bind remove buttons
  document.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-remove');
      removeFromCart(id);
    });
  });
}

// Page bootstrapping
document.addEventListener('DOMContentLoaded', () => {
  // Identify user in Mixpanel (if available)
  try {
    const userId = getOrCreateUserId();
    if (window.mixpanel && typeof window.mixpanel.identify === 'function') {
      window.mixpanel.identify(userId);
      window.mixpanel.register && window.mixpanel.register({ user_id: userId });
    }
  } catch (_) {}

  updateCartBadge();

  // Home page: Add to cart
  const addBtn = document.querySelector('[data-add]');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const qty = parseInt(document.querySelector('[data-qty-input]').value, 10) || 1;
      addToCart({
        id: 'trial-kit',
        name: 'FootCare Trial Kit',
        price: 9.99,
        quantity: qty,
      });
      window.location.href = 'cart.html';
    });
  }

  // Cart page: render and handle checkout
  if (document.querySelector('[data-cart-page]')) {
    renderCart();
    const checkoutBtn = document.querySelector('[data-checkout]');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        // Simulate checkout: just go to thank you
        window.location.href = 'thank-you.html';
      });
    }

    // Coupon handling
    const couponInput = document.querySelector('[data-coupon-input]');
    const couponApply = document.querySelector('[data-apply-coupon]');
    const couponStatus = document.querySelector('[data-coupon-status]');
    if (couponApply) {
      couponApply.addEventListener('click', () => {
        const code = (couponInput?.value || '').trim();
        currentCouponCode = code;
        if (couponStatus) {
          couponStatus.textContent = code ? `Coupon "${code}" applied.` : 'Coupon cleared.';
        }
        // Re-render totals to apply discount
        renderCart();
      });
    }
  }

  // Thank you page: clear cart
  const thankYou = document.querySelector('[data-thank-you]');
  if (thankYou) {
    clearCart();
  }
});


