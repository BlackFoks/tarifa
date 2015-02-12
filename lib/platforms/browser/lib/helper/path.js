var path = require('path');

module.exports.wwwFinalLocation = function wwwFinalLocation(root) {
    return path.join(root,'platforms/browser/www');
};

module.exports.productFile = function productFile(platformsRoot, platform, productFileName) {
    throw new Error('No product file on browser platform!');
};
