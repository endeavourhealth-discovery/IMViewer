import { AppModule } from './../app.module';
import { DefintionTableComponent } from './../components/defintion-table/defintion-table.component';
import { PropertiesTableComponent } from './../components/properties-table/properties-table.component';
import { ValuesetTableComponent } from './../components/valueset-table/valueset-table.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {FlexModule} from '@angular/flex-layout';
import {AngularSplitModule} from 'angular-split';
import {MatTreeModule} from '@angular/material/tree';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {ControlsModule} from 'dds-angular8/controls';
import {LoggerModule} from 'dds-angular8/logger';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ComponentsModule} from '../components/components.module';
import {DataModelLibraryComponent} from './data-model-library/data-model-library.component';
import {IMControlsModule} from 'im-common';
import {ConceptTreeViewService, DataModelNavigatorService} from 'im-common/im-controls';
import {ConceptService} from '../services/concept.service';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import { DataModelDialogComponent } from './data-model-create/data-model-dialog/data-model-dialog.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
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
    MatInputModule,
    ControlsModule,
    LoggerModule,
    MatTooltipModule,
    ComponentsModule,
    IMControlsModule,
    MatTabsModule,
    MatListModule,
    MatSidenavModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: ConceptTreeViewService, useClass: ConceptService },
    { provide: DataModelNavigatorService, useClass: ConceptService }
  ],
  declarations: [
    DataModelLibraryComponent,
    DataModelDialogComponent,
  ],
  entryComponents: [
    DataModelDialogComponent
  ]
})
export class DataModelModule { }
