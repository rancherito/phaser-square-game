import { computed, Injectable, signal } from '@angular/core';
import { LevelData } from './import-export.service';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    currentLevel = signal<LevelData | null>(null);    
    heroLife = signal<number>(5);
    readonly maxLife = 5;
    stateLife = computed(() => {
        let life = Array(this.maxLife).fill(1);
        for (let i = 0; i < this.maxLife - this.heroLife(); i++) {
            life[i] = 0;
        }
        return life;
    });
    constructor() {}
}
