const { randomBytes, scrypt: nodeScrypt } = require('node:crypto');
const { pool } = require('./connection');

function scrypt(password, salt) {
  return new Promise((resolve, reject) => {
    nodeScrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt);
  return `scrypt$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`;
}

async function main() {
  const username = (process.env.ADMIN_SEED_USERNAME || 'admin').trim();
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error('ADMIN_SEED_PASSWORD must contain at least 8 characters.');
  }

  const passwordHash = await hashPassword(password);
  await pool.query(
    `INSERT INTO app_users (
       username, username_normalized, password_hash, role, status
     ) VALUES ($1, $2, $3, 'admin', 'active')
     ON CONFLICT (username_normalized) DO UPDATE SET
       username = EXCLUDED.username,
       password_hash = EXCLUDED.password_hash,
       role = 'admin', status = 'active', updated_at = now()`,
    [username, username.toLowerCase(), passwordHash],
  );

  const result = await pool.query(
    `SELECT count(*)::integer AS user_count,
            count(*) FILTER (WHERE role = 'admin')::integer AS admin_count
     FROM app_users`,
  );
  console.log(JSON.stringify({ seeded: true, username, ...result.rows[0] }));
}

main()
  .catch((error) => {
    console.error(`Admin seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
