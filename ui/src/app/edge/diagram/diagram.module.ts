import { NgModule } from '@angular/core';
import { SharedModule } from "src/app/shared/shared.module";
import { DiagramComponent } from './diagram.component';


@NgModule({
  declarations: [
    DiagramComponent,
  ],
  imports: [
    SharedModule,
  ]
})
export class DiagramModule { }
