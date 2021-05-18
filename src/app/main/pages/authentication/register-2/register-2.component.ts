import { Component, OnDestroy, OnInit, ViewEncapsulation, Injectable, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { ProjectDashboardService } from 'app/main/apps/dashboards/project/project.service';
import { LoginService } from 'app/model/login/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Token } from 'app/model/token/token';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Login2Component } from '../login-2/login-2.component';
import { Shared } from 'app/shared-pref/shared';

@Injectable({
    providedIn: 'root'
})
@Component({
    selector     : 'register-2',
    templateUrl  : './register-2.component.html',
    styleUrls    : ['./register-2.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class Register2Component implements OnInit, OnDestroy
{
    registerForm: FormGroup;

    selectedRole: string;
    permissions: string;
    userEmail: any;
    userName: any;
    token: any;
    tokenId: any;
    isDisabledSubmitButton = false;

    emailMatch: boolean;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _projectDashboardService: ProjectDashboardService,
        private loginService: LoginService,
        private router: Router,
        public dialog: MatDialog,
        private snackBar: MatSnackBar,
        private loginComponent: Login2Component
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
        this.registerForm = this._formBuilder.group({
            name           : ['', Validators.required],
            email          : ['', [Validators.required, Validators.email]],
            password       : ['', Validators.required],
            passwordConfirm: ['', [Validators.required, confirmPasswordValidator]],
            phone          : ['', Validators.required]
        });

        // Update the validity of the 'passwordConfirm' field
        // when the 'password' field changes
        this.registerForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.registerForm.get('passwordConfirm').updateValueAndValidity();
            });

        if (localStorage.getItem('createdIncomplete') === 'true') {

            this.snackBar.open('Account has been created successfully!', 'Continue').onAction().subscribe(() => {
                // Navigate to login
                this.router.navigate(['/pages/auth/login-2']);
                localStorage.setItem('accountCreated', 'true');
                localStorage.removeItem('registering');
                localStorage.removeItem('createdIncomplete');
            });
        }
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

    cancleRegistering() {
        localStorage.removeItem('registering');
        localStorage.removeItem('passwordCheck');
    }

    checkEmailMatchInDB() {
        // Check email match, against database
        const email = this.registerForm.value.email;
    }

    createTeam() {

        const username = this.registerForm.value.name.trim();
        const email = this.registerForm.value.email.trim();
        const password = this.registerForm.value.password.trim();
        const phone = this.registerForm.value.phone.trim();

        const capitalizeFirstLetter = username ? username.charAt(0).toUpperCase() + username.substr(1).toLowerCase() : '';

        // Auto-generate Token for these requests!
        this.loginService.login({ username: 'Server', password: 'server21' }).subscribe(res => {
            this.token = [];

            // tslint:disable-next-line: forin
            for (const key in res) {
                this.token.push(res[key]);
            }

            // Save token to local storage (Deprecated)
            localStorage.setItem(Shared.token, this.token[0]);

            // Save token to db
            // this.loginService.postToken(this.token[0]).subscribe(authToken => {
            //     console.log(authToken.id);
            //     this.tokenId = authToken.id;
            //     localStorage.setItem('token_id', this.tokenId);
            // });
        });

        // Check email match in db
        this._projectDashboardService.getTeamData().subscribe(data => {

            for (const item of data) {
                this.userEmail = data.find((x: { email: any; }) => x.email === email);
                this.userName = data.find((x: { username: any; }) => x.username === capitalizeFirstLetter);
            }

            if (this.userEmail !== undefined) {
                this.emailMatch = this.userEmail.email === email;
                console.log(this.emailMatch);

                if (this.emailMatch) {
                    this.isDisabledSubmitButton = true;

                    this.snackBar.open('This email "' + email + '" is already taken!', 'Ok').onAction().subscribe(() => {
                        this.registerForm.patchValue({ email: '' });
                        this.isDisabledSubmitButton = false;
                    });
                }
            }
            else if (this.userName !== undefined) {

                if (this.userName.username === capitalizeFirstLetter) {
                    this.isDisabledSubmitButton = true;

                    this.snackBar.open('Username "' + username + '" is in use by another account!', 'Ok').onAction().subscribe(() => {
                        this.registerForm.patchValue({ name: '' });
                        this.isDisabledSubmitButton = false;
                    });
                }
            }
            else {
                // Check password match
                localStorage.setItem('passwordCheck', password);

                // Prevent authorization error by ensuring valid token, while registering!
                localStorage.setItem('registering', 'true');

                // Create new user
                this._projectDashboardService.createTeam({
                    username: capitalizeFirstLetter,
                    email: email,
                    password: password,
                    loggedIn: false,
                    phone: phone,
                    roles: this.selectedRole,
                    permissions: this.permissions
                })
                .subscribe(dataObj => {
                    console.log(dataObj);

                    localStorage.removeItem('name');
                    localStorage.removeItem('password');
                    localStorage.setItem('createdIncomplete', 'true');

                    this.isDisabledSubmitButton = true;

                    this.snackBar.open('Account has been created successfully!', 'Continue').onAction().subscribe(() => {
                        localStorage.setItem('accountCreated', 'true');
                        localStorage.removeItem('registering');
                        localStorage.removeItem('createdIncomplete');

                        // Navigate to login
                        this.router.navigate(['/pages/auth/login-2']);
                    });
                }, 
                error => {
                    this.snackBar.open('Error: Please, try again!', 'Ok', { duration: 10000 });
                });
            }
        });
    }
}

/**
 * Confirm password validator
 *
 * @param {AbstractControl} control
 * @returns {ValidationErrors | null}
 */
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if ( !control.parent || !control )
    {
        return null;
    }

    const password = control.parent.get('password');
    const passwordConfirm = control.parent.get('passwordConfirm');

    if ( !password || !passwordConfirm )
    {
        return null;
    }

    if ( passwordConfirm.value === '' )
    {
        return null;
    }

    if ( password.value === passwordConfirm.value )
    {
        return null;
    }

    return {passwordsNotMatching: true};
};
