export interface Feature {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
}

export interface Testimonial {
  id: string;
  comment: string;
  name: string;
  clubinho: string;
  neighborhood: string;
}

export interface CardData {
  id: string;
  title: string;
  description: string;
  image: string;
  path: string;
  public: boolean;
  entityType: string;
  idToFetch: string;
  current?: boolean;
  subtitle?: string;
}

export interface HeroSectionProps {
  isAuthenticated: boolean;
}

export interface FeaturesSectionProps {
  features: Feature[];
}

export interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export interface CTASectionProps {
  isAuthenticated: boolean;
}

export interface CardsSectionProps {
  cards: CardData[];
}

export interface WeekMaterialsBannerProps {
  currentWeekRoute: CardData | null;
  userName?: string;
}
