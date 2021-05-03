import { Component, Inject, Injectable, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { LoginService } from 'app/model/login/login.service';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

import { Router } from '@angular/router';
import { TokenService } from 'app/token/token.service';
import { Observable } from 'rxjs';
import { ProjectDashboardService } from 'app/main/apps/dashboards/project/project.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector     : 'login-2',
    templateUrl  : './login-2.component.html',
    styleUrls    : ['./login-2.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})

@Injectable({
  providedIn: 'root'
})
export class Login2Component implements OnInit
{
    loginForm: FormGroup;
    token: any;
    nameUpperCase: string;
    newUser: any;
    user: any;

    checkBoxValue: any;

    auth: string;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        @Inject(LOCAL_STORAGE) private storage: StorageService,
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private loginService: LoginService,
        private _projectDashboardService: ProjectDashboardService,
        private router: Router,
        private tokenService: TokenService,
        private snackBar: MatSnackBar
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.loginForm = this._formBuilder.group({
            username   : ['', [Validators.required]],
            password: ['', Validators.required]
        });

        const upperCase = localStorage.getItem('username') + '\'S KITCHEN!';
        this.nameUpperCase = upperCase ? upperCase.toUpperCase() : '';

        this.checkBoxValue = localStorage.getItem('checkBox');
        this.loginForm.value.username = localStorage.getItem('name');
        this.loginForm.value.password = localStorage.getItem('password');

        // Automatically refresh token, when already on the login page
        // setInterval(() => {
        //     if (localStorage.getItem('auto_token_expiration_timer') === 'started') {
        //         this._projectDashboardService.getTeamData().subscribe(response => { }, 
        //             error => {
        //                 if (error.status === 403) {
        //                     console.log('Auto Token expiration time, started!');
        //                     setTimeout(() => {
        //                         this.ngOnInit();
        //                     }, 1500);
        //                 }
        //              });
        //     }
        // }, 900000);

        // Auto-generate Token for consequent user login!
        this.loginService.login({ username: 'Server', password: 'server21' }).subscribe(loginRez => {
            
            this.token = [];

            // tslint:disable-next-line: forin
            for (const key in loginRez) {
                this.token.push(loginRez[key]);
            }

            // Save token to local storage
            localStorage.setItem('token', this.token);
            localStorage.setItem('auto_token_expiration_timer', 'started');
            console.log('New auto generated token:\n' + JSON.stringify(this.token));

            // Check if registration was completed or not
            if (localStorage.getItem('registering') === 'true') {
                setTimeout(() => {
                    this.router.navigate(['/pages/auth/register-2']);
                }, 1000);

                return;
            }

            if (localStorage.getItem('createdIncomplete') === 'true') {
                setTimeout(() => {
                    this.router.navigate(['/pages/auth/register-2']);
                }, 1000);

                return;
            }

            // Get logged-in user data!
            this._projectDashboardService.getTeamData().subscribe(data => {
                console.log(data);

                for (const item of data) {
                    this.newUser = data.find((x: { username: any; }) => x.username === localStorage.getItem('username'));
                }

                if (this.newUser === undefined) {
                    console.log('No user is currently signed-in');
                    return;
                }

                console.log(this.newUser.id);
                console.log('Logged-in: ' + this.newUser.loggedIn);

                // Save this user 'id' to local storage!
                localStorage.setItem('id', this.newUser.id);

                if (this.newUser.loggedIn) {
                    setTimeout(() => {
                        this.router.navigate(['/apps/dashboards/project']);
                    }, 500);

                    if (localStorage.getItem('refreshCliked') === 'true') {
                        setTimeout(() => {
                            this.snackBar.open('Welcome back ' + localStorage.getItem('username'), 'Dismiss', { duration: 3500 });
                        }, 2000);
                        localStorage.removeItem('refreshCliked');

                        return;
                    }
                    setTimeout(() => {
                        this.snackBar.open('Welcome ' + localStorage.getItem('username'), 'Dismiss', { duration: 3500 });
                    }, 2000);
                }
            });
        });
    }

    login() {
        // Login with registered username and password
        const name = this.loginForm.value.username;
        const password = this.loginForm.value.password;

        const capitalizeUsername = name ? name.charAt(0).toUpperCase() + name.substr(1).toLowerCase() : '';

        localStorage.setItem('username', capitalizeUsername);

        if (localStorage.getItem('accountCreated') === 'true' && password !== localStorage.getItem('passwordCheck')) {
            this.snackBar.open('Wrong password!', 'Ok', { duration: 3000 });
            return;
        }

        this.loginService.login({ username: capitalizeUsername, password: password }).subscribe(res => {
            console.log(JSON.stringify(res));

            this.auth = 'Login successfull!';

            this.token = [];

            // tslint:disable-next-line: forin
            for (const key in res) {
                this.token.push(res[key]);
            }

            // Save token to local storage
            localStorage.setItem('token', this.token);
            localStorage.setItem('token_expiration_timer', 'started');

            // Remove auto token-expiration timer
            localStorage.removeItem('auto_token_expiration_timer');
            
            // Get current user's data
            this._projectDashboardService.getTeamData().subscribe(userArray => {
                for (const item of userArray) {
                    this.user = userArray.find((x: { username: any; }) => x.username === capitalizeUsername);
                }

                console.log(this.user);

                // Save current userId to local storage
                localStorage.setItem('id', this.user.id);

                // Drop this user (with saved id)
                this.loginService.removeUser().subscribe(() => {
                    console.log('User deleted!');
                });

                // Re-create the user with logged-in update
                this.loginService.reCreateTeam({
                    username: this.user.username,
                    email: this.user.email,
                    password: password,
                    loggedIn: true,
                    phone: this.user.phone,
                    roles: this.user.roles,
                    permissions: this.user.permissions
                })
                    .subscribe((updated) => {
                        console.log('Re-created!');
                        console.log(updated);

                        localStorage.setItem('id', updated.id);
                        localStorage.setItem('name', this.loginForm.value.username);
                        localStorage.setItem('username', updated.username);
                        localStorage.setItem('email', updated.email);
                        localStorage.setItem('password', password);
                        localStorage.setItem('phone', updated.phone);
                        localStorage.setItem('roles', updated.roles);
                        localStorage.setItem('permissions', updated.permissions);

                        localStorage.removeItem('passwordCheck');
                        localStorage.removeItem('accountCreated');

                        console.log('User has been updated with Id "' + updated.id + '"');

                        // Navigate to dashboard on successful login
                        this.router.navigate(['/apps/dashboards/project']);
                    });
            });
        }, error => {
                console.log(error);
                if (error.status === 403) {
                    const snackBarRef = this.snackBar.open('Wrong credentials OR This account does not exist yet!', 'Register', { duration: 5000 });
                    snackBarRef.onAction().subscribe(() => {
                        localStorage.removeItem('auto_token_expiration_timer');
                        this.router.navigate(['/pages/auth/register-2']);
                    });
                }
            });
    }

    cancleEventCheck() {
        localStorage.removeItem('passwordCheck');
        localStorage.removeItem('accountCreated');
        localStorage.removeItem('auto_token_expiration_timer');
    }

    getToken() {
        return localStorage.getItem('token');
    }

    toggle(event: boolean) {
        if (event) {            
            localStorage.setItem('checkBox', this.checkBoxValue);
            localStorage.setItem('name', this.loginForm.value.username);
        }
        else {
            localStorage.removeItem('checkBox');
            localStorage.removeItem('name');
        }

        console.log(event);
    }
}
