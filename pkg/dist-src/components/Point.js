import * as React from "react";
const Point = ({ index, pointSize, pointActiveSize, size, selected, pop }) => {
    const percentPerItem = 100 / size;
    return (React.createElement("div", { className: `react-pattern-lock__point-wrapper${selected ? " selected" : ""}`, style: {
            width: `${percentPerItem}%`,
            height: `${percentPerItem}%`,
            flex: `1 0 ${percentPerItem}%`
        }, "data-index": index },
        React.createElement("div", { className: "react-pattern-lock__point", style: {
                width: pointActiveSize,
                height: pointActiveSize
            } },
            React.createElement("div", { className: `react-pattern-lock__point-inner${pop ? " active" : ""}`, style: {
                    minWidth: pointSize,
                    minHeight: pointSize
                } }))));
};
export default Point;
//# sourceMappingURL=Point.js.map