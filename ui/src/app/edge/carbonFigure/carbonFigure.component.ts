import { Component } from '@angular/core';
import { AbstractCarbonFigure } from "src/app/shared/components/carbonfigure/abstract-carbon-figure";
import { DefaultTypes } from "src/app/shared/service/defaulttypes";
import { ChannelAddress, CurrentData, Utils } from "src/app/shared/shared";

export enum PeriodType {
  Today = "Today",
  ThisMonth = "ThisMonth",
  ThisYear = "ThisYear",
  Yesterday = "Yesterday",
  LastMonth = "LastMonth",
  LastYear = "LastYear"
}

interface EnergyFigures {
  autarchy: number;
  carbonEmissionIntensity: number;
  energyEfficiency: number;
  selfconsumption: number;
}

type PeriodFigures = Record<PeriodType, EnergyFigures>;

@Component({
  selector: 'app-carbon-figure-component',
  imports: [],
  templateUrl: `./carbonFigure.component.html`,
  styleUrl: './carbonFigure.component.css',
})
export class CarbonFigureComponent extends AbstractCarbonFigure{

  public figures: PeriodFigures = {} as PeriodFigures; 
  public period: PeriodType; 
  public technicalHeaders: string[];
  public technicalData: string[][];
  public historicalHeaders: string[];
  public historicalData: string[][];
  private currentPeriodIndex = 0;
  public dataUpdateCallback: (value: void | PromiseLike<void>) => void;

  public override ngOnInit() {
    super.ngOnInit();
    for (const period of Object.values(PeriodType)) {
      this.figures[period] = {
        autarchy: 0,
        carbonEmissionIntensity: 0,
        energyEfficiency: 0,
        selfconsumption: 0,
      };
    }

    this.calculateFigures();
    
  }

  private async calculateFigures() {
    const periods = [
        PeriodType.Today,
        PeriodType.Yesterday,
        PeriodType.ThisMonth,
        PeriodType.LastMonth,
        PeriodType.ThisYear,
        PeriodType.LastYear
    ];
    this.period = periods[0];
    this.currentPeriodIndex++;
    while (this.currentPeriodIndex < periods.length) {
      this.period = periods[this.currentPeriodIndex];
      this.service.historyPeriod.next(this.getPeriod(this.period));
      await this.waitForDataUpdate(); // 等待数据更新完成
      console.log(`${this.period}: `, this.figures);
      this.currentPeriodIndex++;
    } 
    // 所有 PeriodType 处理完成，更新表格
    this.setTableValues();
    console.log('All periods processed:', this.figures);
    
    /*for (const period of periods) {
        this.period = period; // 设置当前 PeriodType
        this.service.historyPeriod.next(this.getPeriod(this.period)); // 更新 historyPeriod
        await this.waitForDataUpdate(); // 等待数据更新完成
        console.log(`${period}: `, this.figures);
    }

    this.setTableValues(); // 最后更新表格*/
}

private waitForDataUpdate(): Promise<void> {
    return new Promise(resolve => {
        this.dataUpdateCallback = resolve;
    });
}

  private setTableValues(){
    this.technicalHeaders = ['指标名称', '本日', '本月', '本年度'];
    this.technicalData = [
    ['光伏消纳率', '70%', '75%', '80%'],
    ['可再生能源替代率', '70%', '75%', '80%'],
    ['碳排放强度水平', '50kg/kWh', '45kg/kWh', '40kg/kWh'],
    ['能效水平', '95%', '92%', '90%'],
    ];

    this.historicalHeaders = ['指标名称', '上日', '上月', '上年度'];
    this.historicalData = [
    ['光伏消纳率', '70%', '75%', '80%'],
    ['可再生能源替代率', '68%', '73%', '78%'],
    ['碳排放强度水平', '52kg/kWh', '47kg/kWh', '42kg/kWh'],
    ['能效水平', '93%', '91%', '89%'],
    ];
  }

  protected override getChannelAddresses(): ChannelAddress[] {
    return [
        new ChannelAddress("_sum", "GridBuyActiveEnergy"),
        new ChannelAddress("_sum", "ConsumptionActiveEnergy"),
        new ChannelAddress('_sum', 'GridSellActiveEnergy'),
        new ChannelAddress('_sum', 'ProductionActiveEnergy'),
    ];
  }
  
  protected override onCurrentData(currentData: CurrentData) {
    console.log("Enter onCurrentData");
    const autarchyValue =
            Utils.calculateAutarchy(
                currentData.allComponents["_sum/GridBuyActiveEnergy"] / 1000,
                currentData.allComponents["_sum/ConsumptionActiveEnergy"] / 1000);
    const selfconsumptionValue = Utils.calculateSelfConsumption(
            currentData.allComponents["_sum/GridSellActiveEnergy"],
            currentData.allComponents["_sum/ProductionActiveEnergy"]);
    const carbonEmissionIntensityLevel = Utils.calculateBuildingCarbonEmissionIntensityLevel(
        currentData.allComponents["_sum/GridBuyActiveEnergy"] / 1000, 
        0.581,/*碳排放因子 */
        77024,/*用友建筑面积 */
        18, /*按18kgCO2每平米每年计算 */);
    const energyEfficiencyLevel = Utils.calculateBuildingEnergyEfficiencLevel(
        currentData.allComponents["_sum/ConsumptionActiveEnergy"] / 1000,
        77024,/*用友建筑面积 */
        53);
    this.figures[this.period].autarchy = autarchyValue;
    this.figures[this.period].selfconsumption = selfconsumptionValue;
    this.figures[this.period].carbonEmissionIntensity = carbonEmissionIntensityLevel;
    this.figures[this.period].energyEfficiency = energyEfficiencyLevel;
    console.log(this.figures);

    if (this.dataUpdateCallback) {
        this.dataUpdateCallback();
    }
  }

  /*protected override afterOnCurrentData(): void {  
    const periodValues = Object.values(PeriodType);
    this.currentPeriodIndex++;
    if (this.currentPeriodIndex < periodValues.length) {
        this.period = periodValues[this.currentPeriodIndex]; // 获取下一个 PeriodType
        this.service.historyPeriod.next(this.getPeriod(this.period)); // 触发更新
    } else {
        // 所有 PeriodType 处理完成，更新表格
        this.setTableValues();
        console.log('All periods processed:', this.figures);
    }
  }*/

  private getPeriod(period:PeriodType): DefaultTypes.HistoryPeriod{
    const today = new Date();
    switch (period){
    case PeriodType.Today:
      // 1. 本日 (今天)
      return new DefaultTypes.HistoryPeriod(today, today);

    case PeriodType.ThisMonth:
      // 2. 本月 (本月第一天到本月最后一天)
      return new DefaultTypes.HistoryPeriod(
        new Date(today.getFullYear(), today.getMonth(), 1), // 本月1日
        new Date(today.getFullYear(), today.getMonth() + 1, 0) // 本月最后一天
      );

    case PeriodType.ThisYear:
      // 3. 本年 (本年1月1日到12月31日)
      return new DefaultTypes.HistoryPeriod(
        new Date(today.getFullYear(), 0, 1), // 1月1日
        new Date(today.getFullYear(), 11, 31) // 12月31日
      );

    case PeriodType.Yesterday:
      // 4. 上日 (昨天)
      return new DefaultTypes.HistoryPeriod(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
      );

    case PeriodType.LastMonth:
      // 5. 上月 (上月第一天到上月最后一天)
      return new DefaultTypes.HistoryPeriod(
        new Date(today.getFullYear(), today.getMonth() - 1, 1), // 上月1日
        new Date(today.getFullYear(), today.getMonth(), 0) // 上月最后一天
      );

    case PeriodType.LastYear:
      // 6. 上年 (去年1月1日到12月31日)
      return new DefaultTypes.HistoryPeriod(
        new Date(today.getFullYear() - 1, 0, 1), // 去年1月1日
        new Date(today.getFullYear() - 1, 11, 31) // 去年12月31日
      );
    };
  }
}
