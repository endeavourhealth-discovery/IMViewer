import { Component, OnInit } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { ConceptReference } from 'src/app/models/objectmodel/ConceptReference';
import { ConceptStatus } from 'src/app/models/objectmodel/ConceptStatus';
import { Perspective } from 'src/app/models/Perspective';
import { CodeSchemes, codeSchemesProvider } from 'src/app/models/search/CodeScheme';
import * as searchEvents from 'src/app/models/search/SearchEvents';
import { SearchRequest } from 'src/app/models/search/SearchRequest';
import { SearchResponse } from 'src/app/models/search/SearchResponse';
import { SortBy } from 'src/app/models/search/SortBy';
import { LoggerService } from 'src/app/services/logger.service';
import { Perspectives } from 'src/app/services/perspective.service';

class ConceptSearchOptions {

  codeSchemeSelections: ConceptReference[];
  conceptStatusSelections: string[];
  typeSelections: string[];
  sortBySelection: string;
  resultCount: number;

  searchRequest: Observable<SearchRequest>

  constructor(private _searchRequest: SearchRequest,
              public conceptStatusOptions: string[],
              public typeOptions: ConceptReference[],
              public codeSchemeOptions: ConceptReference[],
              public sortByOptions: string[]) {
    this.searchRequest = new Subject();

    this.conceptStatusSelections = _searchRequest.statuses.map(status => { return ConceptStatus[status] } );
    this.codeSchemeSelections = _searchRequest.codeSchemes;
    this.typeSelections = _searchRequest.types;
    this.sortBySelection = SortBy[_searchRequest.sortBy]
    this.resultCount = _searchRequest.size;
  }

  // sync string selection in UI to model
  onConceptStatusChange() {
    const selected: ConceptStatus[] = this.conceptStatusSelections.map(selectedName => { return ConceptStatus[selectedName] });
    this._searchRequest.statuses = selected;

    this.onChangeSearchRequest()
  }

  onTypeChange() {
    this._searchRequest.types = this.typeSelections;

    this.onChangeSearchRequest()
  }

  onCodeSchemesChange() {
    this._searchRequest.codeSchemes = this.codeSchemeSelections;

    this.onChangeSearchRequest()
  }

  onSortByChange() {
    const selected: SortBy = SortBy[this.sortBySelection];
    this._searchRequest.sortBy = selected;

    this.onChangeSearchRequest()
  }

  // TODO - temp method until pagination support is put in the backend
  onResultCountChange() {
    this._searchRequest.size = this.resultCount;

    this.onChangeSearchRequest()
  }

  compareCodeSchemes(source: ConceptReference, target: ConceptReference): boolean {
    return source.iri == target.iri;
  }

  get searchTerms() {
    return this._searchRequest.terms;
  }

  get appliedFilterCount() {
    return this.codeSchemeSelections.length + this.conceptStatusSelections.length;
  }

  // filter change
  private onChangeSearchRequest() {
    const searchRequestSubject = this.searchRequest as Subject<SearchRequest>;
    searchRequestSubject.next(this._searchRequest);
  }
}

interface ConceptSearchResultRow {
  iri: string;
  name: string;
  types: ConceptReference[];
  scheme: ConceptReference;
  weighting: number;
  highlighted?: boolean;
  selected?: boolean;
  subdued?: boolean;
  conceptTypeColor?: string;
  conceptTypeIcon?: string;
  conceptTypeName?: string;
}

class ConceptSearchResultTable {

  public selectedColumns: string[];
  public allColumns: string[];
  public selectedRow: Observable<ConceptSearchResultRow>;

  private _selectedRow: ConceptSearchResultRow;

  constructor(public rows: ConceptSearchResultRow[], private perspectiveService: Perspectives) {
    this.allColumns = ["type", "name", "codeScheme"];
    this.selectedColumns = ["type", "name", "codeScheme"];
    this.selectedRow = new Subject();

    // setup concept icon and color
    this.rows.forEach(row => {
      // default perspective
      let perspective: Perspective = this.perspectiveService.ontology;
      let conceptTypeName: string = perspective.caption;

      if(row.types != null && row.types.length > 0) {

        perspective = this.perspectiveService.getPerspectiveByRoot(row.types[0].iri);
        conceptTypeName = row.types[0].name;

        // default perspective
        if(perspective == null) {
          perspective = this.perspectiveService.ontology;
        }
      }

      row.conceptTypeName = conceptTypeName;
      row.conceptTypeColor = perspective.color;
      row.conceptTypeIcon = perspective.icon;

      if(row.scheme == null) {
        row.scheme = {
          iri: "",
          name: "Default code"
        }
      }

      row.subdued = (row.conceptTypeName == 'Semantic concept' && row.weighting == 0);
    });
  }

  get hasRows(): boolean {
    return this.rowCount > 0;
  }

  get rowCount(): number {
    return (this.rows != null) ? (this.rows.length) : (0);
  }

  onSelectSearchResultRow(row: ConceptSearchResultRow) {
    // remove old selection
    if(this._selectedRow != null) {
      this._selectedRow.highlighted = !this._selectedRow.highlighted
    }

    // set new selection
    this._selectedRow = row;
    this._selectedRow.highlighted = !this._selectedRow.highlighted;

    (this.selectedRow as Subject<ConceptSearchResultRow>).next(this._selectedRow);
  }
}

@Component({
  selector: 'app-concept-search-result',
  templateUrl: './concept-search-result.component.html',
  styleUrls: ['./concept-search-result.component.scss'],
  providers: [ codeSchemesProvider ]
})
export class ConceptSearchResultComponent implements OnInit  {

  public searchResultsTable: ConceptSearchResultTable;
  public searchOptions: ConceptSearchOptions;
  public hasResponse: boolean;
  public searchResultPending: boolean;

  constructor(private eventBus: NgEventBus,
              private codeSchemes: CodeSchemes,
              private perspectiveService: Perspectives,
              private log: LoggerService) {
    this.searchResultPending = false;  
  
    this.eventBus.on(searchEvents.SEARCH_RESULT_PENDING_EVENT).subscribe((_searchRequest: SearchRequest) => {
      this.searchResultPending = true;  
    });

    this.eventBus.on(searchEvents.SEARCH_REQUEST_FAILED_EVENT).subscribe((_searchRequest: SearchRequest) => {
      this.searchResultPending = false;  
      this.hasResponse = false;
    });

    this.eventBus.on(searchEvents.SEARCH_RESULT_EVENT).subscribe((searchResponse: SearchResponse) => {
      this.searchResultPending = false;
      
      this.searchResultsTable = new ConceptSearchResultTable(searchResponse.concepts, perspectiveService);
      this.searchResultsTable.selectedRow.subscribe(
        selected => {
          this.eventBus.cast("app:conceptSelect", selected.iri);
        },
        error => {
          this.log.error(`Warning - unable to read selected search result. Action - No selection event will be triggered. Cause - ${error}`);
        }
      )

      this.initSearchOptions(searchResponse.request).subscribe(
        (searchOptions: ConceptSearchOptions) => {
          this.searchOptions = searchOptions;
          this.searchOptions.searchRequest.subscribe(
            (searchRequest => {
              this.eventBus.cast(searchEvents.CONCEPT_SEARCH_FILTER_CHANGE_EVENT, searchRequest);
            })
          )
          this.hasResponse = true;
        },
        (error) => {
          this.log.error(`Error - unable to create search options. Search may not function as user expects. Cause - ${error}.`);
        }
      );
    });

    this.hasResponse = false;
  }

  ngOnInit(): void {
    // TODO - need a way to check if there's a previous inflight request
    // and if so cancel it and replace with this one
    // this.sortClausesControl.valueChanges.pipe(debounceTime(500)).subscribe(
    //         value => this.setEmailMessage(emailControl)
    // );
  }

  get hasResults() {
    return this.hasResponse && this.searchResultsTable.hasRows
  }

  private initSearchOptions(searchRequest: SearchRequest): Observable<ConceptSearchOptions> {
    const searchOptionsObservable: Subject<ConceptSearchOptions> = new ReplaySubject();

    this.codeSchemes.codeSchemes.subscribe(
      (result) => {
        const conceptStatusOptions: string[] = Object.keys(ConceptStatus).filter(f => isNaN(Number(f)));

        const typeOptions: ConceptReference[] = [
          { iri: ":SemanticConcept", name: "Semantic concept" },
          { iri: ":DiscoveryCommonDataModel", name: "Data model" },
          { iri: ":VSET_ValueSet", name: "Value set" },
          { iri: ":DSET_DataSet", name: "Data set" },
          { iri: ":MAP_Map", name: "Map" }
        ]
        const sortByOptions: string[] = Object.keys(SortBy).filter(f => isNaN(Number(f)));
        searchOptionsObservable.next(new ConceptSearchOptions(searchRequest, conceptStatusOptions, typeOptions, result, sortByOptions));
      },
      (error) => {
        this.log.error(`Error - unable to get a list of code schemes. Cause ${error}`);
      }
    );

    return searchOptionsObservable;
  }

}
