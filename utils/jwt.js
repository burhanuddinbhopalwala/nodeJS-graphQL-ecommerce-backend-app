const fs = require("fs");
const path = require("path");

const { SOURCE, ENV, JWT_PRIVATE_KEY } = require(path.join(
	__dirname,
	"..",
	"constants.js"
));

module.exports.getPrivateKey = () => {
	return fs.readFileSync(
		path.join(SOURCE, "jwt", ENV, JWT_PRIVATE_KEY),
		"utf-8"
	);
};
