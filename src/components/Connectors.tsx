import * as React from "react";

import { getAngle, getDistance, getConnectorPoint } from "../utils";

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
        setMousePosition : ({ clientX, clientY }: MouseEvent) : void =>
            setMouse({ x : clientX - wrapperPosition.x, y : clientY - wrapperPosition.y + window.scrollY }),
        setTouchPosition : ({ touches }: TouchEvent)          : void =>
            setMouse({ x: touches[0].clientX - wrapperPosition.x, y : touches[0].clientY - wrapperPosition.y + window.scrollX })
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
            {/* {
                path.map((x, i) => {
                    const toMouse = i === path.length - 1;
                    if () return null;

                    const fr = this.getExactPointPosition(this.state.points[x]);
                    let to = null;
                    if (toMouse) {
                        to = {
                            x : this.state.position.x,
                            y : this.state.position.y - (this.props.connectorWidth / 2)
                        };
                    } else {
                        to = this.getExactPointPosition(this.state.points[arr[i + 1]]);
                    }
                    return (
                        <div
                            className="react-pattern-lock__connector"
                            key={ i }
                            style={{
                                background   : this.getColor(this.props.connectorColor),
                                transform    : `rotate(${getAngle(fr, to)}rad)`,
                                width        : `${getDistance(fr, to)}px`,
                                left         : `${fr.x}px`,
                                top          : `${fr.y}px`,
                                height       : this.props.connectorWidth,
                                borderRadius : this.props.connectorRoundedCorners
                                    ? Math.round(this.props.connectorWidth / 2)
                                    : 0
                            }}
                        />
                    );
                })
            } */}
            {/* <div
                className="react-pattern-lock__connector"
                key={ i }
                style={{
                    background   : this.getColor(this.props.connectorColor),
                    transform    : `rotate(${getAngle(fr, to)}rad)`,
                    width        : `${getDistance(fr, to)}px`,
                    left         : `${fr.x}px`,
                    top          : `${fr.y}px`,
                    height       : connectorThickness,
                    borderRadius : connectorRoundedCorners
                        ? Math.floor(this.props.connectorWidth / 2)
                        : 0
                }}
            /> */}
        </div>
    );
};

export default Connectors;