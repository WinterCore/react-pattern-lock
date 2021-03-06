import * as React from "react";

import { getAngle, getDistance, getConnectorPoint } from "../utils";
import { Point } from "../types";

type Connector = {
    from : Point;
    to   : Point;
};

interface ConnectorsProps {
    path                    : number[];
    connectorThickness      : number;
    connectorRoundedCorners : boolean;
    pointActiveSize         : number;
    points                  : Point[];
    wrapperPosition         : Point;
    initialMousePosition    : Point | null;
}

const Connectors: React.FunctionComponent<ConnectorsProps> = ({
    path,
    points,
    wrapperPosition,
    pointActiveSize,
    connectorThickness,
    connectorRoundedCorners,
    initialMousePosition
}) => {
    const [mouse, setMouse] = React.useState<Point | null>(null);

    React.useEffect(() => setMouse(initialMousePosition), [initialMousePosition])

    const {
        setMousePosition,
        setTouchPosition
    } = React.useMemo(() => ({
        setMousePosition: ({ clientX, clientY }: MouseEvent) : void =>
            setMouse({ x: clientX - wrapperPosition.x + window.scrollX, y : clientY - wrapperPosition.y + window.scrollY }),
        setTouchPosition: ({ touches }: TouchEvent): void =>
            setMouse({ x: touches[0].clientX - wrapperPosition.x + window.scrollX, y : touches[0].clientY - wrapperPosition.y + window.scrollY })
    }), [wrapperPosition]);

    React.useEffect(() => {
        if (!initialMousePosition) return;
        window.addEventListener("mousemove", setMousePosition);
        window.addEventListener("touchmove", setTouchPosition);
        return () => {
            window.removeEventListener("mousemove", setMousePosition);
            window.removeEventListener("touchmove", setTouchPosition);
        };
    });

    const connectors: Connector[] = [];
    for (let i = 0; i < path.length - 1; i += 1) {
        const current = points[path[i]];
        const next    = points[path[i + 1]];
        connectors.push({
            from : getConnectorPoint(current, pointActiveSize, connectorThickness),
            to   : getConnectorPoint(next, pointActiveSize, connectorThickness)
        });
    }
    if (mouse && path.length) {
        
        connectors.push({
            from : getConnectorPoint(points[path[path.length - 1]], pointActiveSize, connectorThickness),
            to   : mouse
        });
    }

    return (
        <div className="react-pattern-lock__connector-wrapper">
            {
                connectors.map(({ from, to }, i) => (
                    <div
                        className="react-pattern-lock__connector"
                        key={ i }
                        style={{
                            transform    : `rotate(${getAngle(from, to)}rad)`,
                            width        : `${getDistance(from, to)}px`,
                            left         : `${from.x}px`,
                            top          : `${from.y}px`,
                            height       : connectorThickness,
                            borderRadius : connectorRoundedCorners ? Math.round(connectorThickness / 2) : 0
                        }}
                    />
                ))
            }
        </div>
    );
};

export default Connectors;