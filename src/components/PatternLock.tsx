import * as React      from "react";
import * as classnames from "classnames";
import * as PropTypes  from "prop-types";
import { createGlobalStyle } from "styled-components";

import Point      from "./Point";
import Connectors from "./Connectors";

import { getPoints, getCollidedPointIndex, getPointsInTheMiddle } from "../utils";
import { Point as PointType } from "../types";

const Styles = createGlobalStyle`
    * {
        user-select none
    }

    .react-pattern-lock__pattern-wrapper {
        touch-action: none;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        position: relative;
    }
    .react-pattern-lock__connector-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
    }
    .react-pattern-lock__connector {
        background: white;
        position: absolute;
        transform-origin: center left;
    }
    .react-pattern-lock__point-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .react-pattern-lock__point {
        cursor pointer;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .react-pattern-lock__point-inner {
        background: white;
        border-radius: 50%;
    }
    .react-pattern-lock__point-inner.active {
        animation: pop 300ms ease;
    }
    .react-pattern-lock__pattern-wrapper.disabled,
    .react-pattern-lock__pattern-wrapper.disabled .react-pattern-lock__point {
        cursor: not-allowed;
    }
    .react-pattern-lock__pattern-wrapper.disabled .react-pattern-lock__point-inner,
    .react-pattern-lock__pattern-wrapper.disabled .react-pattern-lock__connector {
        background: grey;
    }

    .react-pattern-lock__pattern-wrapper.success .react-pattern-lock__point-inner,
    .react-pattern-lock__pattern-wrapper.success .react-pattern-lock__connector {
        background: #00ff00;
    }

    .react-pattern-lock__pattern-wrapper.error .react-pattern-lock__point-inner,
    .react-pattern-lock__pattern-wrapper.error .react-pattern-lock__connector {
        background: red;
    }

    @keyframes pop {
        from { transform scale(1); }
        50% { transform scale(2); }
        to { transform scale(1); }
    }
`;

interface PatternLockProps {
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

const PatternLock: React.FunctionComponent<PatternLockProps> = ({
    width                   = "100%",
    size                    = 5,
    pointActiveSize         = 30,
    pointSize               = 20,
    connectorThickness      = 6,
    connectorRoundedCorners = false,
    disabled                = false,
    error                   = false,
    success                 = false,
    allowOverlapping        = false,
    noPop                   = false,
    invisible               = false,
    allowJumping            = false,
    className               = "",
    style                   = {},
    onChange,
    onFinish,
    path
}) => {
    const wrapperRef                                      = React.useRef<HTMLDivElement>(document.createElement("div"));
    const [height, setHeight]                             = React.useState<number>(0);
    const [points, setPoints]                             = React.useState<PointType[]>([]);
    const [position, setPosition]                         = React.useState<PointType>({ x : 0, y : 0 });
    const [isMouseDown, setIsMouseDown]                   = React.useState<boolean>(false);
    const [initialMousePosition, setInitialMousePosition] = React.useState<PointType | null>(null);

    const checkCollision = ({ x, y }: PointType): void => {
        const mouse = { x : x - position.x + window.scrollX, y : y - position.y + window.scrollY }; // relative to the container as opposed to the screen
        const index = getCollidedPointIndex(mouse, points, pointActiveSize);
        if (~index && path[path.length - 1] !== index) {
            if (allowOverlapping || path.indexOf(index) === -1) {
                if (allowJumping || !path.length) {
                    onChange([...path, index]);
                } else {
                    let pointsInTheMiddle = getPointsInTheMiddle(path[path.length - 1], index, size);
                    if (allowOverlapping) onChange([...path, ...pointsInTheMiddle, index]);
                    else onChange([...path, ...pointsInTheMiddle.filter(point => path.indexOf(point) === -1), index]);
                }
            }
        }
    };

    const onHold = ({ clientX, clientY }: React.MouseEvent) => {
        if (disabled) return;
        setInitialMousePosition({ x : clientX - position.x + window.scrollX, y : clientY - position.y + window.scrollY });
        setIsMouseDown(true);
        checkCollision({ x : clientX, y : clientY });
    };

    const onTouch = ({ touches }: React.TouchEvent) => {
        if (disabled) return;
        setInitialMousePosition({ x : touches[0].clientX - position.x + window.scrollX, y : touches[0].clientY - position.y + window.scrollY });
        setIsMouseDown(true);
        checkCollision({ x: touches[0].clientX, y : touches[0].clientY });
    };

    const onResize = () => {
        const { top, left } = wrapperRef.current.getBoundingClientRect();
        setPosition({ x : left + window.scrollX, y : top + window.scrollY });
    };
    
    React.useEffect(() => {
        if (!isMouseDown) return;
        const onMouseMove = ({ clientX, clientY }: MouseEvent): void => checkCollision({ x : clientX, y : clientY });
        const onTouchMove = ({ touches }: TouchEvent): void => checkCollision({ x: touches[0].clientX, y : touches[0].clientY });
        wrapperRef.current.addEventListener("mousemove", onMouseMove);
        wrapperRef.current.addEventListener("touchmove", onTouchMove);
        return () => {
            wrapperRef.current.removeEventListener("mousemove", onMouseMove);
            wrapperRef.current.removeEventListener("touchmove", onTouchMove);
        };
    });

    React.useEffect(() => setHeight(wrapperRef.current.offsetWidth));
    React.useEffect(() => {
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    React.useEffect(() => {
        const rafId = window.requestAnimationFrame(() => {
            setPoints(getPoints({ pointActiveSize, height, size }));
            onResize();
        });
        return () => window.cancelAnimationFrame(rafId);
    }, [height, size]);

    React.useEffect(() => {
        const onRelease = () => {
            setIsMouseDown(false);
            setInitialMousePosition(null);
            if (!disabled && path.length) onFinish();
        };

		window.addEventListener("mouseup", onRelease);
		window.addEventListener("touchend", onRelease);

        return () => {
            window.removeEventListener("mouseup", onRelease);
            window.removeEventListener("touchend", onRelease);
        };
    }, [disabled, path]);

    return (
        <>
            <Styles />
            <div
                className    = { classnames([ "react-pattern-lock__pattern-wrapper", { error, success, disabled }, className ]) }
                style        = {{ ...style, width, height }}
                onMouseDown  = { onHold }
                onTouchStart = { onTouch }
                ref          = { wrapperRef }
            >
                {
                    Array.from({ length: size ** 2 }).map((_, i) => (
                        <Point
                            key             = { i }
                            index           = { i }
                            size            = { size }
                            pointSize       = { pointSize }
                            pointActiveSize = { pointActiveSize }
                            pop             = { !noPop && isMouseDown && path[path.length - 1] === i }
                            selected        = { path.indexOf(i) > -1 }
                        />
                    ))
                }
                {
                    !invisible && points.length && 
                        <Connectors
                            initialMousePosition    = { initialMousePosition }
                            wrapperPosition         = { position }
                            path                    = { path }
                            points                  = { points }
                            pointActiveSize         = { pointActiveSize }
                            connectorRoundedCorners = { connectorRoundedCorners }
                            connectorThickness      = { connectorThickness }
                        />
                }
                
            </div>
        </>
    );
};

PatternLock.propTypes = {
    path                    : PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    width                   : PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    size                    : PropTypes.number,
    pointActiveSize         : PropTypes.number,
    connectorThickness      : PropTypes.number,
    connectorRoundedCorners : PropTypes.bool,
    pointSize               : PropTypes.number,
    disabled                : PropTypes.bool,
    error                   : PropTypes.bool,
    success                 : PropTypes.bool,
    allowOverlapping        : PropTypes.bool,
    allowJumping            : PropTypes.bool,
    style                   : PropTypes.object,
    className               : PropTypes.string,
    noPop                   : PropTypes.bool,
    invisible               : PropTypes.bool,
    onChange                : PropTypes.func.isRequired,
    onFinish                : PropTypes.func.isRequired
};


export default PatternLock;