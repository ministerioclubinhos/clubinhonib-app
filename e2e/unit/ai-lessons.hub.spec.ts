import { expect, test } from '@playwright/test';

import {
  buildHubQueue,
  hubMetrics,
  hubNextStep,
  hubRelativeTime,
  hubStageDots,
  parseListStatus,
} from '@/features/ai-lessons/hub.utils';
import {
  LessonCategory,
  LessonStageStatus,
  LessonStageType,
  LessonStatus,
  StudioHubAction,
  StudioHubStageTone,
  type Lesson,
  type LessonStage,
} from '@/features/ai-lessons/types';

const stage = (type: LessonStageType, status: LessonStageStatus): LessonStage => ({
  id: `${type}-id`,
  type,
  status,
  currentVersionId: status === LessonStageStatus.NOT_STARTED ? null : 'v1',
  lockVersion: 1,
  failureMessage: null,
  versions: [],
});

const lesson = (overrides: Partial<Lesson> = {}): Lesson => ({
  id: 'lesson-1',
  theme: 'Tema',
  biblicalReference: 'João 3.16',
  weekNumber: 12,
  category: LessonCategory.REGULAR,
  status: LessonStatus.IN_PROGRESS,
  weekMaterialId: null,
  createdAt: '2026-11-01T12:00:00.000Z',
  updatedAt: '2026-11-10T12:00:00.000Z',
  stages: [],
  comments: [],
  ...overrides,
});

test.describe('painel do estúdio: próximo passo', () => {
  test('lição em produção continua na primeira etapa que falta', () => {
    const next = hubNextStep(
      lesson({
        stages: [
          stage(LessonStageType.LESSON, LessonStageStatus.PRODUCER_APPROVED),
          stage(LessonStageType.LESSON_VISUALS, LessonStageStatus.PRODUCER_APPROVED),
          stage(LessonStageType.STANDARD_GAME, LessonStageStatus.DRAFT),
        ],
      })
    );

    expect(next.action).toBe(StudioHubAction.CONTINUE);
    expect(next.actionLabel).toBe('Continuar: 3. Brincadeira');
    expect(next.href).toBe('/adm/estudio/licoes/lesson-1?stage=STANDARD_GAME');
  });

  test('lição sem nada gerado começa pela primeira etapa', () => {
    const next = hubNextStep(lesson({ status: LessonStatus.DRAFT }));

    expect(next.action).toBe(StudioHubAction.START);
    expect(next.actionLabel).toBe('Começar: 1. Lição completa');
  });

  test('ajuste pedido pelo revisor vem antes de continuar a produção', () => {
    const next = hubNextStep(
      lesson({
        status: LessonStatus.CHANGES_REQUESTED,
        stages: [
          stage(LessonStageType.LESSON, LessonStageStatus.APPROVED),
          stage(LessonStageType.LESSON_VISUALS, LessonStageStatus.CHANGES_REQUESTED),
        ],
      })
    );

    expect(next.action).toBe(StudioHubAction.FIX_CHANGES);
    expect(next.href).toBe('/adm/estudio/licoes/lesson-1?stage=LESSON_VISUALS');
  });

  test('geração que falhou pede nova tentativa na etapa que falhou', () => {
    const next = hubNextStep(
      lesson({ stages: [stage(LessonStageType.LESSON, LessonStageStatus.FAILED)] })
    );

    expect(next.action).toBe(StudioHubAction.RETRY_FAILED);
    expect(next.actionLabel).toBe('Tentar de novo: 1. Lição completa');
  });

  test('pacote completo vai para a revisão, no item que espera decisão', () => {
    const next = hubNextStep(
      lesson({
        status: LessonStatus.IN_REVIEW,
        stages: [
          stage(LessonStageType.LESSON, LessonStageStatus.APPROVED),
          stage(LessonStageType.LESSON_VISUALS, LessonStageStatus.IN_REVIEW),
        ],
      })
    );

    expect(next.action).toBe(StudioHubAction.REVIEW);
    expect(next.href).toBe('/adm/estudio/revisao/lesson-1?stage=LESSON_VISUALS');
  });

  test('pronta para publicar leva à revisão, onde se publica', () => {
    const next = hubNextStep(lesson({ status: LessonStatus.READY_FOR_PUBLICATION }));

    expect(next.action).toBe(StudioHubAction.PUBLISH);
    expect(next.href).toBe('/adm/estudio/revisao/lesson-1');
  });

  test('material especial usa os nomes das próprias etapas', () => {
    const next = hubNextStep(lesson({ category: LessonCategory.SPECIAL, status: LessonStatus.DRAFT }));

    expect(next.actionLabel).toBe('Começar: 1. Lição Especial + Versículo');
    expect(hubStageDots(lesson({ category: LessonCategory.SPECIAL }))).toHaveLength(3);
  });
});

test.describe('painel do estúdio: fila e números', () => {
  test('a fila põe o mais urgente primeiro e, dentro dele, o mais recente', () => {
    const queue = buildHubQueue([
      lesson({ id: 'producao', updatedAt: '2026-11-11T00:00:00.000Z' }),
      lesson({ id: 'publicar', status: LessonStatus.READY_FOR_PUBLICATION }),
      lesson({ id: 'ajuste-antigo', status: LessonStatus.CHANGES_REQUESTED, updatedAt: '2026-11-01T00:00:00.000Z' }),
      lesson({ id: 'ajuste-novo', status: LessonStatus.CHANGES_REQUESTED, updatedAt: '2026-11-09T00:00:00.000Z' }),
      lesson({ id: 'revisar', status: LessonStatus.PACKAGE_READY }),
    ]);

    expect(queue.map((item) => item.lesson.id)).toEqual([
      'ajuste-novo',
      'ajuste-antigo',
      'publicar',
      'revisar',
      'producao',
    ]);
  });

  test('o progresso conta as etapas que o produtor concluiu', () => {
    const [item] = buildHubQueue([
      lesson({
        stages: [
          stage(LessonStageType.LESSON, LessonStageStatus.APPROVED),
          stage(LessonStageType.LESSON_VISUALS, LessonStageStatus.PRODUCER_APPROVED),
          stage(LessonStageType.STANDARD_GAME, LessonStageStatus.STALE),
        ],
      }),
    ]);

    expect(item.completed).toBe(2);
    expect(item.total).toBe(8);
    expect(item.stages.map((dot) => dot.tone).slice(0, 4)).toEqual([
      StudioHubStageTone.DONE,
      StudioHubStageTone.PRODUCED,
      StudioHubStageTone.STALE,
      StudioHubStageTone.TODO,
    ]);
  });

  test('os números somam os status de cada grupo e dizem para onde o clique vai', () => {
    const metrics = hubMetrics({
      byStatus: { DRAFT: 2, IN_PROGRESS: 3, CHANGES_REQUESTED: 1, PACKAGE_READY: 1, IN_REVIEW: 1, PUBLISHED: 4 },
    });
    const by = Object.fromEntries(metrics.map((metric) => [metric.key, metric]));

    expect(by.PRODUCTION.value).toBe(5);
    expect(by.PRODUCTION.href).toBe('/adm/estudio/licoes');
    expect(by.CHANGES.value).toBe(1);
    expect(by.CHANGES.href).toBe('/adm/estudio/licoes?status=CHANGES_REQUESTED');
    expect(by.REVIEW.value).toBe(2);
    expect(by.READY.value).toBe(0);
    expect(by.PUBLISHED.href).toBe('/adm/estudio/licoes?status=PUBLISHED');
    expect(hubMetrics(undefined).every((metric) => metric.value === 0)).toBe(true);
  });

  test('o filtro de status da URL ignora o que não é status', () => {
    expect(parseListStatus('PUBLISHED')).toBe(LessonStatus.PUBLISHED);
    expect(parseListStatus('qualquer')).toBe('');
    expect(parseListStatus(null)).toBe('');
  });

  test('diz há quanto tempo a lição foi mexida', () => {
    const now = new Date('2026-11-11T12:00:00.000Z');

    expect(hubRelativeTime('2026-11-11T11:59:40.000Z', now)).toBe('agora há pouco');
    expect(hubRelativeTime('2026-11-11T09:00:00.000Z', now)).toBe('há 3 horas');
    expect(hubRelativeTime('2026-11-09T12:00:00.000Z', now)).toBe('há 2 dias');
    expect(hubRelativeTime('2026-10-20T12:00:00.000Z', now)).toBe('há 3 semanas');
  });
});
