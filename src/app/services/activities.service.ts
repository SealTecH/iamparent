import { Injectable } from "@angular/core";
import { BehaviorSubject, finalize, Observable, switchMap, take, tap } from "rxjs";
import { Activity } from "../models/models";
import { DataService } from "./data.service";
import { map } from "rxjs/operators";

@Injectable({providedIn:'root'})
export class ActivitiesService {
  public activities$ = new BehaviorSubject<Activity[]>([]);

  constructor(private dataService : DataService) {
  }

  loadActivities(): Observable<Activity[]> {
    console.log('in load activities')
   return this.dataService.getActivities().pipe(
      take(1),
      map((activities: Activity[]) => {
        console.log('activities loaded', activities)
        this.activities$.next(activities);
        return activities;
      })
    )
  }

  updateActivity(activity: Activity): Observable<void> {
    return this.dataService.updateActivity(activity).pipe(
      take(1),
      tap(()=>{
        const copy = [...this.activities$.value];
        const index = copy.findIndex((a=>a.id===activity.id))
        copy[index] = activity;
        this.activities$.next(copy);
      })
    )
  }

  public addActivity(activity: Activity): Observable<void> {
   return this.dataService.addActivity(activity).pipe(
      take(1),
      tap(()=>{
        this.activities$.next([...this.activities$.value, activity]);
      })
    )
  }

  deleteActivity(id: string): Observable<void> {
    return this.dataService.deleteActivity(id).pipe(
      switchMap(()=>this.dataService.deleteActionsByActivityId(id)),
      tap(()=>{
        const remainingActivities = this.activities$.value;
        remainingActivities.splice(this.activities$.value.findIndex(activity=>activity.id===id),1)
        this.activities$.next(remainingActivities);
      })
    )
  }
}
