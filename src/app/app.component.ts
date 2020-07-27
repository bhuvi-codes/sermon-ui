import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { environment } from './../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sermon-ui';
  username: string;
  password: string;
  user: string;
  errormsg: string;
  msg: string;
  servicelist: any[] = [];
  servicedetail: any = "";
  name: string;
  endpoint: string;
  upCodes: string;
  metadata: string;
  adderrormsg: string;
  addmsg: string;
  deleteerrormsg: string;
  search: string;
  p: number = 1;
  gmetric: string = "totalTime";

  constructor(private httpobj: HttpClient) { }
  ngOnInit(): void {
    this.user = sessionStorage.getItem("sermon-user");
    if (this.user) {
      this.retrieve();
    }
  }

  // Login checks for static creds and sets the session storage
  login() {
    if (this.username == "admin" && this.password == "password") {
      sessionStorage.setItem("sermon-user", this.username);
      this.errormsg = "";
      this.msg = "Logged in Successfully";
      window.location.reload();
    }
    else {
      this.errormsg = "Invalid Username or Password, default creds: admin/password";
    }
  }

  // Logout unsets the session storage
  logout() {
    sessionStorage.removeItem("sermon-user");
    window.location.reload();
  }

  // Create adds a new service
  create() {
    var url = environment.apiUrl + "/services";
    var data = {
      "name": this.name,
      "endpoint": this.endpoint,
      "upCodes": this.upCodes,
      "metadata": this.metadata
    }
    this.httpobj.post(url, data).subscribe(
      response => {
        this.addmsg = "Service Added Successfully";
        this.retrieve();
      },
      error => {
        this.adderrormsg = error.error || error.statusText;
      },
    );
  }

  // Retreive fetches service list and overview details
  retrieve() {
    var url = environment.apiUrl + "/services";
    this.httpobj.get(url).subscribe(response => {
      this.addmsg = "";
      this.servicelist = response as string[];
    });
    url = environment.apiUrl + "/overview";
    this.httpobj.get(url).subscribe(response => {
      var overview: any = response as string[];
      this.pieChart1Data = [overview.status.up, overview.status.down];
      this.pieChart2Data = [overview.latency.low, overview.latency.high];
      this.pieChart3Data = [overview.consistency.consistent, overview.consistency.inconsistent];
    });
  }

  // Delete deletes the selected service
  delete(id: number) {
    var url = environment.apiUrl + "/services/" + id;
    this.httpobj.delete(url).subscribe(
      response => {
        this.retrieve();
      },
      error => {
        this.deleteerrormsg = error.error || error.statusText;
      },
    );
  }

  // Serivceinfo fetches the selected service details and initialises detail graph
  serviceinfo(id: number) {
    var url = environment.apiUrl + "/services/" + id;
    this.httpobj.get(url).subscribe(response => {
      this.servicedetail = response as string[];
      this.loadgraphdata();
    });
  }

  // Loadgraphdata loads the selected graph metric's data in line chart
  loadgraphdata() {
    var data = this.servicedetail.timeSeriesMetrics.map(item => item[this.gmetric].toFixed(2));
    this.lineChartData = [
      { data: data, label: this.gmetric }
    ]
    this.lineChartLabels = this.servicedetail.timeSeriesMetrics.map(item => {
      // truncating the time string
      return item.timeStamp.split(" ")[1].split(".")[0]
    });
  }

  lineChartData: ChartDataSets[] = [];
  lineChartLabels: Label[] = [];
  lineChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
        }
      ]
    },
  };
  lineChartColors: Color[] = [
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  lineChartLegend = false;
  lineChartType = 'line';
  lineChartPlugins = [];

  pieChart1Labels: Label[] = ["UP", "DOWN"];
  pieChart1Data: number[] = [];

  pieChart2Labels: Label[] = ["LOW", "HIGH"];
  pieChart2Data: number[] = [];

  pieChart3Labels: Label[] = ["CONSISTENT", "INCONSISTENT"];
  pieChart3Data: number[] = [];

  pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'bottom',
    },
    plugins: {
      datalabels: {
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold',
        },
        formatter: (value, ctx) => {
          if (value != 0) {
            return value;
          }
          return "";
        },
      },
    }
  };
  pieChartType: ChartType = 'pie';
  pieChartLegend = true;
  pieChartPlugins = [pluginDataLabels];
  pieChartColors = [
    {
      backgroundColor: ['#5cb85c', '#dc3545'],
    },
  ];
}

