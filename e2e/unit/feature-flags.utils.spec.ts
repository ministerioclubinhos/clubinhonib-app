import { expect, test } from '@playwright/test';

import { UserRole } from '@/types/shared';

import { FEATURE_FLAG_AUDIENCE_OPTIONS } from '@/features/feature-flags/constants';
import { AudienceRuleStatus, FeatureProfileRuleKind } from '@/features/feature-flags/types';
import type { FeatureFlagAudience, FeatureFlagResponse } from '@/features/feature-flags/types';
import {
  audienceInfo,
  audienceOfRoles,
  audienceRuleWarning,
  checkAudienceAgainstRule,
  formatRoles,
  profileRuleLabel,
  profileRuleOf,
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
} from '@/features/feature-flags/utils';

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

test.describe('combinações de público', () => {
  test('oferece as oito combinações na tela', () => {
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

  test('traduz cada combinação nos perfis que a API grava', () => {
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

  test('volta dos perfis para a combinação, em qualquer ordem', () => {
    expect(audienceOfRoles([UserRole.TEACHER, UserRole.ADMIN])).toBe(
      'ADMIN_TEACHER',
    );
    expect(audienceOfRoles([])).toBe('EVERYONE');
  });

  test('separa "para todos" de "todos os perfis"', () => {
    // Sem perfil alvo a flag alcança o visitante; com os três, ela exige
    // sessão. São públicos diferentes, e a tela precisa dizer qual é qual.
    expect(rolesOfAudience('EVERYONE')).toHaveLength(0);
    expect(rolesOfAudience('ALL_ROLES')).toHaveLength(3);
    expect(audienceInfo('EVERYONE').label).not.toBe(
      audienceInfo('ALL_ROLES').label,
    );
  });
});

test.describe('contrato de /feature-flags', () => {
  test('lê a flag no formato do formulário', () => {
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

  test('aceita descrição nula e metadata preenchida', () => {
    const form = toFormValues(
      buildFlag({ description: null, metadata: { rollout: 50 } }),
    );

    expect(form.description).toBe('');
    expect(JSON.parse(form.metadataJson)).toEqual({ rollout: 50 });
  });

  test('nasce desligada e para todos quando é criação', () => {
    const form = toFormValues(null);

    expect(form.enabled).toBe(false);
    expect(form.audience).toBe('EVERYONE');
  });

  test('envia os perfis da combinação escolhida', () => {
    const payload = toCreateRequest(values());

    expect(payload.targetRoles).toEqual([
      UserRole.COORDINATOR,
      UserRole.TEACHER,
    ]);
    expect(payload.key).toBe('nova_flag');
  });

  test('manda a chave na edição, que também é editável', () => {
    const payload = toUpdateRequest(values({ key: '  Nova_Chave  ' }));

    expect(payload.key).toBe('nova_chave');
    expect(payload.targetRoles).toEqual([
      UserRole.COORDINATOR,
      UserRole.TEACHER,
    ]);
  });

  test('reconhece as chaves que a aplicação procura', () => {
    // É o que permite avisar antes de renomear uma flag em uso.
    expect(isKeyUsedByApp('statistics')).toBe(true);
    expect(isKeyUsedByApp('children_area')).toBe(true);
    expect(isKeyUsedByApp('flag_solta_do_painel')).toBe(false);
  });

  test('omite metadata quando o campo está vazio', () => {
    expect(toCreateRequest(values()).metadata).toBeUndefined();
    expect(
      toCreateRequest(values({ metadataJson: '{"rollout": 10}' })).metadata,
    ).toEqual({ rollout: 10 });
  });
});

test.describe('validação do formulário', () => {
  test('exige uma chave no formato que a API aceita', () => {
    expect(validateForm(values({ key: 'Chave Com Espaço' })).key).toBe(true);
    expect(validateForm(values({ key: '_comeca_errado' })).key).toBe(true);
    // O hífen não passa: a chave usa "_" e nada mais.
    expect(validateForm(values({ key: 'chave-com-hifen' })).key).toBe(true);
    expect(validateForm(values({ key: 'chave_ok_2' })).key).toBe(false);
  });

  test('exige nome', () => {
    expect(validateForm(values({ name: '   ' })).name).toBe(true);
  });

  test('recusa metadata que não é um objeto JSON', () => {
    expect(isValidMetadataJson('')).toBe(true);
    expect(isValidMetadataJson('{"a":1}')).toBe(true);
    expect(isValidMetadataJson('[1,2]')).toBe(false);
    expect(isValidMetadataJson('{quebrado')).toBe(false);
  });

  test('aponta o formulário inteiro como válido quando está tudo certo', () => {
    expect(hasErrors(validateForm(values()))).toBe(false);
  });
});

test.describe('apresentação', () => {
  test('formata a data e protege contra valor inválido', () => {
    expect(formatDate('2026-01-10T12:00:00.000Z')).toMatch(
      /\d{2}\/\d{2}\/\d{4}/,
    );
    expect(formatDate('data-quebrada')).toBe('—');
    expect(formatDate(null)).toBe('—');
  });

  test('monta as iniciais a partir da chave', () => {
    expect(flagInitials('club_photo_upload')).toBe('CP');
    expect(flagInitials('feed')).toBe('FE');
    expect(flagInitials('   ')).toBe('?');
  });

  test('divide a opção de ordenação em campo e direção', () => {
    expect(parseSortOption('key:DESC')).toEqual({
      sort: 'key',
      order: 'DESC',
    });
    expect(parseSortOption('qualquer')).toEqual({
      sort: 'name',
      order: 'ASC',
    });
  });

  test('lê metadata só quando há conteúdo', () => {
    expect(parseMetadataJson('   ')).toBeUndefined();
    expect(parseMetadataJson('{"a":1}')).toEqual({ a: 1 });
  });
});

test.describe('regra de perfil × feature flag', () => {
  test('identifica a regra de perfil de cada flag', () => {
    expect(profileRuleOf('statistics')).toEqual({
      kind: FeatureProfileRuleKind.Roles,
      roles: [UserRole.ADMIN],
    });
    expect(profileRuleOf('contact_form')?.kind).toBe(FeatureProfileRuleKind.Public);
    expect(profileRuleOf('email_password_recovery')?.kind).toBe(FeatureProfileRuleKind.Switch);
    expect(profileRuleOf('idea_ai_enhancement')?.kind).toBe(FeatureProfileRuleKind.Switch);
    expect(profileRuleOf('flag_criada_no_painel')).toBeNull();
  });

  test('descreve a regra em texto curto', () => {
    expect(profileRuleLabel(profileRuleOf('statistics'))).toBe('Regra de perfil: só admin');
    expect(profileRuleLabel(profileRuleOf('pagelas'))).toBe('Regra de perfil: só admin e coordenador');
    expect(profileRuleLabel(profileRuleOf('children_area'))).toBe('Regra de perfil: qualquer perfil logado');
    expect(profileRuleLabel(null)).toBe('Sem regra de perfil no código');
    expect(formatRoles([UserRole.TEACHER, UserRole.ADMIN, UserRole.COORDINATOR])).toBe(
      'admin, coordenador e professor',
    );
  });

  test('público dentro da regra não gera aviso', () => {
    expect(checkAudienceAgainstRule('statistics', 'ADMIN').status).toBe(AudienceRuleStatus.Ok);
    expect(checkAudienceAgainstRule('club_weekly_summary', 'COORDINATOR').status).toBe(AudienceRuleStatus.Ok);
    expect(checkAudienceAgainstRule('contact_form', 'EVERYONE').status).toBe(AudienceRuleStatus.Ok);
    expect(audienceRuleWarning('flag_criada_no_painel', 'TEACHER')).toBeNull();
  });

  test('o público não amplia o acesso além da regra', () => {
    expect(checkAudienceAgainstRule('statistics', 'ALL_ROLES')).toEqual({
      status: AudienceRuleStatus.Outside,
      roles: [UserRole.COORDINATOR, UserRole.TEACHER],
      visitor: false,
    });
    expect(checkAudienceAgainstRule('children_area', 'EVERYONE')).toEqual({
      status: AudienceRuleStatus.Outside,
      roles: [],
      visitor: true,
    });
    expect(audienceRuleWarning('statistics', 'ADMIN_TEACHER')).toContain('professor continua sem acesso');
  });

  test('interruptor do sistema ignora o público', () => {
    expect(checkAudienceAgainstRule('email_event_created', 'ADMIN').status).toBe(AudienceRuleStatus.Ignored);
    expect(audienceRuleWarning('email_event_created', 'ADMIN')).toContain('não tem efeito');
  });
});
