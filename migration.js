// __tests__/runMigration.test.js
const fs = require("fs");
const path = require("path");

// Mock all the dependencies before importing the function
jest.mock("fs");
jest.mock("path");
jest.mock("../config/config", () => ({
  migrationDir: "/mock/migrations",
  templateDir: "/mock/templates", 
  dataDir: "/mock/data"
}));
jest.mock("../config/db", () => ({
  connectToDB: jest.fn()
}));
jest.mock("../lib/logger", () => ({
  info: jest.fn()
}));
jest.mock("../lib/migrator", () => ({
  applyTemplate: jest.fn(),
  upsertDocument: jest.fn()
}));

// Import after mocking
const { runMigration } = require("../path/to/your/file");
const { connectToDB } = require("../config/db");
const { applyTemplate, upsertDocument } = require("../lib/migrator");

describe("runMigration", () => {
  let mockClient, mockDb;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockClient = { close: jest.fn() };
    mockDb = {};
    connectToDB.mockResolvedValue({ client: mockClient, db: mockDb });
    
    fs.existsSync.mockImplementation((filePath) => {
      if (filePath.includes('.json')) return true;
      return false;
    });
    
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('template')) {
        return JSON.stringify({
          _meta: { matchFields: ['id'] },
          name: '{{name}}',
          value: '{{value}}'
        });
      }
      if (filePath.includes('data')) {
        return JSON.stringify([
          { name: 'test1', value: 'value1' },
          { name: 'test2', value: 'value2' }
        ]);
      }
      return '{}';
    });
    
    fs.writeFileSync.mockImplementation(() => {});
    fs.mkdirSync.mockImplementation(() => {});
    
    path.join.mockImplementation((...args) => args.join('/'));
    
    applyTemplate.mockImplementation((template, item, tag) => ({
      ...item,
      _migrationTag: tag
    }));
    
    upsertDocument.mockResolvedValue();
  });

  test("should run migration successfully with JSON data", async () => {
    await runMigration("testCollection", "testTemplate", "testData", "testDb");
    
    expect(connectToDB).toHaveBeenCalledWith("testDb");
    expect(fs.mkdirSync).toHaveBeenCalledWith("/mock/migrations", { recursive: true });
    expect(applyTemplate).toHaveBeenCalledTimes(2);
    expect(upsertDocument).toHaveBeenCalledTimes(2);
    expect(mockClient.close).toHaveBeenCalled();
  });

  test("should handle JS data files", async () => {
    // Mock JS file exists instead of JSON
    fs.existsSync.mockImplementation((filePath) => {
      if (filePath.includes('.js')) return true;
      if (filePath.includes('.json') && filePath.includes('data')) return false;
      return filePath.includes('.json');
    });

    const mockDynamicData = jest.fn().mockResolvedValue([
      { name: 'dynamic1', value: 'dynValue1' }
    ]);
    
    // Mock require for JS file
    const originalRequire = require;
    require = jest.fn().mockImplementation((modulePath) => {
      if (modulePath.includes('data')) {
        return mockDynamicData;
      }
      return originalRequire(modulePath);
    });

    await runMigration("testCollection", "testTemplate", "testData", "testDb");
    
    expect(mockDynamicData).toHaveBeenCalledWith(mockDb);
    expect(applyTemplate).toHaveBeenCalledTimes(1);
    
    // Restore require
    require = originalRequire;
  });

  test("should throw error when data file not found", async () => {
    fs.existsSync.mockReturnValue(false);
    
    await expect(runMigration("testCollection", "testTemplate", "testData", "testDb"))
      .rejects.toThrow('Data source "testData" not found as .json or .js');
  });

  test("should create migration log file", async () => {
    await runMigration("testCollection", "testTemplate", "testData", "testDb");
    
    // Check that writeFileSync was called (for migration log)
    expect(fs.writeFileSync).toHaveBeenCalled();
    
    // Get the first call to writeFileSync (the migration log)
    const writeCall = fs.writeFileSync.mock.calls.find(call => 
      call[0].includes('migration_testCollection_')
    );
    expect(writeCall).toBeTruthy();
    
    // Parse the logged data
    const loggedData = JSON.parse(writeCall[1]);
    expect(loggedData).toHaveProperty('tag');
    expect(loggedData).toHaveProperty('collection', 'testCollection');
    expect(loggedData).toHaveProperty('actions');
  });
});