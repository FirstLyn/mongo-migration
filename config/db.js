const { MongoClient } = require("mongodb");
const config = require("./config");

async function connectToDB(dbName) {
  const client = new MongoClient(config.mongoUri);
  await client.connect();
  return { client, db: client.db(dbName) };
}

module.exports = { connectToDB };
