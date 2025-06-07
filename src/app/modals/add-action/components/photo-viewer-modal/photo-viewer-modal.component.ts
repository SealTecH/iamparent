import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ModalController } from "@ionic/angular";
import { IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-photo-viewer-modal',
  templateUrl: './photo-viewer-modal.component.html',
  styleUrls: ['./photo-viewer-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonContent,
  ]
})
export class PhotoViewerModalComponent {
  photoUrl!: string;

  constructor(private modalCtrl: ModalController) {}

  close() {
    this.modalCtrl.dismiss();
  }
}
