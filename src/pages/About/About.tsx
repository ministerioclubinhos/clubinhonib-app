import React from 'react';
import { Box, Typography, useTheme, Paper } from '@mui/material';

const About: React.FC = () => {
  const theme = useTheme();

  const Section: React.FC<{
    title: string;
    content: string;
    isMain?: boolean;
  }> = ({ title, content, isMain = false }) => (
    <section style={{ marginBottom: '3rem' }}>
      <Typography
        variant={isMain ? 'h2' : 'h5'}
        component={isMain ? 'h1' : 'h2'}
        fontWeight={isMain ? 800 : 600}
        gutterBottom
        textAlign="center"
        sx={{
          color: isMain
            ? theme.palette.primary.main
            : theme.palette.secondary.main,
          fontFamily: "'Poppins', sans-serif",
          fontSize: isMain
            ? { xs: '2rem', sm: '2.8rem', md: '3.5rem' }
            : { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontSize: { xs: '1rem', sm: '1.1rem' },
          lineHeight: 1.8,
          color: theme.palette.text.secondary,
          textAlign: 'center',
        }}
      >
        {content}
      </Typography>
    </section>
  );

  return (
    <Box
      component="main"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="calc(100vh - 128px)"
      px={{ xs: 2, sm: 3, md: 4 }}
      mt={{ xs: 7, md: 5 }}
      sx={{
        background: 'linear-gradient(135deg, white 0%, #007bff 100%)',
        fontFamily: "'Roboto', sans-serif",
        width: '100%',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          my: { xs: 4, md: 6 },
          width: '100%',
          maxWidth: 960,
          borderRadius: 3,
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'translateY(-6px)',
          },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        role="region"
        aria-label="Sobre o Clubinho NIB"
      >
        <Section
          title="Quem Somos"
          content="O Ministério de Clubinho Bíblico é um programa evangelístico infantil, composto por pessoas que decidiram fazer de Jesus o Senhor de suas vidas, com metodologia e ensinamentos que nasceram na, estes servos do Senhor Jesus, formam uma equipe de professores que detém um vasto conhecimento no ensino voltado para evangelismo infantil, que de maneira singular estão espalhados em escolas, abrigos, praças e principalmente nas residências dos membros da Nova Igreja Batista."
          isMain
        />

        <Section
          title="Nossa História"
          content="Com mais de 20 anos de Programa Evangelístico Infantil, o Ministério de Clubinho teve os seus primeiros passos na Nova Igreja Batista Tabernáculo e agora na coordenação da Nova Igreja Batista da Torquato Tapajós, tem inovado de forma gradual a forma de levar a Palavra de Deus para as crianças que não tem acesso às igrejas e os ensinamentos da Bíblia."
        />

        <Section
          title="Missão e Visão"
          content="Nosso objetivo tem como finalidade anunciar o Evangelho para as crianças nos diversos bairros da cidade de Manaus e regiões, ensinando a Palavra de Deus de uma maneira alegre, dinâmica e criativa, garantindo que esta criança, possa desfrutar de um ambiente acolhedor e com princípios bíblicos. Contribuindo em parceria com os pais e responsáveis para que além do ensino baseado na vida de Jesus, juntos possamos formar cidadãos conscientes de valores morais e éticos."
        />
      </Paper>
    </Box>
  );
};

export default About;
