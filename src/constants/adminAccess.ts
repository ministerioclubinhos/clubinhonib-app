import { FEATURE, type FeatureKey } from "@/features/feature-flags";

/**
 * Rotas de `/adm` que um coordenador enxerga.
 *
 * O menu lateral e o painel mantinham cada um a sua lista, e elas já haviam
 * divergido: o painel oferecia `/adm/usuarios` ao coordenador, mas a rota
 * `GET /users` da API é exclusiva do administrador — o card levava a uma tela
 * que só respondia 403.
 *
 * Aqui convivem as duas condições, e cada uma tem o seu lugar:
 *
 * - `COORDINATOR_ADMIN_ROUTES` é a **regra de perfil**: o que a regra de
 *   negócio permite ao coordenador. Não muda pelo painel de flags.
 * - `COORDINATOR_ROUTE_FLAGS` é a **feature flag** que, além da regra, precisa
 *   estar ligada para o coordenador ver o item.
 *
 * pode ver = regra de perfil E flag ligada (quando o item tem flag).
 */
export const COORDINATOR_ADMIN_ROUTES: ReadonlyArray<string> = [
  "/adm/criancas",
  "/adm/professores",
  "/adm/clubinhos",
  "/adm/pagelas",
  "/adm/resumo-semanal",
  "/adm/perfis",
];

/**
 * Flags exigidas do coordenador, por rota, somadas à regra de perfil.
 *
 * A gestão de crianças segue a flag da Área das Crianças para o coordenador:
 * com ela desligada, a coordenação trabalha pelas pagelas, e o item some do
 * menu dele. É uma combinação deliberada de regra de perfil e flag.
 */
export const COORDINATOR_ROUTE_FLAGS: Readonly<Record<string, FeatureKey>> = {
  "/adm/criancas": FEATURE.CHILDREN_AREA,
  "/adm/resumo-semanal": FEATURE.CLUB_WEEKLY_SUMMARY,
};

/** As rotas que o coordenador vê: regra de perfil E flags ligadas. */
export function coordinatorAllowedRoutes(
  flags: Record<FeatureKey, boolean>,
): Set<string> {
  return new Set(
    COORDINATOR_ADMIN_ROUTES.filter((path) => {
      const flag = COORDINATOR_ROUTE_FLAGS[path];
      return !flag || flags[flag];
    }),
  );
}
