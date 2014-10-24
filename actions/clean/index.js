var Q = require('q'),
    rimraf = require('rimraf'),
    spinner = require("char-spinner"),
    argsHelper = require('../../lib/helper/args'),
    pathHelper = require('../../lib/helper/path'),
    print = require('../../lib/helper/print'),
    tarifaFile = require('../../lib/tarifa-file'),
    isAvailableOnHost = require('../../lib/cordova/platforms').isAvailableOnHost,
    cordovaClean = require('../../lib/cordova/clean'),
    settings = require('../../lib/settings'),
    path = require('path'),
    fs = require('q-io/fs');

var tasks = {
    android : [ './tasks/android/clean_gradle_build' ],
    ios : [ ],
    wp8 : [ ],
    browser : [ ]
};

var runTasks = function (platforms, localSettings, verbose) {
    return function () {
        return platforms.reduce(function (promise, platform) {
            return promise.then(function (msg) {
                return tasks[platform].reduce(function (p, task) {
                    return p.then(require(task));
                }, Q(msg));
            });
        }, Q({
            settings: localSettings,
            verbose : verbose
        }));
    };
};

var clean = function (platform, verbose) {
    spinner();
    return tarifaFile.parse(pathHelper.root()).then(function (localSettings) {
        if(platform && !isAvailableOnHost(platform))
            return Q.reject('platform not available in host!');
        if(platform && localSettings.platforms.indexOf(platform) < 0)
            return Q.reject('platform not available in project!');
        var availablePlatforms = localSettings.platforms.filter(isAvailableOnHost),
            platforms = platform ? [platform] : availablePlatforms;
        return cordovaClean(platforms, verbose)
            .then(runTasks(platforms, localSettings, verbose));
    });
};

var action = function (argv) {
    var verbose = false,
        helpPath = path.join(__dirname, 'usage.txt');

    if(argsHelper.matchArgumentsCount(argv, [0, 1])
            && argsHelper.checkValidOptions(argv, ['V', 'verbose'])) {
        if(argsHelper.matchOption(argv, 'V', 'verbose')) {
            verbose = true;
        }
        return clean(argv._[0], verbose);
    }
    return fs.read(helpPath).then(print);
};

action.clean = clean;
module.exports = action;
