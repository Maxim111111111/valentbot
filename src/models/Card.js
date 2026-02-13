const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { randomUUID } = require("crypto");

const Card = sequelize.define(
  "Card",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => randomUUID(),
      primaryKey: true,
    },
    recipient_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    sender_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    message_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    media_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    media_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    card_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    theme: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    font_style: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    effects: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    game_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "cards",
  },
);

module.exports = Card;
