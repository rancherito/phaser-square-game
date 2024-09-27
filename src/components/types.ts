// types.ts

export interface Platform {
    x: number;
    y: number;
    width: number;
}

export interface Player {
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
