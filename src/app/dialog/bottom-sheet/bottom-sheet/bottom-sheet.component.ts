import { Component, Inject, OnInit } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss']
})
export class BottomSheetComponent implements OnInit {

  constructor(
    private bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>, 
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { names: string[] }) { }

  title: string;
  clearBar(): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  changeStatus() {
    this.bottomSheetRef.dismiss({
      message: 'Change Status',
      data: this.data
    });
  }

  ngOnInit() {
    console.log('data received', this.data);
  }

}
