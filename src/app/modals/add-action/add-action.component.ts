import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar
} from "@ionic/angular/standalone";
import { TranslatePipe } from "@ngx-translate/core";
import { DataService } from "../../services/data.service";
import { BehaviorSubject, finalize, take } from "rxjs";
import { Action, Activity } from "../../models/models";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { v4 as uuidv4 } from 'uuid';
import { AsyncPipe, NgIf } from "@angular/common";
import { ModalController, Platform } from "@ionic/angular";
import { SelectedDateService } from "../../services/selected-date.service";
import { addMinutes } from "date-fns";
import { PhotoPickerComponent } from "./components/photo-picker/photo-picker.component";

@Component({
  selector: 'app-add-action',
  templateUrl: './add-action.component.html',
  styleUrls: ['./add-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    TranslatePipe,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    ReactiveFormsModule,
    IonItem,
    NgIf,
    IonLoading,
    AsyncPipe,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonLabel,
    PhotoPickerComponent
  ]
})
export class AddActionComponent  implements OnInit {
  existingAction: Action |  undefined = undefined;
  activityId: string | undefined;
  time: number | undefined  = undefined;
  minDate = this.convertToIonicString( new Date().setHours(0,0,0,0))
  maxDate = this.convertToIonicString( new Date().setHours(23 ,59,59,0) );
  loading$ = new BehaviorSubject<boolean>(false);
  activities$ = new BehaviorSubject<Activity[]>([]);

  public form = new FormGroup({
    id: new FormControl<string>(uuidv4(),{nonNullable: true}),
    activityId: new FormControl<string>('', [Validators.required]),
    comment: new FormControl<string>(''),
    time: new FormControl<number>(this.selectedDateService.startTime,{nonNullable: true}),
    timeDone: new FormControl<number | null>(null,{nonNullable: false, validators: [Validators.min(1)]}),
    countDone: new FormControl<number| null>(null,{nonNullable: false, validators: [Validators.min(1)]}),
    linkedPhotoUrls:  new FormControl<string[]>([]),
  })


  constructor(private dataService: DataService,
              private modalCtrl: ModalController,
              private platform: Platform,
              private selectedDateService:SelectedDateService) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.goBack()
    });
  }

  ngOnInit() {
    this.minDate = this.convertToIonicString( this.selectedDateService.startTime)
    this.maxDate = this.convertToIonicString( this.selectedDateService.endTime );

    if(this.existingAction){
      this.form.patchValue(this.existingAction);
    }
    if(this.activityId){
      this.form.controls.activityId.setValue(this.activityId);
    }
    this.loadData();
  }

  goBack(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  convertToIonicString(time:number): string {
    const date= new Date(time)
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  getEndTimeInIonicString(): string {
    const modifiedDate = addMinutes(new Date(this.form.controls.time.value), this.form.controls.timeDone.value || 0)
    return  this.convertToIonicString(modifiedDate.getTime());
  }

  onEndTimeChange($event: any) {
    const endTime = new Date($event.detail.value).getTime();
    const diffMS = endTime - this.form.controls.time.value
    this.form.controls.timeDone.setValue((diffMS /  1000) / 60);
  }

  onTimeChange($event: any): void {
    this.form.controls.time.setValue(new Date($event.detail.value).getTime());
  }

  isSelectedActivityTimeBased():boolean {
    const selectedActivity = this.activities$.value.find(a=>a.id===this.form.controls.activityId.value);
    return !!selectedActivity && !!selectedActivity.recommendedTime;
  }

  isSelectedActivityCountBased():boolean {
    const selectedActivity = this.activities$.value.find(a=>a.id===this.form.controls.activityId.value);
    return !!selectedActivity && !!selectedActivity.recommendedAmount;
  }

  onAddAction(){
    const action = {...this.form.value};
    console.log(this.form.value);
    return this.modalCtrl.dismiss(action, 'confirm');
  }

  private loadData(){
    this.loading$.next(true);
    this.dataService.getActivities().pipe(take(1),
      finalize(()=> this.loading$.next(false))
    ).subscribe(activities => {
      this.activities$.next(activities);
    })
  }
}
