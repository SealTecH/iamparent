import { Injectable } from "@angular/core";
import { DataService } from "./data.service";
import { BehaviorSubject, filter, Observable, Subject } from "rxjs";
import { Settings } from "../models/models";

@Injectable({ providedIn: 'root' })
export class SettingsService {

  private _settings = new BehaviorSubject<Settings| null>(null);
  settings$: Observable<Settings> = this._settings.pipe(filter(v=>!!v));

  constructor(private dataService: DataService) {
    this.init();
  }

  init(): void {
    this.dataService.getSettings().subscribe(settings=>{
      this._settings.next(settings);
    })
  }

  updateSettings(settings:Settings):void {
    this._settings.next(settings);
    this.dataService.updateSettings(settings).subscribe();
  }
}
