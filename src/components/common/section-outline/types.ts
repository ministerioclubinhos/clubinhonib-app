/** Item do índice lateral de seções. */
export interface SectionOutlineItem {
  key: string;
  index: number;
  title: string;
  public: boolean;
  hasError: boolean;
  hasDraft: boolean;
}

export interface SectionOutlineProps {
  items: SectionOutlineItem[];
  onSelect: (key: string) => void;
}

/** Mensagens da API agrupadas pelo índice (zero-based) da seção afetada. */
export type SectionApiErrors = Record<number, string[]>;
