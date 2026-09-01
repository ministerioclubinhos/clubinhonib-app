import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MeditationDayDraft, MeditationWeekDay } from '../types';
import MeditationDaysEditor from './MeditationDaysEditor';

const day = (weekDay: MeditationWeekDay): MeditationDayDraft => ({
  id: `id-${weekDay}`,
  day: weekDay,
  verse: `Verso ${weekDay}`,
  topic: `Tema ${weekDay}`,
});

describe('MeditationDaysEditor', () => {
  it('mostra o estado vazio e o contador da semana', () => {
    render(<MeditationDaysEditor days={[]} onChange={vi.fn()} />);

    expect(screen.getByText(/Nenhum dia adicionado ainda/)).toBeInTheDocument();
    expect(screen.getByText('0 de 5')).toBeInTheDocument();
  });

  it('adiciona um dia com tema e versículo', async () => {
    const onChange = vi.fn();
    render(<MeditationDaysEditor days={[]} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText(/^Tema do dia/), 'Gratidão');
    await userEvent.type(screen.getByLabelText(/^Versículo/), 'Sl 100');
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar dia' }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        day: MeditationWeekDay.Monday,
        topic: 'Gratidão',
        verse: 'Sl 100',
      }),
    ]);
  });

  it('recusa dia sem tema ou versículo', async () => {
    const onChange = vi.fn();
    render(<MeditationDaysEditor days={[]} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Adicionar dia' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getByText('Preencha o tema e o versículo do dia.'),
    ).toBeInTheDocument();
  });

  it('preserva o id ao editar um dia existente', async () => {
    const onChange = vi.fn();
    render(
      <MeditationDaysEditor
        days={[day(MeditationWeekDay.Monday)]}
        onChange={onChange}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Editar Segunda-feira' }),
    );
    await userEvent.clear(screen.getByLabelText(/^Tema do dia/));
    await userEvent.type(screen.getByLabelText(/^Tema do dia/), 'Novo tema');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar dia' }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'id-Monday', topic: 'Novo tema' }),
    ]);
  });

  it('esconde o formulário quando a semana está completa', () => {
    const week = [
      MeditationWeekDay.Monday,
      MeditationWeekDay.Tuesday,
      MeditationWeekDay.Wednesday,
      MeditationWeekDay.Thursday,
      MeditationWeekDay.Friday,
    ].map(day);

    render(<MeditationDaysEditor days={week} onChange={vi.fn()} />);

    expect(screen.getByText('5 de 5')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Adicionar dia' }),
    ).not.toBeInTheDocument();
  });

  it('remove um dia só após confirmar', async () => {
    const onChange = vi.fn();
    render(
      <MeditationDaysEditor
        days={[day(MeditationWeekDay.Monday)]}
        onChange={onChange}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Remover Segunda-feira' }),
    );
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Remover' }),
    );

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('mantém o dia certo em edição depois de remover um anterior', async () => {
    const onChange = vi.fn();
    const monday = day(MeditationWeekDay.Monday);
    const tuesday = day(MeditationWeekDay.Tuesday);

    function Controlled() {
      const [days, setDays] = useState<MeditationDayDraft[]>([monday, tuesday]);
      return (
        <MeditationDaysEditor
          days={days}
          onChange={(next) => {
            onChange(next);
            setDays(next);
          }}
        />
      );
    }

    render(<Controlled />);

    await userEvent.click(screen.getByRole('button', { name: 'Editar Terça-feira' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remover Segunda-feira' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Remover' }),
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    onChange.mockClear();

    await userEvent.clear(screen.getByLabelText(/^Tema do dia/));
    await userEvent.type(screen.getByLabelText(/^Tema do dia/), 'Terça editada');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar dia' }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'id-Tuesday', topic: 'Terça editada' }),
    ]);
  });
});
