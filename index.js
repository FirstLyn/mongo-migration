// index.js
const { program } = require('commander');
const { runMigration } = require('./migration');
const { runUndo } = require('./undo');

program
  .name('mongo-migration')
  .description('Run or undo MongoDB migrations')
  .version('1.0.0');

program
  .command('migration')
  .description('Run a migration')
  .requiredOption('--collection <name>', 'MongoDB collection name')
  .requiredOption('--template <path>', 'Template file path')
  .requiredOption('--data <path>', 'Data file path')
  .requiredOption('--db <name>', 'Database name')
  .action(async (opts) => {
    await runMigration(opts.collection, opts.template, opts.data, opts.db);
  });

program
  .command('undo')
  .description('Undo a migration')
  .requiredOption('--tag <tag>', 'Migration tag')
  .requiredOption('--collection <name>', 'MongoDB collection name')
  .requiredOption('--db <name>', 'Database name')
  .option('--id <_id>', 'Specific _id to undo')
  .action(async (opts) => {
    await runUndo(opts.tag, opts.collection, opts.db, opts.id);
  });

program.parseAsync().catch((err) => {
  console.error('Execution failed:', err);
  process.exit(1);
});
