export interface BannerSectionProps {
  showWeekBanner: boolean;
  showMeditationBanner: boolean;
}

export interface MotivationSectionProps {
  motivationText: string;
}

export interface TeacherContentProps {
  userName?: string;
}

/** Sem propriedades: o componente se vira sozinho. */
export type SpecialFamilyCalloutProps = Record<string, never>;

/** Sem propriedades: o componente se vira sozinho. */
export type IdeasSharingBannerProps = Record<string, never>;

/** Sem propriedades: o componente se vira sozinho. */
export type InformativeBannerProps = Record<string, never>;

export interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
}

export interface TeacherAreaState {
  loading: boolean;
  showWeek: boolean;
  showMeditation: boolean;
}
