import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../file.service';

@Component({
  selector: 'app-detection',
  templateUrl: './detection.component.html',
  styleUrls: ['./detection.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DetectionComponent {
  selectedFile: File | null = null;
  analyzing = false;
  result: any = null;
  error: string | null = null;

  constructor(private fileService: FileService) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.error = null;
      this.result = null;
    }
  }

  async analyzeFile(): Promise<void> {
    if (!this.selectedFile) {
      this.error = 'Please select a file first';
      return;
    }

    try {
      this.analyzing = true;
      this.error = null;
      this.result = await this.fileService.analyzeFile(this.selectedFile);
    } catch (err: any) {
      this.error = err.message || 'An error occurred during analysis';
    } finally {
      this.analyzing = false;
    }
  }
} 