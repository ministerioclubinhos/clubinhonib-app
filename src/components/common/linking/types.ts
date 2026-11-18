/**
 * Contratos do diálogo de vínculo.
 *
 * Professor ↔ clubinho, coordenador ↔ clubinhos e clubinho ↔ professores são a
 * mesma operação vista de ângulos diferentes. As três telas entram com os dados
 * e recebem os eventos; o arranjo, os estados e as travas ficam num lugar só.
 */

/** Um vínculo que já existe. */
export type LinkedItem = {
  id: string;
  primary: string;
  /** Contexto curto exibido abaixo do título. */
  secondary?: string;
};

/** Uma opção oferecida para vincular. */
export type LinkOption = {
  id: string;
  label: string;
  /**
   * Motivo pelo qual a opção não pode ser escolhida. Quando presente, a opção
   * aparece desabilitada com este texto — sumir com ela esconderia o porquê.
   */
  blockedReason?: string;
};

/**
 * Quantos vínculos o lado editado comporta.
 *
 * `single` troca o vínculo atual; `multiple` acrescenta ao conjunto.
 */
export type LinkCardinality = "single" | "multiple";
