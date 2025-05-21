// settings/config.js
require("dotenv").config();
const path = require("path");

const config = {
  mongoUri: process.env.MONGO_URI,
  dbName: process.env.MONGO_DB_NAME || "test_db",
  dryRun: process.env.DRY_RUN === "true",
  migrationDir: path.resolve(__dirname, "../migrations"),
  dataDir: path.resolve(__dirname, "../data"),
  templateDir: path.resolve(__dirname, "../templates"),
  logFile: path.resolve(__dirname, "../migration.log")
};

module.exports = config;
