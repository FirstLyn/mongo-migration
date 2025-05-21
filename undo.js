const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");
const config = require("./config/config");
const { connectToDB } = require("./config/db");
const logger = require("./lib/logger");

async function runUndo(tag, collection, filterId = null) {
  const file = path.join(config.migrationDir, `migration_${collection}_${tag}.json`);
  if (!fs.existsSync(file)) {
    console.error("Migration file not found.");
    process.exit(1);
  }

  const { actions } = JSON.parse(fs.readFileSync(file));
  const filtered = filterId ? actions.filter(a => String(a._id) === filterId) : actions;
  const { client, db } = await connectToDB();

  for (const action of filtered) {
    try {
      if (action.action === "insert") {
        await db.collection(action.collection).deleteOne({ _id: new ObjectId(action._id) });
        logger.info(`Deleted inserted doc _id=${action._id}`);
      } else if (action.action === "update") {
        await db.collection(action.collection).replaceOne({ _id: new ObjectId(action._id) }, action.previous);
        logger.info(`Reverted update _id=${action._id}`);
      }
    } catch (err) {
      logger.error(`Undo failed for _id=${action._id}: ${err}`);
    }
  }

  await client.close();
  logger.info("Undo complete.");
}

const [tag, collection, id] = process.argv.slice(2);
if (!tag || !collection) {
  console.error("Usage: node undo.js <tag> <collection> [optional _id]");
  process.exit(1);
}
runUndo(tag, collection, id);
