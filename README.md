# MongoDB Migration System

A fully generic, template-based MongoDB migration and undo system.
Designed for clarity, automation, and reversibility.

---

## 📁 Folder Structure

```
mongo-migration/
├── data/
│   ├── input/                   # Input filter files for dynamic JS data generators
│   │   └── users.json           # List of emails or IDs to filter
│   ├── internal_users.json      # Static JSON-based data
│   └── users_from_list.js       # JS function to dynamically generate data
├── templates/                   # Template files with placeholders and match logic
├── migrations/                  # Auto-generated logs for each migration
├── settings/                    # Configuration and DB connection
├── lib/                         # Migration logic and utilities
├── index.js                     # Main entry point (CLI & code-based usage)
├── migration.js                 # Migration logic (called by index.js)
├── undo.js                      # Undo logic (called by index.js)
├── .env                         # Contains only MONGO_URI
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

#### Option A: Static data in `data/internal_users.json`
```json
[
  { "email": "a@x.com", "name": "Alice", "role": "admin" },
  { "email": "b@x.com", "name": "Bob", "role": "user" }
]
```

#### Option B: Dynamic data from DB in `data/users_from_list.js`
```js
const fs = require("fs");
const path = require("path");

module.exports = async function (db) {
  const input = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "input/users.json"), "utf-8")
  );

  const users = await db
    .collection("users")
    .find({ email: { $in: input.emails } })
    .toArray();

  return users.map((user) => ({
    email: user.email,
    name: user.name,
    role: user.role
  }));
};
```

#### And the filter file: `data/input/users.json`
```json
{
  "emails": ["gil@example.com", "lior@example.com", "maya@example.com"]
}
```

---

### 2. Run the Migration
```bash
node index.js migration <collection> <templateFile> <dataFile> <dbName>
```

#### Example using static JSON:
```bash
node index.js migration users users internal_users my_database
```

#### Example using dynamic JS:
```bash
node index.js migration users users users_from_list my_database
```

> 💡 The `.json` or `.js` extension is added automatically. The system detects whether to load a static file or run a dynamic JS function.

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
| `{{uuid}}`        | Randomly generated UUID              |
| `{{currentTime}}` | ISO string of current time           |

---

## 🧪 Programmatic Usage

You can also run migrations and undos from your code:

```js
const { runMigration, runUndo } = require("./index");

await runMigration("users", "users", "users_from_list", "my_database");
await runUndo("2024_05_22T14_00_00Z", "users", null, "my_database");
```

---

## 🛠 Tips

- You can use `.js` instead of `.json` in `data/` to generate dynamic migration data
- You can load external filter criteria by reading input files inside your `.js` data script
- Migration logs are saved per collection + tag for easy traceability
- Extend `applyTemplate()` if you want advanced placeholder support (e.g., defaults, conditions)

---

Happy Migrating 🚀
