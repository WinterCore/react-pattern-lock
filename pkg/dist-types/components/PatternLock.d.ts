import * as React from "react";
import "../styles/main.styl";
interface ReactPatternLockProps {
    path: number[];
    width?: number | string;
    size?: number;
    pointActiveSize?: number;
    connectorThickness?: number;
    connectorRoundedCorners?: boolean;
    pointSize?: number;
    disabled?: boolean;
    error?: boolean;
    success?: boolean;
    allowOverlapping?: boolean;
    allowJumping?: boolean;
    style?: React.CSSProperties;
    className?: boolean;
    noPop?: boolean;
    invisible?: boolean;
    onStart?(): void;
    onChange(path: number[]): void;
    onFinish(): void;
}
declare const PatternLock: React.FunctionComponent<ReactPatternLockProps>;
export default PatternLock;
