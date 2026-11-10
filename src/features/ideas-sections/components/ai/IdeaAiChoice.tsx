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
      sx={{ '& button': { minHeight: 44 } }}
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
