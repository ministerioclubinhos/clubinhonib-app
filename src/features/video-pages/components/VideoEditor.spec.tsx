import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';

import { VideoDraft } from '../types';
import VideoEditor from './VideoEditor';

const linked = (overrides: Partial<VideoDraft> = {}): VideoDraft => ({
  id: 'video-1',
  title: 'Vídeo publicado',
  description: 'Descrição',
  mediaType: MediaType.VIDEO,
  uploadType: MediaUploadType.LINK,
  platformType: MediaPlatform.YOUTUBE,
  url: 'https://www.youtube.com/embed/abc',
  ...overrides,
});

describe('VideoEditor', () => {
  it('mostra o estado vazio quando não há vídeo', () => {
    render(<VideoEditor videos={[]} onChange={vi.fn()} />);

    expect(screen.getByText('Nenhum vídeo adicionado ainda.')).toBeInTheDocument();
  });

  it('adiciona um vídeo de link', async () => {
    const onChange = vi.fn();
    render(<VideoEditor videos={[]} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText(/^Título do vídeo/), 'Aula 1');
    await userEvent.type(screen.getByLabelText(/^Descrição do vídeo/), 'Abertura');
    await userEvent.type(
      screen.getByLabelText(/^URL do vídeo/),
      'https://www.youtube.com/watch?v=abc',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar vídeo' }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ title: 'Aula 1', description: 'Abertura' }),
    ]);
  });

  it('recusa vídeo sem título ou descrição', async () => {
    const onChange = vi.fn();
    render(<VideoEditor videos={[]} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Adicionar vídeo' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getAllByText('Este campo é obrigatório.')).toHaveLength(2);
  });

  it('aceita salvar um upload já existente sem escolher novo arquivo', async () => {
    // O arquivo continua no S3: exigir um novo travaria a edição.
    const onChange = vi.fn();
    const stored = linked({
      id: 'video-2',
      uploadType: MediaUploadType.UPLOAD,
      isLocalFile: true,
      url: 'https://s3/video.mp4',
      originalName: 'video.mp4',
      platformType: undefined,
    });

    render(<VideoEditor videos={[stored]} onChange={onChange} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Editar Vídeo publicado' }),
    );
    await userEvent.clear(screen.getByLabelText(/^Título do vídeo/));
    await userEvent.type(screen.getByLabelText(/^Título do vídeo/), 'Renomeado');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'video-2', title: 'Renomeado' }),
    ]);
  });

  it('sai da edição sem alterar a lista ao cancelar', async () => {
    const onChange = vi.fn();
    render(<VideoEditor videos={[linked()]} onChange={onChange} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Editar Vídeo publicado' }),
    );
    expect(screen.getByText('Editando vídeo')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar edição' }));

    expect(screen.queryByText('Editando vídeo')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^Título do vídeo/)).toHaveValue('');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('mantém o vídeo certo em edição depois de remover um anterior', async () => {
    const onChange = vi.fn();
    const primeiro = linked({ id: 'v1', title: 'Primeiro' });
    const segundo = linked({ id: 'v2', title: 'Segundo' });

    function Controlled() {
      const [videos, setVideos] = useState<VideoDraft[]>([primeiro, segundo]);
      return (
        <VideoEditor
          videos={videos}
          onChange={(next) => {
            onChange(next);
            setVideos(next);
          }}
        />
      );
    }

    render(<Controlled />);

    await userEvent.click(screen.getByRole('button', { name: 'Editar Segundo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remover Primeiro' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Remover' }),
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    onChange.mockClear();

    await userEvent.clear(screen.getByLabelText(/^Título do vídeo/));
    await userEvent.type(screen.getByLabelText(/^Título do vídeo/), 'Segundo editado');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'v2', title: 'Segundo editado' }),
    ]);
  });
});
