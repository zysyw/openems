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
      this.calculatedEnergyEfficiencyLevel = Utils.calculateBuildingEnergyEfficiencLevel(
        currentData.allComponents["_sum/ConsumptionActivePower"] / 1000 * 8760, /**按平均功率计算年kWh，1年8760小时*/
        77024,/*用友建筑面积 */
        53/*按《建筑节能与可再生能源利用通用规范》GB55015-2021续表A.0.2，夏热冬冷地区标准能耗按53kWh每年每平米计算*/
      );
    }

}
