import { expect, test } from '@playwright/test';

import { IMAGE_REGENERATION_TEXTS } from '@/features/ai-lessons/image-regeneration.constants';
import {
  imageBriefOutcome,
  imageBriefView,
  imageRegenerationBlockedReason,
  imageSelectionSummary,
  mustRegenerateAllImages,
  regenerableImages,
  showsFirstImageNote,
  toggleImageSelection,
} from '@/features/ai-lessons/image-regeneration.utils';
import { LessonStageStatus, LessonStageType } from '@/features/ai-lessons/types';

const data = {
  assets: [
    { id: 1, url: 'https://cdn/1.png', title: 'Personagens' },
    { id: 2, url: 'https://cdn/2.png' },
    { id: 3, url: 'https://cdn/3.png', displayText: 'Deus é amor' },
  ],
};
const images = regenerableImages(LessonStageType.LESSON_VISUALS, data);
const ALL = ['1', '2', '3'];

test.describe('regenerableImages', () => {
  test('lista as imagens da versão com rótulo e a primeira marcada', () => {
    expect(images).toEqual([
      { id: '1', url: 'https://cdn/1.png', label: 'Imagem 1 — Personagens', first: true },
      { id: '2', url: 'https://cdn/2.png', label: 'Imagem 2', first: false },
      { id: '3', url: 'https://cdn/3.png', label: 'Imagem 3 — Deus é amor', first: false },
    ]);
  });

  test('lê as imagens imprimíveis das etapas que as usam; a lição não tem imagens', () => {
    expect(
      regenerableImages(LessonStageType.MANUAL_WORK, {
        printableAssets: [{ id: 'manual', url: 'https://cdn/m.png' }],
      }).map((image) => image.id)
    ).toEqual(['manual']);
    expect(regenerableImages(LessonStageType.LESSON, null)).toEqual([]);
  });
});

test.describe('imageRegenerationBlockedReason', () => {
  const stage = { status: LessonStageStatus.DRAFT };

  test('libera quando todas as imagens existem e não há edição pendente', () => {
    expect(imageRegenerationBlockedReason({ stage, images, edited: false })).toBeNull();
  });

  test('edição não salva bloqueia: ela seria perdida', () => {
    expect(imageRegenerationBlockedReason({ stage, images, edited: true })).toBe(
      IMAGE_REGENERATION_TEXTS.blocked.unsaved
    );
  });

  test('item desatualizado pede a geração completa', () => {
    expect(
      imageRegenerationBlockedReason({
        stage: { status: LessonStageStatus.STALE },
        images,
        edited: false,
      })
    ).toBe(IMAGE_REGENERATION_TEXTS.blocked.stale);
  });

  test('imagem que nunca foi gerada pede a geração completa', () => {
    const missing = regenerableImages(LessonStageType.LESSON_VISUALS, {
      assets: [{ id: 1, url: 'https://cdn/1.png' }, { id: 2 }],
    });
    expect(imageRegenerationBlockedReason({ stage, images: missing, edited: false })).toBe(
      IMAGE_REGENERATION_TEXTS.blocked.missing
    );
  });
});

test.describe('seleção', () => {
  test('marca e desmarca mantendo a ordem do item', () => {
    expect(toggleImageSelection([], '3', ALL, false)).toEqual(['3']);
    expect(toggleImageSelection(['3'], '1', ALL, false)).toEqual(['1', '3']);
    expect(toggleImageSelection(['1', '3'], '1', ALL, false)).toEqual(['3']);
  });

  test('em item de conjunto, um clique marca ou desmarca todas', () => {
    expect(mustRegenerateAllImages(LessonStageType.MEDITATION_OLDER)).toBe(true);
    expect(mustRegenerateAllImages(LessonStageType.LESSON_VISUALS)).toBe(false);
    expect(toggleImageSelection([], '2', ALL, true)).toEqual(ALL);
    expect(toggleImageSelection(ALL, '2', ALL, true)).toEqual([]);
  });

  test('resume o que será refeito e o que fica', () => {
    expect(imageSelectionSummary(0, 5)).toBe('Nenhuma imagem marcada (5 no item).');
    expect(imageSelectionSummary(1, 5)).toBe('1 de 5 imagem será refeita; 4 ficam como estão.');
    expect(imageSelectionSummary(4, 5)).toBe('4 de 5 imagens serão refeitas; 1 fica como está.');
    expect(imageSelectionSummary(5, 5)).toBe('Todas as 5 imagens serão refeitas.');
    expect(imageSelectionSummary(1, 1)).toBe('A imagem do item será refeita.');
  });

  test('o aviso da primeira imagem só aparece quando ela é refeita sem as outras', () => {
    expect(showsFirstImageNote(images, ['1'])).toBe(true);
    expect(showsFirstImageNote(images, ['2'])).toBe(false);
    expect(showsFirstImageNote(images, ALL)).toBe(false);
  });
});

test.describe('prompt mestre das imagens', () => {
  const stored = {
    imageBrief: {
      version: 1,
      artDirection: ' Aquarela digital, contorno marrom. ',
      createdAt: '2026-11-12T12:00:00.000Z',
      parts: [
        { assetId: 'kit-01', prompt: 'Jesus e Pedro lado a lado.' },
        { assetId: 'kit-02', prompt: '  ' },
      ],
    },
  };

  test('lê a direção de arte e a parte de cada imagem', () => {
    expect(imageBriefView(stored)).toEqual({
      artDirection: 'Aquarela digital, contorno marrom.',
      parts: { 'kit-01': 'Jesus e Pedro lado a lado.' },
      createdAt: '2026-11-12T12:00:00.000Z',
    });
  });

  test('versão sem prompt mestre devolve nulo', () => {
    expect(imageBriefView({ assets: [] })).toBeNull();
    expect(imageBriefView(null)).toBeNull();
    expect(imageBriefView({ imageBrief: { artDirection: '' } })).toBeNull();
  });

  test('explica o que acontece com o prompt mestre conforme a seleção', () => {
    const brief = imageBriefView(stored);
    expect(imageBriefOutcome(brief, 2, 5)).toBe(IMAGE_REGENERATION_TEXTS.brief.reused);
    expect(imageBriefOutcome(brief, 0, 5)).toBe(IMAGE_REGENERATION_TEXTS.brief.reused);
    expect(imageBriefOutcome(brief, 5, 5)).toBe(IMAGE_REGENERATION_TEXTS.brief.rewritten);
    expect(imageBriefOutcome(null, 1, 5)).toBe(IMAGE_REGENERATION_TEXTS.brief.created);
  });
});
