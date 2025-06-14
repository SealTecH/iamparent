import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivitiesPageService } from "./activities-page.service";
import { AsyncPipe, CommonModule } from "@angular/common";
import { IonicModule, ModalController } from "@ionic/angular";
import { TranslatePipe } from "@ngx-translate/core";
import { Dialog } from "@capacitor/dialog";
import { Activity } from "../../models/models";
import { ManageActivityComponent } from "../../modals/manage-activity/manage-activity.component";
import { amountToHours } from "../../shared/utils/minutes-to-human-time.func";

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
export class ActivitiesPageComponent implements OnInit {
  public readonly activities$ = this.service.activities$;
  public readonly loading$ = this.service.loading$;

  constructor(
    private service: ActivitiesPageService,
    private modalCtrl: ModalController,
    private translatePipe: TranslatePipe
  ) {

  }

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
       this.service.addActivity(data);
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
    let result = '';
    if(activity.recommendedTime){
      result+= `${amountToHours(activity.recommendedTime, this.translatePipe)}`
    }
    if(activity.recommendedTime && activity.recommendedAmount){
      result+='; '
    }
    if(activity.recommendedAmount){
      result+= `${activity.recommendedAmount} ${this.translatePipe.transform('SHARED.PER_DAY')}`
    }
    return result;
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
      this.service.updateActivity(data);
    }
  }

  public toggleFavorite(activity: Activity){
    this.service.toggleFavorite(activity)
  }

}
