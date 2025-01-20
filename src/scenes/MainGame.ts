import { Scene } from 'phaser';
import {
  points,
  delaunay,
  map,
  voronoi,
  calculatePolygonData,
  polygonData,
} from '../helpers/polygons';
import sprSand from '../content/sprSand.png';
import adventurer from '../content/adventurer.webp';
import sprGrass from '../content/sprGrass.png';
import { randomWalkGen } from '../helpers/domains';

export class MainGame extends Scene {
  resolution: number = 1000;
  indices: integer[];

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
    this.load.image("sprGrass", sprGrass);

    this.indices = randomWalkGen()
    console.log(this.indices)
  }

  create() {
    //#region Animations
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
    //#endregion

    const startingCoords = [300, 300]
    this.cameraSpeed = 10;
    this.mapSize = 3000;
    this.cameras.main.setZoom(1);
    this.followPoint = new Phaser.Math.Vector2(
      startingCoords[0], startingCoords[1]
    )
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.player = this.add.sprite(startingCoords[0], startingCoords[1], 'adventurer');
    this.player.setDepth(10);
    this.player.setScale(0.3); // Adjust player size to fit screen

    let graphics = this.add.graphics();
    const res = this.resolution;

    // for placing any kind of sprite
    const placeSprite = (spr: spr, sprKey: string) => {
      this.add.sprite(spr.x * res, spr.y * res, sprKey);
    }


    let voronoiPolygons = voronoi.cellPolygons();
    calculatePolygonData(voronoiPolygons);
    console.log("polygon Data: ", polygonData, voronoiPolygons);

    function drawVoronoiPolygons(polygons: ReturnType<typeof voronoi.cellPolygons>, graphics: Phaser.GameObjects.Graphics) {
      graphics.lineStyle(1, 0x0000FF, 1.0);
      console.log(polygonData)
      for (const singlePolygon of polygonData) {
        const i = singlePolygon.reducedVertices
        graphics.beginPath();
        console.log(i);
        graphics.moveTo(i[0].x * res, i[0].y * res);
        for (const j of i) {
          graphics.lineTo(j.x * res, j.y * res);
        }
        graphics.closePath();
        graphics.strokePath();
      }
    }

    drawVoronoiPolygons(voronoiPolygons, graphics);

    interface spr {
      x: number;
      y: number;
    }

    const placeSandSprites = () => {
      for (let i of this.indices) {
        let spr: spr = {
          x: points[i].x,
          y: points[i].y
        }
        placeSprite(spr, "sprSand")
      }
    }

    placeSandSprites()

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
    let cell = this.getNearestCell(this.player.x, this.player.y);
    if (this.indices.includes(cell)) {
      this.add.sprite(points[cell].x * this.resolution, points[cell].y * this.resolution, 'sprGrass');
    }
  }

  getNearestCell(x: number, y: number) {
    console.log(delaunay.find(x / this.resolution, y / this.resolution));
    return delaunay.find(x / this.resolution, y / this.resolution);
  }
}
