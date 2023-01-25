import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MenuController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments';

import { SubscribeEdgesRequest } from '../jsonrpc/request/subscribeEdgesRequest';
import { PickDateComponent } from '../pickdate/pickdate.component';
import { ChannelAddress, Edge, Service, Websocket } from '../shared';
import { StatusSingleComponent } from '../status/single/status.component';

@Component({
    selector: 'header',
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewChecked {

    @ViewChild(PickDateComponent, { static: false }) PickDateComponent: PickDateComponent

    public environment = environment;
    public backUrl: string | boolean = '/';
    public enableSideMenu: boolean;
    public currentPage: 'EdgeSettings' | 'Other' | 'IndexLive' | 'IndexHistory' = 'Other';
    public isSystemLogEnabled: boolean = false;
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(
        private cdRef: ChangeDetectorRef,
        public menu: MenuController,
        public modalCtrl: ModalController,
        public router: Router,
        public service: Service,
        public websocket: Websocket,
        private activatedRoute: ActivatedRoute
    ) { }

    ngOnInit() {
        // set inital URL
        this.updateUrl(window.location.pathname);
        // update backUrl on navigation events
        this.router.events.pipe(
            takeUntil(this.ngUnsubscribe),
            filter(event => event instanceof NavigationEnd)
        ).subscribe(event => {
            window.scrollTo(0, 0);
            this.updateUrl((<NavigationEnd>event).urlAfterRedirects);
        })

        this.activatedRoute.params.pipe(filter(route => route && route['edgeId']), first()).subscribe(route => {
            const edgeId: string = route['edgeId'];
            if (this.service.metadata.value?.edges[edgeId]) {
                this.websocket.sendSafeRequest(new SubscribeEdgesRequest({ edges: [edgeId] }))
                return
            }

            this.service.updateCurrentEdgeInMetadata(edgeId).catch(() => {
                this.router.navigateByUrl("/index", { replaceUrl: true });
            })
        })

        // subscribe for single status component
        this.service.currentEdge.pipe(takeUntil(this.ngUnsubscribe)).subscribe(edge => {
            if (edge != null) {
                edge.subscribeChannels(this.websocket, '', [
                    new ChannelAddress('_sum', 'State'),
                ]);
            }
        })
    }

    // used to prevent 'Expression has changed after it was checked' error
    ngAfterViewChecked() {
        this.cdRef.detectChanges()
    }

    updateUrl(url: string) {
        this.updateBackUrl(url);
        this.updateEnableSideMenu(url);
        this.updateCurrentPage(url);
    }

    updateEnableSideMenu(url: string) {
        let urlArray = url.split('/');
        let file = urlArray.pop();

        if (file == 'user' || file == 'settings' || file == 'changelog' || urlArray.length > 3) {
            // disable side-menu; show back-button instead
            this.enableSideMenu = false;
        } else {
            // enable side-menu if back-button is not needed 
            this.enableSideMenu = true;
        }
    }

    updateBackUrl(url: string) {
        // disable backUrl & Segment Navigation on initial 'index' page
        if (url === '/index') {
            this.backUrl = false;
            return;
        }

        // set backUrl for user when an Edge had been selected before
        let currentEdge: Edge = this.service.currentEdge.value;
        if (url === '/user' && currentEdge != null) {
            this.backUrl = '/device/' + currentEdge.id + "/live"
            return;
        }
        if (url === '/changelog' && currentEdge != null) {
            // TODO this does not work if Changelog was opened from /user
            this.backUrl = '/device/' + currentEdge.id + "/settings/profile"
            return;
        }

        let urlArray = url.split('/');
        let backUrl: string | boolean = '/';
        let file = urlArray.pop();

        // disable backUrl for History & EdgeIndex Component ++ Enable Segment Navigation
        if ((file == 'history' || file == 'live') && urlArray.length == 3) {
            this.backUrl = false;
            return;
        } else {
        }

        // disable backUrl to first 'index' page from Edge index if there is only one Edge in the system
        if (file === 'live' && urlArray.length == 3 && this.environment.backend === "OpenEMS Edge") {
            this.backUrl = false;
            return;
        }

        // remove one part of the url for 'index'
        if (file === 'live') {
            urlArray.pop();
        }

        // fix url for App "settings/app/install" and "settings/app/update"
        if (urlArray.slice(-3, -1).join('/') === "settings/app") {
            urlArray.pop();
        }

        // re-join the url
        backUrl = urlArray.join('/') || '/';

        // correct path for '/device/[edgeId]/index'
        if (backUrl === '/device') {
            backUrl = '/';
        }
        this.backUrl = backUrl;
    }

    updateCurrentPage(url: string) {
        let urlArray = url.split('/');
        let file = urlArray.pop();
        if (urlArray.length >= 4) {
            file = urlArray[3];
        }
        // Enable Segment Navigation for Edge-Index-Page
        if ((file == 'history' || file == 'live') && urlArray.length == 3) {
            if (file == 'history') {
                this.currentPage = 'IndexHistory';
            } else {
                this.currentPage = 'IndexLive';
            }
        } else if (file == 'settings' && urlArray.length > 1) {
            this.currentPage = 'EdgeSettings';
        }
        else {
            this.currentPage = 'Other';
        }
    }

    public segmentChanged(event) {
        if (event.detail.value == "IndexLive") {
            this.router.navigateByUrl("/device/" + this.service.currentEdge.value.id + "/live", { replaceUrl: true });
            this.cdRef.detectChanges();
        }
        if (event.detail.value == "IndexHistory") {
            this.router.navigateByUrl("/device/" + this.service.currentEdge.value.id + "/history", { replaceUrl: true });
            this.cdRef.detectChanges();
        }
    }

    async presentSingleStatusModal() {
        const modal = await this.modalCtrl.create({
            component: StatusSingleComponent,
        });
        return await modal.present();
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}