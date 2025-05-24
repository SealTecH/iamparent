import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, finalize, Observable, take } from "rxjs";
import {
  Action,
  Activity,
  CounterBasedAction,
  CounterBasedActivity,
  TimeBasedAction,
  TimeBasedActivity
} from "../../models/models";
import { DataService } from "../../services/data.service";
import { map } from "rxjs/operators";
import { sortBy } from "lodash";

export interface ActivityWithAction<T = Action> {
  action: T;
  activity: Activity;
}

@Injectable()
export class HomePageService {
  private activities$ = new BehaviorSubject<(TimeBasedActivity | CounterBasedActivity)[]>([]);

  private activitiesIds = new Set<string>()
  private actions$ = new BehaviorSubject<Action[]>([]);

  public activitiesWithTimeDone$: Observable<((TimeBasedActivity | CounterBasedActivity) & { currentDone: number })[]> = combineLatest([
    this.activities$,
    this.actions$
  ]).pipe(map(([activities, actions]) => {
    return activities.map(activity => ({
      ...activity,
      currentDone: this.calculateCurrentDoneForActivity(activity.id, actions),
    }));
  }))

  public timeline$: Observable<(Action & { activity: Activity })[]> = combineLatest([
    this.activities$,
    this.actions$
  ]).pipe(
    map(([activities, actions]) => {
      console.log(actions);
      return sortBy(actions.map((action) => {
        return {
          ...action,
          activity: activities.find(activity => activity.id === action.activityId)!
        }
      }), 'time')
    })
  )

  public loading$ = new BehaviorSubject<boolean>(false);

  constructor(private dataService: DataService) {
  }

  public loadActivities(): void {
    this.loading$.next(true);
    this.dataService.getActivities().pipe(
      take(1),
      finalize(() => this.loading$.next(false))
    ).subscribe(activities => {
      this.activities$.next(activities);
      this.activitiesIds = new Set();
      activities.forEach(activity => {
        this.activitiesIds.add(activity.id)
      });
    })
  }

  public loadData(dayId: string): void {
    this.loading$.next(true);
    this.dataService.getActions(dayId).pipe(
      take(1),
      finalize(() => this.loading$.next(false))
    ).subscribe(actions => {
      this.actions$.next(actions);
    })
  }

  private calculateCurrentDoneForActivity(activityId: string, actions: Action[]): number {
    return actions.reduce((acc, action) => {
      if (action.activityId === activityId) {
        return acc + (action as TimeBasedAction).timeDone || (action as CounterBasedAction).countDone;
      }
      return acc;
    }, 0)
  }
}
