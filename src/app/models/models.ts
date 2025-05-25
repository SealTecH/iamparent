export interface Activity {
  id: string;
  name: string;
  description: string;
  icon: string;
  isFavorite: boolean;
}

export interface TimeBasedActivity extends Activity {
  recommendedTime: number; // minutes
}

export interface CounterBasedActivity extends Activity {
  recommendedAmount: number;
}

export interface Action {
  id: string;
  activityId: string;
  time: number; // timestamp
}

export interface TimeBasedAction extends Action {
  timeDone: number; // minutes
}

export interface CounterBasedAction extends Action {
  countDone: number;
}


export interface Day {
  id: string;
  time: number;
  actions: Action[];
}
