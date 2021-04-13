import { useRef, useEffect } from "react";
import { Point } from "./types";

export const usePrevious = <T>(val: T): T | undefined => {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = val
    }, [val]);
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

export const exclusiveRange = (rawStart: number, stop: number): number[] => {
    if (rawStart === stop) return [];
    const start = rawStart > stop ? rawStart - 1 : rawStart + 1;
    const step = start > stop ? -1 : 1;
    return Array.from({ length : Math.abs(start - stop) })
        .map((_, i) => start + i * step);
}

export const getPointsInTheMiddle = (index1: number, index2: number, size: number): number[] => {
    const x1 = index1 % size;
    const x2 = index2 % size;

    const y1 = Math.floor(index1 / size);
    const y2 = Math.floor(index2 / size);
    const deltaX = Math.abs(x1 - x2);
    const deltaY = Math.abs(y1 - y2);

    if (y1 === y2) { // Horizontal
        return exclusiveRange(size * y1 + x1, size * y2 + x2);
    } else if (x1 === x2) { // Vertical
        return exclusiveRange(y1, y2).map(x => x * size + x1);
    } else if (deltaX === deltaY) { // Diagonal
        const m = x1 < x2 ? 1 : -1;
        return exclusiveRange(y1, y2).map((x, i) => x * size + x1 + ((i + 1) * m));
    }
    return [];
};