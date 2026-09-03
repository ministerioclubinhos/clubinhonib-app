import { useEffect } from 'react';

import { IdeasSectionUserCreator } from '@/components/Adm/PageCreator/Templates/IdeasSectionEditor';

/**
 * Tela pública de compartilhar uma ideia.
 *
 * A revisão da administração mora em `IdeasSectionReviewPage`, dentro da
 * feature: as duas telas têm público, contrato e fluxo diferentes.
 */
export default function IdeasSectionPage() {
  useEffect(() => {
    document.title = 'Compartilhar Ideia Incrível';
  }, []);

  return <IdeasSectionUserCreator />;
}
