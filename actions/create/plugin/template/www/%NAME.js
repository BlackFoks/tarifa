module.exports.toUpper = function (success, error, str) {
    if (typeof str !== 'string') {
        error('toUpper must be called with a single string parameter.');
    } else {
        cordova.exec(success, error, '%NAME', 'toUpper', [str]);
    }
};%NAME_USE_VARIABLES
