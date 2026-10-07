import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Box } from '@mui/material';
import { MeditationToolbar } from '../meditation-editor-core/MeditationToolbar';
import { MeditationRichField } from '../meditation-editor-core/MeditationRichField';
import { buildMeditationDocument } from '../meditation-editor-core/document';
import {
  meditationFieldDocument,
  preserveMeditationFormatting,
  replaceMeditationField,
} from '../meditation-editor-core/rich-document';
import { OlderMeditationField as Field, type OlderMeditationEditorProps } from './types';
import {
  OLDER_MEDITATION_FIELD_IDS,
  OLDER_MEDITATION_FIELD_LABELS,
  OLDER_MEDITATION_PAGE as P,
} from './constants';
import { readOlderMeditation, olderMeditationDisplayFit } from './utils';

export function OlderMeditationEditor({
  initialJson,
  structuredData,
  onChange,
  editable = true,
}: OlderMeditationEditorProps) {
  const content = readOlderMeditation(initialJson, structuredData);
  const fit = olderMeditationDisplayFit(content);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const canonical = preserveMeditationFormatting(
    buildMeditationDocument({
      ...content,
      instructions: [content.firstActivity, content.secondActivity, content.thirdActivity],
    }),
    initialJson
  );
  const input = (field: Field, centered = false) => (
    <MeditationRichField
      document={meditationFieldDocument(canonical, field, content[field])}
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
      onKeyDown={(event) => {
        if (event.key === 'Escape') setFullscreen(false);
      }}
      role={fullscreen ? 'dialog' : undefined}
      aria-label={fullscreen ? 'Editor da meditação em tela cheia' : undefined}
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
          onToggleFullscreen={() => setFullscreen((value) => !value)}
        />
      )}
      <Box data-testid="older-meditation-paper-scroll" sx={{ overflowX: 'auto', maxWidth: '100%' }}>
        <Box
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
            <Box
              sx={{
                border: '1px solid black',
                display: 'flex',
                gap: 1,
                alignItems: 'baseline',
                px: '5px',
              }}
            >
              <strong style={{ whiteSpace: 'nowrap' }}>TEXTO BÍBLICO:</strong>
              {input(Field.BIBLICAL_TEXT)}
            </Box>
            <Box>
              <strong>Entendendo a lição:</strong>
              {input(Field.INTRODUCTION)}
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateRows: fit.activityWeights.map((weight) => `${weight}fr`).join(' '),
                flex: 1,
                minHeight: 0,
                gap: '12px',
              }}
            >
              {[Field.FIRST_ACTIVITY, Field.SECOND_ACTIVITY, Field.THIRD_ACTIVITY].map(
                (field, index) => (
                  <Box
                    key={field}
                    data-testid={`older-meditation-${OLDER_MEDITATION_FIELD_IDS[field]}-activity`}
                    sx={{
                      minHeight: 0,
                      borderBottom: index < 2 ? '1px solid #777' : undefined,
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
                      {!content.images[index] && (
                        <Box aria-hidden="true" sx={{ display: 'grid', gap: '20px', mt: '15px' }}>
                          <Box sx={{ borderBottom: '1px solid #777' }} />
                          <Box sx={{ borderBottom: '1px solid #777' }} />
                        </Box>
                      )}
                    </Box>
                    {content.images[index] && (
                      <Box
                        component="img"
                        data-testid={`older-meditation-${OLDER_MEDITATION_FIELD_IDS[field]}-image`}
                        src={content.images[index]}
                        alt={`Enigma do desafio ${index + 1}`}
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
                )
              )}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '26% 74%', bgcolor: P.colors.gray }}>
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
