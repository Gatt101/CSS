import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';

const routes = [
  { path: '', loadComponent: () => import('./app/home/home.component').then(m => m.HomeComponent) },
  { path: 'detection', loadComponent: () => import('./app/detection/detection.component').then(m => m.DetectionComponent) },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
}).catch(err => console.error(err));