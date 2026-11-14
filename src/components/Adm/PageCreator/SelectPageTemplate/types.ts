import type { ReactElement } from 'react';

/** Modelos de página que o administrador pode criar. */
export enum PageTemplateId {
  WEEK_MATERIALS = 'WEEK_MATERIALS',
  MEDITATION = 'MEDITATION',
  GALLERY = 'GALLERY',
  VIDEOS = 'VIDEOS',
  IDEAS = 'IDEAS',
}

/** Descrição de um modelo exibido na grade de escolha. */
export interface PageTemplateDefinition {
  id: PageTemplateId;
  title: string;
  description: string;
  icon: ReactElement;
  /** Renderiza o criador do modelo já em modo de criação. */
  render: () => ReactElement;
}

export interface PageTemplateCardProps {
  template: PageTemplateDefinition;
  onSelect: (id: PageTemplateId) => void;
}
