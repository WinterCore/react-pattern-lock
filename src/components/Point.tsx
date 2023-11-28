import * as React from "react";

interface PointProps {
    index: number;
    pointSize: number;
    pointActiveSize: number;
    size: number;
    pop: boolean;
    selected: boolean;
    firstPointColorEnabled: boolean;
    firstPointColor: string;
}

const Point: React.FunctionComponent<PointProps> = ({
    index,
    pointSize,
    pointActiveSize,
    size,
    selected,
    pop,
    firstPointColorEnabled,
    firstPointColor
}) => {
    const percentPerItem = 100 / size;
    const pointInnerStyle = (index === 0 && firstPointColorEnabled) ? { backgroundColor: firstPointColor } : {};

    return (
        <div
            className={`react-pattern-lock__point-wrapper${selected ? " selected" : ""}`}
            style={{
                width: `${percentPerItem}%`,
                height: `${percentPerItem}%`,
                flex: `1 0 ${percentPerItem}%`
            }}
            data-index={index}
        >
            <div
                className="react-pattern-lock__point"
                style={{
                    width: pointActiveSize,
                    height: pointActiveSize
                }}
            >
                <div
                    className={`react-pattern-lock__point-inner${pop ? " active" : ""}`}
                    style={{
                        minWidth: pointSize,
                        minHeight: pointSize,
                        ...pointInnerStyle // Appliquer le style conditionnel au point lui-même
                    }}
                />
            </div>
        </div>
    );
};

export default Point;
