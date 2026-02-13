const { Telegraf } = require("telegraf");
require("dotenv").config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.APP_URL || process.env.FRONTEND_URL || "";

if (!token) {
  console.warn("⚠️ TELEGRAM_BOT_TOKEN is not set — bot will not start");
  module.exports = null;
  return;
}

const bot = new Telegraf(token);

bot.start(async (ctx) => {
  try {
    const payload = ctx.startPayload || "";
    const cardId = payload || "";
    const webAppUrl = appUrl
      ? `${appUrl.replace(/\/$/, "")}/?startapp=${cardId}`
      : "";

    if (webAppUrl) {
      await ctx.reply("Открыть валентинку:", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Открыть валентинку 💌",
                web_app: { url: webAppUrl },
              },
            ],
          ],
        },
      });
    } else {
      await ctx.reply("Валентинка готова. Откройте приложение вручную.");
    }
  } catch (err) {
    console.error("Error in /start handler", err);
  }
});

bot.on("web_app_data", (ctx) => {
  console.log("web_app_data received:", ctx.message.web_app_data.data);
});

bot
  .launch({ dropPendingUpdates: true })
  .then(() => {
    console.log("✅ Telegram bot started");
  })
  .catch((err) => {
    console.error("❌ Failed to start Telegram bot", err);
  });

// Graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

module.exports = bot;
