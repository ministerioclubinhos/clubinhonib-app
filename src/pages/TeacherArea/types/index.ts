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

export interface SpecialFamilyCalloutProps {
  // Add props if needed in the future
}

export interface IdeasSharingBannerProps {
  // Add props if needed in the future
}

export interface InformativeBannerProps {
  // Add props if needed in the future
}

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
