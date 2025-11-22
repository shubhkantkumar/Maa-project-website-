export enum FeatureCategory {
  CORE = 'Core',
  FUTURE = 'Futuristic',
  HARDWARE = 'Hardware'
}

export interface ProjectFeature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: FeatureCategory;
}

export interface TimelineStage {
  stage: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface StatItem {
  value: string;
  label: string;
  subtext?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
