// @ts-strict-ignore
import { Component } from "@angular/core";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { ChannelAddress, CurrentData, EdgeConfig, Utils } from "src/app/shared/shared";

import { ModalComponent } from "../modal/modal";

@Component({
    selector: "Common_CarbonEmissionIntensity",
    templateUrl: "./flat.html",
})
export class FlatComponent extends AbstractFlatWidget {

    public calculatedCarbonEmissionIntensity: number;
    public calculatedCarbonEmissionIntensityLevel: number;
    public consumptionMeters: EdgeConfig.Component[] | null = null;

    async presentModal() {
        const modal = await this.modalController.create({
            component: ModalComponent,
        });
        return await modal.present();
    }

    protected override getChannelAddresses() {
      return [
        new ChannelAddress("_sum", "ConsumptionActivePower"),
      ];
    }

    protected override onCurrentData(currentData: CurrentData) {
      let consumptionActivePower: number = 0;
      consumptionActivePower += currentData.allComponents["_sum/ConsumptionActivePower"];
      this.calculatedCarbonEmissionIntensity = Utils.calculateCarbonEmissionIntensity(
          consumptionActivePower / 1000 * 8760, /**按平均功率计算年kWh，1年8760小时*/
          0.581,/*碳排放因子 */
          77024,/*用友建筑面积 */
      );
      this.calculatedCarbonEmissionIntensityLevel = Utils.calculateCarbonEmissionIntensityLevel(
        this.calculatedCarbonEmissionIntensity, 
        18, /*按18kgCO2每平米每年计算 */
      );
    }

}
