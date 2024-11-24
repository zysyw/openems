// @ts-strict-ignore
import { Component } from "@angular/core";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { ChannelAddress, CurrentData, EdgeConfig, Utils } from "src/app/shared/shared";

import { ModalComponent } from "../modal/modal";

@Component({
    selector: "Common_EnergyEfficiency",
    templateUrl: "./flat.html",
})
export class FlatComponent extends AbstractFlatWidget {

    public calculatedEnergyEfficiency: number;
    public calculatedEnergyEfficiencyLevel: number;
    public consumptionMeters: EdgeConfig.Component[] | null = null;

    async presentModal() {
        const modal = await this.modalController.create({
            component: ModalComponent,
        });
        return await modal.present();
    }

    protected override getChannelAddresses() {
      const channelAddresses: ChannelAddress[] = []
      // Get consumptionMeterComponents
      this.consumptionMeters = this.config.getComponentsImplementingNature("io.openems.edge.meter.api.ElectricityMeter")
        .filter(component => component.isEnabled && this.config.isTypeConsumptionMetered(component));

      for (const component of this.consumptionMeters) {
        channelAddresses.push(
          new ChannelAddress(component.id, "ActivePower"),
        );
      }  
      return channelAddresses;
    }

    protected override onCurrentData(currentData: CurrentData) {
      let consumptionMetersSumOfActivePower: number = 0;
      // Iterate over evcsComponents to get ChargePower for every component
      for (const component of this.consumptionMeters) {
        if (currentData.allComponents[component.id + "/ActivePower"]) {
          consumptionMetersSumOfActivePower += currentData.allComponents[component.id + "/ActivePower"];
        }
      }
      this.calculatedEnergyEfficiency = Utils.calculateEnergyEfficiency(
          consumptionMetersSumOfActivePower / 1000 * 8760,
          77024,/*用友建筑面积 */
      );
      this.calculatedEnergyEfficiencyLevel = Utils.calculateEnergyEfficiencyLevel(
        this.calculatedEnergyEfficiency, 
        53/*按《建筑节能与可再生能源利用通用规范》GB55015-2021续表A.0.2，夏热冬冷地区标准能耗按53kWh每年每平米计算*/
      );
    }

}
