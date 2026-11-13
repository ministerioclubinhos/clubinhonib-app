import { Fragment } from 'react';
import { IdeaWordDiffKind, type IdeaAiDiffSideProps } from '../../types';

/**
 * Um lado do diff: o original mostra o que saiu (`<del>`), a versão da IA o
 * que entrou (`<ins>`). Cada coluna continua legível mesmo quando a IA
 * reordena frases.
 */
export default function IdeaAiDiffSide({ parts, marked }: IdeaAiDiffSideProps) {
  const hidden =
    marked === IdeaWordDiffKind.ADDED ? IdeaWordDiffKind.REMOVED : IdeaWordDiffKind.ADDED;
  return (
    <>
      {parts.map((part, index) => {
        if (part.kind === hidden) return null;
        if (part.kind === IdeaWordDiffKind.SAME) return <Fragment key={index}>{part.text}</Fragment>;
        return part.kind === IdeaWordDiffKind.ADDED ? (
          <ins key={index} data-testid="idea-ai-diff-added">
            {part.text}
          </ins>
        ) : (
          <del key={index} data-testid="idea-ai-diff-removed">
            {part.text}
          </del>
        );
      })}
    </>
  );
}
