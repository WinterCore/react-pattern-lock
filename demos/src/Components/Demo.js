import React, {
	Component,
	Fragment
}              from "react";
import { hot } from "react-hot-loader";

import PatternLock from "../../../src/components/PatternLock";

class Demo extends Component {
	state = {
		path : [],
		size : 3
	};

	componentDidMount() {
		window.addEventListener("keydown", ({ which }) => {
			if (which === 38) {
				this.setState({ size : this.state.size >= 10 ? 10 : this.state.size + 1 });
			} else if (which === 40) {
				this.setState({ size : this.state.size > 3 ? this.state.size - 1 : 3 });
			}
		});
	}

	onChange = (path) => {
		this.setState({ path });
		return new Promise((resolve, reject) => {
			setTimeout(() => (path.join("-") === "1-3-4-0" ? resolve() : reject()), 1500);
		});
	}

	onDotConnect = (i) => {
		console.log(i);
	};

	render() {
		return (
			<Fragment>
				<div className="center">
					<PatternLock
						width={ 300 }
						pointSize={ 15 }
						connectorNoCorners
						size={ this.state.size }
						allowOverlapping
						onDotConnect={ this.onDotConnect }
						onChange={ this.onChange }
					/>
				</div>
				<div className="output">
					Output : { this.state.path.join(", ") }
				</div>
				<div className="output">
					Press the up/down arrow keys to increase/decrease the size of the input
				</div>
			</Fragment>
		);
	}
}

export default hot(module)(Demo);