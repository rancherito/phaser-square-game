import { Component, OnInit, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Phaser from 'phaser';
import { Cell, Collectible, GameLevel, LevelData } from '../services/types';
import { GameService } from '../services/game.service';
import { Router } from '@angular/router';
const GAME_CONSTANTS = {
    boxSize: 60,
    worldWidth: 1200 * 60, // 200 cajas de ancho
    worldHeight: 0, // Se establecerá dinámicamente
};

let GLOBAL_SERVICES: GameService | null = null;

function handleFireDamage(player: Phaser.Physics.Arcade.Sprite, fire: Phaser.GameObjects.GameObject) {
    const scene = player.scene;
    const playerData = scene.data.get('playerData') as { health: number; lastDamageTime: number };
    const currentTime = scene.time.now;

    if (currentTime - playerData.lastDamageTime >= 2000) {
        // 2 seconds cooldown
        playerData.health = Math.max(0, playerData.health - 1);
        playerData.lastDamageTime = currentTime;
        GLOBAL_SERVICES?.heroLife.set(playerData.health);

        if (playerData.health <= 0) {
            // Game over logic here
            window.location.href = '/?state=1';
        }
    }
}

function handleFlagCollision(player: Phaser.Physics.Arcade.Sprite, flag: Phaser.Physics.Arcade.Sprite) {
    window.location.href = '/?state=2';
}


function handleMovingPlatformCollision(player: Phaser.GameObjects.GameObject, platform: Phaser.GameObjects.GameObject) {
    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    const platformBody = platform.body as Phaser.Physics.Arcade.Body;

    if (playerBody.touching.down && platformBody.touching.up) {
        playerBody.setVelocityX(platformBody.velocity.x);
    }
}

function preload(this: Phaser.Scene) {
    this.load.image('background', 'assets/backgrounds/' + gameLevel!.background + '.png');
    this.load.image('hero_walk_01', 'assets/hero_walk_01.png');
    this.load.image('hero_stop_01', 'assets/hero_stop_01.png');
    this.load.image('hero_walk_03', 'assets/hero_walk_03.png');
    this.load.image('platform', 'assets/grass.png');
    this.load.image('movingPlatform', 'assets/moving-platform.png');
    this.load.image('starGold', 'assets/starGold.png');
    this.load.image('heroJump', 'assets/hero_jump.png');
    this.load.image('flag', 'assets/flag.png');
    this.load.spritesheet('fire', 'assets/fire_sprite.png', {
        frameWidth: 105,
        frameHeight: 105,
    });
}

let xPositionFallinFire = 0;

function spawnFallingFire(this: Phaser.Scene) {
    const fallingFire = this.data.get('fallingFire') as Phaser.Physics.Arcade.Group;
    const x = xPositionFallinFire * GAME_CONSTANTS.boxSize + GAME_CONSTANTS.boxSize / 2;

    const fire = fallingFire.create(x, 2 * GAME_CONSTANTS.boxSize, 'fire') as Phaser.Physics.Arcade.Sprite;
    fire.setDisplaySize(GAME_CONSTANTS.boxSize, GAME_CONSTANTS.boxSize);
    fire.play('fire');

    const fireBody = fire.body as Phaser.Physics.Arcade.Body;
    fireBody.setGravityY(2000);
    fireBody.setSize(GAME_CONSTANTS.boxSize, GAME_CONSTANTS.boxSize);
    fireBody.setAllowGravity(true);
    xPositionFallinFire = (xPositionFallinFire + 1) % (GAME_CONSTANTS.worldWidth / GAME_CONSTANTS.boxSize);
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

    gameLevel!.platforms.forEach((platform) => {
        const platformWidth = platform.width * GAME_CONSTANTS.boxSize;
        const platformHeight = GAME_CONSTANTS.boxSize;
        const x = (platform.x + platform.width / 2) * GAME_CONSTANTS.boxSize;
        const y = GAME_CONSTANTS.worldHeight - (platform.y + 1 / 2) * GAME_CONSTANTS.boxSize;

        const platformSprite = this.add.tileSprite(x, y, platformWidth, platformHeight, 'platform');
        platforms.add(platformSprite);

        const platformBody = platformSprite.body as Phaser.Physics.Arcade.StaticBody;
        platformBody.setSize(platformWidth, platformHeight);
        platformBody.updateFromGameObject();
    });

    this.data.set('playerData', { health: GLOBAL_SERVICES!.maxLife, lastDamageTime: 0 });

    // Crear jugador con textura
    const player = this.physics.add.sprite(gameLevel!.hero.x * GAME_CONSTANTS.boxSize, GAME_CONSTANTS.worldHeight - gameLevel!.hero.y * GAME_CONSTANTS.boxSize, 'hero_stop_01');
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

    if (gameLevel?.flag) {
        const flag = this.physics.add.sprite(gameLevel.flag.x * GAME_CONSTANTS.boxSize, GAME_CONSTANTS.worldHeight - gameLevel.flag.y * GAME_CONSTANTS.boxSize, 'flag');
        flag.setDisplaySize(GAME_CONSTANTS.boxSize, GAME_CONSTANTS.boxSize * 1.5);
        this.data.set('flag', flag);

        // Agregar colisión entre el jugador y la bandera
        this.physics.add.overlap(player, flag, handleFlagCollision as any, undefined, this);
    }

    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    playerBody.setCollideWorldBounds(true);

    // Agregar colisiones
    this.physics.add.collider(player, platforms);

    // Crear enemigos
    const enemies = this.physics.add.staticGroup();
    gameLevel!.fire.forEach((enemy: Cell) => {
        let enemySprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;

        enemySprite = this.add.sprite(enemy.x * GAME_CONSTANTS.boxSize, GAME_CONSTANTS.worldHeight - GAME_CONSTANTS.boxSize / 2 - GAME_CONSTANTS.boxSize, 'fire');
        enemySprite.setDisplaySize(GAME_CONSTANTS.boxSize, GAME_CONSTANTS.boxSize);
        enemySprite.play('fire');

        enemies.add(enemySprite);
    });

    // Crear coleccionables
    const collectibles = this.physics.add.staticGroup();
    gameLevel!.stars.forEach((collectible: Collectible) => {
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

    const collectItem = (player: Phaser.GameObjects.GameObject, item: Phaser.GameObjects.GameObject) => {
        (item as Phaser.GameObjects.Rectangle).setVisible(false);
        (item.body as Phaser.Physics.Arcade.StaticBody).enable = false;
        //this.showModal = true;
        this.game.scene.pause(this.scene.key);
        GLOBAL_SERVICES?.gameComponent()?.showModal.set(true);
    };

    // Agregar colisiones adicionales
    this.physics.add.collider(enemies, platforms);
    this.physics.add.collider(player, obstacles);
    this.physics.add.collider(player, movingPlatforms, handleMovingPlatformCollision as any, undefined, this);
    this.physics.add.overlap(player, collectibles, collectItem as any, undefined, this);
    this.physics.add.overlap(player, enemies, handleFireDamage as any, undefined, this);

    // Create a group for falling fire
    const fallingFire = this.physics.add.group();
    this.data.set('fallingFire', fallingFire);

    // Set up timer for spawning falling fire
    this.time.delayedCall(2000, () => {
        this.time.addEvent({
            delay: 200,
            callback: spawnFallingFire,
            callbackScope: this,
            loop: true,
        });
    });

    // Add collision between falling fire and platforms
    this.physics.add.collider(fallingFire, platforms);

    // Add collision between player and falling fire
    this.physics.add.overlap(player, fallingFire, handleFireDamage as any, undefined, this);

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
    const fallingFire = this.data.get('fallingFire') as Phaser.Physics.Arcade.Group;
    // Update background position based on camera movement
    background.tilePositionX = this.cameras.main.scrollX * 0.6;

    // Check if player is in the air
    const isInAir = !playerBody.touching.down;
    const isOnFire = fallingFire.children.entries.some((fire: Phaser.GameObjects.GameObject) => {
        const fireBody = fire.body as Phaser.Physics.Arcade.Body;
        return playerBody.bottom === fireBody.top && playerBody.right > fireBody.left && playerBody.left < fireBody.right;
    });

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

    if ((cursors.up.isDown || cursors.space?.isDown) && playerBody.touching.down && !isOnFire) {
        playerBody.setVelocityY(-1200);
    }

    // Update enemy positions if necessary
    const enemies = this.data.get('enemies') as Phaser.Physics.Arcade.Group;
    enemies.children.entries.forEach((enemy: Phaser.GameObjects.GameObject) => {
        const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;
        // Add additional logic for enemy movement if needed
    });

    // Update falling fire
    fallingFire.children.entries.forEach((fire: Phaser.GameObjects.GameObject) => {
        const fireBody = fire.body as Phaser.Physics.Arcade.Body;
        if (fireBody.y > GAME_CONSTANTS.worldHeight) {
            fallingFire.remove(fire, true, true);
        }
    });
}

let gameLevel: GameLevel | null = null;
@Component({
    selector: 'app-game',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="helpers-ui">
            @for (item of this.gameService.stateLife(); track $index) {
                @if (item === 1) {
                    <img class="heart-alive" src="/assets/heart.svg" />
                } @else {
                    <img src="/assets/heart-dead.svg" />
                }
            }
        </div>
        <div id="gameContainer"></div>
        @if (showModal()) {
            <div class="modal">
                <div class="modal-content">
                    <h2>¡Has recogido una estrella!</h2>
                    <button (click)="closeModal()">Aceptar</button>
                </div>
            </div>
        }
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
                display: flex;
                gap: 0.5rem;
            }
            img {
                width: 50x;
                height: 50px;
            }
            //animate heart-alive rotate infinite
            .heart-alive {
                animation: rotate 4s infinite linear;
            }
            @keyframes rotate {
                from {
                    transform: rotateY(0deg);
                }
                to {
                    transform: rotateY(360deg);
                }
            }
            .modal {
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .modal-content {
                background-color: white;
                padding: 20px;
                border-radius: 5px;
                text-align: center;
            }
            button {
                margin-top: 10px;
                padding: 5px 10px;
                cursor: pointer;
            }
        `,
    ],
})
export class GameComponent implements OnInit {
    game!: Phaser.Game;
    readonly gameService = inject(GameService);
    private router = inject(Router);
    showModal = signal<boolean>(false);
    constructor() {
        GLOBAL_SERVICES = this.gameService;
        this.gameService.gameComponent.set(this);
    }

    ngOnInit() {
        this.gameService.playMusic('assets/sounds/scape_2.mp3');
        const level = this.gameService.currentLevel() ?? (JSON.parse(localStorage.getItem('currentLevel') ?? 'null') as LevelData | null);

        if (!level) {
            this.router.navigate(['/']);
            return;
        }

        localStorage.setItem('currentLevel', JSON.stringify(level));

        gameLevel = {
            background: level.background,
            fire: level.fire,
            hero: level.hero!,
            name: level.name,
            platforms: level.platforms,
            stars: level.stars,
            flag: level.flag,
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
    closeModal() {
        this.showModal.set(false);
        const scene = this.game.scene.getScene('default')?.scene.key;
        if (scene) {
            this.game.scene.resume(scene);
        }
    }
}
