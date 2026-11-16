import { Box } from '@mui/material';

import { MediaType } from '@/store/slices/types';
import { IdeaAiMediaStatus, IdeaAiSkipReason, type IdeaAiMaterialCompareProps } from '../../types';
import IdeaAiDocumentCompare from './IdeaAiDocumentCompare';
import IdeaAiGuardWarning from './IdeaAiGuardWarning';
import IdeaAiImageCompare from './IdeaAiImageCompare';
import IdeaAiMediaNotice from './IdeaAiMediaNotice';
import IdeaAiSkippedNotice from './IdeaAiSkippedNotice';

/**
 * Um arquivo da ideia visto pela IA: original × versão melhorada e os avisos
 * do que ela fez (ou por que não fez). Vive dentro do cartão do arquivo, para
 * ele aparecer uma vez só na revisão.
 */
export default function IdeaAiMaterialCompare({
  section,
  source,
  decision,
  onDecisionChange,
  onDocumentSaved,
  disabled,
}: IdeaAiMaterialCompareProps) {
  const result = section.aiEnhancement?.currentResult;
  const improved = result?.medias.find((m) => m.sourceMediaId === source.id);
  /*
   * Documento só de imagem (ou com imagens) não tem o que melhorar: a etiqueta
   * "Mantido como enviado" do cartão já diz o estado, sem aviso por cima.
   */
  const keptAsSent =
    improved?.status === IdeaAiMediaStatus.SKIPPED &&
    improved.skipReason === IdeaAiSkipReason.ESSENTIAL_VISUALS;
  const skipped =
    !keptAsSent &&
    (improved?.status === IdeaAiMediaStatus.SKIPPED ||
      improved?.status === IdeaAiMediaStatus.FAILED ||
      source.mediaType === MediaType.VIDEO);
  return (
    <Box data-testid="idea-ai-media-item" sx={{ minWidth: 0 }}>
      {source.mediaType === MediaType.IMAGE ? (
        <IdeaAiImageCompare
          original={source}
          result={improved}
          decision={decision}
          onChange={onDecisionChange}
          disabled={disabled}
        />
      ) : source.mediaType === MediaType.DOCUMENT ? (
        <IdeaAiDocumentCompare
          original={source}
          result={improved}
          decision={decision}
          onChange={onDecisionChange}
          disabled={disabled}
          documentEdit={
            result && onDocumentSaved && improved?.enhancedMedia && improved.editableMedia
              ? {
                  sectionId: section.id,
                  enhancementId: result.id,
                  onSaved: onDocumentSaved,
                }
              : undefined
          }
        />
      ) : null}
      <Box sx={{ mt: 1 }}>
        <IdeaAiGuardWarning guard={improved?.guard} />
        <IdeaAiMediaNotice result={improved} baseAttempt={result?.baseAttempt ?? null} />
        {skipped && (
          <IdeaAiSkippedNotice
            reason={improved?.skipReason ?? IdeaAiSkipReason.NOT_SUPPORTED}
            failed={improved?.status === IdeaAiMediaStatus.FAILED}
            errorCode={improved?.errorCode}
          />
        )}
      </Box>
    </Box>
  );
}
