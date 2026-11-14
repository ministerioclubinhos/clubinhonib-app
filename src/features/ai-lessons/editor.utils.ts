import type { Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';
import type { EditorTextMatch } from './editor.types';
import { LESSON_EDITOR_LINK_PROTOCOLS } from './editor.constants';

export function findEditorTextMatches(
  doc: Node,
  query: string,
  caseSensitive = false
): EditorTextMatch[] {
  if (!query) return [];
  const matches: EditorTextMatch[] = [];
  const needle = caseSensitive ? query : query.toLowerCase();
  doc.descendants((node, position) => {
    if (!node.isTextblock) return;
    const text = node.textBetween(0, node.content.size, '', '\uFFFC');
    const haystack = caseSensitive ? text : text.toLowerCase();
    for (
      let index = haystack.indexOf(needle);
      index >= 0;
      index = haystack.indexOf(needle, index + needle.length)
    ) {
      matches.push({ from: position + 1 + index, to: position + 1 + index + query.length });
    }
    return false;
  });
  return matches;
}

export function replaceEditorText(
  editor: Editor,
  query: string,
  replacement: string,
  all: boolean,
  caseSensitive = false
): number {
  const matches = findEditorTextMatches(editor.state.doc, query, caseSensitive);
  const current = matches.find((match) => match.from >= editor.state.selection.from) ?? matches[0];
  const targets = all ? matches : current ? [current] : [];
  if (!targets.length) return 0;
  const transaction = editor.state.tr;
  for (const match of [...targets].reverse())
    transaction.insertText(replacement, match.from, match.to);
  editor.view.dispatch(transaction);
  return targets.length;
}

export function countEditorText(doc: Node): { words: number; characters: number } {
  const text = doc.textBetween(0, doc.content.size, '\n', ' ');
  return {
    words: text.trim() ? text.trim().split(/\s+/u).length : 0,
    characters: Array.from(text).length,
  };
}

export function normalizeEditorLinkUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return LESSON_EDITOR_LINK_PROTOCOLS.includes(url.protocol) && (url.hostname || url.pathname)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function normalizeEditorColor(value: string): string | null {
  const color = value.trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color.toUpperCase() : null;
}
