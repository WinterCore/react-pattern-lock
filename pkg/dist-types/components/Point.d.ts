import * as React from "react";
interface PointProps {
    index: number;
    pointSize: number;
    pointActiveSize: number;
    size: number;
    pop: boolean;
    selected: boolean;
}
declare const Point: React.FunctionComponent<PointProps>;
export default Point;
