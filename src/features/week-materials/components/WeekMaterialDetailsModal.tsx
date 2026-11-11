import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Grid2,
  IconButton,
  Link,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import { MediaType } from '@/store/slices/types';
import { anchorProps } from '@/utils/textUtils';

import { EMPTY_VALUE, weekMaterialEditPath } from '../constants';
import type { WeekMaterialMediaResponse, WeekMaterialResponse } from '../types';
import { countMediaOf, formatDate, mediaGroupsOf, mediaSourceLabel, cleanMaterialDescription } from '../utils';

interface WeekMaterialDetailsModalProps {
  material: WeekMaterialResponse | null;
  open: boolean;
  /** A página ainda está sendo carregada: o conteúdo entra como esqueleto. */
  loading?: boolean;
  onClose: () => void;
  deletable?: boolean;
  onDelete?: () => Promise<void>;
}

/** Ícone de cada tipo de mídia, o mesmo do card da listagem. */
const MEDIA_TYPE_ICON: Record<MediaType, ReactNode> = {
  [MediaType.VIDEO]: <VideocamOutlinedIcon fontSize="small" />,
  [MediaType.DOCUMENT]: <DescriptionOutlinedIcon fontSize="small" />,
  [MediaType.IMAGE]: <ImageOutlinedIcon fontSize="small" />,
  [MediaType.AUDIO]: <AudiotrackOutlinedIcon fontSize="small" />,
};

/** Alvo mínimo de toque exigido pelas telas do painel. */
const TOUCH_TARGET = 44;

/** Um dado da página, rotulado. */
function DetailCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Paper data-testid="week-materials-week-material-detail-card" variant="outlined" sx={{ p: 1.25, borderRadius: 2, height: '100%' }}>
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={0.75} alignItems="center" color="text.secondary">
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

/**
 * Uma mídia da página.
 *
 * O endereço não é mostrado: para um arquivo enviado ele é a URL do objeto no
 * S3, longa e sem serventia para quem administra. O que fica é o que a pessoa
 * usa — abrir e copiar o link —, com o tipo e o peso ao lado do título.
 */
function MediaRow({
  item,
  onCopy,
}: {
  item: WeekMaterialMediaResponse;
  onCopy: (url: string) => void;
}) {
  const title = item.title || EMPTY_VALUE;

  return (
    <Paper data-testid={`week-materials-week-material-media-${item.id}`} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ color: 'text.secondary', mt: 0.25 }}>{MEDIA_TYPE_ICON[item.mediaType]}</Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700} title={title} sx={{ wordBreak: 'break-word' }}>
            {title}
          </Typography>

          {item.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {item.description}
            </Typography>
          )}

          <Chip size="small" variant="outlined" label={mediaSourceLabel(item)} sx={{ mt: 0.75 }} />
        </Box>

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Abrir">
            {/* O `span` mantém a dica quando a mídia não tem endereço. */}
            <span>
              <IconButton
                aria-label={`Abrir ${title}`}
                disabled={!item.url}
                sx={{ width: TOUCH_TARGET, height: TOUCH_TARGET }}
                {...anchorProps(item.url)}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Copiar link">
            <span>
              <IconButton
                aria-label={`Copiar link de ${title}`}
                disabled={!item.url}
                onClick={() => onCopy(item.url)}
                sx={{ width: TOUCH_TARGET, height: TOUCH_TARGET }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}

/**
 * Detalhes de uma página de materiais semanais.
 *
 * As mídias ficam em abas por tipo, e só aparecem as abas que têm conteúdo: a
 * versão anterior empilhava todos os vídeos, documentos, imagens e áudios um
 * abaixo do outro, e uma página cheia virava uma rolagem sem fim onde nada era
 * encontrável.
 */
export default function WeekMaterialDetailsModal({
  material,
  open,
  loading = false,
  onClose,
  deletable = false,
  onDelete,
}: WeekMaterialDetailsModalProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState('');

  const groups = mediaGroupsOf(material);
  const totalMedia = countMediaOf(material);
  const routePath = material?.route?.path ?? '';

  // Cada página tem seu conjunto de abas: a aba escolhida na anterior pode nem
  // existir nesta.
  useEffect(() => setActiveTab(0), [material?.id]);
  const currentGroup = groups[activeTab] ?? groups[0];

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyFeedback('Link copiado.');
    } catch {
      setCopyFeedback('Não foi possível copiar o link.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      await onDelete();
      setConfirmOpen(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog data-testid="week-materials-week-material-details-modal"
        open={open}
        onClose={isDeleting ? undefined : onClose}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
        aria-labelledby="week-material-details-title"
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            pt: { xs: 2, sm: 3 },
            pb: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <EventNoteOutlinedIcon fontSize="small" />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Detalhes do material semanal
              </Typography>

              {loading ? (
                <Skeleton variant="text" width="60%" height={32} />
              ) : (
                <Typography
                  id="week-material-details-title"
                  variant="h6"
                  fontWeight={800}
                  sx={{ wordBreak: 'break-word' }}
                >
                  {material?.title || EMPTY_VALUE}
                </Typography>
              )}

              {material?.subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {material.subtitle}
                </Typography>
              )}

              {material && (
                <Stack direction="row" spacing={0.75} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  {material.currentWeek && (
                    <Chip size="small" color="success" label="Material da semana" />
                  )}
                  {!routePath && <Chip size="small" color="error" variant="outlined" label="Sem rota" />}
                  <Chip
                    size="small"
                    variant="outlined"
                    label={
                      totalMedia === 0
                        ? 'Sem material'
                        : `${totalMedia} ${totalMedia === 1 ? 'material' : 'materiais'}`
                    }
                    color={totalMedia === 0 ? 'warning' : 'default'}
                  />
                </Stack>
              )}
            </Box>

            <IconButton
              onClick={onClose}
              disabled={isDeleting}
              aria-label="Fechar"
              sx={{ width: TOUCH_TARGET, height: TOUCH_TARGET }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          {loading && (
            <Stack spacing={1.5} data-testid="week-materials-week-material-details-loading">
              <Skeleton variant="rounded" height={72} />
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={120} />
            </Stack>
          )}

          {!loading && material && (
            <Stack spacing={2}>
              {material.description && (
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Descrição
                  </Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{cleanMaterialDescription(material.description)}</Typography>
                </Paper>
              )}

              <Grid2 container spacing={1.25}>
                {/* Datas lado a lado mesmo no celular: são curtas, e empilhá-las
                    empurrava as mídias — o que se veio ver — para fora da tela. */}
                <Grid2 size={6}>
                  <DetailCard icon={<AccessTimeOutlinedIcon fontSize="small" />} title="Criada em">
                    <Typography>{formatDate(material.createdAt)}</Typography>
                  </DetailCard>
                </Grid2>

                <Grid2 size={6}>
                  <DetailCard icon={<AccessTimeOutlinedIcon fontSize="small" />} title="Atualizada em">
                    <Typography>{formatDate(material.updatedAt)}</Typography>
                  </DetailCard>
                </Grid2>

                <Grid2 size={12}>
                  <DetailCard icon={<LinkOutlinedIcon fontSize="small" />} title="Endereço público">
                    {routePath ? (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {/* O caminho é longo e não precisa ser lido inteiro: quem
                            quer o endereço usa o botão de copiar ao lado. */}
                        <Link
                          href={`/${routePath}`}
                          underline="hover"
                          noWrap
                          title={`/${routePath}`}
                          sx={{ flex: 1, minWidth: 0 }}
                        >
                          /{routePath}
                        </Link>
                        <Tooltip title="Copiar endereço">
                          <IconButton
                            aria-label="Copiar endereço público"
                            onClick={() => handleCopy(`${window.location.origin}/${routePath}`)}
                            sx={{ width: TOUCH_TARGET, height: TOUCH_TARGET, flexShrink: 0 }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Typography variant="body2">
                        A página não tem rota e não abre no site.
                      </Typography>
                    )}
                  </DetailCard>
                </Grid2>
              </Grid2>

              {groups.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{ p: 3, borderRadius: 2, textAlign: 'center', borderStyle: 'dashed' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Nenhum material nesta página. Adicione vídeos, documentos, imagens ou áudios pela
                    edição.
                  </Typography>
                </Paper>
              ) : (
                <Box>
                  <Tabs
                    value={currentGroup ? groups.indexOf(currentGroup) : 0}
                    onChange={(_event, value: number) => setActiveTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                  >
                    {groups.map((group) => (
                      <Tab
                        key={group.mediaType}
                        label={`${group.label}: ${group.items.length}`}
                        sx={{ minHeight: TOUCH_TARGET, textTransform: 'none' }}
                      />
                    ))}
                  </Tabs>

                  <Stack spacing={1.25} sx={{ mt: 2 }}>
                    {currentGroup?.items.map((item) => (
                      <MediaRow key={item.id} item={item} onCopy={handleCopy} />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: { xs: 1.5, sm: 2 },
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: deletable ? 'space-between' : 'flex-end',
          }}
        >
          {deletable && (
            <Button
              type="button"
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => setConfirmOpen(true)}
              disabled={!material || isDeleting}
              fullWidth={isMobile}
              sx={{ minHeight: TOUCH_TARGET, textTransform: 'none' }}
            >
              Excluir
            </Button>
          )}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              sx={{ minHeight: TOUCH_TARGET, textTransform: 'none' }}
            >
              Fechar
            </Button>

            <Button
              type="button"
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              onClick={() => material && navigate(weekMaterialEditPath(material.id))}
              disabled={!material || isDeleting}
              sx={{ minHeight: TOUCH_TARGET, textTransform: 'none' }}
            >
              Editar
            </Button>

            <Tooltip title={routePath ? '' : 'A página não tem rota'}>
              <span>
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<OpenInNewIcon />}
                  onClick={() => navigate(`/${routePath}`)}
                  disabled={!routePath || isDeleting}
                  fullWidth={isMobile}
                  sx={{ minHeight: TOUCH_TARGET, textTransform: 'none' }}
                >
                  Abrir página
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </DialogActions>

        <Snackbar
          open={Boolean(copyFeedback)}
          autoHideDuration={2500}
          onClose={() => setCopyFeedback('')}
          message={copyFeedback}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Dialog>

      <DeleteConfirmDialog data-testid="week-materials-week-material-delete-dialog"
        open={confirmOpen}
        title={material?.title}
        onClose={() => !isDeleting && setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
}
