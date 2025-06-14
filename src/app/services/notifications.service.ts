import { Injectable } from "@angular/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { SettingsService } from "./settings.service";
import { combineLatest, distinctUntilChanged, firstValueFrom, takeUntil } from "rxjs";
import { TranslatePipe } from "@ngx-translate/core";
import { ActivitiesService } from "./activities.service";
import { DestroyObserver } from "../shared/utils/destroy-observer";
import { Action, Activity } from "../models/models";
import { ActionsService } from "./actions.service";
import { calculateCurrentDoneForActivity } from "../shared/utils/calculate-current-done-for-activity.func";

@Injectable({providedIn: 'root'})
export class NotificationsService extends DestroyObserver{
  private static readonly REMINDER_ID = 1;
  permissionsAllowed = false;

  constructor(
    private settingsService: SettingsService,
    private activitiesService: ActivitiesService,
    private translatePipe: TranslatePipe,
    private actionsService: ActionsService,
    ) {
    super();
    this.init();
  }

  async init(): Promise<void> {
    await this.requestPermission()
    await this.scheduleReminder();
    combineLatest([
      this.actionsService.actions$,
      this.activitiesService.activities$,
    ]).pipe(
      distinctUntilChanged(([prevActions, prevActivities ], [currActions, currActivities])=>{
       return JSON.stringify(prevActions)===JSON.stringify(currActions) && JSON.stringify(prevActivities)===JSON.stringify(currActivities)
      } ),
      takeUntil(this.destroy$)
    ).subscribe(async ([actions, activities ])=>{
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') {
        this.recalculateNotificationsFromActivities(activities, actions)
      }
    })
  }

  async recalculateNotificationsFromActivities(activities:Activity[], actions: Action[]){
    activities.filter(activity=>activity.notifications?.enabled).forEach(activity=>{
      const id = this.uuidToUniqNumber(activity.id);
      this.cancelReminder(id);
      const timeDone = calculateCurrentDoneForActivity(activity.id, actions, 'timeDone')
      const  countDone = calculateCurrentDoneForActivity(activity.id, actions, 'countDone')
      if(  (activity.recommendedTime ?  timeDone<activity.recommendedTime : false) ||
        (activity.recommendedAmount ?  countDone<activity.recommendedAmount : false)){
        this.addActivityReminder(id, activity);
      }
    })
  }




  async requestPermission(): Promise<void> {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') {
      console.warn('Local notifications not permitted');
    }else {
      this.permissionsAllowed = true;
    }
  }


  async scheduleReminder(): Promise<void> {
    const settings = await firstValueFrom(this.settingsService.settings$);
    const { activityReminderEnabled, activityReminderInterval } = settings.notificationSettings;

    if (!this.permissionsAllowed || !activityReminderEnabled) return;

    let reminderTime: number;
    const now = new Date();
    const currentHours = new Date().getHours()
    if(currentHours>= 22){
      const tomorrow10am = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        10, // 10:00 утра
        0,
        0,
        0
      );
      reminderTime = tomorrow10am.getTime();
    } else if(currentHours<8 && currentHours + (activityReminderInterval / 60) <=10){
      reminderTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
         10,
        0,
        0,
        0
      ).getTime()
    }
    else {
      reminderTime = now.getTime() + (activityReminderInterval * 60 * 1000)
    }


    const time = new Date(reminderTime);
    await LocalNotifications.schedule({
      notifications: [
        {
          id: NotificationsService.REMINDER_ID,
          title: this.translatePipe.transform('NOTIFICATIONS.REMINDER_TITLE'),
          body:  this.translatePipe.transform('NOTIFICATIONS.REMINDER_BODY'),
          schedule: { at: time },
          sound: undefined,
          smallIcon: 'res://icon',
          iconColor: '#488AFF'
        }
      ]
    });
  }

  async cancelReminder(id:number): Promise<void> {
    await LocalNotifications.cancel({
      notifications: [{ id }]
    });
  }

  async resetReminder(): Promise<void> {
    await this.cancelReminder(NotificationsService.REMINDER_ID);
    await this.scheduleReminder();
  }

  private uuidToUniqNumber(id: string): number {
   const res = id.split('-').map(part=>part.slice(0,3)).reduce((acc, part)=>{
     acc+=part.charCodeAt(0).toString()
     acc+=part.charCodeAt(1).toString()
     acc+=part.charCodeAt(2).toString()
     return acc;
    },'')
    return  res.length > 9 ? parseInt(res.slice(0,9))+parseInt(res.slice(9,18)) : parseInt(res);
  }

  private async addActivityReminder(id: number, activity: Activity): Promise<void> {
    const startDay = new Date().setHours(0,0,0,0)
    let time: number;
    const now = new Date();
    const notificationOffset = (activity.notifications?.time || 0);
    if(startDay+ notificationOffset <= now.getTime()) {
     time = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()+1,
        0,
        0,
        0,
        0
      ).getTime()+notificationOffset
    }else {
      time = startDay+ notificationOffset;
    }

    await  LocalNotifications.schedule({
      notifications: [
        {
          id,
          title: this.translatePipe.transform('NOTIFICATIONS.ACTIVITY_REMINDER_TITLE', {name: activity.name}),
          body:  this.translatePipe.transform('NOTIFICATIONS.ACTIVITY_REMINDER_BODY', {name: activity.name}),
          schedule: { at: new Date(time) },
          sound: undefined,
          smallIcon: 'res://icon',
          iconColor: '#488AFF'
        }
      ]
    });
  }

}
