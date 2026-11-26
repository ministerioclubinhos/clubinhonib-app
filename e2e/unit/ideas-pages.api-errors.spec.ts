import { expect, test } from '@playwright/test';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { sectionApiErrorsFrom } from '@/features/ideas-pages/utils';

const apiError = (details: unknown): AxiosError =>
  new AxiosError('falha', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 422,
    statusText: 'Unprocessable',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
    data: {
      success: false,
      error: { code: 'VAL_4002', message: 'Erro', details, timestamp: '', path: '' },
    },
  } as AxiosResponse);

test('agrupa os erros da API pelo índice da seção e ignora duplicados', () => {
  const error = apiError({
    fieldErrors: [
      { field: 'sections.1.medias.0.mediaType', message: 'Tipo inválido.' },
      { field: 'sections.1.title', message: 'Informe o título.' },
      { field: 'sections.1.title', message: 'Informe o título.' },
      { field: 'sections.0.medias.2.url', message: 'URL inválida.' },
      { field: 'title', message: 'Erro da página' },
    ],
  });
  expect(sectionApiErrorsFrom(error)).toEqual({
    0: ['URL inválida.'],
    1: ['Tipo inválido.', 'Informe o título.'],
  });
});

test('devolve vazio sem fieldErrors válidos ou para erros que não são da API', () => {
  expect(sectionApiErrorsFrom(apiError(undefined))).toEqual({});
  expect(sectionApiErrorsFrom(apiError({ fieldErrors: [{ field: 1 }, null] }))).toEqual({});
  expect(sectionApiErrorsFrom(new Error('x'))).toEqual({});
});
