import fs from 'node:fs';
import { resolve } from 'node:path';

/** Um pedido registrado pelo provedor simulado da API (`AI_PROVIDER_MODE=fake`). */
export interface AiFakeJournalEntry {
  at: string;
  feature: string;
  provider: string;
  path: string;
  scenario: string | null;
  body: unknown;
}

const JOURNAL = resolve(process.cwd(), '../clubinhonib-api/.tmp/ai-fake-journal.jsonl');

/** Os pedidos enviados à IA que carregam o texto informado. */
export function aiFakeRequestsContaining(text: string): AiFakeJournalEntry[] {
  if (!fs.existsSync(JOURNAL)) return [];
  return fs
    .readFileSync(JOURNAL, 'utf8')
    .split('\n')
    .filter((line) => line.includes(text))
    .map((line) => JSON.parse(line) as AiFakeJournalEntry);
}
