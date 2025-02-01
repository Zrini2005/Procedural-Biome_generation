import Phaser from 'phaser';
import Perlin from '../helpers/perlin';
import { SceneMain } from './SceneMain';

class Biome1 {
    scene: SceneMain;
    x: number;
    y: number;
    tiles: Phaser.GameObjects.Group;
    isLoaded: boolean;
    occupiedAreas: { x: number; y: number; width: number; height: number }[];
    chunkSize: number;
    tileSize: number;
    perlin: Perlin;
    polygonIdx: number;

    constructor(scene: Phaser.Scene, x: number, y: number, chunkSize: number, tileSize: number, polygonIdx: number) {
        this.scene = scene as SceneMain;
        this.x = x;
        this.y = y;
        this.chunkSize = chunkSize;
        this.tileSize = tileSize;
        this.tiles = this.scene.add.group();
        this.isLoaded = false;
        this.occupiedAreas = [];
        this.perlin = new Perlin();
        this.polygonIdx = polygonIdx;


    }

    unload() {
        if (this.isLoaded) {
            this.tiles.clear(true, true);
            this.isLoaded = false;
            this.occupiedAreas = [];
        }
    }

    load() {
        if (!this.isLoaded) {
            console.log("curr pos" + this.scene.player.x + " " + this.scene.player.y);

            const grassTiles: { x: number; y: number }[] = [];
            const waterTiles: { x: number; y: number }[] = [];
            const sandTiles: { x: number; y: number }[] = [];

            // Step 1: Generate tiles
            for (var x = 0; x < this.chunkSize; x++) {
                for (var y = 0; y < this.chunkSize; y++) {
                    var tileX = (this.x * (this.chunkSize * this.tileSize)) + (x * this.tileSize);
                    var tileY = (this.y * (this.chunkSize * this.tileSize)) + (y * this.tileSize);
                    if (!this.isWithinBounds(tileX, tileY) && !this.isBorderBounds(tileX, tileY)) {
                        continue; // Skip tiles that are not within bounds
                    }
                    if(this.isBorderBounds(tileX, tileY) && !this.isWithinBounds(tileX, tileY)){
                        const key = "bush";  
                        var tile = new Tile(this.scene, tileX, tileY, key); 
                        this.tiles.add(tile);
                        continue;
                    }

                    //var perlinValue = noise2D(tileX / 1000, tileY / 1000);
                    const perlinValue = this.perlin.perlin2(tileX / 500, tileY / 500);

                    var key = "";
                    var animationKey = "";

                    // if (perlinValue < 0.05) {
                    //   key = "sprWater";
                    //   animationKey = "sprWater";
                    //   waterTiles.push({ x: tileX, y: tileY });
                    // }
                    if (perlinValue < 0.1) {
                        key = "sprSand";
                        waterTiles.push({ x: tileX, y: tileY });
                    } else if (perlinValue >= 0.1 && perlinValue < 0.2) {
                        key = "sprNewTry";

                    } else if (perlinValue >= 0.2) {
                        key = "sprGrass";
                        grassTiles.push({ x: tileX, y: tileY }); // Add grass tile position
                    }

                    // Add the main tile sprite
                    var tile = new Tile(this.scene, tileX, tileY, key);
                    //tile.setScale(2,2);


                    if (animationKey !== "") {
                        tile.play(animationKey);
                    }

                    this.tiles.add(tile);
                }
            }

            // Step 2: Place trees on grass tiles
            grassTiles.forEach(grassTile => {
                var treeNoise = this.perlin.perlin2(grassTile.x / 50, grassTile.y / 50); // Use finer noise for tree placement
                if (treeNoise > 0.5) {
                    var treeType;
                    if (treeNoise <= 0.6) {
                        treeType = "tree1";
                    } else if (treeNoise <= 0.4) {
                        treeType = "tree2";
                    } else {
                        treeType = "tree3";
                    }

                    // Add tree sprite with proper scaling
                    const assetWidth = this.scene.textures.get(treeType).getSourceImage().width;
                    const assetHeight = this.scene.textures.get(treeType).getSourceImage().height;

                    const scaleX = 0.05 + this.tileSize / assetWidth;
                    const scaleY = 0.05 + this.tileSize / assetHeight;
                    var tree = this.scene.physics.add.sprite(grassTile.x + 8, grassTile.y + 8, treeType);
                    tree.setOrigin(0.5, 1);
                    tree.setDepth(8);
                    tree.setScale(scaleX, scaleY);
                    tree.setPushable(false);
                    this.scene.addToCollidableObjects(tree)
                    this.tiles.add(tree);
                    this.scene.add.existing(tree);
                }
            });

            waterTiles.forEach(waterTile => {
                var assetNoise = this.perlin.perlin2(waterTile.x / 75, waterTile.y / 75); // Use finer noise for asset placement
                if (assetNoise > 0.2 && !this.isNearDungeon(waterTile.x, waterTile.y) && !this.isNearLootBox(waterTile.x, waterTile.y)) {
                    var assetType;
                    if (assetNoise <= 0.5) {
                        assetType = "sprSand";
                        // assetType = "bush";
                    } else if (assetNoise <= 0.6) {
                        assetType = "sprSand";
                        // assetType = "icedLake";
                    } else {
                        assetType = "sprSand";
                        // assetType = "icedLake";
                    }
                    const assetWidth = this.scene.textures.get(assetType).getSourceImage().width;
                    const assetHeight = this.scene.textures.get(assetType).getSourceImage().height;

                    const scaleX = -0.00 + this.tileSize / assetWidth;
                    const scaleY = -0.00 + this.tileSize / assetHeight;

                    var asset = new Phaser.GameObjects.Sprite(this.scene, waterTile.x + 8, waterTile.y + 8, assetType); // Centered on the tile
                    asset.setOrigin(0.5, 1);
                    asset.setDepth(8); // Sort by Y position
                    asset.setScale(scaleX, scaleY);
                    this.tiles.add(asset);
                    this.scene.add.existing(asset);
                }
                else {
                    this.placeAssetOnSand(waterTile.x, waterTile.y);
                }
                // else{
                //   var assetType="icedLake";

                //   // Add water asset sprite with proper scaling
                //   var asset = new Phaser.GameObjects.Sprite(this.scene, waterTile.x + 8, waterTile.y + 8, assetType); // Centered on the tile
                //   asset.setOrigin(0.5, 1); // Align the asset's bottom to the tile
                //   asset.setScale(0.3); // Scale down to fit the tile size
                //   this.tiles.add(asset);
                //   this.scene.add.existing(asset);
                // }
            });



            this.isLoaded = true;
        }
    }
    isBorderBounds(x: number, y: number): boolean {
        if (this.point_in_polygon({ x, y }, this.scene.vertices[this.polygonIdx].gradientAreaCoordinates)) {
            console.log("inside");
            return true;
        }

        console.log("outside");
        return false;
    }
    isWithinBounds(x: number, y: number): boolean {
        if (this.point_in_polygon({ x, y }, this.scene.vertices[this.polygonIdx].reducedVertices)) {
            console.log("inside");
            return true;
        }

        console.log("outside");
        return false;
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
    placeAssetOnSand(worldX: number, worldY: number) {
        const hashValue = this.hash(worldX, worldY);
        const tileSize = this.tileSize;
        let assetType;
        // Determine which asset to place based on hash value
        if (hashValue > 0.1 && hashValue <= 0.105) {
            assetType = "asset1";
        } else if (hashValue > 0.5 && hashValue <= 0.505) {
            assetType = "asset2";
        } else if (hashValue > 0.995) {
            assetType = "asset3";
        } else {
            return; // No asset to place for this tile
        }

        // Get asset size for bounding box calculation
        const assetWidth = this.scene.textures.get(assetType).getSourceImage().width;
        const assetHeight = this.scene.textures.get(assetType).getSourceImage().height;
        const scaleX = tileSize / assetWidth * 4.5; // Increase scale factor
        const scaleY = tileSize / assetHeight * 4.5;
        const assetWidthScaled = assetWidth * scaleX;
        const assetHeightScaled = assetHeight * scaleY;

        const assetBounds = {
            x: worldX - assetWidthScaled / 2,
            y: worldY - assetHeightScaled / 2,
            width: assetWidthScaled,
            height: assetHeightScaled,
        };

        // Check for overlaps
        if (this.isOverlapping(assetBounds) || this.isNearDungeon(worldX, worldY) || this.isNearLootBox(worldX, worldY)) {
            return; // Skip placement if overlapping
        }

        // Place the asset
        const asset = new Phaser.GameObjects.Sprite(this.scene, worldX + tileSize / 2, worldY + tileSize / 2, assetType);
        asset.setOrigin(0.5, 1);
        asset.setScale(scaleX, scaleY);
        asset.setDepth(9); // Sort by Y position
        this.tiles.add(asset);

        this.scene.add.existing(asset);

        // Add asset bounds to occupied areas
        this.occupiedAreas.push(assetBounds);
    }
    isNearDungeon(x: number, y: number): boolean {
        const dungeonRadius = 100; // Adjust this value as needed
        for (let polygon of this.scene.vertices) {
            const center = polygon.centroid;
            const distance = Phaser.Math.Distance.Between(x, y, center.x, center.y);
            if (distance < dungeonRadius) {
                return true;
            }
        }
        return false;
    }
    isNearLootBox(x: number, y: number): boolean {
        const lootBoxRadius = 100; // Adjust this value as needed
        for (let lootBox of this.scene.lootBoxes) {
            const distance = Phaser.Math.Distance.Between(x, y, lootBox.x, lootBox.y);
            if (distance < lootBoxRadius) {
                return true;
            }
        }
        return false;
    }

    isOverlapping(bounds: { x: number; y: number; width: number; height: number }) {
        return this.occupiedAreas.some((area) => {
            return (
                bounds.x < area.x + area.width &&
                bounds.x + bounds.width > area.x &&
                bounds.y < area.y + area.height &&
                bounds.y + bounds.height > area.y
            );
        });
    }

    hash(x: number, y: number, seed = 12345) {
        // Simple deterministic hash function
        const hash = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
        return hash - Math.floor(hash); // Normalize to [0, 1]
    }

}



class Tile extends Phaser.GameObjects.Sprite {
    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number, key: string) {
        super(scene, x, y, key);
        this.scene = scene;
        this.scene.add.existing(this);
        this.setOrigin(0);
    }
}
export { Biome1, Tile };


