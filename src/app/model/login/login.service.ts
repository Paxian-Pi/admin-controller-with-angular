import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginModel } from 'app/model/login/login-model';
import { Observable } from 'rxjs';
import { Login2Component } from 'app/main/pages/authentication/login-2/login-2.component';
import { ConfirmLogin } from '../confirmation/confirm-login';
import { TokenService } from 'app/token/token.service';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { Team } from '../team/team';
import { id } from '@swimlane/ngx-charts';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  _httpOptions: any;
  _id: string;

  token: any;

  loginUrl = environment.baseUrl + 'login';
  appUrl = environment.baseUrl + 'api';

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService, 
              private httpClient: HttpClient, 
              private tokenService: TokenService) 
  { }

  public login(login: LoginModel): Observable<LoginModel> {
    console.log(login);
    return this.httpClient.post<LoginModel>(this.loginUrl, login);
  }

  public reCreateTeam(team: Team): Observable<any> {
    const httpOptions = { headers: new HttpHeaders().set('Authorization', localStorage.getItem('token')) };

    return this.httpClient.post<ConfirmLogin>(this.appUrl + 'team/create', team, httpOptions);
  }

  public removeUser(): Observable<any> {
    const httpOptions = { headers: new HttpHeaders().set('Authorization', localStorage.getItem('token')) };
    const _id = localStorage.getItem('id');

    return this.httpClient.delete(this.appUrl + `team/delete/${_id}`, httpOptions);
  }
}
