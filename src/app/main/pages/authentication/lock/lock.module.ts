import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FuseSharedModule } from '@fuse/shared.module';

import { LockComponent } from 'app/main/pages/authentication/lock/lock.component';
import { MaterialModule } from 'app/material/material.module';

const routes = [
    {
        path     : 'auth/lock',
        component: LockComponent
    }
];

@NgModule({
    declarations: [
        LockComponent
    ],
    entryComponents: [],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,

        // Material Module
        MaterialModule,

        FuseSharedModule
    ],
    providers: []
})
export class LockModule
{
}
