import { Stack, TextField } from '@mui/material';

import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import { IDEA_REVIEW_MAX_DESCRIPTION, IDEA_REVIEW_MAX_TITLE } from '../../constants';

interface IdeasSectionReviewFieldsProps {
  title: string;
  description: string;
  /** Marca os erros só depois da primeira tentativa de publicar. */
  submitted: boolean;
  disabled?: boolean;
  onChange: (patch: { title?: string; description?: string }) => void;
}

/**
 * Título e descrição que irão para a publicação.
 *
 * Só aparece quando não há versão da IA para comparar: com uma comparação em
 * tela, quem decide o texto é a escolha feita lá, e dois lugares para o mesmo
 * texto era a maior fonte de confusão da revisão.
 */
export default function IdeasSectionReviewFields({
  title,
  description,
  submitted,
  disabled = false,
  onChange,
}: IdeasSectionReviewFieldsProps) {
  return (
    <Stack spacing={2.5}>
      <TextField
        label="Título da ideia"
        value={title}
        fullWidth
        disabled={disabled}
        inputProps={{
          maxLength: IDEA_REVIEW_MAX_TITLE,
          'data-testid': 'ideas-section-review-title',
        }}
        onChange={(event) => onChange({ title: event.target.value })}
        error={submitted && !title.trim()}
        helperText={
          submitted && !title.trim()
            ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD
            : `${title.length}/${IDEA_REVIEW_MAX_TITLE}`
        }
      />
      <TextField
        label="Descrição da ideia"
        value={description}
        fullWidth
        multiline
        minRows={5}
        disabled={disabled}
        inputProps={{
          maxLength: IDEA_REVIEW_MAX_DESCRIPTION,
          'data-testid': 'ideas-section-review-description',
        }}
        onChange={(event) => onChange({ description: event.target.value })}
        helperText={`${description.length}/${IDEA_REVIEW_MAX_DESCRIPTION}`}
      />
    </Stack>
  );
}
