import { Delaunay } from 'd3-delaunay';
import { randomWalkGen } from './domains';
import Prando from 'prando';

const GRIDSIZE = 7;
const JITTER = 0.5;
let points: { x: number, y: number }[] = [];

let rng =new Prando(100);

//Creating grid points
for (let x = 1; x <= GRIDSIZE; x++) {
  for (let y = 1; y <= GRIDSIZE; y++) {
    points.push({
      x: x + JITTER * (rng.next()-rng.next()),
      y: y + JITTER * (rng.next()-rng.next())
    });
  }
}

let delaunay = Delaunay.from(points, loc => loc.x, loc => loc.y);

const voronoi = delaunay.voronoi([0, 0, GRIDSIZE, GRIDSIZE]);
const voronoiPolygons = voronoi.cellPolygons();

let indices = randomWalkGen();

interface polygonVertices {
  x: number,
  y: number
}

let polygonData: {
  index: number,
  polygonIndex: number,
  vertices: polygonVertices[],
  reducedVertices: polygonVertices[]
  lootBoxesCoordinates: polygonVertices[]
  gradientAreaCoordinates: polygonVertices[]
  centroid: polygonVertices
}[] = [];

function calculatePolygonData(polygons: typeof voronoiPolygons) {
  let i = 0;
  const polygonArray = Array.from(polygons)
  for (let i in indices) {
    const index = indices[i];
    let vertices = [];
    for (let j = 0; j < polygonArray[index].length; j++) {
      vertices.push({ x: Number(polygonArray[index][j][0]), y: Number(polygonArray[index][j][1]) });
    }
    const centroid = calculateCentroid(vertices);
    polygonData.push({ index: Number(i), polygonIndex: 0, vertices: vertices, reducedVertices: [], lootBoxesCoordinates: [], gradientAreaCoordinates: [], centroid: centroid });
  }
  addPolygonIndices(polygonData)
  calculateReducedVertices(polygonData)
  lootboxCoordinates(polygonData)
  gradientAreaCoordinates(polygonData)
}

function calculateCentroid(vertices: polygonVertices[]) {
  let centroid = { x: 0, y: 0 };
  for (let i = 0; i < vertices.length; i++) {
    centroid.x += Number(vertices[i].x);
    centroid.y += Number(vertices[i].y);
  }
  centroid.x /= vertices.length;
  centroid.y /= vertices.length;
  return centroid;
}

function addPolygonIndices(polygons: typeof polygonData) {
  for (let i = 0; i < polygons.length; i++) {
    const polygonIndex = indices[i];
    polygonData[i].polygonIndex = polygonIndex;
  }
}

function calculateReducedVertices(polygons: typeof polygonData) {
  for (let i = 0; i < polygons.length; i++) {
    let centroid = { x: 0, y: 0 };
    for (let j = 0; j < polygons[i].vertices.length; j++) {
      centroid.x += Number(polygons[i].vertices[j].x);
      centroid.y += Number(polygons[i].vertices[j].y);
    }
    centroid.x /= polygons[i].vertices.length;
    centroid.y /= polygons[i].vertices.length;

    let reducedVertices = [];
    for (let j = 0; j < polygons[i].vertices.length; j++) {
      const vertex = polygons[i].vertices[j];
      const newX = centroid.x + (vertex.x - centroid.x) * 0.75;
      const newY = centroid.y + (vertex.y - centroid.y) * 0.75;
      reducedVertices.push({ x: newX, y: newY });
    }
    polygonData[i].reducedVertices = reducedVertices;
  }
}

function gradientAreaCoordinates(polygons: typeof polygonData) {
  for (let i = 0; i < polygons.length; i++) {
    let centroid = { x: 0, y: 0 };
    for (let j = 0; j < polygons[i].vertices.length; j++) {
      centroid.x += Number(polygons[i].vertices[j].x);
      centroid.y += Number(polygons[i].vertices[j].y);
    }
    centroid.x /= polygons[i].vertices.length;
    centroid.y /= polygons[i].vertices.length;

    let reducedVertices = [];
    for (let j = 0; j < polygons[i].vertices.length; j++) {
      const vertex = polygons[i].vertices[j];
      const newX = centroid.x + (vertex.x - centroid.x) * 0.83;
      const newY = centroid.y + (vertex.y - centroid.y) * 0.83;
      reducedVertices.push({ x: newX, y: newY });
    }
    polygonData[i].gradientAreaCoordinates = reducedVertices;
  }
}

function lootboxCoordinates(polygons: typeof polygonData) {
  for (let i = 0; i < polygons.length; i++) {
    let centroid = { x: 0, y: 0 };
    for (let j = 0; j < polygons[i].vertices.length; j++) {
      centroid.x += Number(polygons[i].vertices[j].x);
      centroid.y += Number(polygons[i].vertices[j].y);
    }
    centroid.x /= polygons[i].vertices.length;
    centroid.y /= polygons[i].vertices.length;

    let reducedVertices = [];
    for (let j = 0; j < polygons[i].vertices.length; j++) {
      const vertex = polygons[i].vertices[j];
      const newX = centroid.x + (vertex.x - centroid.x) * 0.3;
      const newY = centroid.y + (vertex.y - centroid.y) * 0.3;
      reducedVertices.push({ x: newX, y: newY });
    }
    polygonData[i].lootBoxesCoordinates = reducedVertices;
  }
}

export { points, delaunay, voronoi, calculatePolygonData, polygonData };