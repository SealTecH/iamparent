import { Action, TimeBasedAction } from "../../models/models";

export function isTimeBasedAction(action: Action): action is TimeBasedAction {
  return !!(action as TimeBasedAction).timeDone
}
