import React, {
	Component,
	Fragment
}              from "react";
import { hot } from "react-hot-loader";

import PatternLock from "../../../src/components/PatternLock";

class Demo extends Component {
	state = {
		path : []
	};

	onChange = (path) => {
		this.setState({ path });
		return new Promise((resolve, reject) => {
			setTimeout(() => path.join("-") === "1-3-4-0" ? resolve() : reject(), 1500);
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
						size={ 3 }
						allowOverlapping
						onDotConnect={ this.onDotConnect }
						onChange={ this.onChange }
					/>
				</div>
				<div class="output">
					Output : { this.state.path.join(", ") }
				</div>
			</Fragment>
		);
	}
}

export default hot(module)(Demo);