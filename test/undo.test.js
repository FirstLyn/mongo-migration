const { runUndo } = require('../undo');

describe('Undo Logic', () => {
  test('should run undo without error (fake tag)', async () => {
    await expect(
      runUndo('fake_tag', 'users', 'testdb', null)
    ).resolves.toBeUndefined();
  });

  test('should handle undo with specific _id (nonexistent)', async () => {
    await expect(
      runUndo('fake_tag', 'users', 'testdb', '000000000000000000000000')
    ).resolves.toBeUndefined();
  });
});
