// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Component, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';

import { DataItem, LegendPosition } from '@swimlane/ngx-charts';
import { MatTableDataSource } from '@angular/material/table';
import html2canvas from 'html2canvas';
import { SnapshotService } from '../snapshot.service';


@Component({
  selector: 'app-data-widget',
  templateUrl: './data-widget.component.html',
  styleUrls: ['./data-widget.component.scss'],
})
export class DataWidgetComponent implements AfterViewInit, OnDestroy {
 @ViewChild("widget") widget: any;
 widgetCanvas: HTMLCanvasElement | undefined;
 isLoaded: boolean = false;
  
  pieData: DataItem[] = [
    {
      "name": "Microsoft",
      "value": 40632,
      "extra": {
        "code": "msft"
      }
    },
    {
      "name": "Cash",
      "value": 50000,
      "extra": {
        "code": "cash"
      }
    },
    {
      "name": "AMD",
      "value": 36745,
      "extra": {
        "code": "amd"
      }
    },
    {
      "name": "S&P 500",
      "value": 36240,
      "extra": {
        "code": "sp500"
      }
    },
    {
      "name": "Johnson & Johnson",
      "value": 33000,
      "extra": {
        "code": "jnj"
      }
    },
    {
      "name": "NVIDIA",
      "value": 35800,
      "extra": {
        "code": "nvda"
      }
    }
  ]

  
  gridData = [
    {form: '1099 Consolidated', status: "Ready - Issued 01/10/2023"},
    {form: 'Trade Confirmation', status: "Processed"},
    {form: 'July 2023 - Statement', status: "Ready - Issued 01/10/2023"},
    {form: 'FY\'23 Summary', status: "Ready - Issued 08/01/2023"},
    {form: 'HSA Transaction', status: "New"},
  ]
  gridDataSource = new MatTableDataSource(this.gridData);
  displayedColumns = ['form', 'status'];

  constructor(
    private snapshotService: SnapshotService
  ) {}

  onChatClick(){
    if(this.widgetCanvas){
      this.snapshotService.shareWidget.next(this.widgetCanvas)
      return;
    }
    html2canvas(this.widget.nativeElement, {
      height: 332,
      width: 800
    }).then(canvas => {
        this.snapshotService.shareWidget.next(canvas)
    });
  }
  ngAfterViewInit() {
    // If you have animations or async data, you can provide a promise to html2canvas
    // setTimeout(() => {
    //   html2canvas(this.widget.nativeElement, {
    //     height: 332,
    //     width: 800,
    //     onclone: (doc) => {  
    //       return new Promise((resolve, reject) => {
    //           setTimeout(() => {
    //               resolve(null)
    //           }, 400)
    //       })
    //     }
    //   }).then(canvas => {
    //       // this.snapshotService.shareWidget.next(canvas)
    //       this.widgetCanvas = canvas;
    //       this.isLoaded = true;
    //   });
    // }, 6000)
    html2canvas(this.widget.nativeElement, {
      height: 332,
      width: 800,
      onclone: (doc, element) => {  
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(void 0)
            }, 1000)
        })
      }
    }).then(canvas => {
        this.widgetCanvas = canvas;
        this.isLoaded = true;
    });
  }


  ngOnDestroy(): void {
  }

  // Pie chart options
  gradient: boolean = true;
  showLegend: boolean = false;
  showLabels: boolean = true;
  legendPosition: LegendPosition = LegendPosition.Right;
  colorScheme = "forest"
  view: [number, number] = [300, 300];
  showAnimations: boolean = false;
   

}
