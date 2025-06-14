import { Action } from "../../models/models";

export function calculateCurrentDoneForActivity(activityId: string, actions: Action[], type: 'timeDone'| 'countDone'): number {
  return actions.reduce((acc, action) => {
    if (action.activityId === activityId) {
      return acc + ((type === 'timeDone' ? action.timeDone : action.countDone) || 0);
    }
    return acc;
  }, 0)
}
