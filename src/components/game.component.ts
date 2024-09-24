import { Component, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Phaser from 'phaser';
import { GAME_CONSTANTS, nivel1 } from './levels';
import { Enemy, Collectible, Obstacle } from './types';

function collectItem(player: Phaser.GameObjects.GameObject, item: Phaser.GameObjects.GameObject) {
    (item as Phaser.GameObjects.Rectangle).setVisible(false);
    (item.body as Phaser.Physics.Arcade.StaticBody).enable = false;
}

function hitEnemy(player: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
    // Aquí puedes agregar lógica para manejar colisiones con enemigos
    // Por ejemplo, reducir la salud del jugador, reiniciar el nivel, etc.
}

function handleMovingPlatformCollision(player: Phaser.GameObjects.GameObject, platform: Phaser.GameObjects.GameObject) {
    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    const platformBody = platform.body as Phaser.Physics.Arcade.Body;

    if (playerBody.touching.down && platformBody.touching.up) {
        playerBody.setVelocityX(platformBody.velocity.x);
    }
}

@Component({
    selector: 'app-game',
    standalone: true,
    imports: [CommonModule],
    template: '<div id="gameContainer"></div>',
    styles: [`
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
    `]
})
export class GameComponent implements OnInit {
    game!: Phaser.Game;
    constructor(private el: ElementRef) { }

    ngOnInit() {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'gameContainer',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 2000, x: 0 },
                    debug: false
                }
            },
            scene: {
                preload: this.preload,
                create: this.create,
                update: this.update
            },
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };

        this.game = new Phaser.Game(config);
    }

    preload(this: Phaser.Scene) {
        this.load.image('background', 'assets/backgrounds/' + nivel1.background + '.png');
        // Aquí puedes cargar más assets si los necesitas para enemigos, coleccionables, etc.
    }

    create(this: Phaser.Scene) {
        // Configurar el mundo del juego
        GAME_CONSTANTS.worldHeight = this.sys.game.canvas.height;
        this.physics.world.setBounds(0, 0, GAME_CONSTANTS.worldWidth, GAME_CONSTANTS.worldHeight);

        // Agregar fondo que se repite horizontalmente
        const backgroundImage = this.textures.get('background');
        const backgroundWidth = backgroundImage.getSourceImage().width;
        const backgroundHeight = backgroundImage.getSourceImage().height;

        const backgroundTileSprite = this.add.tileSprite(
            0,
            0,
            GAME_CONSTANTS.worldWidth,
            GAME_CONSTANTS.worldHeight,
            'background'
        );
        backgroundTileSprite.setOrigin(0, 0);
        backgroundTileSprite.setScale(
            GAME_CONSTANTS.worldHeight / backgroundHeight
        );

        // Store the background in the scene's data for use in the update method
        this.data.set('background', backgroundTileSprite);

        // Crear plataformas
        const platforms = this.physics.add.staticGroup();
        nivel1.platforms.forEach(platform => {
            platforms.add(
                this.add.rectangle(
                    (platform.x + platform.width / 2) * GAME_CONSTANTS.boxSize,
                    GAME_CONSTANTS.worldHeight - (platform.y + platform.height / 2) * GAME_CONSTANTS.boxSize,
                    platform.width * GAME_CONSTANTS.boxSize,
                    platform.height * GAME_CONSTANTS.boxSize,
                    0x00ff00
                )
            );
        });

        // Crear jugador
        const player = this.add.rectangle(
            nivel1.player.x * GAME_CONSTANTS.boxSize,
            GAME_CONSTANTS.worldHeight - nivel1.player.y * GAME_CONSTANTS.boxSize,
            GAME_CONSTANTS.boxSize,
            GAME_CONSTANTS.boxSize,
            0xff0000
        );
        this.physics.add.existing(player);

        const playerBody = player.body as Phaser.Physics.Arcade.Body;
        playerBody.setBounce(0.2);
        playerBody.setCollideWorldBounds(true);

        // Agregar colisiones
        this.physics.add.collider(player, platforms);

        // Crear enemigos
        const enemies = this.physics.add.group();
        nivel1.enemies.forEach((enemy: Enemy) => {
            const enemySprite = this.add.rectangle(
                enemy.x * GAME_CONSTANTS.boxSize,
                GAME_CONSTANTS.worldHeight - enemy.y * GAME_CONSTANTS.boxSize,
                GAME_CONSTANTS.boxSize,
                GAME_CONSTANTS.boxSize,
                0xff00ff
            );
            this.physics.add.existing(enemySprite);
            enemies.add(enemySprite);

            // Configurar comportamiento del enemigo según su tipo
            const enemyBody = enemySprite.body as Phaser.Physics.Arcade.Body;
            if (enemy.type === 'basic' || enemy.type === 'jumper') {
                enemyBody.setCollideWorldBounds(true);
                if (enemy.type === 'basic' && enemy.patrolDistance) {
                    this.tweens.add({
                        targets: enemySprite,
                        x: (enemy.x + enemy.patrolDistance) * GAME_CONSTANTS.boxSize,
                        duration: 2000,
                        ease: 'Linear',
                        yoyo: true,
                        repeat: -1
                    });
                }
            } else if (enemy.type === 'flying') {
                enemyBody.setAllowGravity(false);
                if (enemy.patrolDistance) {
                    this.tweens.add({
                        targets: enemySprite,
                        y: `-=${enemy.patrolDistance * GAME_CONSTANTS.boxSize}`,
                        duration: 2000,
                        ease: 'Linear',
                        yoyo: true,
                        repeat: -1
                    });
                }
            }
        });

        // Crear coleccionables
        const collectibles = this.physics.add.staticGroup();
        nivel1.collectibles.forEach((collectible: Collectible) => {
            let color: number;
            switch (collectible.type) {
                case 'coin': color = 0xFFD700; break;
                case 'powerUp': color = 0x00FFFF; break;
                case 'healthPack': color = 0xFF69B4; break;
                default: color = 0xFFFFFF;
            }
            collectibles.add(
                this.add.circle(
                    collectible.x * GAME_CONSTANTS.boxSize,
                    GAME_CONSTANTS.worldHeight - collectible.y * GAME_CONSTANTS.boxSize,
                    GAME_CONSTANTS.boxSize / 4,
                    color
                )
            );
        });

        // Crear obstáculos
        const obstacles = this.physics.add.staticGroup();
        const movingPlatforms = this.physics.add.group();
        nivel1.obstacles.forEach((obstacle: Obstacle) => {
            let color: number;
            switch (obstacle.type) {
                case 'spikes': color = 0x808080; break;
                case 'lava': color = 0xFF4500; break;
                case 'movingPlatform': color = 0x8B4513; break;
                default: color = 0xFFFFFF;
            }
            const obstacleSprite = this.add.rectangle(
                (obstacle.x + obstacle.width / 2) * GAME_CONSTANTS.boxSize,
                GAME_CONSTANTS.worldHeight - obstacle.y * GAME_CONSTANTS.boxSize,
                obstacle.width * GAME_CONSTANTS.boxSize,
                GAME_CONSTANTS.boxSize / 2,
                color
            );

            if (obstacle.type === 'movingPlatform' && obstacle.patrolDistance) {
                this.physics.add.existing(obstacleSprite);
                movingPlatforms.add(obstacleSprite);
                const platformBody = obstacleSprite.body as Phaser.Physics.Arcade.Body;
                platformBody.setImmovable(true);
                platformBody.setAllowGravity(false);

                this.tweens.add({
                    targets: obstacleSprite,
                    y: `-=${obstacle.patrolDistance * GAME_CONSTANTS.boxSize}`,
                    duration: 2000,
                    ease: 'Linear',
                    yoyo: true,
                    repeat: -1
                });
            } else {
                obstacles.add(obstacleSprite);
            }
        });

        // Configurar la cámara para seguir al jugador
        this.cameras.main.setBounds(0, 0, GAME_CONSTANTS.worldWidth, GAME_CONSTANTS.worldHeight);
        this.cameras.main.startFollow(player, true, 0.05, 0.05);

        // Agregar colisiones adicionales
        this.physics.add.collider(enemies, platforms);
        this.physics.add.collider(player, obstacles);
        this.physics.add.collider(player, movingPlatforms, handleMovingPlatformCollision as any, undefined, this);
        this.physics.add.overlap(player, collectibles, collectItem as any, undefined, this);
        this.physics.add.collider(player, enemies, hitEnemy as any, undefined, this);

        // Guardar referencias para usar en update
        this.data.set('player', player);
        this.data.set('cursors', this.input.keyboard?.createCursorKeys());
        this.data.set('enemies', enemies);
        this.data.set('collectibles', collectibles);
        this.data.set('obstacles', obstacles);
        this.data.set('movingPlatforms', movingPlatforms);
    }

    update(this: Phaser.Scene) {
        const player = this.data.get('player') as Phaser.GameObjects.Rectangle;
        const cursors = this.data.get('cursors') as Phaser.Types.Input.Keyboard.CursorKeys;
        const playerBody = player.body as Phaser.Physics.Arcade.Body;
        const movingPlatforms = this.data.get('movingPlatforms') as Phaser.Physics.Arcade.Group;
        const background = this.data.get('background') as Phaser.GameObjects.TileSprite;

        // Update background position based on camera movement
        background.tilePositionX = this.cameras.main.scrollX * 0.6;

        // Movimiento del jugador
        if (cursors.left.isDown) {
            playerBody.setVelocityX(-460);
        } else if (cursors.right.isDown) {
            playerBody.setVelocityX(460);
        } else {
            // Si el jugador no está presionando teclas de movimiento, 
            // comprobamos si está sobre una plataforma móvil
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
        }

        // Salto con la flecha arriba o la barra espaciadora
        if ((cursors.up.isDown || cursors.space?.isDown) && playerBody.touching.down) {
            playerBody.setVelocityY(-1200);
        }

        // Caída rápida con la flecha abajo
        if (cursors.down.isDown && !playerBody.touching.down) {
            playerBody.setVelocityY(1500); // Aumenta la velocidad de caída
        }
    }
}