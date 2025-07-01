import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StyleService {

  private apiUrl = 'http://localhost:5000/api/styles/active'; // Asumiendo que el backend corre en el puerto 5000

  constructor(private http: HttpClient) { }

  loadAndApplyStyles() {
    this.http.get<any>(this.apiUrl).subscribe(style => {
      document.documentElement.style.setProperty('--primary-color', style.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', style.secondaryColor);
      document.documentElement.style.setProperty('--accent-color', style.accentColor);
      document.documentElement.style.setProperty('--text-color', style.textColor);
      document.documentElement.style.setProperty('--extra-color-1', style.extraColor1);
      document.documentElement.style.setProperty('--extra-color-2', style.extraColor2);
      document.documentElement.style.setProperty('--font-family', style.fontFamily);
      document.documentElement.style.setProperty('--font-size-base', style.fontSizeBase);
    });
  }
}
