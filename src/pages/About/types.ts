export interface AboutSection {
  id: string;
  title: string;
  content: string;
  isMain?: boolean;
}

export interface AboutPageProps {
  sections?: AboutSection[];
}
