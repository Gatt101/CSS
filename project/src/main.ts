import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FileService } from './app/file.service';

@Component({
  selector: 'app-root',
  template: `
   <div class="container">
      <!-- Home Banner -->
      <div class="home-banner">
        <div class="banner-content">
          <h1>Malware Detection System</h1>
          <p class="tagline">Secure. Reliable. Intelligent.</p>
        </div>
      </div>
      
      <!-- Introduction -->
      <div class="introduction-section">
        <h2>About Malware Detection</h2>
        <p>
          Our advanced malware detection system uses cutting-edge machine learning algorithms to identify and 
          neutralize threats before they can compromise your system. By analyzing file signatures, behavior patterns, 
          and code structure, we can detect even the most sophisticated malware variants.
        </p>
        <p>
          Upload any suspicious file to our secure platform, and our system will scan it for potential threats, 
          including viruses, trojans, ransomware, spyware, and other malicious software. Protect your valuable 
          data with our state-of-the-art malware detection technology.
        </p>
        <div class="feature-highlights">
          <div class="feature">
            <span class="feature-icon">🔍</span>
            <h3>Deep Scanning</h3>
            <p>Thorough analysis of file contents and behavior</p>
          </div>
          <div class="feature">
            <span class="feature-icon">🔐</span>
            <h3>Secure Processing</h3>
            <p>Files are processed in a secure sandbox environment</p>
          </div>
          <div class="feature">
            <span class="feature-icon">⚡</span>
            <h3>Fast Results</h3>
            <p>Get detection results in seconds</p>
          </div>
        </div>
      </div>
      
      <!-- File Upload Section -->
      <div class="upload-section">
        <h2>Upload File for Analysis</h2>
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
          {{ isUploading ? 'Analyzing...' : 'Scan for Malware' }}
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

      <!-- Results Section -->
      <div *ngIf="encryptedFileName" class="encrypted-file">
        <h3>Scan Results</h3>
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
            {{ isDownloading ? 'Downloading...' : 'Download Scan Report' }}
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
        this.message = error.error.message || 'An error occurred';
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
        const a = document.createElement('a');
        a.href = url;
        a.download = this.encryptedFileName || 'scan-report.pdf';
        document.body.appendChild(a);
        a.click();
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