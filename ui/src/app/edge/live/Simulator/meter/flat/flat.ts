// @ts-strict-ignore
import { Component } from "@angular/core";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { ChannelAddress, EdgeConfig, Utils } from "src/app/shared/shared";
import { ModalComponent } from "../modal/modal";

@Component({
  selector: "simulator-consumption",
  templateUrl: "./flat.html",
})
export class FlatComponent extends AbstractFlatWidget {

  public simulatorMeters: EdgeConfig.Component[] | null = null;
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
    this.simulatorMeters = Object.values(this.config.components)
      .filter(component => component.isEnabled) // 过滤出 isEnabled 为 true 的组件
      .filter(component => component.factoryId.includes("Simulator")) // 过滤出 factoryId 包含 "Simulator" 的组件
      .filter(component => component.factoryId.includes("Meter")); // 过滤出 factoryId 包含 "Meter" 的组件

    for (const component of this.simulatorMeters) {
      channelAddresses.push(
        new ChannelAddress(component.id, "ActivePower"),
        new ChannelAddress(component.id, "ActivePowerL1"),
        new ChannelAddress(component.id, "ActivePowerL2"),
        new ChannelAddress(component.id, "ActivePowerL3"),
      );
    }
    console.log("Simulater Meter:", channelAddresses)
    return channelAddresses;
  }

}
