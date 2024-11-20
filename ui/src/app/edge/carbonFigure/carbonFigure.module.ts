import { NgModule } from "@angular/core";
import { HistoryDataErrorModule } from "src/app/shared/components/history-data-error/history-data-error.module";
import { SharedModule } from "../../shared/shared.module";
import { Common } from "../history/common/common";
import { Controller } from "../history/Controller/controller.module";
import { CarbonFigureComponent } from "./carbonFigure.component";

@NgModule({
    imports: [
      Common,
      Controller,
      HistoryDataErrorModule,
      SharedModule,
    ],
    declarations: [
        CarbonFigureComponent,
    ],
})
export class carbonFigureModule { }
