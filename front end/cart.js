class ShoppingCart {
  constructor() {
    this.apiUrl = 'http://localhost:4000/api/cart';
    this.userId = localStorage.getItem('userId') || 'guest';
    console.log('Shopping cart initialized, userId:', this.userId);
  }

  async addToCart(productId, title, price, qty = 1) {
    try {
      console.log('Adding to cart:', { productId, title, price, qty });
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId, productId, title, price, qty })
      });
      const data = await response.json();
      console.log('Cart response:', data);
      if (response.ok) {
        alert(`${title} added to cart!`);
        this.updateCartCount();
        return data;
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      alert('Failed to add item to cart: ' + err.message);
    }
  }

  async getCart() {
    try {
      const response = await fetch(`${this.apiUrl}?userId=${this.userId}`);
      return await response.json();
    } catch (err) {
      console.error('Get cart error:', err);
      return [];
    }
  }

  async updateQuantity(productId, qty) {
    try {
      const response = await fetch(`${this.apiUrl}/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId, qty })
      });
      return await response.json();
    } catch (err) {
      console.error('Update error:', err);
    }
  }

  async removeFromCart(productId) {
    try {
      const response = await fetch(`${this.apiUrl}/${productId}?userId=${this.userId}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (err) {
      console.error('Remove error:', err);
    }
  }

  async updateCartCount() {
    const cart = await this.getCart();
    const cartBadge = document.querySelector('.cart-count');
    if (cartBadge) {
      cartBadge.textContent = cart.length;
    }
  }
}

const cart = new ShoppingCart();
cart.updateCartCount();

function addProductToCart(btn) {
  const card = btn.closest('.product-card');
  if (!card) {
    console.error('Product card not found');
    return;
  }
  
  const productId = parseInt(card.dataset.productId);
  const titleEl = card.querySelector('h2') || card.querySelector('h3');
  const title = titleEl ? titleEl.textContent : 'Unknown Product';
  const priceEl = card.querySelector('.price');
  const priceText = priceEl ? priceEl.textContent : '0';
  const price = parseInt(priceText.replace(/[₹$,]/g, '')) || 0;
  const qtyEl = card.querySelector('.qty-input');
  const qty = qtyEl ? parseInt(qtyEl.value) : 1;
  
  console.log('Adding to cart:', { productId, title, price, qty });
  cart.addToCart(productId, title, price, qty);
}