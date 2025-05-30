import { Action } from "../../models/models";
import { TranslatePipe } from "@ngx-translate/core";

export function formatDuration(action: Action, translatePipe:TranslatePipe):string {
  let output = '';
  if(action.timeDone){
    const h = Math.floor(action.timeDone / 60);
    const m = action.timeDone % 60;
    output+= amountToHours(action.timeDone,translatePipe );
  }
  if(action.countDone){
    output+=`${action.timeDone ? '; ': ''} ${action.countDone} ${translatePipe.transform('SHARED.TIMES')}`
  }
  return output;
}


export function amountToHours(amount: number, translatePipe:TranslatePipe):string{
  const h = Math.floor(amount / 60);
  const m = amount % 60;
  return `${h}ч ${m}${translatePipe.transform('SHARED.M')}`;
}
