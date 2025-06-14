import { Injectable } from "@angular/core";
import { BehaviorSubject, finalize, Observable, switchMap, take, tap } from "rxjs";
import { Action } from "../models/models";
import { DataService } from "./data.service";
import { map } from "rxjs/operators";

@Injectable({providedIn:'root'})
export class ActionsService {
  public actions$ = new BehaviorSubject<Action[]>([]);

  constructor(private dataService : DataService) {
  }

  loadActions(timeStart: number, timeEnd: number): Observable<Action[]> {
    return this.dataService.getActions(timeStart, timeEnd).pipe(
      take(1),
      map((actions: Action[]) => {
        this.actions$.next(actions);
        return actions;
      })
    )
  }

  public deleteAction(actionId: string): Observable<void> {
    return this.dataService.deleteAction(actionId).pipe(
      take(1),
      tap(()=>{
        const remainingActions = this.actions$.value;
        remainingActions.splice(this.actions$.value.findIndex(action=>action.id===actionId),1)
        this.actions$.next(remainingActions);
      })
    )
  }

  public updateAction(action: Action): Observable<void> {
   return this.dataService.updateAction(action).pipe(
      take(1),
     tap(()=>{
       const copy = [...this.actions$.value];
       const index = copy.findIndex((a=>a.id===action.id))
       copy[index] = action;
       this.actions$.next(copy);
     })
    )
  }

  public addAction(action: Action): Observable<void> {
   return  this.dataService.addAction(action).pipe(
      take(1),
      tap(()=>this.actions$.next([...this.actions$.value, action]))
    )
  }


}
