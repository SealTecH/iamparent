export interface Activity {
  id: string;
  name: string;
  description: string;
  icon: string;
  isFavorite: boolean;
  color: string;
  recommendedTime: number | null; // minutes
  recommendedAmount: number | null;
  notifications: {
    enabled: boolean,
    time: number | undefined
  }
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

export interface NotificationSettings {
  activityReminderEnabled: boolean;
  activityReminderInterval: number; // minutes
}

export interface DateSettings {
  apm: boolean;
}

export interface ThemeSettings {
  theme:'dark' | 'light';
}

export interface Settings {
  notificationSettings: NotificationSettings;
  language: string;
  dateSettings: DateSettings;
  themeSettings: ThemeSettings;
}
