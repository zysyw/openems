import { Component } from '@angular/core';
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { ChannelAddress, EdgeConfig } from "src/app/shared/shared";


export interface MeterNode {
  mainMeter: EdgeConfig.Component;
  children: MeterNode[]; // 子电表
}

@Component({
  selector: 'MeterTree',
  templateUrl: './MeterTree.component.html'
})
export class MeterTreeComponent extends AbstractFlatWidget {
  public simulatorMeterComponents: EdgeConfig.Component[] | null = null;
  public simulatorMeters: MeterNode[] = [];

  protected override getChannelAddresses() {

    const channelAddresses: ChannelAddress[] = [];

    // Get consumptionMeterComponents
    this.simulatorMeterComponents = Object.values(this.config.components)
      .filter(component => component.isEnabled) // 
      .filter(component => component.factoryId.includes("Virtual")) //
      .filter(component => component.factoryId.includes("Meter")); // 

    this.createComponentDictionary(this.simulatorMeterComponents)

    for (const meterNode of this.simulatorMeters) {
      // 为主电表（mainMeter）生成 ChannelAddress
      channelAddresses.push(
        new ChannelAddress(meterNode.mainMeter.id, "ActivePower"),
        new ChannelAddress(meterNode.mainMeter.id, "ActivePowerL1"),
        new ChannelAddress(meterNode.mainMeter.id, "ActivePowerL2"),
        new ChannelAddress(meterNode.mainMeter.id, "ActivePowerL3")
      );

      // 为每个子电表生成 ChannelAddress
      for (const childNode of meterNode.children) {
        channelAddresses.push(
          new ChannelAddress(childNode.mainMeter.id, "ActivePower"),
          new ChannelAddress(childNode.mainMeter.id, "ActivePowerL1"),
          new ChannelAddress(childNode.mainMeter.id, "ActivePowerL2"),
          new ChannelAddress(childNode.mainMeter.id, "ActivePowerL3")
        );
      }
    }
    console.log(channelAddresses);
    return channelAddresses;
  }

  private createComponentDictionary(components: EdgeConfig.Component[]): void {
    // 1. 遍历所有组件，找到 factoryId 包含 "Virtual" 的组件作为主电表节点
    components.forEach(gridComponent => {
      if (gridComponent.factoryId.includes('Virtual')) {
        // 2. 使用正则匹配与当前主电表 alias 相关的子电表
        const relatedComponents = components.filter(component => regex.test(component.alias));

        // 3. 构造 MeterNode 结构
        const meterNode: MeterNode = {
          mainMeter: gridComponent,  // 当前的 Grid 组件作为主电表
          children: relatedComponents.map(child => ({
            mainMeter: child,
            children: []  // 暂时不考虑更深的嵌套子电表
          }))
        };

        // 4. 将 MeterNode 添加到 simulatorMeters 数组中
        this.simulatorMeters.push(meterNode);
      }
    });
  }

}
