import { Extension, type Extensions } from '@tiptap/core';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { TextAlign } from '@tiptap/extension-text-align';
import { FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style';
import StarterKit from '@tiptap/starter-kit';

export const IdeaParagraphSpacing = Extension.create({
  name: 'ideaParagraphSpacing',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.lineHeight || null,
            renderHTML: (attributes: Record<string, unknown>) =>
              typeof attributes.lineHeight === 'string'
                ? { style: `line-height: ${attributes.lineHeight}` }
                : {},
          },
        },
      },
    ];
  },
});

/** The one schema of the ideas document editor (an isolated copy: it does not share code with the Studio). */
export function createIdeaEditorExtensions(): Extensions {
  return [
    StarterKit.configure({ link: { openOnClick: false } }),
    Subscript,
    Superscript,
    Highlight.configure({ multicolor: true }),
    TextStyle,
    FontFamily,
    FontSize,
    IdeaParagraphSpacing,
    Color,
    TextAlign.configure({ types: ['heading', 'paragraph', 'blockquote'] }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
  ];
}
