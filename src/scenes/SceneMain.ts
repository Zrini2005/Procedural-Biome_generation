import Phaser from 'phaser';
import { Biome2 } from './biome2'; // Add this line to import Biome2
import { HomeMap } from './homeMap'; // Add this line to import HomeMap 
import { Biome1 } from './Entities'; // Add this line to import Biome1
import { calculatePolygonData, polygonData, voronoi, delaunay } from '../helpers/polygons';
import sprSand from '../content/sprSand.png';
import adventurer from '../content/adventurer.webp';
import grassSpr from '../content/grassSpr.png'
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
import lootbox from '../content/lootbox-closed.webp';
import sprHighland from '../content/sprHighland.png';
import { randomWalkGen } from '../helpers/domains';
import grassbase from '../content/grassbase.png';
import bushSpr from '../content/bushSpr.png'; 
import { HomeMapBorder } from './homeMapBorder'; 
import steel2png3 from '../content/steel2png3.png';
import steel4img1 from '../content/steel4img1.png';
import steel4img2 from '../content/steel4img2.png';
import steel4img3 from '../content/steel4img3.png';
import { Biome3 } from './biome3';
import { Biome4 } from './biome4';
import steelTilemid from '../content/steelTilemid.png';
import steelTilebase from '../content/steelTilebase.png';
import steelTile from '../content/steelTile.png';
import tileset from '../content/tileset/tileset.png'
import teleporter from '../content/tileset/teleporter.json'

export class SceneMain extends Phaser.Scene {
    resolution: number = 3000;
    collidableObjects: Phaser.Physics.Arcade.Group;

    mapSize: number;
    chunkSize: number;
    tileSize: number;
    cameraSpeed: number;
    vertices: {
        index: number,
        polygonIndex: number,
        vertices: { x: number, y: number }[],
        reducedVertices: { x: number, y: number }[]
        lootBoxesCoordinates: { x: number, y: number }[]
        gradientAreaCoordinates: { x: number, y: number }[]
        centroid: { x: number, y: number }
    }[];
    lootBoxes: { x: number; y: number }[] = [];
    chunks: any[]; // Add this line to declare the chunks property
    followPoint: Phaser.Math.Vector2; // Declare followPoint property
    player: Phaser.GameObjects.Sprite; // Declare player property
    keyW: Phaser.Input.Keyboard.Key; // Declare keyW property
    keyS: Phaser.Input.Keyboard.Key; // Declare keyS property
    keyA: Phaser.Input.Keyboard.Key; // Declare keyA property
    keyD: Phaser.Input.Keyboard.Key; // Declare keyD property
    indices: integer[]; // Declare indices property

    constructor() {
        super({ key: "SceneMain", physics: { arcade: {} } });

    }

    preload() {
        this.load.spritesheet("sprWater", sprWater, {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image("sprSand", sprSand);
        // this.load.image("sprGrass", sprGrass);
        this.load.image("sprGrass", grassSpr);
        this.load.image("tree1", tree1);
        this.load.image("tree2", tree2);
        this.load.image("tree3", tree3);
        this.load.image("lootbox", lootbox);
        // this.load.image("sprNewTry", sprNewTry);
        this.load.image("sprNewTry", bushSpr);
        this.load.image("smallHouse", smallHouse);
        this.load.image('dungeon', dungeon);
        this.load.image("bush", mountain_landscape);
        this.load.image("asset1", asset1);
        this.load.image("asset2", asset2);
        this.load.image("asset3", asset3);
        this.load.image("steelTile", steelTile);
        this.load.image("steelTilemid", steelTilemid);
        this.load.image("steelTilebase", steelTilebase);
        this.load.image("steel2png3", steel2png3);
        this.load.image("steel4img1", steel4img1);
        this.load.image("steel4img2", steel4img2);
        this.load.image("steel4img3", steel4img3);
        this.load.image("sprHighland", sprHighland);
        this.load.image("icedLake", icedLake);
        this.load.spritesheet('adventurer', adventurer, {
            frameWidth: 256, // Width of a single frame
            frameHeight: 256, // Height of a single frame
        });
        this.load.image("grassbase", grassbase);
        this.indices = randomWalkGen()

        this.load.image("tileset", tileset);
        this.load.tilemapTiledJSON("teleporter", teleporter);
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
        this.cameraSpeed = 1000;
        const polygons = voronoi.cellPolygons();
        calculatePolygonData(polygons);

        this.vertices = polygonData;
        this.vertices.forEach(vertex => {
            vertex.vertices = vertex.vertices.map(v => ({ x: v.x * this.resolution, y: v.y * this.resolution }));
            vertex.reducedVertices = vertex.reducedVertices.map(v => ({ x: v.x * this.resolution, y: v.y * this.resolution }));
            vertex.lootBoxesCoordinates = vertex.lootBoxesCoordinates.map(v => ({ x: v.x * this.resolution, y: v.y * this.resolution }));
            vertex.gradientAreaCoordinates = vertex.gradientAreaCoordinates.map(v => ({ x: v.x * this.resolution, y: v.y * this.resolution }));
            vertex.centroid = { x: vertex.centroid.x * this.resolution, y: vertex.centroid.y * this.resolution };
        });
        console.log(polygonData);

        // Start the player and cam at center of home base
        const startX = this.vertices[0].centroid.x;
        const startY = this.vertices[0].centroid.y;

        this.cameras.main.setZoom(2);
        this.followPoint = new Phaser.Math.Vector2(
            startX, startY
        );

        this.chunks = [];

        if (this.input.keyboard) {
            this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        }

        this.physics.world.defaults.debugShowBody = false;
        this.player = this.add.sprite(startX, startY, 'adventurer');
        //this.player.setPosition(1, 1);
        this.physics.world.enable(this.player);

        this.player.setDepth(10);
        this.player.setScale(0.3);
        if (this.player.body) {
            (this.player.body as Phaser.Physics.Arcade.Body).setSize(this.player.width * 0.3, this.player.height * 0.5);
            (this.player.body as Phaser.Physics.Arcade.Body).setOffset(this.player.width * 0.35, this.player.height * 0.35);
        }

        this.player.x = startX;
        this.player.y = startY;

        this.collidableObjects = this.physics.add.group();
        const tree = this.physics.add.sprite(11000, 11000, 'tree1');
        tree.setDepth(10);
        tree.setPushable(false);

        tree.body.setSize(tree.width, tree.height); // Resize physics body
        this.collidableObjects.add(tree);
        this.physics.world.drawDebug = true;
        this.physics.world.debugGraphic.clear();

        // Add collider with debug log
        this.physics.add.collider(this.player, this.collidableObjects);

        // Debugging: Log collidable objects
        console.log('Collidable Objects:', this.collidableObjects.getChildren());

        this.placeDungeonAtPolygonCenters();
        this.addLootBoxes();

        const map = this.make.tilemap({ key: "teleporter" });
        const tileset = map.addTilesetImage("CENTRAL_TILESET", "tileset");
        const layer = map.createLayer("Tile Layer 1", tileset!, startX, startY);
        layer?.setDepth(9.5);
        console.log("tilesets", map.tilesets); // Check available tilesets
        console.log("object layers", map.getObjectLayerNames()); // Check layer names


    }

    addToCollidableObjects(object: Phaser.GameObjects.GameObject) {

        this.collidableObjects.add(object); // Add the object to the collidable group
    }

    addLootBoxes() {
        const minDistance = 1000; // Minimum allowed distance between loot boxes

        for (let polygon of this.vertices) {
            const validLootBoxes: { x: number; y: number }[] = [];

            for (let lootBox of polygon.lootBoxesCoordinates) {
                // Check distance with existing valid loot boxes
                let isFarEnough = true;

                for (let existing of validLootBoxes) {
                    const distance = Phaser.Math.Distance.Between(lootBox.x, lootBox.y, existing.x, existing.y);
                    if (distance < minDistance) {
                        isFarEnough = false;
                        break;
                    }
                }

                if (isFarEnough) {
                    this.lootBoxes.push(lootBox);
                    validLootBoxes.push(lootBox);

                    // Add loot box sprite to the scene
                    const lootBoxSprite = this.add.sprite(lootBox.x, lootBox.y, "lootbox");
                    lootBoxSprite.setOrigin(0.5, 0.5);
                    lootBoxSprite.setScale(1.5);
                    lootBoxSprite.setDepth(9.5);
                }
            }

        }
    }

    placeDungeonAtPolygonCenters() {
        for (let polygon of this.vertices) {
            const center = polygon.centroid;
            console.log("centre:", center);

            // Check if a dungeon already exists for this polygon
            const existingDungeon = this.children.getByName(`dungeon-${polygon.polygonIndex}`);
            if (!existingDungeon && polygon.polygonIndex != 24) {
                const dungeon = this.add.sprite(center.x, center.y, "dungeon");
                dungeon.setOrigin(0.5, 0.5);
                dungeon.setScale(0.5);
                dungeon.setDepth(9.5);
                dungeon.name = `dungeon-${polygon.polygonIndex}`; // Unique identifier
                console.log(`Dungeon placed at polygon ${polygon.polygonIndex} center (${center.x}, ${center.y})`);
            }
        }
    }

    isWithinBounds(chunkX: number, chunkY: number): { withinBounds: boolean; biomeType?: string; index?: number } {
        const chunkSizeInPixels = this.chunkSize * this.tileSize;
        const chunkCorners = [
            { x: chunkX * chunkSizeInPixels, y: chunkY * chunkSizeInPixels },
            { x: (chunkX + 1) * chunkSizeInPixels, y: chunkY * chunkSizeInPixels },
            { x: chunkX * chunkSizeInPixels, y: (chunkY + 1) * chunkSizeInPixels },
            { x: (chunkX + 1) * chunkSizeInPixels, y: (chunkY + 1) * chunkSizeInPixels }
        ];

        for (let polygon of this.vertices) {
            for (let corner of chunkCorners) {
                if (this.point_in_polygon(corner, polygon.gradientAreaCoordinates)) {
                    var type;

                    if (polygon.index >= 0 && polygon.index < 5) {
                        type = "steel";
                    }
                    else if (polygon.index >= 5 && polygon.index < 10) {
                        type = "ground";
                    }
                    else if (polygon.index >= 10 && polygon.index < 15) {
                        type = "flying";
                    }
                    else {
                        type = "psychic";
                    }
                    return { withinBounds: true, biomeType: type, index: polygon.index };
                }
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

        var snappedChunkX = (this.chunkSize * this.tileSize) * Math.round(this.player.x / (this.chunkSize * this.tileSize));
        var snappedChunkY = (this.chunkSize * this.tileSize) * Math.round(this.player.y / (this.chunkSize * this.tileSize));

        snappedChunkX = snappedChunkX / this.chunkSize / this.tileSize;
        snappedChunkY = snappedChunkY / this.chunkSize / this.tileSize;

        for (var x = snappedChunkX - 2; x < snappedChunkX + 2; x++) {
            for (var y = snappedChunkY - 2; y < snappedChunkY + 2; y++) {
                const result = this.isWithinBounds(x, y);
                if (result.withinBounds) {
                    var existingChunk = this.getChunk(x, y);
                    if (existingChunk == null) {
                        let newChunk: Biome2 | Biome3 | Biome1 | Biome4;
                        switch (result.biomeType) {
                            case 'steel':
                                if (typeof result.index === 'number') {
                                    newChunk = new Biome1(this, x, y, this.chunkSize, this.tileSize, result.index);
                                } else {
                                    throw new Error('Expected result.index to be a number');
                                }
                                //console.log('grass');
                                break;
                            case 'ground':
                                if (typeof result.index === 'number') {
                                    newChunk = new Biome2(this, x, y, this.chunkSize, this.tileSize, result.index);
                                } else {
                                    throw new Error('Expected result.index to be a number');
                                }
                                //console.log('home');
                                break;
                            case 'flying':
                                if (typeof result.index === 'number') {
                                    newChunk = new Biome3(this, x, y, this.chunkSize, this.tileSize, result.index);
                                } else {
                                    throw new Error('Expected result.index to be a number');
                                }
                                //console.log('sand');
                                break;
                            case 'psychic':
                                if (typeof result.index === 'number') {
                                    newChunk = new Biome4(this, x, y, this.chunkSize, this.tileSize, result.index);
                                } else {
                                    throw new Error('Expected result.index to be a number');
                                }
                                //console.log('grassBorder');
                                break; 

                            default:
                                throw new Error(`Unknown biome type: ${result.biomeType}`);
                        }

                        this.chunks.push(newChunk);
                    }
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
                    chunk.unload();
                }
            }
        }

        if (this.player && this.player.body instanceof Phaser.Physics.Arcade.Body) {
            if (this.keyW.isDown) {
                this.player.body.setVelocityY(-this.cameraSpeed);
                this.player.body.setVelocityX(0);

                this.player.play('walk-up', true);
            } else if (this.keyS.isDown) {
                this.player.body.setVelocityY(this.cameraSpeed)
                this.player.body.setVelocityX(0);

                this.player.play('walk-down', true);
            } else if (this.keyA.isDown) {
                this.player.body.setVelocityX(-this.cameraSpeed)
                this.player.body.setVelocityY(0);

                this.player.play('walk-left', true);
            } else if (this.keyD.isDown) {
                this.player.body.setVelocityX(this.cameraSpeed)
                this.player.body.setVelocityY(0);

                this.player.play('walk-right', true);
            } else {
                this.player.body.setVelocityX(0);
                this.player.body.setVelocityY(0);
                this.player.play('idle', true);
            }
        }

        // console.log(this.player.x, this.player.y);
        console.log(delaunay.find(this.player.x / this.resolution, this.player.y / this.resolution));

        this.cameras.main.centerOn(this.player.x, this.player.y);
    }
}
