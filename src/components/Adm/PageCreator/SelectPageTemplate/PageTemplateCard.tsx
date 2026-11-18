import { Box, CardActionArea, Paper, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';

import { PageTemplateCardProps } from './types';

/** Card clicável de um modelo de página, na grade de escolha. */
export default function PageTemplateCard({
  template,
  onSelect,
}: PageTemplateCardProps) {
  return (
    <Paper data-testid="adm-page-creator-select-page-template-page-template-card"
      variant="outlined"
      sx={{
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        transition: (theme) =>
          theme.transitions.create(['border-color', 'box-shadow'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 2,
        },
        '&:focus-within': {
          borderColor: 'primary.main',
        },
      }}
    >
      <CardActionArea
        onClick={() => onSelect(template.id)}
        aria-label={`Criar ${template.title}`}
        sx={{
          height: '100%',
          p: { xs: 2, md: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          gap: 1,
          minHeight: 172,
        }}
      >
        {template.icon}

        <Typography variant="subtitle1" fontWeight={700} textAlign="left">
          {template.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="left"
          sx={{ flexGrow: 1 }}
        >
          {template.description}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'primary.main',
            fontWeight: 600,
          }}
        >
          <Typography variant="button" component="span">
            Criar
          </Typography>
          <ChevronRight fontSize="small" />
        </Box>
      </CardActionArea>
    </Paper>
  );
}
