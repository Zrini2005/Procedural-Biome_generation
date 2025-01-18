import { Delaunay } from 'd3-delaunay';

const GRIDSIZE = 6;
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


function triangleOfEdge(e: number) { return Math.floor(e / 3); }
function nextHalfedge(e: number) { return (e % 3 === 2) ? e - 2 : e + 1; }


function edgesAroundPoint(delaunayData: typeof delaunay, start: number) {
  const result = [];
  let incoming = start;
  do {
    result.push(incoming);
    const outgoing = nextHalfedge(incoming);
    incoming = delaunayData.halfedges[outgoing];
  } while (incoming !== -1 && incoming !== start);
  return result;
}


points.push({ x: -10, y: GRIDSIZE / 2 });
points.push({ x: GRIDSIZE + 10, y: GRIDSIZE / 2 });
points.push({ y: -10, x: GRIDSIZE / 2 });
points.push({ y: GRIDSIZE + 10, x: GRIDSIZE / 2 });
points.push({ x: -10, y: -10 });
points.push({ x: GRIDSIZE + 10, y: GRIDSIZE + 10 });
points.push({ y: -10, x: GRIDSIZE + 10 });
points.push({ y: GRIDSIZE + 10, x: -10 });

// draw the same thing at the top of the page, but with boundary points
delaunay = Delaunay.from(points, loc => loc.x, loc => loc.y);
map = {
  points,
  numRegions: points.length,
  numTriangles: delaunay.halfedges.length / 3,
  numEdges: delaunay.halfedges.length,
  halfedges: delaunay.halfedges,
  triangles: delaunay.triangles,
  centers: calculateCentroids(points, delaunay)
}

export {map, points, nextHalfedge, delaunay, edgesAroundPoint, triangleOfEdge};