// @ts-strict-ignore
import { Component } from "@angular/core";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { ChannelAddress, CurrentData, EdgeConfig, Utils } from "src/app/shared/shared";

@Component({
    selector: "energyefficiencyWidget",
    templateUrl: "./flat.html",
})
export class FlatComponent extends AbstractFlatWidget {

    protected calculatedEnergyEfficiency: number | null;
    public consumptionMeters: EdgeConfig.Component[] | null = null;
    public calculatedEnergyEfficiencyLevel: number | null;

    protected override onCurrentData(currentData: CurrentData) {
      let consumptionMetersSumOfActiveConsumptionEnergy: number = 0;
      // Iterate over evcsComponents to get ChargePower for every component
      for (const component of this.consumptionMeters) {
        if (currentData.allComponents[component.id + "/ActiveConsumptionEnergy"]) {
          consumptionMetersSumOfActiveConsumptionEnergy += currentData.allComponents[component.id + "/ActiveConsumptionEnergy"];
        }
      }
      this.calculatedEnergyEfficiency = Utils.calculateEnergyEfficiency(
          consumptionMetersSumOfActiveConsumptionEnergy,
          77024,/*用友建筑面积 */
      );
      this.calculatedEnergyEfficiencyLevel = Utils.calculateEnergyEfficiencyLevel(
        this.calculatedEnergyEfficiency, 
        53/*按《建筑节能与可再生能源利用通用规范》GB55015-2021续表A.0.2，夏热冬冷地区标准能耗按53kWh每年每平米计算*/
      );
    }

    protected override getChannelAddresses(): ChannelAddress[] {
      const channelAddresses: ChannelAddress[] = []
      // Get consumptionMeterComponents
      this.consumptionMeters = this.config.getComponentsImplementingNature("io.openems.edge.meter.api.ElectricityMeter")
        .filter(component => component.isEnabled && this.config.isTypeConsumptionMetered(component));

      for (const component of this.consumptionMeters) {
        channelAddresses.push(
          new ChannelAddress(component.id, "ActiveConsumptionEnergy"),
        );
      }  
      return channelAddresses;
    }
}
