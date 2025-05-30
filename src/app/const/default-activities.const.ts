import { Activity } from "../models/models";

export const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: 'SLEEP',
    name: 'DEFAULT_ACTIVITIES.SLEEP',
    description: '',
    icon:'moon-outline',
    recommendedTime: 60* 16, // 16 hours
    recommendedAmount: null,
    isFavorite: true,
    color: '#BA68C8'
  },
  {
    id: 'POOP',
    name: 'DEFAULT_ACTIVITIES.POOP',
    description: '',
    icon: 'prism-outline',
    recommendedAmount: 1,
    recommendedTime: null,
    isFavorite: true,
    color: '#A1887F'
  },

]
