import React from 'react';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import UnsavedChangesDialog from '@/components/common/modal/UnsavedChangesDialog';
import { useLessonDraft } from '@/hooks/api/useAiLessons';
import { LessonReviewWorkspace } from '@/features/ai-lessons/components/review/LessonReviewWorkspace';
import { STUDIO_ROUTES } from '@/features/ai-lessons/presentation.constants';
import { useReviewFeedback } from '@/features/ai-lessons/useReviewFeedback';
import { useStudioUnsavedChanges } from '@/features/ai-lessons/useStudioUnsavedChanges';

export const LessonReviewDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: lesson, isLoading, error, refetch } = useLessonDraft(id);
  // Owned here so the unsaved-notes guard also covers the loading and error states.
  const notes = useReviewFeedback(id);
  const leave = useStudioUnsavedChanges(notes.hasUnsent);
  const backToList = () => leave.requestLeave(() => navigate(STUDIO_ROUTES.review));

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <Box
        data-testid="ai-lesson-review-loading"
        role="status"
        sx={{ display: 'flex', justifyContent: 'center', py: 10 }}
      >
        <CircularProgress aria-label="Carregando a lição para revisão" />
      </Box>
    );
  } else if (error || !lesson) {
    content = (
      <Box data-testid="ai-lesson-review-error" sx={{ width: { xs: '98%', md: '95%' }, mx: 'auto', py: 4 }}>
        <Alert severity="error">Não foi possível carregar a lição para revisão.</Alert>
        <Button startIcon={<ArrowBack />} onClick={backToList} sx={{ mt: 2, minHeight: 44 }}>
          Voltar para Revisão
        </Button>
      </Box>
    );
  } else {
    // Keyed by lesson: switching lessons starts with a clean notice and acknowledged versions.
    content = (
      <LessonReviewWorkspace
        key={lesson.id}
        lesson={lesson}
        refetch={refetch}
        notes={notes}
        onBack={backToList}
      />
    );
  }

  return (
    <>
      {content}
      <UnsavedChangesDialog {...leave.dialog} />
    </>
  );
};
