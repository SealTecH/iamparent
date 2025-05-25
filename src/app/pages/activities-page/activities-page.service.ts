import { Injectable } from "@angular/core";
import { DataService } from "../../services/data.service";
import { BehaviorSubject, finalize, switchMap, take } from "rxjs";
import { Action, Activity, CounterBasedActivity, TimeBasedActivity } from "../../models/models";

@Injectable()
export class ActivitiesPageService {
  public loading$ = new BehaviorSubject<boolean>(false);
  public activities$ = new BehaviorSubject<(TimeBasedActivity | CounterBasedActivity)[]>([]);

  constructor(private dataService: DataService) {
  }

  loadActivities(): void {
    this.loading$.next(true);
    this.dataService.getActivities().pipe(
      take(1),
      finalize(() => this.loading$.next(false))
    ).subscribe(activities => {
      this.activities$.next(activities)
    });
  }

  getActivityImmediately(activityId: string): Activity | undefined {
    return  this.activities$.value.find(activity=>activity.id === activityId);
  }

  updateActivity(activity: (TimeBasedActivity | CounterBasedActivity)): void {
    this.loading$.next(true)
    this.dataService.updateActivity(activity).pipe(
      take(1),
      finalize(() => {
        this.loading$.next(false)
      })
    ).subscribe(()=>{
      this.loadActivities()
    })
  }

  public addActivity(activity: (TimeBasedActivity | CounterBasedActivity)): void {
    this.loading$.next(true);
    this.dataService.addActivity(activity).pipe(
      take(1),
      finalize(() => {
        this.loading$.next(false)
      })
    ).subscribe(()=>{
      this.activities$.next([...this.activities$.value, activity]);
    })
  }

  public toggleFavorite(activity: (TimeBasedActivity | CounterBasedActivity)): void {
    this.loading$.next(true)
    this.dataService.updateActivity({...activity, isFavorite: !activity.isFavorite}).pipe(
      take(1),
      finalize(() => {
        this.loading$.next(false)
      })
    ).subscribe(()=>{
      this.loadActivities()
    })
  }



  deleteActivity(id: string): void {
    this.loading$.next(true);
    this.dataService.deleteActivity(id).pipe(
      switchMap(()=>this.dataService.deleteActionsByActivityId(id)),
      finalize(() => this.loading$.next(false))
    ).subscribe(() => {
      const remainingActivities = this.activities$.value;
      remainingActivities.splice(this.activities$.value.findIndex(activity=>activity.id===id),1)
      this.activities$.next(remainingActivities);
    });
  }
}
