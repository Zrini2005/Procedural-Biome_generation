import { Scene } from 'phaser';
import {
  map,
  points,
  delaunay,
  nextHalfedge,
  edgesAroundPoint,
  triangleOfEdge
} from '../helpers/polygons';
import sprSand from '../content/sprSand.png';
import adventurer from '../content/adventurer.webp';

export class MainGame extends Scene {

  cameraSpeed: integer;
  mapSize: integer;
  followPoint: Phaser.Math.Vector2;
  keyW!: Phaser.Input.Keyboard.Key;
  keyA!: Phaser.Input.Keyboard.Key;
  keyS!: Phaser.Input.Keyboard.Key;
  keyD!: Phaser.Input.Keyboard.Key;
  player: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: "MainGame" });
  }

  preload() {
    this.load.spritesheet('adventurer', adventurer, {
      frameWidth: 256, // Width of a single frame
      frameHeight: 256, // Height of a single frame
    });
    this.load.image("sprSand", sprSand);

  }

  create() {
    this.anims.create({
      key: 'walk-up',
      frames: this.anims.generateFrameNumbers('adventurer', { start: 0, end: 15, first: 0 }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('adventurer', { start: 16, end: 31 }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNumbers('adventurer', { start: 32, end: 47 }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: 'walk-down',
      frames: this.anims.generateFrameNumbers('adventurer', { start: 64, end: 79 }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('adventurer', { start: 48, end: 63 }),
      frameRate: 20,
      repeat: -1,
    });
    this.anims.create({
      key: 'walk-up',
      frames: this.anims.generateFrameNumbers('adventurer', { start: 0, end: 15, first: 0 }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('adventurer', { start: 16, end: 31 }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNumbers('adventurer', { start: 32, end: 47 }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: 'walk-down',
      frames: this.anims.generateFrameNumbers('adventurer', { start: 64, end: 79 }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('adventurer', { start: 48, end: 63 }),
      frameRate: 20,
      repeat: -1,
    });

    this.cameraSpeed = 10;
    this.mapSize = 3000;
    this.cameras.main.setZoom(1);
    this.followPoint = new Phaser.Math.Vector2(
      0, 0
    )

    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.player = this.add.sprite(300, 400, 'adventurer');
    this.player.setDepth(10);
    this.player.setScale(0.3); // Adjust player size to fit screen

    let graphics = this.add.graphics();
    const res = 100;

   
    function drawCellColors(graphics:Phaser.GameObjects.Graphics, voronoiMap: typeof map) {
      const { triangles, numEdges, centers } = voronoiMap;
      let seen = new Set();  // of region ids
      // console.log(numEdges, triangles, centers)
      graphics.lineStyle(1, 0xFF5733, 1.0);
      for (let i = 0; i < numEdges; i++) {
        const r = triangles[nextHalfedge(i)];
        if (!seen.has(r)) {
          seen.add(r);
          let vertices = edgesAroundPoint(delaunay, i).map(i => centers[triangleOfEdge(i)]);
          graphics.beginPath();
          graphics.moveTo(vertices[0].x * res, vertices[0].y * res);
          for (let j = 1; j < vertices.length; j++) {
            graphics.lineTo(vertices[j].x * res, vertices[j].y * res);
          }
          graphics.closePath();
          graphics.strokePath();
        }
      }
    }

    drawCellColors(graphics, map);

    interface spr {
      x: number;
      y: number;
    }

    const placeSprite = (spr:spr) => {
      this.add.sprite(spr.x * res, spr.y * res, "sprSand");
    }

    function placeSprites(voronoiMap: typeof map) {
      const { points } = voronoiMap;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        let spr : spr = {
          x: p.x,
          y: p.y
        }
        placeSprite(spr)
      }
    }

    placeSprites(map)
  }

  update() {
    if (this.keyW.isDown) {
      this.followPoint.y -= this.cameraSpeed;
      this.player.play('walk-up', true);
    } else if (this.keyS.isDown) {
      this.followPoint.y += this.cameraSpeed;
      this.player.play('walk-down', true);
    } else if (this.keyA.isDown) {
      this.followPoint.x -= this.cameraSpeed;
      this.player.play('walk-left', true);
    } else if (this.keyD.isDown) {
      this.followPoint.x += this.cameraSpeed;
      this.player.play('walk-right', true);
    } else {
      this.player.play('idle', true);
    }

    this.cameras.main.centerOn(this.followPoint.x, this.followPoint.y);
    this.player.x = this.followPoint.x;
    this.player.y = this.followPoint.y;
  }
}
