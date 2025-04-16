import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  downloadFile(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${filename}`, {
      responseType: 'blob'
    });
  }

  decryptFile(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/decrypt/${filename}`, {
      responseType: 'blob'
    });
  }

  analyzeFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/analyze`, formData);
  }
}