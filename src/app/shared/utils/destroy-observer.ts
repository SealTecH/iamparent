import { Directive, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Directive()
export class DestroyObserver implements OnDestroy {
   public destroy$: Subject<void> = new Subject<void>();
   ngOnDestroy() {
     this.destroy$.next();
   }
}
