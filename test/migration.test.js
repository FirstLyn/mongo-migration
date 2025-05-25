const { runMigration } = require('../migration');

describe('Migration Logic', () => {
  test('should run migration in dry run mode without error', async () => {
    await expect(
      runMigration('users', 'users', 'internal_users', 'testdb', true)
    ).resolves.toBeUndefined();
  });

  test('should throw if template or data file is missing', async () => {
    await expect(
      runMigration('users', 'nonexistent', 'internal_users', 'testdb', true)
    ).rejects.toThrow();
  });
});
