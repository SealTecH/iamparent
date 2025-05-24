import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { Action, CounterBasedActivity, TimeBasedAction, TimeBasedActivity } from "../../models/models";
import { DestroyObserver } from "../../shared/utils/destroy-observer";
import { tap } from "rxjs";
import { HomePageService } from "./home-page.service";
import { generateDayIdToday } from "../../shared/utils/generate-day-id-today.func";
import { isNil } from "lodash";

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomePageService],
  standalone: false,
})
export class HomePageComponent extends DestroyObserver implements OnInit, OnDestroy  {
  public readonly activities$ = this.service.activitiesWithTimeDone$;
  public readonly timeline$ = this.service.timeline$.pipe(tap(r=>console.log(r)));

  private dayId: string = '';
  private intervalId: number | undefined;


  constructor(private service: HomePageService, private router: Router) {
    super();
  }

  ngOnInit() {
    this.service.loadActivities()
    this.refreshDate();
    this.intervalId = setInterval(()=> this.refreshDate(), 30_000) as unknown as number;
  }

  public override ngOnDestroy(){
    super.ngOnDestroy();
    clearTimeout(this.intervalId);
  }

  public isTimeBasedAction(action: Action):boolean {
     return !isNil((action as TimeBasedAction).timeDone)
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  openEdit(actionId: string) {
    this.router.navigate(['/edit-action', actionId]);
  }

  deleteAction(actionId: string) {

  }

  getDuration(action: Action): number {
    return (action as TimeBasedAction).timeDone
  }

  getPercentDone(activity: (TimeBasedActivity | CounterBasedActivity) & {currentDone: number}): number {
      const recommendedPart = (activity as TimeBasedActivity).recommendedTime ||  (activity as CounterBasedActivity).recommendedAmount
    return  activity.currentDone /  recommendedPart
  }

  private refreshDate(){
    const id = generateDayIdToday()
    if(id!==this.dayId){
      this.dayId = id;
      this.loadData();
    }
  }

  private loadData(){
    this.service.loadData(this.dayId);

  }

}
