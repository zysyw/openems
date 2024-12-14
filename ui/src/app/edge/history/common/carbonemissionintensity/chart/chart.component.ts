// @ts-strict-ignore
import { Component } from "@angular/core";
import { AbstractHistoryChart } from "src/app/shared/components/chart/abstracthistorychart";
import { QueryHistoricTimeseriesEnergyResponse } from "src/app/shared/jsonrpc/response/queryHistoricTimeseriesEnergyResponse";
import { ChartAxis, HistoryUtils, Utils, YAxisType } from "src/app/shared/service/utils";
import { ChannelAddress } from "src/app/shared/shared";

@Component({
    selector: "carbonemissionintensityChart",
    templateUrl: "../../../../../shared/components/chart/abstracthistorychart.html",
})
export class ChartComponent extends AbstractHistoryChart {

    protected override getChartData(): HistoryUtils.ChartData {
        this.spinnerId = "carbonemissionintensity-chart";
        return {
            input:
                [{
                    name: "GridBuy",
                    powerChannel: ChannelAddress.fromString("_sum/GridActivePower"),
                    energyChannel: ChannelAddress.fromString("_sum/GridBuyActiveEnergy"),
                    ...(this.chartType === "line" && { converter: HistoryUtils.ValueConverter.POSITIVE_AS_ZERO_AND_INVERT_NEGATIVE }),
                },
                ],
            output: (data: HistoryUtils.ChannelData) => {
                return [{
                    name: "碳排放强度水平",
                    nameSuffix: (energyValues: QueryHistoricTimeseriesEnergyResponse) => {
                        return Utils.calculateBuildingCarbonEmissionIntensityLevel(energyValues?.result.data["_sum/GridBuyActiveEnergy"] ?? null, 
                            0.581,/*碳排放因子 */
                            77024,/*用友建筑面积 */
                            18, /*按18kgCO2每平米每年计算 */
                        );
                    },
                    converter: () => {
                        return data["GridBuy"]
                            ?.map((value, index) =>
                                Utils.calculateBuildingCarbonEmissionIntensityLevel(value, 
                                    0.581,/*碳排放因子 */
                                    77024,/*用友建筑面积 */
                                    18, /*按18kgCO2每平米每年计算 */
                                ),
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
