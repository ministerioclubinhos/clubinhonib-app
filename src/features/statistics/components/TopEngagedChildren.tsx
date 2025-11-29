import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  useTheme,
  Card,
  CardContent,
  useMediaQuery,
  Stack,
  Divider,
  Grid,
  Button,
} from '@mui/material';
import { Star, EmojiEvents, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useInsights } from '../hooks';
import { StatisticsFilters } from '../api';

interface TopEngagedChildrenProps {
  filters?: StatisticsFilters;
}

export const TopEngagedChildren: React.FC<TopEngagedChildrenProps> = ({ filters }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data, isLoading, error } = useInsights(filters);
  const [showAllMobile, setShowAllMobile] = React.useState(false);

  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error || !data) {
    return (
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Typography color="error" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Erro ao carregar crianças mais engajadas</Typography>
      </Paper>
    );
  }

  // No mobile, mostrar apenas 3 inicialmente
  const initialMobileItems = 3;
  const displayedChildren = isMobile && !showAllMobile 
    ? (data.topEngagedChildren || []).slice(0, initialMobileItems)
    : (data.topEngagedChildren || []);

  const getMedalColor = (position: number) => {
    switch (position) {
      case 0:
        return '#FFD700'; // Ouro
      case 1:
        return '#C0C0C0'; // Prata
      case 2:
        return '#CD7F32'; // Bronze
      default:
        return theme.palette.grey[400];
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'info';
    if (score >= 60) return 'warning';
    return 'default';
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Paper elevation={3} sx={{ 
      p: { xs: 2, sm: 3 }, 
      borderRadius: 2,
      width: '98%',
      maxWidth: '98%',
      overflow: 'hidden',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 2, sm: 3 } }}>
        <Star sx={{ color: theme.palette.warning.main, fontSize: { xs: 24, sm: 28 } }} />
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          ⭐ Crianças Mais Engajadas
        </Typography>
      </Box>

      {!data.topEngagedChildren || data.topEngagedChildren.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Nenhum dado disponível
          </Typography>
        </Box>
      ) : isMobile ? (
        /* Versão Mobile: Cards */
        <Stack spacing={2}>
          {displayedChildren.map((child, index) => (
            <Card
              key={child.childId}
              elevation={2}
              sx={{
                borderRadius: 2,
                border: index < 3 ? `2px solid ${getMedalColor(index)}40` : undefined,
                bgcolor: index < 3 ? `${getMedalColor(index)}10` : undefined,
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Stack spacing={1.5}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                      {index < 3 ? (
                        <EmojiEvents sx={{ color: getMedalColor(index), fontSize: { xs: 20, sm: 24 } }} />
                      ) : (
                        <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {index + 1}
                        </Typography>
                      )}
                      <Avatar
                        sx={{
                          width: { xs: 32, sm: 36 },
                          height: { xs: 32, sm: 36 },
                          bgcolor: child.gender === 'F' ? theme.palette.secondary.main : theme.palette.info.main,
                          fontSize: { xs: 12, sm: 14 },
                        }}
                      >
                        {getInitials(child.childName)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight="medium" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {child.childName}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Informações */}
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Idade
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {child.age} anos
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Cidade
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {child.city ? `${child.city}, ${child.state}` : '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Tempo
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {child.monthsParticipating} {child.monthsParticipating === 1 ? 'mês' : 'meses'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Pagelas
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {child.totalPagelas}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Presença e Engajamento */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Presença: {child.presenceRate.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Chip
                      label={`Engajamento: ${child.engagementScore.toFixed(0)}`}
                      color={getEngagementColor(child.engagementScore)}
                      size="small"
                      icon={<Star />}
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    />
                  </Box>

                  {/* Decisão */}
                  {child.hasDecision && (
                    <Box>
                      <Chip
                        label={child.decisionType === 'ACCEPTED' ? 'Aceitou' : 'Reconciliado'}
                        color="success"
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
          
          {/* Botão Ver Mais / Ver Menos no Mobile */}
          {isMobile && data.topEngagedChildren.length > initialMobileItems && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setShowAllMobile(!showAllMobile)}
                endIcon={showAllMobile ? <ExpandLess /> : <ExpandMore />}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                }}
              >
                {showAllMobile 
                  ? `Ver menos (mostrando ${data.topEngagedChildren.length})` 
                  : `Ver mais (${data.topEngagedChildren.length - initialMobileItems} restantes)`
                }
              </Button>
            </Box>
          )}
        </Stack>
      ) : (
        /* Versão Desktop: Tabela */
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={60}><strong>Pos.</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell align="center"><strong>Idade</strong></TableCell>
                <TableCell><strong>Cidade</strong></TableCell>
                <TableCell align="center"><strong>Tempo</strong></TableCell>
                <TableCell align="right"><strong>Pagelas</strong></TableCell>
                <TableCell align="right"><strong>Presença %</strong></TableCell>
                <TableCell align="center"><strong>Engajamento</strong></TableCell>
                <TableCell align="center"><strong>Decisão</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.topEngagedChildren.map((child, index) => (
                <TableRow
                  key={child.childId}
                  hover
                  sx={{
                    backgroundColor: index < 3 ? `${getMedalColor(index)}10` : 'transparent',
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {index < 3 ? (
                        <EmojiEvents sx={{ color: getMedalColor(index), fontSize: 24 }} />
                      ) : (
                        <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{index + 1}</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: child.gender === 'F' ? theme.palette.secondary.main : theme.palette.info.main,
                          fontSize: 14,
                        }}
                      >
                        {getInitials(child.childName)}
                      </Avatar>
                      <Typography fontWeight="medium" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{child.childName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{child.age} anos</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {child.city ? `${child.city}, ${child.state}` : '-'}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {child.monthsParticipating} {child.monthsParticipating === 1 ? 'mês' : 'meses'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{child.totalPagelas}</TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{child.presenceRate.toFixed(1)}%</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={child.engagementScore.toFixed(0)}
                      color={getEngagementColor(child.engagementScore)}
                      size="small"
                      icon={<Star />}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {child.hasDecision ? (
                      <Chip
                        label={child.decisionType === 'ACCEPTED' ? 'Aceitou' : 'Reconciliado'}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Chip label="-" size="small" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

