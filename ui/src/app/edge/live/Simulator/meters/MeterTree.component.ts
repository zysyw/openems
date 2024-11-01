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
  public meterComponents: EdgeConfig.Component[] | null = null;
  public meterTree: MeterNode;
  public displayMeterTrees: MeterNode[]

  protected override getChannelAddresses() {

    // Get consumptionMeterComponents
    this.meterComponents = Object.values(this.config.components)
      .filter(component => component.isEnabled) // 
      .filter(component => component.factoryId.includes("Meter")); // 
    
    const rootComponent = this.meterComponents.find(component => component.alias === 'root');
    this.meterTree = this.createMeterNode(rootComponent)
    this.displayMeterTrees = this.expandMeterTree(this.meterTree) //展开成二层结构进行展示

    const channelAddresses = this.setChannelAddresses(this.meterTree)
    
    return channelAddresses;
  }

  private createMeterNode(rootComponent: EdgeConfig.Component): MeterNode {
    const node: MeterNode = {
      mainMeter: rootComponent,
      children: [],
    };
    
    const childComponentIDs = rootComponent.properties?.['meterIds'] || []
    const childComponents = this.meterComponents.filter(component => 
      childComponentIDs.includes(component.id)
    );
    node.children = childComponents.map(child => this.createMeterNode(child));
    return node
  }

  private setChannelAddresses(node: MeterNode): ChannelAddress[] {
    
    const channelAddresses = [
      new ChannelAddress(node.mainMeter.id, "ActivePower"),
      new ChannelAddress(node.mainMeter.id, "ActivePowerL1"),
      new ChannelAddress(node.mainMeter.id, "ActivePowerL2"),
      new ChannelAddress(node.mainMeter.id, "ActivePowerL3")
    ];

    for (const child of node.children) {
      channelAddresses.push(...this.setChannelAddresses(child));
    }
    return channelAddresses;
  }

  private expandMeterTree(node: MeterNode): MeterNode[] {
    // 如果当前节点没有子节点，则返回空数组
    if (node.children.length === 0) {
        return [];
    }

    // 创建包含父节点和直接子节点的新 MeterNode
    const currentLevelNode: MeterNode = {
        mainMeter: node.mainMeter,
        children: node.children,
    };

    // 结果数组包含当前节点和其子节点
    let result = [currentLevelNode];

    // 递归处理每个子节点，将结果合并到当前数组
    for (const child of node.children) {
        result = result.concat(this.expandMeterTree(child));
    }

    return result;
  }

}
