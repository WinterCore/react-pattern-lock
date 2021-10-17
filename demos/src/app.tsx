import * as React    from "react";
import * as ReactDOM from "react-dom";

import Demo from "./Components/Demo";

const render = (Component: React.ComponentType) => {
	ReactDOM.render(
		<Component />,
		document.getElementById("root")
	);
};

render(Demo);
