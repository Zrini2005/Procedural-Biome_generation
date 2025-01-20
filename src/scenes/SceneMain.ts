import Phaser from 'phaser';
import { Biome2 } from './biome2'; // Add this line to import Biome2
import { Biome1 } from './Entities'; // Add this line to import Biome1
import { calculatePolygonData, polygonData, voronoi } from '../helpers/polygons';
import sprSand from '../content/sprSand.png';
import adventurer from '../content/adventurer.webp';
import sprGrass from '../content/sprGrass.png';
import asset1 from '../content/asset1.png';
import asset2 from '../content/asset2.png';
import asset3 from '../content/asset3.png';
import sprNewTry from '../content/sprNewTry.png';
import sprWater from '../content/sprWater.png';
import smallHouse from '../content/smallHouse.png';
import dungeon from '../content/dungeon.png';
import mountain_landscape from '../content/mountain_landscape.png';
import icedLake from '../content/icedLake.png';
import tree1 from '../content/tree1.png';
import tree2 from '../content/tree2.png';
import tree3 from '../content/tree3.png';
import sprHighland from '../content/sprHighland.png';
import { randomWalkGen } from '../helpers/domains';



export class SceneMain extends Phaser.Scene {
    resolution: number = 1000;

    mapSize: number;
    chunkSize: number;
    tileSize: number;
    cameraSpeed: number;
    vertices: {
        index: number,
        polygonIndex: number,
        vertices: { x: number, y: number }[],
        reducedVertices: { x: number, y: number }[]
    }[];
    chunks: any[]; // Add this line to declare the chunks property
    followPoint: Phaser.Math.Vector2; // Declare followPoint property
    player: Phaser.GameObjects.Sprite; // Declare player property
    keyW: Phaser.Input.Keyboard.Key; // Declare keyW property
    keyS: Phaser.Input.Keyboard.Key; // Declare keyS property
    keyA: Phaser.Input.Keyboard.Key; // Declare keyA property
    keyD: Phaser.Input.Keyboard.Key; // Declare keyD property
    indices: integer[]; // Declare indices property

    constructor() {
        super({ key: "SceneMain" });

    }

    preload() {
        this.load.spritesheet("sprWater", sprWater, {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image("sprSand", sprSand);
        this.load.image("sprGrass", sprGrass);
        this.load.image("tree1", tree1);
        this.load.image("tree2", tree2);
        this.load.image("tree3", tree3);
        this.load.image("sprNewTry", sprHighland);
        this.load.image("smallHouse", smallHouse);
        this.load.image('dungeon', dungeon);
        this.load.image("bush", mountain_landscape);
        this.load.image("asset1", asset1);
        this.load.image("asset2", asset2);
        this.load.image("asset3", asset3);
        this.load.image("icedLake", icedLake);
        this.load.spritesheet('adventurer', adventurer, {
            frameWidth: 256, // Width of a single frame
            frameHeight: 256, // Height of a single frame
        });
        this.indices = randomWalkGen()


    }

    create() {

        // Player animations
        // Define animations
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
            key: "sprWater",
            frames: this.anims.generateFrameNumbers("sprWater"),
            frameRate: 5,
            repeat: -1
        });


        this.mapSize = 1000;
        this.chunkSize = 16;
        this.tileSize = 16;
        this.cameraSpeed = 50;
        const polygons = voronoi.cellPolygons();
        calculatePolygonData(polygons);

        this.vertices = polygonData;
        this.vertices.forEach(vertex => {
            vertex.vertices = vertex.vertices.map(v => ({ x: v.x * this.resolution, y: v.y * this.resolution }));
            vertex.reducedVertices = vertex.reducedVertices.map(v => ({ x: v.x * this.resolution, y: v.y * this.resolution }));
        });
        console.log(polygonData);

        // this.vertices = [
        //     {
        //         type: "sand",
        //         vertices: [
        //             { x: 0, y: 0 },
        //             { x: 3000, y: 0 },
        //             { x: 0, y: 3000 }

        //         ],
        //     },
        //     {
        //         type: "grass",
        //         vertices: [
        //             { x: 0, y: 3000 },
        //             { x: 0, y: 6000 },
        //             { x: 3000, y: 6000 }
        //         ],
        //     },
        //     {
        //         type: "grass",
        //         vertices: [
        //             { x: 3000, y: 0 },
        //             { x: 6000, y: 0 },
        //             { x: 6000, y: 3000 }
        //         ]
        //     },
        //     {
        //         type: "sand",
        //         vertices: [
        //             { x: 6000, y: 3000 },
        //             { x: 6000, y: 6000 },
        //             { x: 3000, y: 6000 }
        //         ],
        //     }
        // ]; 


        this.cameras.main.setZoom(2);
        this.followPoint = new Phaser.Math.Vector2(
            this.mapSize / 2,
            this.mapSize / 2
        );

        this.chunks = [];

        if (this.input.keyboard) {
            this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        }
        const middleChunkX = Math.floor(this.mapSize / 2);
        const middleChunkY = Math.floor(this.mapSize / 2);

        this.player = this.add.sprite(middleChunkX, middleChunkY, 'adventurer');
        //this.player.setPosition(1, 1);

        this.player.setDepth(10);
        this.player.setScale(0.3); // Adjust player size to fit screen

        const dungeonRadius = 20;
        const randomAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const randomDistance = Phaser.Math.FloatBetween(0, dungeonRadius);

        // Convert polar to Cartesian coordinates
        const dungeonX = this.player.x + Math.cos(randomAngle) * randomDistance;
        const dungeonY = this.player.y + Math.sin(randomAngle) * randomDistance;

        // Add the dungeon sprite
        const dungeon = this.add.sprite(dungeonX, dungeonY, "dungeon");
        dungeon.setOrigin(0.5, 0.5);
        dungeon.setScale(0.5);
        dungeon.setDepth(9.5);
    }
    isWithinBounds(chunkX: number, chunkY: number): { withinBounds: boolean; biomeType?: string } {


        // Check if the chunk is within the boundaries of any biome (centered at each vertex)
        const chunkCenterX = chunkX * this.chunkSize * this.tileSize;
        const chunkCenterY = chunkY * this.chunkSize * this.tileSize;

        // Check if the chunk falls within any square biome boundary
        for (let polygon of this.vertices) {
            if (this.point_in_polygon({ x: chunkCenterX, y: chunkCenterY }, polygon.reducedVertices)) {
                var type;
                if (polygon.index >= 10) {
                    type = "sand";
                }
                else {
                    type = "grass";

                }
                return { withinBounds: true, biomeType: type };
            }
        }

        return { withinBounds: false };
    }
    point_in_polygon(point: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean {
        const num_vertices = polygon.length;
        var x = point.x;
        var y = point.y;
        let inside = false;

        let p1 = polygon[0];
        let p2;

        for (let i = 1; i <= num_vertices; i++) {
            p2 = polygon[i % num_vertices];

            if (y > Math.min(p1.y, p2.y)) {
                if (y <= Math.max(p1.y, p2.y)) {
                    if (x <= Math.max(p1.x, p2.x)) {
                        const x_intersection = ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x;

                        if (p1.x === p2.x || x <= x_intersection) {
                            inside = !inside;
                        }
                    }
                }
            }

            p1 = p2;
        }
        return inside;
    }




    getChunk(x: number, y: number) {
        var chunk = null;
        for (var i = 0; i < this.chunks.length; i++) {
            if (this.chunks[i].x == x && this.chunks[i].y == y) {
                chunk = this.chunks[i];
            }
        }
        return chunk;
    }


    update() {

        var snappedChunkX = (this.chunkSize * this.tileSize) * Math.round(this.followPoint.x / (this.chunkSize * this.tileSize));
        var snappedChunkY = (this.chunkSize * this.tileSize) * Math.round(this.followPoint.y / (this.chunkSize * this.tileSize));

        snappedChunkX = snappedChunkX / this.chunkSize / this.tileSize;
        snappedChunkY = snappedChunkY / this.chunkSize / this.tileSize;

        for (var x = snappedChunkX - 2; x < snappedChunkX + 2; x++) {
            for (var y = snappedChunkY - 2; y < snappedChunkY + 2; y++) {
                const result = this.isWithinBounds(x, y);
                if (!result.withinBounds) continue;
                var existingChunk = this.getChunk(x, y);
                if (existingChunk == null) {
                    if (result.biomeType === 'grass') {
                        var newChunk = new Biome2(this, x, y, this.chunkSize, this.tileSize);
                    } else {
                        var newChunk = new Biome1(this, x, y, this.chunkSize, this.tileSize);
                    }
                    this.chunks.push(newChunk);
                }

            }
        }

        for (var i = 0; i < this.chunks.length; i++) {
            var chunk = this.chunks[i];

            if (Phaser.Math.Distance.Between(
                snappedChunkX,
                snappedChunkY,
                chunk.x,
                chunk.y
            ) < 3) {
                if (chunk !== null) {
                    chunk.load();
                }
            }
            else {
                if (chunk !== null) {
                    //chunk.unload();
                }
            }
        }


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

        console.log(this.followPoint.x, this.followPoint.y);



        this.cameras.main.centerOn(this.followPoint.x, this.followPoint.y);
        this.player.x = this.followPoint.x;
        this.player.y = this.followPoint.y;
    }


}
