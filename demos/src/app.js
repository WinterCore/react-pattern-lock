import React            from "react";
import ReactDOM         from "react-dom";
import { AppContainer } from "react-hot-loader";

import Demo from "./Components/Demo";

const render = (Component) => {
	ReactDOM.render(
		<Component />,
		document.getElementById("root")
	);
};

render(Demo);