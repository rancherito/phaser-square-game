import { Component, inject, signal, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { JsonImportExportService } from '../services/import-export.service';
import { GameService } from '../services/game.service';
import { GameComponent } from './game.component';

@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [AsyncPipe, NgFor, NgIf, RouterLink, GameComponent],
    template: `
        @if (mode() === 'welcome') {
            <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-gray-800">
                <!-- Panel de bienvenida -->
                <div *ngIf="!showMenu" class="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
                    <h1 class="text-6xl font-bold mb-8">{{ welcomeMessage }}</h1>
                    <button (click)="enterApp()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105">
                        {{ buttonText }}
                    </button>
                </div>

                <!-- Menú principal -->
                <div *ngIf="showMenu" class="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                    <h1 class="text-4xl font-bold mb-6 text-center">Capy Aventuras</h1>

                    <h2 class="text-2xl font-semibold mb-4">Niveles disponibles</h2>

                    <ul class="space-y-2">
                        @for (project of listProjects(); track project) {
                            <li class="border border-gray-200 rounded-lg overflow-hidden">
                                <button class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200" (click)="loadProject(project)">
                                    {{ project.replace('_', ' ').toUpperCase() }}
                                </button>
                            </li>
                        }
                    </ul>
                    <p class="text-gray-600 text-center mt-4">{{ message }}</p>
                </div>
            </div>
        } @else {
            @defer {
                <app-game></app-game>
            }
        }
    `,
})
export class WelcomeComponent implements OnInit {
    private jsonService = inject(JsonImportExportService);
    gameService = inject(GameService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    listProjects = signal<string[] | null>(null);

    mode = signal<'welcome' | 'game'>('welcome');

    message = 'Cargando niveles...';
    showMenu = false;
    welcomeMessage = 'Bienvenido';
    buttonText = 'Entrar';

    constructor() {
        this.jsonService.listProjects().subscribe((projects) => {
            this.listProjects.set(projects);
            this.message = projects ? '' : 'No hay niveles disponibles';
        });
    }

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            const state = params['state'];
            if (state === '1') {
                this.welcomeMessage = 'Game Over';
                this.buttonText = 'Intentar de nuevo';
            } else if (state === '2') {
                this.welcomeMessage = '¡Tú ganaste!';
                this.buttonText = 'Jugar de nuevo';
            }
        });
    }

    enterApp() {
        this.showMenu = true;
        this.gameService.playMusic('assets/sounds/startMenu.mp3');
    }

    loadProject(project: string) {
        this.message = 'Cargando nivel...';
        this.jsonService.getProjectPromise(project).then((levelData) => {
            this.gameService.currentLevel.set(levelData);
            this.message = '';
            this.mode.set('game');
        });
    }
}
