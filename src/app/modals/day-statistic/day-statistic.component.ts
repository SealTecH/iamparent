import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { ModalController, Platform } from "@ionic/angular";
import { Action, Timeline } from "../../models/models";
import { IonContent, IonIcon } from "@ionic/angular/standalone";
import { TranslatePipe } from "@ngx-translate/core";
import { formatDuration } from "../../shared/utils/minutes-to-human-time.func";

@Component({
  selector: 'app-day-statistic',
  templateUrl: './day-statistic.component.html',
  styleUrls: ['./day-statistic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonIcon,
    TranslatePipe
  ],
  providers:[
    TranslatePipe
  ],
  standalone: true
})
export class DayStatisticComponent {
  public timeline: Timeline[] = []

  constructor(private modalCtrl: ModalController,
              private platform: Platform,
              private translatePipe: TranslatePipe
              ) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.goBack()
    });
  }


  @HostListener('document:keydown.escape')
  goBack(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }


  hours = Array.from({ length: 24 }, (_, i) => i);
  actions: Action[] = [];

  getTop(action: Action): number {
    const date = new Date(action.time); // time в ms
    const minutesFromMidnight = date.getHours() * 60 + date.getMinutes();
    return (minutesFromMidnight / (24 * 60)) * 100;
  }

  getHeight(action: Action): number {
    if(action.timeDone){
      return (action.timeDone / (24 * 60)) * 100
    }
    return  2;
  }

  formatDuration(action: Action): string {
    return formatDuration(action, this.translatePipe)
  }

}
