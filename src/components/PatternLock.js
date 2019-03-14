import React, { PureComponent } from "react";
import PropTypes                from "prop-types";

import "../styles/pattern-lock.styl";


const getDistance = (p1, p2) => Math.sqrt(((p2.x - p1.x) ** 2) + ((p2.y - p1.y) ** 2));
const getAngle    = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

class PatternLock extends PureComponent {
	static displayName = "PatternLock";
	static propTypes = {
		width : PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
		path  : PropTypes.array,

		onChange     : PropTypes.func,
		onDotConnect : PropTypes.func,

		className : PropTypes.string,
		style     : PropTypes.object,

		errorColor  : PropTypes.string,
		freezeColor : PropTypes.string,

		pointColor      : PropTypes.string,
		pointSize       : PropTypes.number,
		pointActiveSize : PropTypes.number,

		connectorWidth          : PropTypes.number,
		connectorColor          : PropTypes.string,
		connectorRoundedCorners : PropTypes.bool,

		disabledColor : PropTypes.string,

		invisible : PropTypes.bool,
		noPop     : PropTypes.bool,
		disabled  : PropTypes.bool,
		freeze    : PropTypes.bool,

		allowOverlapping : PropTypes.bool,
		allowJumping     : PropTypes.bool,

		size(props, name) {
			if (props[name] < 2 || props[name] > 15) return new Error("Size must be between 2 and 15");
		}
	};

	static defaultProps = {
		size : 3,
		path : [],

		onChange() { return Promise.resolve(); },
		onDotConnect() {},

		className : "",
		style     : {},

		errorColor  : "#F00",
		freezeColor : "#779ecb",

		pointColor      : "#FFF",
		pointSize       : 10,
		pointActiveSize : 30,

		connectorWidth          : 2,
		connectorColor          : "#FFF",
		connectorRoundedCorners : false,

		disabledColor : "#BBB",

		invisible : false,
		noPop     : false,
		disabled  : false,
		freeze    : false,

		allowOverlapping : false,
		allowJumping     : false
	};

	static getPositionFromEvent({ clientX, clientY, touches }) {
		if (touches && touches.length) return { x : touches[0].clientX, y : touches[0].clientY };
		return { x : clientX, y : clientY };
	}

	constructor(props) {
		super(props);

		this.points  = [];

		for (let i = (props.size ** 2) - 1; i >= 0; i -= 1) this.points.push({ x : 0, y : 0 });

		const frozen = props.path.length && props.freeze;

		this.state = {
			height    : 0,
			path      : frozen ? props.path : [],
			position  : { x : 0, y : 0 },
			error     : false,
			isFrozen  : frozen,
			isLoading : false
		};

		this.unerrorTimeout = 0;

		this.onHold    = this.onHold.bind(this);
		this.onRelease = this.onRelease.bind(this);
		this.onMove    = this.onMove.bind(this);

		this.left = 0;
		this.top  = 0;
	}

	componentDidMount() {
		const height = this.wrapper.offsetWidth;
		this.setState({ height }, () => {
			this.updateProperties();
			this.forceUpdate();
		});
		if (this.state.isFrozen) {
			this.onChange();
		}
		window.addEventListener("mouseup", this.onRelease);
		window.addEventListener("touchend", this.onRelease);
	}

	componentWillUnmount() {
		clearTimeout(this.unerrorTimeout);

		window.removeEventListener("mouseup", this.onRelease);
		window.removeEventListener("touchend", this.onRelease);
	}

	onHold(evt) {
		if (!this.isDisabled) {
			this.updateProperties();
			this.wrapper.addEventListener("mousemove", this.onMove);
			this.wrapper.addEventListener("touchmove", this.onMove);
			this.reset();
			this.updateMousePositionAndCheckCollision(evt, true);
		}
	}

	onRelease() {
		this.wrapper.removeEventListener("mousemove", this.onMove);
		this.wrapper.removeEventListener("touchmove", this.onMove);

		if (!this.isDisabled && this.state.path.length > 0 && !this.state.error) {
			this.onChange();
		}
	}

	onChange() {
		this.setState({ isLoading : true });
		// validate
		const validate = this.props.onChange(this.state.path);
		if (typeof validate.then !== "function") throw new Error("The onChange prop must return a promise.");
		validate.then(() => {
			if (this.shouldFreezeResult) {
				this.setState({ isLoading : false, isFrozen : true });
			} else {
				this.reset();
				this.setState({ isLoading : false });
			}
		}).catch((err) => {
			this.error(err);
			this.setState({ isLoading : false });
		});
	}

	onMove(evt) {
		this.updateMousePositionAndCheckCollision(evt);
	}

	get isDisabled() {
		return this.props.disabled || this.state.isLoading;
	}

	get shouldFreezeResult() {
		return this.props.freeze;
	}

	getExactPointPosition({ x, y }) {
		const halfActiveSize     = Math.floor(this.props.pointActiveSize / 2);
		const halfConnectorWidth = Math.floor(this.props.connectorWidth / 2);
		return {
			x : x + halfActiveSize,
			y : (y + halfActiveSize) - halfConnectorWidth
		};
	}

	getColor(defaultColor, isActive = true) {
		if (this.state.error && isActive) return this.props.errorColor;
		if (this.state.isFrozen && isActive) return this.props.freezeColor;
		if (this.isDisabled) return this.props.disabledColor;
		return defaultColor;
	}


	updateMousePositionAndCheckCollision(evt, reset) {
		const { x, y } = PatternLock.getPositionFromEvent(evt);
		const position = { x : x - this.left, y : y - this.top };

		this.setState({
			path : reset ? [] : this.state.path,
			position
		}, this.detectCollision.bind(this, position));
	}

	activate(i) {
		let path = [...this.state.path];
		if (!this.props.allowJumping) {
			path = [...path, ...this.checkJumping(this.state.path[this.state.path.length - 1], i)];
		}
		path.push(i);
		this.setState({ path });
		this.props.onDotConnect(i);
	}

	detectCollision({ x, y }) {
		const { pointActiveSize, allowOverlapping } = this.props;
		const { path } = this.state;

		this.points.forEach((point, i) => {
			if ((allowOverlapping && path[path.length - 1] !== i) || path.indexOf(i) === -1) {
				if (
					x > point.x
					&& x < point.x + pointActiveSize
					&& y > point.y
					&& y < point.y + pointActiveSize
				) {
					this.activate(i);
				}
			}
		});
	}

	checkJumping(prev, next) {
		const { size } = this.props;
		const { path } = this.state;

		const x1 = prev % size;
		const y1 = Math.floor(prev / size);

		const x2 = next % size;
		const y2 = Math.floor(next / size);

		if (y1 === y2) { // Horizontal
			const xDifference = Math.abs(x1 - x2);
			if (xDifference > 1) {
				const points = [];
				const min = Math.min(x1, x2);
				for (let i = 1; i < xDifference; i += 1) {
					const point = (y1 * size) + i + min;
					if (path.indexOf(point) === -1) points.push(point);
				}
				return points;
			}
		} else if (x1 === x2) { // Vertical
			const yDifference = Math.abs(y1 - y2);
			if (yDifference > 1) {
				const points = [];
				const min = Math.min(y1, y2);
				for (let i = 1; i < yDifference; i += 1) {
					const point = ((i + min) * size) + x1;
					if (path.indexOf(point) === -1) points.push(point);
				}
				return points;
			}
		} else { // Diagonal
			const xDifference = Math.abs(x1 - x2);
			const yDifference = Math.abs(y1 - y2);
			if (xDifference === yDifference && xDifference > 1) {
				const dirX = x2 - x1 > 0 ? 1 : -1;
				const dirY = y2 - y1 > 0 ? 1 : -1;
				const points = [];
				for (let i = 1; i < yDifference; i += 1) {
					const point = (((i * dirY) + y1) * size) + (i * dirX) + x1;
					if (path.indexOf(point) === -1) points.push(point);
				}
				return points;
			}
		}
		return [];
	}

	updateProperties() {
		const halfSize        = this.props.pointActiveSize / 2;
		const { left, top }   = this.wrapper.getBoundingClientRect();
		const { size }        = this.props;
		const sizePerItem     = this.state.height / this.props.size;
		const halfSizePerItem = sizePerItem / 2;

		this.left = left;
		this.top  = top;

		this.points = this.points.map((x, i) => ({
			x : ((sizePerItem * (i % size)) + halfSizePerItem) - halfSize,
			y : ((sizePerItem * Math.floor(i / size)) + halfSizePerItem) - halfSize
		}));
	}


	error() {
		this.setState({ error : true });
		this.unerrorTimeout = setTimeout(() => { this.reset(); }, 3000);
	}

	reset() {
		clearTimeout(this.unerrorTimeout);
		this.setState({
			error    : false,
			isFrozen : false,
			path     : []
		});
	}

	renderConnectors() {
		return (
			<div className="react-pattern-lock__connector-wrapper">
				{
					this.state.path.map((x, i, arr) => {
						const toMouse = arr[i + 1] === undefined;
						if (
							toMouse
							&& (
								this.isDisabled
								|| this.state.error
								|| this.state.isFrozen
							)
						) return null;

						const fr = this.getExactPointPosition(this.points[x]);
						let to = null;
						if (toMouse) {
							to = {
								x : this.state.position.x,
								y : this.state.position.y - (this.props.connectorWidth / 2)
							};
						} else {
							to = this.getExactPointPosition(this.points[arr[i + 1]]);
						}
						return (
							<div
								className="react-pattern-lock__connector"
								key={`${x}-${arr[i + 1]}`}
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
				}
			</div>
		);
	}

	renderPoints() {
		const {
			pointSize,
			pointActiveSize,
			pointColor,
			size
		} = this.props;

		return this.points.map((x, i) => {
			const activeIndex = this.state.path.indexOf(i);
			const isActive = activeIndex > -1;
			const orderNumber = isActive ? activeIndex + 1 : null;
			const percentPerItem = 100 / size;

			return (
				<div
					key={ i }
					className="react-pattern-lock__point-wrapper"
					style={{
						width  : `${percentPerItem}%`,
						height : `${percentPerItem}%`,
						flex   : `1 0 ${percentPerItem}%`
					}}
				>
					<div
						className="react-pattern-lock__point"
						style={{
							width  : pointActiveSize,
							height : pointActiveSize
						}}
					>
						<div
							className={ isActive && !this.props.noPop ? "active" : "" }
							style={{
								minWidth   : pointSize,
								minHeight  : pointSize,
								background : this.getColor(pointColor, isActive)
							}}
							data-order-number={orderNumber}
						/>
					</div>
				</div>
			);
		});
	}

	render() {
		return (
			<div
				ref={ (elem) => { this.wrapper = elem; } }
				className={`react-pattern-lock__pattern-wrapper${this.state.error ? " error" : ""}${this.isDisabled ? " disabled" : ""} ${this.props.className}` }
				style={{ ...this.props.style, width : this.props.width, height : this.state.height }}
				onMouseDown={ this.onHold }
				onTouchStart={ this.onHold }
				role="presentation"
			>
				{ !this.props.invisible && this.renderConnectors() }
				{ this.renderPoints() }
			</div>
		);
	}
}

export default PatternLock;
