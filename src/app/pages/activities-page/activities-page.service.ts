import { Injectable } from "@angular/core";
import { BehaviorSubject, finalize, take } from "rxjs";
import { Activity } from "../../models/models";
import { ActivitiesService } from "../../services/activities.service";

@Injectable()
export class ActivitiesPageService {
  public loading$ = new BehaviorSubject<boolean>(false);
  public activities$ = this.activitiesService.activities$;

  constructor(
    private activitiesService: ActivitiesService
  ) {
  }

  loadActivities(): void {
    this.loading$.next(true);
    this.activitiesService.loadActivities().pipe(
      take(1),
      finalize(() => this.loading$.next(false))
    ).subscribe();
  }

  getActivityImmediately(activityId: string): Activity | undefined {
    return  this.activities$.value.find(activity=>activity.id === activityId);
  }

  updateActivity(activity: Activity): void {
    this.loading$.next(true)
    this.activitiesService.updateActivity(activity).pipe(
      take(1),
      finalize(() => {
        this.loading$.next(false)
      })
    ).subscribe()
  }

  public addActivity(activity: Activity): void {
    this.loading$.next(true);
    this.activitiesService.addActivity(activity).pipe(
      take(1),
      finalize(() => {
        this.loading$.next(false)
      })
    ).subscribe()
  }

  public toggleFavorite(activity: Activity): void {
    this.loading$.next(true)
    this.activitiesService.updateActivity({...activity, isFavorite: !activity.isFavorite}).pipe(
      take(1),
      finalize(() => {
        this.loading$.next(false)
      })
    ).subscribe()
  }

  deleteActivity(id: string): void {
    this.loading$.next(true);
    this.activitiesService.deleteActivity(id).pipe(
      finalize(() => this.loading$.next(false))
    ).subscribe();
  }
}
