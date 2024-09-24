// src/app/game.component.ts

import { Component, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Phaser from 'phaser';

@Component({
    selector: 'app-game',
    standalone: true,
    imports: [CommonModule],
    template: '<div id="gameContainer"></div>',
    styles: ['#gameContainer { width: 800px; height: 600px; }']
})
export class GameComponent implements OnInit {
    constructor(private el: ElementRef) { }

    ngOnInit() {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: 'gameContainer',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 300, x: 0 },
                    debug: false
                }
            },
            scene: {
                preload: this.preload,
                create: this.create,
                update: this.update
            }
        };

        new Phaser.Game(config);
    }

    preload(this: Phaser.Scene) {
        // No necesitamos precargar nada para este juego simple
    }

    create(this: Phaser.Scene) {
        const platform = this.add.rectangle(400, 550, 800, 40, 0x00ff00);
        this.physics.add.existing(platform, true);

        const player = this.add.rectangle(400, 300, 50, 50, 0xff0000);
        this.physics.add.existing(player);

        const playerBody = player.body as Phaser.Physics.Arcade.Body;
        playerBody.setBounce(0.2);
        playerBody.setCollideWorldBounds(true);

        this.physics.add.collider(player, platform);

        this.add.existing(player);

        // Guardar referencias para usar en update
        this.data.set('player', player);
        this.data.set('cursors', this.input.keyboard?.createCursorKeys());
    }

    update(this: Phaser.Scene) {
        const player = this.data.get('player') as Phaser.GameObjects.Rectangle;
        const cursors = this.data.get('cursors') as Phaser.Types.Input.Keyboard.CursorKeys;
        const playerBody = player.body as Phaser.Physics.Arcade.Body;

        if (cursors.left.isDown) {
            playerBody.setVelocityX(-160);
        } else if (cursors.right.isDown) {
            playerBody.setVelocityX(160);
        } else {
            playerBody.setVelocityX(0);
        }

        if (cursors.up.isDown && playerBody.touching.down) {
            playerBody.setVelocityY(-330);
        }
    }
}
