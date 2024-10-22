// @ts-strict-ignore
import { Component, Input } from "@angular/core";
import { EdgeConfig } from "src/app/shared/shared";
import { ModalComponent } from "../modal/modal";
import { SimulatorMetersComponent } from "../SimulatorMeters.component";

@Component({
  selector: "SimulatorMeter",
  templateUrl: "./flat.html",
})
export class FlatComponent extends SimulatorMetersComponent {

  @Input() meter: EdgeConfig.Component;

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalComponent,
      componentProps: {
        meter: this.meter,
      },
    });
    return await modal.present();
  }

}
