const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Card = require("./Card");

const GameResult = sequelize.define(
  "GameResult",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    card_id: {
      type: DataTypes.UUID,
      references: {
        model: Card,
        key: "id",
      },
      allowNull: false,
    },
    telegram_user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    player_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "game_results",
  },
);

module.exports = GameResult;
