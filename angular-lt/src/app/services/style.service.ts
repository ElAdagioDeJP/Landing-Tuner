import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Style {
  id: number;
  name: string;
  isActive: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  extraColor1: string;
  extraColor2: string;
  fontFamily: string;
  fontSizeBase: number;
}

@Injectable({
  providedIn: 'root'
})
export class StyleService {
  private apiUrl = 'http://localhost:5000/api/styles'; // Ajusta la URL si es necesario

  constructor(private http: HttpClient) { }

  getStyles(): Observable<Style[]> {
    return this.http.get<Style[]>(this.apiUrl);
  }

  createStyle(style: Omit<Style, 'id'>): Observable<Style> {
    return this.http.post<Style>(this.apiUrl, style);
  }

  updateStyle(id: number, style: Partial<Style>): Observable<Style> {
    return this.http.put<Style>(`${this.apiUrl}/${id}`, style);
  }

  deleteStyle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  activateStyle(id: number): Observable<any> {
    // El backend no tiene un endpoint específico para activar, se hace con PUT
    return this.updateStyle(id, { isActive: true });
  }
}
