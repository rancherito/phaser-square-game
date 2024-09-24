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
                    debug: false // Set to true for debugging
                }
            },
            render: {
                pixelArt: true
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
        this.load.image('player', 'assets/' + nivel1.player.texture + '.png');
        this.load.image('platform', 'assets/grass.png');
        this.load.image('movingPlatform', 'assets/moving-platform.png');
        this.load.image('starGold', 'assets/starGold.png');
    }

    create(this: Phaser.Scene) {
        // Configurar el mundo del juego
        GAME_CONSTANTS.worldHeight = this.sys.game.canvas.height;
        this.physics.world.setBounds(0, 0, GAME_CONSTANTS.worldWidth, GAME_CONSTANTS.worldHeight);

        // Agregar fondo que se repite horizontalmente
        const backgroundImage = this.textures.get('background');
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

        backgroundTileSprite.texture.setFilter(Phaser.Textures.NEAREST);

        this.data.set('background', backgroundTileSprite);

        // Crear plataformas
        const platforms = this.physics.add.staticGroup();

        nivel1.platforms.forEach(platform => {
            const platformWidth = platform.width * GAME_CONSTANTS.boxSize;
            const platformHeight = platform.height * GAME_CONSTANTS.boxSize;
            const x = (platform.x + platform.width / 2) * GAME_CONSTANTS.boxSize;
            const y = GAME_CONSTANTS.worldHeight - (platform.y + platform.height / 2) * GAME_CONSTANTS.boxSize;

            const platformSprite = this.add.tileSprite(x, y, platformWidth, platformHeight, 'platform');
            platformSprite.setOrigin(0.5, 0.5);

            platforms.add(platformSprite);

            const platformBody = platformSprite.body as Phaser.Physics.Arcade.StaticBody;
            platformBody.setSize(platformWidth, platformHeight);
            platformBody.updateFromGameObject();
        });

        // Crear jugador con textura
        const player = this.physics.add.sprite(
            nivel1.player.x * GAME_CONSTANTS.boxSize,
            GAME_CONSTANTS.worldHeight - nivel1.player.y * GAME_CONSTANTS.boxSize,
            'player'
        );
        player.setDisplaySize(GAME_CONSTANTS.boxSize * 1.5, GAME_CONSTANTS.boxSize * 2);
        player.texture.setFilter(Phaser.Textures.NEAREST);

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

            const enemyBody = enemySprite.body as Phaser.Physics.Arcade.Body;
            if (enemy.type === 'jumper') {
                enemyBody.setCollideWorldBounds(true);
                if (enemy.patrolDistance) {
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
            const collectibleSprite = this.add.sprite(
                collectible.x * GAME_CONSTANTS.boxSize,
                GAME_CONSTANTS.worldHeight - collectible.y * GAME_CONSTANTS.boxSize,
                'starGold'
            );
            collectibleSprite.setDisplaySize(GAME_CONSTANTS.boxSize, GAME_CONSTANTS.boxSize);
            collectibles.add(collectibleSprite);

        });

        // Crear obstáculos
        const obstacles = this.physics.add.staticGroup();
        const movingPlatforms = this.physics.add.group();
        nivel1.obstacles.forEach((obstacle: Obstacle) => {
            if (obstacle.type === 'movingPlatform'){
                const x = (obstacle.x + obstacle.width / 2) * GAME_CONSTANTS.boxSize;
                const y = GAME_CONSTANTS.worldHeight - (obstacle.y + 0.5) * GAME_CONSTANTS.boxSize;
                const width = obstacle.width * GAME_CONSTANTS.boxSize;
                const height = GAME_CONSTANTS.boxSize;

                const obstacleSprite = this.add.tileSprite(x, y, width, height, 'movingPlatform');
                obstacleSprite.setOrigin(0.5, 0.5);
                movingPlatforms.add(obstacleSprite);

                const obstacleBody = obstacleSprite.body as Phaser.Physics.Arcade.Body;
                obstacleBody.setSize(width, height);
                obstacleBody.setImmovable(true);
                obstacleBody.setAllowGravity(false);

                this.tweens.add({
                    targets: obstacleSprite,
                    y: `-=${obstacle.patrolDistance! * GAME_CONSTANTS.boxSize}`,
                    duration: 2000,
                    ease: 'Linear',
                    yoyo: true,
                    repeat: -1
                });
            }
            else{
                const x = (obstacle.x + obstacle.width / 2) * GAME_CONSTANTS.boxSize;
                const y = GAME_CONSTANTS.worldHeight - (obstacle.y + 0.5) * GAME_CONSTANTS.boxSize;
                const width = obstacle.width * GAME_CONSTANTS.boxSize;
                const height = GAME_CONSTANTS.boxSize;

                const obstacleSprite = this.add.rectangle(x, y, width, height, 0x808080);
                obstacles.add(obstacleSprite);

                const obstacleBody = obstacleSprite.body as Phaser.Physics.Arcade.StaticBody;
                obstacleBody.setSize(width, height);
                obstacleBody.updateFromGameObject();
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
        const player = this.data.get('player') as Phaser.Physics.Arcade.Sprite;
        const cursors = this.data.get('cursors') as Phaser.Types.Input.Keyboard.CursorKeys;
        const playerBody = player.body as Phaser.Physics.Arcade.Body;
        const movingPlatforms = this.data.get('movingPlatforms') as Phaser.Physics.Arcade.Group;
        const background = this.data.get('background') as Phaser.GameObjects.TileSprite;

        // Update background position based on camera movement
        background.tilePositionX = this.cameras.main.scrollX * 0.6;

        // Movimiento del jugador
        if (cursors.left.isDown) {
            playerBody.setVelocityX(-460);
            player.setFlipX(true);
        } else if (cursors.right.isDown) {
            playerBody.setVelocityX(460);
            player.setFlipX(false);
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
        }

        // Salto con la flecha arriba o la barra espaciadora
        if ((cursors.up.isDown || cursors.space?.isDown) && playerBody.touching.down) {
            playerBody.setVelocityY(-1200);
        }

        // Caída rápida con la flecha abajo
        if (cursors.down.isDown && !playerBody.touching.down) {
            playerBody.setVelocityY(1500);
        }

        // Actualizar la posición de los enemigos si es necesario
        const enemies = this.data.get('enemies') as Phaser.Physics.Arcade.Group;
        enemies.children.entries.forEach((enemy: Phaser.GameObjects.GameObject) => {
            const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;
            // Aquí puedes agregar lógica adicional para el movimiento de los enemigos si es necesario
        });
    }
}