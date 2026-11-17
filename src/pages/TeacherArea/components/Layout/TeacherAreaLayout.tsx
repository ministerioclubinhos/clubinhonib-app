import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import UnsavedChangesDialog from '@/components/common/modal/UnsavedChangesDialog';
import { hasUnsavedChanges } from '@/utils/unsavedChanges';
import { CONTAINER_STYLES } from '../../constants';
import TeacherAreaHeader from './TeacherAreaHeader';
import TeacherAreaSidebar from './TeacherAreaSidebar';

const TeacherAreaLayout: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const handleNavigate = useCallback(
    (to: string) => {
      if (hasUnsavedChanges()) {
        setPendingPath(to);
        return;
      }
      navigate(to);
    },
    [navigate]
  );

  return (
    <Box sx={{ bgcolor: '#f4f6f9', minHeight: '100vh', width: '100%' }}>
      <Container
        data-testid="teacher-area"
        maxWidth={false}
        disableGutters
        sx={CONTAINER_STYLES.main}
      >
        {/* Cabeçalho fixo compartilhado entre todas as subpáginas da Área do Professor */}
        <TeacherAreaHeader />

        {/* Corpo Mobile-First: Barra de subpáginas no mobile / Sidebar + Conteúdo no desktop */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'stretch',
            gap: { xs: 0, md: 2.5 },
            width: '100%',
          }}
        >
          <TeacherAreaSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
            onNavigate={handleNavigate}
          />

          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              width: '100%',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Container>

      <UnsavedChangesDialog
        open={pendingPath !== null}
        onStay={() => setPendingPath(null)}
        onLeave={() => {
          const target = pendingPath;
          setPendingPath(null);
          if (target) navigate(target);
        }}
      />
    </Box>
  );
};

export default TeacherAreaLayout;
