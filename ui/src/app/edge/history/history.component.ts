import { Component, OnInit, OnDestroy } from '@angular/core';
//import { Router, ActivatedRoute, Params } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime, delay } from 'rxjs/operators';
import * as d3 from 'd3';
import * as d3shape from 'd3-shape';
import { TranslateService } from '@ngx-translate/core';
import { IMyDate, IMyDateRange, IMyDrpOptions, IMyDateRangeModel } from 'mydaterangepicker';
import { format, subDays, addDays, isSameDay, getYear, getMonth, getDate } from 'date-fns';

import { Edge } from '../../shared/edge/edge';
import { ConfigImpl } from '../../shared/edge/config';
import { DefaultTypes } from '../../shared/service/defaulttypes';
import { Websocket } from '../../shared/service/websocket';
import { Service } from '../../shared/shared';

type PeriodString = "today" | "yesterday" | "lastWeek" | "lastMonth" | "lastYear" | "otherPeriod";

@Component({
  selector: 'history',
  templateUrl: './history.component.html'
})
export class HistoryComponent implements OnInit, OnDestroy {

  private readonly TODAY = new Date();
  private readonly YESTERDAY = subDays(new Date(), 1);
  private readonly TOMORROW = addDays(new Date(), 1);

  public edge: Edge = null;
  public config: ConfigImpl = null;
  public socChannels: DefaultTypes.ChannelAddresses = {};
  public powerChannels: DefaultTypes.ChannelAddresses = {};
  public evcsChannels: DefaultTypes.ChannelAddresses = {};
  public Channels: DefaultTypes.ChannelAddresses = {};
  private dateRange: IMyDateRange;
  public fromDate = this.TODAY;
  public toDate = this.TODAY;
  public activePeriodText: string = "";
  private dateRangePickerOptions: IMyDrpOptions = {
    inline: true,
    showClearBtn: false,
    showApplyBtn: false,
    dateFormat: 'dd.mm.yyyy',
    disableUntil: { day: 1, month: 1, year: 2013 }, // TODO start with date since the edge is available
    disableSince: this.toIMyDate(this.TOMORROW),
    showWeekNumbers: true,
    showClearDateRangeBtn: false,
    editableDateRangeField: false,
    openSelectorOnInputClick: true,
  };
  // sets the height for a chart. This is recalculated on every window resize.
  public socChartHeight: string = "250px";
  public energyChartHeight: string = "250px";
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public activePeriod: PeriodString = "today";

  constructor(
    public websocket: Websocket,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private service: Service,
  ) {
  }

  ngOnInit() {
    this.websocket.setCurrentEdge(this.route)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(edge => {
        this.edge = edge;
        if (edge == null) {
          this.config = null;
        } else {
          edge.config
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(config => {
              this.config = config;
              if (config) {
                this.socChannels = config.getEssSocChannels();
                this.powerChannels = config.getPowerChannels();
                this.evcsChannels = config.getEvcsChannels();
              } else {
                this.socChannels = {};
                this.powerChannels = {};
                this.evcsChannels = {};
              }
            });
        }
      });
    this.setPeriod("today");

    // adjust chart size in the beginning and on window resize
    setTimeout(() => this.updateOnWindowResize(), 200);
    const source = fromEvent(window, 'resize', null, null);
    const subscription = source.pipe(takeUntil(this.ngUnsubscribe), debounceTime(200), delay(100)).subscribe(e => {
      this.updateOnWindowResize();
    });
  }

  updateOnWindowResize() {
    //console.log(window.innerHeight, window.innerWidth);
    let ref = /* fix proportions */ Math.min(window.innerHeight - 150,
      /* handle grid breakpoints */(window.innerWidth < 768 ? window.innerWidth - 150 : window.innerWidth - 400));
    this.socChartHeight =
      /* minimum size */ Math.max(150,
      /* maximium size */ Math.min(250, ref)
      ) + "px";
    this.energyChartHeight =
      /* minimum size */ Math.max(300,
      /* maximium size */ Math.min(600, ref)
      ) + "px";
  }

  clickOtherPeriod() {
    if (this.activePeriod === 'otherPeriod') {
      this.setPeriod("today");
    } else {
      this.setPeriod("otherPeriod", this.YESTERDAY, this.TODAY);
    }
  }

  onDateRangeChanged(event: IMyDateRangeModel) {
    let fromDate = event.beginJsDate;
    let toDate = event.endJsDate;
    if (isSameDay(fromDate, toDate)) {
      // only one day selected
      if (isSameDay(this.TODAY, fromDate)) {
        this.setPeriod("today");
        return;
      } else if (isSameDay(this.YESTERDAY, fromDate)) {
        this.setPeriod("yesterday");
        return;
      }
    }
    this.setPeriod("otherPeriod", fromDate, toDate);
  }

  /**
   * This is called by the input button on the UI.
   * @param period
   * @param from
   * @param to
   */
  setPeriod(period: PeriodString, fromDate?: Date, toDate?: Date) {
    this.activePeriod = period;
    switch (period) {
      case "yesterday": {
        let yesterday = subDays(new Date(), 1);
        this.setDateRange(yesterday, yesterday);
        this.activePeriodText = this.translate.instant('Edge.History.Yesterday') + ", " + format(yesterday, this.translate.instant('General.DateFormat'));
        break;
      }
      case "otherPeriod":
        if (fromDate > toDate) {
          toDate = fromDate;
        }
        this.setDateRange(fromDate, toDate);
        this.activePeriodText = this.translate.instant('General.PeriodFromTo', {
          value1: format(fromDate, this.translate.instant('General.DateFormat')),
          value2: format(toDate, this.translate.instant('General.DateFormat'))
        });
        break;
      case "today":
      default:
        let today = new Date();
        this.setDateRange(today, today);
        this.activePeriodText = this.translate.instant('Edge.History.Today') + ", " + format(today, this.translate.instant('General.DateFormat'));
        break;
    }
  }

  private setDateRange(fromDate: Date, toDate: Date) {
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.dateRange = {
      beginDate: this.toIMyDate(fromDate),
      endDate: this.toIMyDate(toDate)
    }
  }

  private toIMyDate(date: Date): IMyDate {
    return { year: getYear(date), month: getMonth(date) + 1, day: getDate(date) }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}