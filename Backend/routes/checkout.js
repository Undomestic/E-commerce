const express = require("express");
const Stripe = require("stripe");
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

router.post("/", async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  for (const item of items) {
    if (!item.title || !item.price || item.qty <= 0 || item.price < 0) {
      return res.status(400).json({ error: "Invalid item in cart" });
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: { name: item.title },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      })),
      success_url:
        process.env.SUCCESS_URL || "http://localhost:5500/success.html",
      cancel_url:
        process.env.CANCEL_URL || "http://localhost:5500/checkout.html",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe session error" });
  }
});

module.exports = router;
