import { Component, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { NotificationsService } from "./services/notifications.service";
import { SettingsService } from "./services/settings.service";
import { BehaviorSubject, take } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  loading$ = new BehaviorSubject(true);
  constructor(private translate: TranslateService,
              // just for init
              private notificationsService: NotificationsService,
              private settingsService: SettingsService) {
  }

  ngOnInit(){
    this.settingsService.settings$.pipe(take(1)).subscribe(settings => {
      this.loading$.next(false);
      this.translate.setDefaultLang('en');
      this.translate.use(settings.language);
    })

  }
}
