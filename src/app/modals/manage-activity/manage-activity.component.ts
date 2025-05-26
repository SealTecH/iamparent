import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslatePipe } from "@ngx-translate/core";
import { NgIf } from "@angular/common";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar
} from "@ionic/angular/standalone";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { v4 as uuidv4 } from "uuid";
import { ModalController, Platform } from "@ionic/angular";
import { Activity, TimeBasedActivity } from "../../models/models";
import { IconPickerComponent } from "./components/icon-picker/icon-picker.component";
import { ColorPickerComponent } from "./components/color-picker/color-picker.component";

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
    IonRadioGroup,
    IonRadio,
    IconPickerComponent,
    ColorPickerComponent
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
    isTimeBased: new FormControl<boolean>(false, [Validators.required]),
    description: new FormControl<string>('' ),
    icon: new FormControl<string>('', {nonNullable: true} ),
    recommendedTime: new FormControl<number>(1,{nonNullable: false, validators: [Validators.required]}),
    recommendedAmount: new FormControl<number>(1,{nonNullable: false, validators: [Validators.required]}),
  })

  constructor(private modalCtrl: ModalController, private platform: Platform,) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.goBack()
    });
  }

  ngOnInit() {
    if(this.existingActivity){
      this.form.patchValue(this.existingActivity);
      if((this.existingActivity as TimeBasedActivity).recommendedTime){
        this.form.controls.isTimeBased.setValue(true);
      }else {
        this.form.controls.isTimeBased.setValue(false);
      }
    }
  }

  onAddActivity(){
    const activity = {...this.form.value};
    if(activity.isTimeBased){
      delete activity.recommendedAmount;
    }else {
      delete activity.recommendedTime;
    }
    delete activity.isTimeBased

    return this.modalCtrl.dismiss(activity, 'confirm');
  }

  goBack(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }
}
