import { ConceptService } from '../../../services/concept.service';
import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {LoggerService} from '../../../services/logger.service';

@Component({
  selector: 'app-member-dialog',
  templateUrl: './member-dialog.component.html',
  styleUrls: ['./member-dialog.component.scss']
})
export class MemberDialogComponent implements OnInit {

  static open(dialog: MatDialog, iri: string, scheme: string) {
    let dialogRef = dialog.open(MemberDialogComponent, {disableClose: true, autoFocus: true});
    dialogRef.componentInstance.iri = iri;
    dialogRef.componentInstance.scheme = scheme;

    return dialogRef.afterClosed();
  }

  iri: string;
  scheme: string;
  children: any[];

  constructor(
    private service: ConceptService,
    public dialogRef: MatDialogRef<MemberDialogComponent>,
    private router: Router,
    private log: LoggerService
  ) { }

  ngOnInit() {

  }

  close() {
    this.dialogRef.close();
  }
}
