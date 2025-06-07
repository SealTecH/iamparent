import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, finalize, Observable, take, takeUntil } from "rxjs";
import { Action, Activity } from "../../models/models";
import { DataService } from "../../services/data.service";
import { map } from "rxjs/operators";
import { sortBy } from "lodash";
import { DestroyObserver } from "../../shared/utils/destroy-observer";
import { SelectedDateService } from "../../services/selected-date.service";
import { ActivitiesService } from "../../services/activities.service";
import { TranslatePipe } from "@ngx-translate/core";
import { Clipboard } from '@capacitor/clipboard';

@Injectable()
export class HomePageService extends DestroyObserver {

  private actions$ = new BehaviorSubject<Action[]>([]);

  public activitiesWithTimeDone$: Observable<(Activity & { currentTimeDone: number, currentCountDone: number })[]> = combineLatest([
    this.activitiesService.activities$,
    this.actions$
  ]).pipe(map(([activities, actions]) => {
    return activities.map(activity => ({
      ...activity,
      currentTimeDone: this.calculateCurrentDoneForActivity(activity.id, actions, 'timeDone'),
      currentCountDone: this.calculateCurrentDoneForActivity(activity.id, actions, 'countDone'),
    }));
  }))

  public timeline$: Observable<(Action & { activity: Activity })[]> = combineLatest([
    this.activitiesService.activities$,
    this.actions$
  ]).pipe(
    map(([activities, actions]) => {
      return sortBy(actions.map((action) => {
        return {
          ...action,
          activity: activities.find(activity => activity.id === action.activityId)!
        }
      }), 'time')
    })
  )

  public loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private dataService: DataService,
    private selectedDateService: SelectedDateService,
    private activitiesService: ActivitiesService,
    private translatePipe: TranslatePipe,
  ) {
    super();
  }

  public init(){
    this.loadActivities();
    this.selectedDateService.time$.pipe(takeUntil(this.destroy$)).subscribe(()=>{
      this.loadActions()
    })
  }

  public getActionImmediately(actionId: string): Action | undefined {
   return  this.actions$.value.find(action=>action.id === actionId);
  }

  public loadActivities(): void {
    this.loading$.next(true);
    this.activitiesService.loadActivities().pipe(
      take(1),
      finalize(() => this.loading$.next(false))
    ).subscribe()
  }

  public addAction(action: Action): void {
    this.loading$.next(true);
    this.dataService.addAction(action).pipe(
      take(1),
      finalize(() => {
        this.loading$.next(false)
      })
    ).subscribe(()=>{
      this.actions$.next([...this.actions$.value, action]);
    })
  }

  public async  createCopyToClipboard(){
    const activities = this.activitiesService.activities$.value;
    const actions = this.actions$.value;
    const output = sortBy(actions, 'time').reduce((acc, action)=>{
      const actionDate = new Date(action.time);
      const actionTime: number | null = action.timeDone
      const activity = activities.find(activity=>activity.id===action.activityId)!;
      acc+=`
      `;
      acc+= `${actionDate.getHours()}:${actionDate.getMinutes()} - ${this.translatePipe.transform(activity.name)}:`;
      acc+=` ${actionTime ? actionTime+' '+this.translatePipe.transform('SHARED.M'): ''}`;
      acc+= `${actionTime && action.countDone ? ';':''}`;
      acc+=`${action.countDone ? `${action.countDone} ${action.countDone > 20 ? 'ml': this.translatePipe.transform('SHARED.TIMES') }`:''}`;
      if(action.comment){
        acc+=`; comment: ${action.comment}`
      }
      return acc;
    },'')
    await Clipboard.write({
      string: output
    });
  }

  public updateAction(action: Action): void {
    this.loading$.next(true);
    this.dataService.updateAction(action).pipe(
      take(1),
      finalize(() => {
        this.loading$.next(false)
      })
    ).subscribe(()=>{
      this.loadActions()
    })
  }

  public deleteAction(actionId: string): void {
    this.loading$.next(true);
    this.dataService.deleteAction(actionId).pipe(
      take(1),
      finalize(() => {
        this.loading$.next(false)
      })
    ).subscribe(()=>{
      const remainingActions = this.actions$.value;
      remainingActions.splice(this.actions$.value.findIndex(action=>action.id===actionId),1)
      this.actions$.next(remainingActions);
    })
  }

  public loadActions(): void {
    this.loading$.next(true);
    this.dataService.getActions(this.selectedDateService.startTime,this.selectedDateService.endTime).pipe(
      take(1),
      finalize(() => this.loading$.next(false))
    ).subscribe(actions => {
      this.actions$.next(actions);
    })
  }

  private calculateCurrentDoneForActivity(activityId: string, actions: Action[], type: 'timeDone'| 'countDone'): number {
    return actions.reduce((acc, action) => {
      if (action.activityId === activityId) {
        return acc + ((type === 'timeDone' ? action.timeDone : action.countDone) || 0);
      }
      return acc;
    }, 0)
  }
}
