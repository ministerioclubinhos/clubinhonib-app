/**
 * O que está sendo ativado ou desativado.
 *
 * O diálogo é compartilhado, mas o texto não pode ser: perguntar "criança não
 * frequenta mais o clubinho?" ao desativar um **clubinho** já aconteceu, porque
 * a cópia estava fixa no componente. Com o assunto declarado, quem reusar o
 * diálogo para um terceiro caso precisa dizer qual é — e o TypeScript cobra.
 */
export enum ToggleActiveSubject {
  Child = 'child',
  Club = 'club',
}

/** Os dois textos que mudam conforme o assunto e o sentido da ação. */
export interface ToggleActiveCopy {
  /** A pergunta no topo do corpo. */
  question: string;
  /** A consequência, destacada abaixo do nome. */
  consequence: string;
}
