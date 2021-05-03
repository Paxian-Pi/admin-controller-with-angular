import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { MaterialModule } from 'app/material/material.module';

import { FuseSharedModule } from '@fuse/shared.module';

import { Register2Component } from 'app/main/pages/authentication/register-2/register-2.component';
import { ProjectDashboardService } from 'app/main/apps/dashboards/project/project.service';

const routes = [
    {
        path     : 'auth/register-2',
        component: Register2Component
    }
];

@NgModule({
    declarations: [
        Register2Component
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,

        // Material Module
        MaterialModule,

        FuseSharedModule
    ],
    providers: [
        ProjectDashboardService
    ]
})
export class Register2Module
{
}
