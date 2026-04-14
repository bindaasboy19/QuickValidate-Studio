export type Language = 'en' | 'hi';
export type UserType = 'student' | 'independent' | 'founder';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  language: Language;
  userType: UserType;
  location?: string;
  createdAt: string;
}

export interface Idea {
  id: string;
  userId: string;
  title: string;
  description: string;
  problem: string;
  targetCustomer: string;
  assumptions: string[];
  timeConstraint: string;
  budgetConstraint: string;
  location: string;
  sector: string;
  validationScore: number;
  status: 'draft' | 'active' | 'validated' | 'pivoted';
  createdAt: string;
}

export interface Experiment {
  id: string;
  ideaId: string;
  userId: string;
  name: string;
  goal: string;
  type: 'survey' | 'landing_page' | 'whatsapp_outreach' | 'field_interview' | 'other';
  status: 'planned' | 'running' | 'completed';
  metrics: {
    reach: number;
    positiveSignals: number;
    conversionRate: number;
  };
  templateData?: any;
  learnings?: string;
  createdAt: string;
  completedAt?: string;
}
