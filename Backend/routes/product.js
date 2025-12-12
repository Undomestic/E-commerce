const express = require("express");
const pool = require("../db");
const router = express.Router();

// GET /api/products?category=shirt&search=black
router.get("/", async (req, res) => {
  const { category, search } = req.query;

  let sql = "SELECT * FROM products";
  const where = [];
  const params = [];

  if (category && category !== "all") {
    where.push("LOWER(category) LIKE ?");
    params.push(`%${category.toLowerCase()}%`);
  }

  if (search && search.trim()) {
    where.push("LOWER(name) LIKE ?");
    params.push(`%${search.toLowerCase()}%`);
  }

  if (where.length) {
    sql += " WHERE " + where.join(" AND ");
  }

  sql += " ORDER BY created_at DESC";

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (!rows.length) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
