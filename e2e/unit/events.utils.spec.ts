import { expect, test } from '@playwright/test';

import { EVENT_PAYLOAD_FIELD } from '@/features/events/constants';
import {
  AppEvent,
  EventAudience,
  EventCardStatus,
  EventResponse,
  EventType,
  Weekday,
} from '@/features/events/types';
import {
  buildEventFormData,
  describeRecurrence,
  displayDate,
  eventTimeLabel,
  isClubMeeting,
  expandAllOccurrences,
  expandOccurrences,
  formatEventCardDate,
  formatEventCount,
  formatEventTime,
  buildEventPayload,
  formatEventDate,
  getEventCardStatus,
  groupEventsForCards,
  isUpcoming,
  sortByDate,
  toDateInputValue,
  toEventDay,
  toFormValues,
  validateEventForm,
} from '@/features/events/utils';

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
  occurrences: [] as string[],
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

const cardEvent = (id: string, date: string): AppEvent => ({
  id,
  date,
  title: `Evento ${id}`,
  description: 'Descrição',
  location: 'Salão',
});

test.describe('utils de eventos', () => {
  test.describe('toEventDay', () => {
    test('lê a data pelos componentes, sem passar por UTC', () => {
      // `new Date('2026-04-12')` seria meia-noite UTC e viraria dia 11 aqui.
      const day = toEventDay('2026-04-12');

      expect(day.getFullYear()).toBe(2026);
      expect(day.getMonth()).toBe(3);
      expect(day.getDate()).toBe(12);
    });

    test('ignora a hora de uma data ISO completa', () => {
      expect(toEventDay('2026-04-12T23:30:00.000Z').getDate()).toBe(12);
    });
  });

  test('formata a data no padrão do Brasil', () => {
    expect(formatEventDate('2026-04-12')).toBe('12/04/2026');
  });

  test('monta as partes curtas da data para o card', () => {
    expect(formatEventCardDate('2026-04-12T23:30:00.000Z')).toEqual({
      day: '12',
      month: 'ABR',
      complement: 'domingo, 2026',
      full: 'domingo, 12 de abril de 2026',
    });
  });

  test.describe('modo de cards', () => {
    const referenceDate = new Date(2026, 3, 12);

    test('classifica hoje, amanhã, breve, distante e passado', () => {
      expect(getEventCardStatus('2026-04-11', referenceDate)).toBe(
        EventCardStatus.PAST,
      );
      expect(getEventCardStatus('2026-04-12', referenceDate)).toBe(
        EventCardStatus.TODAY,
      );
      expect(getEventCardStatus('2026-04-13', referenceDate)).toBe(
        EventCardStatus.TOMORROW,
      );
      expect(getEventCardStatus('2026-04-19', referenceDate)).toBe(
        EventCardStatus.SOON,
      );
      expect(getEventCardStatus('2026-04-20', referenceDate)).toBe(
        EventCardStatus.LATER,
      );
    });

    test('separa e ordena próximos e anteriores sem alterar a entrada', () => {
      const input = [
        cardEvent('futuro', '2026-04-20'),
        cardEvent('antigo', '2026-04-01'),
        cardEvent('hoje', '2026-04-12'),
        cardEvent('recente', '2026-04-11'),
      ];

      const groups = groupEventsForCards(input, referenceDate);

      expect(groups.upcoming.map((item) => item.id)).toEqual(['hoje', 'futuro']);
      expect(groups.past.map((item) => item.id)).toEqual(['recente', 'antigo']);
      expect(input.map((item) => item.id)).toEqual([
        'futuro',
        'antigo',
        'hoje',
        'recente',
      ]);
    });

    test('formata a contagem no singular e no plural', () => {
      expect(formatEventCount(1)).toBe('1 evento');
      expect(formatEventCount(3)).toBe('3 eventos');
    });
  });

  test('devolve o valor aceito por um input de data', () => {
    expect(toDateInputValue('2026-04-12T00:00:00.000Z')).toBe('2026-04-12');
    expect(toDateInputValue('')).toBe('');
  });

  test('ordena por data, do mais próximo ao mais distante', () => {
    const ordered = sortByDate([
      event('c', '2026-06-01'),
      event('a', '2026-04-12'),
      event('b', '2026-05-20'),
    ]);

    expect(ordered.map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  test('trata o evento de hoje como futuro', () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    expect(isUpcoming(iso)).toBe(true);
    expect(isUpcoming('2000-01-01')).toBe(false);
  });

  test.describe('toFormValues', () => {
    test('usa os padrões na criação', () => {
      expect(toFormValues(null)).toEqual({
        title: '',
        date: '',
        location: '',
        description: '',
        audience: EventAudience.ALL,
        eventType: EventType.CUSTOM,
      });
    });

    test('recorta a hora da data ao carregar para edição', () => {
      const loaded = toFormValues({
        ...storedEvent,
        date: '2026-04-12T00:00:00.000Z',
      } as EventResponse);

      expect(loaded.date).toBe('2026-04-12');
    });
  });

  test.describe('buildEventPayload', () => {
    test('remove os espaços em volta dos textos', () => {
      const payload = buildEventPayload(values, null, null);

      expect(payload.title).toBe('Festa da Família');
      expect(payload.location).toBe('Salão');
      expect(payload.description).toBe('Traga a família.');
    });

    test('não envia mídia quando não há arquivo nem imagem guardada', () => {
      expect(buildEventPayload(values, null, null).media).toBeUndefined();
    });

    test('reenvia a URL guardada quando a edição não troca a imagem', () => {
      // Sem isso, a API não reconhece a mídia e o arquivo atual é apagado.
      const payload = buildEventPayload(values, null, storedEvent);

      expect(payload.media).toMatchObject({
        id: 'media-1',
        url: 'https://s3/cartaz.png',
        originalName: 'cartaz.png',
      });
    });

    test('manda a URL vazia quando um arquivo novo é escolhido', () => {
      const file = new File(['x'], 'novo.png', { type: 'image/png' });

      const payload = buildEventPayload(values, file, storedEvent);

      expect(payload.media).toMatchObject({
        id: 'media-1',
        url: '',
        originalName: 'novo.png',
      });
    });

    test('não envia mídia quando o usuário pede para remover a imagem', () => {
      const payload = buildEventPayload(values, null, storedEvent, true);

      expect(payload.media).toBeUndefined();
    });
  });

  test.describe('buildEventFormData', () => {
    test('coloca o JSON no campo esperado pela API', () => {
      const formData = buildEventFormData(values, null);
      const raw = formData.get(EVENT_PAYLOAD_FIELD);

      expect(typeof raw).toBe('string');
      expect(JSON.parse(raw as string).title).toBe('Festa da Família');
    });

    test('anexa o arquivo no campo file', () => {
      const file = new File(['x'], 'novo.png', { type: 'image/png' });

      const formData = buildEventFormData(values, file);

      expect(formData.get('file')).toBeInstanceOf(File);
    });
  });

  test.describe('validateEventForm', () => {
    test('acusa os campos obrigatórios em branco', () => {
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

    test('aceita o formulário preenchido', () => {
      expect(validateEventForm(values)).toEqual({
        title: false,
        date: false,
        location: false,
        description: false,
      });
    });
  });
});

test.describe('encontros de clubinho', () => {
  /**
   * As datas vêm prontas da API, que cruza o dia da semana do clubinho com o
   * período letivo e as exceções. O front não recalcula nada: manter a conta
   * nos dois lados significaria duas versões da mesma regra, e a do front não
   * tem como saber que a semana do feriado não conta.
   */
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
    // Quartas de abril de 2026, sem o dia 15: ali há uma exceção cadastrada.
    occurrences: ['2026-04-01', '2026-04-08', '2026-04-22', '2026-04-29'],
  } as EventResponse;

  test('desenha as datas que a API mandou, sem inventar semana', () => {
    const occurrences = expandOccurrences(
      clubMeeting,
      new Date(2026, 3, 1),
      new Date(2026, 3, 30),
    );

    expect(occurrences.map((item) => item.date.getDate())).toEqual([
      1, 8, 22, 29,
    ]);
  });

  test('não repõe o dia de exceção que a API tirou', () => {
    const occurrences = expandOccurrences(
      clubMeeting,
      new Date(2026, 3, 1),
      new Date(2026, 3, 30),
    );

    expect(occurrences.map((item) => item.date.getDate())).not.toContain(15);
  });

  test('mostra só o que cai no intervalo pedido', () => {
    const occurrences = expandOccurrences(
      clubMeeting,
      new Date(2026, 3, 1),
      new Date(2026, 3, 8),
    );

    expect(occurrences.map((item) => item.date.getDate())).toEqual([1, 8]);
  });

  test('dá uma chave diferente para cada semana', () => {
    const occurrences = expandOccurrences(
      clubMeeting,
      new Date(2026, 3, 1),
      new Date(2026, 3, 30),
    );
    const keys = occurrences.map((item) => item.key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  test('não aparece quando a API não mandou data nenhuma', () => {
    // É o caso de não haver período letivo cadastrado para o ano: o encontro
    // existe como cadastro, mas não acontece em dia nenhum.
    const semPeriodo = { ...clubMeeting, occurrences: [] } as EventResponse;

    expect(
      expandOccurrences(semPeriodo, new Date(2026, 3, 1), new Date(2026, 3, 30)),
    ).toHaveLength(0);
  });

  test('evento comum aparece uma vez, e só se cair no intervalo', () => {
    const single = {
      ...storedEvent,
      date: '2026-04-12',
      occurrences: ['2026-04-12'],
    } as EventResponse;

    expect(
      expandOccurrences(single, new Date(2026, 3, 1), new Date(2026, 3, 30)),
    ).toHaveLength(1);
    expect(
      expandOccurrences(single, new Date(2026, 4, 1), new Date(2026, 4, 30)),
    ).toHaveLength(0);
  });

  test('evento antigo, sem o campo, cai para a própria data', () => {
    const legado = { ...storedEvent, date: '2026-04-12' } as EventResponse;
    delete (legado as { occurrences?: string[] }).occurrences;

    expect(
      expandOccurrences(legado, new Date(2026, 3, 1), new Date(2026, 3, 30)),
    ).toHaveLength(1);
  });

  test('junta tudo em ordem de data', () => {
    const single = {
      ...storedEvent,
      id: 'unico',
      date: '2026-04-10',
      occurrences: ['2026-04-10'],
    } as EventResponse;

    const all = expandAllOccurrences(
      [clubMeeting, single],
      new Date(2026, 3, 1),
      new Date(2026, 3, 16),
    );

    expect(all.map((item) => item.date.getDate())).toEqual([1, 8, 10]);
  });

  test.describe('displayDate', () => {
    test('mostra a próxima ocorrência, não a primeira da série', () => {
      // Um clubinho que se reúne desde abril precisa aparecer como "quarta que
      // vem", não com a data em que a série nasceu.
      expect(displayDate(clubMeeting, new Date(2026, 3, 9))).toBe('2026-04-22');
    });

    test('inclui o dia de hoje', () => {
      expect(displayDate(clubMeeting, new Date(2026, 3, 8))).toBe('2026-04-08');
    });

    test('cai para a última quando todas já passaram', () => {
      expect(displayDate(clubMeeting, new Date(2026, 5, 1))).toBe('2026-04-29');
    });

    test('não descarta o recuo de data de um registro antigo', () => {
      // Evento sem data no cadastro: a agenda recua para a data da mídia ou a
      // de criação. Uma ocorrência em branco não pode atropelar esse recuo.
      const recuado = { date: '2026-04-12', occurrences: [''] };

      expect(displayDate(recuado, new Date(2026, 3, 1))).toBe('2026-04-12');
    });

    test('respeita o evento que a API disse não ter dia nenhum', () => {
      // Lista vazia é a API afirmando que não há dia — diferente de campo
      // ausente, que é resposta antiga.
      const semDia = { date: '2026-04-12', occurrences: [] };

      expect(displayDate(semDia, new Date(2026, 3, 1))).toBe('2026-04-12');
      expect(
        expandOccurrences(
          { ...semDia, id: 'x' },
          new Date(2026, 3, 1),
          new Date(2026, 3, 30),
        ),
      ).toHaveLength(0);
    });
  });

  test('descreve quando o encontro acontece', () => {
    expect(describeRecurrence(clubMeeting)).toBe('Quarta-feira · 15:00');
  });

  test('usa o texto de reserva quando não há horário', () => {
    expect(formatEventTime(null)).toBe('Horário a definir');
    expect(
      describeRecurrence({ ...clubMeeting, time: null } as EventResponse),
    ).toBe('Quarta-feira · Horário a definir');
  });
});

test.describe('isClubMeeting', () => {
  test('reconhece o encontro semanal de um clubinho', () => {
    expect(isClubMeeting({ clubId: 'club-1' })).toBe(true);
  });

  test('evento comum da agenda não é encontro de clubinho', () => {
    expect(isClubMeeting({ clubId: null })).toBe(false);
    expect(isClubMeeting({})).toBe(false);
  });
});

test.describe('eventTimeLabel', () => {
  test('usa o horário do encontro de clubinho', () => {
    // A data do encontro é só o dia. Tirar a hora dali dava sempre 00:00, e a
    // tela mostrava "Horário não informado" com o clubinho tendo horário.
    expect(eventTimeLabel({ date: '2026-04-01', time: '18:00' })).toBe('18:00');
  });

  test('corta os segundos que a API manda na coluna de hora', () => {
    expect(eventTimeLabel({ date: '2026-04-01', time: '18:00:00' })).toBe(
      '18:00',
    );
  });

  test('cai para a hora da própria data quando não há horário', () => {
    expect(eventTimeLabel({ date: '2026-04-01T15:30:00' })).toBe('15:30');
  });

  test('meia-noite da data não conta como horário', () => {
    expect(eventTimeLabel({ date: '2026-04-01' })).toBe('Horário a definir');
    expect(eventTimeLabel({ date: '2026-04-01T00:00:00' })).toBe(
      'Horário a definir',
    );
  });

  test('horário em branco cai para o texto de reserva', () => {
    expect(eventTimeLabel({ date: '2026-04-01', time: '  ' })).toBe(
      'Horário a definir',
    );
  });
});
