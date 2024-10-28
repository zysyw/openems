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
    // 遍历数据对象，根据 key 更新对应的 SVG <rect> 元素
    Object.keys(data).forEach(channelKey => {
      const value = data[channelKey];
      const displayValue = this.setValue(value)
      
      // 获取 <rect> 元素的 id （从 ChannelAddress 提取 id 部分）
      const rectId = channelKey.split('/')[0];  

      // 选择对应的 <rect> 元素
      const rectElement = d3.select(`#${rectId}`);

      if (!rectElement.empty()) {
        // 更新填充颜色（可以根据数值动态更改颜色）
        rectElement.style('fill', this.getColorBasedOnValue(value));

        // 查找或创建显示数据的 <text> 元素
        let textElement = d3.select(`#${rectId}-text`);
        if (textElement.empty()) {
          // 如果 <text> 元素不存在，则创建它并附加到同一个 SVG 父元素中
          const svg = rectElement.node()?.ownerSVGElement;
          if (svg) {
            textElement = d3.select(svg)
              .append('text')
              .attr('id', `${rectId}-text`)   // 设置唯一的 id
              .attr('x', parseFloat(rectElement.attr('x')) + 10)   // 设置 x 坐标
              .attr('y', parseFloat(rectElement.attr('y')) - 5)    // 设置 y 坐标
              .attr('font-size', '12px')                           // 字体大小
              .attr('fill', 'black');                              // 字体颜色
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
    d3.xml('assets/img/diagram/diagram.svg').then((data) => {
      //获取 <rect> 元素的 ID
      const svgRoot = d3.select(data.documentElement);
      svgRoot.selectAll('rect').each((_, i, nodes) => {
        const rectId = d3.select(nodes[i]).attr('id');
        if (rectId) {
          // 使用 rect 的 ID 创建 ChannelAddress
          const channelAddress = new ChannelAddress(rectId, 'ActivePower');
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
