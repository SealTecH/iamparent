import { CounterBasedActivity, TimeBasedActivity } from "../models/models";

export const DEFAULT_ACTIVITIES:(TimeBasedActivity | CounterBasedActivity)[] = [
  {
    id: 'SLEEP',
    name: 'DEFAULT_ACTIVITIES.SLEEP',
    description: '',
    icon:'moon-outline',
    recommendedTime: 60* 16, // 16 hours
    isFavorite: true
  },
  {
    id: 'POOP',
    name: 'DEFAULT_ACTIVITIES.POOP',
    description: '',
    icon: 'prism-outline',
    recommendedAmount: 1,
    isFavorite: true
  },

]
