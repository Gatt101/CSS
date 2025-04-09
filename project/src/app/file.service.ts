import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'http://localhost:3000/api'; // Replace with your actual API endpoint

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

  async analyzeFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // For demo purposes, we'll simulate the analysis with a timeout
      // In a real application, you would send the file to your backend
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate analysis result
      const result = {
        threatLevel: this.simulateThreatLevel(),
        summary: this.generateAnalysisSummary(),
        details: this.generateAnalysisDetails()
      };

      return result;
    } catch (error) {
      throw new Error('Failed to analyze file');
    }
  }

  private simulateThreatLevel(): string {
    const levels = ['low', 'medium', 'high'];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  private generateAnalysisSummary(): string {
    const summaries = [
      'No malicious content detected',
      'Potential security risks identified',
      'High-risk malware signatures detected'
    ];
    return summaries[Math.floor(Math.random() * summaries.length)];
  }

  private generateAnalysisDetails(): string[] {
    return [
      'File signature analysis completed',
      'Behavioral pattern analysis performed',
      'Known malware database comparison completed',
      'Code structure analysis finished'
    ];
  }
}