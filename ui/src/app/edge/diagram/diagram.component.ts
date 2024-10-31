import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { RefresherCustomEvent } from "@ionic/angular";
import * as d3 from 'd3';
import { AbstractDiagramBase } from "src/app/shared/components/diagram/abstract-diagram";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { Filter } from "src/app/shared/components/shared/filter";
import { ChannelAddress, Service, Utils } from "src/app/shared/shared";

@Component({
  selector: 'diagram',
  templateUrl: './diagram.component.html',
  styleUrl: './diagram.component.css'
})
export class DiagramComponent extends AbstractDiagramBase implements OnInit, OnDestroy,AfterViewInit {
  
  public filter: Filter = Filter.NO_FILTER;
  public converter = (value: any): string => { return value; };
  public readonly CONVERT_WATT_TO_KILOWATT = Utils.CONVERT_WATT_TO_KILOWATT;
  private channelAddresses: ChannelAddress[] = [];

  constructor(
    service: Service,          
    private dataService: DataService  
  ) {
    super(service); 
  }

  protected getChannelAddresses(): ChannelAddress[] {
    return this.channelAddresses;
  }

  protected onCurrentData(data: { [key: string]: any }): void {
    // 实现数据处理逻辑，如更新图表、日志等
    console.log('Received data:', data);
    // 遍历数据对象，根据 key 更新对应的 meter 元素
    Object.keys(data).forEach(channelKey => {
      const value = data[channelKey];
      const displayValue = this.setValue(value)
      
      // 获取 <rect> 元素的 id （从 ChannelAddress 提取 id 部分）
      const meterId = channelKey.split('/')[0];  

      // 选择对应的 <rect> 元素
      const meterElement = d3.select(`#${meterId}`);

      if (!meterElement.empty()) {
        // 更新填充颜色（可以根据数值动态更改颜色）
        meterElement.style('fill', this.getColorBasedOnValue(value));

        // 查找或创建显示数据的 <text> 元素
        let textElement = d3.select(`#${meterId}-text`);
        if (textElement.empty()) {
          // 如果 <text> 元素不存在，则创建它并附加到同一个 SVG 父元素中
          
          const bbox = meterElement.node()?.getBBox();
          if (bbox) {
            // 计算文本的位置（在右侧显示）
            const xPos = bbox.x + bbox.width + 10; // 右侧 20 个单位
            const yPos = bbox.y + bbox.height / 2; // 居中
            const svg = meterElement.node()?.parentNode;
            if (svg) {
              textElement = d3.select(svg)
                .append('text')
                .attr('id', `${meterId}-text`)   // 设置唯一的 id
                .attr('x', xPos)   // 设置 x 坐标
                .attr('y', yPos)    // 设置 y 坐标
                .attr('font-size', '12px') 
                .attr('fill', 'red'); 
            }
          }
        }

        // 更新 <text> 元素的文本内容
        textElement.text(`${displayValue}`);
      }
    });
  }

  private getColorBasedOnValue(value: number): string {
    if (value > 1000) {
        return 'red';       // 高值显示为红色
    } else if (value > 500) {
        return 'orange';    // 中等值显示为橙色
    } else if (value > 100) {
        return 'yellow';    // 较低值显示为黄色
    } else if (value > 50) {
        return 'lightgreen'; // 更低值显示为浅绿色
    } else {
        return 'green';     // 最低值显示为绿色
    }
  }

  private setValue(value: any) :string {
    this.converter = this.CONVERT_WATT_TO_KILOWATT;
    return this.converter(value);
  }

  ngAfterViewInit() {
    
    // 加载 SVG 文件
    d3.xml('assets/img/diagram/svgviewer-output.svg').then((data) => {
      // 获取 id 中包含 "meter" 的元素
      const svgRoot = d3.select(data.documentElement);
      svgRoot.selectAll('*').each((_, i, nodes) => {
          const element = d3.select(nodes[i]);
          const elementId = element.attr('id');
          if (elementId && elementId.includes('meter')) {
              const channelAddress = new ChannelAddress(elementId, 'ActivePower');
              this.channelAddresses.push(channelAddress);
          }
      });
      // 将 SVG 节点添加到容器中
      const container = d3.select('#diagramContainer');      
      if (container.node()) {
        container.node().appendChild(data.documentElement);
      }

    }).catch((error) => {
      console.error('Error loading SVG:', error);
    });
  }

  protected handleRefresh: (ev: RefresherCustomEvent) => void = (ev: RefresherCustomEvent) => this.dataService.refresh(ev);
}
