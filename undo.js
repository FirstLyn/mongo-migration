const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");
const config = require("./config/config");
const { connectToDB } = require("./config/db");
const logger = require("./lib/logger");

async function runUndo(tag, collection, dbName, filterId = null) {
  if (!tag || !collection) {
    throw new Error("Both tag and collection are required.");
  }

  const file = path.join(config.migrationDir, `migration_${collection}_${tag}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Migration file not found: ${file}`);
  }

  const { actions } = JSON.parse(fs.readFileSync(file));
  const filtered = filterId ? actions.filter(a => String(a._id) === filterId) : actions;

  const { client, db } = await connectToDB(dbName);

  for (const action of filtered) {
    try {
      if (action.status === "dryRun") {
        logger.info(`Skipping dryRun action _id=${action._id ?? "(no _id)"}`);
        continue;
      }

      if (action.action === "insert") {
        await db.collection(action.collection).deleteOne({ _id: new ObjectId(action._id) });
        logger.info(`Deleted inserted doc _id=${action._id}`);
      } else if (action.action === "update") {
        await db.collection(action.collection).replaceOne(
          { _id: new ObjectId(action._id) },
          action.previous
        );
        logger.info(`Reverted update _id=${action._id}`);
      }
    } catch (err) {
      logger.error(`Undo failed for _id=${action._id}: ${err}`);
    }
  }

  await client.close();
  logger.info("Undo complete.");
}

module.exports = { runUndo };
