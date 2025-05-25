import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import {
  Action,
  CounterBasedAction,
  CounterBasedActivity,
  TimeBasedAction,
  TimeBasedActivity
} from "../../models/models";
import { DestroyObserver } from "../../shared/utils/destroy-observer";
import { tap } from "rxjs";
import { HomePageService } from "./home-page.service";
import { isNil } from "lodash";
import { ModalController } from "@ionic/angular";
import { AddActionComponent } from "../../modals/add-action/add-action.component";
import { Dialog } from '@capacitor/dialog';
import { TranslatePipe } from "@ngx-translate/core";
import { SelectedDateService } from "../../services/selected-date.service";

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
  public readonly loading$ = this.service.loading$;
  public readonly timeline$ = this.service.timeline$.pipe(tap(r=>console.log(r)));




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

  public isTimeBasedAction(action: Action):boolean {
     return !isNil((action as TimeBasedAction).timeDone)
  }

  getDetails(action: Action): string {
    if((action as TimeBasedAction).timeDone){
      return  `${this.getDuration(action)} ${this.translatePipe.transform('SHARED.MINUTES')}`
    }
    return `${(action as CounterBasedAction).countDone} ${this.translatePipe.transform('HOME.TIMES')}`

  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
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

  async deleteAction(actionId: string) {
    const { value } = await Dialog.confirm({
      title: this.translatePipe.transform('SHARED.CONFIRM'),
      message: this.translatePipe.transform('SHARED.DELETE_RECORD') ,
    });
    if(value){
      this.service.deleteAction(actionId);
    }

  }

  getDuration(action: Action): number {
    return (action as TimeBasedAction).timeDone
  }

  async openAddActionModal()  {
    const modal = await this.modalCtrl.create({
      component: AddActionComponent,
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

  getPercentDone(activity: (TimeBasedActivity | CounterBasedActivity) & {currentDone: number}): number {
      const recommendedPart = (activity as TimeBasedActivity).recommendedTime ||  (activity as CounterBasedActivity).recommendedAmount
    return  activity.currentDone /  recommendedPart
  }

  handleRefresh(){
    this.loadData();
  }

  async openSettings(){

  }

  openActivities(){
    this.router.navigate(['/activities'])
  }

  private loadData(){
    this.service.loadActions();
  }

}
