import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideToastr } from 'ngx-toastr';
export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideFirebaseApp(() => initializeApp({ "projectId": "capydb2", "appId": "1:104310994644:web:1f0b2b47d774a6f1ad2d41", "storageBucket": "capydb2.appspot.com", "apiKey": "AIzaSyBtLBKJLtWBWjOxRZ4darnbBM3IfTZpmHg", "authDomain": "capydb2.firebaseapp.com", "messagingSenderId": "104310994644" })),
        provideFirestore(() => getFirestore()),
        provideAnimations(),
        provideToastr()
    ]
};
