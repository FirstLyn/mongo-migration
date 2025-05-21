const { MongoClient } = require("mongodb");
const config = require("./config");

async function connectToDB() {
  const client = new MongoClient(config.mongoUri);
  await client.connect();
  return { client, db: client.db(config.dbName) };
}

module.exports = { connectToDB };
