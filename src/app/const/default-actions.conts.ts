import { Action } from "../models/models";

export const DEFAULT_ACTIONS: Action[] = [
  {
    id: 'DEFAULT_ACTION_SLEEP',
    activityId: 'SLEEP',
    time: new Date().setHours(8, 0, 0, 0),
    timeDone: 120,
    countDone: null,
    comment: 'sleep like a baby'
  },
  {
    id: 'DEFAULT_ACTION_POOP',
    activityId: 'POOP',
    time: new Date().setHours(9, 15, 0, 0),
    countDone: 1,
    timeDone: null,
    comment: ''
  }
]
