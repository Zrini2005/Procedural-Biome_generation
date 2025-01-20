import { Delaunay } from 'd3-delaunay';

const GRIDSIZE = 7;
const JITTER = 0.5;
let points: { x: number, y: number }[] = [];

//Creating grid points
for (let x = 1; x <= GRIDSIZE; x++) {
  for (let y = 1; y <= GRIDSIZE; y++) {
    points.push({
      x: x + JITTER * (Math.random() - Math.random()),
      y: y + JITTER * (Math.random() - Math.random())
    });
  }
}

let delaunay = Delaunay.from(points, loc => loc.x, loc => loc.y);

const voronoi = delaunay.voronoi([0, 0, GRIDSIZE, GRIDSIZE]);

function calculateCentroids(vertexPoints: typeof points, delaunayData: typeof delaunay) {
  const numTriangles = delaunayData.triangles.length / 3;
  let centroids = [];
  for (let t = 0; t < numTriangles; t++) {
    let sumOfX = 0, sumOfY = 0;
    for (let i = 0; i < 3; i++) {
      let s = 3 * t + i;
      let p = vertexPoints[delaunayData.triangles[s]];
      sumOfX += p.x;
      sumOfY += p.y;
    }
    centroids[t] = { x: sumOfX / 3, y: sumOfY / 3 };
  }
  return centroids;
}

let map = {
  points: points,
  numRegions: points.length,
  numTriangles: delaunay.halfedges.length / 3,
  numEdges: delaunay.halfedges.length,
  halfedges: delaunay.halfedges,
  triangles: delaunay.triangles,
  centers: calculateCentroids(points, delaunay)
};

export { map, points, delaunay, voronoi };