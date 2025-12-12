const express = require("express");
const pool = require("../db");
const router = express.Router();

// POST /api/orders
router.post("/", async (req, res) => {
  const { 
    customer_name, 
    customer_email, 
    items, 
    amount,
    method,
    card,
    stripe_session_id 
  } = req.body;

  // Validate basic info
  const name = customer_name || (card?.name) || 'Guest';
  const email = customer_email || (card?.email) || 'guest@example.com';

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Customer name is required" });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Customer email is required" });
  }
  if (!items || !items.length) {
    return res.status(400).json({ error: "Cart is empty" });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }
  if (!method || !['qr', 'card'].includes(method)) {
    return res.status(400).json({ error: "Invalid payment method" });
  }

  // Validate items
  for (const item of items) {
    if (!item.productId || item.qty <= 0 || !item.price || item.price < 0) {
      return res.status(400).json({ error: "Invalid item in cart" });
    }
  }

  // Validate card details if card payment
  if (method === 'card') {
    if (!card || !card.number || !card.expiry || !card.cvv) {
      return res.status(400).json({ error: "Invalid card details" });
    }
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Create order record
    const [orderResult] = await conn.query(
      `INSERT INTO orders (
        customer_name, 
        customer_email, 
        total, 
        status, 
        payment_method,
        stripe_session_id
      ) VALUES (?,?,?,?,?,?)`,
      [
        name.trim(),
        email.trim(),
        amount,
        'completed',
        method,
        stripe_session_id || null
      ]
    );

    const orderId = orderResult.insertId;
    console.log('Order created:', orderId, 'Amount:', amount, 'Method:', method);

    // Add order items
    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items (
          order_id, 
          product_id, 
          qty, 
          price
        ) VALUES (?,?,?,?)`,
        [orderId, item.productId, item.qty, item.price]
      );
    }

    // Log payment details
    if (method === 'card') {
      const cardLast4 = card.number.slice(-4);
      console.log(`Card payment: ${cardLast4}, Amount: ₹${amount}`);
    } else if (method === 'qr') {
      console.log(`QR/UPI payment received: ₹${amount}`);
    }

    await conn.commit();
    
    res.json({ 
      orderId,
      status: 'completed',
      amount,
      method,
      message: `Payment successful! Order #${orderId}`
    });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Order error:', err);
    res.status(500).json({ error: "Order creation failed: " + err.message });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/orders/:id - Get order details
router.get("/:id", async (req, res) => {
  const orderId = parseInt(req.params.id);
  
  try {
    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE id = ?",
      [orderId]
    );
    
    if (!orders.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    const [items] = await pool.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [orderId]
    );

    res.json({
      order: orders[0],
      items
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

module.exports = router;

module.exports = router;
