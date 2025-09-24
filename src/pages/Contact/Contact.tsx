import React from 'react';
import { ContactLayout, ContactForm } from './components';
import { useContactForm } from './hooks';

const Contact: React.FC = () => {
  const { loading, submitted, globalError, onSubmit } = useContactForm();

  return (
    <ContactLayout>
      <ContactForm
        onSubmit={onSubmit}
        loading={loading}
        submitted={submitted}
        globalError={globalError}
      />
    </ContactLayout>
  );
};

export default Contact;
