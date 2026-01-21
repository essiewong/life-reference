
export type Dimension = 'EMOTION' | 'CAREER';

export interface Milestone {
  id: string;
  ageRangeLabel: string;
  statusCode: string;
}

export interface UserProfile {
  birthDate: string;
  milestones: Record<Dimension, Milestone[]>;
}

export interface DistributionPoint {
  ageRange: string;
  percentage: number;
  isUserPosition: boolean;
}

export interface ComparisonData {
  dimension: Dimension;
  milestoneId: string;
  statusLabel: string;
  ageRangeLabel: string;
  timingCategory: 'EARLY' | 'MAINSTREAM' | 'LATE';
  distribution: DistributionPoint[];
}

export interface LifeReport {
  profile: UserProfile;
  comparisons: ComparisonData[];
  aiSummary: string;
}
