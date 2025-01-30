import Phaser from 'phaser';
import { Tile } from './Entities';
import { createNoise2D } from 'simplex-noise';
const noise2D = createNoise2D(() =>10);
 
class HomeMap {
    scene: Phaser.Scene;
    x: number;
    y: number;
    tiles: Phaser.GameObjects.Group;
    isLoaded: boolean;
    occupiedAreas: { x: number; y: number; width: number; height: number }[];
    chunkSize: number;
    tileSize: number;

    constructor(scene: Phaser.Scene, x: number, y: number, chunkSize: number, tileSize: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.chunkSize = chunkSize;
        this.tileSize = tileSize;
        this.tiles = this.scene.add.group();
        this.isLoaded = false;
        this.occupiedAreas = [];
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
            const grassTiles: { x: number; y: number }[] = [];
            const waterTiles: { x: number; y: number }[] = [];
            const sandTiles: { x: number; y: number }[] = [];

            // Step 1: Generate tiles
            for (var x = 0; x < this.chunkSize; x++) {
                for (var y = 0; y < this.chunkSize; y++) {
                    var tileX = (this.x * (this.chunkSize * this.tileSize)) + (x * this.tileSize);
                    var tileY = (this.y * (this.chunkSize * this.tileSize)) + (y * this.tileSize);

                    var perlinValue = noise2D(tileX / 150, tileY / 150);

                    var key = "";
                    var animationKey = "";

                    // if (perlinValue < 0.05) {
                    //   key = "sprWater";
                    //   animationKey = "sprWater";
                    //   waterTiles.push({ x: tileX, y: tileY });
                    // }
                    if (perlinValue < 0.1) {
                        key = "sprGrass";
                    } else if (perlinValue >= 0.1 && perlinValue < 0.2) {
                        key = "sprGrass";

                    } else if (perlinValue >= 0.2) {
                        key = "sprGrass";
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
                var treeNoise = noise2D(grassTile.x / 50, grassTile.y / 50); // Use finer noise for tree placement
                if (treeNoise > 0.2) {
                    var treeType;
                    if (treeNoise <= 0.3) {
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
                    var tree = new Phaser.GameObjects.Sprite(this.scene, grassTile.x + 8, grassTile.y + 8, treeType); // Centered on the tile
                    tree.setOrigin(0.5, 1); // Align the tree's bottom to the tile
                    tree.setDepth(8); // Sort by Y position
                    tree.setScale(scaleX, scaleY); // Scale down to fit the tile size
                    this.tiles.add(tree);
                    this.scene.add.existing(tree);
                }
            });

            waterTiles.forEach(waterTile => {
                var assetNoise = noise2D(waterTile.x / 75, waterTile.y / 75); // Use finer noise for asset placement
                if (assetNoise > 0.2) {
                    var assetType;
                    if (assetNoise <= 0.5) {
                        assetType = "bush";
                    } else if (assetNoise <= 0.6) {
                        assetType = "icedLake";
                    } else {
                        assetType = "icedLake";
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
        if (this.isOverlapping(assetBounds)) {
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
export { HomeMap };