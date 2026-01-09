import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container } from '@mui/material';
import {
  IdeasSectionAdminEditor,
  IdeasSectionUserCreator,
} from '@/components/Adm/PageCreator/Templates/IdeasSectionEditor';
import { RootState } from '@/store/slices';

export default function IdeasSectionPage() {
  const location = useLocation();

  const ideasSectionData = useSelector((state: RootState) => state.ideas.ideasSectionData);
  const actualEditMode = !!ideasSectionData;

  const isPublicCreation = location.pathname === '/compartilhar-ideia';

  useEffect(() => {
    if (isPublicCreation) {
      document.title = 'Compartilhar Ideia Incrível';
    } else {
      document.title = actualEditMode ? 'Editar Seção de Ideias' : 'Criar Seção de Ideias';
    }
  }, [actualEditMode, isPublicCreation]);

  if (isPublicCreation) {
    return <IdeasSectionUserCreator />;
  }

  return (
    <Container sx={{ mt: 0, mb: 0, minWidth: '100%' }}>
      <IdeasSectionAdminEditor existingSection={ideasSectionData || undefined} />
    </Container>
  );
}
