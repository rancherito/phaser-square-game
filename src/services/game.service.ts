import { computed, Injectable, signal } from '@angular/core';
import { LevelData } from './import-export.service';
import { GameComponent } from '../components/game.component';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    currentLevel = signal<LevelData | null>(null);
    heroLife = signal<number>(5);
    gameComponent = signal<GameComponent | null>(null);
    readonly maxLife = 5;
    stateLife = computed(() => {
        let life = Array(this.maxLife).fill(1);
        for (let i = 0; i < this.maxLife - this.heroLife(); i++) {
            life[i] = 0;
        }
        return life;
    });

    private audio: HTMLAudioElement;
    isPlaying = signal<boolean>(false);

    constructor() {
        this.audio = new Audio();
        this.audio.loop = true;
    }

    playMusic(src: string) {
        if (this.audio.src !== src) {
            this.audio.src = src;
        }
        this.audio
            .play()
            .then(() => {
                this.isPlaying.set(true);
            })
            .catch((error) => {
                console.error('Error al reproducir audio:', error);
                this.isPlaying.set(false);
            });
    }

    pauseMusic() {
        this.audio.pause();
        this.isPlaying.set(false);
    }

    stopMusic() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying.set(false);
    }

    setVolume(volume: number) {
        this.audio.volume = Math.max(0, Math.min(1, volume));
    }

    toggleMusic() {
        if (this.isPlaying()) {
            this.pauseMusic();
        } else {
            this.playMusic(this.audio.src);
        }
    }
}
