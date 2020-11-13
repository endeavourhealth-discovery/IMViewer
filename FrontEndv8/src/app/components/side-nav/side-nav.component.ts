import { NgEventBus } from 'ng-event-bus';
import { Clazz } from '../../models/objectmodel/Clazz';
import { LoggerService } from 'dds-angular8';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { ConceptService } from '../../services/concept.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {
  @Input() concept: Clazz;
  @Input() root: string;
  @Input() relationships: string;
  @Input() selectedIri: string;

  @Output() openDialogEvent: EventEmitter<any> = new EventEmitter<any>();

  searchSize = 72;
  history = [];


  constructor(
    private router: Router,
    private eventBus: NgEventBus) {
    this.routeEvent(this.router);
  }

  ngOnInit() {
  }

  routeEvent(router: Router) {
    router.events.subscribe(e => {
      if (e instanceof NavigationEnd && this.concept !== undefined) {
        this.history.unshift(
          {
            url: e.url,
            concept: this.concept
          }
        );
      }
    });
  }

  itemHover(concept: Clazz) {
    this.eventBus.cast('app:conceptHover', concept);
  }

  goto(iri: string) {
    if (iri !== this.selectedIri) {
      this.eventBus.cast('app:conceptSelect', iri);
    }
  }

  hasResults(displayed: boolean) {
    this.searchSize = displayed ? 256 : 72;
  }

  openDialog() {
    this.openDialogEvent.emit();
  }

}
