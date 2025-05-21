# MongoDB Migration System

A fully generic, template-based MongoDB migration and undo system.
Designed for clarity, automation, and reversibility.

---

## 📁 Folder Structure

```
mongo-migration/
├── data/            # Input data per collection (e.g., x.json)
├── templates/       # Templates with placeholders and match logic (e.g., x.json)
├── migrations/      # Auto-generated logs for each migration
├── settings/        # Configuration and DB connection
├── lib/             # Migration logic and utilities
├── index.js         # Main entry point (CLI & code-based usage)
├── migration.js     # Migration logic (called by index.js)
├── undo.js          # Undo logic (called by index.js)
├── .env             # Mongo URI only (dbName is CLI param)
└── README.md
```

---

## 🚀 How to Run a Migration

### 1. Create Your Template and Data Files

#### Example: `templates/products.json`
```json
{
  "_meta": {
    "matchFields": ["sku"]
  },
  "sku": "{{sku}}",
  "name": "{{name}}",
  "category": "{{category}}",
  "createdAt": "{{createdAt}}",
  "tag": "{{tag}}"
}
```

#### Example: `data/products.json`
```json
[
  { "sku": "123", "name": "Item 1", "category": "books" },
  { "sku": "124", "name": "Item 2", "category": "games" }
]
```

### 2. Run the Migration
```bash
node index.js migration products my_database_name
```

This will:
- Load the template and data for collection `products`
- Fill placeholders (e.g., `{{sku}}`, `{{createdAt}}`, `{{tag}}`)
- Use `matchFields` from `_meta` to decide insert vs update
- Save a log to `migrations/migration_products_<timestamp>.json`

> 💡 `dbName` must be passed explicitly as the last argument.

---

## 🔁 Undo a Migration

```bash
node index.js undo <tag> <collection> [optional _id] <dbName>
```

Examples:
```bash
node index.js undo 2024_05_22T14_00_00Z products my_database_name
node index.js undo 2024_05_22T14_00_00Z products 665abc... my_database_name
```

This will:
- Read the relevant `migration_<collection>_<tag>.json` file
- Revert `insert` actions by deleting the document
- Revert `update` actions by restoring the `previous` version

---

## 🔁 Placeholder Variables

| Placeholder       | Description                          |
|------------------|--------------------------------------|
| `{{sku}}`, `{{name}}` | Comes from each entry in data file |
| `{{createdAt}}`   | Automatically filled with timestamp  |
| `{{tag}}`         | Unique migration tag ID              |

---

## 🧪 Programmatic Usage

You can also run everything from code:

```js
const { runMigration, runUndo } = require("./index");

await runMigration("products", "my_database_name");
await runUndo("2024_05_22T14_00_00Z", "products", null, "my_database_name");
```

---

## 🛠 Tips & Extensibility

- Add more collections by creating:
  - `templates/<collection>.json`
  - `data/<collection>.json`

- Customize `matchFields` in each template's `_meta` section

- All logs are saved in JSON format and include:
  - success/failure
  - insert/update type
  - document before/after (for update)

- Extend `applyTemplate()` in `lib/migrator.js` to add more placeholder logic

---

Happy Migrating! 🚀
