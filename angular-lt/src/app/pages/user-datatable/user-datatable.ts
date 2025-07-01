import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

declare var $: any;
declare var Swal: any; // Declarar Swal para que TypeScript no se queje

@Component({
  selector: 'app-user-datatable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-datatable.html',
  styleUrls: ['./user-datatable.css']
})
export class UserDatatableComponent implements OnInit, OnDestroy {
  users: any[] = [];
  entriesToShow: number = 10; // Valor inicial para el selector
  private destroy$ = new Subject<void>();
  private dataTable: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<any[]>('http://localhost:5000/api/users')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.users = data;
        this.cdr.detectChanges(); // Forzar la detección de cambios
        if (this.dataTable) {
          this.dataTable.destroy();
        }
        this.initializeDataTable();
      });
  }

  initializeDataTable(): void {
    // Convertir logo a Base64 para el PDF
    const toDataURL = (url: string, callback: (dataUrl: string) => void) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        const reader = new FileReader();
        reader.onloadend = function () {
          callback(reader.result as string);
        }
        reader.readAsDataURL(xhr.response);
      };
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.send();
    }

    // Corregido: Ruta a la imagen en la carpeta `public`
    toDataURL('/LOGO.jpeg', (logoDataUrl) => {
      this.dataTable = $('#usersTable').DataTable({
        responsive: true,
        paging: true,
        searching: true,
        // Corregido: Objeto de traducción en español para evitar CORS
        language: {
          "sProcessing":     "Procesando...",
          "sLengthMenu":     "Mostrar _MENU_ registros",
          "sZeroRecords":    "No se encontraron resultados",
          "sEmptyTable":     "Ningún dato disponible en esta tabla",
          "sInfo":           "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
          "sInfoEmpty":      "Mostrando registros del 0 al 0 de un total de 0 registros",
          "sInfoFiltered":   "(filtrado de un total de _MAX_ registros)",
          "sInfoPostFix":    "",
          "sSearch":         "Buscar:",
          "sUrl":            "",
          "sInfoThousands":  ",",
          "sLoadingRecords": "Cargando...",
          "oPaginate": {
              "sFirst":    "Primero",
              "sLast":     "Último",
              "sNext":     "Siguiente",
              "sPrevious": "Anterior"
          },
          "oAria": {
              "sSortAscending":  ": Activar para ordenar la columna de manera ascendente",
              "sSortDescending": ": Activar para ordenar la columna de manera descendente"
          }
        },
        dom: 'Bfrtip', // Habilitar botones
        buttons: [
          {
            extend: 'excelHtml5',
            text: 'Exportar a Excel',
            className: 'excel-btn',
            exportOptions: {
              columns: ':not(:last-child)' // Excluir la última columna (Acciones)
            }
          },
          {
            extend: 'pdfHtml5',
            text: 'Exportar a PDF',
            className: 'pdf-btn',
            exportOptions: {
              columns: ':not(:last-child)' // Excluir la última columna (Acciones)
            },
            customize: function (doc: any) {
              // --- Personalización del PDF ---

              // 1. Logo en el encabezado
              doc.content.splice(0, 0, {
                margin: [0, 0, 0, 12],
                alignment: 'center',
                image: logoDataUrl,
                width: 150
              });

              // 2. Título del reporte
              doc.content[1] = {
                text: 'Reporte de Usuarios',
                alignment: 'center',
                style: 'header'
              };

              // 3. Fecha de exportación
              const now = new Date();
              const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
              doc.content.splice(2, 0, {
                text: `Generado el: ${formattedDate}`,
                alignment: 'right',
                style: 'subheader'
              });

              // 4. Estilos del documento
              doc.styles = {
                header: {
                  fontSize: 18,
                  bold: true,
                  margin: [0, 0, 0, 10]
                },
                subheader: {
                  fontSize: 10,
                  italic: true,
                  margin: [0, 10, 0, 10]
                },
                tableHeader: {
                  bold: true,
                  fontSize: 11,
                  color: 'white',
                  fillColor: '#007bff'
                },
                table: {
                  margin: [0, 5, 0, 15]
                }
              };

              // 5. Aplicar estilos a la tabla
              doc.content[3].style = 'table';
              doc.content[3].layout = {
                fillColor: function (rowIndex: number) {
                  return (rowIndex % 2 === 0) ? '#f2f2f2' : null;
                }
              };

              // --- Fin de la personalización ---
            }
          }
        ]
      });

      // Mover los botones al contenedor deseado
      this.dataTable.buttons().container().appendTo('#buttons-container');
    });
  }

  viewUser(user: any): void {
    console.log('Ver usuario:', user);

    // Helper para formatear la fecha
    const formatDate = (dateString: string) => {
      if (!dateString) return 'No disponible';
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    };

    // Construir el HTML del modal dinámicamente
    const modalHtml = `
      <div class="user-details-modal">
        <div class="user-details-header">
          <img src="${user.image || '/assets/default-avatar.png'}" alt="Avatar" class="user-avatar">
          <div>
            <h4 class="user-name">${user.firstName} ${user.lastName}</h4>
            <p class="user-email"><a href="mailto:${user.email}">${user.email}</a></p>
            <span class="status ${user.isActive ? 'status-active' : 'status-inactive'}">
              ${user.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <div class="user-details-body">
          <!-- Información Personal -->
          <div class="detail-section">
            <h5>Información Personal</h5>
            <div class="detail-grid">
              <p><strong>ID:</strong> ${user.id}</p>
              <p><strong>Usuario:</strong> ${user.username}</p>
              <p><strong>Rol:</strong> ${user.role}</p>
              <p><strong>Teléfono:</strong> ${user.phone || 'No disponible'}</p>
              <p><strong>Fecha de Nacimiento:</strong> ${formatDate(user.birthDate)}</p>
              <p><strong>Edad:</strong> ${user.age || 'No disponible'}</p>
              <p><strong>Género:</strong> ${user.gender || 'No disponible'}</p>
              <p><strong>Universidad:</strong> ${user.university || 'No disponible'}</p>
            </div>
          </div>

          <!-- Dirección -->
          <div class="detail-section">
            <h5>Dirección</h5>
            <div class="detail-grid">
              <p><strong>Dirección:</strong> ${user.address?.address || 'No disponible'}</p>
              <p><strong>Ciudad:</strong> ${user.address?.city || 'No disponible'}</p>
              <p><strong>Estado:</strong> ${user.address?.state || 'No disponible'}</p>
              <p><strong>Código Postal:</strong> ${user.address?.postalCode || 'No disponible'}</p>
            </div>
          </div>

          <!-- Compañía -->
          <div class="detail-section">
            <h5>Compañía</h5>
            <div class="detail-grid">
              <p><strong>Nombre:</strong> ${user.company?.name || 'No disponible'}</p>
              <p><strong>Departamento:</strong> ${user.company?.department || 'No disponible'}</p>
              <p><strong>Título:</strong> ${user.company?.title || 'No disponible'}</p>
            </div>
          </div>

          <!-- Información Bancaria -->
          <div class="detail-section">
            <h5>Información Bancaria</h5>
            <div class="detail-grid">
              <p><strong>Tarjeta:</strong> ${user.bank?.cardNumber || 'No disponible'} (${user.bank?.cardType || ''})</p>
              <p><strong>Moneda:</strong> ${user.bank?.currency || 'No disponible'}</p>
              <p><strong>IBAN:</strong> ${user.bank?.iban || 'No disponible'}</p>
            </div>
          </div>

          <!-- Cripto -->
          <div class="detail-section">
            <h5>Cripto</h5>
            <div class="detail-grid">
              <p><strong>Wallet:</strong> ${user.crypto?.wallet || 'No disponible'}</p>
              <p><strong>Red:</strong> ${user.crypto?.network || 'No disponible'}</p>
            </div>
          </div>

          <!-- Información Técnica -->
          <div class="detail-section">
            <h5>Información Técnica</h5>
            <div class="detail-grid">
              <p><strong>IP:</strong> ${user.ip || 'No disponible'}</p>
              <p><strong>MAC:</strong> ${user.macAddress || 'No disponible'}</p>
              <p><strong>User Agent:</strong> ${user.userAgent || 'No disponible'}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    Swal.fire({
      title: `<strong>Detalles del Usuario</strong>`,
      html: modalHtml,
      width: '800px',
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: 'Cerrar',
      confirmButtonAriaLabel: 'Cerrar',
    });
  }

  editUser(user: any): void {
    console.log('Editar usuario:', user);
    // Aquí se puede implementar la lógica para editar, por ejemplo, en un modal o navegando a otra página.
    Swal.fire({
      title: 'Función no implementada',
      text: `La edición para ${user.firstName} ${user.lastName} aún no está disponible.`,
      icon: 'info'
    });
  }

  toggleUserStatus(user: any): void {
    const newStatus = !user.isActive;
    const actionText = newStatus ? 'activar' : 'desactivar';

    Swal.fire({
      title: `¿Estás seguro?`,
      text: `¿Realmente quieres ${actionText} al usuario ${user.email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Sí, ¡${actionText}! `,
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.http.put(`http://localhost:5000/api/users/${user.id}/toggle_active`, {})
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            user.isActive = newStatus;
            this.cdr.detectChanges(); // Actualizar la vista
            Swal.fire(
              '¡Actualizado!',
              `El usuario ${user.email} ha sido ${actionText}ado.`,
              'success'
            );
          }, error => {
            console.error('Error al cambiar el estado del usuario:', error);
            Swal.fire(
              'Error',
              'No se pudo actualizar el estado del usuario.',
              'error'
            );
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}
