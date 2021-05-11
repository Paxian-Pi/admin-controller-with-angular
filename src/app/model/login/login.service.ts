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

const loginUrl = environment.baseUrl + 'login';
const appUrl = environment.baseUrl + 'api/';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService, 
              private httpClient: HttpClient,
              private tokenService: TokenService) 
  { }

  // Login
  public login(login: LoginModel): Observable<LoginModel> {
    console.log(login);
    return this.httpClient.post<LoginModel>(loginUrl, login);
  }

  // Push this token to db for reference
  public postToken(token: Token): Observable<any> {
    return this.httpClient.post<Token>(appUrl + 'token', token);
  }

  // Get token from db
  public getToken(): Observable<any> {
    return this.httpClient.get<any>(appUrl + 'token');
  }

  // Re-create this user
  public reCreateTeam(team: Team): Observable<any> {
    return this.httpClient.post<ConfirmLogin>(appUrl + 'team/create', team);
  }

  // Remove user
  public removeUser(): Observable<any> {
    const _id = localStorage.getItem('id');

    return this.httpClient.delete(appUrl + `team/delete/${_id}`);
  }
}
