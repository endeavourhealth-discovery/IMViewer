import { Component, Input, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { Concept } from '../../models/objectmodel/Concept';
import { Perspectives } from '../../services/perspective.service';
import { ConceptService } from '../../services/concept.service';
import { Observable, Subject, ReplaySubject } from 'rxjs';
import { Perspective } from '../../models/Perspective';
import { LoggerService} from '../../services/logger.service';
import { valueSetServiceProvider } from '../../services/valueset.service.provider';
import { ValueSetService, ValueSet } from '../../services/valueset.service';
import { healthRecordServiceProvider } from '../../services/healthrecord.service.provider';
import { HealthRecordProperty, HealthRecordService } from '../../services/healthrecord.service';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ConceptSummaryProvider {
    concept: Concept
    templateName: string
    rootType: string

    canSummarise(concept: Concept): Observable<boolean>
}

export class BasicSummaryProvider implements ConceptSummaryProvider {

    concept: Concept;

    static TEMPLATE_NAME:string = "defaultSummaryTemplate";

    constructor(public rootType: string, private snackBar: MatSnackBar) {}

    canSummarise(concept: Concept): Observable<boolean> {
        let canSummarise = new ReplaySubject<boolean>();
        canSummarise.next(true);

        return canSummarise;
    }

    get templateName(): string {
        return BasicSummaryProvider.TEMPLATE_NAME;
    }

    copyIri() {
        this.copyToClipboard(this.concept.iri);

        const twoSeconds: number = 2000;
        this.snackBar.open(`IRI - ${this.concept.iri}`, "Copied", {
            duration: twoSeconds,
        });
    }

    copyToClipboard(targetText: string) {
        // pre-Angular 10 (Clipboard module) way of copying to clipboard
        let selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = targetText;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
      }
}

export class SemanticOntologySummaryProvider implements ConceptSummaryProvider {
    concept: Concept;

    static TEMPLATE_NAME:string = "semanticOntologySummaryTemplate";

    constructor(public rootType: string, private conceptService: ConceptService) {}

    canSummarise(concept: Concept): Observable<boolean> {
        return this.conceptService.isA(concept.iri, this.rootType);
    }

    get templateName(): string {
        return SemanticOntologySummaryProvider.TEMPLATE_NAME;
    }

}

export class ValueSetSummaryProvider implements ConceptSummaryProvider {

    valueSet: ValueSet;
    pageStartIndex: number;
    pageEndIndex: number;
    pageSize: number
    pageSizeOptions: number[];

    private _concept: Concept;

    static TEMPLATE_NAME:string = "valueSetSummaryTemplate";

    constructor(private valueSetService: ValueSetService) {
        // pagination
        this.pageSize = 20;
        this.pageSizeOptions = [5, 10, 20];
        this.pageStartIndex = 0;
        this.pageEndIndex = this.pageSize;
    }

    canSummarise(concept: Concept): Observable<boolean> {
        return this.valueSetService.isValueSet(concept);
    }

    get rootType(): string {
        return this.valueSetService.valueSetIri;
    }

    get templateName(): string {
        return ValueSetSummaryProvider.TEMPLATE_NAME;
    }

    set concept(concept: Concept) {
        this._concept = concept;
        this.valueSet = this.valueSetService.toValueSet(concept);
    }

    onPageChange(event: PageEvent): PageEvent {
        this.pageStartIndex = event.pageIndex * event.pageSize;
        this.pageEndIndex = this.pageStartIndex + event.pageSize

        return event;
    }
}

export class HealthRecordSummaryProvider implements ConceptSummaryProvider {

    healthRecordProperties: HealthRecordProperty[];
    columns: string[];

    private _concept: Concept;

    static TEMPLATE_NAME:string = "healthRecordSummaryTemplate";

    constructor(private healthRecordService: HealthRecordService) {
        this.columns = ['name', 'type', 'cardinality'];
    }

    canSummarise(concept: Concept): Observable<boolean> {
        return this.healthRecordService.isHealthRecord(concept);
    }

    get rootType(): string {
        return this.healthRecordService.healthRecordIri;
    }

    get templateName(): string {
        return HealthRecordSummaryProvider.TEMPLATE_NAME;
    }

    set concept(concept: Concept) {
        this._concept = concept;
        this.healthRecordProperties = this.healthRecordService.getHealthRecordProperties(concept);
    }
}

@Component({
    selector: 'summary-drawer',
    templateUrl: './summary-drawer.component.html',
    styleUrls: ['./summary-drawer.component.scss'],
    providers: [ valueSetServiceProvider, healthRecordServiceProvider ],
    host: {
        '(document:click)': 'onClick($event)',
      },
})
export class SummaryDrawerComponent {

    static DEFAULT_PERSPECTIVE: Perspective = {
        "caption": "Concept",
        "subtitle": null,
        "description": "Top level information concept for classes",
        "primary": null,
        "image": null,
        "icon": "fa-layer-group",
        "color": "blue",
        "root": ":894281000252100", // itself
    }

    summaryProvider: ConceptSummaryProvider;
    perspective: Perspective;

    private _concept: Concept;
    private perspectivesMap: Map<string, Perspective>;
    private summaryProviders: Map<string, ConceptSummaryProvider>;
    private defaultSummaryProvider: ConceptSummaryProvider;
    private _isDrawerOpen: boolean;

    constructor(private service: ConceptService,
                private perspectives: Perspectives,
                private log: LoggerService,
                private valueSetService: ValueSetService,
                private healthRecordService: HealthRecordService,
                private router: Router,
                private snackBar: MatSnackBar,
                private _eref: ElementRef) {

        // summary provider initialisation
        this.summaryProviders = new Map();

        const valueSetSummaryProvider: ValueSetSummaryProvider = new ValueSetSummaryProvider(this.valueSetService);
        this.summaryProviders.set(valueSetSummaryProvider.rootType, valueSetSummaryProvider);

        const healthRecordSummaryProvider: HealthRecordSummaryProvider = new HealthRecordSummaryProvider(this.healthRecordService);
        this.summaryProviders.set(healthRecordSummaryProvider.rootType, healthRecordSummaryProvider);

        const semanticOntologySummaryProvider: SemanticOntologySummaryProvider = new SemanticOntologySummaryProvider(this.perspectives.ontology.root, this.service);
        this.summaryProviders.set(semanticOntologySummaryProvider.rootType, semanticOntologySummaryProvider);

        const basicSummaryProvider: BasicSummaryProvider = new BasicSummaryProvider(SummaryDrawerComponent.DEFAULT_PERSPECTIVE.root, snackBar); // TODO - is this the right IRI to use for concept?
        this.summaryProviders.set(basicSummaryProvider.rootType, basicSummaryProvider);

        this.summaryProvider = basicSummaryProvider;
        this.defaultSummaryProvider = basicSummaryProvider;

        // drawer visibility/state
        this._isDrawerOpen = false;
    }

    @ViewChild(BasicSummaryProvider.TEMPLATE_NAME, { static: true })
    defaultSummaryTemplate:TemplateRef<any>;

    @ViewChild(ValueSetSummaryProvider.TEMPLATE_NAME, { static: true })
    valueSetSummaryTemplate:TemplateRef<any>;

    @ViewChild(HealthRecordSummaryProvider.TEMPLATE_NAME, { static: true })
    healthRecordSummaryTemplate:TemplateRef<any>;

    @ViewChild(SemanticOntologySummaryProvider.TEMPLATE_NAME, { static: true })
    semanticOntologySummaryTemplate:TemplateRef<any>;

    @Input()
    set concept(concept: Concept) {
        this._concept = concept;

        if (concept && concept.iri) {

          this.perspectives.getPerspective(this.concept.iri).subscribe(
            perspective => {
              this.onPerspective(perspective);
            },
            error => {
              this.log.debug(`Warning - unable to get perspective for concept ${this.concept.iri}. Falling back on default perspective`);
              this.onPerspective(SummaryDrawerComponent.DEFAULT_PERSPECTIVE);
            }
          );
        }
    }

    get concept() {
        return this._concept;
    }

    onClick(event) {
        if(this.clickedOutside(event.target)) {
            this.close();
        }
    }

    getSummaryProvider(perspectiveRootIri: string): Observable<ConceptSummaryProvider> {
        let summaryProviderObservable: ReplaySubject<ConceptSummaryProvider> = new ReplaySubject();
        let summaryProvider: ConceptSummaryProvider = this.defaultSummaryProvider;

        const potentialSummaryProvider = this.summaryProviders.get(perspectiveRootIri);
        if(potentialSummaryProvider != null) {
            potentialSummaryProvider.canSummarise(this.concept).subscribe(
                canSummarise => {
                    if(canSummarise) {
                        summaryProvider = potentialSummaryProvider;
                    }
                    else {
                        this.log.debug(`warning - concept summary provider for sub types of ${perspectiveRootIri} cannot summarise the concept ${this.concept.iri}.`);
                    }
                    summaryProvider.concept = this.concept;
                    summaryProviderObservable.next(summaryProvider);
                }
            );
        }
        else {
            this.log.debug("warning - no concept summary provider registered against IRI " + perspectiveRootIri + ". Returning default provider.");

            summaryProvider.concept = this.concept;
            summaryProviderObservable.error(summaryProvider);
        }

        return summaryProviderObservable;
    }

    gotoConcept(): void {
        let conceptPath: string = this.perspective.primary.state;
        if(conceptPath != null) {
            this.router.navigate([conceptPath, this.concept.iri]);
            this.close();
        }
        else {
            this.log.error(`Unable to navigate to concept ${this.concept.iri} as there is no perspective associated with it`);
        }
    }

    close(): void {
        this._isDrawerOpen = false;
    }

    open(): void {
        this._isDrawerOpen = true;;
    }

    get isDrawerOpen(): boolean {
        return this._isDrawerOpen;
    }

    get hasRoute(): boolean {
        let hasRoute: boolean = false;

        if(this.perspective != null && this.perspective.primary != null) {
            hasRoute = this.perspective.primary.state != null;
        }

        return hasRoute;
    }

    private clickedOutside(target: any) {
        return this._eref.nativeElement.contains(target) == false;
    }

    private onPerspective(perspective: Perspective): void {
        this.perspective = perspective;

        this.getSummaryProvider(this.perspective.root).subscribe(
            summaryProvider => this.summaryProvider = summaryProvider
        );
    }
}
