import { expect, test } from '@playwright/test';

import { MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';

import { MEDITATION_PAYLOAD_FIELD } from '@/features/meditations/constants';
import {
  MeditationDayDraft,
  MeditationFormValues,
  MeditationMediaResponse,
  MeditationRequest,
  MeditationResponse,
  MeditationWeekDay,
} from '@/features/meditations/types';
import {
  availableWeekDays,
  buildMeditationFormData,
  buildMeditationPayload,
  isFriday,
  isMonday,
  meditationInitials,
  parseSortOption,
  periodStatus,
  sortDays,
  toDayDrafts,
  toFormValues,
  todayAsDateOnly,
  weekDayLabel,
} from '@/features/meditations/utils';

const MONDAY = '2026-08-31';
const FRIDAY = '2026-09-04';

const values: MeditationFormValues = {
  topic: 'Semana da gratidão',
  startDate: MONDAY,
  endDate: FRIDAY,
  uploadType: MediaUploadType.LINK,
  url: 'https://drive.google.com/file/d/1/view',
  platformType: MediaPlatform.GOOGLE_DRIVE,
  file: null,
  storedMedia: null,
};

const storedUpload: MeditationMediaResponse = {
  id: 'media-1',
  title: 'Material',
  description: '',
  mediaType: MediaType.DOCUMENT,
  uploadType: MediaUploadType.UPLOAD,
  url: 'https://s3/antigo.pdf',
  isLocalFile: true,
  originalName: 'antigo.pdf',
  size: 10,
};

const day = (
  weekDay: MeditationWeekDay,
  overrides: Partial<MeditationDayDraft> = {},
): MeditationDayDraft => ({
  day: weekDay,
  verse: `Verso ${weekDay}`,
  topic: `Tema ${weekDay}`,
  ...overrides,
});

const fullWeek = [
  MeditationWeekDay.Monday,
  MeditationWeekDay.Tuesday,
  MeditationWeekDay.Wednesday,
  MeditationWeekDay.Thursday,
  MeditationWeekDay.Friday,
].map((weekDay) => day(weekDay));

const readPayload = (formData: FormData): MeditationRequest =>
  JSON.parse(formData.get(MEDITATION_PAYLOAD_FIELD) as string) as MeditationRequest;

test.describe('meditation utils', () => {
  test.describe('isMonday / isFriday', () => {
    test('reconhece o começo e o fim válidos da semana', () => {
      expect(isMonday(MONDAY)).toBe(true);
      expect(isFriday(FRIDAY)).toBe(true);
    });

    test('recusa outros dias e valores vazios', () => {
      expect(isMonday(FRIDAY)).toBe(false);
      expect(isFriday(MONDAY)).toBe(false);
      expect(isMonday('')).toBe(false);
    });

    test('não desloca o dia por causa de fuso', () => {
      // `new Date('2026-08-31')` seria lido como UTC e viraria domingo no Brasil.
      expect(isMonday('2026-08-31')).toBe(true);
    });
  });

  test.describe('weekDayLabel', () => {
    test('traduz os dias conhecidos', () => {
      expect(weekDayLabel(MeditationWeekDay.Wednesday)).toBe('Quarta-feira');
    });

    test('devolve o próprio valor quando desconhecido', () => {
      expect(weekDayLabel('Sunday')).toBe('Sunday');
    });
  });

  test.describe('sortDays', () => {
    test('ordena de segunda a sexta sem mutar a entrada', () => {
      const unordered = [
        day(MeditationWeekDay.Friday),
        day(MeditationWeekDay.Monday),
      ];

      expect(sortDays(unordered).map((item) => item.day)).toEqual([
        MeditationWeekDay.Monday,
        MeditationWeekDay.Friday,
      ]);
      expect(unordered[0].day).toBe(MeditationWeekDay.Friday);
    });
  });

  test.describe('availableWeekDays', () => {
    test('esconde dias já preenchidos', () => {
      const options = availableWeekDays([day(MeditationWeekDay.Monday)], null);

      expect(options).not.toContain(MeditationWeekDay.Monday);
      expect(options).toContain(MeditationWeekDay.Tuesday);
    });

    test('mantém o dia que está sendo editado', () => {
      const options = availableWeekDays([day(MeditationWeekDay.Monday)], 0);

      expect(options).toContain(MeditationWeekDay.Monday);
    });
  });

  test.describe('toFormValues / toDayDrafts', () => {
    const meditation = {
      id: 'm-1',
      topic: 'Tema',
      startDate: MONDAY,
      endDate: FRIDAY,
      days: [
        { id: 'd2', day: MeditationWeekDay.Friday, verse: 'v', topic: 't' },
        { id: 'd1', day: MeditationWeekDay.Monday, verse: 'v', topic: 't' },
      ],
      media: {
        id: 'media-1',
        title: 'Material',
        description: '',
        mediaType: MediaType.DOCUMENT,
        uploadType: MediaUploadType.UPLOAD,
        url: 'https://s3/a.pdf',
        isLocalFile: true,
        originalName: 'a.pdf',
      },
      createdAt: '',
      updatedAt: '',
    } as MeditationResponse;

    test('carrega os campos da meditação existente', () => {
      expect(toFormValues(meditation)).toMatchObject({
        topic: 'Tema',
        startDate: MONDAY,
        uploadType: MediaUploadType.UPLOAD,
        file: null,
      });
    });

    test('devolve valores vazios quando não há meditação', () => {
      expect(toFormValues(null)).toMatchObject({
        topic: '',
        uploadType: MediaUploadType.LINK,
      });
    });

    test('ordena os dias carregados e preserva os ids', () => {
      const drafts = toDayDrafts(meditation);

      expect(drafts.map((item) => item.id)).toEqual(['d1', 'd2']);
    });
  });

  test.describe('mídia já gravada na edição', () => {
    test('reenvia id e URL guardados quando o arquivo não muda', () => {
      // Sem isso a API não reconhece a mídia reenviada e o arquivo atual, que
      // já está no S3, é apagado junto com o registro.
      const payload = buildMeditationPayload(
        {
          ...values,
          uploadType: MediaUploadType.UPLOAD,
          storedMedia: storedUpload,
        },
        fullWeek,
        'm-1',
      );

      expect(payload.media).toMatchObject({
        id: 'media-1',
        url: 'https://s3/antigo.pdf',
        originalName: 'antigo.pdf',
        size: 10,
        isLocalFile: true,
      });
    });

    test('não manda a URL guardada quando um arquivo novo é escolhido', () => {
      const file = new File(['x'], 'novo.pdf', { type: 'application/pdf' });

      const payload = buildMeditationPayload(
        {
          ...values,
          uploadType: MediaUploadType.UPLOAD,
          file,
          storedMedia: storedUpload,
        },
        fullWeek,
        'm-1',
      );

      expect(payload.media).toMatchObject({
        id: 'media-1',
        url: '',
        originalName: 'novo.pdf',
      });
    });

    test('mantém o id ao trocar o upload por um link', () => {
      const payload = buildMeditationPayload(
        {
          ...values,
          uploadType: MediaUploadType.LINK,
          url: 'https://drive.google.com/file/d/2/view',
          storedMedia: storedUpload,
        },
        fullWeek,
        'm-1',
      );

      expect(payload.media).toMatchObject({
        id: 'media-1',
        url: 'https://drive.google.com/file/d/2/view',
        isLocalFile: false,
      });
    });

    test('não manda id na criação, que não tem mídia guardada', () => {
      const payload = buildMeditationPayload(
        { ...values, uploadType: MediaUploadType.UPLOAD },
        fullWeek,
      );

      expect(payload.media.id).toBeUndefined();
      expect(payload.media.url).toBe('');
    });
  });

  test.describe('buildMeditationFormData', () => {
    test('envia o id apenas na edição', () => {
      expect(readPayload(buildMeditationFormData(values, fullWeek)).id).toBeUndefined();
      expect(
        readPayload(buildMeditationFormData(values, fullWeek, 'm-1')).id,
      ).toBe('m-1');
    });

    test('monta a mídia de link com a plataforma escolhida', () => {
      const payload = readPayload(buildMeditationFormData(values, fullWeek));

      expect(payload.media).toMatchObject({
        mediaType: MediaType.DOCUMENT,
        uploadType: MediaUploadType.LINK,
        isLocalFile: false,
        url: 'https://drive.google.com/file/d/1/view',
        platformType: MediaPlatform.GOOGLE_DRIVE,
      });
    });

    test('anexa o arquivo e omite a plataforma no upload', () => {
      const file = new File(['x'], 'meditacao.pdf');
      const formData = buildMeditationFormData(
        { ...values, uploadType: MediaUploadType.UPLOAD, file },
        fullWeek,
      );
      const payload = readPayload(formData);

      expect(formData.get('file')).toBeInstanceOf(File);
      expect(payload.media).toMatchObject({
        isLocalFile: true,
        url: '',
        originalName: 'meditacao.pdf',
      });
      expect(payload.media.platformType).toBeUndefined();
    });

    test('envia os cinco dias ordenados e sem os ids locais', () => {
      const payload = readPayload(
        buildMeditationFormData(values, [...fullWeek].reverse()),
      );

      expect(payload.days).toHaveLength(5);
      expect(payload.days[0].day).toBe(MeditationWeekDay.Monday);
      expect(payload.days[0]).not.toHaveProperty('id');
    });
  });
});

test.describe('apresentação da listagem', () => {
  test('monta as iniciais do avatar', () => {
    expect(meditationInitials('Deus é fiel')).toBe('DÉ');
    expect(meditationInitials('Fé')).toBe('FÉ');
    expect(meditationInitials('   ')).toBe('?');
  });

  test('classifica o período em relação a hoje', () => {
    const hoje = todayAsDateOnly();

    expect(periodStatus({ startDate: hoje, endDate: hoje })).toBe('current');
    expect(
      periodStatus({ startDate: '2999-01-01', endDate: '2999-01-05' }),
    ).toBe('upcoming');
    expect(
      periodStatus({ startDate: '2000-01-03', endDate: '2000-01-07' }),
    ).toBe('past');
  });

  test('divide a opção de ordenação em campo e direção', () => {
    expect(parseSortOption('topic:ASC')).toEqual({
      sort: 'topic',
      order: 'ASC',
    });
    expect(parseSortOption('qualquer')).toEqual({
      sort: 'startDate',
      order: 'DESC',
    });
  });
});
