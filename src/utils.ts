import { useRef, useEffect } from "react";

export const usePrevious = (val: any) => {
  const ref = useRef();
  useEffect(() => ref.current = val, [val]);
  return ref.current;
};

export const getPoints = ({
    pointActiveSize,
    height,
    size
}: { pointActiveSize : number, height : number, size : number }): Point[] => {
    const halfSize        = pointActiveSize / 2;
    const sizePerItem     = height / size;
    const halfSizePerItem = sizePerItem / 2;
    return Array.from({ length : size ** 2 }).map((x, i) => ({
        x : ((sizePerItem * (i % size)) + halfSizePerItem) - halfSize,
        y : ((sizePerItem * Math.floor(i / size)) + halfSizePerItem) - halfSize
    }));
};

export const getDistance = (p1: Point, p2: Point): number => Math.sqrt(((p2.x - p1.x) ** 2) + ((p2.y - p1.y) ** 2));
export const getAngle    = (p1: Point, p2: Point): number => Math.atan2(p2.y - p1.y, p2.x - p1.x);


export const getCollidedPointIndex = (
    { x, y }        : Point, // Mouse position
    points          : Point[], // Pattern points
    pointActiveSize : number // Point active diameter
): number => {
    for (let i = 0; i < points.length; i += 1) {
        if (
            x > points[i].x
            && x < points[i].x + pointActiveSize
            && y > points[i].y
            && y < points[i].y + pointActiveSize
        ) return i;
    }
    return -1;
};


export const getConnectorPoint = (
    p                  : Point,
    pointActiveSize    : number,
    connectorThickness : number
): Point => ({
    x : p.x + Math.floor(pointActiveSize / 2),
    y : p.y + Math.floor(pointActiveSize / 2) - Math.floor(connectorThickness / 2)
});

export const getPointsInTheMiddle = (index1: number, index2: number, size: number): number[] => {
    const x1 = index1 % size;
    const y1 = Math.floor(index1 / size);

    const x2 = index2 % size;
    const y2 = Math.floor(index2 / size);

    if (y1 === y2) { // Horizontal
        const xDifference = Math.abs(x1 - x2);
        if (xDifference > 1) {
            const points = [];
            const min = Math.min(x1, x2);
            for (let i = 1; i < xDifference; i += 1) {
                const point = (y1 * size) + i + min;
                points.push(point);
            }
            return points;
        }
    } else if (x1 === x2) { // Vertical
        const yDifference = Math.abs(y1 - y2);
        if (yDifference > 1) {
            const points = [];
            const min = Math.min(y1, y2);
            for (let i = 1; i < yDifference; i += 1) {
                const point = ((i + min) * size) + x1;
                points.push(point);
            }
            return points;
        }
    } else { // Diagonal
        const xDifference = Math.abs(x1 - x2);
        const yDifference = Math.abs(y1 - y2);
        if (xDifference === yDifference && xDifference > 1) {
            const dirX = x2 - x1 > 0 ? 1 : -1;
            const dirY = y2 - y1 > 0 ? 1 : -1;
            const points = [];
            for (let i = 1; i < yDifference; i += 1) {
                const point = (((i * dirY) + y1) * size) + (i * dirX) + x1;
                points.push(point);
            }
            return points;
        }
    }
    return [];
};