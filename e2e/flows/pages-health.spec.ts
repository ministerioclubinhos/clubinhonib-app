import fs from 'node:fs';
import path from 'node:path';

import { type Browser, expect, test } from '@playwright/test';

import { ApiClient } from '../support/api';
import {
  ADMIN_STORAGE,
  COORDINATOR_EMAIL,
  COORDINATOR_PASSWORD,
  TEACHER_EMAIL,
  TEACHER_PASSWORD,
} from '../support/env';
import { enableProductFlags } from '../support/featureFlags';
import { inspectPage, SWEEP_DIR } from '../support/pageHealth';
import { loginAs } from '../support/session';

/**
 * Saúde de todas as telas, por perfil, em desktop e celular.
 *
 * Cada tela é aberta contra a API real e reprova com exceção de JavaScript,
 * erro no console, resposta de erro da API, carregamento preso, endereço
 * diferente do esperado ou conteúdo vazando da largura da janela. A captura de
 * cada uma fica em `SWEEP_DIR` para a revisão visual.
 */
enum Role {
  Visitor = 'visitante',
  Admin = 'admin',
  Coordinator = 'coordenador',
  Teacher = 'professor',
}

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, touch: false },
  { name: 'mobile', width: 360, height: 780, touch: true },
] as const;

type ContentKey = 'weekMaterial' | 'ideasPage' | 'videoPage' | 'imagePage' | 'publicImagePage' | 'publicVideoPage' | 'child';

interface Screen {
  route: string;
  /** Endereço em que a tela deve terminar; por padrão, o próprio. */
  landsOn?: string;
  /** Registro existente que substitui `:id` na rota. */
  content?: ContentKey;
  /** A tela depende de um registro fixado no ambiente do front. */
  environmentRecord?: 'specialFamilyDay';
}

/** `VITE_SPECIAL_FAMILY_DAY_ID` do ambiente local (`env/env.local`). */
const SPECIAL_FAMILY_DAY_ID =
  /^VITE_SPECIAL_FAMILY_DAY_ID=(.+)$/m.exec(fs.readFileSync('env/env.local', 'utf8'))?.[1]?.trim() ?? '';

const PUBLIC_SCREENS: Screen[] = [
  { route: '/' },
  { route: '/sobre' },
  { route: '/contato' },
  { route: '/eventos' },
  { route: '/feed-clubinho' },
  { route: '/fotos-e-videos' },
  { route: '/fotos-e-videos/fotos/:id', content: 'publicImagePage' },
  { route: '/fotos-e-videos/videos/:id', content: 'publicVideoPage' },
  { route: '/acesso-negado' },
  { route: '/rota-que-nao-existe' },
];

const VISITOR_SCREENS: Screen[] = [
  ...PUBLIC_SCREENS,
  { route: '/dia-especial-familia', landsOn: '/login' },
  { route: '/login' },
  { route: '/cadastrar' },
  { route: '/esqueci-senha' },
  { route: '/redefinir-senha' },
  { route: '/verificar-email' },
  { route: '/descadastrar' },
  { route: '/area-do-professor', landsOn: '/login' },
  { route: '/area-das-criancas', landsOn: '/login' },
  { route: '/meu-perfil', landsOn: '/login' },
  { route: '/adm', landsOn: '/login' },
  { route: '/adm/estudio', landsOn: '/login' },
];

const TEACHER_AREA_SCREENS: Screen[] = [
  { route: '/area-do-professor' },
  { route: '/dia-especial-familia', environmentRecord: 'specialFamilyDay' },
  { route: '/lista-materias-semanais' },
  { route: '/materiais-semanais/:id', content: 'weekMaterial' },
  { route: '/area-do-professor/documentos' },
  { route: '/area-do-professor/videos' },
  { route: '/area-do-professor/videos/:id', content: 'videoPage' },
  { route: '/area-do-professor/ideias' },
  { route: '/area-do-professor/ideias/:id', content: 'ideasPage' },
  { route: '/area-do-professor/play' },
  { route: '/fotos-videos-clubinho' },
  { route: '/compartilhar-ideia' },
  { route: '/meu-perfil' },
  { route: '/notificacoes' },
  { route: '/avaliar-site' },
  { route: '/area-das-criancas' },
];

const ADMIN_SCREENS: Screen[] = [
  '/adm',
  '/adm/meditacoes',
  '/adm/comentarios',
  '/adm/documentos',
  '/adm/informativos',
  '/adm/feedbacks',
  '/adm/contatos',
  '/adm/paginas-materiais-semanais',
  '/adm/paginas-fotos',
  '/adm/fotos-clubinhos',
  '/adm/ideias-compartilhadas',
  '/adm/paginas-videos',
  '/adm/play',
  '/adm/play/envios',
  '/adm/paginas-ideias',
  '/adm/criar-pagina',
  '/adm/usuarios',
  '/adm/perfis',
  '/adm/coordenadores',
  '/adm/professores',
  '/adm/criancas',
  '/adm/clubinhos',
  '/adm/pagelas',
  '/adm/estatisticas',
  '/adm/controle-clubinhos',
  '/adm/periodo-letivo',
  '/adm/feature-flags',
  '/adm/observabilidade-auditoria',
  '/adm/config-provedores-ia',
  '/adm/estudio',
  '/adm/estudio/licoes',
  '/adm/estudio/revisao',
  '/adm/estudio/orientacoes',
].map((route) => ({ route }));

const ADMIN_EXTRA_SCREENS: Screen[] = [
  // A flag do resumo semanal é voltada só à coordenação: o admin volta ao painel.
  { route: '/adm/resumo-semanal', landsOn: '/adm' },
  { route: '/adm/editar-pagina-semana/:id', content: 'weekMaterial' },
  { route: '/adm/editar-pagina-ideias/:id', content: 'ideasPage' },
  { route: '/adm/editar-pagina-videos/:id', content: 'videoPage' },
  { route: '/adm/editar-pagina-imagens/:id', content: 'imagePage' },
  { route: '/area-das-criancas/:id', content: 'child' },
];

const COORDINATOR_SCREENS: Screen[] = [
  ...TEACHER_AREA_SCREENS,
  { route: '/adm' },
  { route: '/adm/criancas' },
  { route: '/adm/professores' },
  { route: '/adm/clubinhos' },
  { route: '/adm/pagelas' },
  { route: '/adm/resumo-semanal' },
  { route: '/adm/perfis' },
  // Telas exclusivas do administrador não podem abrir para a coordenação.
  { route: '/adm/estudio', landsOn: '/acesso-negado' },
  { route: '/adm/feature-flags', landsOn: '/acesso-negado' },
  { route: '/adm/observabilidade-auditoria', landsOn: '/acesso-negado' },
  { route: '/adm/config-provedores-ia', landsOn: '/acesso-negado' },
  { route: '/adm/estatisticas', landsOn: '/acesso-negado' },
];

const TEACHER_SCREENS: Screen[] = [
  ...TEACHER_AREA_SCREENS,
  ...PUBLIC_SCREENS.slice(0, 5),
  { route: '/adm', landsOn: '/acesso-negado' },
  { route: '/adm/usuarios', landsOn: '/acesso-negado' },
];

const MATRIX: Record<Role, Screen[]> = {
  [Role.Visitor]: VISITOR_SCREENS,
  [Role.Admin]: [...PUBLIC_SCREENS.slice(0, 6), ...TEACHER_AREA_SCREENS, ...ADMIN_SCREENS, ...ADMIN_EXTRA_SCREENS],
  [Role.Coordinator]: COORDINATOR_SCREENS,
  [Role.Teacher]: TEACHER_SCREENS,
};

interface Listing {
  data?: { id: string; public?: boolean }[];
  items?: { id: string; public?: boolean }[];
}

async function loadContentIds(api: ApiClient): Promise<Partial<Record<ContentKey, string>>> {
  const first = async (endpoint: string, onlyPublic = false): Promise<string | undefined> => {
    const listing = await api.get<Listing>(endpoint, { page: 1, limit: 50 });
    const rows = listing.data ?? listing.items ?? [];
    return rows.find((row) => !onlyPublic || row.public)?.id;
  };
  return {
    weekMaterial: await first('/week-material-pages'),
    ideasPage: await first('/ideas-pages'),
    videoPage: await first('/video-pages'),
    imagePage: await first('/image-pages'),
    publicImagePage: await first('/image-pages', true),
    publicVideoPage: await first('/video-pages', true),
    child: await first('/children'),
  };
}

const CREDENTIALS: Partial<Record<Role, [string, string]>> = {
  [Role.Coordinator]: [COORDINATOR_EMAIL, COORDINATOR_PASSWORD],
  [Role.Teacher]: [TEACHER_EMAIL, TEACHER_PASSWORD],
};

async function storageFor(browser: Browser, role: Role): Promise<string | undefined> {
  if (role === Role.Visitor) return undefined;
  if (role === Role.Admin) return ADMIN_STORAGE;
  const [email, password] = CREDENTIALS[role] as [string, string];
  const page = await loginAs(browser, email, password);
  const file = `e2e/.auth/sweep-${role}.json`;
  await page.context().storageState({ path: file });
  await page.context().close();
  return file;
}

const slug = (route: string): string => route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';

test.describe('Saúde das telas', () => {
  let api: ApiClient;
  let restoreFlags: () => Promise<void>;
  let ids: Partial<Record<ContentKey, string>>;
  let missingEnvironmentRecord = false;

  test.beforeAll(async () => {
    api = await ApiClient.login();
    restoreFlags = await enableProductFlags(api);
    ids = await loadContentIds(api);
    missingEnvironmentRecord = (await api.statusOf(`/week-material-pages/${SPECIAL_FAMILY_DAY_ID}`)) === 404;
  });

  test.afterAll(async () => {
    await restoreFlags?.();
    await api?.dispose();
  });

  for (const role of Object.values(Role)) {
    test.describe(role, () => {
      let storage: string | undefined;

      test.beforeAll(async ({ browser }) => {
        storage = await storageFor(browser, role);
      });

      for (const viewport of VIEWPORTS) {
        for (const screen of MATRIX[role]) {
          test(`${viewport.name} ${screen.route}`, async ({ browser }) => {
            let route = screen.route;
            if (screen.content) {
              const id = ids[screen.content];
              expect(id, `sem registro local para ${screen.content}`).toBeTruthy();
              route = route.replace(':id', id as string);
            }
            const context = await browser.newContext({
              storageState: storage ?? { cookies: [], origins: [] },
              viewport: { width: viewport.width, height: viewport.height },
              hasTouch: viewport.touch,
              isMobile: viewport.touch,
              locale: 'pt-BR',
              timezoneId: 'America/Sao_Paulo',
              reducedMotion: 'reduce',
            });
            try {
              const page = await context.newPage();
              const name = `${role}-${viewport.name}-${slug(screen.route)}`;
              const problems = await inspectPage(page, route, name);
              fs.appendFileSync(
                path.join(SWEEP_DIR, 'report.jsonl'),
                `${JSON.stringify({ role, viewport: viewport.name, route: screen.route, ...problems })}\n`
              );

              // Sem o registro no banco deste ambiente, a tela tem de explicar o erro
              // (a única falha de API aceita é a dele).
              if (screen.environmentRecord && missingEnvironmentRecord) {
                await expect(page.getByText('Erro ao carregar os dados do Dia Especial da Família.')).toBeVisible();
                problems.apiFailures = problems.apiFailures.filter((line) => !line.includes(SPECIAL_FAMILY_DAY_ID));
              }

              expect.soft(new URL(page.url()).pathname, 'endereço final').toBe(screen.landsOn ?? route);
              expect.soft(problems.pageErrors, 'exceções de JavaScript').toEqual([]);
              expect.soft(problems.consoleErrors, 'erros no console').toEqual([]);
              expect.soft(problems.apiFailures, 'respostas de erro da API').toEqual([]);
              expect.soft(problems.overflow, 'conteúdo vazando da largura').toEqual([]);
            } finally {
              await context.close();
            }
          });
        }
      }
    });
  }
});
