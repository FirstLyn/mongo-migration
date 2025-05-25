// index.js
const { program } = require('commander');
const { runMigration } = require('./migration');
const { runUndo } = require('./undo');

program
  .name('mongo-migration')
  .description('MongoDB migration and undo tool')
  .version('1.0.0');

// 🔁 Migration command
program
  .command('migration')
  .description('Run a migration')
  .requiredOption('--collection <name>', 'MongoDB collection name')
  .requiredOption('--template <path>', 'Template file name without extension')
  .requiredOption('--data <path>', 'Data file name without extension')
  .requiredOption('--db <name>', 'Database name')
  .option('--dry', 'Dry run without applying changes')
  .action(async (opts) => {
    await runMigration(
      opts.collection,
      opts.template,
      opts.data,
      opts.db,
      opts.dry || false
    );
  });

// 🔄 Undo command
program
  .command('undo')
  .description('Undo a migration')
  .requiredOption('--tag <tag>', 'Migration tag (used to identify the log file)')
  .requiredOption('--collection <name>', 'MongoDB collection name')
  .requiredOption('--db <name>', 'Database name')
  .option('--id <_id>', 'Optional document _id to revert a specific item')
  .action(async (opts) => {
    await runUndo(opts.tag, opts.collection, opts.db, opts.id || null);
  });

// Allow running directly via CLI or importing as module
if (require.main === module) {
  program.parseAsync().catch((err) => {
    console.error('❌ Execution failed:', err);
    process.exit(1);
  });
}

// Export in case of programmatic use
module.exports = { runMigration, runUndo };
