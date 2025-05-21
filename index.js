// index.js
const { runMigration } = require("./migration");
const { runUndo } = require("./undo");

async function main() {
  const command = process.argv[2];

  if (!command) {
    console.error("Please provide a command: migration or undo");
    process.exit(1);
  }

  if (command === "migration") {
    const collection = process.argv[3];
    if (!collection) {
      console.error("Please provide a collection name: node index.js migration <collection>");
      process.exit(1);
    }
    await runMigration(collection);
  } else if (command === "undo") {
    const tag = process.argv[3];
    const collection = process.argv[4];
    const id = process.argv[5];
    if (!tag || !collection) {
      console.error("Usage: node index.js undo <tag> <collection> [optional _id]");
      process.exit(1);
    }
    await runUndo(tag, collection, id);
  } else {
    console.error("Unknown command: use 'migration' or 'undo'");
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error("Execution failed:", err);
    process.exit(1);
  });
}

module.exports = { runMigration, runUndo };
