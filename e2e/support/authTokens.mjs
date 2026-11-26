// Local fixture only: stores the hash of a known auth token, because the real one
// exists solely inside the e-mail (the database never keeps the link value).
import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const apiRoot = resolve(process.cwd(), '../clubinhonib-api');
const requireApi = createRequire(resolve(apiRoot, 'package.json'));
const { parse } = requireApi('dotenv');
const mysql = requireApi('mysql2/promise');
const env = parse(await readFile(resolve(apiRoot, 'env/local.env')));
if (!['localhost', '127.0.0.1', '::1'].includes(env.DB_HOST))
  throw new Error('Auth fixtures require a local database');

const input = JSON.parse(process.argv[2]);
const TABLES = {
  passwordReset: { table: 'password_reset_tokens', column: 'token' },
  emailVerification: { table: 'email_verification_tokens', column: 'tokenHash' },
};
const target = TABLES[input.kind];
if (!target || !/^[a-f0-9-]{36}$/.test(input.userId) || !/^[a-f0-9]{64}$/.test(input.token))
  throw new Error('Invalid auth fixture');

const connection = await mysql.createConnection({
  host: env.DB_HOST,
  port: Number(env.DB_PORT ?? 3306),
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});
try {
  // Só contas criadas por esta suíte podem receber um token conhecido.
  const [rows] = await connection.execute(
    "SELECT id FROM users WHERE id = ? AND email LIKE 'e2e.%@teste.clubinhonib.com'",
    [input.userId]
  );
  if (rows.length !== 1) throw new Error('Fixture ownership mismatch');

  await connection.execute(`DELETE FROM ${target.table} WHERE userId = ?`, [input.userId]);
  await connection.execute(
    `INSERT INTO ${target.table} (id, createdAt, updatedAt, ${target.column}, expiresAt, userId)
     VALUES (?, NOW(), NOW(), ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?)`,
    [
      randomUUID(),
      createHash('sha256').update(input.token).digest('hex'),
      input.expiresInMinutes,
      input.userId,
    ]
  );
} finally {
  await connection.end();
}
