"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nearPole = exports.polarRows = void 0;
// `rows` of a map `mapRows` high, as the same share of a map `height` high, rounded: a rule set's distance from the
//  poles measured on a map of another size.
const polarRows = (height, rows, mapRows) => Math.round((height * rows) / mapRows);
exports.polarRows = polarRows;
// Whether `tile` is within `rows` of `mapRows` (scaled to its map's height) of the top or bottom edge.
const nearPole = (tile, rows, mapRows) => {
    const height = tile.map().height(), margin = (0, exports.polarRows)(height, rows, mapRows);
    return tile.y() < margin || tile.y() >= height - margin;
};
exports.nearPole = nearPole;
exports.default = exports.nearPole;
//# sourceMappingURL=polar.js.map