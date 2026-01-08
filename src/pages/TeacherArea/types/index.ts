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
  
}

export interface IdeasSharingBannerProps {
  
}

export interface InformativeBannerProps {
  
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
