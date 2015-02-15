/*
 * create assets folders structure
 */

var Q = require('q'),
    mkdirp = require('mkdirp'),
    settings = require('../../settings'),
    print = require('../../helper/print'),
    pathHelper = require('../../helper/path'),
    copyDefaultIcons = require('../../cordova/icon').copyDefault,
    copyDefaultSplashscreens = require('../../cordova/splashscreen').copyDefault,
    generateDefaultIcons = require('../../cordova/icon').generate,
    generateDefaultSplashscreens = require('../../cordova/splashscreen').generate,
    createFolders = require('../../cordova/assets').createFolders;

function log(msg, verbose) { return function () { if(verbose) print.success(msg); }; }

function generateAssets(color, root, platforms, verbose) {
    return generateDefaultIcons(color, root, platforms, 'default', verbose)
        .then(function () {
            return generateDefaultSplashscreens(color, root, platforms, 'default', verbose);
        });
}

function copyDefaultAssets(root, platforms, verbose) {
    return copyDefaultIcons(root, platforms, verbose)
        .then(function () {
            return copyDefaultSplashscreens(root, platforms, verbose);
        });
}

module.exports = function (response) {
    var root = pathHelper.resolve(response.path),
        verbose = response.options.verbose;

    return Q.all(createFolders(root, response.platforms, 'default', true))
        .then(log('assets folder created', verbose))
        .then(function () {
            if(response.color) return generateAssets(response.color, root, response.platforms, verbose);
            else return copyDefaultAssets(root, response.platforms, verbose);
        }).then(function () { return response; });
};