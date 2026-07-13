const { pool } = require('./connection');

async function main() {
  const connection = await pool.query(`
    SELECT current_database() AS database_name,
           current_user AS database_user,
           version() AS postgres_version
  `);

  const tables = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  const migration = await pool.query(`
    SELECT version, applied_at
    FROM schema_migrations
    ORDER BY applied_at DESC
    LIMIT 1
  `);

  const readTest = await pool.query('SELECT count(*)::integer AS player_count FROM players');

  console.log(JSON.stringify({
    connected: true,
    database: connection.rows[0].database_name,
    user: connection.rows[0].database_user,
    postgresVersion: connection.rows[0].postgres_version,
    tableCount: tables.rowCount,
    tables: tables.rows.map((row) => row.table_name),
    latestMigration: migration.rows[0] ?? null,
    playerTableReadable: true,
    playerCount: readTest.rows[0].player_count,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(`Verification failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
