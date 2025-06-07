import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  ViewChild
} from '@angular/core';
import { ModalController, Platform } from "@ionic/angular";
import { Action, Timeline } from "../../models/models";
import { IonContent } from "@ionic/angular/standalone";
import { TranslatePipe } from "@ngx-translate/core";
import { formatDuration } from "../../shared/utils/minutes-to-human-time.func";
import * as Hammer from 'hammerjs';

@Component({
  selector: 'app-day-statistic',
  templateUrl: './day-statistic.component.html',
  styleUrls: ['./day-statistic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    TranslatePipe
  ],
  providers:[
    TranslatePipe
  ],
  standalone: true
})
export class DayStatisticComponent implements AfterViewInit {
  public timeline: Timeline[] = []
  public scale = 1;
  private lastScale = 1;
  private hammer?: HammerManager;
  hours = Array.from({ length: 24 }, (_, i) => i);

  @ViewChild('zoomArea', { static: true }) zoomArea!: ElementRef;

  constructor(private modalCtrl: ModalController,
              private platform: Platform,
              private cdr:ChangeDetectorRef,
              private translatePipe: TranslatePipe
              ) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.goBack()
    });
  }

  ngAfterViewInit() {
    this.hammer = new Hammer(this.zoomArea.nativeElement);
    this.hammer.get('pinch').set({ enable: true });

    this.hammer.on('pinchmove', (ev: any) => {
      console.log(ev);
      const newZoom = this.lastScale * ev.scale;
      this.scale = Math.max(0.5, Math.min(4, newZoom));
      this.cdr.detectChanges();
    });

    this.hammer.on('pinchend', () => {
      this.lastScale = this.scale;
    });
  }


  getTop(action: Action): number {
    const date = new Date(action.time);
    const minutesFromMidnight = date.getHours() * 60 + date.getMinutes();
    return (minutesFromMidnight * this.scale);
  }

  getHeight(action: Action): number {
    if (action.timeDone) {
      return action.timeDone * this.scale;
    }
    return 3;
  }

  getHourHeight(): number {
    return 60 * this.scale;
  }



  @HostListener('document:keydown.escape')
  goBack(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  formatDuration(action: Action): string {
    return formatDuration(action, this.translatePipe)
  }
}
