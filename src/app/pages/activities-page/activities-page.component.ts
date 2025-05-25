import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivitiesPageService } from "./activities-page.service";
import { AsyncPipe, CommonModule } from "@angular/common";
import { IonicModule, ModalController } from "@ionic/angular";
import { TranslatePipe } from "@ngx-translate/core";
import { Dialog } from "@capacitor/dialog";
import { Activity, CounterBasedActivity, TimeBasedActivity } from "../../models/models";
import { ManageActivityComponent } from "../../modals/manage-activity/manage-activity.component";
import { ActivitiesService } from "../../services/activities.service";

@Component({
  selector: 'app-activities',
  templateUrl: './activities-page.component.html',
  styleUrls: ['./activities-page.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    IonicModule,
    TranslatePipe,
    CommonModule
  ],
  providers: [
    ActivitiesPageService,
    TranslatePipe
  ]
})
export class ActivitiesPageComponent implements OnInit, OnDestroy {
  public readonly activities$ = this.service.activities$;
  public readonly loading$ = this.service.loading$;

  constructor(
    private service: ActivitiesPageService,
    private modalCtrl: ModalController,
    private translatePipe: TranslatePipe,
    private activitiesService: ActivitiesService
  ) { }

  ngOnInit() {
    this.service.loadActivities();
  }

   async openAddActivityModal() {
     const modal = await this.modalCtrl.create({
       component: ManageActivityComponent,
       showBackdrop: true,
       backdropDismiss: false,
     });
     await modal.present();

     const { data, role } = await modal.onWillDismiss();

     if (role === 'confirm') {
       this.service.addActivity(data as (TimeBasedActivity | CounterBasedActivity));
     }
   }

  async deleteActivity(activityId: string) {
    const { value } = await Dialog.confirm({
      title: this.translatePipe.transform('SHARED.CONFIRM'),
      message: `${this.translatePipe.transform('SHARED.DELETE_RECORD')}.
       ${this.translatePipe.transform('ACTIVITIES.DELETE_WARNING')}` ,
    });
    if(value){
      this.service.deleteActivity(activityId);
    }

  }

  getRecommendedValue(activity: Activity): string {
    if((activity as TimeBasedActivity).recommendedTime){
      return `${(activity as TimeBasedActivity).recommendedTime} ${this.translatePipe.transform('SHARED.MINUTES')}`
    }
    return `${(activity as CounterBasedActivity).recommendedAmount} ${this.translatePipe.transform('SHARED.PER_DAY')}`
  }

  async openEditActivityModal(activityId: string){
    const modal = await this.modalCtrl.create({
      component: ManageActivityComponent,
      componentProps: {
        existingActivity: this.service.getActivityImmediately(activityId),
      },
      showBackdrop: true,
      backdropDismiss: false,
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.service.updateActivity(data as (TimeBasedActivity | CounterBasedActivity));
    }
  }

  public toggleFavorite(activity: (TimeBasedActivity | CounterBasedActivity)){
    this.service.toggleFavorite(activity)
  }

  ngOnDestroy(){
    this.activitiesService.loadActivities().subscribe()
  }

}
