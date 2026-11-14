import { useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Alert, Box } from '@mui/material';
import { MeditationToolbar } from '../meditation-editor-core/MeditationToolbar';
import { MeditationRichField } from '../meditation-editor-core/MeditationRichField';
import { buildMeditationDocument } from '../meditation-editor-core/document';
import { useFullscreenSheet } from '../meditation-editor-core/useFullscreenSheet';
import { useSheetOverflow } from '../meditation-editor-core/useSheetOverflow';
import {
  preserveMeditationFormatting,
  replaceMeditationField,
} from '../meditation-editor-core/rich-document';
import { OlderMeditationField as Field, type OlderMeditationEditorProps } from './types';
import {
  OLDER_MEDITATION_DISPLAY as D,
  OLDER_MEDITATION_FIELD_IDS,
  OLDER_MEDITATION_FIELD_LABELS,
  OLDER_MEDITATION_PAGE as P,
} from './constants';
import {
  readOlderMeditation,
  olderMeditationActivityFields,
  olderMeditationDisplayFit,
  olderMeditationFieldDocument,
  olderMeditationInstructions,
} from './utils';

export function OlderMeditationEditor({
  initialJson,
  structuredData,
  onChange,
  onOverflowChange,
  editable = true,
}: OlderMeditationEditorProps) {
  const content = readOlderMeditation(initialJson, structuredData);
  const fit = olderMeditationDisplayFit(content);
  const { fullscreen, toggleFullscreen, containerRef, dialogProps } = useFullscreenSheet();
  const paperRef = useRef<HTMLDivElement>(null);
  const overflow = useSheetOverflow(paperRef, null, onOverflowChange);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const canonical = preserveMeditationFormatting(
    buildMeditationDocument({ ...content, instructions: olderMeditationInstructions(content) }),
    initialJson
  );
  const input = (field: Field, centered = false) => (
    <MeditationRichField
      document={olderMeditationFieldDocument(canonical, field, content[field])}
      field={field}
      autoActivate={field === Field.TITLE}
      testId={`older-meditation-${OLDER_MEDITATION_FIELD_IDS[field]}`}
      label={OLDER_MEDITATION_FIELD_LABELS[field]}
      editable={editable}
      centered={centered}
      onActivate={setActiveEditor}
      onChange={(value) => onChange?.(replaceMeditationField(canonical, field, value))}
    />
  );
  return (
    <Box
      data-testid="older-meditation-editor"
      ref={containerRef}
      {...dialogProps}
      sx={{
        maxWidth: '100%',
        bgcolor: 'grey.100',
        p: 1,
        ...(fullscreen
          ? { position: 'fixed', inset: 0, zIndex: (theme) => theme.zIndex.modal, overflow: 'auto' }
          : {}),
      }}
    >
      {editable && (
        <MeditationToolbar
          editor={activeEditor}
          fullscreen={fullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      )}
      {overflow && (
        <Alert data-testid="older-meditation-overflow" severity="warning" sx={{ mb: 1 }}>
          O conteúdo ultrapassa a folha. Reduza o texto, as artes ou a formatação antes de concluir
          ou exportar.
        </Alert>
      )}
      <Box data-testid="older-meditation-paper-scroll" sx={{ overflowX: 'auto', maxWidth: '100%' }}>
        <Box
          ref={paperRef}
          data-testid="older-meditation-a4-page"
          sx={{
            width: P.width,
            mx: 'auto',
            height: P.height,
            boxSizing: 'border-box',
            p: `${P.margin}px`,
            bgcolor: 'white',
            color: 'black',
            fontFamily: 'Arial',
            fontSize: fit.fontSize,
          }}
        >
          <Box
            sx={{
              border: `4px solid ${P.colors.black}`,
              height: '100%',
              boxSizing: 'border-box',
              p: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '24% 76%',
                alignItems: 'center',
                minHeight: 80,
              }}
            >
              <Box
                component="img"
                src={P.logo}
                alt="Clubinho Bíblico para crianças"
                sx={{ width: '100%', maxHeight: 80, objectFit: 'contain' }}
              />
              <Box sx={{ width: '82%', textAlign: 'center', fontWeight: 700, fontSize: 16 }}>
                <Box
                  sx={{
                    bgcolor: P.colors.black,
                    color: 'white',
                    whiteSpace: 'nowrap',
                    fontSize: 15,
                    p: '3px',
                  }}
                >
                  MEDITAÇÃO PARA CRIANÇAS MAIORES
                </Box>
                <Box sx={{ textTransform: 'uppercase', mt: '3px' }}>{input(Field.TITLE, true)}</Box>
                {/* Os relatos estudados ficam entre parênteses abaixo do tema, como nos modelos. */}
                <Box
                  data-testid="older-meditation-subtitle"
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'baseline',
                    fontWeight: 400,
                    fontSize: 14.67,
                  }}
                >
                  <span aria-hidden="true">(</span>
                  {input(Field.BIBLICAL_TEXT, true)}
                  <span aria-hidden="true">)</span>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, whiteSpace: 'nowrap' }}>
              Nome: <Box sx={{ borderBottom: '1px solid black', flex: 1 }} /> Data: ____/____/____
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '30% 5% 65%', alignItems: 'center' }}>
              <Box sx={{ bgcolor: P.colors.yellow, fontWeight: 700, fontSize: 16, p: '4px' }}>
                Versículo para decorar
              </Box>
              <Box
                sx={{
                  color: '#ed1c24',
                  fontSize: 36,
                  fontWeight: 700,
                  textAlign: 'center',
                  lineHeight: 1,
                }}
              >
                ❯
              </Box>
              <Box
                sx={{
                  border: `3px dashed ${P.colors.black}`,
                  borderRadius: '12px',
                  p: '4px',
                  textAlign: 'center',
                }}
              >
                {input(Field.VERSE_TEXT, true)}
                {input(Field.VERSE_REFERENCE, true)}
              </Box>
            </Box>
            <Box>
              <strong>Entendendo a lição:</strong>
              {/* O contexto vai dentro de cada questão; a introdução só aparece quando escrita. */}
              {content.introduction.trim() && input(Field.INTRODUCTION)}
            </Box>
            <Box
              sx={{
                display: 'grid',
                // As questões dividem toda a altura livre, proporcionalmente ao tamanho.
                gridTemplateRows: fit.activityWeights
                  .map((weight) => `minmax(min-content, ${weight}fr)`)
                  .join(' '),
                flex: 1,
                minHeight: 0,
                gap: `${D.rowGap}px`,
              }}
            >
              {olderMeditationActivityFields(content).map((field, index, fields) => (
                <Box
                  key={field}
                  data-testid={`older-meditation-${OLDER_MEDITATION_FIELD_IDS[field]}-activity`}
                  sx={{
                    minHeight: 0,
                    borderBottom: index < fields.length - 1 ? '1px solid #777' : undefined,
                    display: 'grid',
                    gridTemplateColumns: content.images[index] ? '58% 42%' : '1fr',
                    gap: '8px',
                    alignItems: 'start',
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span>{index + 1}.</span>
                      {input(field)}
                    </Box>
                  </Box>
                  {content.images[index] && (
                    <Box
                      component="img"
                      data-testid={`older-meditation-${OLDER_MEDITATION_FIELD_IDS[field]}-image`}
                      src={content.images[index]}
                      alt={`Arte da questão ${index + 1}`}
                      sx={{
                        display: 'block',
                        mx: 'auto',
                        maxWidth: '100%',
                        width: '100%',
                        maxHeight: fit.imageHeight,
                        objectFit: 'contain',
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '26% 74%',
                bgcolor: P.colors.gray,
                mt: 'auto',
              }}
            >
              <Box
                sx={{
                  bgcolor: P.colors.prayer,
                  color: 'white',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  px: '5px',
                  fontSize: 13,
                }}
              >
                FALANDO COM DEUS:
              </Box>
              <Box sx={{ px: '5px' }}>{input(Field.PRAYER)}</Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
