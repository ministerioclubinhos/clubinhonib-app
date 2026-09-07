import { FEATURE, type FeatureKey } from "@/features/feature-flags";

/**
 * Rotas de `/adm` que um coordenador enxerga.
 *
 * O menu lateral e o painel mantinham cada um a sua lista, e elas já haviam
 * divergido: o painel oferecia `/adm/usuarios` ao coordenador, mas a rota
 * `GET /users` da API é exclusiva do administrador — o card levava a uma tela
 * que só respondia 403.
 */
const COORDINATOR_ROUTES: ReadonlyArray<{ path: string; flag?: FeatureKey }> = [
  { path: "/adm/criancas", flag: FEATURE.CHILDREN_AREA },
  { path: "/adm/professores" },
  { path: "/adm/clubinhos" },
  { path: "/adm/pagelas" },
  { path: "/adm/resumo-semanal", flag: FEATURE.CLUB_WEEKLY_SUMMARY },
  { path: "/adm/perfis" },
];

/** As rotas que o coordenador vê, considerando as flags ligadas. */
export function coordinatorAllowedRoutes(
  flags: Record<FeatureKey, boolean>,
): Set<string> {
  return new Set(
    COORDINATOR_ROUTES.filter(
      (route) => !route.flag || flags[route.flag],
    ).map((route) => route.path),
  );
}
