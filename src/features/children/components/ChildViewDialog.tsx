import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  Stack,
  Tooltip,
  IconButton,
  Alert,
  Link,
  Paper,
  useMediaQuery,
  useTheme,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  WhatsApp,
  PhoneIphone,
  ContentCopy,
  Phone as PhoneIcon,
  Map,
  Cake,
  Group,
  Home,
  MenuBook,
  ToggleOn,
  ToggleOff,
} from '@mui/icons-material';
import { ChildResponseDto } from '../types';
import { fmtDate } from '@/utils/dates';
import { buildWhatsappLink } from '@/utils/whatsapp';

const calcAge = (iso?: string) => {
  if (!iso) return undefined;
  const b = new Date(iso);
  if (Number.isNaN(b.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
};

const initials = (name?: string) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || 'C';

function CopyButton({ value, title = 'Copiar' }: { value?: string; title?: string }) {
  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(String(text)).catch(() => {});
  };
  return (
    <Tooltip title={title}>
      <IconButton size="small" onClick={() => copyToClipboard(value)}>
        <ContentCopy fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
}

function LineCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2, height: '100%' }}>
      <Stack spacing={0.5} sx={{ height: '100%' }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          {icon}
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

type Props = {
  open: boolean;
  loading: boolean;
  child: ChildResponseDto | null;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onToggleActive?: (child: ChildResponseDto) => void;
};

export default function ChildViewDialog({
  open,
  loading,
  child,
  onClose,
  onEdit,
  onToggleActive,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const age = useMemo(() => calcAge(child?.birthDate), [child?.birthDate]);

  const waLink = useMemo(() => {
    if (!child?.guardianPhone) return null;
    return buildWhatsappLink({ id: child.id, name: child.name, phone: child.guardianPhone } as any);
  }, [child?.guardianPhone, child?.name, child?.id]);

  const mapsHref = child?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [
          child.address.street,
          child.address.number,
          child.address.district,
          child.address.city,
          child.address.state,
          child.address.postalCode,
        ]
          .filter(Boolean)
          .join(', ')
      )}`
    : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          width: { xs: '98%', sm: '44rem' },
          m: 0,
          borderRadius: { xs: 2, sm: 3 },
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 3 },
          pb: { xs: 1.25, sm: 1.5 },
          background: 'linear-gradient(135deg, rgba(3,155,229,.08) 0%, rgba(156,39,176,.08) 100%)',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {!child ? (
          <Typography variant="h6">Detalhes da Criança</Typography>
        ) : (
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: child.gender === 'F' ? 'secondary.main' : 'primary.main',
                  color: 'white',
                  fontWeight: 700,
                }}
              >
                {initials(child.name)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <Typography variant="h6" fontWeight={800} noWrap={!isXs} title={child.name}>
                    {child.name || '—'}
                  </Typography>
                  <Chip
                    size="small"
                    label={child.gender === 'F' ? 'Feminino' : 'Masculino'}
                    color="default"
                  />
                  {typeof age === 'number' && (
                    <Chip size="small" label={`${age} anos`} color="default" />
                  )}
                  <Chip
                    size="small"
                    label={child.isActive ? 'Ativo' : 'Inativo'}
                    color={child.isActive ? 'success' : 'default'}
                    variant={child.isActive ? 'filled' : 'outlined'}
                  />
                  {child.club ? (
                    <Chip
                      size="small"
                      label={`Clubinho #${child.club.number}${child.club.weekday ? ` • ${child.club.weekday}` : ''}`}
                      color="primary"
                      variant="outlined"
                    />
                  ) : (
                    <Chip size="small" label="Sem clubinho" variant="outlined" />
                  )}
                </Stack>
              </Box>
            </Stack>
          </Stack>
        )}
      </Box>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {loading ? (
          <Skeleton height={200} />
        ) : !child ? (
          <Alert severity="info">Nenhuma criança selecionada.</Alert>
        ) : (
          <Stack spacing={2}>
            {/* Contatos */}
            <Grid container spacing={1.25}>
              <Grid item xs={12} sm={6}>
                <LineCard icon={<PhoneIphone fontSize="small" />} title="Telefone do Responsável">
                  <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                    {child.guardianPhone ? (
                      <>
                        <Link
                          href={waLink || undefined}
                          target="_blank"
                          underline="hover"
                          sx={{ fontSize: '.95rem' }}
                        >
                          {child.guardianPhone}
                        </Link>
                        <Tooltip title={waLink ? 'Abrir WhatsApp' : 'Sem número'}>
                          <span>
                            <IconButton
                              size="small"
                              color="success"
                              component="a"
                              href={waLink || undefined}
                              target="_blank"
                              disabled={!waLink}
                            >
                              <WhatsApp fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <CopyButton value={child.guardianPhone} title="Copiar telefone" />
                      </>
                    ) : (
                      <Typography variant="body2">—</Typography>
                    )}
                  </Stack>
                </LineCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LineCard icon={<Group fontSize="small" />} title="Responsável">
                  <Typography>{child.guardianName}</Typography>
                </LineCard>
              </Grid>
            </Grid>

            {/* Datas */}
            <Grid container spacing={1.25}>
              <Grid item xs={12} sm={6}>
                <LineCard icon={<Cake fontSize="small" />} title="Nascimento">
                  <Typography>
                    {fmtDate(child.birthDate)} {typeof age === 'number' && `(${age} anos)`}
                  </Typography>
                </LineCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LineCard icon={<PhoneIcon fontSize="small" />} title="No Clubinho desde">
                  <Typography>{fmtDate(child.joinedAt || '')}</Typography>
                </LineCard>
              </Grid>
            </Grid>

            {/* Endereço */}
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Home fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  Endereço
                </Typography>
              </Stack>
              {child.address ? (
                <Grid container spacing={1.25}>
                  <Grid item xs={12} sm={8}>
                    <Typography>
                      {child.address.street} {child.address.number}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography>{child.address.district}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography>
                      {child.address.city}/{child.address.state}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography>{child.address.postalCode}</Typography>
                  </Grid>
                  {child.address.complement && (
                    <Grid item xs={12}>
                      <Typography>{child.address.complement}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1}>
                      {mapsHref && (
                        <Button
                          size="small"
                          component="a"
                          href={mapsHref}
                          target="_blank"
                          startIcon={<Map fontSize="small" />}
                        >
                          Abrir no Maps
                        </Button>
                      )}
                      <CopyButton value={mapsHref} title="Copiar endereço" />
                    </Stack>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2">Nenhum endereço cadastrado.</Typography>
              )}
            </Paper>

            {/* Status */}
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={child.isActive ? 'Ativo' : 'Inativo'}
                    color={child.isActive ? 'success' : 'default'}
                    variant={child.isActive ? 'filled' : 'outlined'}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Status da criança
                  </Typography>
                </Stack>
                {onToggleActive && (
                  <Button
                    variant="outlined"
                    color={child.isActive ? 'warning' : 'success'}
                    startIcon={child.isActive ? <ToggleOff /> : <ToggleOn />}
                    onClick={() => onToggleActive(child)}
                    size="small"
                  >
                    {child.isActive ? 'Desativar' : 'Ativar'}
                  </Button>
                )}
              </Stack>
            </Paper>

            {/* Metadados */}
            <Grid container spacing={1.25}>
              <Grid item xs={12} sm={6}>
                <LineCard icon={<MenuBook fontSize="small" />} title="Criado em">
                  <Typography>{fmtDate(child.createdAt)}</Typography>
                </LineCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LineCard icon={<MenuBook fontSize="small" />} title="Atualizado em">
                  <Typography>{fmtDate(child.updatedAt)}</Typography>
                </LineCard>
              </Grid>
            </Grid>
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          gap: 1,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {child && (
          <Button
            fullWidth={isXs}
            onClick={() => onEdit?.(child.id)}
            variant="outlined"
            color="primary"
          >
            Editar
          </Button>
        )}
        <Button fullWidth={isXs} onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
