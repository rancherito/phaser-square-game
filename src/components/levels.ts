// levels.ts

import { GameLevel } from './types';

export const GAME_CONSTANTS = {
    boxSize: 60,
    worldWidth: 1200 * 60, // 200 cajas de ancho
    worldHeight: 0 // Se establecerá dinámicamente
};

export const nivel1: GameLevel = {
    name: "Nivel 1: Iniciación Expandida",
    platforms: [
        { x: 0, y: 0, width: 1200, height: 1 }, // Plataforma principal en el suelo
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
        { x: 195, y: 3, width: 4, height: 1 },
        { x: 220, y: 6, width: 4, height: 1 },
        { x: 240, y: 8, width: 3, height: 1 },
        { x: 260, y: 10, width: 5, height: 1 },
        { x: 285, y: 7, width: 3, height: 1 },
        { x: 300, y: 5, width: 4, height: 1 },
        { x: 320, y: 9, width: 3, height: 1 },
        { x: 340, y: 11, width: 5, height: 1 },
        { x: 365, y: 8, width: 3, height: 1 },
        { x: 380, y: 6, width: 4, height: 1 },
        { x: 400, y: 10, width: 3, height: 1 },
        { x: 420, y: 12, width: 5, height: 1 },
        { x: 445, y: 9, width: 3, height: 1 },
        { x: 460, y: 7, width: 4, height: 1 },
        { x: 480, y: 11, width: 3, height: 1 },
        { x: 500, y: 13, width: 5, height: 1 },
        { x: 525, y: 10, width: 3, height: 1 },
        { x: 540, y: 8, width: 4, height: 1 },
        { x: 560, y: 12, width: 3, height: 1 },
        { x: 580, y: 14, width: 5, height: 1 },
        { x: 605, y: 11, width: 3, height: 1 },
        { x: 620, y: 9, width: 4, height: 1 },
        { x: 640, y: 13, width: 3, height: 1 },
        { x: 660, y: 15, width: 5, height: 1 },
        { x: 685, y: 12, width: 3, height: 1 },
        { x: 700, y: 10, width: 4, height: 1 },
        { x: 720, y: 14, width: 3, height: 1 },
        { x: 740, y: 16, width: 5, height: 1 },
        { x: 765, y: 13, width: 3, height: 1 },
        { x: 780, y: 11, width: 4, height: 1 },
        { x: 800, y: 15, width: 3, height: 1 },
        { x: 820, y: 17, width: 5, height: 1 },
        { x: 845, y: 14, width: 3, height: 1 },
        { x: 860, y: 12, width: 4, height: 1 },
        { x: 880, y: 16, width: 3, height: 1 },
        { x: 900, y: 18, width: 5, height: 1 },
        { x: 925, y: 15, width: 3, height: 1 },
        { x: 940, y: 13, width: 4, height: 1 },
        { x: 960, y: 17, width: 3, height: 1 },
        { x: 980, y: 19, width: 5, height: 1 },
        { x: 1005, y: 16, width: 3, height: 1 },
        { x: 1020, y: 14, width: 4, height: 1 },
        { x: 1040, y: 18, width: 3, height: 1 },
        { x: 1060, y: 20, width: 5, height: 1 },
        { x: 1085, y: 17, width: 3, height: 1 },
        { x: 1100, y: 15, width: 4, height: 1 },
        { x: 1120, y: 19, width: 3, height: 1 },
        { x: 1140, y: 21, width: 5, height: 1 },
        { x: 1165, y: 18, width: 3, height: 1 },
        { x: 1180, y: 16, width: 4, height: 1 }
    ],
    player: { x: 1, y: 3, texture: 'player' },
    enemies: [
        { x: 30, y: 1, type: 'fire', scale: 1 },
        { x: 80, y: 1, type: 'fire', scale: 2 },
        { x: 140, y: 1, type: 'fire', scale: 3 },
        { x: 200, y: 1, type: 'fire', scale: 1 },
        { x: 280, y: 1, type: 'fire', scale: 2 },
        { x: 350, y: 1, type: 'fire', scale: 3 },
        { x: 420, y: 1, type: 'fire', scale: 1 },
        { x: 500, y: 1, type: 'fire', scale: 2 },
        { x: 580, y: 1, type: 'fire', scale: 3 },
        { x: 660, y: 1, type: 'fire', scale: 1 },
        { x: 740, y: 1, type: 'fire', scale: 2 },
        { x: 820, y: 1, type: 'fire', scale: 3 },
        { x: 900, y: 1, type: 'fire', scale: 1 },
        { x: 980, y: 1, type: 'fire', scale: 2 },
        { x: 1060, y: 1, type: 'fire', scale: 3 }
    ],
    collectibles: [
        { x: 10, y: 5, type: 'coin' },
        { x: 100, y: 12, type: 'coin' },
        { x: 190, y: 6, type: 'coin' },
        { x: 250, y: 10, type: 'coin' },
        { x: 370, y: 13, type: 'coin' },
        { x: 430, y: 14, type: 'coin' },
        { x: 550, y: 15, type: 'coin' },
        { x: 610, y: 12, type: 'coin' },
        { x: 730, y: 18, type: 'coin' },
        { x: 790, y: 13, type: 'coin' },
        { x: 910, y: 20, type: 'coin' },
        { x: 970, y: 14, type: 'coin' },
        { x: 1090, y: 22, type: 'coin' },
        { x: 1150, y: 17, type: 'coin' }
    ],
    background: 'bg_forest'
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
    player: { x: 1, y: 3, texture: 'player2' }, // jugador
    enemies: [
        { x: 40, y: 13, type: 'fire', scale: 2 },
        { x: 85, y: 22, type: 'fire', scale: 3 },
        { x: 140, y: 17, type: 'fire', scale: 1 },
        { x: 200, y: 5, type: 'fire', scale: 2 },
        { x: 250, y: 17, type: 'fire', scale: 3 }
    ],
    collectibles: [
        { x: 15, y: 6, type: 'coin', },
        { x: 100, y: 25, type: 'coin', },
        { x: 185, y: 6, type: 'coin', },
        { x: 275, y: 21, type: 'coin', },
    ],
    background: 'mountains'
};

export const levels: GameLevel[] = [nivel1, nivel2];
