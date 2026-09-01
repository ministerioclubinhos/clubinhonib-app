import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MediaItem, MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';

import { ImageSectionDraft } from '../types';
import ImageSectionEditor from './ImageSectionEditor';

const image = (title: string): MediaItem => ({
  id: `id-${title}`,
  title,
  description: '',
  mediaType: MediaType.IMAGE,
  uploadType: MediaUploadType.UPLOAD,
  platformType: MediaPlatform.ANY,
  isLocalFile: true,
  url: `https://s3/${title}.png`,
});

const section = (
  overrides: Partial<ImageSectionDraft> = {},
): ImageSectionDraft => ({
  id: 's1',
  caption: 'Abertura',
  description: 'Fotos da abertura',
  public: true,
  mediaItems: [],
  ...overrides,
});

describe('ImageSectionEditor', () => {
  it('mostra o estado vazio e o contador de imagens', () => {
    render(
      <ImageSectionEditor
        section={section()}
        index={0}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onAddImages={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Nenhuma imagem nesta seção ainda.'),
    ).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('edita legenda e descrição da seção', async () => {
    const onChange = vi.fn();
    render(
      <ImageSectionEditor
        section={section()}
        index={0}
        onChange={onChange}
        onRemove={vi.fn()}
        onAddImages={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByLabelText('Legenda da seção'), '!');

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ caption: 'Abertura!' }),
    );
  });

  it('alterna a visibilidade da seção', async () => {
    const onChange = vi.fn();
    render(
      <ImageSectionEditor
        section={section()}
        index={0}
        onChange={onChange}
        onRemove={vi.fn()}
        onAddImages={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('checkbox'));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ public: false }),
    );
  });

  it('remove a seção só após confirmar', async () => {
    const onRemove = vi.fn();
    render(
      <ImageSectionEditor
        section={section({ mediaItems: [image('a')] })}
        index={0}
        onChange={vi.fn()}
        onRemove={onRemove}
        onAddImages={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Remover seção 1' }));
    expect(onRemove).not.toHaveBeenCalled();

    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Remover' }),
    );

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('remove uma imagem da seção após confirmar', async () => {
    const onChange = vi.fn();
    render(
      <ImageSectionEditor
        section={section({ mediaItems: [image('a'), image('b')] })}
        index={0}
        onChange={onChange}
        onRemove={vi.fn()}
        onAddImages={vi.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Remover imagem 1 da seção 1' }),
    );
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Remover' }),
    );

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaItems: [expect.objectContaining({ title: 'b' })],
      }),
    );
  });

  it('pede as imagens ao formulário', async () => {
    const onAddImages = vi.fn();
    render(
      <ImageSectionEditor
        section={section()}
        index={0}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onAddImages={onAddImages}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Adicionar imagens' }),
    );

    expect(onAddImages).toHaveBeenCalledTimes(1);
  });
});
