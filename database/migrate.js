const fs = require('node:fs/promises');
const path = require('node:path');
const { pool } = require('./connection');

async function main() {
  const migrationsDirectory = path.resolve(__dirname, 'migrations');
  const files = (await fs.readdir(migrationsDirectory))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version varchar(255) PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    for (const file of files) {
      const alreadyApplied = await client.query(
        'SELECT 1 FROM schema_migrations WHERE version = $1',
        [file],
      );

      if (alreadyApplied.rowCount > 0) {
        console.log(`Skipped ${file} (already applied)`);
        continue;
      }

      const sql = await fs.readFile(path.join(migrationsDirectory, file), 'utf8');
      await client.query('BEGIN');

      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
        console.log(`Applied ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
});
