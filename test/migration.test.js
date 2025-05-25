const fs = require("fs");
const path = require("path");
const { runMigration } = require("../runMigration");

jest.mock("fs");
jest.mock("path");
jest.mock("../config/config", () => ({
  migrationDir: "/migrations",
  dataDir: "/data",
  templateDir: "/templates",
}));
jest.mock("../config/db");
jest.mock("../lib/logger");
jest.mock("../lib/migrator");

const { connectToDB } = require("../config/db");
const logger = require("../lib/logger");
const { applyTemplate, upsertDocument } = require("../lib/migrator");

describe("runMigration", () => {
  const mockDb = {};
  const mockClient = { close: jest.fn() };

  const mockTemplate = {
    _meta: { matchFields: ["id"] },
    field: "{{value}}"
  };
  const mockData = [{ value: "A" }, { value: "B" }];
  const mockTag = "mock_tag";
  const collection = "myCollection";
  const dbName = "testDB";

  const templatePath = "/templates/template.json";
  const jsonDataPath = "/data/data.json";
  const jsDataPath = "/data/data.js";
  const migrationFilePath = "/migrations/migration_myCollection_mock_tag.json";

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    path.join.mockImplementation((...args) => args.join("/"));

    fs.existsSync.mockImplementation((filePath) => filePath === jsonDataPath);

    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath === templatePath) return JSON.stringify(mockTemplate);
      if (filePath === jsonDataPath) return JSON.stringify(mockData);
      return null;
    });

    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});

    Date.prototype.toISOString = jest.fn(() => "2025-01-01T00:00:00.000Z");
    applyTemplate.mockImplementation((template, data, tag) => ({
      ...template,
      substituted: data.value,
    }));
    upsertDocument.mockImplementation(async (db, coll, doc, fields, tag, logFn) => {
      logFn({ doc });
    });

    connectToDB.mockResolvedValue({ db: mockDb, client: mockClient });
  });

  it("runs migration with .json data source", async () => {
    await runMigration(collection, "template", "data", dbName);

    expect(fs.readFileSync).toHaveBeenCalledWith(templatePath);
    expect(fs.readFileSync).toHaveBeenCalledWith(jsonDataPath);
    expect(fs.mkdirSync).toHaveBeenCalledWith("/migrations", { recursive: true });

    expect(applyTemplate).toHaveBeenCalledTimes(2);
    expect(upsertDocument).toHaveBeenCalledTimes(2);
    expect(mockClient.close).toHaveBeenCalled();

    expect(logger.info).toHaveBeenCalledWith("Migration complete.");
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("migration_myCollection"),
      expect.stringContaining("mock_tag")
    );
  });

  it("runs migration with .js data source", async () => {
    fs.existsSync.mockImplementation((filePath) => filePath === jsDataPath);

    const dynamicFn = jest.fn().mockResolvedValue(mockData);
    jest.mock("/data/data.js", () => dynamicFn, { virtual: true });
    require.cache[require.resolve("/data/data.js")] = { exports: dynamicFn };

    await runMigration(collection, "template", "data", dbName);

    expect(dynamicFn).toHaveBeenCalledWith(mockDb);
    expect(applyTemplate).toHaveBeenCalledTimes(2);
    expect(upsertDocument).toHaveBeenCalledTimes(2);
  });

  it("throws if data source is missing", async () => {
    fs.existsSync.mockReturnValue(false);
    await expect(runMigration(collection, "template", "missing", dbName)).rejects.toThrow(
      'Data source "missing" not found as .json or .js'
    );
  });
});
