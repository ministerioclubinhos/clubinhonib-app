import { useState } from 'react';
import {
  Badge,
  Grid2,
  Tab,
  Tabs,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { MediaEditor, MEDIA_EDITOR_CONFIG } from '@/components/common/media';
import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import { MediaItem } from '@/store/slices/types';

import { IDEAS_MEDIA_TABS } from '../constants';
import { mediasOfType, replaceMediasOfType } from '../utils';

/** Parte editável comum a uma seção de ideias, seja rascunho ou já salva. */
export interface IdeasSectionFieldsValue {
  title: string;
  description: string;
  medias: MediaItem[];
}

interface IdeasSectionFieldsProps<T extends IdeasSectionFieldsValue> {
  section: T;
  onUpdate: (section: T) => void;
  /** Usa os rótulos do fluxo em que o professor compartilha uma ideia. */
  isCreationMode?: boolean;
  /** Marca o título como pendente depois de uma tentativa de salvar. */
  titleError?: boolean;
  /**
   * Informa que há uma mídia em edição, para que o formulário possa avisar
   * antes de descartá-la.
   */
  onDraftChange?: (hasDraft: boolean) => void;
}

/**
 * Título, descrição e as abas de mídia de uma seção. Compartilhado pelo
 * formulário da página de ideias e pelas telas de ideia compartilhada.
 */
export default function IdeasSectionFields<T extends IdeasSectionFieldsValue>({
  section,
  onUpdate,
  isCreationMode = false,
  titleError = false,
  onDraftChange,
}: IdeasSectionFieldsProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);

  const tab = IDEAS_MEDIA_TABS[activeTab];

  return (
    <>
      <Grid2 data-testid="ideas-pages-ideas-section-fields" container spacing={2}>
        <Grid2 size={{ xs: 12, md: 5 }}>
          <TextField
            label={
              isCreationMode ? 'Título da sua ideia' : 'Título da seção'
            }
            fullWidth
            required
            value={section.title}
            onChange={(event) =>
              onUpdate({ ...section, title: event.target.value })
            }
            error={titleError}
            helperText={
              titleError ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ''
            }
          />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 7 }}>
          <TextField
            label={
              isCreationMode
                ? 'Descreva sua ideia (brincadeira, versículo, história...)'
                : 'Descrição da seção'
            }
            fullWidth
            multiline
            minRows={2}
            value={section.description}
            onChange={(event) =>
              onUpdate({ ...section, description: event.target.value })
            }
          />
        </Grid2>
      </Grid2>

      <Tabs data-testid="ideas-pages-ideas-section-fields"
        value={activeTab}
        onChange={(_event, value: number) => setActiveTab(value)}
        variant={isMobile ? 'fullWidth' : 'standard'}
        sx={{ mt: 2, mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {IDEAS_MEDIA_TABS.map((item) => {
          const total = mediasOfType(section.medias, item.mediaType).length;

          return (
            <Tab
              key={item.mediaType}
              sx={{ minHeight: 48, textTransform: 'none' }}
              label={
                <Badge
                  badgeContent={total}
                  color="primary"
                  sx={{ '& .MuiBadge-badge': { right: -12, top: 4 } }}
                >
                  {isMobile ? item.shortLabel : item.label}
                </Badge>
              }
            />
          );
        })}
      </Tabs>

      <MediaEditor data-testid="ideas-pages-ideas-section-fields"
        // A troca de aba precisa remontar o editor: ele guarda o rascunho em
        // estado local, que não faz sentido no outro tipo de mídia.
        key={tab.mediaType}
        config={MEDIA_EDITOR_CONFIG[tab.mediaType]}
        items={mediasOfType(section.medias, tab.mediaType)}
        onChange={(items) =>
          onUpdate({
            ...section,
            medias: replaceMediasOfType(section.medias, tab.mediaType, items),
          })
        }
        onDraftChange={onDraftChange}
      />
    </>
  );
}
