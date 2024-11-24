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
      title: "碳排放强度水平",
      lines: [{
        type: "info-line",
        name: "以希望达到的碳排放强度为基准，以当前功率计算年度电量",
      }],
    };
  }
  protected override generateView(config: EdgeConfig, role: Role): OeFormlyView {
    return ModalComponent.generateView(this.translate);
  }

}
