import { Component } from '@angular/core';
import { AbstractCarbonFigure } from "src/app/shared/components/carbonfigure/abstract-carbon-figure";
import { DefaultTypes } from "src/app/shared/service/defaulttypes";
import { ChannelAddress, Utils } from "src/app/shared/shared";

@Component({
  selector: 'app-carbon-figure-component',
  imports: [],
  templateUrl: `./carbonFigure.component.html`,
  styleUrl: './carbonFigure.component.css',
})
export class CarbonFigureComponent extends AbstractCarbonFigure{

  public periodToday: DefaultTypes.HistoryPeriod = new DefaultTypes.HistoryPeriod();
  public periodThisMonth: DefaultTypes.HistoryPeriod = new DefaultTypes.HistoryPeriod();
  public periodThisYear: DefaultTypes.HistoryPeriod = new DefaultTypes.HistoryPeriod();
  public periodYesterday: DefaultTypes.HistoryPeriod = new DefaultTypes.HistoryPeriod();
  public periodLastMonth: DefaultTypes.HistoryPeriod = new DefaultTypes.HistoryPeriod();
  public periodLastYear: DefaultTypes.HistoryPeriod = new DefaultTypes.HistoryPeriod();

  public autarchyOfperiodToday: Number;
  
  technicalHeaders = ['指标名称', '本日', '本月', '本年度'];
  technicalData = [
    ['光伏消纳率', 
      this.calculateAutarchy(this.periodToday),
      this.calculateAutarchy(this.periodThisMonth),
      this.calculateAutarchy(this.periodThisYear)],
    ['可再生能源替代率', '70%', '75%', '80%'],
    ['碳排放强度水平', '50kg/kWh', '45kg/kWh', '40kg/kWh'],
    ['能效水平', '95%', '92%', '90%'],
  ];

  historicalHeaders = ['指标名称', '上日', '上月', '上年度'];
  historicalData = [
    ['光伏消纳率', 
      this.calculateAutarchy(this.periodYesterday),
      this.calculateAutarchy(this.periodLastMonth),
      this.calculateAutarchy(this.periodLastYear)],
    ['可再生能源替代率', '68%', '73%', '78%'],
    ['碳排放强度水平', '52kg/kWh', '47kg/kWh', '42kg/kWh'],
    ['能效水平', '93%', '91%', '89%'],
  ];

  private calculateAutarchy(period: DefaultTypes.HistoryPeriod): string{
    console.log(period);
    this.getValues(period);
    const autarchyValue =
      Utils.calculateAutarchy(
          this.allComponents["_sum/GridBuyActiveEnergy"] / 1000,
          this.allComponents["_sum/ConsumptionActiveEnergy"] / 1000);
    return String(autarchyValue);
  }

  protected override getChannelAddresses(): ChannelAddress[] {
    return [
        new ChannelAddress("_sum", "GridBuyActiveEnergy"),
        new ChannelAddress("_sum", "ConsumptionActiveEnergy"),
        new ChannelAddress('_sum', 'GridSellActiveEnergy'),
        new ChannelAddress('_sum', 'ProductionActiveEnergy'),
    ];
  }
  
  private setPeriod(){
    const today = new Date();
    // 1. 本日 (今天)
    this.periodToday = new DefaultTypes.HistoryPeriod(today, today);

    // 2. 本月 (本月第一天到本月最后一天)
    this.periodThisMonth = new DefaultTypes.HistoryPeriod(
      new Date(today.getFullYear(), today.getMonth(), 1), // 本月1日
      new Date(today.getFullYear(), today.getMonth() + 1, 0) // 本月最后一天
    );

    // 3. 本年 (本年1月1日到12月31日)
    this.periodThisYear = new DefaultTypes.HistoryPeriod(
      new Date(today.getFullYear(), 0, 1), // 1月1日
      new Date(today.getFullYear(), 11, 31) // 12月31日
    );

    // 4. 上日 (昨天)
    this.periodYesterday = new DefaultTypes.HistoryPeriod(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
    );

    // 5. 上月 (上月第一天到上月最后一天)
    this.periodLastMonth = new DefaultTypes.HistoryPeriod(
      new Date(today.getFullYear(), today.getMonth() - 1, 1), // 上月1日
      new Date(today.getFullYear(), today.getMonth(), 0) // 上月最后一天
    );

    // 6. 上年 (去年1月1日到12月31日)
    this.periodLastYear = new DefaultTypes.HistoryPeriod(
      new Date(today.getFullYear() - 1, 0, 1), // 去年1月1日
      new Date(today.getFullYear() - 1, 11, 31) // 去年12月31日
    );
  }
}
