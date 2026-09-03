import { describe, expect, it } from 'vitest';

import { UserRole } from '@/types/shared';

import { FEATURE_FLAG_AUDIENCE_OPTIONS } from './constants';
import type { FeatureFlagAudience, FeatureFlagResponse } from './types';
import {
  audienceInfo,
  audienceOfRoles,
  flagInitials,
  formatDate,
  hasErrors,
  isKeyUsedByApp,
  isValidMetadataJson,
  parseMetadataJson,
  parseSortOption,
  rolesOfAudience,
  toCreateRequest,
  toFormValues,
  toUpdateRequest,
  validateForm,
} from './utils';

const buildFlag = (
  overrides: Partial<FeatureFlagResponse> = {},
): FeatureFlagResponse => ({
  id: 'flag-1',
  key: 'statistics',
  name: 'Estatísticas',
  description: 'Painel de métricas',
  enabled: true,
  targetRoles: [UserRole.ADMIN, UserRole.COORDINATOR],
  audience: 'ADMIN_COORDINATOR',
  metadata: null,
  createdAt: '2026-01-10T12:00:00.000Z',
  updatedAt: '2026-01-11T12:00:00.000Z',
  ...overrides,
});

const values = (overrides = {}) => ({
  key: 'nova_flag',
  name: 'Flag nova',
  description: 'Descrição',
  enabled: true,
  audience: 'COORDINATOR_TEACHER' as FeatureFlagAudience,
  metadataJson: '',
  ...overrides,
});

describe('combinações de público', () => {
  it('oferece as oito combinações na tela', () => {
    expect(FEATURE_FLAG_AUDIENCE_OPTIONS.map((option) => option.value)).toEqual([
      'EVERYONE',
      'ALL_ROLES',
      'ADMIN',
      'COORDINATOR',
      'TEACHER',
      'ADMIN_COORDINATOR',
      'ADMIN_TEACHER',
      'COORDINATOR_TEACHER',
    ]);
  });

  it('traduz cada combinação nos perfis que a API grava', () => {
    expect(rolesOfAudience('EVERYONE')).toEqual([]);
    expect(rolesOfAudience('ADMIN')).toEqual([UserRole.ADMIN]);
    expect(rolesOfAudience('COORDINATOR_TEACHER')).toEqual([
      UserRole.COORDINATOR,
      UserRole.TEACHER,
    ]);
    expect(rolesOfAudience('ALL_ROLES')).toEqual([
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.TEACHER,
    ]);
  });

  it('volta dos perfis para a combinação, em qualquer ordem', () => {
    expect(audienceOfRoles([UserRole.TEACHER, UserRole.ADMIN])).toBe(
      'ADMIN_TEACHER',
    );
    expect(audienceOfRoles([])).toBe('EVERYONE');
  });

  it('separa "para todos" de "todos os perfis"', () => {
    // Sem perfil alvo a flag alcança o visitante; com os três, ela exige
    // sessão. São públicos diferentes, e a tela precisa dizer qual é qual.
    expect(rolesOfAudience('EVERYONE')).toHaveLength(0);
    expect(rolesOfAudience('ALL_ROLES')).toHaveLength(3);
    expect(audienceInfo('EVERYONE').label).not.toBe(
      audienceInfo('ALL_ROLES').label,
    );
  });
});

describe('contrato de /feature-flags', () => {
  it('lê a flag no formato do formulário', () => {
    const form = toFormValues(buildFlag());

    expect(form).toEqual({
      key: 'statistics',
      name: 'Estatísticas',
      description: 'Painel de métricas',
      enabled: true,
      audience: 'ADMIN_COORDINATOR',
      metadataJson: '',
    });
  });

  it('aceita descrição nula e metadata preenchida', () => {
    const form = toFormValues(
      buildFlag({ description: null, metadata: { rollout: 50 } }),
    );

    expect(form.description).toBe('');
    expect(JSON.parse(form.metadataJson)).toEqual({ rollout: 50 });
  });

  it('nasce desligada e para todos quando é criação', () => {
    const form = toFormValues(null);

    expect(form.enabled).toBe(false);
    expect(form.audience).toBe('EVERYONE');
  });

  it('envia os perfis da combinação escolhida', () => {
    const payload = toCreateRequest(values());

    expect(payload.targetRoles).toEqual([
      UserRole.COORDINATOR,
      UserRole.TEACHER,
    ]);
    expect(payload.key).toBe('nova_flag');
  });

  it('manda a chave na edição, que também é editável', () => {
    const payload = toUpdateRequest(values({ key: '  Nova_Chave  ' }));

    expect(payload.key).toBe('nova_chave');
    expect(payload.targetRoles).toEqual([
      UserRole.COORDINATOR,
      UserRole.TEACHER,
    ]);
  });

  it('reconhece as chaves que a aplicação procura', () => {
    // É o que permite avisar antes de renomear uma flag em uso.
    expect(isKeyUsedByApp('statistics')).toBe(true);
    expect(isKeyUsedByApp('children_area')).toBe(true);
    expect(isKeyUsedByApp('flag_solta_do_painel')).toBe(false);
  });

  it('omite metadata quando o campo está vazio', () => {
    expect(toCreateRequest(values()).metadata).toBeUndefined();
    expect(
      toCreateRequest(values({ metadataJson: '{"rollout": 10}' })).metadata,
    ).toEqual({ rollout: 10 });
  });
});

describe('validação do formulário', () => {
  it('exige uma chave no formato que a API aceita', () => {
    expect(validateForm(values({ key: 'Chave Com Espaço' })).key).toBe(true);
    expect(validateForm(values({ key: '_comeca_errado' })).key).toBe(true);
    // O hífen não passa: a chave usa "_" e nada mais.
    expect(validateForm(values({ key: 'chave-com-hifen' })).key).toBe(true);
    expect(validateForm(values({ key: 'chave_ok_2' })).key).toBe(false);
  });

  it('exige nome', () => {
    expect(validateForm(values({ name: '   ' })).name).toBe(true);
  });

  it('recusa metadata que não é um objeto JSON', () => {
    expect(isValidMetadataJson('')).toBe(true);
    expect(isValidMetadataJson('{"a":1}')).toBe(true);
    expect(isValidMetadataJson('[1,2]')).toBe(false);
    expect(isValidMetadataJson('{quebrado')).toBe(false);
  });

  it('aponta o formulário inteiro como válido quando está tudo certo', () => {
    expect(hasErrors(validateForm(values()))).toBe(false);
  });
});

describe('apresentação', () => {
  it('formata a data e protege contra valor inválido', () => {
    expect(formatDate('2026-01-10T12:00:00.000Z')).toMatch(
      /\d{2}\/\d{2}\/\d{4}/,
    );
    expect(formatDate('data-quebrada')).toBe('—');
    expect(formatDate(null)).toBe('—');
  });

  it('monta as iniciais a partir da chave', () => {
    expect(flagInitials('club_photo_upload')).toBe('CP');
    expect(flagInitials('feed')).toBe('FE');
    expect(flagInitials('   ')).toBe('?');
  });

  it('divide a opção de ordenação em campo e direção', () => {
    expect(parseSortOption('key:DESC')).toEqual({
      sort: 'key',
      order: 'DESC',
    });
    expect(parseSortOption('qualquer')).toEqual({
      sort: 'name',
      order: 'ASC',
    });
  });

  it('lê metadata só quando há conteúdo', () => {
    expect(parseMetadataJson('   ')).toBeUndefined();
    expect(parseMetadataJson('{"a":1}')).toEqual({ a: 1 });
  });
});
