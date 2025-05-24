import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader, IonInput, IonItem, IonLabel, IonList, IonLoading,
  IonModal,
  IonNavLink,
  IonSearchbar, IonSelect, IonSelectOption,
  IonTitle,
  IonToolbar
} from "@ionic/angular/standalone";
import { TranslatePipe } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { DataService } from "../../services/data.service";
import { BehaviorSubject, finalize, take } from "rxjs";
import { Action, Activity, TimeBasedActivity } from "../../models/models";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { v4 as uuidv4 } from 'uuid';
import { generateDayIdToday } from "../../shared/utils/generate-day-id-today.func";
import { AsyncPipe, NgIf } from "@angular/common";
import { group } from "@angular/animations";


@Component({
  selector: 'app-add-action',
  templateUrl: './add-action.component.html',
  styleUrls: ['./add-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonBackButton,
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
    IonInput
  ]
})
export class AddActionComponent  implements OnInit {
  minDate = new Date( new Date().setUTCHours(0,0,0,0)).toISOString();
  maxDate = new Date(  new Date().setUTCHours(23 ,59,59,0) ).toISOString();
  currentDate =  new Date().toISOString();
  loading$ = new BehaviorSubject<boolean>(false);

  activities$ = new BehaviorSubject<Activity[]>([]);

  public form = new FormGroup({
    id: new FormControl<string>(uuidv4(),{nonNullable: true}),
    activityId: new FormControl<string>('', [Validators.required]),
    time: new FormControl<number>(new Date().getTime(),{nonNullable: true}),
    dayId: new FormControl<string>(generateDayIdToday(),{nonNullable: true}),
    timeDone: new FormControl<number>(1,{nonNullable: false, validators: [Validators.required]}),
    countDone: new FormControl<number>(1,{nonNullable: false, validators: [Validators.required]}),
  })


  constructor(private router: Router,
              private dataService: DataService) {
  }

  ngOnInit() {
    this.loadData();
    this.form.valueChanges.subscribe(v=> console.log(v))
  }

  goBack(){
    this.router.navigate(['/']);
  }

  onTimeChange($event: any): void {
    this.form.controls.time.setValue(new Date($event.detail.value).getTime());
  }

  isSelectedActivityTimeBased():boolean {
    const selectedActivity = this.activities$.value.find(a=>a.id===this.form.controls.activityId.value);
    return !!selectedActivity && (selectedActivity as TimeBasedActivity).recommendedTime!==undefined;
  }

  onAddAction(){
    const action = {...this.form.value};
    if(this.isSelectedActivityTimeBased()){
      delete action.countDone;
    }else {
      delete action.timeDone;
    }
    this.loading$.next(true)
    this.dataService.addAction(action as Action).pipe(  finalize(()=> this.loading$.next(false))).subscribe(()=>{
      this.goBack();
    })
  }

  private loadData(){
    this.loading$.next(true);
    this.dataService.getActivities().pipe(take(1),
      finalize(()=> this.loading$.next(false))
    ).subscribe(activities => this.activities$.next(activities))
  }
}
