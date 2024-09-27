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
    type: 'fire';
    scale: number
}

export interface Collectible {
    x: number;
    y: number;
    type: 'coin';
}


export interface GameLevel {
    name: string;
    platforms: Platform[];
    player: Player;
    enemies: Enemy[];
    collectibles: Collectible[];
    background: string;
}
