import React from 'react';
import { Typography, useTheme, Fade, Box, Card, CardContent, Icon } from '@mui/material';
import { AboutSection as AboutSectionType } from '../types';

interface AboutSectionProps {
  section: AboutSectionType;
  index: number;
}

const AboutSection: React.FC<AboutSectionProps> = ({ section, index }) => {
  const theme = useTheme();

  // Ícones para cada seção
  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'quem-somos':
        return '👥';
      case 'nossa-historia':
        return '📖';
      case 'missao-visao':
        return '🎯';
      default:
        return '💝';
    }
  };

  // Gradientes para cada card
  const getCardGradient = (sectionId: string) => {
    switch (sectionId) {
      case 'quem-somos':
        return 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 255, 0.8) 100%)';
      case 'nossa-historia':
        return 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 248, 255, 0.75) 100%)';
      case 'missao-visao':
        return 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 242, 255, 0.8) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 255, 0.8) 100%)';
    }
  };

  return (
    <Fade in timeout={800 + index * 200}>
      <Card
        sx={{
          background: getCardGradient(section.id),
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          borderRadius: 4,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 20px 40px rgba(102, 126, 234, 0.15)',
            border: '1px solid rgba(102, 126, 234, 0.4)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: section.isMain
              ? 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)'
              : 'linear-gradient(90deg, #667eea, #764ba2)',
          },
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
          }}
        >
          {/* Ícone */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: { xs: 2, sm: 2.5, md: 3 },
            }}
          >
            <Box
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-10px)' },
                },
              }}
            >
              {getSectionIcon(section.id)}
            </Box>
          </Box>

          {/* Título */}
          <Typography
            variant={section.isMain ? 'h4' : 'h5'}
            component={section.isMain ? 'h1' : 'h2'}
            fontWeight={700}
            textAlign="center"
            sx={{
              color: '#2c3e50',
              fontFamily: "'Poppins', sans-serif",
              fontSize: section.isMain
                ? { xs: '1.4rem', sm: '1.6rem', md: '2.2rem' }
                : { xs: '1.2rem', sm: '1.3rem', md: '1.6rem' },
              mb: { xs: 2, sm: 2.5, md: 3 },
              textShadow: 'none',
              lineHeight: 1.3,
            }}
          >
            {section.title}
          </Typography>

          {/* Conteúdo */}
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
              lineHeight: { xs: 1.5, sm: 1.6, md: 1.7 },
              color: '#5a6c7d',
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {section.content}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default AboutSection;
