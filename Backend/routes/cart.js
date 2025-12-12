const express = require("express");
const router = express.Router();

// Simple in-memory carts (per userId)
const carts = {};

// GET /api/cart?userId=123
router.get("/", (req, res) => {
  const userId = req.query.userId || "guest";
  const cart = carts[userId] || [];
  console.log('GET /api/cart - userId:', userId, ', items:', cart.length);
  res.json(cart);
});

// POST /api/cart
router.post("/", (req, res) => {
  console.log('POST /api/cart received:', req.body);
  const { userId = "guest", productId, title, price, qty = 1 } = req.body;

  if (!productId || !title || !price || qty <= 0) {
    console.error('Invalid data:', { productId, title, price, qty });
    return res.status(400).json({ error: "Invalid item data" });
  }

  if (!carts[userId]) carts[userId] = [];

  const existing = carts[userId].find(
    (item) => item.productId === Number(productId)
  );
  if (existing) {
    existing.qty += qty;
  } else {
    carts[userId].push({ productId: Number(productId), title, price, qty });
  }

  console.log('Cart updated:', carts[userId]);
  res.json({ message: "Item added to cart", cart: carts[userId] });
});

// PUT /api/cart/:productId
router.put("/:productId", (req, res) => {
  const { userId = "guest", qty } = req.body;
  const { productId } = req.params;

  if (!carts[userId]) {
    return res.status(404).json({ error: "Cart not found" });
  }

  const item = carts[userId].find(
    (i) => i.productId === Number(productId)
  );
  if (!item) return res.status(404).json({ error: "Item not in cart" });

  if (qty <= 0) {
    carts[userId] = carts[userId].filter(
      (i) => i.productId !== Number(productId)
    );
  } else {
    item.qty = qty;
  }

  res.json({ message: "Cart updated", cart: carts[userId] });
});

// DELETE /api/cart/:productId
router.delete("/:productId", (req, res) => {
  const { userId = "guest" } = req.query;
  const { productId } = req.params;

  if (!carts[userId]) {
    return res.status(404).json({ error: "Cart not found" });
  }

  carts[userId] = carts[userId].filter(
    (i) => i.productId !== Number(productId)
  );
  res.json({ message: "Item removed", cart: carts[userId] });
});

// POST /api/cart/clear
router.post("/clear", (req, res) => {
  const { userId = "guest" } = req.body;
  carts[userId] = [];
  res.json({ message: "Cart cleared" });
});

module.exports = router;
