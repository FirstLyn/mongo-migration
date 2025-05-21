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
├── migration.js     # Entry point for running a migration
├── undo.js          # Script to revert a migration by tag
├── .env             # Environment variables
└── README.md
```

---

## 🚀 How to Run a Migration

### 1. Create Your Template and Data Files

#### Example: `templates/x.json`
```json
{
  "_meta": {
    "matchFields": ["name"]
  },
  "name": "{{name}}",
  "type": "{{type}}",
  "createdAt": "{{createdAt}}",
  "tag": "{{tag}}"
}
```

#### Example: `data/x.json`
```json
[
  { "name": "Item 1", "type": "A" },
  { "name": "Item 2", "type": "B" }
]
```

### 2. Run the Migration
```bash
node migration.js x
```

This will:
- Load the template and data for collection `x`
- Fill placeholders (`{{name}}`, `{{createdAt}}`, `{{tag}}`...)
- Use `matchFields` from `_meta` to determine if to insert or update
- Write a detailed migration log to `migrations/migration_x_<timestamp>.json`

### 3. Set Environment Settings
Create a `.env` file:
```
MONGO_URI=mongodb://localhost:27017
DRY_RUN=true
```
Set `DRY_RUN=false` to apply changes for real.

---

## 🔁 How to Undo a Migration

```bash
node undo.js <tag> <collection> [optional _id]
```

Example:
```bash
node undo.js 2024_05_21T12_00_00_000Z x
node undo.js 2024_05_21T12_00_00_000Z x 6651c...
```

This will:
- Read the matching `migration_<collection>_<tag>.json` log file
- Revert each `insert` by deleting the document
- Revert each `update` by restoring the original (`previous`) document

---

## 🧠 Supported Placeholders
| Placeholder   | Description                      |
|--------------|----------------------------------|
| `{{name}}`   | From data file                   |
| `{{type}}`   | From data file                   |
| `{{createdAt}}` | Filled with ISO timestamp      |
| `{{tag}}`    | Auto-filled with current tag     |

---

## 🛠 Tips

- You can add more collections by simply creating:
  - `templates/<collection>.json`
  - `data/<collection>.json`

- You can define any match logic by modifying `_meta.matchFields`

- Migration logs include:
  - success/failure status
  - full before/after content

- To support custom placeholder defaults or functions, extend `applyTemplate()` in `lib/migrator.js`

---

## 🧪 Example Use Case
You want to sync product items to your MongoDB. You create:
- `templates/products.json` — defines the shape of the document and what counts as duplicate (e.g. `sku`)
- `data/products.json` — contains partial raw data (e.g. only `sku`, `name`, `category`)

You run:
```bash
node migration.js products
```
And when needed:
```bash
node undo.js 2024_05_21T13_05_00_000Z products
```

And you’re safe ✅

---

Happy Migrating!
