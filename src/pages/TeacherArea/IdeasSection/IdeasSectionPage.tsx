import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { IDEAS_SECTION_PAGE_TITLE } from '@/features/ideas-sections/constants';
import { IdeaShareForm } from '@/features/ideas-sections';

/**
 * Tela pública de compartilhar uma ideia.
 *
 * A revisão da administração mora em `IdeasSectionReviewPage`, dentro da
 * feature: as duas telas têm público, contrato e fluxo diferentes.
 */
export default function IdeasSectionPage() {
  useDocumentTitle(IDEAS_SECTION_PAGE_TITLE);

  return <div data-testid="teacher-area-ideas-section-page"><IdeaShareForm /></div>;
}
