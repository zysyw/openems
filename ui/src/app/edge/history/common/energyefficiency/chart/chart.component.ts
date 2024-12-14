// @ts-strict-ignore
import { Component } from "@angular/core";
import { AbstractHistoryChart } from "src/app/shared/components/chart/abstracthistorychart";
import { QueryHistoricTimeseriesEnergyResponse } from "src/app/shared/jsonrpc/response/queryHistoricTimeseriesEnergyResponse";
import { ChartAxis, HistoryUtils, Utils, YAxisType } from "src/app/shared/service/utils";
import { ChannelAddress } from "src/app/shared/shared";

@Component({
    selector: "energyefficiencyChart",
    templateUrl: "../../../../../shared/components/chart/abstracthistorychart.html",
})
export class ChartComponent extends AbstractHistoryChart {

    protected override getChartData(): HistoryUtils.ChartData {
        this.spinnerId = "energyefficiency-chart";
        return {
            input:
                [{
                name: "Consumption",
                powerChannel: ChannelAddress.fromString("_sum/ConsumptionActivePower"),
                energyChannel: ChannelAddress.fromString("_sum/ConsumptionActiveEnergy"),
                },
                ],
            output: (data: HistoryUtils.ChannelData) => {
                return [{
                    name: "能效水平",
                    nameSuffix: (energyValues: QueryHistoricTimeseriesEnergyResponse) => {
                        return Utils.calculateBuildingEnergyEfficiencLevel((energyValues?.result.data["_sum/ConsumptionActiveEnergy"] ?? null) /1000,
                            77024,/*用友建筑面积 */
                            53/*按《建筑节能与可再生能源利用通用规范》GB55015-2021续表A.0.2，夏热冬冷地区标准能耗按53kWh每年每平米计算*/
                        );
                    },
                    converter: () => {
                        return data["Consumption"]
                            ?.map((value, index) =>
                                Utils.calculateBuildingEnergyEfficiencLevel(value,
                                    77024,/*用友建筑面积 */
                                    53/*按《建筑节能与可再生能源利用通用规范》GB55015-2021续表A.0.2，夏热冬冷地区标准能耗按53kWh每年每平米计算*/
                                )
                            );
                    },
                    color: "rgb(253,197,7)",
                }];
            },
            tooltip: {
                formatNumber: "1.0-0",
            },
            yAxes: [{
                unit: YAxisType.PERCENTAGE,
                position: "left",
                yAxisId: ChartAxis.LEFT,
            }],
        };
    }
}
