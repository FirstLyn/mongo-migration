# MongoDB Migration Tool

Usage:
- `node migration.js <collection>`
- `node undo.js <tag> <collection> [optional _id]`

Folder structure:
- `data/` - JSON input per collection
- `templates/` - JSON templates per collection
- `migrations/` - Generated logs with full history
- `lib/` - Generic migration logic
- `config/` - Config and DB connection
