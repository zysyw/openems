import { NgModule } from "@angular/core";
import { SharedModule } from "./../shared/shared.module";
import { CarbonFigureModule } from "./carbonFigure/carbonFigure.module";
import { DiagramModule } from "./diagram/diagram.module";
import { EdgeComponent } from "./edge.component";
import { HistoryModule } from "./history/history.module";
import { LiveModule } from "./live/live.module";

@NgModule({
  declarations: [
    EdgeComponent,
  ],
  imports: [
    HistoryModule,
    LiveModule,
    CarbonFigureModule,
    DiagramModule,
    SharedModule,
  ],
  exports: [
    EdgeComponent,
  ],
})
export class EdgeModule { }
