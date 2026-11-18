import { expect, test } from '@playwright/test';

import {
  formatCoordinatorClubsLabel,
  formatTeacherClubLabel,
} from '../../src/pages/TeacherArea/utils/clubLabel';

test.describe('rótulo do clubinho no cabeçalho da Área do Professor', () => {
  test('professor: número, bairro e cidade', () => {
    expect(formatTeacherClubLabel({ number: 91, district: 'Centro', city: 'Recife' })).toBe(
      'Clubinho 91 - Centro - Recife'
    );
  });

  test('professor: omite o que não está cadastrado', () => {
    expect(formatTeacherClubLabel({ number: 91, district: null, city: 'Recife' })).toBe(
      'Clubinho 91 - Recife'
    );
    expect(formatTeacherClubLabel({ number: 91 })).toBe('Clubinho 91');
  });

  test('coordenador: lista os números dos clubinhos', () => {
    const clubs = [23, 45, 43, 34].map((number) => ({ number }));
    expect(formatCoordinatorClubsLabel(clubs)).toBe('Clubinhos: 23 - 45 - 43 - 34');
    expect(formatCoordinatorClubsLabel([{ number: 7 }])).toBe('Clubinho: 7');
  });
});

test.describe('localização do clubinho no perfil', () => {
  test('junta bairro e cidade, só com o que existe', async () => {
    const { formatClubLocation } = await import('../../src/features/profile/utils');
    expect(formatClubLocation({ district: 'Centro', city: 'Recife' })).toBe('Centro - Recife');
    expect(formatClubLocation({ district: null, city: 'Recife' })).toBe('Recife');
    expect(formatClubLocation({ district: null, city: null })).toBe('');
  });
});
