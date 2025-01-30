import Phaser from 'phaser';
import { Tile } from './Entities'; 
 
class HomeMapBorder {
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

            // Step 1: Generate tiles
            for (var x = 0; x < this.chunkSize; x++) {
                for (var y = 0; y < this.chunkSize; y++) {
                    var tileX = (this.x * (this.chunkSize * this.tileSize)) + (x * this.tileSize);
                    var tileY = (this.y * (this.chunkSize * this.tileSize)) + (y * this.tileSize); 
                    const key = "bush";  
                    var tile = new Tile(this.scene, tileX, tileY, key); 
                    this.tiles.add(tile);
                }
            }  
            this.isLoaded = true;
        }
    } 
}
export { HomeMapBorder };