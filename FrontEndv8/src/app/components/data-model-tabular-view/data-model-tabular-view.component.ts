import { ConceptReferenceNode } from '../../models/objectmodel/ConceptReferenceNode';
import { NgEventBus } from 'ng-event-bus';
import { Component, Input } from '@angular/core';
import { ConceptService } from '../../services/concept.service';
import { DataModelDefinition, FlatProperty } from '../../models/old/DataModelDefinition';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Concept } from '../../models/objectmodel/Concept';
import {LoggerService} from '../../services/logger.service';

const debug = (message: string) => { console.log(message); };

@Component({
  selector: 'data-model-tabular-view',
  templateUrl: './data-model-tabular-view.component.html',
  styleUrls: ['./data-model-tabular-view.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

class DataModelTablularViewComponent {
  private iri: string;

  dataModelDefinition: DataModelDefinition;

  propertiesTable: DataTable<FlatProperty>;
  propertiesTableData: any[] = [];

  parentsChipListTemplateContext: ChipListTemplateContext;
  childrenChipListTemplateContext: ChipListTemplateContext;

  @Input() concept: Concept;
  @Input() parents: Array<ConceptReferenceNode>;
  @Input() children: Array<ConceptReferenceNode>;

  @Input()
  set conceptIri(iri: string) {
    this.iri = iri;
    this.refresh();
  }

  constructor(private service: ConceptService, private log: LoggerService, private router: Router, private eventBus: NgEventBus) {
    this.propertiesTable = new DataTable<FlatProperty>(['name', 'type', 'cardinality', 'description', 'declaredOn']);

    this.parentsChipListTemplateContext = {
      title: 'Parents',
      chips: []
    };

    this.childrenChipListTemplateContext = {
      title: 'Children',
      chips: []
    };
  }

  refresh() {
    this.propertiesTableData = [];
    if (this.concept.SubClassOf[0].Intersection != null) {
      this.concept.SubClassOf[0].Intersection.forEach(intersection => {
        if (intersection.ObjectPropertyValue != null && intersection.ObjectPropertyValue.Property.iri !== ':hasCoreProperties') {
          this.propertiesTableData.push(intersection);
        }
        if (intersection.ObjectPropertyValue != null && intersection.ObjectPropertyValue.Expression != null && intersection.ObjectPropertyValue.Expression.Intersection != null && intersection.ObjectPropertyValue.Property.iri === ':hasCoreProperties') {
          intersection.ObjectPropertyValue.Expression.Intersection.forEach(subIntersection => {
            this.propertiesTableData.push(subIntersection);
          });
        }
      });
    }

    this.parentsChipListTemplateContext = {
      title: 'Parents',
      chips: this.parents
    };

    this.childrenChipListTemplateContext = {
      title: 'Children',
      chips: this.children
    };
  }

  onSelect(iri: string) {
    this.eventBus.cast('app:conceptSelect', iri);
  }

  onHoverOver(iri: string) {
    this.eventBus.cast('app:conceptHover', iri);
  }

  onHoverOut() {
    this.eventBus.cast('app:conceptHover', null);
  }
}

class DataTable<D> {

  public columns: string[]
  public rows: MatTableDataSource<D> = new MatTableDataSource<D>();

  constructor(columns: string[]) {
    this.columns = columns;
  }

  setRows(rows: D[]) {
    this.rows.data = rows;
  }

  clear() {
    this.rows.data = [];
  }

  hasRows(): boolean {
    return this.rows && this.rows.data.length > 0;
  }

  getRowCount(): number {
    return (this.hasRows) ? this.rows.data.length : 0;
  }

  getTooltip(concept: Concept): string {
    return `IRI - ${concept.iri} Description - ${concept.description ? concept.description : 'no data found'}`;
  }
}

interface ChipListTemplateContext {
  title: string;
  chips: ConceptReferenceNode[];
}

export {
  DataModelTablularViewComponent,
  DataTable,
  ChipListTemplateContext
};
