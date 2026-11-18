import React from 'react';
import { AboutLayout, AboutSection } from './components';
import { ABOUT_SECTIONS } from './constants';

const About: React.FC = () => {
  return (
    <AboutLayout data-testid="about">
      {ABOUT_SECTIONS.map((section, index) => (
        <AboutSection
          key={section.id}
          section={section}
          index={index}
        />
      ))}
    </AboutLayout>
  );
};

export default About;
