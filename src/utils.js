// Computes area of a polygon, given a list of points
export const polygonArea = points => {
  let area = 0;
  let j = points.length - 1;

  for (let i=0; i < points.length; i++) {
    area += (points[j][0] + points[i][0]) * (points[j][1] - points[i][1]);
    j = i;
  }

  return Math.abs(0.5 * area);
}

// Computes a list of polygon point lists from an SVG path 'd' string
const svgPathToPolygons = d => {
  const commands = d
    .split(/(?=M|m|L|l|H|h|V|v|Z|z)/g)
    .map(str => str.trim());

  const polygons = [];

  let points = [];

  for (let cmd of commands) {
    const op = cmd.substring(0, 1);

    if (op.toLowerCase() === 'z') {
      polygons.push([...points]);
      points = [];
    } else {
      const xy = cmd.substring(1).split(' ')
        .map(str => parseFloat(str.trim()));
  
      // Uppercase ops are absolute coords -> transform
      const isUppercase = op === op.toUpperCase();

      const x = isUppercase ? xy[0] : xy[0] + points[points.length - 1][0];
      const y = isUppercase ? xy[1] : xy[1] + points[points.length - 1][1];

      points.push([x, y]);
    }
  }

  if (points.length > 0) // Unclosed path - close for area computation
    polygons.push([...points]); 

  return polygons;
}

// Computes the area under an SVG path
export const svgPathArea = d => {
  const polygons = svgPathToPolygons(d);

  if (polygons.length == 1) {
    return polygonArea(polygons[0]);
  } else {
    // Helper to check if a polygon is a hole
    const isHole = p => polygons.find(other => {
      if (p !== other)
        return polygonInPolygon(p, other); 
    })

    let area = 0

    for (let poly of polygons) {
      if (isHole(poly))
        area -= polygonArea(poly);
      else 
        area += polygonArea(poly);
    }

    return area;
  }
}