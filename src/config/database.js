const { Sequelize } = require("sequelize");
require("dotenv").config();

// Получаем URL базы данных с разными fallback опциями
let databaseUrl =
  process.env.DATABASE_URL ||
  process.env.DATABASE_PUBLIC_URL;

// Если URL не найден, пытаемся собрать из отдельных переменных (для Railway)
if (!databaseUrl) {
  const host = process.env.RAILWAY_TCP_PROXY_DOMAIN || process.env.PGHOST || "localhost";
  const port = process.env.RAILWAY_TCP_PROXY_PORT || process.env.PGPORT || 5432;
  const user = process.env.PGUSER || "postgres";
  const password = process.env.POSTGRES_PASSWORD || "";
  const database = process.env.PGDATABASE || process.env.POSTGRES_DB || "railway";

  databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${database}`;
  console.log("🔧 DATABASE_URL constructed from environment variables:", databaseUrl.replace(password, "***"));
}

if (!databaseUrl) {
  throw new Error("DATABASE_URL или PostgreSQL переменные окружения не установлены!");
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  ssl: process.env.NODE_ENV === "production" ? true : false,
  dialectOptions: {
    ssl:
      process.env.NODE_ENV === "production"
        ? { require: true, rejectUnauthorized: false }
        : false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
