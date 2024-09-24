// levels.ts

import { GameLevel } from './types';

export const GAME_CONSTANTS = {
    boxSize: 60,
    worldWidth: 200 * 60, // 200 cajas de ancho
    worldHeight: 0 // Se establecerá dinámicamente
};

export const nivel1: GameLevel = {
    name: "Nivel 1: Iniciación",
    platforms: [
        { x: 0, y: 0, width: 300, height: 1 }, // Plataforma principal en el suelo
        { x: 5, y: 3, width: 3, height: 1 },
        { x: 15, y: 5, width: 3, height: 1 },
        { x: 25, y: 7, width: 3, height: 1 },
        { x: 35, y: 9, width: 3, height: 1 },
        { x: 50, y: 6, width: 5, height: 1 },
        { x: 70, y: 4, width: 4, height: 1 },
        { x: 90, y: 8, width: 3, height: 1 },
        { x: 100, y: 10, width: 4, height: 1 },
        { x: 110, y: 12, width: 3, height: 1 },
        { x: 120, y: 14, width: 5, height: 1 },
        { x: 135, y: 11, width: 3, height: 1 },
        { x: 150, y: 9, width: 4, height: 1 },
        { x: 165, y: 7, width: 3, height: 1 },
        { x: 180, y: 5, width: 5, height: 1 },
        { x: 195, y: 3, width: 4, height: 1 }
    ],
    player: { x: 1, y: 3 }, // Posición inicial del jugador
    enemies: [
        { x: 30, y: 8, type: 'basic', patrolDistance: 5 },
        { x: 80, y: 5, type: 'jumper', jumpHeight: 4 },
        { x: 140, y: 12, type: 'flying', patrolDistance: 8 }
    ],
    collectibles: [
        { x: 10, y: 5, type: 'coin' },
        { x: 40, y: 10, type: 'powerUp' },
        { x: 100, y: 12, type: 'coin' },
        { x: 160, y: 8, type: 'healthPack' },
        { x: 190, y: 6, type: 'coin' }
    ],
    obstacles: [
        { x: 60, y: 2, type: 'spikes', width: 3 },
        { x: 130, y: 15, type: 'lava', width: 4 },
        { x: 175, y: 6, type: 'movingPlatform', width: 3, patrolDistance: 4 }
    ],
    background: 'gb2'
};

export const nivel2: GameLevel = {
    name: "Nivel 2: Desafío en las Alturas",
    platforms: [
        { x: 0, y: 0, width: 300, height: 1 }, // Plataforma principal en el suelo
        { x: 10, y: 4, width: 4, height: 1 },
        { x: 20, y: 8, width: 3, height: 1 },
        { x: 30, y: 12, width: 5, height: 1 },
        { x: 45, y: 15, width: 3, height: 1 },
        { x: 60, y: 18, width: 4, height: 1 },
        { x: 75, y: 21, width: 3, height: 1 },
        { x: 90, y: 24, width: 5, height: 1 },
        { x: 110, y: 20, width: 4, height: 1 },
        { x: 130, y: 16, width: 3, height: 1 },
        { x: 150, y: 12, width: 5, height: 1 },
        { x: 170, y: 8, width: 4, height: 1 },
        { x: 190, y: 4, width: 3, height: 1 },
        { x: 205, y: 7, width: 4, height: 1 },
        { x: 220, y: 10, width: 5, height: 1 },
        { x: 240, y: 13, width: 3, height: 1 },
        { x: 260, y: 16, width: 4, height: 1 },
        { x: 280, y: 19, width: 5, height: 1 }
    ],
    player: { x: 1, y: 3 }, // Posición inicial del jugador
    enemies: [
        { x: 40, y: 13, type: 'jumper', jumpHeight: 5 },
        { x: 85, y: 22, type: 'flying', patrolDistance: 10 },
        { x: 140, y: 17, type: 'basic', patrolDistance: 6 },
        { x: 200, y: 5, type: 'jumper', jumpHeight: 6 },
        { x: 250, y: 17, type: 'flying', patrolDistance: 12 }
    ],
    collectibles: [
        { x: 15, y: 6, type: 'coin' },
        { x: 55, y: 19, type: 'powerUp' },
        { x: 100, y: 25, type: 'coin' },
        { x: 145, y: 14, type: 'healthPack' },
        { x: 185, y: 6, type: 'coin' },
        { x: 225, y: 12, type: 'powerUp' },
        { x: 275, y: 21, type: 'coin' }
    ],
    obstacles: [
        { x: 70, y: 19, type: 'spikes', width: 4 },
        { x: 120, y: 21, type: 'lava', width: 5 },
        { x: 180, y: 9, type: 'movingPlatform', width: 3, patrolDistance: 5 },
        { x: 230, y: 11, type: 'spikes', width: 3 },
        { x: 270, y: 17, type: 'movingPlatform', width: 4, patrolDistance: 6 }
    ],
    background: 'mountains'
};

export const levels: GameLevel[] = [nivel1, nivel2];
