# 🧠 MongoDB Migration System

A fully generic, template-based MongoDB migration system with support for dry runs, undo functionality, structured logs, and dynamic input.

Designed for clarity, reversibility, and automation in real-world environments where you need full control over your data changes.

---

## 📦 Features

- ✅ Template-based data updates
- 🌀 Support for dynamic JS-based data generation
- 🧪 Dry run mode to preview changes before applying
- 🔁 Undo support with precise rollback using log files
- 🧰 Structured CLI with named flags (built using `commander`)
- 🧾 Migration tagging and versioning
- 🔒 No actual writes during dry run

---

## 📁 Folder Structure

```
mongo-migration/
├── data/                      # Input data files (static .json or dynamic .js)
│   ├── input/                 # Filter files used by JS generators
│   ├── internal_users.json    # Static input example
│   └── users_from_list.js     # Dynamic input generator example
├── templates/                 # Migration templates with placeholders
├── migrations/                # Auto-generated migration logs (for undo)
├── settings/                  # DB config and environment
├── lib/                       # Core migration and utility logic
├── index.js                   # Main CLI entry (commander-based)
├── migration.js               # Core logic for applying migrations
├── undo.js                    # Core logic for reverting migrations
├── .env                       # Contains MONGO_URI
└── README.md
```

---

## 🚀 CLI Usage

### Run Migration

```bash
node index.js migration \
  --collection users \
  --template users \
  --data internal_users \
  --db my_database
```

### Run Migration (Dry Run)

```bash
node index.js migration \
  --collection users \
  --template users \
  --data internal_users \
  --db my_database \
  --dry
```

### Undo Migration

```bash
node index.js undo \
  --tag 2024_05_22T14_00_00Z \
  --collection users \
  --db my_database
```

> Optional: Add `--id <_id>` to undo only one document

---

## 🔧 Template Format

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

- `matchFields` control whether to insert or update existing docs
- Supports placeholders from data + system (e.g., `{{uuid}}`, `{{tag}}`)

---

## 📥 Data Options

### Static JSON: `data/internal_users.json`

```json
[
  { "email": "a@x.com", "name": "Alice", "role": "admin" }
]
```

### Dynamic JS: `data/users_from_list.js`

```js
module.exports = async function (db) {
  return await db.collection("users").find({ role: "user" }).toArray();
};
```

---

## 🧩 Placeholders Supported

| Placeholder        | Description                          |
|--------------------|--------------------------------------|
| `{{email}}`, etc.  | Fields from the data source          |
| `{{createdAt}}`    | Timestamp when migration runs        |
| `{{tag}}`          | Unique identifier per migration run  |
| `{{uuid}}`         | Random UUID                          |
| `{{currentTime}}`  | ISO-formatted timestamp              |

---

## 🔁 Undo System

Each migration generates a log file under `migrations/` with:
- inserted documents
- before/after snapshots for updated documents

You can undo an entire tag or a single `_id`.

---

## 🧪 Programmatic Usage

```js
const { runMigration, runUndo } = require("./index");

await runMigration("users", "users", "internal_users", "my_database");
await runUndo("2024_05_22T14_00_00Z", "users", "my_database");
```

---

## 🔐 Environment Configuration

Set your Mongo URI in a `.env` file:

```
MONGO_URI=mongodb://localhost:27017
```

---

## 🛠 Tips

- Use `--dry` to preview all changes safely
- Keep `matchFields` minimal and indexed for better performance
- Use dynamic `.js` files to generate data based on filters, time, or queries
- Extend `applyTemplate()` to support conditions or defaults

---

## 📣 Contributing

Feel free to open PRs, issues, or suggestions. This tool was built to solve real-world, team-scale MongoDB data migration needs.

---

Happy safe migrating! 🚀
