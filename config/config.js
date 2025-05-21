// settings/config.js
require("dotenv").config();
const path = require("path");

const config = {
  mongoUri: process.env.MONGO_URI,
  dryRun: process.env.DRY_RUN === "true",
  migrationDir: path.resolve(__dirname, "../migrations"),
  dataDir: path.resolve(__dirname, "../data"),
  templateDir: path.resolve(__dirname, "../templates"),
  logFile: path.resolve(__dirname, "../migration.log")
};

module.exports = config;
