import { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
  type PopoverPosition,
} from '@mui/material';
import { FormatColorFill, FormatColorText } from '@mui/icons-material';
import { LessonEditorColorMode, type LessonEditorColorToolsProps } from '../editor.types';
import { LESSON_EDITOR_COLORS } from '../editor.constants';
import { normalizeEditorColor } from '../editor.utils';

export function LessonEditorColorTools({
  editor,
  onOpenTool,
  mode = LessonEditorColorMode.TEXT,
}: LessonEditorColorToolsProps) {
  const highlight = mode === LessonEditorColorMode.HIGHLIGHT;
  const title = highlight ? 'Destaque / marcador de texto' : 'Cor da fonte';
  const [anchor, setAnchor] = useState<PopoverPosition | null>(null);
  const [customColor, setCustomColor] = useState(LESSON_EDITOR_COLORS[0]);
  const [error, setError] = useState(false);
  const applyColor = (value: string) => {
    const color = normalizeEditorColor(value);
    if (!color) {
      setError(true);
      return;
    }
    if (highlight) editor.chain().focus().setHighlight({ color }).run();
    else editor.chain().focus().setColor(color).run();
    setAnchor(null);
  };
  return (
    <Box data-testid={`ai-lesson-editor-${mode}-tools`} sx={{ display: 'contents' }}>
      <Tooltip title={title}>
        <IconButton
          data-testid={`ai-lesson-editor-${mode}`}
          aria-label={title}
          onClick={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            onOpenTool?.();
            const current: unknown = editor.getAttributes(
              highlight ? 'highlight' : 'textStyle'
            ).color;
            setCustomColor(
              typeof current === 'string'
                ? (normalizeEditorColor(current) ?? LESSON_EDITOR_COLORS[0])
                : LESSON_EDITOR_COLORS[0]
            );
            setError(false);
            setAnchor({ top: bounds.bottom, left: bounds.left });
          }}
        >
          {highlight ? <FormatColorFill /> : <FormatColorText />}
        </IconButton>
      </Tooltip>
      <Popover
        data-testid={`ai-lesson-editor-${mode}-palette`}
        open={Boolean(anchor)}
        anchorReference="anchorPosition"
        anchorPosition={anchor ?? undefined}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Stack
          role="dialog"
          aria-label={title}
          spacing={1.5}
          sx={{ p: 1.5, width: 264, maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box' }}
        >
          <Typography fontWeight={700}>{title}</Typography>
          <Box
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(44px, 1fr))', gap: 0.5 }}
          >
            {LESSON_EDITOR_COLORS.map((color) => (
              <Tooltip key={color} title={color}>
                <IconButton
                  data-testid={`ai-lesson-editor-${mode}-${color.slice(1).toLowerCase()}`}
                  aria-label={`Cor ${color}`}
                  onClick={() => applyColor(color)}
                  sx={{ minWidth: 44, minHeight: 44 }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: color,
                      border: '1px solid',
                      borderColor: 'grey.400',
                      borderRadius: 0.5,
                    }}
                  />
                </IconButton>
              </Tooltip>
            ))}
          </Box>
          <TextField
            data-testid={`ai-lesson-editor-custom-${mode}-picker`}
            label="Cor personalizada"
            type="color"
            value={normalizeEditorColor(customColor) ?? LESSON_EDITOR_COLORS[0]}
            onChange={(event) => {
              setCustomColor(event.target.value);
              setError(false);
            }}
            fullWidth
          />
          <TextField
            data-testid={`ai-lesson-editor-custom-${mode}-hex`}
            label="Código hexadecimal"
            value={customColor}
            onChange={(event) => {
              setCustomColor(event.target.value);
              setError(false);
            }}
            error={error}
            helperText={error ? 'Use uma cor como #7C3AED.' : undefined}
            fullWidth
          />
          <Button
            data-testid={`ai-lesson-editor-custom-${mode}-apply`}
            variant="contained"
            sx={{ minHeight: 44 }}
            onClick={() => applyColor(customColor)}
          >
            Aplicar cor
          </Button>
          <Button
            sx={{ minHeight: 44 }}
            onClick={() => {
              if (highlight) editor.chain().focus().unsetHighlight().run();
              else editor.chain().focus().unsetColor().run();
              setAnchor(null);
            }}
          >
            {highlight ? 'Remover destaque' : 'Cor padrão'}
          </Button>
        </Stack>
      </Popover>
    </Box>
  );
}
