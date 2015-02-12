/*
 * create empty cordova  app task
 */

var path = require('path'),
    cordova = require('cordova-lib/src/cordova/cordova'),
    Q = require('q'),
    print = require('../../helper/print'),
    pathHelper = require('../../helper/path'),
    settings = require('../../settings'),
    // setting an empty folder as the default www template
    cfg = {
        lib : {
            www : {
                id : "tarifa",
                version : "0.0.0",
                uri : path.join(__dirname, '../../../template/empty')
            }
        }
    };

module.exports = function (response) {
    var cordova_path = pathHelper.resolve(response.path, settings.cordovaAppPath);

    return cordova.raw.create(cordova_path, response.id, response.name, cfg).then(function () {
        if (response.options.verbose) print.success('cordova raw app created here %s', cordova_path);
        return response;
    });
};
