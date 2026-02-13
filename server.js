const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const fs = require('fs');

// Ensure uploads directory exists (used by multer for temporary storage)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('🔧 Created uploads directory:', uploadsDir);
}

const sequelize = require("./src/config/database");
const apiRoutes = require("./src/routes/api");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "dist")));

// API routes
app.use("/api", apiRoutes);

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve React app for all other routes (except when it's a 404 from API)
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"), (err) => {
    if (err) {
      // Если нет dist, просто отправляем 404
      res.status(404).send("Not found");
    }
  });
});

// Initialize database and start server
const PORT = process.env.PORT || 3000;

// Логируем конфигурацию
console.log("\n📋 Configuration:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  PORT:", PORT);
console.log("  APP_URL:", process.env.APP_URL);
console.log(
  "  TELEGRAM_BOT_TOKEN:",
  process.env.TELEGRAM_BOT_TOKEN ? "✓ Set" : "❌ Missing",
);
console.log(
  "  CLOUDINARY_CLOUD_NAME:",
  process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "❌ Missing",
);
console.log(
  "  DATABASE_URL:",
  process.env.DATABASE_URL ? "✓ Set" : "Will be constructed from env vars",
);
console.log("");

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    console.log("✅ Database synced");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 App URL: ${process.env.APP_URL}`);
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
