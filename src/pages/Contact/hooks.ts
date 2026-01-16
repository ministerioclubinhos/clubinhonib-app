import { useState } from 'react';
import api from '@/config/axiosConfig';
import { ContactFormData } from './types';
import { extractPhoneDigits } from '@/components/common/inputs';

export const useContactForm = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    setGlobalError(null);
    try {
      await api.post('/contact', {
        name: data.name,
        email: data.email,
        phone: extractPhoneDigits(data.telefone),
        message: data.mensagem,
      });
      setSubmitted(true);
    } catch (error) {
      setGlobalError('Erro ao enviar a mensagem. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submitted,
    globalError,
    onSubmit,
  };
};
