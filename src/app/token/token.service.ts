import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) { }

  public Token(token: string) {
    console.log(token);
    localStorage.setItem('token', token);
  }

  public accessToken() {
    return localStorage.getItem('token');
  }
}
