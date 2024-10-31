// @ts-strict-ignore
import { Component, Input } from "@angular/core";
import { EdgeConfig, Utils } from "src/app/shared/shared";
import { MeterTreeComponent } from "../MeterTree.component";
import { ModalComponent } from "../modal/modal";

@Component({
  selector: "meterNode",
  templateUrl: "./flat.html",
})
export class FlatComponent extends MeterTreeComponent {

  @Input() meter: EdgeConfig.Component;
  public readonly CONVERT_WATT_TO_KILOWATT = Utils.CONVERT_WATT_TO_KILOWATT;

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
