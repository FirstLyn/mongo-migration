const fs = require("fs");
const path = require("path");
const config = require("./config/config");
const { connectToDB } = require("./config/db");
const logger = require("./lib/logger");
const { applyTemplate, upsertDocument } = require("./lib/migrator");

async function runMigration(collection,templateFileName, dataFileName, dbName) {
  const TAG = new Date().toISOString().replace(/[:.]/g, "_");
  const MIGRATION_FILE = path.join(config.migrationDir, `migration_${collection}_${TAG}.json`);
  const migrationLog = { tag: TAG, collection, createdAt: new Date().toISOString(), actions: [] };

  const logAction = (entry) => {
    migrationLog.actions.push(entry);
    fs.writeFileSync(MIGRATION_FILE, JSON.stringify(migrationLog, null, 2));
  };

  const templatePath = path.join(config.templateDir, `${templateFile}.json`);
  const dataPath = path.join(config.dataDir, `${dataFile}.json`);
  
  const template = JSON.parse(fs.readFileSync(templatePath));
  let data;
  const jsonPath = path.join(config.dataDir, `${dataFile}.json`);
  const jsPath = path.join(config.dataDir, `${dataFile}.js`);

  if (fs.existsSync(jsonPath)) {
    data = JSON.parse(fs.readFileSync(jsonPath));
  } else if (fs.existsSync(jsPath)) {
    const dynamicDataFn = require(jsPath);
   data = await dynamicDataFn(db); // call with db instance
  } else {
    throw new Error(`Data source "${dataFile}" not found as .json or .js`);
  }
  const matchFields = template._meta.matchFields;
  delete template._meta;

  fs.mkdirSync(config.migrationDir, { recursive: true });

  const { client, db } = await connectToDB(dbName);

  for (const item of data) {
    const doc = applyTemplate(template, item, TAG);
    await upsertDocument(db, collection, doc, matchFields, TAG, logAction);
  }

  await client.close();
  logger.info("Migration complete.");
}
