import { Component, OnInit, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Phaser from 'phaser';
import { GAME_CONSTANTS } from '../services/levels';
import { Fire, Collectible, GameLevel, LevelData } from '../services/types';
import { GameService } from '../services/game.service';
import { Router } from '@angular/router';

let GLOBAL_SERVICES: GameService | null = null;
function collectItem(player: Phaser.GameObjects.GameObject, item: Phaser.GameObjects.GameObject) {
    (item as Phaser.GameObjects.Rectangle).setVisible(false);
    (item.body as Phaser.Physics.Arcade.StaticBody).enable = false;
}

function handleFireDamage(player: Phaser.Physics.Arcade.Sprite, fire: Phaser.GameObjects.GameObject) {
    const scene = player.scene;
    const playerData = scene.data.get('playerData') as { health: number; lastDamageTime: number };
    const currentTime = scene.time.now;

    if (currentTime - playerData.lastDamageTime >= 2000) {
        // 2 seconds cooldown
        playerData.health = Math.max(0, playerData.health - 1);
        playerData.lastDamageTime = currentTime;
        updateHealthBar(scene, playerData.health);

        if (playerData.health <= 0) {
            // Game over logic here
            console.log('Game Over');
        }
    }
}

function updateHealthBar(scene: Phaser.Scene, health: number) {
    console.log('Updating health bar', health);
    GLOBAL_SERVICES?.heroLife.set(health);
    const healthBar = scene.data.get('healthBar') as Phaser.GameObjects.Group;
    healthBar.children.entries.forEach((slot: any, index: number) => {
        slot.fillColor = index < health ? 0x00ff00 : 0xff0000;
    });
}

function handleMovingPlatformCollision(player: Phaser.GameObjects.GameObject, platform: Phaser.GameObjects.GameObject) {
    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    const platformBody = platform.body as Phaser.Physics.Arcade.Body;

    if (playerBody.touching.down && platformBody.touching.up) {
        playerBody.setVelocityX(platformBody.velocity.x);
    }
}

function preload(this: Phaser.Scene) {
    this.load.image('background', 'assets/backgrounds/' + nivel1!.background + '.png');
    this.load.image('hero_walk_01', 'assets/hero_walk_01.png');
    this.load.image('hero_stop_01', 'assets/hero_stop_01.png');
    this.load.image('hero_walk_03', 'assets/hero_walk_03.png');
    this.load.image('platform', 'assets/grass.png');
    this.load.image('movingPlatform', 'assets/moving-platform.png');
    this.load.image('starGold', 'assets/starGold.png');
    this.load.image('heroJump', 'assets/hero_jump.png');
    this.load.spritesheet('fire', 'assets/fire_sprite.png', {
        frameWidth: 105,
        frameHeight: 105,
    });
}

function create(this: Phaser.Scene) {
    // Configurar el mundo del juego
    GAME_CONSTANTS.worldHeight = this.sys.game.canvas.height;
    this.physics.world.setBounds(0, 0, GAME_CONSTANTS.worldWidth, GAME_CONSTANTS.worldHeight);

    // Agregar fondo que se repite horizontalmente
    const backgroundImage = this.textures.get('background');
    const backgroundHeight = backgroundImage.getSourceImage().height;

    const backgroundTileSprite = this.add.tileSprite(0, 0, GAME_CONSTANTS.worldWidth, GAME_CONSTANTS.worldHeight, 'background');
    backgroundTileSprite.setOrigin(0, 0);
    backgroundTileSprite.setScale(GAME_CONSTANTS.worldHeight / backgroundHeight);

    backgroundTileSprite.texture.setFilter(Phaser.Textures.NEAREST);

    this.data.set('background', backgroundTileSprite);

    // Crear plataformas
    const platforms = this.physics.add.staticGroup();

    nivel1!.platforms.forEach((platform) => {
        const platformWidth = platform.width * GAME_CONSTANTS.boxSize;
        const platformHeight = GAME_CONSTANTS.boxSize;
        const x = (platform.x + platform.width / 2) * GAME_CONSTANTS.boxSize;
        const y = GAME_CONSTANTS.worldHeight - (platform.y + 1 / 2) * GAME_CONSTANTS.boxSize;

        const platformSprite = this.add.tileSprite(x, y, platformWidth, platformHeight, 'platform');
        //platformSprite.setOrigin(0.5, 0.5);

        platforms.add(platformSprite);

        const platformBody = platformSprite.body as Phaser.Physics.Arcade.StaticBody;
        platformBody.setSize(platformWidth, platformHeight);
        platformBody.updateFromGameObject();
    });

    // Create health bar
    const healthBar = this.add.group();
    for (let i = 0; i < 5; i++) {
        const slot = this.add.rectangle(10 + i * 30, 10, 25, 25, 0x00ff00);
        slot.setScrollFactor(0); // Keep it fixed on screen
        healthBar.add(slot);
    }
    this.data.set('healthBar', healthBar);
    this.data.set('playerData', { health: 5, lastDamageTime: 0 });

    // Crear jugador con textura
    const player = this.physics.add.sprite(nivel1!.hero.x * GAME_CONSTANTS.boxSize, GAME_CONSTANTS.worldHeight - nivel1!.hero.y * GAME_CONSTANTS.boxSize, 'hero_stop_01');
    player.setDisplaySize(GAME_CONSTANTS.boxSize * 1.5, GAME_CONSTANTS.boxSize * 1.5);
    player.texture.setFilter(Phaser.Textures.NEAREST);

    // Create walking animation
    this.anims.create({
        key: 'walk',
        frames: [{ key: 'hero_stop_01' }, { key: 'hero_walk_01' }, { key: 'hero_stop_01' }, { key: 'hero_walk_03' }],
        frameRate: 8,
        repeat: -1,
    });
    this.anims.create({
        key: 'fire',
        frames: this.anims.generateFrameNumbers('fire', { start: 0, end: 15 }),
        frameRate: 12,
        repeat: -1,
    });

    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    playerBody.setBounce(0.2);
    playerBody.setCollideWorldBounds(true);

    // Agregar colisiones
    this.physics.add.collider(player, platforms);

    // Crear enemigos
    const enemies = this.physics.add.staticGroup();
    nivel1!.fire.forEach((enemy: Fire) => {
        let enemySprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;

        enemySprite = this.add.sprite(enemy.x * GAME_CONSTANTS.boxSize, GAME_CONSTANTS.worldHeight - GAME_CONSTANTS.boxSize / 2 - GAME_CONSTANTS.boxSize, 'fire');
        enemySprite.setDisplaySize(GAME_CONSTANTS.boxSize, GAME_CONSTANTS.boxSize);
        enemySprite.play('fire');

        enemies.add(enemySprite);
    });

    // Crear coleccionables
    const collectibles = this.physics.add.staticGroup();
    nivel1!.stars.forEach((collectible: Collectible) => {
        const collectibleSprite = this.add.sprite(collectible.x * GAME_CONSTANTS.boxSize, GAME_CONSTANTS.worldHeight - collectible.y * GAME_CONSTANTS.boxSize - GAME_CONSTANTS.boxSize / 2, 'starGold');
        collectibleSprite.setDisplaySize(GAME_CONSTANTS.boxSize, GAME_CONSTANTS.boxSize);
        collectibles.add(collectibleSprite);
    });

    // Crear obstáculos
    const obstacles = this.physics.add.staticGroup();
    const movingPlatforms = this.physics.add.group();

    // Configurar la cámara para seguir al jugador
    this.cameras.main.setBounds(0, 0, GAME_CONSTANTS.worldWidth, GAME_CONSTANTS.worldHeight);
    this.cameras.main.startFollow(player, true, 0.05, 0.05);

    // Agregar colisiones adicionales
    this.physics.add.collider(enemies, platforms);
    this.physics.add.collider(player, obstacles);
    this.physics.add.collider(player, movingPlatforms, handleMovingPlatformCollision as any, undefined, this);
    this.physics.add.overlap(player, collectibles, collectItem as any, undefined, this);
    this.physics.add.overlap(player, enemies, handleFireDamage as any, undefined, this);

    // Guardar referencias para usar en update
    this.data.set('player', player);
    this.data.set('cursors', this.input.keyboard?.createCursorKeys());
    this.data.set('enemies', enemies);
    this.data.set('collectibles', collectibles);
    this.data.set('obstacles', obstacles);
    this.data.set('movingPlatforms', movingPlatforms);
}

function update(this: Phaser.Scene) {
    const player = this.data.get('player') as Phaser.Physics.Arcade.Sprite;
    const cursors = this.data.get('cursors') as Phaser.Types.Input.Keyboard.CursorKeys;
    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    const movingPlatforms = this.data.get('movingPlatforms') as Phaser.Physics.Arcade.Group;
    const background = this.data.get('background') as Phaser.GameObjects.TileSprite;

    // Update background position based on camera movement
    background.tilePositionX = this.cameras.main.scrollX * 0.6;

    // Check if player is in the air
    const isInAir = !playerBody.touching.down;

    // Player movement
    if (cursors.left.isDown) {
        playerBody.setVelocityX(-460);
        player.setFlipX(true);
        if (!isInAir) {
            player.play('walk', true);
        }
    } else if (cursors.right.isDown) {
        playerBody.setVelocityX(460);
        player.setFlipX(false);
        if (!isInAir) {
            player.play('walk', true);
        }
    } else {
        let onMovingPlatform = false;
        movingPlatforms.children.entries.forEach((platform: Phaser.GameObjects.GameObject) => {
            const platformBody = platform.body as Phaser.Physics.Arcade.Body;
            if (playerBody.touching.down && platformBody.touching.up) {
                playerBody.setVelocityX(platformBody.velocity.x);
                onMovingPlatform = true;
            }
        });

        if (!onMovingPlatform) {
            playerBody.setVelocityX(0);
        }

        if (!isInAir) {
            player.stop();
            player.setTexture('hero_stop_01');
        }
    }

    // Jumping
    if ((cursors.up.isDown || cursors.space?.isDown) && playerBody.touching.down) {
        playerBody.setVelocityY(-1200);
    }

    // Set jump texture while in air
    if (isInAir) {
        player.setTexture('heroJump');
    }

    // Fast fall with down arrow
    if (cursors.down.isDown && !playerBody.touching.down) {
        playerBody.setVelocityY(1500);
    }

    // Update enemy positions if necessary
    const enemies = this.data.get('enemies') as Phaser.Physics.Arcade.Group;
    enemies.children.entries.forEach((enemy: Phaser.GameObjects.GameObject) => {
        const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;
        // Add additional logic for enemy movement if needed
    });
}

let nivel1: GameLevel | null = null;
@Component({
    selector: 'app-game',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="helpers-ui">
            <span>Vidas: {{ gameService.heroLife() }}</span>
        </div>
        <div id="gameContainer"></div>
    `,
    styles: [
        `
            #gameContainer {
                width: 100vw;
                height: 100vh;
                margin: 0;
                padding: 0;
            }
            :host {
                display: block;
                width: 100vw;
                height: 100vh;
                overflow: hidden;
            }
            .helpers-ui {
                position: absolute;
                top: 0;
                right: 0;
                z-index: 10;
            }
        `,
    ],
})
export class GameComponent implements OnInit {
    game!: Phaser.Game;
    readonly gameService = inject(GameService);
    private router = inject(Router);

    constructor() {
        GLOBAL_SERVICES = this.gameService;
    }

    ngOnInit() {
        const level = this.gameService.currentLevel() ?? (JSON.parse(localStorage.getItem('currentLevel') ?? 'null') as LevelData | null)

        if (!level) {
            this.router.navigate(['/']);
            return;
        }

        localStorage.setItem('currentLevel', JSON.stringify(level));

        nivel1 = {
            background: level.background,
            fire: level.fire,
            hero: level.hero!,
            name: level.name,
            platforms: level.platforms,
            stars: level.stars,
        };

        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'gameContainer',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 2000, x: 0 },
                    debug: false, // Set to true for debugging
                },
            },
            render: {
                pixelArt: true,
            },
            scene: {
                preload: preload,
                create: create,
                update: update,
            },
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
        });
    }
    ngOnDestroy() {
        localStorage.removeItem('currentLevel');
    }
}
