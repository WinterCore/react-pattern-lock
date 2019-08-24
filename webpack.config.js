const path = require("path");

module.exports = {
    entry  : "./src/components/PatternLock.tsx",
    output : {
        filename      : "index.js",
        publicPath    : "/",
        path          : path.resolve("./dist"),
        library       : "ReactPatternLock",
        libraryTarget : "umd"
    },
    resolve : {
        extensions : [".ts", ".tsx", ".js", ".json"],
    },
    externals : {
		react : {
			commonjs  : "react",
			commonjs2 : "react",
			amd       : "react",
			root      : "React"
		}
	},
    mode    : "development",
    devtool : "source-map",

    module : {
        rules : [
            {
                test    : /\.tsx?$/,
                exclude : /node_modules/,
                use     : [{
                    loader  : "ts-loader",
                    options : {
                        onlyCompileBundledFiles : true
                    }
                }]
            },
            {
				test    : /\.styl$/,
				exclude : /node_modules/,
				use     : ["style-loader", "css-loader", "stylus-loader"]
			}
        ]
    }
};