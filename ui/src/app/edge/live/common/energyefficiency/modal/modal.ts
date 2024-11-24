import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AbstractFormlyComponent, OeFormlyView } from "src/app/shared/components/shared/oe-formly-component";
import { EdgeConfig } from "src/app/shared/shared";
import { Role } from "src/app/shared/type/role";

@Component({
  templateUrl: "../../../../../shared/components/formly/formly-field-modal/template.html",
})
export class ModalComponent extends AbstractFormlyComponent {

  public static generateView(translate: TranslateService): OeFormlyView {
    return {
      title: "能效水平",
      lines: [{
        type: "info-line",
        name: "以《建筑节能与可再生能源利用通用规范》GB55015-2021规定的夏热冬冷地区标准能耗为基准",
      }],
    };
  }
  protected override generateView(config: EdgeConfig, role: Role): OeFormlyView {
    return ModalComponent.generateView(this.translate);
  }

}
