var Q = require('q'),
    fs = require('fs'),
    path = require('path'),
    chalk = require('chalk'),
    ncp = require('ncp').ncp,
    tarifaFile = require('../../../lib/tarifa-file'),
    settings = require('../../../lib/settings');

function log(response) {
    if (response.verbose) console.log('\n' + chalk.green('✔') + ' project folders created ' + response.path);
    return Q.resolve(response);
}

function copyWWWProject(response) {
    // create tarifa web app folder
    fs.mkdirSync(path.join(response.path, settings.webAppPath));

    // copy template project to web app folder
    ncp.limit = 42;
    var source = path.join(__dirname, '../../../template/project');
    var destination = path.join(response.path, settings.webAppPath);
    var defer = Q.defer();

    ncp(source, destination, function (err) {
        if (err) return defer.reject(err);
        defer.resolve(response);
    });

    return defer.promise;
};

module.exports = function (response) {
    if(!fs.existsSync(response.path)) fs.mkdirSync(response.path);

    return copyWWWProject(response)
        .then(tarifaFile.createFileFromResponse)
        .then(log);
};
