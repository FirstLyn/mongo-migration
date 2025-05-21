# MongoDB Migration System

A fully generic, template-based MongoDB migration and undo system.
Designed for clarity, automation, and reversibility.

---

## 📁 Folder Structure

```
mongo-migration/
├── data/            # Input data files (e.g., internal_users.json)
├── templates/       # Template files with placeholders and match logic
├── migrations/      # Auto-generated logs for each migration
├── settings/        # Configuration and DB connection
├── lib/             # Migration logic and utilities
├── index.js         # Main entry point (CLI & code-based usage)
├── migration.js     # Migration logic (called by index.js)
├── undo.js          # Undo logic (called by index.js)
├── .env             # Contains only MONGO_URI
└── README.md
```

---

## 🚀 How to Run a Migration

### 1. Prepare Template and Data Files

#### Example: `templates/users.json`
```json
{
  "_meta": {
    "matchFields": ["email"]
  },
  "email": "{{email}}",
  "name": "{{name}}",
  "role": "{{role}}",
  "createdAt": "{{createdAt}}",
  "tag": "{{tag}}"
}
```

#### Example: `data/internal_users.json`
```json
[
  { "email": "a@x.com", "name": "Alice", "role": "admin" },
  { "email": "b@x.com", "name": "Bob", "role": "user" }
]
```

### 2. Run the Migration
```bash
node index.js migration <collection> <templateFile> <dataFile> <dbName>
```

#### Example:
```bash
node index.js migration users users internal_users my_database
```

This will:
- Load template from `templates/users.json`
- Load data from `data/internal_users.json`
- Use `matchFields` to decide insert vs update
- Write log file to `migrations/migration_users_<timestamp>.json`

> 💡 You **do not** need to include `.json` in the file names.

---

## 🔁 Undo a Migration

```bash
node index.js undo <tag> <collection> [optional _id] <dbName>
```

#### Examples:
```bash
node index.js undo 2024_05_22T14_00_00Z users my_database
node index.js undo 2024_05_22T14_00_00Z users 665abc... my_database
```

This will:
- Read the log file `migration_<collection>_<tag>.json`
- Delete inserted docs
- Restore updated docs to their previous state

---

## 🔁 Placeholder Variables

| Placeholder       | Description                          |
|------------------|--------------------------------------|
| `{{email}}`, `{{name}}` | Comes from each entry in data file |
| `{{createdAt}}`   | Automatically filled with timestamp  |
| `{{tag}}`         | Unique migration tag ID              |

---

## 🧪 Programmatic Usage

You can also run migrations and undos from your code:

```js
const { runMigration, runUndo } = require("./index");

await runMigration("users", "users", "internal_users", "my_database");
await runUndo("2024_05_22T14_00_00Z", "users", null, "my_database");
```

---

## 🛠 Tips

- You can use any logical names for files as long as the `.json` files exist under `templates/` and `data/`
- You control the match logic via `_meta.matchFields`
- Migration logs are saved per collection + tag for easy traceability
- Extend `applyTemplate()` if you want advanced placeholder support (e.g., defaults, conditions)

---

Happy Migrating 🚀
