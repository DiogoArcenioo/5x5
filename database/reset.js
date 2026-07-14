const { pool } = require('./connection');

async function main() {
  if (process.env.DB_RESET_CONFIRM !== 'RESET') {
    throw new Error('Set DB_RESET_CONFIRM=RESET to confirm the destructive database reset.');
  }

  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    await client.query('BEGIN');
    try {
      for (const { tablename } of result.rows) {
        const quotedTable = `"${tablename.replaceAll('"', '""')}"`;
        await client.query(`DROP TABLE ${quotedTable} CASCADE`);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    console.log(`Database reset complete: dropped ${result.rowCount} tables.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Database reset failed: ${error.message}`);
  process.exitCode = 1;
});
