import { useEffect, useId, useMemo, useState } from 'react';
import { Badge, Box, Grid2, Tab, Tabs, TextField, useMediaQuery, useTheme } from '@mui/material';
import type { MediaType } from '@/store/slices/types';

import { MediaEditor, MEDIA_EDITOR_CONFIG } from '@/components/common/media';
import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';

import { IDEAS_MEDIA_TABS, IDEAS_TITLE_MAX_LENGTH } from '../constants';
import {
  AudiotrackOutlined,
  DescriptionOutlined,
  ImageOutlined,
  MovieOutlined,
} from '@mui/icons-material';
import { MediaType as MediaTypeValue } from '@/store/slices/types';
import { mediasOfType, replaceMediasOfType } from '../utils';

import type { IdeasSectionFieldsValue, IdeasSectionFieldsProps } from '../types';
export type { IdeasSectionFieldsValue } from '../types';

/** Ícone de cada aba de mídia: o ícone reconhece o tipo mais rápido que o rótulo. */
const IDEAS_MEDIA_TAB_ICONS = {
  [MediaTypeValue.DOCUMENT]: DescriptionOutlined,
  [MediaTypeValue.IMAGE]: ImageOutlined,
  [MediaTypeValue.VIDEO]: MovieOutlined,
  [MediaTypeValue.AUDIO]: AudiotrackOutlined,
} as const;

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
  focusRequest,
}: IdeasSectionFieldsProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);

  const panelId = useId();
  const [drafts, setDrafts] = useState<Partial<Record<MediaType, boolean>>>({});
  const pendingTypes = useMemo(
    () => IDEAS_MEDIA_TABS.filter((tab) => drafts[tab.mediaType]).map((tab) => tab.mediaType),
    [drafts]
  );
  useEffect(() => {
    onDraftChange?.(pendingTypes.length > 0, pendingTypes);
  }, [pendingTypes, onDraftChange]);
  useEffect(() => {
    if (focusRequest)
      setActiveTab(IDEAS_MEDIA_TABS.findIndex((tab) => tab.mediaType === focusRequest.mediaType));
  }, [focusRequest]);

  return (
    <Box data-testid="ideas-pages-ideas-section-fields" sx={{ minWidth: 0 }}>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 5 }}>
          <TextField
            label={isCreationMode ? 'Título da sua ideia' : 'Título da seção'}
            fullWidth
            required
            value={section.title}
            onChange={(event) => onUpdate({ ...section, title: event.target.value })}
            inputProps={{ maxLength: IDEAS_TITLE_MAX_LENGTH }}
            error={titleError}
            helperText={titleError ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ''}
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
            onChange={(event) => onUpdate({ ...section, description: event.target.value })}
          />
        </Grid2>
      </Grid2>

      <Tabs
        data-testid="ideas-section-media-tabs"
        aria-label="Tipos de materiais"
        value={activeTab}
        onChange={(_event, value: number) => setActiveTab(value)}
        variant="fullWidth"
        sx={{ mt: 2, mb: 2, borderBottom: 1, borderColor: 'divider', minHeight: 56 }}
      >
        {IDEAS_MEDIA_TABS.map((item, index) => {
          const total = mediasOfType(section.medias, item.mediaType).length;
          const TabIcon = IDEAS_MEDIA_TAB_ICONS[item.mediaType];

          return (
            <Tab
              key={item.mediaType}
              id={`${panelId}-tab-${item.mediaType}`}
              aria-controls={`${panelId}-panel-${item.mediaType}`}
              data-testid={`ideas-section-tab-${item.mediaType}`}
              value={index}
              icon={
                <Badge
                  badgeContent={total}
                  color="primary"
                  variant={drafts[item.mediaType] && !total ? 'dot' : 'standard'}
                  invisible={!total && !drafts[item.mediaType]}
                >
                  <TabIcon fontSize="small" />
                </Badge>
              }
              iconPosition="top"
              sx={{ minHeight: 56, minWidth: 0, px: 0.5, textTransform: 'none', fontSize: 12 }}
              label={
                <Box component="span">
                  {isMobile ? item.shortLabel : item.label}
                  {drafts[item.mediaType] && (
                    <Box
                      component="span"
                      data-testid={`ideas-section-draft-${item.mediaType}`}
                      sx={{ display: 'block', color: 'warning.dark', fontSize: '0.7rem' }}
                    >
                      Em edição
                    </Box>
                  )}
                </Box>
              }
            />
          );
        })}
      </Tabs>

      {IDEAS_MEDIA_TABS.map((item, index) => (
        <Box
          key={item.mediaType}
          role="tabpanel"
          hidden={activeTab !== index}
          id={`${panelId}-panel-${item.mediaType}`}
          aria-labelledby={`${panelId}-tab-${item.mediaType}`}
          data-testid={`ideas-section-panel-${item.mediaType}`}
        >
          <MediaEditor
            config={MEDIA_EDITOR_CONFIG[item.mediaType]}
            items={mediasOfType(section.medias, item.mediaType)}
            onChange={(items) =>
              onUpdate({
                ...section,
                medias: replaceMediasOfType(section.medias, item.mediaType, items),
              })
            }
            onDraftChange={(hasDraft) =>
              setDrafts((previous) =>
                previous[item.mediaType] === hasDraft
                  ? previous
                  : { ...previous, [item.mediaType]: hasDraft }
              )
            }
          />
        </Box>
      ))}
    </Box>
  );
}
