// Local fixture preparation only: never invokes an AI provider or uploads assets.
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const apiRoot = resolve(process.cwd(), '../clubinhonib-api');
const requireApi = createRequire(resolve(apiRoot, 'package.json'));
const { parse } = requireApi('dotenv');
const mysql = requireApi('mysql2/promise');
const env = parse(await readFile(resolve(apiRoot, 'env/local.env')));
if (!['localhost', '127.0.0.1', '::1'].includes(env.DB_HOST))
  throw new Error('Studio fixtures require a local database');
const input = JSON.parse(process.argv[2]);
if (!/^[a-f0-9-]{36}$/.test(input.id) || !input.theme?.startsWith('studio-e2e-'))
  throw new Error('Invalid fixture identity');
const connection = await mysql.createConnection({
  host: env.DB_HOST,
  port: Number(env.DB_PORT ?? 3306),
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});
try {
  const [rows] = await connection.execute('SELECT id FROM lessons WHERE id = ? AND theme = ?', [
    input.id,
    input.theme,
  ]);
  if (rows.length !== 1) throw new Error('Fixture ownership mismatch');
  if (input.status) {
    if (!['DRAFT', 'PACKAGE_READY', 'IN_REVIEW'].includes(input.status))
      throw new Error('Invalid fixture status');
    await connection.execute('UPDATE lessons SET status = ? WHERE id = ?', [
      input.status,
      input.id,
    ]);
  }
  for (const stage of input.stages ?? []) {
    if (
      ![
        'LESSON',
        'LESSON_VISUALS',
        'STANDARD_GAME',
        'VERSE_VISUALS',
        'VERSE_FIXATION',
        'MEDITATION_YOUNGER',
        'MEDITATION_OLDER',
        'MANUAL_WORK',
      ].includes(stage)
    )
      throw new Error('Invalid fixture stage');
    await connection.execute(
      "UPDATE lesson_stages SET status = 'DRAFT' WHERE lesson_id = ? AND type = ?",
      [input.id, stage]
    );
  }
} finally {
  await connection.end();
}
