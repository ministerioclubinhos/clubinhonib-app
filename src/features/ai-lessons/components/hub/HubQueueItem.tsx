import React from 'react';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

import { STUDIO_HUB_ACTION_COLORS, STUDIO_HUB_ACTION_HINTS } from '../../hub.constants';
import { hubLessonTag, hubRelativeTime } from '../../hub.utils';
import type { StudioHubQueueItem } from '../../types';
import { HubStagePipeline } from './HubStagePipeline';

interface Props {
  item: StudioHubQueueItem;
}

/** One lesson of the work queue: what it is, how far it got and the next step. */
export const HubQueueItem: React.FC<Props> = ({ item }) => {
  const { lesson } = item;
  const color = STUDIO_HUB_ACTION_COLORS[item.action];

  return (
    <Paper
      component="li"
      elevation={0}
      data-testid={`ai-lessons-hub-queue-item-${lesson.id}`}
      data-action={item.action}
      sx={{
        listStyle: 'none',
        p: { xs: 1.5, sm: 2 },
        minWidth: 0,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: '4px solid',
        borderLeftColor: `${color === 'default' ? 'grey' : color}.main`,
      }}
    >
      <Stack spacing={1.25}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          gap={1.25}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" flexWrap="wrap" alignItems="center" gap={0.75} sx={{ mb: 0.5 }}>
              <Chip
                size="small"
                color={color}
                label={STUDIO_HUB_ACTION_HINTS[item.action]}
                sx={{ fontWeight: 700, borderRadius: 1.5 }}
              />
              <Typography variant="caption" color="text.secondary">
                {hubLessonTag(lesson)} · mexida {hubRelativeTime(lesson.updatedAt)}
              </Typography>
            </Stack>
            <Typography
              component="h3"
              fontWeight={700}
              color="text.primary"
              sx={{
                fontSize: { xs: '1rem', sm: '1.05rem' },
                lineHeight: 1.3,
                overflowWrap: 'anywhere',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {lesson.theme}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {lesson.biblicalReference}
            </Typography>
          </Box>

          <Button
            component={RouterLink}
            to={item.href}
            variant="contained"
            color={color === 'default' ? 'primary' : color}
            endIcon={<ArrowForward />}
            data-testid={`ai-lessons-hub-queue-action-${lesson.id}`}
            sx={{
              flexShrink: 0,
              minHeight: 44,
              borderRadius: 2.5,
              fontWeight: 700,
              textTransform: 'none',
              maxWidth: { sm: 300 },
            }}
          >
            {item.actionLabel}
          </Button>
        </Stack>

        <Box>
          <HubStagePipeline stages={item.stages} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {item.completed} de {item.total} etapas concluídas
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
