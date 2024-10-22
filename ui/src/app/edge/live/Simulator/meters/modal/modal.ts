import { Component, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { TextIndentation } from "src/app/shared/components/modal/modal-line/modal-line";
import { Converter } from "src/app/shared/components/shared/converter";
import { AbstractFormlyComponent, OeFormlyField, OeFormlyView } from "src/app/shared/components/shared/oe-formly-component";
import { Phase } from "src/app/shared/components/shared/phase";

import { EdgeConfig } from "../../../../../shared/shared";

@Component({
  templateUrl: "../../../../../shared/components/formly/formly-field-modal/template.html",
})
export class ModalComponent extends AbstractFormlyComponent {
  @Input() meter: EdgeConfig.Component;

  public static generateView(meter: EdgeConfig.Component, translate: TranslateService): OeFormlyView {

    const lines: OeFormlyField[] = [];

    // Total
    lines.push({
      type: "channel-line",
      name: translate.instant("General.TOTAL"),
      channel: meter.id + "/ActivePower",
      converter: Converter.ONLY_POSITIVE_POWER_AND_NEGATIVE_AS_ZERO,
    });

    Phase.THREE_PHASE.forEach(phase => {
      lines.push({
        type: "channel-line",
        name: translate.instant("General.phase") + " " + phase,
        indentation: TextIndentation.SINGLE,
        channel: meter.id + "/ActivePower" + phase,
        converter: Converter.ONLY_POSITIVE_POWER_AND_NEGATIVE_AS_ZERO,
      });
    });

    lines.push({
      type: "info-line",
      name: translate.instant("Edge.Index.Widgets.phasesInfo"),
    });

    return {
      title: translate.instant("General.consumption"),
      lines: lines,
    };
  }

  protected override generateView(config: EdgeConfig): OeFormlyView {
    return ModalComponent.generateView(this.meter, this.translate);
  }

}
