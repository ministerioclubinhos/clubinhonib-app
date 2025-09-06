import {
  Grid, Card, CardContent, Typography, IconButton, Button, Box, Chip, Stack,
  useMediaQuery, useTheme, Tooltip, Divider
} from '@mui/material';
import { Visibility, Delete, Public, Lock } from '@mui/icons-material';
import { WeekMaterialPageData } from 'store/slices/week-material/weekMaterialSlice';
import { truncate } from '../../week-materials/utils';

interface Props {
  material: WeekMaterialPageData;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSetAsCurrent?: () => void;
}

export default function WeekMaterialCard({
  material, onView, onEdit, onDelete, onSetAsCurrent,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isPublic = material.route.public;

  return (
    <Grid
      item
      sx={{
        flexBasis: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' },
        maxWidth:  { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' },
        display: 'flex',
      }}
    >
      <Card
        sx={{
          flex: 1,
          borderRadius: 3,
          boxShadow: { xs: 1, sm: 3 },
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header compacto com status */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.25,
            py: 1,
            bgcolor: (t) => t.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* status público/privado (sem Tooltip no mobile para não atrapalhar) */}
          {isMobile ? (
            <IconButton size="small" disabled>
              {isPublic ? <Public color="success" fontSize="small" /> : <Lock color="error" fontSize="small" />}
            </IconButton>
          ) : (
            <Tooltip title={isPublic ? 'Público' : 'Privado'}>
              <IconButton size="small" disabled>
                {isPublic ? <Public color="success" fontSize="small" /> : <Lock color="error" fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {material.title}
          </Typography>

          {/* Delete com alvo de toque maior no mobile */}
          <IconButton
            onClick={onDelete}
            aria-label="Excluir material"
            sx={{
              color: 'error.main',
              ml: 'auto',
              p: { xs: 1.25, sm: 1 },
            }}
          >
            <Delete fontSize={isMobile ? 'medium' : 'small'} />
          </IconButton>
        </Box>

        <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Título grande (desktop) vira subtítulo (mobile) — já temos no header */}
          {!isMobile && (
            <Typography
              variant="h6"
              fontWeight="bold"
              textAlign="center"
              gutterBottom
              sx={{ fontSize: { sm: '1.15rem', md: '1.25rem' } }}
            >
              {material.title}
            </Typography>
          )}

          {material.subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{
                mt: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: isMobile ? 1 : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {material.subtitle}
            </Typography>
          )}

          {material.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{
                mt: 1,
                px: { xs: 0.5, sm: 1 },
                display: '-webkit-box',
                WebkitLineClamp: isMobile ? 3 : 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {truncate(material.description)}
            </Typography>
          )}

          {/* Ações sempre acessíveis; no mobile, empilhadas e fullWidth */}
          <Box mt={{ xs: 1.5, sm: 2.5 }}>
            <Stack
              direction={isMobile ? 'column' : 'row'}
              spacing={1.25}
              justifyContent="center"
              alignItems="stretch"
            >
              <Button
                variant="contained"
                startIcon={<Visibility />}
                onClick={onView}
                fullWidth
                size={isMobile ? 'medium' : 'small'}
              >
                Ver
              </Button>
              <Button
                variant="outlined"
                onClick={onEdit}
                fullWidth={isMobile}
                size={isMobile ? 'medium' : 'small'}
              >
                Editar
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: { xs: 1.25, sm: 2 } }} />

          {/* Rodapé com chip/ação contextual; fonte e espaçamento otimizados no mobile */}
          <Box textAlign="center">
            {material.currentWeek ? (
              <Chip
                label="📌 Material da semana"
                color="primary"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            ) : (
              onSetAsCurrent && (
                <Button
                  variant="text"
                  size="small"
                  onClick={onSetAsCurrent}
                  sx={{ mt: 0.5 }}
                >
                  Tornar material da semana
                </Button>
              )
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}
