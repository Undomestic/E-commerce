const express = require("express");
const pool = require("../db");
const router = express.Router();

// GET /api/recommendations/:id - Get outfit suggestions based on product
router.get("/:id", async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (Number.isNaN(productId)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  try {
    // Get the selected product
    const [prodRows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      productId,
    ]);
    
    if (!prodRows || prodRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const product = prodRows[0];
    const category = (product.category || "").toLowerCase();

    // Define complementary categories
    const complementaryMap = {
      't-shirts': ['Pants', 'Accessories'],
      'pants': ['T-Shirts', 'Accessories'],
      'accessories': ['T-Shirts', 'Pants']
    };

    const complementary = complementaryMap[category] || ['T-Shirts', 'Pants', 'Accessories'];

    // Get recommendations from complementary categories
    const [recommendations] = await pool.query(
      `SELECT * FROM products 
       WHERE id != ? AND LOWER(category) IN (${complementary.map(() => '?').join(',')})
       ORDER BY RAND() LIMIT 6`,
      [productId, ...complementary]
    );

    // Format response with suggestion message
    const response = {
      product: product,
      suggestions: recommendations.map(rec => ({
        ...rec,
        outfit_tip: getOutfitTip(category, rec.category)
      }))
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Recommendation error" });
  }
});

// Helper function to generate anime-themed outfit tips
function getOutfitTip(fromCategory, toCategory) {
  const from = (fromCategory || '').toLowerCase();
  const to = (toCategory || '').toLowerCase();

  const tips = {
    't-shirts_pants': '⚔️ Complete your anime warrior outfit with these pants!',
    't-shirts_accessories': '✨ Add this accessory to power up your look!',
    'pants_t-shirts': '🔥 Match with a anime shirt for a legendary combo!',
    'pants_accessories': '⛓️ Accessorize your lower wear like a true anime hero!',
    'accessories_t-shirts': '👑 Style this accessory with an iconic anime shirt!',
    'accessories_pants': '🎌 Pair this accessory with anime-inspired pants!'
  };

  const key = `${from}_${to}`;
  return tips[key] || '🌟 Ultimate anime drip guaranteed!';
}

// GET /api/recommendations?category=shirt - Get outfit suggestions by category
router.get("/category/:cat", async (req, res) => {
  const category = (req.params.cat || "").toLowerCase();

  try {
    // Define what pairs well with each category
    const pairingRules = {
      't-shirts': { complementary: ['pants', 'accessories'], exclude: ['t-shirts'] },
      'pants': { complementary: ['t-shirts', 'accessories'], exclude: ['pants'] },
      'accessories': { complementary: ['t-shirts', 'pants'], exclude: ['accessories'] }
    };

    const rule = pairingRules[category] || { complementary: ['shirt', 'pants', 'accessories'], exclude: [] };
    
    const [recommendations] = await pool.query(
      `SELECT * FROM products 
       WHERE LOWER(category) IN (${rule.complementary.map(() => '?').join(',')})
       ORDER BY RAND() LIMIT 10`,
      rule.complementary
    );

    res.json({
      category: category,
      outfit_suggestion: getOutfitMessage(category),
      recommendations: recommendations
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Recommendation error" });
  }
});

function getOutfitMessage(category) {
  const messages = {
    't-shirts': '👕 Combine with anime pants and accessories to unleash your ultimate power!',
    'pants': '👖 Pair with an iconic anime shirt and accessories for a legendary look!',
    'accessories': '✨ Enhance your anime outfit with gear that matches your inner strength!'
  };
  return messages[category.toLowerCase()] || '🎌 Create your signature anime style!';
}

module.exports = router;
