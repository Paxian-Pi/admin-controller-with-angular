import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import { navigation } from 'app/navigation/navigation';
import { Router } from '@angular/router';
import { LoginService } from 'app/model/login/login.service';
import { ProjectDashboardService } from 'app/main/apps/dashboards/project/project.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'app/dialog/alert-dialog/dialog.component';

@Component({
    selector     : 'toolbar',
    templateUrl  : './toolbar.component.html',
    styleUrls    : ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ToolbarComponent implements OnInit, OnDestroy
{
    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;
    languages: any;
    navigation: any;
    selectedLanguage: any;
    userStatusOptions: any[];

    username: string;
    user: any;
    invalidUser: any;
    _id: string;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {TranslateService} _translateService
     */
    constructor(
        public dialog: MatDialog,
        private _fuseConfigService: FuseConfigService,
        private _fuseSidebarService: FuseSidebarService,
        private _translateService: TranslateService,
        private router: Router,
        private loginService: LoginService,
        private _projectDashboardService: ProjectDashboardService
    )
    {
        // Set the defaults
        this.userStatusOptions = [
            {
                title: 'Online',
                icon : 'icon-checkbox-marked-circle',
                color: '#4CAF50'
            },
            {
                title: 'Away',
                icon : 'icon-clock',
                color: '#FFC107'
            },
            {
                title: 'Do not Disturb',
                icon : 'icon-minus-circle',
                color: '#F44336'
            },
            {
                title: 'Invisible',
                icon : 'icon-checkbox-blank-circle-outline',
                color: '#BDBDBD'
            },
            {
                title: 'Offline',
                icon : 'icon-checkbox-blank-circle-outline',
                color: '#616161'
            }
        ];

        this.languages = [
            {
                id   : 'en',
                title: 'English',
                flag : 'us'
            },
            {
                id   : 'tr',
                title: 'Turkish',
                flag : 'tr'
            }
        ];

        this.navigation = navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings: { layout: { navbar: { position: string; hidden: boolean; }; }; }) => {
                this.horizontalNavbar = settings.layout.navbar.position === 'top';
                this.rightNavbar = settings.layout.navbar.position === 'right';
                this.hiddenNavbar = settings.layout.navbar.hidden === true;
            });

        // Set the selected language from default languages
        this.selectedLanguage = _.find(this.languages, {id: this._translateService.currentLang});

        this.username = localStorage.getItem('username');
        setInterval(() => {
            this._projectDashboardService.getTeamData().subscribe(data => {
                console.log(data);

            }, error => {
                if (error.status === 403) {
                    localStorage.setItem('authStatus', 'tokenError');
                }
            });
        }, 300000);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Logout
     */

    logoutDialog() {
        const dialogRef = this.dialog.open(DialogComponent, {
            width: '400px',
            data: { 
                title: 'Confirmation!', 
                message: 'You are about to log out?', 
                negativeButton: 'YES, LOGOUT', 
                positiveButton: 'CANCEL'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) { this.logout(); }
        });
    }

    logout(): void {

        if (localStorage.getItem('authStatus') === 'tokenError') {
            localStorage.setItem('authTokenError', 'true');
            
            this.router.navigate(['/pages/auth/lock']);
            return;
        }

        // Get invalid user!
        this._projectDashboardService.getTeamData().subscribe(data => {
            console.log(data);

            for (const item of data) {
                this.invalidUser = data.filter((x: { username: any; }) => x.username === localStorage.getItem('username'));
            }
        });

        // Re-create the user with logged-in update
        this.loginService.reCreateTeam({
            username: localStorage.getItem('username'),
            email: localStorage.getItem('email'),
            password: localStorage.getItem('password'),
            loggedIn: false,
            phone: localStorage.getItem('phone'),
            roles: localStorage.getItem('roles'),
            permissions: localStorage.getItem('permissions')
        })
        .subscribe((updated) => {
            console.log('Re-created!');
            console.log(updated);
            console.log('User with Id "' + updated.id + '" has been logged out!');

            localStorage.setItem('id', updated.id);
        }, error => {
            if (error.status === 403 || error.status === 500) {
                localStorage.setItem('server_error', 'true');
            }
        });

        if (localStorage.getItem('server_error') === 'true') {
            return;
        }

        // Drop this user
        this.loginService.removeUser().subscribe(() => {
            localStorage.removeItem('server_error');
            console.log('User deleted!');
            console.log(this.invalidUser[0].loggedIn);

            // Navigate to dashboard on successful login
            this.router.navigate(['/pages/auth/login-2']);
        }, error => {
            if (error.status === 403 || error.status === 500) {
                localStorage.setItem('invalid_user_not_deleted', 'true');
            }
        });

        if (localStorage.getItem('invalid_user_not_deleted') === 'true') {
            // Call the 'removeUser' function again!
            if (this.invalidUser[0].loggedIn === true) {
                localStorage.setItem('id', this.invalidUser[0].id);

                this.loginService.removeUser().subscribe(() => {
                    localStorage.removeItem('invalid_user_not_deleted');

                    // Navigate to dashboard on successful login
                    this.router.navigate(['/pages/auth/login-2']);
                });
            }
        }
    }

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key: any): void
    {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    /**
     * Search
     *
     * @param value
     */
    search(value: any): void
    {
        // Do your search here...
        console.log(value);
    }

    /**
     * Set the language
     *
     * @param lang
     */
    setLanguage(lang: { id: string; }): void
    {
        // Set the selected language for the toolbar
        this.selectedLanguage = lang;

        // Use the selected language for translations
        this._translateService.use(lang.id);
    }
}
