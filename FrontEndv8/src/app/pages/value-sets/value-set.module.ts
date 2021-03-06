import { ComponentsModule } from './../../components/components.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {FlexModule} from '@angular/flex-layout';
import {AngularSplitModule} from 'angular-split';
import {MatTreeModule} from '@angular/material/tree';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ValueSetLibraryComponent} from './value-set-library/value-set-library.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { MemberDialogComponent } from './member-dialog/member-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {RouterModule} from '@angular/router';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatPaginatorModule} from '@angular/material/paginator';
import {ValueSetRoutingModule} from './value-set-routing.module';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@NgModule({
    imports: [
        CommonModule,
        MatCardModule,
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
        FlexModule,
        AngularSplitModule,
        MatTreeModule,
        MatProgressBarModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatSnackBarModule,
        MatTooltipModule,
        ComponentsModule,
        MatExpansionModule,
        MatDialogModule,
        RouterModule,
        MatTabsModule,
        MatListModule,
        MatSidenavModule,
        MatGridListModule,
        MatPaginatorModule,
        ValueSetRoutingModule,
        MatMenuModule,
        MatProgressSpinnerModule
    ],
  declarations: [
    ValueSetLibraryComponent,
    MemberDialogComponent
  ],
  entryComponents: [
    MemberDialogComponent
  ]
})
export class ValueSetModule { }
