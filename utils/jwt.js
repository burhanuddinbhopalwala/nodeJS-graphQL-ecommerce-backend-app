const fs = require('fs');
const path = require('path');

const { SOURCE, ENV, JWT_PRIVATE_KEY_NAME } = require(path.join(
    __dirname,
    '..',
    'constants.js'
));

module.exports.getPrivateKey = () => {
    return fs.readFileSync(
        path.join(SOURCE, 'jwt', ENV, JWT_PRIVATE_KEY_NAME),
        'utf-8'
    );
};
