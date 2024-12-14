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
      this.calculatedEnergyEfficiencyLevel = Utils.calculateBuildingEnergyEfficiencLevel(
        currentData.allComponents["_sum/ConsumptionActiveEnergy"] / 1000,
        77024,/*用友建筑面积 */
        53/*按《建筑节能与可再生能源利用通用规范》GB55015-2021续表A.0.2，夏热冬冷地区标准能耗按53kWh每年每平米计算*/
      );
    }

    protected override getChannelAddresses(): ChannelAddress[] {
      return [
        new ChannelAddress("_sum", "ConsumptionActiveEnergy"),
      ];
    }
}
