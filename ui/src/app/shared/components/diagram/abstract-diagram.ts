import { Directive, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ChannelAddress, Edge, EdgeConfig, Service } from "src/app/shared/shared";

@Directive()
export abstract class AbstractDiagramBase implements OnInit, OnDestroy {

  protected edge: Edge | null = null;
  protected config: EdgeConfig | null = null;
  private stopOnDestroy: Subject<void> = new Subject<void>();

  constructor(
    protected service: Service,
  ) {}

  ngOnInit() {
    this.service.getCurrentEdge().then(edge => {
      this.edge = edge;
      this.service.getConfig().then(config => {
        this.config = config;

        // 获取通道地址并订阅数据流
        const channelAddresses: ChannelAddress[] = this.getChannelAddresses();

        // 订阅实时数据流，处理更新的数据
        if (channelAddresses.length > 0) {
          this.edge.subscribeChannels(this.service.websocket, 'diagram', channelAddresses);
        } 

        edge.currentData.pipe(takeUntil(this.stopOnDestroy)).subscribe(currentData => {
          const allComponents: { [key: string]: any } = {};
          for (const channelAddress of channelAddresses) {
              const channelKey = channelAddress.toString();
              allComponents[channelKey] = currentData.channel[channelKey];
          }
          this.onCurrentData(allComponents);
        }); 
         
      });
    });
  }

  ngOnDestroy() {
    if (this.edge) {
        this.edge.unsubscribeChannels(this.service.websocket, 'diagram');
    }
    this.stopOnDestroy.next();
    this.stopOnDestroy.complete();
  }

  /**
    * 获取要订阅的通道地址，由具体子类实现。
    */
  protected abstract getChannelAddresses(): ChannelAddress[];

  /**
    * 处理实时数据更新的钩子，由具体子类实现。
    *
    * @param data - 提取的通道数据
    */
  protected abstract onCurrentData(data: { [key: string]: any }): void;
}
