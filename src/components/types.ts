// types.ts

export interface Platform {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Player {
    x: number;
    y: number;
    texture: string;
}

export interface Enemy {
    x: number;
    y: number;
    type: 'jumper' | 'flying';
    patrolDistance?: number;
    jumpHeight?: number;
}

export interface Collectible {
    x: number;
    y: number;
    type: 'coin' | 'healthPack';
}

export interface Obstacle {
    x: number;
    y: number;
    type: 'spikes' | 'movingPlatform';
    width: number;
    patrolDistance?: number;
}

export interface GameLevel {
    name: string;
    platforms: Platform[];
    player: Player;
    enemies: Enemy[];
    collectibles: Collectible[];
    obstacles: Obstacle[];
    background: string;
}
