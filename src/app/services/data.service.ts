import { Injectable } from "@angular/core";
import { Action, Activity, CounterBasedActivity, Day, TimeBasedActivity } from "../models/models";
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DEFAULT_ACTIVITIES } from "../const/default-activities.const";
import { environment } from "../../environments/environment";
import { DEFAULT_ACTIONS } from "../const/default-actions.conts";

@Injectable({ providedIn: 'root' })
export class DataService {
  private storageReady = new BehaviorSubject(false);

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    await this.storage.create();
    const activities = await this.storage.get('activities');
    if(!activities) {
      await this.storage.set('activities', DEFAULT_ACTIVITIES)
    }
    if(!environment.production){
      const actions = await this.storage.get('actions');
      console.log(actions);
      if(!actions) {
        await this.storage.set('actions', DEFAULT_ACTIONS)
      }
    }
    this.storageReady.next(true);


  }

  private waitForStorage<T>(callback: () => Promise<T>): Observable<T> {
    return this.storageReady.pipe(
      switchMap(ready => {
        console.log(ready);
        return ready ? from(callback()) : new Observable<T>()
      })
    );
  }

  // === Days ===
  getDay(time: number): Day | undefined {
    // Для простоты пока возвращаем undefined, позже добавим полноценную реализацию
    return undefined;
  }

  // === Activities ===
  getActivities(): Observable<(TimeBasedActivity | CounterBasedActivity)[]> {
    return this.waitForStorage(() => this.storage.get('activities').then(a => a || []));
  }

  addActivity(activity: (TimeBasedActivity | CounterBasedActivity)): Observable<void> {
    return this.getActivities().pipe(
      switchMap(activities => {
        activities.push(activity);
        return from(this.storage.set('activities', activities));
      })
    );
  }

  updateActivity(activity: (TimeBasedActivity | CounterBasedActivity)): Observable<void> {
    return this.getActivities().pipe(
      switchMap(activities => {
        const index = activities.findIndex(a => a.id === activity.id);
        if (index !== -1) activities[index] = activity;
        return from(this.storage.set('activities', activities));
      })
    );
  }

  deleteActivity(id: string): Observable<void> {
    return this.getActivities().pipe(
      switchMap(activities => {
        const filtered = activities.filter(a => a.id !== id);
        return from(this.storage.set('activities', filtered));
      })
    );
  }

  // === Actions ===
  getActions(dayId: string): Observable<Action[]> {
    return this.waitForStorage(() =>
      this.storage.get(`actions`).then((actions: Action[]) => (actions || []).filter(action=> dayId===action.dayId ))
    );
  }

  addAction(action: Action): Observable<void> {
    return this.getActions(action.dayId).pipe(
      switchMap(actions => {
        actions.push(action);
        return from(this.storage.set(`actions`, actions));
      })
    );
  }

  updateAction(dayId: string, action: Action): Observable<void> {
    return this.getActions(dayId).pipe(
      switchMap(actions => {
        const index = actions.findIndex(a => a.id === action.id);
        if (index !== -1) actions[index] = action;
        return from(this.storage.set(`actions`, actions));
      })
    );
  }

  deleteAction(dayId: string, id: string): Observable<void> {
    return this.getActions(dayId).pipe(
      switchMap(actions => {
        const filtered = actions.filter(a => a.id !== id);
        return from(this.storage.set(`actions`, filtered));
      })
    );
  }
}
