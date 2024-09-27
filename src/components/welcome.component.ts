import { Component, inject, signal } from '@angular/core';

import { AsyncPipe, NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { JsonImportExportService } from '../services/import-export.service';
import { GameService } from '../services/game.service';

@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [AsyncPipe, NgFor, RouterLink],
    template: `
        <div class="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex flex-col items-center justify-center text-white">
            <h1 class="text-4xl font-bold mb-8">Bienvenido a Capy Aventuras</h1>

            <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 class="text-2xl font-semibold mb-4 text-gray-800">Niveles disponibles</h2>

                <ul class="space-y-2">
                    @for (project of listProjects(); track project) {
                    <li class="bg-gray-100 rounded p-3 hover:bg-gray-200 transition-colors">
                        <button class="text-blue-600 hover:text-blue-800 font-medium" (click)="loadPorject(project)">{{ project }}</button>
                    </li>
                    }
                </ul>
                <p class="text-gray-600 text-center">{{ messsage }}</p>
            </div>
        </div>
    `,
})
export class WelcomeComponent {
    private jsonService = inject(JsonImportExportService);
    private gameService = inject(GameService);
    private router = inject(Router);
    listProjects = signal<string[] | null>(null);

    messsage = 'Cargando niveles...';
    loadPorject(_t7: string) {
        this.messsage = 'Cargando nivel...';
        this.jsonService.getProjectPromise(_t7).then((levelData) => {
            this.gameService.currentLevel.set(levelData);
            this.messsage = '';
            this.router.navigate(['/game']);
        });
    }
    constructor() {
        this.jsonService.listProjects().subscribe((projects) => {
            this.listProjects.set(projects);
            this.messsage = projects ? '' : 'No hay niveles disponibles';
        });
    }
}
