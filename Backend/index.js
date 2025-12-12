require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const productRoutes = require("./routes/product");
const recommendationRoutes = require("./routes/recommendations");
const orderRoutes = require("./routes/orders");
const checkoutRoutes = require("./routes/checkout");
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const searchRoutes = require("./routes/search");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// STATIC IMAGES (Backend/public_images) - Must be before API routes
const publicImagesPath = path.join(__dirname, "public_images");
console.log("📁 Serving images from:", publicImagesPath);

// Add CORS headers middleware for static files
app.use("/images", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use("/images", express.static(publicImagesPath, {
    dotfiles: 'ignore',
    etag: true,
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders: (res, filePath) => {
        res.set('Cache-Control', 'public, max-age=86400');
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Expose-Headers', 'Content-Length');
    }
}));

// Debug route to test image serving
app.get("/images/test", (req, res) => {
  const testImagePath = path.join(publicImagesPath, "T-Shirts", "1.jpg");
  const exists = fs.existsSync(testImagePath);
  res.json({
    publicImagesPath,
    testImagePath,
    exists,
    message: exists ? "Image file exists" : "Image file NOT found"
  });
});

// ROUTES
app.use("/api/products", productRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/auth", authRoutes);

// BASIC HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 404 - Only catch API routes, NOT static files (images)
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ error: "Internal server error" });
});

// START SERVER
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log("🚀 Backend running on port", PORT);
  console.log("📸 Image serving enabled at: http://localhost:" + PORT + "/images/");
  console.log("🧪 Test image route: http://localhost:" + PORT + "/images/test");
});

// Unhandled Promise Rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught Exception
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Don't exit - try to keep server running
});
