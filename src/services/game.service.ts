import { Injectable, signal } from '@angular/core';
import { LevelData } from './import-export.service';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    currentLevel = signal<LevelData | null>(null);
    constructor() {}
}
