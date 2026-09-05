import React from 'react';
import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import type { CommentData } from '@/store/slices/comment/commentsSlice';

type Props = {
  /** `null` enquanto nenhum comentário foi aberto. */
  comment: CommentData | null;
  onClose: () => void;
};

/**
 * O comentário aberto por inteiro.
 *
 * Saiu de `CommentsSection`, que reunia o carrossel, o formulário e este
 * diálogo num arquivo de 744 linhas.
 */
export default function CommentDetailDialog({ comment, onClose }: Props) {
  const theme = useTheme();

  return (
      <Dialog
        open={!!comment}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
            m: { xs: 2, md: 4 },
          },
        }}
      >
        {comment && (
          <DialogContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  mr: 2,
                  width: { xs: 44, md: 52 },
                  height: { xs: 44, md: 52 },
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                }}
              >
                {comment.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="primary.main"
                  sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.3 }}
                >
                  {comment.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.72rem', md: '0.78rem' } }}
                >
                  {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
              <IconButton
                aria-label="Fechar comentário"
                onClick={onClose}
                sx={{ color: 'text.secondary' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Paper
              elevation={1}
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                mb: 2,
                maxHeight: '55vh',
                overflowY: 'auto',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  lineHeight: 1.7,
                  color: 'text.primary',
                  fontStyle: 'italic',
                  whiteSpace: 'pre-line',
                }}
              >
                “{comment.comment}”
              </Typography>
            </Paper>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<HomeIcon />}
                label={comment.clubinho}
                size="small"
                sx={{
                  bgcolor: 'primary.light',
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                }}
              />
              <Chip
                icon={<LocationOnIcon />}
                label={comment.neighborhood}
                size="small"
                sx={{
                  bgcolor: 'secondary.light',
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                }}
              />
            </Stack>
          </DialogContent>
        )}
      </Dialog>
  );
}
