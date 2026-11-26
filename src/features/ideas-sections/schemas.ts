import * as yup from 'yup';
import type { IdeaShareFormFields, IdeaShareMaterial } from './types';

export const ideaShareSchema: yup.ObjectSchema<IdeaShareFormFields> = yup.object({
  materials: yup
    .array()
    .of(yup.mixed<IdeaShareMaterial>().required())
    .required()
    .min(1, 'Adicione pelo menos um documento, imagem ou vídeo.')
    .max(20, 'Envie até 20 materiais.'),
  title: yup
    .string()
    .trim()
    .required('Informe o título da ideia.')
    .max(120, 'Use até 120 caracteres.'),
  description: yup
    .string()
    .trim()
    .required('Descreva sua ideia.')
    .max(2000, 'Use até 2000 caracteres.'),
});
