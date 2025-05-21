const fs = require("fs");
const path = require("path");

module.exports = async function (db) {
  const input = JSON.parse(fs.readFileSync(path.resolve(__dirname, "input/users.json"), "utf-8"));

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
