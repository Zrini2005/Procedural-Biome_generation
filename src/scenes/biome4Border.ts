import Phaser from 'phaser';
import { Tile } from './Entities'; 
import { SceneMain } from '../scenes/SceneMain';
 
class Biome4Border {
    scene: SceneMain;
    x: number;
    y: number;
    tiles: Phaser.GameObjects.Group;
    isLoaded: boolean;
    occupiedAreas: { x: number; y: number; width: number; height: number }[];
    chunkSize: number;
    tileSize: number;

    constructor(scene: Phaser.Scene, x: number, y: number, chunkSize: number, tileSize: number) {
        this.scene = scene as SceneMain;
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
            for (var x = 0; x < this.chunkSize; x++) {
                for (var y = 0; y < this.chunkSize; y++) {
                    var tileX = (this.x * (this.chunkSize * this.tileSize)) + (x * this.tileSize);
                    var tileY = (this.y * (this.chunkSize * this.tileSize)) + (y * this.tileSize); 
                    if (!this.isWithinBounds(tileX, tileY)) {
                        continue; // Skip tiles that are not within bounds
                    }
                    const key = "bush"; 
                    var tile = new Tile(this.scene, tileX, tileY, key); 
                    this.tiles.add(tile);
                }
            }  
            this.isLoaded = true;
        }
    } 
    isWithinBounds(x: number, y: number): boolean {
        for (let polygon of this.scene.vertices) {
            if (this.point_in_polygon({ x, y }, polygon.gradientAreaCoordinates)) {
                console.log("inside");
                return true;
            }
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
}
export { Biome4Border };