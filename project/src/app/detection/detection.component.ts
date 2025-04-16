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
  encryptedFileName: string | null = null;
  message: string | null = null;
  uploadProgress = 0;
  isUploading = false;
  isDownloading = false;
  isDecrypting = false;

  constructor(private fileService: FileService) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.error = null;
      this.result = null;
      this.message = null;
      this.uploadProgress = 0;
    }
  }

  uploadFile(): void {
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
        this.error = null;
        this.isUploading = false;
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.uploadProgress = 0;
        this.message = error.error?.message || 'An error occurred during upload';
        this.error = error.error?.message || 'An error occurred during upload';
        this.isUploading = false;
      }
    });
  }

  downloadFile(): void {
    if (!this.encryptedFileName) return;

    this.isDownloading = true;
    this.fileService.downloadFile(this.encryptedFileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.encryptedFileName || 'encrypted-file';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.isDownloading = false;
      },
      error: (error) => {
        this.message = 'Error downloading file';
        this.error = 'Error downloading file';
        this.isDownloading = false;
      }
    });
  }

  decryptFile(): void {
    if (!this.encryptedFileName) return;

    this.isDecrypting = true;
    this.fileService.decryptFile(this.encryptedFileName).subscribe({
      next: (blob) => {
        const originalName = this.encryptedFileName!.replace('encrypted_', 'decrypted_');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.message = 'File decrypted and downloaded successfully';
        this.error = null;
        this.isDecrypting = false;
      },
      error: (err) => {
        this.message = 'Error decrypting file: ' + (err.error?.message || 'Unknown error');
        this.error = 'Error decrypting file: ' + (err.error?.message || 'Unknown error');
        this.isDecrypting = false;
      }
    });
  }

  analyzeFile(): void {
    if (!this.selectedFile) {
      this.error = 'Please select a file first';
      return;
    }

    this.analyzing = true;
    this.error = null;
    this.result = null;

    this.fileService.analyzeFile(this.selectedFile).subscribe({
      next: (result) => {
        this.result = {
          threatLevel: result.contains_malware ? 'high' : 'low',
          summary: result.contains_malware ? 'Malware detected in file' : 'No malware detected',
          details: [
            `File name: ${result.filename}`,
            `File size: ${result.size_bytes} bytes`,
            `Malware scan: ${result.contains_malware ? 'Positive' : 'Negative'}`
          ]
        };
        this.analyzing = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'An error occurred during analysis';
        this.analyzing = false;
      }
    });
  }
} 
