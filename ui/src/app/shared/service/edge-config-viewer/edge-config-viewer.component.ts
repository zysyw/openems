import { CommonModule } from "@angular/common";
import { Component, OnInit } from '@angular/core';
import { EdgeConfig, Service } from "../../shared";

@Component({
  selector: 'app-edge-config-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edge-config-viewer.component.html',
  styleUrl: './edge-config-viewer.component.css'
})
export class EdgeConfigViewerComponent implements OnInit {

  edgeConfig: EdgeConfig | null = null;
  naturesMap: { [natureId: string]: EdgeConfig.Nature } = {};
  errorMessage: string | null = null;

  constructor(private service: Service) { }

  ngOnInit(): void {
    this.loadEdgeConfig();
  }

  loadEdgeConfig(): void {
    this.service.getConfig().then((config: EdgeConfig) => {
      this.edgeConfig = config;
      this.naturesMap = EdgeConfig.getNaturesOfFactories(this.edgeConfig.factories);
    }).catch(error => {
      this.errorMessage = 'Failed to load EdgeConfig';
      console.error(error);
    });
  }

  getNatureNameById(natureId: string): string {
    return this.naturesMap[natureId]?.name || 'Unknown Nature';
  }

  getNatureIdsByFactory(factoryId: string): string[] {
    return this.edgeConfig.getNatureIdsByFactoryId(factoryId);
  }

  // 辅助函数，返回一个对象的键列表
  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
