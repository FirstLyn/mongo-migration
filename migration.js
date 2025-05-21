const fs = require("fs");
const path = require("path");
const config = require("./config/config");
const { connectToDB } = require("./config/db");
const logger = require("./lib/logger");
const { applyTemplate, upsertDocument } = require("./lib/migrator");

const collection = process.argv[2];
if (!collection) {
  console.error("Usage: node migration.js <collection>");
  process.exit(1);
}

const TAG = new Date().toISOString().replace(/[:.]/g, "_");
const MIGRATION_FILE = path.join(config.migrationDir, `migration_${collection}_${TAG}.json`);
const migrationLog = { tag: TAG, collection, createdAt: new Date().toISOString(), actions: [] };

async function logAction(entry) {
  migrationLog.actions.push(entry);
  fs.writeFileSync(MIGRATION_FILE, JSON.stringify(migrationLog, null, 2));
}

async function runMigration() {
  const templatePath = path.join(config.templateDir, `${collection}.json`);
  const dataPath = path.join(config.dataDir, `${collection}.json`);

  const template = JSON.parse(fs.readFileSync(templatePath));
  const data = JSON.parse(fs.readFileSync(dataPath));
  const matchFields = template._meta.matchFields;
  delete template._meta;

  fs.mkdirSync(config.migrationDir, { recursive: true });

  const { client, db } = await connectToDB();

  for (const item of data) {
    const doc = applyTemplate(template, item, TAG);
    await upsertDocument(db, collection, doc, matchFields, TAG, logAction);
  }

  await client.close();
  logger.info("Migration complete.");
}

if (require.main === module) {
  runMigration().catch(err => {
    logger.error("Migration failed: " + err);
    process.exit(1);
  });
}
