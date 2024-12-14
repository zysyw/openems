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
      this.calculatedCarbonEmissionIntensityLevel = Utils.calculateBuildingCarbonEmissionIntensityLevel(
        currentData.allComponents["_sum/GridBuyActiveEnergy"] / 1000, 
        0.581,/*碳排放因子 */
        77024,/*用友建筑面积 */
        18, /*按18kgCO2每平米每年计算 */
      );
    }

    protected override getChannelAddresses(): ChannelAddress[] {
      return [
        new ChannelAddress("_sum", "GridBuyActiveEnergy"),
      ];
    }
}
