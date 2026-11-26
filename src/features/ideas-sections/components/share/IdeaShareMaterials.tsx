import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { IdeaMaterialKind, type IdeaShareMaterialsProps } from '../../types';
export default function IdeaShareMaterials({
  materials,
  removed,
  disabled,
  onRemove,
  onUndo,
}: IdeaShareMaterialsProps) {
  return (
    <Box data-testid="idea-share-materials">
      <Stack
        aria-live="polite"
        aria-relevant="additions removals"
        spacing={2}
        data-testid="idea-share-materials-list"
      >
        {materials.length === 0 ? (
          <Typography color="text.secondary">
            Nenhum material adicionado. Envie pelo menos um para continuar.
          </Typography>
        ) : (
          (
            [IdeaMaterialKind.DOCUMENT, IdeaMaterialKind.IMAGE, IdeaMaterialKind.VIDEO] as const
          ).map((kind) => {
            const grouped = materials.filter((item) => item.kind === kind);
            if (!grouped.length) return null;
            const label =
              kind === IdeaMaterialKind.DOCUMENT
                ? 'Documentos'
                : kind === IdeaMaterialKind.IMAGE
                  ? 'Fotos'
                  : 'Vídeos';
            return (
              <Box key={kind}>
                <Typography variant="subtitle1" component="h3">
                  {label} ({grouped.length})
                </Typography>
                <Stack spacing={1}>
                  {grouped.map((item) => (
                    <Card variant="outlined" key={item.id} data-testid="idea-share-material-item">
                      <CardContent
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          /*
                           * No celular a miniatura e o botão espremiam o nome
                           * do arquivo; com `wrap`, o botão desce em vez de
                           * roubar a largura do nome.
                           */
                          flexWrap: 'wrap',
                          rowGap: 1,
                          gap: 2,
                          py: '12px !important',
                        }}
                      >
                        {item.previewUrl && item.kind === IdeaMaterialKind.IMAGE && (
                          <Box
                            component="img"
                            src={item.previewUrl}
                            alt={item.name}
                            sx={{
                              width: 64,
                              height: 64,
                              objectFit: 'cover',
                              borderRadius: 1,
                            }}
                          />
                        )}
                        {item.previewUrl && item.kind === IdeaMaterialKind.VIDEO && (
                          <Box
                            component="video"
                            src={item.previewUrl}
                            controls
                            aria-label={`Prévia de ${item.name}`}
                            data-testid="idea-share-material-preview"
                            sx={{ width: 96, maxHeight: 64 }}
                          />
                        )}
                        {item.url && (
                          <Button
                            component="a"
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            data-testid="idea-share-youtube-preview"
                            aria-label={`Assistir prévia de ${item.name}`}
                          >
                            Prévia
                          </Button>
                        )}
                        <Box sx={{ flex: '1 1 140px', minWidth: 0 }}>
                          <Typography sx={{ overflowWrap: 'anywhere' }}>{item.name}</Typography>
                          {item.file && (
                            <Typography variant="body2" noWrap color="text.secondary">
                              {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                            </Typography>
                          )}
                        </Box>
                        <Button
                          type="button"
                          data-testid="idea-share-material-remove"
                          aria-label={`Remover ${item.name}`}
                          onClick={() => onRemove(item)}
                          disabled={disabled}
                          sx={{ minHeight: 44, ml: 'auto', flexShrink: 0, textTransform: 'none' }}
                        >
                          Remover
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            );
          })
        )}
      </Stack>
      {removed && (
        <Alert
          severity="info"
          action={
            <Button
              type="button"
              data-testid="idea-share-material-undo"
              onClick={onUndo}
              disabled={disabled}
              sx={{ minHeight: 44 }}
            >
              Desfazer
            </Button>
          }
        >
          {removed.name} removido.
        </Alert>
      )}
    </Box>
  );
}
