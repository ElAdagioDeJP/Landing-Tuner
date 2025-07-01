import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import * as L from 'leaflet';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-user-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgxMaskDirective],
  providers: [provideNgxMask()],
  templateUrl: './user-wizard.html',
  styleUrls: ['./user-wizard.css']
})
export class UserWizardComponent implements OnInit, AfterViewInit, OnDestroy {
  currentStep = 1;
  totalSteps = 7;
  user: any = {
    address: {},
    company: {},
    bank: {},
    crypto: {},
    image_url: '' // Initialize image_url
  };
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private mapInitialized = false; // Flag to check if map is initialized

  // Observable to notify when the view is ready for the map
  private mapReady$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Fix for Leaflet's default icon path issue
    // This prevents 404 errors for marker images by pointing to a CDN
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }

  ngAfterViewInit(): void {
    // The map will be initialized when the user navigates to step 3
    this.safeInitMap();
  }

  ngOnDestroy(): void {
    this.destroyMap();
    this.mapReady$.complete();
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      if (this.currentStep === 3) {
        // Notify that the map step is active
        this.mapReady$.next();
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
      if (this.currentStep === 3) {
        // Notify that the map step is active
        this.mapReady$.next();
      }
    }
  }

  safeInitMap(): void {
    // Subscribe to the notification, ensuring the map initializes only once
    this.mapReady$.pipe(take(1)).subscribe(() => {
      setTimeout(() => this.initMap(), 0);
    });

    // If map is already initialized, just invalidate its size
    if (this.mapInitialized && this.map) {
        setTimeout(() => this.map?.invalidateSize(), 0);
    }
  }

  initMap(): void {
    const mapContainer = document.getElementById('map');
    if (mapContainer && !this.mapInitialized) {
      this.map = L.map(mapContainer).setView([20.5937, -100.3995], 5); // General view of Mexico

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (this.marker) {
          this.marker.setLatLng(e.latlng);
        } else {
          this.marker = L.marker(e.latlng).addTo(this.map!);
        }

        this.getAddressFromCoordinates(lat, lng);
      });

      this.mapInitialized = true; // Set the flag
    }
  }

  destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }

  getAddressFromCoordinates(lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    this.http.get(url).subscribe((data: any) => {
      if (data && data.address) {
        this.user.address = {
          address: data.address.road || '',
          city: data.address.city || data.address.town || '',
          state: data.address.state || '',
          postal_code: data.address.postcode || '',
          country: data.address.country || ''
        };
        this.cdr.detectChanges(); // Forzar la actualización de la vista
      }
    });
  }

  onSubmit(): void {
    // Limpiar el objeto de usuario antes de enviarlo
    const payload = this.cleanUserObject(this.user);

    this.http.post('http://localhost:5000/api/users', payload)
      .subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: '¡Usuario Creado!',
            text: 'El usuario ha sido registrado exitosamente.',
            timer: 2000,
            showConfirmButton: false
          });
          // Redirigir a la tabla de usuarios después del éxito
          this.router.navigate(['/user-datatable']);
        },
        error: (error) => {
          console.error('Error al crear el usuario:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error en el Registro',
            text: 'No se pudo crear el usuario. Por favor, verifica los datos e intenta de nuevo.'
          });
        }
      });
  }

  private cleanUserObject(user: any): any {
    const cleanedUser = JSON.parse(JSON.stringify(user)); // Clonación profunda

    // Eliminar propiedades anidadas vacías si no tienen datos
    if (Object.keys(cleanedUser.address).length === 0) {
      delete cleanedUser.address;
    }
    if (Object.keys(cleanedUser.company).length === 0) {
      delete cleanedUser.company;
    }
    if (Object.keys(cleanedUser.bank).length === 0) {
      delete cleanedUser.bank;
    }
    if (Object.keys(cleanedUser.crypto).length === 0) {
      delete cleanedUser.crypto;
    }

    return cleanedUser;
  }
}
