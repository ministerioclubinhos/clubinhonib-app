import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { OlderMeditationEditor } from '../../src/features/ai-lessons/older-meditation-editor/OlderMeditationEditor';
import type { TiptapDocument } from '../../src/services/aiLessonsService';
import content from './older-meditation-content.json';

function EditorHarness() {
  const [document, setDocument] = useState<TiptapDocument>(
    () =>
      JSON.parse(
        localStorage.getItem('older-meditation-test-document') ?? '{"type":"doc","content":[]}'
      ) as TiptapDocument
  );
  return (
    <div data-testid="older-meditation-harness">
      <button
        data-testid="older-meditation-harness-save"
        onClick={() =>
          localStorage.setItem('older-meditation-test-document', JSON.stringify(document))
        }
      >
        Salvar
      </button>
      <OlderMeditationEditor
        initialJson={document}
        structuredData={content}
        onChange={setDocument}
      />
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<EditorHarness />);
