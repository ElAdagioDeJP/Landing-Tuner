import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StyleService, Style } from '../../services/style.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  styles: Style[] = [];
  selectedStyle: Style | null = null;
  isNewStyle = false;
  activeStyle: Style | null = null; // Propiedad para el estilo activo

  constructor(private styleService: StyleService) {}

  ngOnInit() {
    this.loadStyles();
  }

  loadStyles() {
    this.styleService.getStyles().subscribe((data: Style[]) => {
      this.styles = data;
      this.activeStyle = data.find(s => s.isActive) || null;
    });
  }

  createStyle() {
    this.isNewStyle = true;
    this.selectedStyle = {
      id: 0, // El ID será asignado por el backend
      name: '',
      isActive: false,
      primaryColor: '#ffffff',
      secondaryColor: '#ffffff',
      accentColor: '#ffffff',
      textColor: '#000000',
      extraColor1: '#ffffff',
      extraColor2: '#ffffff',
      fontFamily: 'Arial',
      fontSizeBase: 16
    };
  }

  selectStyle(style: Style) {
    this.isNewStyle = false;
    this.selectedStyle = { ...style };
  }

  saveStyle() {
    if (!this.selectedStyle) return;

    const styleData: Partial<Style> = { ...this.selectedStyle };

    const onSave = () => {
      this.loadStyles();
      this.cancelEdit();
    };

    if (this.isNewStyle) {
      delete styleData.id;
      this.styleService.createStyle(styleData as Omit<Style, 'id'>).subscribe(onSave);
    } else {
      const id = styleData.id!;
      delete styleData.id;
      this.styleService.updateStyle(id, styleData).subscribe(onSave);
    }
  }

  deleteStyle(id: number) {
    this.styleService.deleteStyle(id).subscribe(() => {
      this.loadStyles();
      if (this.selectedStyle && this.selectedStyle.id === id) {
        this.cancelEdit();
      }
    });
  }

  activateStyle(styleToActivate: Style) {
    const currentActive = this.styles.find(s => s.isActive);

    const activateNew = () => {
      this.styleService.updateStyle(styleToActivate.id, { isActive: true }).subscribe(() => {
        this.loadStyles();
      });
    };

    if (currentActive && currentActive.id !== styleToActivate.id) {
      this.styleService.updateStyle(currentActive.id, { isActive: false }).subscribe(() => {
        activateNew();
      });
    } else if (!currentActive) {
      activateNew();
    }
  }

  cancelEdit() {
    this.selectedStyle = null;
    this.isNewStyle = false;
  }
}
