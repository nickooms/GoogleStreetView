export const flatten = x => [].concat(...x);

export const polygon = wkt => wkt
  .replace(/POLYGON \(\(|\)\)/g, '')
  .split(', ')
  .map(point => point.split(' ').map(parseFloat));
