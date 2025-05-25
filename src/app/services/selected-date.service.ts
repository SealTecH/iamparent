import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({providedIn: 'root'})
export class SelectedDateService {
  private _startTime: number = new Date().setHours(0,0,0,0)
  private _endTime: number = new Date().setHours(23,59,59,0)

  time$ = new BehaviorSubject<{start: number, end:number}>({start:  this._startTime, end:  this._endTime});
  get endTime():number {
    return this._endTime;
  }

  get startTime(): number {
    return this._startTime;
  }

  public setTime(start:number, end:number): void {
    this._startTime = start;
    this._endTime = end;
    this.time$.next({start: this._startTime, end: this._endTime});
  }
}
