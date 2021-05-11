import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  title: string;
  message: any;
  negativeButton: string;
  positiveButton: string;

  constructor(@Inject(MAT_DIALOG_DATA) 
    public data: { 
      title: string, 
      message: string, 
      negativeButton: string, 
      positiveButton: string 
  }) { }

  ngOnInit(): void {
    this.title = this.data.title;
    this.message = this.data.message;
    this.negativeButton = this.data.negativeButton;
    this.positiveButton = this.data.positiveButton;
  }

}
