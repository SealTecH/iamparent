import { CounterBasedAction, TimeBasedAction } from "../../models/models";
import { TranslatePipe } from "@ngx-translate/core";
import { isTimeBasedAction } from "./is-time-based-action";

export function formatDuration(action: (TimeBasedAction | CounterBasedAction), translatePipe:TranslatePipe):string {
  if(isTimeBasedAction(action)){
    const h = Math.floor(action.timeDone / 60);
    const m = action.timeDone % 60;
    return amountToHours(action.timeDone,translatePipe );
  }
  return `${(action as  CounterBasedAction).countDone} ${translatePipe.transform('SHARED.TIMES')}`
}


export function amountToHours(amount: number, translatePipe:TranslatePipe):string{
  const h = Math.floor(amount / 60);
  const m = amount % 60;
  return `${h}ч ${m}${translatePipe.transform('SHARED.M')}`;
}
