import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"capydb2","appId":"1:104310994644:web:1f0b2b47d774a6f1ad2d41","storageBucket":"capydb2.appspot.com","apiKey":"AIzaSyBtLBKJLtWBWjOxRZ4darnbBM3IfTZpmHg","authDomain":"capydb2.firebaseapp.com","messagingSenderId":"104310994644"})), provideFirestore(() => getFirestore())]
};
