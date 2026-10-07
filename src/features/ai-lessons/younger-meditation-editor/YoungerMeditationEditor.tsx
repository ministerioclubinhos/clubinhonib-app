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
import type { YoungerMeditationEditorProps } from './types';
import { YoungerMeditationField as Field } from './types';
import {
  YOUNGER_MEDITATION_FIELD_IDS,
  YOUNGER_MEDITATION_COPIES,
  YOUNGER_MEDITATION_FIELD_LABELS,
  YOUNGER_MEDITATION_PAGE as P,
} from './constants';
import { readYoungerMeditation, youngerMeditationDisplayFit } from './utils';

export function YoungerMeditationEditor({
  initialJson,
  structuredData,
  onChange,
  editable = true,
}: YoungerMeditationEditorProps) {
  const content = readYoungerMeditation(initialJson, structuredData);
  const fit = youngerMeditationDisplayFit(content);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const canonical = preserveMeditationFormatting(
    buildMeditationDocument({
      ...content,
      instructions: [content.firstActivity, content.secondActivity],
    }),
    initialJson
  );
  const input = (field: Field, copy: string, centered = false) => (
    <MeditationRichField
      document={meditationFieldDocument(canonical, field, content[field])}
      field={field}
      autoActivate={field === Field.TITLE && copy === 'upper'}
      testId={`younger-meditation-${copy}-${YOUNGER_MEDITATION_FIELD_IDS[field]}`}
      label={YOUNGER_MEDITATION_FIELD_LABELS[field]}
      editable={editable}
      centered={centered}
      onActivate={setActiveEditor}
      onChange={(value) => onChange?.(replaceMeditationField(canonical, field, value))}
    />
  );
  return (
    <Box
      data-testid="younger-meditation-editor"
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
      <Box
        data-testid="younger-meditation-paper-scroll"
        sx={{ overflowX: 'auto', maxWidth: '100%' }}
      >
        <Box
          data-testid="younger-meditation-a4-page"
          sx={{
            width: P.width,
            mx: 'auto',
            height: P.height,
            boxSizing: 'border-box',
            p: `${P.margin}px`,
            display: 'grid',
            gridTemplateRows: `${P.copyHeight}px ${P.copyHeight}px`,
            gap: `${P.gap}px`,
            bgcolor: 'white',
            color: 'black',
            fontFamily: 'Arial',
            fontSize: fit.fontSize,
          }}
        >
          {YOUNGER_MEDITATION_COPIES.map((copy) => (
            <Box
              key={copy}
              data-testid={`younger-meditation-${copy}-copy`}
              sx={{
                border: `4px solid ${P.colors.black}`,
                minHeight: 0,
                p: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '24% 76%',
                  alignItems: 'center',
                  minHeight: 74,
                }}
              >
                <Box
                  component="img"
                  src={P.logo}
                  alt="Clubinho Bíblico para crianças"
                  sx={{ width: '100%', maxHeight: 80, objectFit: 'contain' }}
                />
                <Box
                  sx={{
                    width: '72%',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: fit.titleFontSize,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: P.colors.black,
                      color: 'white',
                      whiteSpace: 'nowrap',
                      fontSize: 14,
                      p: '3px',
                    }}
                  >
                    MEDITAÇÃO PARA CRIANÇAS MENORES
                  </Box>
                  <Box sx={{ textTransform: 'uppercase', mt: '3px' }}>
                    {input(Field.TITLE, copy, true)}
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, whiteSpace: 'nowrap' }}>
                Nome: <Box sx={{ borderBottom: '1px solid black', flex: 1 }} /> Data: ____/____/____
              </Box>
              <Box
                sx={{ display: 'grid', gridTemplateColumns: '30% 5% 65%', alignItems: 'center' }}
              >
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
                    fontSize: fit.verseFontSize,
                  }}
                >
                  {input(Field.VERSE_TEXT, copy, true)}
                  {input(Field.VERSE_REFERENCE, copy, true)}
                </Box>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, minHeight: 0 }}>
                {[Field.FIRST_ACTIVITY, Field.SECOND_ACTIVITY].map((field, index) => (
                  <Box
                    key={field}
                    sx={{ px: '7px', borderRight: index === 0 ? '1px solid black' : undefined }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                      <span>{index + 1}.</span>
                      {input(field, copy)}
                    </Box>
                    {content.images[index] ? (
                      <Box
                        component="img"
                        data-testid={`younger-meditation-${copy}-${YOUNGER_MEDITATION_FIELD_IDS[field]}-image`}
                        src={content.images[index]}
                        alt={`Elementos visuais da questão ${index + 1}`}
                        sx={{
                          display: 'block',
                          mx: 'auto',
                          mt: '5px',
                          maxWidth: '100%',
                          width: P.imageWidth,
                          height: fit.imageHeight,
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <Box
                        data-testid={`younger-meditation-${copy}-${YOUNGER_MEDITATION_FIELD_IDS[field]}-image-empty`}
                        sx={{ height: fit.imageHeight }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '24% 76%', bgcolor: P.colors.gray }}>
                <Box
                  sx={{
                    bgcolor: P.colors.prayer,
                    color: 'white',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    px: '5px',
                    fontSize: 12,
                  }}
                >
                  FALANDO COM DEUS:
                </Box>
                <Box sx={{ px: '5px' }}>{input(Field.PRAYER, copy)}</Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
