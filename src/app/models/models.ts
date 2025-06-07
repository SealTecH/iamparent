export interface Activity {
  id: string;
  name: string;
  description: string;
  icon: string;
  isFavorite: boolean;
  color: string;
  recommendedTime: number | null; // minutes
  recommendedAmount: number | null;
}

export interface Action {
  id: string;
  activityId: string;
  time: number; // timestamp
  comment: string;
  timeDone: number | null; // minutes
  countDone: number | null;
  linkedPhotoUrls: string[];
}

export type Timeline = (Action & { activity: Activity });
