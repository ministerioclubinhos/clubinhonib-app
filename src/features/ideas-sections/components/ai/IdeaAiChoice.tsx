import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { IdeaAiDecision, type IdeaAiChoiceProps } from '../../types';
export default function IdeaAiChoice({
  label,
  decision,
  enhanced,
  disabled,
  onChange,
}: IdeaAiChoiceProps) {
  return (
    <ToggleButtonGroup
      data-testid="idea-ai-choice"
      exclusive
      value={decision}
      disabled={disabled}
      aria-label={`Versão para ${label}`}
      onChange={(_event, value: IdeaAiDecision | null) => {
        if (value) onChange(value);
      }}
      size="small"
      /* No celular o par ocupa a linha inteira: dois alvos largos de 44 px. */
      sx={{
        width: { xs: '100%', sm: 'auto' },
        '& button': { minHeight: 44, flex: { xs: 1, sm: 'none' } },
      }}
    >
      <ToggleButton data-testid="idea-ai-choice-original" value={IdeaAiDecision.ORIGINAL}>
        Original
      </ToggleButton>
      <ToggleButton
        data-testid="idea-ai-choice-enhanced"
        value={IdeaAiDecision.ENHANCED}
        disabled={!enhanced}
      >
        Versão IA
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
