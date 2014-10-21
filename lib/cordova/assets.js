var Q = require('q'),
    ncp = require('ncp').ncp,
    mkdirp = require('mkdirp'),
    rimraf = require('rimraf'),
    path = require('path'),
    fs = require('fs'),
    format = require('util').format,
    chalk = require('chalk'),
    settings = require('../settings'),
    print = require('../helper/print'),
    exec = require('child_process').exec,
    tarifaFile = require('../tarifa-file');

function copyDefaultTarifaAssets(mapping, platform, config, root, type, verbose) {
    if(!mapping[platform]) return Q.reject("platform not available!");

    var sources = mapping[platform].map(function(tuple) {
            return tuple.src;
        }).reduce(function (acc, source) {
            var defaultSource = source instanceof Array ? source[1] : source;
            if(acc.indexOf(defaultSource) < 0) acc.push(defaultSource);
            return acc;
        }, []);

    return sources.reduce(function (promise, source) {
        var src = path.join(__dirname, '..', '..', 'template', 'assets', platform, source),
            dest = path.join(root, settings.images, platform, config, type, source);
        return promise.then(function () {
            var defer = Q.defer();
            ncp.limit = 1;
            ncp(src, dest, function (err) {
                if (err) return defer.reject(err);
                defer.resolve();
            });
            return defer.promise;
        });
    }, Q.resolve());
}

function copyDefaultAssets(mapping, root, platforms, type, verbose) {
    return platforms.reduce(function (promise, platform) {
        return promise.then(copyDefaultTarifaAssets(mapping, platform, 'default', root, type, verbose))
            .then(function () {
                if(verbose)
                    print.success('default %s copied for platform %s', type, platform);
            });
    }, Q.resolve());
}

function copyAssets(mapping, platform, configuration, type) {
    if(!mapping[platform]) return Q.reject("platform not available!");
    var cwd = process.cwd();
    return tarifaFile.parse(cwd).then(function (localSettings) {

        var confSettings = localSettings.configurations[platform][configuration],
            // try path $TARIFA_ROOT/images/$platform/$config first
            imgPath = path.join(cwd, settings.images, platform, configuration, type),
            natPath = path.join(cwd, settings.cordovaAppPath, 'platforms', platform);

        // if no assets folder for given configuration try the default configuration
        if (!fs.existsSync(imgPath) || fs.readdirSync(imgPath).length == 0) imgPath = path.join(cwd, settings.images, platform, 'default', type);
        // img path potentially overriden in tarifa.json configuration (relative to tarifa root project or absolute)
        if(confSettings.assets_path) imgPath = path.resolve(confSettings.assets_path, type);
        // reject if imgPath directory doesn't exist
        if(!fs.existsSync(imgPath)  || fs.readdirSync(imgPath).length == 0)
            return Q.reject(format('%s directory does not exist or is empty', imgPath));
        return mapping[platform].reduce(function (promise, tuple) {
            return promise.then(function () {
                if(tuple.src instanceof Array) {

                    tuple.dest.forEach(function (dest) {
                        rimraf.sync(destinationPath(localSettings.name, dest, natPath));
                    });

                    for(var i=0, l=tuple.src.length; i<l; i++) {
                        var dest = destinationPath(localSettings.name, tuple.dest[i], natPath),
                            source = path.join(imgPath, tuple.src[i]);
                        if (fs.existsSync(source)) return mkdirAndCopy(source, dest);
                        if (i === tuple.src.length - 1) {
                            print.warning('Unable to copy any source from list: [%s] to: [%s]', tuple.src.join(', '), tuple.dest.join(', '));
                            return Q.resolve();
                        }
                    }
                } else {
                    var src =  path.join(imgPath, tuple.src),
                        dest = destinationPath(localSettings.name, tuple.dest, natPath);
                    if (fs.existsSync(src)) {
                        return mkdirAndCopy(src, dest);
                    }
                    else {
                        print.warning('Unable to copy source %s to %s', src, dest);
                        return Q.resolve();
                    }
                }
            });
        }, Q.resolve());
    });
}

function destinationPath(appName, destTmpl, natPath) {
    return path.join(natPath, destTmpl.replace('{$app_name}', appName));
}

function mkdirAndCopy(src, dest) {
    var defer = Q.defer();

    ncp.limit = 1;
    mkdirp(path.dirname(dest), function(err) {
        if (err) return defer.reject(err);
        ncp(src, dest, function (er) {
            if (er) return defer.reject(er);
            defer.resolve();
        });
    });
    return defer.promise;
}

function generateImage(color, size, destination, verbose) {
    var options = {
            timeout : 0,
            maxBuffer: 1024 * 400
        },
        defer = Q.defer(),
        cmd = format("convert -size %s xc:\"%s\" %s", size, color, destination);

    exec(cmd, options, function (err, stdout, stderr) {
        if(err) {
            if(verbose) {
                print.error(cmd);
                print.error('convert stderr %s', stderr);
            }
            defer.reject(err);
            return;
        }
        defer.resolve();
    });

    return defer.promise;
}

function resizeImage(file, size, destination, verbose) {
    var options = {
        timeout : 0,
        maxBuffer: 1024 * 400
    },
    defer = Q.defer(),
    cmd = format('convert %s -resize %s %s', file, size.join('x'), destination);

    exec(cmd, options, function (err, stdout, stderr) {
        if(err) {
            if(verbose) {
                print.error(cmd);
                print.error('convert stderr ' + stderr);
            }
            defer.reject(err);
            return;
        }
        defer.resolve();
    });

    return defer.promise;
}

function checkImageSize(file, verbose) {
    var options = {
        timeout : 0,
        maxBuffer: 1024 * 400
    },
    defer = Q.defer(),
    cmd = 'identify ' + file;

    exec(cmd, options, function (err, stdout, stderr) {
        if(err) {
            if(verbose) {
                print.error(cmd);
                print.error('convert stderr ' + stderr);
            }
            defer.reject('convert ' + err);
            return;
        }
        var res = stdout.split(' ');
        defer.resolve(res[2]);
    });

    return defer.promise;
}

function generate(mapping, color, type, root, platforms, config, verbose) {
    var tarifaPath = path.join(process.cwd(), 'tarifa.json');
    return platforms.reduce(function (promise, platform) {
        return promise.then(function () {
            return mapping[platform].reduce(function (promise, tuple) {
                var src = tuple.src instanceof Array ? tuple.src[1] : tuple.src,
                    dest = path.join(root, settings.images, platform, config, type, src),
                    dim = src.replace('icon-', '').replace('.png', ''),
                    size = type == 'icons' ? (dim + 'x' + dim)
                        : src.replace('screen-', '').replace('.png', '').replace('.jpg', '');
                return promise.then(function () {
                    return generateImage(color, size, dest, verbose);
                });
            }, Q.resolve());
        });
    }, Q.resolve());
}

function generateFromFile(mapping, file, root, platforms, config, verbose) {
    var tarifaPath = path.join(process.cwd(), 'tarifa.json');

    return checkImageSize(file).then(function(size) {
       var side = parseInt(size.split('x')[0], 10);
       if (side < 192) {
           return Q.reject('The provided image is too small. It must be a square' +
           'of at least 192px side.');
       }
       return size;
    }).then(function () {

        return platforms.reduce(function (promise, platform) {
            return promise.then(function () {
                return mapping[platform].reduce(function (promise, tuple) {
                    var src = tuple.src instanceof Array ? tuple.src[1] : tuple.src,
                        dest = path.join(root, settings.images, platform, config, 'icons', src),
                        dim = parseInt(src.replace('icon-', '').replace('.png', ''), 10);

                    return promise.then(function () {
                        return resizeImage(file, [dim, dim], dest, verbose);
                    });
                }, Q.resolve());
            });
        }, Q.resolve());
    });
}

function canGenerate() {
    var defer = Q.defer(),
        cmd = settings.external.convert.print_version,
        options = {
            timeout: 1000 * 10,
            maxBuffer: 1024 * 400
        },
        child = exec(cmd, options, function (err, stdout, stderr) {
            defer.resolve(!err);
        });
    return defer.promise;
}

function createFolder(root, platform, configuration, type) {
    var defer = Q.defer(),
        dirPath = path.join(root, settings.images, platform, configuration, type);
    mkdirp(dirPath, function (err) {
        if(err) return defer.reject("unable to create folder " + err);
        defer.resolve();
    });
    return defer.promise;
}

function createFolders(root, platforms, configuration) {
    var foldersPromises = [];

    platforms.forEach(function (platform) {
        foldersPromises.push(createFolder(root, platform, configuration, 'icons'));
        foldersPromises.push(createFolder(root, platform, configuration, 'splashscreens'));
    });
    return foldersPromises;
}

module.exports.generate = generate;
module.exports.generateFromFile = generateFromFile;
module.exports.canGenerate = canGenerate;
module.exports.copyDefaultAssets = copyDefaultAssets;
module.exports.copyAssets = copyAssets;
module.exports.createFolders = createFolders;
