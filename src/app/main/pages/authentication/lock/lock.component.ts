import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { LoginService } from 'app/model/login/login.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectDashboardService } from 'app/main/apps/dashboards/project/project.service';
import { Shared } from 'app/shared-pref/shared';

@Component({
    selector     : 'lock',
    templateUrl  : './lock.component.html',
    styleUrls    : ['./lock.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class LockComponent implements OnInit
{
    lockForm: FormGroup;
    name: string;
    password: string;
    logoutBtn: string;
    logoutDisabled: boolean;
    isShown = true;
    token: any;
    invalidUser: any;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private loginService: LoginService,
        private router: Router,
        private snackBar: MatSnackBar,
        private _projectDashboardService: ProjectDashboardService
    )
    {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                footer   : {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };

        this.name = localStorage.getItem(Shared.username);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.lockForm = this._formBuilder.group({
            username: [
                {
                    value   : this.name,
                    disabled: true
                }, Validators.required
            ],
            password: ['', Validators.required]
        });
        
        if (localStorage.getItem(Shared.authTokenError) === 'true') {
            this.isShown = false;
            this.logoutDisabled = true;
            this.snackBar.open('Session expired! You need to refresh before logging out...', 'Refresh', { duration: 5000 })
                .onAction().subscribe(() => {
                    this.refresh();
                });
        }
    }
    
    refresh() {
        localStorage.setItem(Shared.refreshCliked, 'true');
        setTimeout(() => {
            this.router.navigate(['/pages/auth/login-2']);
        }, 500);
    }
    
    logoutEvent(): void {

        this.isShown = false;
        this.logoutDisabled = true;

        const snackBarRef = this.snackBar.open('Do you want to logout?', 'Yes, Logout', { duration: 5000 });

        snackBarRef.onAction().subscribe(() => {
            this.logout();
        });

        snackBarRef.afterDismissed().subscribe(() => {
            this.logoutDisabled = false;
            this.isShown = true;
        });
    }

    logout(): void {

        // Auto-generate Token for these requests!
        this.loginService.login({ username: 'Server', password: 'server21' }).subscribe(res => {
            this.token = [];

            // tslint:disable-next-line: forin
            for (const key in res) {
                this.token.push(res[key]);
            }

            // Save token to local storage
            localStorage.setItem(Shared.token, this.token[0]);

            // Get invalid user!
            this._projectDashboardService.getTeamData().subscribe(data => {
                console.log(data);

                for (const item of data) {
                    this.invalidUser = data.filter((x: { username: any; }) => x.username === localStorage.getItem('username'));
                }
            });

            // Re-create the user with logged-in update
            this.loginService.reCreateTeam({
                username: localStorage.getItem(Shared.username),
                email: localStorage.getItem(Shared.email),
                password: localStorage.getItem(Shared.password),
                loggedIn: false,
                phone: localStorage.getItem(Shared.phone),
                roles: localStorage.getItem(Shared.roles),
                permissions: localStorage.getItem(Shared.permissions)
            })
                .subscribe((updated) => {
                    console.log('Re-created!');
                    console.log(updated);
                    console.log('User with Id "' + updated.id + '" has been logged out!');

                    localStorage.setItem(Shared.userId, updated.id);
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
        });
    }
}
