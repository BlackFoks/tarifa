var Q = require('q'),
    fs = require('q-io/fs'),
    chalk = require('chalk'),
    exec = require('child_process').exec,
    path = require('path'),
    settings = require('./settings'),
    print = require('./helper/print');

module.exports.init = function (root, verbose) {
    var wwwPath = path.join(root, settings.webAppPath),
        nodeModulesPath = path.join(wwwPath, 'node_modules');
    return fs.exists(nodeModulesPath).then(function (exists) {
        var inst = function () {
            var d = Q.defer(),
                cwd = process.cwd(),
                opts = {
                    timeout: 600 * 1000,
                    cwd: null,
                    env: null
                };
            process.chdir(wwwPath);
            exec('npm install ' + (verbose ? '--verbose' : ''), opts, function (error, stdout, stderr) {
                process.chdir(cwd);
                if(error) {
                    d.reject(error);
                    print(stdout.toString());
                    var expl = 'You may have a problem with your network connectivity.';
                    print(stderr.toString());
                    print.error('npm install error in %s, reason:\n%s%s', wwwPath, error, expl);
                    return;
                }
                if(verbose) {
                    print.success('npm install www project');
                    print(stdout.toString());
                }
                d.resolve();
            });
            return d.promise;
        };
        return exists ? Q.resolve() : inst();
    });
};

module.exports.build = function (root, platform, localSettings, configuration, verbose) {
    var wwwBuild = require(path.join(root, settings.build)).build;
    if (typeof wwwBuild !== 'function')
        return Q.reject('www project build failed! `project/bin/build.js` must expose a `build` function');
    return wwwBuild(platform, localSettings, configuration).then(function () {
        if(verbose) print.success('www project build done with configuration %s', configuration);
    }, function (err) {
        print.error('www project build failed! %s', chalk.underline('check your project/bin/build.js script'));
        return Q.reject(verbose ? err : err.toString());
    });
};

module.exports.watch = function (root, ƒ, localSettings, platform, configuration) {
    var builder = require(path.join(root, settings.build));
    builder.watch(ƒ, localSettings, platform, configuration);
    return builder.close;
};

module.exports.checkWatcher = function checkWatch(root) {
    var builder = require(path.join(root, settings.build));
    if(!builder.watch || typeof builder.watch !== 'function')
        return Q.reject('www project build script does not export a `watch` function.');
    if(!builder.close || typeof builder.close !== 'function')
        return Q.reject('www project build script does not export a `close` function.');
    return Q.resolve();
};
