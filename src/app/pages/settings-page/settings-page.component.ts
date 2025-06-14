import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SettingsService } from "../../services/settings.service";
import { AsyncPipe } from "@angular/common";
import {
  IonBackButton,
  IonContent,
  IonHeader,
  IonInput, IonItem, IonSelect, IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar
} from "@ionic/angular/standalone";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { debounceTime, take, takeUntil } from "rxjs";
import { Settings } from "../../models/models";
import { DestroyObserver } from "../../shared/utils/destroy-observer";

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonHeader,
    IonBackButton,
    TranslatePipe,
    IonToolbar,
    IonTitle,
    IonContent,
    ReactiveFormsModule,
    IonToggle,
    IonInput,
    IonSelectOption,
    IonSelect,
    IonItem
  ],
  providers: []
})
export class SettingsPageComponent extends DestroyObserver implements OnInit {

  form = new FormGroup({
    notificationSettings: new FormGroup({
      activityReminderEnabled: new FormControl<boolean>(false),
      activityReminderInterval: new FormControl<number>(180, [Validators.required]),
    }),
    language: new FormControl<string>('en'),
    dateSettings:  new FormGroup({
      apm: new FormControl<boolean>(false)
    }),
    themeSettings: new FormGroup({
      theme: new FormControl<string>('dark'),
    })
  })

  constructor(
    private service:SettingsService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.service.settings$.pipe(take(1)).subscribe(settings=>{
      this.form.patchValue(settings, {emitEvent: false});
      this.cdr.detectChanges();
    })

    this.form.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(val => {
      console.log(val);
      this.service.updateSettings(val as Settings);
    });

    this.form.controls.language.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(language => {
      this.translateService.use(language!);
    });
  }

}
