import { Navigate, useParams } from 'react-router-dom';

import PageRenderer from '@/components/PageRenderer/PageRenderer';

import type { NestedEntityType } from './pagePaths';

interface Props {
  entityType: NestedEntityType;
}

/** Renderiza, dentro da casca da Área do Professor, a página cujo id vem na URL. */
export default function TeacherNestedPage({ entityType }: Props) {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/area-do-professor" replace />;
  // `key` força remontar ao trocar de página (o id muda, a rota não).
  return <PageRenderer key={`${entityType}-${id}`} entityType={entityType} idToFetch={id} />;
}
