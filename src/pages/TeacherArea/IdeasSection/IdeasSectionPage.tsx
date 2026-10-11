import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { IDEAS_SECTION_PAGE_TITLE } from '@/features/ideas-sections/constants';
import { IdeasSectionUserCreator } from '@/components/Adm/PageCreator/Templates/IdeasSectionEditor';

/**
 * Tela pública de compartilhar uma ideia.
 *
 * A revisão da administração mora em `IdeasSectionReviewPage`, dentro da
 * feature: as duas telas têm público, contrato e fluxo diferentes.
 */
export default function IdeasSectionPage() {
  useDocumentTitle(IDEAS_SECTION_PAGE_TITLE);

  return <IdeasSectionUserCreator data-testid="teacher-area-ideas-section-ideas-section-page" />;
}
