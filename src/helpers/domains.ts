// simplex noise: https://github.com/jwagner/simplex-noise.js
import { createNoise2D } from 'simplex-noise';

// Seed is set to 10
const noise2D = createNoise2D(() => 10)

function randomWalkGen() {
  let walker: number[] = [];

  walker.push(24);

  const randomOption = (i: number): integer => {
    return Math.abs(Math.floor(noise2D(i, i+1) * 4)) % 4;
  }

  const within6x6Bounds = (i: number): boolean => {
    return i % 7 !== 0 && i % 7 !== 6 && i > 6 && i < 42;
  }

  const options = [-1, 1, -7, 7]
  let i = 0;
  while (walker.length< 20) {
    const currentInd = walker[walker.length - 1];
    const dir = options[randomOption(i)];
    const nextInd = currentInd + dir;
    if (within6x6Bounds(nextInd) && !walker.includes(nextInd)) {
      walker.push(nextInd);
    }
    i++;
  }
  
  console.log(walker)
  return walker;
}

export { randomWalkGen }