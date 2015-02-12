var Q = require('q'),
    os = require('os'),
    exec = require('child_process').exec,
    chalk = require('chalk'),
    settings = require('./settings'),
    print = require('../../../helper/print');

var parse = function (str) {
    return str.split('\n')
        .filter(function (l) { return l.trim().length > 0; })
        .filter(function (l) { return l.split(':').length === 3; })
        .filter(function (l) { return l.split(':')[2].trim() === 'Device'; })
        .map(function (l) { return l.split(':')[1].trim(); });
};

var info = function (verbose) {
    if (os.platform() !== 'win32') return Q.resolve([]);
    var defer = Q.defer();
    exec(settings.external.cordovadeploy.name + " -devices",
        function (error, stdout, stderr) {
            if (error !== null)
                defer.reject(error);
            else
                defer.resolve(parse(stdout.toString()));
    });
    return defer.promise;
};

var show = function (verbose) {
    return info(verbose).then(function (devices) {
        print(
            devices.length ? "%s\n\t%s" : "%s %s",
            chalk.green('available wp8 devices:'),
            devices.length ? devices.join('\n\t') : 'none'
        );
    });
};

module.exports = {
    info : info,
    print: show
};
