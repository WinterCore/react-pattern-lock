import * as React from "react";

import PatternLock from "../../../src/index";

type IDemoState = {
	path: number[],
	isLoading: boolean,
	error: boolean,
	success: boolean,
	disabled: boolean,
	size: number,
}

class Demo extends React.Component<{}, IDemoState> {
	state = {
		path: [] as number[],
		isLoading: false,
		error: false,
		success: false,
		disabled: false,
		size: 3
	};

	errorTimeout: number = 0;

	componentDidMount() {
		window.addEventListener("keydown", (e) => {
			const { key } = e;
			if (key === "ArrowUp") {
				e.preventDefault();
				this.setState({ size: this.state.size >= 10 ? 10 : this.state.size + 1 });
			} else if (key === "ArrowDown") {
				e.preventDefault();
				this.setState({ size: this.state.size > 3 ? this.state.size - 1 : 3 });
			}
		});
	}

	onReset = () => {
		this.setState({
			path: [],
			success: false,
			error: false,
			disabled: false
		});
	};

	onChange = (path: number[]) => {
		this.setState({ path: [...path] });
	};

	onFinish = () => {
		this.setState({ isLoading: true });
		// an imaginary api call
		setTimeout(() => {
			if (this.state.path.join("-") === "0-1-2") {
				this.setState({ isLoading: false, success: true, disabled: true });
			} else {
				this.setState({ disabled: true, error: true });
				this.errorTimeout = window.setTimeout(() => {
					this.setState({
						disabled: false,
						error: false,
						isLoading: false,
						path: []
					});
				}, 3000);
			}
		}, 3000);
	};

	render() {
		const { size, path, disabled, success, error, isLoading } = this.state;

		return (
			<React.Fragment>
				<div className="center">
					<PatternLock
						size={size}
						onChange={this.onChange}
						path={path}
						error={error}
						onFinish={this.onFinish}
						connectorThickness={5}
						disabled={disabled || isLoading}
						success={success}
						firstPointColorEnabled={true}
						firstPointColor={"green"}
					/>
				</div>
				<div className="output">
					Select the top 3 points starting from the left
				</div>
				<div className="output">
					Output : {this.state.path.join(", ")}
				</div>
				{
					success && <button style={{ margin: "0 auto", display: "block" }} onClick={this.onReset}>Click here to reset</button>
				}
				<div className="output">
					Press the up/down arrow keys to increase/decrease the size of the input
				</div>
			</React.Fragment>
		);
	}
}

export default Demo;
