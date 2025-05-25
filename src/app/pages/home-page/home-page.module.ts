import { NgModule } from "@angular/core";
import { HomePageComponent } from "./home-page.component";
import { HomePageRoutingModule } from "./home-page-routing.module";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { TranslatePipe } from "@ngx-translate/core";

@NgModule({
  declarations: [
    HomePageComponent,
  ],
  exports: [
    HomePageComponent,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HomePageRoutingModule,
    TranslatePipe,
  ],
  providers: [
    TranslatePipe
  ],
})
export class HomePageModule {}
