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

export interface Collectible {
    x: number;
    y: number;
}


export interface GameLevel {
    name: string;
    platforms: Platform[];
    hero: Player;
    fire: Cell[];
    stars: Collectible[];
    background: string;
    flag: Cell | null;
}
export interface LevelData {
    name: string;
    platforms: Platform[];
    hero: Cell | null;
    fire: Cell[];
    stars: Cell[];
    background: string;
    flag: Cell | null;
}

export interface Cell {
    x: number;
    y: number;
}
