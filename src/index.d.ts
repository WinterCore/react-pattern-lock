interface ReactPatternLockProps {
    path                     : number[];
    width?                   : number | string;
    size?                    : number;
    pointActiveSize?         : number;
    connectorThickness?      : number;
    connectorRoundedCorners? : boolean;
    pointSize?               : number;
    disabled?                : boolean;
    error?                   : boolean;
    success?                 : boolean;
    allowOverlapping?        : boolean;
    allowJumping?            : boolean;
    style?                   : React.CSSProperties,
    className?               : string;
    noPop?                   : boolean;
    invisible?               : boolean;

    onChange(path: number[]) : void;
    onFinish()               : void;
}

type Point = {
    x : number;
    y : number;
};

type Connector = {
    from : Point;
    to   : Point;
};