const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dvzwzytog",
  api_key: process.env.CLOUDINARY_API_KEY || "396524255276334",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "7XHmrXMN2ZfcIZcJW58o0wINd68",
});

module.exports = cloudinary;
