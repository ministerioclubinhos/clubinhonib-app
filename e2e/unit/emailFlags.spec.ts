import { expect, test } from '@playwright/test';

import {
  EMAIL_FLAG_PREFIX,
  selectEmailFlagsToDisable,
  shouldRestoreEmailFlags,
  type FeatureFlag,
} from '../support/emailFlags';

const flag = (key: string, enabled: boolean): FeatureFlag => ({
  key,
  name: key,
  enabled,
});

test.describe('selectEmailFlagsToDisable', () => {
  test('pega só as flags de envio que estão ligadas', () => {
    const chaves = selectEmailFlagsToDisable([
      flag('email_week_material_announcement', true),
      flag('email_event_created', true),
      flag('club_control', true),
      flag('statistics', true),
    ]);

    expect(chaves).toEqual([
      'email_week_material_announcement',
      'email_event_created',
    ]);
  });

  test('não toca no que já estava desligado', () => {
    // Religar no fim da rodada o que alguém desligou de propósito seria pior
    // que não restaurar nada.
    expect(
      selectEmailFlagsToDisable([flag('email_password_recovery', false)]),
    ).toEqual([]);
  });

  test('não confunde uma flag de recurso com uma de envio', () => {
    // `club_weekly_summary` é a tela; `email_weekly_club_summary` é o envio.
    const chaves = selectEmailFlagsToDisable([
      flag('club_weekly_summary', true),
      flag('email_weekly_club_summary', true),
    ]);

    expect(chaves).toEqual(['email_weekly_club_summary']);
  });

  test('o prefixo é o mesmo que a API usa nas chaves de envio', () => {
    expect(EMAIL_FLAG_PREFIX).toBe('email_');
  });
});

test.describe('shouldRestoreEmailFlags', () => {
  const original = process.env.E2E_RESTORE_EMAIL_FLAGS;

  test.afterEach(() => {
    if (original === undefined) delete process.env.E2E_RESTORE_EMAIL_FLAGS;
    else process.env.E2E_RESTORE_EMAIL_FLAGS = original;
  });

  test('por padrão as flags ficam desligadas depois da rodada', () => {
    // É o lado seguro: um `Ctrl+C` no meio pula o teardown, e a cota fica
    // protegida em vez de exposta.
    delete process.env.E2E_RESTORE_EMAIL_FLAGS;
    expect(shouldRestoreEmailFlags()).toBe(false);
  });

  test('religa apenas quando pedido explicitamente', () => {
    process.env.E2E_RESTORE_EMAIL_FLAGS = '1';
    expect(shouldRestoreEmailFlags()).toBe(true);

    process.env.E2E_RESTORE_EMAIL_FLAGS = 'true';
    expect(shouldRestoreEmailFlags()).toBe(false);
  });
});
