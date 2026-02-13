const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const cardController = require("../controllers/cardController");
const validateTelegramData = require("../middleware/telegram");

// Настройка multer для загрузки файлов
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../../uploads"));
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "video/mp4"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Неподдерживаемый формат файла"));
    }
  },
});

// POST /api/cards - создать валентинку
router.post("/cards", upload.single("media"), cardController.createCard);

// GET /api/cards/:id - получить валентинку
router.get("/cards/:id", cardController.getCard);

// POST /api/game-result - сохранить результат игры
router.post(
  "/game-result",
  validateTelegramData,
  cardController.saveGameResult,
);

// GET /api/top - получить топ 10
router.get("/top", cardController.getTop);

// GET /api/rank - получить ранг игрока
router.get("/rank", validateTelegramData, cardController.getPlayerRank);
router.get("/profile/:telegramId", cardController.getProfile);

module.exports = router;
