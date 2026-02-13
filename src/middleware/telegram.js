const validateTelegramData = (req, res, next) => {
  const initData = req.body.initData || req.query.initData;

  // Для разработки можно пропустить проверку
  if (!initData && process.env.NODE_ENV === "development") {
    req.tg_user = {
      id: req.body.telegramUserId || Date.now(),
      username: req.body.username || "anonymous",
      first_name: req.body.firstName || "User",
    };
    return next();
  }

  // В продакшене нужна проверка подписи
  if (!initData) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Для MVP пропускаем полную проверку подписи
    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get("user"));
    req.tg_user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid initData" });
  }
};

module.exports = validateTelegramData;
