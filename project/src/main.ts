import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FileService } from './app/file.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h1>Secure File Encryption Service</h1>
      
      <!-- File Upload Section -->
      <div class="upload-section">
        <h2>Upload Your File</h2>
        <div class="file-input-wrapper">
          <input 
            type="file" 
            id="fileInput" 
            class="file-input" 
            (change)="onFileSelected($event)"
          />
          <label for="fileInput" class="file-label">
            Choose a file
          </label>
        </div>
        
        <div *ngIf="selectedFile" class="selected-file">
          <span>Selected: {{ selectedFile.name }}</span>
          <div>Size: {{ formatFileSize(selectedFile.size) }}</div>
        </div>

        <button 
          class="btn btn-primary" 
          (click)="uploadFile()" 
          [disabled]="!selectedFile || isUploading"
        >
          <span *ngIf="isUploading" class="loading"></span>
          {{ isUploading ? 'Encrypting...' : 'Encrypt & Upload' }}
        </button>
      </div>

      <!-- Progress Bar -->
      <div *ngIf="isUploading" class="progress-bar">
        <div 
          class="progress-bar-fill" 
          [style.width.%]="uploadProgress"
        ></div>
      </div>

      <!-- Status Messages -->
      <div *ngIf="message" [class]="'alert ' + (error ? 'alert-error' : 'alert-success')">
        <span *ngIf="!error">✓</span>
        <span *ngIf="error">⚠</span>
        {{ message }}
      </div>

      <!-- Encrypted File Section -->
      <div *ngIf="encryptedFileName" class="encrypted-file">
        <h3>Encrypted File Ready</h3>
        <div class="file-info">
          <div>
            <strong>File:</strong> {{ encryptedFileName }}
          </div>
          <button 
            class="btn btn-primary" 
            (click)="downloadFile()"
            [disabled]="isDownloading"
          >
            <span *ngIf="isDownloading" class="loading"></span>
            {{ isDownloading ? 'Downloading...' : 'Download Encrypted File' }}
          </button>
        </div>
      </div>
    </div>
  `,
  imports: [CommonModule, HttpClientModule],
  providers: [FileService],
  standalone: true
})
export class App {
  selectedFile: File | null = null;
  encryptedFileName: string | null = null;
  message: string | null = null;
  error: boolean = false;
  isUploading: boolean = false;
  isDownloading: boolean = false;
  uploadProgress: number = 0;

  constructor(private fileService: FileService) {}

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.message = null;
    this.error = false;
    this.uploadProgress = 0;
  }

  uploadFile() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.message = null;
    this.uploadProgress = 0;

    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 500);

    this.fileService.uploadFile(this.selectedFile).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        this.message = response.message;
        this.encryptedFileName = response.filename;
        this.error = false;
        this.isUploading = false;
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.uploadProgress = 0;
        this.message = error.error.message || 'An error occurred during upload';
        this.error = true;
        this.isUploading = false;
      }
    });
  }

  downloadFile() {
    if (!this.encryptedFileName) return;

    this.isDownloading = true;

    this.fileService.downloadFile(this.encryptedFileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.encryptedFileName!;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isDownloading = false;
      },
      error: (error) => {
        this.message = 'Error downloading file';
        this.error = true;
        this.isDownloading = false;
      }
    });
  }
}

bootstrapApplication(App);