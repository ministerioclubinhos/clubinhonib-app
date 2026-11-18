import React from 'react';
import { Box, Typography } from '@mui/material';

export interface PersonRow {
  key: string;
  name: string;
  /** Uma linha pequena: clubinho, tempo, data. */
  caption?: string;
  /** O que aparece à direita: um tipo de decisão, uma data… */
  badge?: string;
}

interface PersonListProps {
  rows: PersonRow[];
  emptyText: string;
}

/** Lista simples de pessoas, uma por linha: nome, detalhe embaixo e destaque à direita. */
export const PersonList: React.FC<PersonListProps> = ({ rows, emptyText }) => {
  if (rows.length === 0) {
    return (
      <Typography data-testid="statistics-plain-person-list-empty" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  return (
    <Box data-testid="statistics-plain-person-list" component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.25 }}>
      {rows.map((row) => (
        <Box
          component="li"
          key={row.key}
          data-testid="statistics-plain-person-list-row"
          sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'baseline', minHeight: 44, borderBottom: 1, borderColor: 'divider', pb: 1 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>
              {row.name}
            </Typography>
            {row.caption && (
              <Typography variant="caption" color="text.secondary">
                {row.caption}
              </Typography>
            )}
          </Box>
          {row.badge && (
            <Typography variant="body2" fontWeight={800} sx={{ flexShrink: 0, textAlign: 'right' }}>
              {row.badge}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};
