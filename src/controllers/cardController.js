const { Card, GameResult } = require("../models");
const cloudinary = require("../config/cloudinary");
const { Op } = require("sequelize");

// Создание валентинки
exports.createCard = async (req, res) => {
  try {
    const { recipient_name, sender_name, is_anonymous, message_text } =
      req.body;
    let media_url = null;
    let media_type = null;

    // Если есть файл, загружаем на Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "valentine-game",
      });
      media_url = result.secure_url;
      media_type = req.file.mimetype.split("/")[0];
    }

    const card = await Card.create({
      recipient_name,
      sender_name: is_anonymous ? null : sender_name,
      is_anonymous,
      message_text,
      media_url,
      media_type,
    });

    res.status(201).json({
      id: card.id,
      url: `${process.env.APP_URL}/card/${card.id}`,
      shareUrl: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?startapp=${card.id}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка создания валентинки" });
  }
};

// Получение валентинки
exports.getCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findByPk(id);

    if (!card) {
      return res.status(404).json({ error: "Валентинка не найдена" });
    }

    res.json({
      id: card.id,
      recipient_name: card.recipient_name,
      sender_name: card.sender_name || "Аноним",
      is_anonymous: card.is_anonymous,
      message_text: card.message_text,
      media_url: card.media_url,
      media_type: card.media_type,
      created_at: card.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения валентинки" });
  }
};

// Сохранение результата игры
exports.saveGameResult = async (req, res) => {
  try {
    const { card_id, score, telegramUserId, username } = req.body;
    const telegram_user_id =
      telegramUserId || req.tg_user?.id || Math.round(Math.random() * 1000000);
    const player_name = username || req.tg_user?.username || "Anonymous";

    // Проверяем, существует ли карточка
    const card = await Card.findByPk(card_id);
    if (!card) {
      return res.status(404).json({ error: "Карточка не найдена" });
    }

    const result = await GameResult.create({
      card_id,
      telegram_user_id,
      player_name,
      score,
    });

    res.status(201).json({
      id: result.id,
      score: result.score,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сохранения результата" });
  }
};

// Получение топ 10
exports.getTop = async (req, res) => {
  try {
    const top = await GameResult.findAll({
      attributes: ["player_name", "score", "telegram_user_id"],
      order: [["score", "DESC"]],
      limit: 100,
      raw: true,
    });

    // Оставляем лучший результат для каждого пользователя
    const seen = new Set();
    const topUnique = [];
    top.forEach((item) => {
      if (!seen.has(item.telegram_user_id)) {
        seen.add(item.telegram_user_id);
        topUnique.push(item);
        if (topUnique.length === 10) return;
      }
    });

    const topWithRank = topUnique.map((item, idx) => ({
      rank: idx + 1,
      ...item,
    }));

    res.json(topWithRank);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения рейтинга" });
  }
};

// Получение ранга игрока
exports.getPlayerRank = async (req, res) => {
  try {
    const telegram_user_id =
      req.tg_user?.id ||
      req.query.userId ||
      Math.round(Math.random() * 1000000);

    const playerBest = await GameResult.findOne({
      where: { telegram_user_id },
      order: [["score", "DESC"]],
    });

    if (!playerBest) {
      return res.json({ rank: null, score: null });
    }

    res.json({
      rank: null,
      score: playerBest.score,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения рейтинга" });
  }
};
