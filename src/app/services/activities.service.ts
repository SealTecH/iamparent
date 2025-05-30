import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, take } from "rxjs";
import { Activity } from "../models/models";
import { DataService } from "./data.service";
import { map } from "rxjs/operators";

@Injectable({providedIn:'root'})
export class ActivitiesService {
  public activities$ = new BehaviorSubject<Activity[]>([]);

  constructor(private dataService : DataService) {
  }

  loadActivities(): Observable<Activity[]> {
   return this.dataService.getActivities().pipe(
      take(1),
      map((activities: Activity[]) => {
        this.activities$.next(activities);
        return activities;
      })
    )
  }
}
