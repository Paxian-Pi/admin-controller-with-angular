import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginModel } from 'app/model/login/login-model';
import { Observable } from 'rxjs';
import { ConfirmLogin } from '../confirmation/confirm-login';
import { TokenService } from 'app/token/token.service';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { Team } from '../team/team';
import { id } from '@swimlane/ngx-charts';
import { environment } from 'environments/environment';
import { Token } from '../token/token';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  _httpOptions: any;
  token: any;
  tokenId: any;
  tokenData: any;

  loginUrl = environment.baseUrl + 'login';
  appUrl = environment.baseUrl + 'api/';

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService, 
              private httpClient: HttpClient,
              private tokenService: TokenService) 
  { 
    this.token = localStorage.getItem('token');
  }

  // Login
  public login(login: LoginModel): Observable<LoginModel> {
    console.log(login);
    return this.httpClient.post<LoginModel>(this.loginUrl, login);
  }

  // Push this token to db for reference
  public postToken(token: Token): Observable<any> {
    return this.httpClient.post<Token>(this.appUrl + 'token', token);
  }

  // Get token from db
  public getToken(): Observable<any> {
    return this.httpClient.get<any>(this.appUrl + 'token');
  }

  // Re-create this user
  public reCreateTeam(team: Team): Observable<any> {
    return this.httpClient.post<ConfirmLogin>(this.appUrl + 'team/create', team);
  }

  // Remove user
  public removeUser(): Observable<any> {
    const _id = localStorage.getItem('id');

    return this.httpClient.delete(this.appUrl + `team/delete/${_id}`);
  }
}
