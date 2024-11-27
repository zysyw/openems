// @ts-strict-ignore
import { Component } from "@angular/core";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { ChannelAddress, CurrentData, EdgeConfig, Utils } from "src/app/shared/shared";

@Component({
    selector: "carbonemissionintensityWidget",
    templateUrl: "./flat.html",
})
export class FlatComponent extends AbstractFlatWidget {

    protected calculatedCarbonEmissionIntensity: number | null;
    public calculatedCarbonEmissionIntensityLevel: number | null;

    protected override onCurrentData(currentData: CurrentData) {
      let consumptionActiveEnergy: number = 0;
      consumptionActiveEnergy += currentData.allComponents["_sum/ConsumptionActiveEnergy"];
      this.calculatedCarbonEmissionIntensity = Utils.calculateCarbonEmissionIntensity(
          consumptionActiveEnergy / 1000, /**按平均功率计算年kWh，1年8760小时*/
          0.581,/*碳排放因子 */
          77024,/*用友建筑面积 */
      );
      this.calculatedCarbonEmissionIntensityLevel = Utils.calculateCarbonEmissionIntensityLevel(
        this.calculatedCarbonEmissionIntensity, 
        18, /*按18kgCO2每平米每年计算 */
      );
    }

    protected override getChannelAddresses(): ChannelAddress[] {
      return [
        new ChannelAddress("_sum", "ConsumptionActivePower"),
      ];
    }
}
