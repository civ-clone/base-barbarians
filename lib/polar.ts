import Tile from '@civ-clone/core-world/Tile';

// `rows` of a map `mapRows` high, as the same share of a map `height` high, rounded: a rule set's distance from the
//  poles measured on a map of another size.
export const polarRows = (
  height: number,
  rows: number,
  mapRows: number
): number => Math.round((height * rows) / mapRows);

// Whether `tile` is within `rows` of `mapRows` (scaled to its map's height) of the top or bottom edge.
export const nearPole = (
  tile: Tile,
  rows: number,
  mapRows: number
): boolean => {
  const height = tile.map().height(),
    margin = polarRows(height, rows, mapRows);

  return tile.y() < margin || tile.y() >= height - margin;
};

export default nearPole;
