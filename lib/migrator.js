const fs = require("fs");
const path = require("path");
const config = require("../config/config");
const logger = require("./logger");

function applyTemplate(template, data, tag) {
  const str = JSON.stringify(template);
  const rendered = str.replace(/{{(.*?)}}/g, (_, key) => {
    if (key === "createdAt") return new Date().toISOString();
    if (key === "tag") return tag;
    return data[key.trim()] || "";
  });
  return JSON.parse(rendered);
}

function buildFilter(doc, matchFields) {
  return matchFields.reduce((acc, field) => {
    acc[field] = doc[field];
    return acc;
  }, {});
}

async function upsertDocument(db, collection, doc, matchFields, tag, logAction) {
  const filter = buildFilter(doc, matchFields);
  const existing = await db.collection(collection).findOne(filter);

  if (existing) {
    await db.collection(collection).updateOne(filter, { $set: doc });
    logger.info(`Updated document in '${collection}'`);
    await logAction({ collection, action: "update", status: "success", _id: existing._id, previous: existing, update: doc });
  } else {
    const res = await db.collection(collection).insertOne(doc);
    logger.info(`Inserted document into '${collection}'`);
    await logAction({ collection, action: "insert", status: "success", _id: res.insertedId, document: doc });
  }
}

module.exports = { applyTemplate, upsertDocument };
