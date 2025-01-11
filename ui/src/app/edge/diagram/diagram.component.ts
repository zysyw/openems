import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { AbstractDiagramBase } from "src/app/shared/components/diagram/abstract-diagram";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { Filter } from "src/app/shared/components/shared/filter";
import { ChannelAddress, EdgeConfig, Service, Utils } from "src/app/shared/shared";

@Component({
  selector: 'diagram',
  templateUrl: './diagram.component.html',
  styleUrl: './diagram.component.css'
})
export class DiagramComponent extends AbstractDiagramBase implements OnInit, OnDestroy,AfterViewInit {
  
  public filter: Filter = Filter.NO_FILTER;
  private channelAddresses: ChannelAddress[] = [];
  public evcss: EdgeConfig.Component[] | null = null;
  public allMeters: EdgeConfig.Component[] | null = null;
  public allEsss: EdgeConfig.Component[] | null = null;

  constructor(
    service: Service,          
    private dataService: DataService  
  ) {
    super(service); 
  }

  protected getChannelAddresses(): ChannelAddress[] {
    //Get Sum
    const channelAddresses: ChannelAddress[] = [
        new ChannelAddress("_sum", "ConsumptionActivePower"),
        new ChannelAddress('_sum', 'GridActivePower'),
        new ChannelAddress('_sum', 'ProductionActivePower'),
        new ChannelAddress('_sum', 'EssActivePower'),
    ];
    //Get Meters
    this.allMeters = this.config.getComponentsImplementingNature("io.openems.edge.meter.api.ElectricityMeter");

    for (const component of this.allMeters) {
      channelAddresses.push(
        new ChannelAddress(component.id, "ActivePower"),
      );
    }
    //Get Esss
    this.allEsss = this.config.getComponentsImplementingNature("io.openems.edge.ess.api.SymmetricEss");

    for (const component of this.allEsss) {
      channelAddresses.push(
        new ChannelAddress(component.id, "ActivePower"),
      );
    }
    // Get EVCSs
    this.evcss = this.config.getComponentsImplementingNature("io.openems.edge.evcs.api.Evcs")
      .filter(component =>
        !(component.factoryId == "Evcs.Cluster.SelfConsumption") &&
        !(component.factoryId == "Evcs.Cluster.PeakShaving") &&
        !(this.config.factories[component.factoryId].natureIds.includes("io.openems.edge.meter.api.ElectricityMeter")) &&
        !component.isEnabled == false);

    for (const component of this.evcss) {
      channelAddresses.push(
        new ChannelAddress(component.id, "ChargePower"),
      );
    }
    return channelAddresses;
  }

  ngAfterViewInit() {
    
    // 加载 SVG 文件
    d3.xml('assets/img/diagram/svgviewer-output.svg').then((data) => {
      // 添加到 DOM 中
      const container = d3.select('#diagramContainer');      
      if (container.node()) {
        container.node().appendChild(data.documentElement);
      }

    }).catch((error) => {
      console.error('Error loading SVG:', error);
    });
  }

  protected onCurrentData(data: { [key: string]: any }): void {
    //console.log('Received data:', data);
    this.updateDiagramDisplayValue(data);
  }

  private  updateDiagramDisplayValue(data: { [key: string]: any }): void{
    // 遍历数据对象，根据 key 更新对应的 <g> 元素
    Object.keys(data).forEach(channelKey => {
      const bindingKey = this.replaceSlashWithColon(channelKey);
      // 选择对应的 <g> 元素
      const bindingElement = d3.select(`#${bindingKey}`);
      if (!bindingElement.empty()) {
        const value = data[channelKey];
        const displayValue = Utils.CONVERT_WATT_TO_KILOWATT(value)

        // 查找或创建显示数据的 <text> 元素
        let textElement = d3.select(`#${bindingKey}-text`);
        if (textElement.empty()) {
            const textAttr = this.getTextAttr(bindingElement, bindingKey);
            const svg = bindingElement.node()?.parentNode;
            if (svg) {
              textElement = d3.select(svg)
                .append('text')
                .attr('id', `${bindingKey}-text`)   // 设置唯一的 id
                .attr('x', textAttr.xPos)   // 设置 x 坐标
                .attr('y', textAttr.yPos)    // 设置 y 坐标
                .attr('font-size', textAttr.font) 
                .attr('fill', textAttr.fill)
                .attr('style', textAttr.style); 
            }
        }

        // 更新 <text> 元素的文本内容
        textElement.text(`${displayValue}`);
      }
    });
  }

  private replaceSlashWithColon(input) {
    if (typeof input !== "string") {
      throw new Error("Input must be a string");
    }
    return input.replace(/\//g, "_");
  }

  private getTextAttr(bindingElement: d3.Selection, bindingKey: string): { xPos: number, yPos: number, font: string, fill: string,style: string } {
    const bbox = bindingElement.node()?.getBBox();
    // 根据 bindingKey 的内容选择计算逻辑
    if (bindingKey.includes("meter") || bindingKey.includes("ess")) {
      // 适用于 meter 或者 ess 的逻辑
      return {
        xPos: bbox.x + bbox.width + 10, // 右侧 10 像素
        yPos: bbox.y + bbox.height / 2, // 垂直居中
        font: '12px',
        fill: 'red',
        style: "",
      };
    } else if (bindingKey.includes("_sum")) {
      console.log('bindingKey:', bindingKey);
      // 适用于 _sum 的逻辑
      return {
        xPos: bbox.x + bbox.width + 0, // 偏移 10 像素
        yPos: bbox.y + bbox.height / 1.2, // 文字垂直居中
        font: bindingElement.attr('font-size'),
        fill: bindingElement.attr('fill'),
        style: bindingElement.attr('style'),
      };
    }
  }

}
