import * as Yup from 'yup';

export const contactFormSchema = Yup.object().shape({
  name: Yup.string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .matches(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  email: Yup.string().required('Email é obrigatório').email('Email inválido'),
  telefone: Yup.string()
    .required('Telefone é obrigatório')
    .test('valid-phone', 'Telefone inválido (ex.: (11) 91234-5678)', (val) => {
      const digits = val?.replace(/\D/g, '');
      return digits?.length === 10 || digits?.length === 11;
    }),
  mensagem: Yup.string()
    .required('Mensagem é obrigatória')
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});
