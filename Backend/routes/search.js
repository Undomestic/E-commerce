const express = require("express");
const pool = require("../db");
const router = express.Router();

// GET /api/search?q=keyword
router.get("/", async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.status(400).json({ error: "Search query required" });
  }
  try {
    const [results] = await pool.query(
      "SELECT * FROM products WHERE title LIKE ? OR description LIKE ?",
      [`%${q}%`, `%${q}%`]
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;
