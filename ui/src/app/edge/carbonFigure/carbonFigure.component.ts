import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-carbon-figure-component',
  imports: [],
  template: `<p>carbonFigure.component works!</p>`,
  styleUrl: './carbonFigure.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarbonFigureComponent { }
