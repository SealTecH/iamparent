import { Injectable } from "@angular/core";
import { BehaviorSubject, finalize, Observable, take } from "rxjs";
import { CounterBasedActivity, TimeBasedActivity } from "../models/models";
import { DataService } from "./data.service";
import { map } from "rxjs/operators";

@Injectable({providedIn:'root'})
export class ActivitiesService {
  public activities$ = new BehaviorSubject<(TimeBasedActivity | CounterBasedActivity)[]>([]);

  constructor(private dataService : DataService) {
  }

  loadActivities(): Observable<(TimeBasedActivity | CounterBasedActivity)[]> {
   return this.dataService.getActivities().pipe(
      take(1),
      map((activities: (TimeBasedActivity | CounterBasedActivity)[]) => {
        this.activities$.next(activities);
        return activities;
      })
    )
  }
}
