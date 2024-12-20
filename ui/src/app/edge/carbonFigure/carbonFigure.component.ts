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
  autarchy: string;
  carbonEmissionIntensity: string;
  energyEfficiency: string;
  selfconsumption: string;
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
    for (const period of Object.values(PeriodType)) {
      this.figures[period] = {
        autarchy: "0",
        carbonEmissionIntensity: "0",
        energyEfficiency: "0",
        selfconsumption: "0",
      };
    }
    super.ngOnInit();
    this.period = PeriodType.Today;  
  }

  private setTableValues(){
    this.technicalHeaders = ['指标名称', '本日', '本月', '本年度'];
    this.technicalData = [
    ['光伏消纳率', this.figures[PeriodType.Today].selfconsumption, 
      this.figures[PeriodType.ThisMonth].selfconsumption, 
      this.figures[PeriodType.ThisYear].selfconsumption],
    ['可再生能源替代率', this.figures[PeriodType.Today].autarchy, 
      this.figures[PeriodType.ThisMonth].autarchy, 
      this.figures[PeriodType.ThisYear].autarchy],
    ['碳排放强度水平', this.figures[PeriodType.Today].carbonEmissionIntensity, 
      this.figures[PeriodType.ThisMonth].carbonEmissionIntensity, 
      this.figures[PeriodType.ThisYear].carbonEmissionIntensity],
    ['能效水平', this.figures[PeriodType.Today].energyEfficiency, 
      this.figures[PeriodType.ThisMonth].energyEfficiency, 
      this.figures[PeriodType.ThisYear].energyEfficiency],
    ];

    this.historicalHeaders = ['指标名称', '上日', '上月', '上年度'];
    this.historicalData = [
      ['光伏消纳率', this.figures[PeriodType.Yesterday].selfconsumption, 
        this.figures[PeriodType.LastMonth].selfconsumption, 
        this.figures[PeriodType.LastYear].selfconsumption],
      ['可再生能源替代率', this.figures[PeriodType.Yesterday].autarchy, 
        this.figures[PeriodType.LastMonth].autarchy, 
        this.figures[PeriodType.LastYear].autarchy],
      ['碳排放强度水平', this.figures[PeriodType.Yesterday].carbonEmissionIntensity, 
        this.figures[PeriodType.LastMonth].carbonEmissionIntensity, 
        this.figures[PeriodType.LastYear].carbonEmissionIntensity],
      ['能效水平', this.figures[PeriodType.Yesterday].energyEfficiency, 
        this.figures[PeriodType.LastMonth].energyEfficiency, 
        this.figures[PeriodType.LastYear].energyEfficiency],
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
    if (!currentData || Object.keys(currentData.allComponents).length === 0) {
      this.figures[this.period].autarchy = "-";
      this.figures[this.period].selfconsumption = "-";
      this.figures[this.period].carbonEmissionIntensity = "-";
      this.figures[this.period].energyEfficiency = "-";
    } else {
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
      this.figures[this.period].autarchy = this.toPercentageString(autarchyValue);
      this.figures[this.period].selfconsumption = this.toPercentageString(selfconsumptionValue);
      this.figures[this.period].carbonEmissionIntensity = this.toPercentageString(carbonEmissionIntensityLevel);
      this.figures[this.period].energyEfficiency = this.toPercentageString(energyEfficiencyLevel);
    }
  }

  protected override afterOnCurrentData(): void {  
    console.log(`${this.period}: `, this.figures);
    const periodValues = Object.values(PeriodType);
    
    if (this.currentPeriodIndex < periodValues.length) {
        this.period = periodValues[this.currentPeriodIndex]; // 获取下一个 PeriodType
        this.service.historyPeriod.next(this.getPeriod(this.period)); // 触发更新
        this.currentPeriodIndex++;
    } else {
        // 所有 PeriodType 处理完成，更新表格
        this.setTableValues();
        console.log('All periods processed:', this.figures);
    }
  }

  private toPercentageString(value: number): string {
    return (value).toFixed(2) + '%';
  }

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
