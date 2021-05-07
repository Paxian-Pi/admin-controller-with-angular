import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Team } from 'app/model/team/team';
import { Login2Component } from 'app/main/pages/authentication/login-2/login-2.component';
import { TokenService } from 'app/token/token.service';
import { environment } from 'environments/environment';

@Injectable()
export class ProjectDashboardService implements Resolve<any>
{

    projects: any[];
    widgets: any[];

    widgetz: any[];
    username: string;
    pendingAuth: number;
    orders: number;
    processing: number;
    declined: number;
    delivered: number;
    remainingCount: number;
    date = new Date();

    header: any;

    httpOptions: any;
    token: any;


    appUrl = environment.baseUrl + 'api/';


    /**
     * Constructor
     *
     * @param {HttpClient} httpClient
     */
    constructor(private httpClient: HttpClient, private tokenService: TokenService ) { 
        this.date = new Date();

        this.token = localStorage.getItem('token');
        console.log(this.token);
    }

    public getTeamData(): Observable<any> {
        const httpOptions = { headers: new HttpHeaders().set('Authorization', localStorage.getItem('token')) };     
         
        return this.httpClient.get<any>(this.appUrl + 'team', httpOptions);
    }

    public createTeam(team: Team) {
        const httpOptions = { headers: new HttpHeaders().set('Authorization', localStorage.getItem('token')) };
        console.log(team);

        return this.httpClient.post<Team>(this.appUrl + 'team/create', team, httpOptions);
    }











    getName() {
        return this.username = localStorage.getItem('username');
    }

    getPendingRidersAuthenticationCount() {
        return this.pendingAuth = 3;
    }

    getStatus() {
        return this.widgetz = [
            {
                'widget1': {
                    'ranges': {
                        'open': 'Open',
                        'clossed': 'Clossed'
                    },
                    'currentStatus': 'clossed',
                    'detail': 'You can show some detailed information about this widget in here.'
                }
            }
        ];
    }

    getOrders() {
        return this.orders = 8;        // Get this value from Customer's Booking App
    }

    getProcessing() {
        if (this.getDelivered() - 1 <= 0) {
            return this.getDelivered();
        }
        else if ((this.getDelivered() + this.getDeclined()) === this.getOrders()) {
            return 0;
        }
        else {
            return this.getDelivered() - 1;
        }
    }

    getDeclined() {
        return this.declined = 1;
    }

    getDelivered() {
        return this.delivered = 7;     // Get this value from Delivery Rider's App
    }

    getRemainingCount() {
        if ((this.getDelivered() + this.getDeclined()) === this.getOrders()) {
            return 0;
        }
        else {
            return (this.getOrders() - (this.getDelivered() + this.getDeclined()) || this.getOrders() + 1);
        }
    }








    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return new Promise<void>((resolve, reject) => {

            Promise.all([
                this.getProjects(),
                this.getWidgets()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get projects
     *
     * @returns {Promise<any>}
     */
    getProjects(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.httpClient.get('api/project-dashboard-projects')
                .subscribe((response: any) => {
                    this.projects = response;
                    resolve(response);
                }, reject);
        });
    }

    /**
     * Get widgets
     *
     * @returns {Promise<any>}
     */
    getWidgets(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.httpClient.get('api/project-dashboard-widgets')
                .subscribe((response: any) => {
                    this.widgets = response;
                    resolve(response);
                }, reject);
        });
    }
}
