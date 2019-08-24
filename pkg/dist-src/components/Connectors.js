import * as React from "react";
import { getAngle, getDistance, getConnectorPoint } from "../utils";
const Connectors = ({ path, points, wrapperPosition, pointActiveSize, connectorThickness, connectorRoundedCorners, initialMousePosition }) => {
    const [mouse, setMouse] = React.useState(null);
    React.useEffect(() => setMouse(initialMousePosition), [initialMousePosition]);
    const { setMousePosition, setTouchPosition } = React.useMemo(() => ({
        setMousePosition: ({ clientX, clientY }) => setMouse({ x: clientX - wrapperPosition.x, y: clientY - wrapperPosition.y + window.scrollY }),
        setTouchPosition: ({ touches }) => setMouse({ x: touches[0].clientX - wrapperPosition.x, y: touches[0].clientY - wrapperPosition.y + window.scrollX })
    }), [wrapperPosition]);
    React.useEffect(() => {
        if (!initialMousePosition)
            return;
        window.addEventListener("mousemove", setMousePosition);
        window.addEventListener("touchmove", setTouchPosition);
        return () => {
            window.removeEventListener("mousemove", setMousePosition);
            window.removeEventListener("touchmove", setTouchPosition);
        };
    });
    const connectors = [];
    for (let i = 0; i < path.length - 1; i += 1) {
        const current = points[path[i]];
        const next = points[path[i + 1]];
        connectors.push({
            from: getConnectorPoint(current, pointActiveSize, connectorThickness),
            to: getConnectorPoint(next, pointActiveSize, connectorThickness)
        });
    }
    if (mouse && path.length) {
        connectors.push({
            from: getConnectorPoint(points[path[path.length - 1]], pointActiveSize, connectorThickness),
            to: mouse
        });
    }
    return (React.createElement("div", { className: "react-pattern-lock__connector-wrapper" }, connectors.map(({ from, to }, i) => (React.createElement("div", { className: "react-pattern-lock__connector", key: i, style: {
            transform: `rotate(${getAngle(from, to)}rad)`,
            width: `${getDistance(from, to)}px`,
            left: `${from.x}px`,
            top: `${from.y}px`,
            height: connectorThickness,
            borderRadius: connectorRoundedCorners ? Math.round(connectorThickness / 2) : 0
        } })))));
};
export default Connectors;
//# sourceMappingURL=Connectors.js.map