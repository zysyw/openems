// @ts-strict-ignore
import { Component } from "@angular/core";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { ChannelAddress, CurrentData, EdgeConfig, Utils } from "src/app/shared/shared";
import { ModalComponent } from "../modal/modal";

@Component({
  selector: "simulator-consumption",
  templateUrl: "./flat.html",
})
export class FlatComponent extends AbstractFlatWidget {

  public consumptionMeters: EdgeConfig.Component[] | null = null;
  public sumActivePower: number = 0;
  public readonly CONVERT_WATT_TO_KILOWATT = Utils.CONVERT_WATT_TO_KILOWATT;

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalComponent,
    });
    return await modal.present();
  }

  protected override getChannelAddresses() {

    const channelAddresses: ChannelAddress[] = [];

    // Get consumptionMeterComponents
    this.consumptionMeters = this.config.getComponentsImplementingNature("io.openems.edge.simulator.meter.nrc.acting.SimulatorNrcMeterActing")
      .filter(component => component.isEnabled);

    for (const component of this.consumptionMeters) {
      channelAddresses.push(
        new ChannelAddress(component.id, "ActivePower"),
        new ChannelAddress(component.id, "ActivePowerL1"),
        new ChannelAddress(component.id, "ActivePowerL2"),
        new ChannelAddress(component.id, "ActivePowerL3"),
      );
    }

    return channelAddresses;
  }

}
