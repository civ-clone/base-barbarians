import Tile from '@civ-clone/core-world/Tile';
export declare const polarRows: (
  height: number,
  rows: number,
  mapRows: number
) => number;
export declare const nearPole: (
  tile: Tile,
  rows: number,
  mapRows: number
) => boolean;
export default nearPole;
