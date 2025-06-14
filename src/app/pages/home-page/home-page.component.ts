import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { Action, Activity } from "../../models/models";
import { DestroyObserver } from "../../shared/utils/destroy-observer";
import { firstValueFrom, tap } from "rxjs";
import { HomePageService } from "./home-page.service";
import { ModalController } from "@ionic/angular";
import { AddActionComponent } from "../../modals/add-action/add-action.component";
import { Dialog } from '@capacitor/dialog';
import { TranslatePipe } from "@ngx-translate/core";
import { SelectedDateService } from "../../services/selected-date.service";
import { map } from "rxjs/operators";
import { DayStatisticComponent } from "../../modals/day-statistic/day-statistic.component";
import { amountToHours, formatDuration } from "../../shared/utils/minutes-to-human-time.func";
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
  public readonly activities$ = this.service.activitiesWithTimeDone$.pipe(
    map(activities => {
      return activities.filter(activity=> activity.isFavorite).map((activity)=>({
        ...activity,
        percentageDone: this.getPercentDone(activity)
      }))
    }))

  public doneCount$ = this.activities$.pipe(map((activities) => {
    return activities.filter(a=>a.percentageDone >=1).length
  }))

  public readonly loading$ = this.service.loading$;
  public readonly timeline$ = this.service.timeline$




  constructor(private service: HomePageService,
              private dateService: SelectedDateService,
              private modalCtrl: ModalController,
              private translatePipe: TranslatePipe,
              private router: Router) {
    super();
  }

  ngOnInit() {
    this.service.init();
  }

  public formatDone(activity: Activity & { currentTimeDone: number, currentCountDone: number }): string {
    let result = '';
    if(activity.currentTimeDone){
      result+= amountToHours(activity.currentTimeDone, this.translatePipe);
    }
    if(activity.currentTimeDone && activity.currentCountDone){
      result+='; ';
    }
    if(!isNil(activity.currentCountDone)){
      result+= `${activity.currentCountDone} ${ this.translatePipe.transform('SHARED.TIMES') }`
    }

    return result
  }

  public getDetails(action: Action): string {
     return formatDuration(action, this.translatePipe)
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: false });
  }

  getEndTime(action:Action): string {
    const date = new Date(action.time + ((action.timeDone || 1)*60*1000));
    return date.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: false });
  }

  async openEditActionModal(actionId: string) {

    const modal = await this.modalCtrl.create({
      component: AddActionComponent,
      componentProps: {
        existingAction: this.service.getActionImmediately(actionId),
      },
      showBackdrop: true,
      backdropDismiss: false,

    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.service.updateAction(data as Action);
    }
  }

  async deleteAction(actionId: string, $event:Event) {
    $event.stopPropagation();
    const { value } = await Dialog.confirm({
      title: this.translatePipe.transform('SHARED.CONFIRM'),
      message: this.translatePipe.transform('SHARED.DELETE_RECORD') ,
    });
    if(value){
      this.service.deleteAction(actionId);
    }
  }

  async showComment(action:Action, $event:Event ){
    $event.stopPropagation();

  }

  async openAddActionModal(activityId?: string)  {
    const modal = await this.modalCtrl.create({
      component: AddActionComponent,
      componentProps: {
        activityId
      },
      showBackdrop: true,
      backdropDismiss: false,

    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.service.addAction(data as Action);
    }
  }

  onDateChange($event: any){
    this.dateService.setTime(
      new Date($event.detail.value).setHours(0,0,0,0),
      new Date($event.detail.value).setHours(23,59,59,0)
    )
  }

  getPercentDone(activity: Activity & {currentTimeDone: number; currentCountDone: number;}): number {
    // if both recommended are present, use amount to track done %. By Liana
      if(activity.recommendedTime &&  activity.recommendedAmount){
       return  activity.currentCountDone / activity.recommendedAmount;
      }else {
        if(activity.recommendedTime){
          return activity.currentTimeDone /   activity.recommendedTime;
        }else {
          return  activity.currentCountDone / activity.recommendedAmount!;
        }
      }
  }

  async openSettings(){
    this.router.navigate(['/settings'])
  }

  async copyToClipboard(){
    await this.service.createCopyToClipboard();
  }

  openActivities(){
    this.router.navigate(['/activities'])
  }

  async openDayStatisticModal()  {
    const timeline = await firstValueFrom(this.service.timeline$);
    const modal = await this.modalCtrl.create({
      component: DayStatisticComponent,
      componentProps: {
        timeline
      },
      showBackdrop: true,
      backdropDismiss: false,
    });
    await modal.present();
  }

  protected readonly length = length;
}
