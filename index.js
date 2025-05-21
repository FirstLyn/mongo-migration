// index.js
const { runMigration } = require("./migration");
const { runUndo } = require("./undo");

async function main() {
  const command = process.argv[2];

  if (!command) {
    console.error("❌ Please provide a command: migration or undo");
    process.exit(1);
  }

  if (command === "migration") {
    const collection = process.argv[3];
    const dbName = process.argv[4];

    if (!collection || !dbName) {
      console.error("❌ Usage: node index.js migration <collection> <dbName>");
      process.exit(1);
    }

    await runMigration(collection, dbName);

  } else if (command === "undo") {
    const tag = process.argv[3];
    const collection = process.argv[4];
    const filterId = process.argv[5];
    const dbName = process.argv[6];

    if (!tag || !collection || !dbName) {
      console.error("❌ Usage: node index.js undo <tag> <collection> [optional _id] <dbName>");
      process.exit(1);
    }

    await runUndo(tag, collection, filterId, dbName);

  } else {
    console.error("❌ Unknown command: use 'migration' or 'undo'");
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error("❌ Execution failed:", err);
    process.exit(1);
  });
}

module.exports = { runMigration, runUndo };
