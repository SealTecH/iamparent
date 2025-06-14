import { Settings } from "../models/models";

export const DEFAULT_SETTINGS: Settings = {
  notificationSettings: {
    activityReminderEnabled: true,
    activityReminderInterval: 180
  },
  language: 'ru',
  dateSettings:{
    apm: true,
  },
  themeSettings: {
    theme: 'dark'
  }
}
