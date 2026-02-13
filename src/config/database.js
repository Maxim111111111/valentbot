const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
  {
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
  },
);

module.exports = sequelize;
