import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { SharedModule } from "src/app/shared/shared.module";
import { FlatComponent } from "./flat/flat";
import { ModalComponent } from "./modal/modal";
import { SimulatorMetersComponent } from "./SimulatorMeters.component";

@NgModule({
  imports: [
    BrowserModule,
    SharedModule,
  ],
  declarations: [
    FlatComponent,
    ModalComponent,
    SimulatorMetersComponent,
  ],
  exports: [
    SimulatorMetersComponent,
  ],
})
export class SimulatorMeters { }
