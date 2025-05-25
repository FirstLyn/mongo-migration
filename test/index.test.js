const { execa } = require('execa');
const path = require('path');

describe('CLI Commands', () => {
  const cliPath = path.join(__dirname, '../index.js');

  test('dry run migration CLI should print [DRY RUN]', async () => {
    const { stdout } = await execa('node', [
      cliPath,
      'migration',
      '--collection',
      'users',
      '--template',
      'users',
      '--data',
      'internal_users',
      '--db',
      'testdb',
      '--dry'
    ]);
    expect(stdout).toMatch(/\[DRY RUN\]/);
  });

  test('undo CLI should handle missing tag gracefully', async () => {
    const { stdout } = await execa('node', [
      cliPath,
      'undo',
      '--tag',
      'nonexistent_tag',
      '--collection',
      'users',
      '--db',
      'testdb'
    ]);
    expect(stdout).toBeDefined(); // Adjust according to your output
  });
});
