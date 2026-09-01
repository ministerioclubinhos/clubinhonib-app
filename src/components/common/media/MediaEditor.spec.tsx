import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MediaItem, MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';

import { MEDIA_EDITOR_CONFIG } from './constants';
import MediaEditor from './MediaEditor';

const videoConfig = MEDIA_EDITOR_CONFIG[MediaType.VIDEO];

const storedVideo: MediaItem = {
  id: 'video-1',
  title: 'Vídeo publicado',
  description: 'Descrição publicada',
  mediaType: MediaType.VIDEO,
  uploadType: MediaUploadType.LINK,
  platformType: MediaPlatform.YOUTUBE,
  url: 'https://www.youtube.com/embed/abc',
};

describe('MediaEditor', () => {
  it('adds a linked item with the values typed by the admin', async () => {
    const onChange = vi.fn();

    render(<MediaEditor config={videoConfig} items={[]} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText(/^Título do Vídeo/), 'Novo vídeo');
    await userEvent.type(screen.getByLabelText(/^Descrição do Vídeo/), 'Nova descrição');
    await userEvent.type(
      screen.getByLabelText(/^URL do Vídeo/),
      'https://www.youtube.com/watch?v=abc',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar Vídeo' }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        title: 'Novo vídeo',
        description: 'Nova descrição',
        mediaType: MediaType.VIDEO,
        uploadType: MediaUploadType.LINK,
        platformType: MediaPlatform.YOUTUBE,
        url: 'https://www.youtube.com/watch?v=abc',
      }),
    ]);
  });

  it('refuses to add an item with missing fields', async () => {
    const onChange = vi.fn();

    render(<MediaEditor config={videoConfig} items={[]} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Adicionar Vídeo' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getAllByText('Este campo é obrigatório.')).toHaveLength(2);
  });

  it('keeps the id of an existing item when it is edited', async () => {
    const onChange = vi.fn();

    render(
      <MediaEditor config={videoConfig} items={[storedVideo]} onChange={onChange} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Editar Vídeo publicado' }));
    await userEvent.clear(screen.getByLabelText(/^Título do Vídeo/));
    await userEvent.type(screen.getByLabelText(/^Título do Vídeo/), 'Vídeo renomeado');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'video-1', title: 'Vídeo renomeado' }),
    ]);
  });

  it('removes an item only after the confirmation dialog', async () => {
    const onChange = vi.fn();

    render(
      <MediaEditor config={videoConfig} items={[storedVideo]} onChange={onChange} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Remover Vídeo publicado' }));
    expect(onChange).not.toHaveBeenCalled();

    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Remover' }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('mostra o estado vazio quando nada foi adicionado', () => {
    render(<MediaEditor config={videoConfig} items={[]} onChange={vi.fn()} />);

    expect(
      screen.getByText('Nenhum item deste tipo foi adicionado ainda.'),
    ).toBeInTheDocument();
  });

  it('sai do modo de edição sem alterar a lista ao cancelar', async () => {
    const onChange = vi.fn();

    render(
      <MediaEditor config={videoConfig} items={[storedVideo]} onChange={onChange} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Editar Vídeo publicado' }));
    expect(screen.getByText('Editando vídeo')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar edição' }));

    expect(screen.getByText('Adicionar vídeo')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Título do Vídeo/)).toHaveValue('');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('mantém o item correto em edição depois de remover um anterior', async () => {
    const onChange = vi.fn();
    const primeiro: MediaItem = { ...storedVideo, id: 'video-1', title: 'Primeiro' };
    const segundo: MediaItem = { ...storedVideo, id: 'video-2', title: 'Segundo' };

    // O editor é controlado: quem mantém a lista é o formulário. O wrapper
    // reproduz esse fluxo para que a remoção realmente encurte a lista.
    function ControlledEditor() {
      const [items, setItems] = useState<MediaItem[]>([primeiro, segundo]);
      return (
        <MediaEditor
          config={videoConfig}
          items={items}
          onChange={(next) => {
            onChange(next);
            setItems(next);
          }}
        />
      );
    }

    render(<ControlledEditor />);

    // Entra em edição no segundo item e, sem salvar, remove o primeiro.
    await userEvent.click(screen.getByRole('button', { name: 'Editar Segundo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remover Primeiro' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Remover' }),
    );

    expect(onChange).toHaveBeenLastCalledWith([segundo]);
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    onChange.mockClear();

    await userEvent.clear(screen.getByLabelText(/^Título do Vídeo/));
    await userEvent.type(screen.getByLabelText(/^Título do Vídeo/), 'Segundo editado');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'video-2', title: 'Segundo editado' }),
    ]);
  });

  it('adota a plataforma padrão ao editar um link salvo sem plataforma', async () => {
    const onChange = vi.fn();
    const semPlataforma: MediaItem = {
      ...storedVideo,
      id: 'video-legado',
      title: 'Link legado',
      platformType: undefined,
    };

    render(
      <MediaEditor config={videoConfig} items={[semPlataforma]} onChange={onChange} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Editar Link legado' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

    // Sem a plataforma, validateMediaURL reprovaria a URL e o item ficaria preso.
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'video-legado',
        platformType: MediaPlatform.YOUTUBE,
      }),
    ]);
  });

  it('hides the platform field when the item is an upload', async () => {

    render(<MediaEditor config={videoConfig} items={[]} onChange={vi.fn()} />);

    expect(screen.getByLabelText(/^Plataforma/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('combobox', { name: 'Tipo' }));
    await userEvent.click(screen.getByRole('option', { name: 'Upload' }));

    expect(screen.queryByLabelText(/^Plataforma/)).not.toBeInTheDocument();
    expect(screen.getByText('Upload de Vídeo')).toBeInTheDocument();
  });
});
