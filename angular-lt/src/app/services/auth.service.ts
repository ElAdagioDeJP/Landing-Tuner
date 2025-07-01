import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:5000/api'; // Ajusta la URL de tu backend si es necesario
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) { }

  private hasToken(): boolean {
    return !!sessionStorage.getItem('token');
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response && response.token) {
          sessionStorage.setItem('token', response.token);
          this.loggedIn.next(true);
        }
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('token');
    this.loggedIn.next(false);
  }

  // Opcional: un método para obtener el rol si se guarda en el token
}
