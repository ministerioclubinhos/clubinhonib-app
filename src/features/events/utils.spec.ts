import { describe, expect, it } from 'vitest';

import { EVENT_PAYLOAD_FIELD } from './constants';
import { EventAudience, EventResponse, EventType, Weekday } from './types';
import {
  buildEventFormData,
  describeRecurrence,
  expandAllOccurrences,
  expandOccurrences,
  formatEventTime,
  buildEventPayload,
  formatEventDate,
  isUpcoming,
  sortByDate,
  toDateInputValue,
  toEventDay,
  toFormValues,
  validateEventForm,
} from './utils';

const values = {
  title: '  Festa da Família  ',
  date: '2026-04-12',
  location: '  Salão  ',
  description: '  Traga a família.  ',
  audience: EventAudience.ALL,
  eventType: EventType.CUSTOM,
};

const baseFields = {
  public: true,
  isRecurring: false,
  weekday: null,
  time: null,
  clubId: null,
};

const storedEvent = {
  ...baseFields,
  id: 'event-1',
  title: 'Festa',
  description: 'Descrição',
  date: '2026-04-12',
  location: 'Salão',
  audience: EventAudience.ALL,
  eventType: EventType.CUSTOM,
  media: {
    id: 'media-1',
    title: 'Cartaz',
    description: '',
    url: 'https://s3/cartaz.png',
    isLocalFile: true,
    originalName: 'cartaz.png',
    size: 10,
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as EventResponse;

const event = (id: string, date: string): EventResponse =>
  ({ ...storedEvent, id, date }) as EventResponse;

describe('utils de eventos', () => {
  describe('toEventDay', () => {
    it('lê a data pelos componentes, sem passar por UTC', () => {
      // `new Date('2026-04-12')` seria meia-noite UTC e viraria dia 11 aqui.
      const day = toEventDay('2026-04-12');

      expect(day.getFullYear()).toBe(2026);
      expect(day.getMonth()).toBe(3);
      expect(day.getDate()).toBe(12);
    });

    it('ignora a hora de uma data ISO completa', () => {
      expect(toEventDay('2026-04-12T23:30:00.000Z').getDate()).toBe(12);
    });
  });

  it('formata a data no padrão do Brasil', () => {
    expect(formatEventDate('2026-04-12')).toBe('12/04/2026');
  });

  it('devolve o valor aceito por um input de data', () => {
    expect(toDateInputValue('2026-04-12T00:00:00.000Z')).toBe('2026-04-12');
    expect(toDateInputValue('')).toBe('');
  });

  it('ordena por data, do mais próximo ao mais distante', () => {
    const ordered = sortByDate([
      event('c', '2026-06-01'),
      event('a', '2026-04-12'),
      event('b', '2026-05-20'),
    ]);

    expect(ordered.map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  it('trata o evento de hoje como futuro', () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    expect(isUpcoming(iso)).toBe(true);
    expect(isUpcoming('2000-01-01')).toBe(false);
  });

  describe('toFormValues', () => {
    it('usa os padrões na criação', () => {
      expect(toFormValues(null)).toEqual({
        title: '',
        date: '',
        location: '',
        description: '',
        audience: EventAudience.ALL,
        eventType: EventType.CUSTOM,
      });
    });

    it('recorta a hora da data ao carregar para edição', () => {
      const loaded = toFormValues({
        ...storedEvent,
        date: '2026-04-12T00:00:00.000Z',
      } as EventResponse);

      expect(loaded.date).toBe('2026-04-12');
    });
  });

  describe('buildEventPayload', () => {
    it('remove os espaços em volta dos textos', () => {
      const payload = buildEventPayload(values, null, null);

      expect(payload.title).toBe('Festa da Família');
      expect(payload.location).toBe('Salão');
      expect(payload.description).toBe('Traga a família.');
    });

    it('não envia mídia quando não há arquivo nem imagem guardada', () => {
      expect(buildEventPayload(values, null, null).media).toBeUndefined();
    });

    it('reenvia a URL guardada quando a edição não troca a imagem', () => {
      // Sem isso, a API não reconhece a mídia e o arquivo atual é apagado.
      const payload = buildEventPayload(values, null, storedEvent);

      expect(payload.media).toMatchObject({
        id: 'media-1',
        url: 'https://s3/cartaz.png',
        originalName: 'cartaz.png',
      });
    });

    it('manda a URL vazia quando um arquivo novo é escolhido', () => {
      const file = new File(['x'], 'novo.png', { type: 'image/png' });

      const payload = buildEventPayload(values, file, storedEvent);

      expect(payload.media).toMatchObject({
        id: 'media-1',
        url: '',
        originalName: 'novo.png',
      });
    });

    it('não envia mídia quando o usuário pede para remover a imagem', () => {
      const payload = buildEventPayload(values, null, storedEvent, true);

      expect(payload.media).toBeUndefined();
    });
  });

  describe('buildEventFormData', () => {
    it('coloca o JSON no campo esperado pela API', () => {
      const formData = buildEventFormData(values, null);
      const raw = formData.get(EVENT_PAYLOAD_FIELD);

      expect(typeof raw).toBe('string');
      expect(JSON.parse(raw as string).title).toBe('Festa da Família');
    });

    it('anexa o arquivo no campo file', () => {
      const file = new File(['x'], 'novo.png', { type: 'image/png' });

      const formData = buildEventFormData(values, file);

      expect(formData.get('file')).toBeInstanceOf(File);
    });
  });

  describe('validateEventForm', () => {
    it('acusa os campos obrigatórios em branco', () => {
      expect(
        validateEventForm({
          ...values,
          title: '   ',
          date: '',
          location: '',
          description: '  ',
        }),
      ).toEqual({
        title: true,
        date: true,
        location: true,
        description: true,
      });
    });

    it('aceita o formulário preenchido', () => {
      expect(validateEventForm(values)).toEqual({
        title: false,
        date: false,
        location: false,
        description: false,
      });
    });
  });
});

describe('encontros recorrentes', () => {
  const clubMeeting = {
    ...storedEvent,
    id: 'club-event',
    title: 'Clubinho #12',
    date: '2026-04-01',
    public: false,
    isRecurring: true,
    weekday: Weekday.WEDNESDAY,
    time: '15:00',
    clubId: 'club-1',
  } as EventResponse;

  it('repete o encontro toda semana dentro do intervalo', () => {
    // Abril de 2026: quartas em 1, 8, 15, 22 e 29.
    const occurrences = expandOccurrences(
      clubMeeting,
      new Date(2026, 3, 1),
      new Date(2026, 3, 30),
    );

    expect(occurrences.map((item) => item.date.getDate())).toEqual([
      1, 8, 15, 22, 29,
    ]);
  });

  it('não aparece antes da data em que o encontro passou a existir', () => {
    const occurrences = expandOccurrences(
      clubMeeting,
      new Date(2026, 2, 1),
      new Date(2026, 3, 8),
    );

    expect(occurrences.map((item) => item.date.getDate())).toEqual([1, 8]);
  });

  it('dá uma chave diferente para cada semana', () => {
    const occurrences = expandOccurrences(
      clubMeeting,
      new Date(2026, 3, 1),
      new Date(2026, 3, 30),
    );
    const keys = occurrences.map((item) => item.key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('evento comum aparece uma vez, e só se cair no intervalo', () => {
    const single = { ...storedEvent, date: '2026-04-12' } as EventResponse;

    expect(
      expandOccurrences(single, new Date(2026, 3, 1), new Date(2026, 3, 30)),
    ).toHaveLength(1);
    expect(
      expandOccurrences(single, new Date(2026, 4, 1), new Date(2026, 4, 30)),
    ).toHaveLength(0);
  });

  it('junta tudo em ordem de data', () => {
    const single = {
      ...storedEvent,
      id: 'unico',
      date: '2026-04-10',
    } as EventResponse;

    const all = expandAllOccurrences(
      [clubMeeting, single],
      new Date(2026, 3, 1),
      new Date(2026, 3, 16),
    );

    expect(all.map((item) => item.date.getDate())).toEqual([1, 8, 10, 15]);
  });

  it('descreve quando o encontro acontece', () => {
    expect(describeRecurrence(clubMeeting)).toBe('Quarta-feira · 15:00');
  });

  it('usa o texto de reserva quando não há horário', () => {
    expect(formatEventTime(null)).toBe('Horário a definir');
    expect(
      describeRecurrence({ ...clubMeeting, time: null } as EventResponse),
    ).toBe('Quarta-feira · Horário a definir');
  });
});
