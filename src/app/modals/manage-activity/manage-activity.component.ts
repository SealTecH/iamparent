import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslatePipe } from "@ngx-translate/core";
import { NgIf } from "@angular/common";
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonTitle,
  IonToggle,
  IonToolbar
} from "@ionic/angular/standalone";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { v4 as uuidv4 } from "uuid";
import { ModalController, Platform } from "@ionic/angular";
import { Activity } from "../../models/models";
import { IconPickerComponent } from "./components/icon-picker/icon-picker.component";
import { ColorPickerComponent } from "./components/color-picker/color-picker.component";
import { convertToIonicString } from "../../shared/utils/ionic-time.utils";

@Component({
  selector: 'app-manage-activity',
  templateUrl: './manage-activity.component.html',
  styleUrls: ['./manage-activity.component.scss'],
  imports: [
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonContent,
    IonInput,
    IonItem,
    NgIf,
    ReactiveFormsModule,
    IconPickerComponent,
    ColorPickerComponent,
    IonLabel,
    IonToggle,
    IonDatetime,
    IonModal,
    IonDatetimeButton,
    IonAccordion,
    IonAccordionGroup
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageActivityComponent implements OnInit {
  existingActivity: Activity | undefined = undefined;

  public form = new FormGroup({
    id: new FormControl<string>(uuidv4(),{nonNullable: true}),
    color: new FormControl<string>('',{nonNullable: true}),
    isFavorite: new FormControl<boolean>(false,{nonNullable: true}),
    name: new FormControl<string>('', [Validators.required]),
    isTimeBased: new FormControl<boolean>(false, ),
    isCountBased: new FormControl<boolean>(false, ),
    description: new FormControl<string>('' ),
    notifications: new FormGroup({
      enabled: new FormControl(false),
      time: new FormControl(0),
    }),
    icon: new FormControl<string>('', {nonNullable: true} ),
    recommendedTime: new FormControl<number | null>(null,{nonNullable: false}),
    recommendedAmount: new FormControl<number| null>(null,{nonNullable: false }),
  },[(group)=>{
    if(group.value.isTimeBased && !group.value.recommendedTime){
      return {recommendedTimeRequired: true};
    }

    if(group.value.isCountBased && !group.value.recommendedAmount){
      return {recommendedAmountRequired: true};
    }
    return (group.value.isTimeBased || group.value.isCountBased) ? null : {baseNotSelected: true}
  }])

  constructor(private modalCtrl: ModalController, private platform: Platform,) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.goBack()
    });
  }

  ngOnInit() {
    if(this.existingActivity){
      this.form.patchValue(this.existingActivity);
      if(this.existingActivity.recommendedTime){
        this.form.controls.isTimeBased.setValue(true);
      }
      if(this.existingActivity.recommendedAmount){
        this.form.controls.isCountBased.setValue(true);
      }
    }
  }

  onAddActivity(){
    const activity = {...this.form.value};
    delete activity.isTimeBased
    delete activity.isCountBased

    return this.modalCtrl.dismiss(activity, 'confirm');
  }

  goBack(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  onNotificationTimeChange($event: any) {
    const time = new Date($event.detail.value);
    const value = (time.getHours()*3600 + time.getMinutes()*60)*1000
    this.form.controls.notifications.controls.time.setValue(value);
  }

 getTimeInIonicString(): string {
    const modifiedDate = new Date().setHours(0,0,0,0) + (this.form.controls.notifications.controls.time.value || 0)
    return convertToIonicString(modifiedDate);
  }
}
