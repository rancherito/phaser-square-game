import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { JsonImportExportService } from '../services/import-export.service';
import { GameService } from '../services/game.service';

@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [AsyncPipe, NgFor, NgIf, RouterLink],
    template: `
        <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-gray-800">
            <!-- Panel de bienvenida -->
            <div *ngIf="!showMenu" class="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
                <h1 class="text-6xl font-bold mb-8">Bienvenido</h1>
                <button (click)="enterApp()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105">
                    Entrar
                </button>
            </div>

            <!-- Menú principal -->
            <div *ngIf="showMenu" class="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h1 class="text-4xl font-bold mb-6 text-center">Capy Aventuras</h1>

                <h2 class="text-2xl font-semibold mb-4">Niveles disponibles</h2>

                <ul class="space-y-2">
                    @for (project of listProjects(); track project) {
                        <li class="border border-gray-200 rounded-lg overflow-hidden">
                            <button class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200" (click)="loadPorject(project)">
                                {{ project }}
                            </button>
                        </li>
                    }
                </ul>
                <p class="text-gray-600 text-center mt-4">{{ message }}</p>

                <!-- Botón para controlar la música -->
                <button (click)="toggleMusic()" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                    {{ gameService.isPlaying() ? 'Pausar Música' : 'Reproducir Música' }}
                </button>
            </div>
        </div>
    `,
})
export class WelcomeComponent {
    private jsonService = inject(JsonImportExportService);
    gameService = inject(GameService);
    private router = inject(Router);
    listProjects = signal<string[] | null>(null);

    message = 'Cargando niveles...';
    showMenu = false;

    constructor() {
        this.jsonService.listProjects().subscribe((projects) => {
            this.listProjects.set(projects);
            this.message = projects ? '' : 'No hay niveles disponibles';
        });
    }

    enterApp() {
        this.showMenu = true;
        this.gameService.playMusic('assets/sounds/startMenu.mp3');
    }

    toggleMusic() {
        this.gameService.toggleMusic();
    }

    loadPorject(project: string) {
        this.message = 'Cargando nivel...';
        this.jsonService.getProjectPromise(project).then((levelData) => {
            this.gameService.currentLevel.set(levelData);
            this.message = '';
            this.router.navigate(['/game']);
        });
    }

  
}
