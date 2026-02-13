const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Player = sequelize.define(
  "Player",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    telegram_user_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    best_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    games_played: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    achievements: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "players",
  },
);

module.exports = Player;
