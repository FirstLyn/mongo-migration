// lib/migrator.js
const config = require("../settings/config");
const logger = require("./logger");
const crypto = require("crypto");

function applyTemplate(template, data, tag) {
  const templateStr = JSON.stringify(template);

  const substituted = templateStr.replace(/{{(.*?)}}/g, (_, key) => {
    key = key.trim();

    if (key === "createdAt" || key === "currentTime") {
      return new Date().toISOString();
    }

    if (key === "tag") return tag;
    if (key === "uuid") return crypto.randomUUID();

    return data[key] ?? "";
  });

  return JSON.parse(substituted);
}

async function upsertDocument(db, collectionName, doc, matchFields, tag, logAction) {
  const filter = {};
  for (const field of matchFields) {
    filter[field] = doc[field];
  }

  const existing = await db.collection(collectionName).findOne(filter);

  if (config.dryRun) {
    logger.info(`[DRY RUN] Would ${existing ? "update" : "insert"} in '${collectionName}' for filter ${JSON.stringify(filter)}`);
    await logAction({
      collection: collectionName,
      action: existing ? "update" : "insert",
      status: "dryRun",
      filter,
      document: doc
    });
    return;
  }

  if (existing) {
    await db.collection(collectionName).updateOne({ _id: existing._id }, { $set: doc });
    logger.info(`Updated document in '${collectionName}' with _id=${existing._id}`);
    await logAction({
      collection: collectionName,
      action: "update",
      status: "success",
      _id: existing._id,
      previous: existing,
      update: doc
    });
  } else {
    const res = await db.collection(collectionName).insertOne(doc);
    logger.info(`Inserted document into '${collectionName}' with _id=${res.insertedId}`);
    await logAction({
      collection: collectionName,
      action: "insert",
      status: "success",
      _id: res.insertedId,
      document: doc
    });
  }
}

module.exports = {
  applyTemplate,
  upsertDocument
};
