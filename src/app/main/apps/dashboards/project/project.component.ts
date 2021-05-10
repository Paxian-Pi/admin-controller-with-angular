import { Component, OnInit, ViewEncapsulation, Inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import * as shape from 'd3-shape';
import { DatePipe } from '@angular/common';

import { MatDialog } from '@angular/material/dialog';

import { fuseAnimations } from '@fuse/animations';

import { ProjectDashboardService } from 'app/main/apps/dashboards/project/project.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { Team } from 'app/model/team/team';
import { LoginService } from 'app/model/login/login.service';
import { Router } from '@angular/router';
import { DialogComponent } from 'app/dialog/alert-dialog/dialog.component';

@Component({
    selector     : 'project-dashboard',
    templateUrl  : './project.component.html',
    styleUrls    : ['./project.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})

export class ProjectDashboardComponent implements OnInit
{
    projects: any[];
    selectedProject: any;

    onDialogOpen: boolean;
    onChat: boolean;

    numberOfStaff: any;

    username: any;
    email: string;
    password: string;
    loggedIn: boolean;
    phone: string;
    roles: string;
    permissions: string;

    user: string;
    
    pendingAuthCount: any;
    remainingCount: any;
    order: any;
    processing: any;
    declined: any;
    delivered: any;
    dd: string;
    mm: string;
    yyyy: string;

    actions: any;

    teams: any;

    widgets: any;
    widget5: any = {};
    widget6: any = {};
    widget7: any = {};
    widget8: any = {};
    widget9: any = {};
    widget11: any = {};

    dateNow = new Date();

    /**
     * Constructor
     *
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {ProjectDashboardService} _projectDashboardService
     */
    constructor(
        private _fuseSidebarService: FuseSidebarService, 
        private _projectDashboardService: ProjectDashboardService,
        public dialog: MatDialog,
        private router: Router,
        public loginService: LoginService) 
        
        {
        /**
         * Widget 5
         */
        this.widget5 = {
            currentRange  : 'TW',
            xAxis         : true,
            yAxis         : true,
            gradient      : false,
            legend        : false,
            showXAxisLabel: false,
            xAxisLabel    : 'Days',
            showYAxisLabel: false,
            yAxisLabel    : 'Isues',
            scheme        : {
                domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
            },
            onSelect      : (ev: any) => {
                console.log(ev);
            },
            supporting    : {
                currentRange  : '',
                xAxis         : false,
                yAxis         : false,
                gradient      : false,
                legend        : false,
                showXAxisLabel: false,
                xAxisLabel    : 'Days',
                showYAxisLabel: false,
                yAxisLabel    : 'Isues',
                scheme        : {
                    domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
                },
                curve         : shape.curveBasis
            }
        };

        /**
         * Widget 6
         */
        this.widget6 = {
            currentRange : 'TW',
            legend       : false,
            explodeSlices: false,
            labels       : true,
            doughnut     : true,
            gradient     : false,
            scheme       : {
                domain: ['#f44336', '#9c27b0', '#03a9f4', '#e91e63']
            },
            onSelect     : (ev: any) => {
                console.log(ev);
            }
        };

        /**
         * Widget 7
         */
        this.widget7 = {
            currentRange: 'T'
        };

        /**
         * Widget 8
         */
        this.widget8 = {
            legend       : false,
            explodeSlices: false,
            labels       : true,
            doughnut     : false,
            gradient     : false,
            scheme       : {
                domain: ['#f44336', '#9c27b0', '#03a9f4', '#e91e63', '#ffc107']
            },
            onSelect     : (ev: any) => {
                console.log(ev);
            }
        };

        /**
         * Widget 9
         */
        this.widget9 = {
            currentRange  : 'TW',
            xAxis         : false,
            yAxis         : false,
            gradient      : false,
            legend        : false,
            showXAxisLabel: false,
            xAxisLabel    : 'Days',
            showYAxisLabel: false,
            yAxisLabel    : 'Isues',
            scheme        : {
                domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
            },
            curve         : shape.curveBasis
        };

        localStorage.removeItem('authStatus');  // From toolbar component
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.projects = this._projectDashboardService.projects;
        this.selectedProject = this.projects[0];
        this.widgets = this._projectDashboardService.widgets;
        this.actions = this._projectDashboardService.getStatus();
        this.pendingAuthCount = this._projectDashboardService.getPendingRidersAuthenticationCount();
        console.log(this.actions);

        /**
         * Widget 11
         */
        this.widget11.onContactsChanged = new BehaviorSubject({});
        this.widget11.onContactsChanged.next(this.widgets.widget11.table.rows);
        this.widget11.dataSource = new FilesDataSource(this.widget11);

        this.username = this._projectDashboardService.getName();     // Get this value from a database later!
        console.log(this.username);


        setInterval(() => {
            this.dateNow = new Date();

            this.dd = String(this.dateNow.getDate()).padStart(2, '0');
            this.mm = String(this.dateNow.getMonth() + 1).padStart(2, '0');
            this.yyyy = String(this.dateNow.getFullYear());

            const datepipe: DatePipe = new DatePipe('en-US');
            const formattedDate = datepipe.transform(this.dateNow, 'HH:mm');
            // const formattedDate = '00:00';

            if (formattedDate === '00:00') {
                this.declined = 0;
                this.delivered = 0;
                this.order = 0;
                this.processing = 0;
                this.remainingCount = 0;
            }
            else {
                this.order = this._projectDashboardService.getOrders();
                this.processing = this._projectDashboardService.getProcessing();
                this.remainingCount = this._projectDashboardService.getRemainingCount();
                this.declined = this._projectDashboardService.getDeclined();
                this.delivered = this._projectDashboardService.getDelivered();
            }
        }, 1000);

        // Get team menbers from db
        this._projectDashboardService.getTeamData().subscribe(data => {

                for (const item of data) {
                    this.user = data.find((x: { username: any; }) => x.username === 'Server');
                }

                if (this.user !== undefined) {
                    console.log(data.shift());
                }
                
                this.teams = data;
                if (data.length < 1) { this.numberOfStaff = 0; }
                else { this.numberOfStaff = data.length; }
                console.log(this.teams);
            }, 
            error => {
                if (error.status === 403) {
                    setTimeout(() => {
                        this.router.navigate(['/pages/auth/lock']);
                    }, 3000);
                }
            });
    }

    onInputChange(event: any) {
        console.log(event);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle the sidebar
     *
     * @param name
     */
    toggleSidebar(name: any): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

    dialogPop(): string {
        return 'Resolve Request';
    }

    openDialog() {
        this.onChat = false;
        this.onDialogOpen = true;
        
        const dialogRef = this.dialog.open(DialogComponent, { 
            height: '300px',
            width: '400px',
            data: { name: 'Pax' }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    chatWithRider() {
        this.onChat = true;
        this.onDialogOpen = false;
        const dialogRef = this.dialog.open(DialogComponent, {
            height: '300px',
            width: '400px',
            data: { chat: 'You have an order to deliver!'}
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }
}

export class FilesDataSource extends DataSource<any> {
    /**
     * Constructor
     *
     * @param _widget11
     */
    constructor(private _widget11: { onContactsChanged: Observable<any[]>; }) {
        super();
    }

    /**
     * Connect function called by the table to retrieve one stream containing the data to render.
     *
     * @returns {Observable<any[]>}
     */
    connect(): Observable<any[]> {
        return this._widget11.onContactsChanged;
    }

    /**
     * Disconnect
     */
    disconnect(): void {}
}

