import { CounterBasedAction, TimeBasedAction } from "../models/models";
import { generateDayIdToday } from "../shared/utils/generate-day-id-today.func";

export const DEFAULT_ACTIONS: (TimeBasedAction | CounterBasedAction)[] = [
  {
    id: 'DEFAULT_ACTION_SLEEP',
    activityId: 'SLEEP',
    time: new Date().setHours(8, 0, 0, 0),
    dayId: generateDayIdToday(),
    timeDone: 120
  },
  {
    id: 'DEFAULT_ACTION_POOP',
    activityId: 'POOP',
    time: new Date().setHours(9, 15, 0, 0),
    dayId: generateDayIdToday(),
    countDone: 1
  }
]
