/*
 * add cordova plugins task
 */

var Q = require('q'),
    plugins = require('../../cordova/plugins'),
    log = require('../../helper/log'),
    pathHelper = require('../../helper/path'),
    tarifaFile = require('../../tarifa-file');

function add_cordova_plugin (root, name, uri, variables, fromTarifaFile) {
    return plugins.add(root, uri, { cli_variables: variables }).then(function () {
        return fromTarifaFile ? Q() : tarifaFile.addPlugin(root, [{ val: name, uri: uri}]);
    });
}

function mapPlugins(response) {
    if(response.createProjectFromTarifaFile) return response;
    // merge mandatory + user selected plugins
    var allPlugins = plugins.listAll(),
        defaultPlugins = allPlugins.filter(function (p) {
            return p.default;
        }).map(function (p) {
            return { uri: p.uri, value: p.value };
        }),
        mapResponsePlugins = response.plugins.map(function (plugin) {
            return allPlugins.reduce(function (r, p) {
                if(p.value === plugin) {
                    r.uri = p.uri; r.value = p.value;
                }
                return r;
            }, {});
        });
    response.plugins = defaultPlugins.concat(mapResponsePlugins);
    return response;
}

module.exports = function (response) {
    var root = pathHelper.resolve(response.path),
        fromTarifaFile = response.createProjectFromTarifaFile;

    return mapPlugins(response).plugins.reduce(function (promise, plugin) {
        return promise.then(function () {
            return add_cordova_plugin(root, plugin.value, plugin.uri, plugin.variables, fromTarifaFile).then(function () {
                log.send('success', 'cordova plugin %s added', plugin.value);
                return Q.resolve(response);
            });
        });
    }, Q.resolve()).fail(function (reason) {
        var advice = 'You may have a problem with your network connectivity. ' +
                     'Try to add your plugins with tarifa plugin add when your network settings are fixed.';
        log.send('warning', 'tarifa plugin add error in %s, reason:\n%s\n%s', response.path, reason, advice);
        return Q.resolve(response);
    });
};
