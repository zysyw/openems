import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { SharedModule } from "src/app/shared/shared.module";
import { FlatComponent } from "./flat/flat";
import { MeterTreeComponent } from "./MeterTree.component";
import { ModalComponent } from "./modal/modal";

@NgModule({
  imports: [
    BrowserModule,
    SharedModule,
  ],
  declarations: [
    FlatComponent,
    ModalComponent,
    MeterTreeComponent,
  ],
  exports: [
    MeterTreeComponent,
  ],
})
export class MetersTree { }
