// types.ts

export interface Platform {
    x: number;
    y: number;
    width: number;
}

export interface Player extends Cell {
    x: number;
    y: number;
}

export interface Fire {
    x: number;
    y: number;
}

export interface Collectible {
    x: number;
    y: number;
}


export interface GameLevel {
    name: string;
    platforms: Platform[];
    hero: Player;
    fire: Fire[];
    stars: Collectible[];
    background: string;
}
export interface LevelData {
    name: string;
    platforms: Platform[];
    hero: Cell | null;
    fire: Cell[];
    stars: Cell[];
    background: string;
}

export interface Cell {
    x: number;
    y: number;
}
