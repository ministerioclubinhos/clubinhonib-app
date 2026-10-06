import { Box, InputBase } from '@mui/material';
import { OlderMeditationField as Field, type OlderMeditationEditorProps } from './types';
import {
  OLDER_MEDITATION_FIELD_IDS,
  OLDER_MEDITATION_FIELD_LABELS,
  OLDER_MEDITATION_PAGE as P,
} from './constants';
import { readOlderMeditation, updateOlderMeditation, olderMeditationDisplayFit } from './utils';

export function OlderMeditationEditor({
  initialJson,
  structuredData,
  onChange,
  editable = true,
}: OlderMeditationEditorProps) {
  const content = readOlderMeditation(initialJson, structuredData);
  const fit = olderMeditationDisplayFit(content);
  const input = (field: Field, centered = false) => (
    <InputBase
      value={content[field]}
      multiline
      readOnly={!editable}
      onChange={(event) =>
        onChange?.(updateOlderMeditation(initialJson, structuredData, field, event.target.value))
      }
      inputProps={{
        'aria-label': OLDER_MEDITATION_FIELD_LABELS[field],
        'data-testid': `older-meditation-${OLDER_MEDITATION_FIELD_IDS[field]}`,
      }}
      sx={{
        width: '100%',
        font: 'inherit',
        lineHeight: 1.2,
        '& textarea': { textAlign: centered ? 'center' : 'left', padding: 0 },
        '&:focus-within': { outline: editable ? '2px solid #1976d2' : undefined },
      }}
    />
  );
  return (
    <Box
      data-testid="older-meditation-editor"
      sx={{ overflowX: 'auto', maxWidth: '100%', bgcolor: 'grey.100', p: 1 }}
    >
      <Box
        data-testid="older-meditation-a4-page"
        sx={{
          width: P.width,
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
              gridTemplateRows: '1fr 1fr 1fr',
              flex: 1,
              minHeight: 0,
              gap: '12px',
            }}
          >
            {[Field.FIRST_ACTIVITY, Field.SECOND_ACTIVITY, Field.THIRD_ACTIVITY].map(
              (field, index) => (
                <Box key={field} sx={{ minHeight: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span>{index + 1}.</span>
                    {input(field)}
                  </Box>
                  {content.images[index] ? (
                    <Box
                      component="img"
                      src={content.images[index]}
                      alt={`Enigma do desafio ${index + 1}`}
                      sx={{
                        display: 'block',
                        mx: 'auto',
                        mt: '5px',
                        maxWidth: '100%',
                        maxHeight: fit.imageHeight,
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <Box aria-hidden="true" sx={{ display: 'grid', gap: '20px', mt: '22px' }}>
                      <Box sx={{ borderBottom: '1px solid #777' }} />
                      <Box sx={{ borderBottom: '1px solid #777' }} />
                    </Box>
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
  );
}
