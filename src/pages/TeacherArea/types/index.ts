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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SpecialFamilyCalloutProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IdeasSharingBannerProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InformativeBannerProps {}

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
