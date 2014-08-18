var canGenerate = require('../../../lib/cordova/assets').canGenerate,
    colorHelper = require('../../../lib/helper/color'),
    validator = require('../../../lib/helper/validator'),
    validateColor = validator.toInquirerValidateƒ(validator.isColor);

module.exports = {
    type:'input',
    name:'color',
    validate: validateColor,
    filter: colorHelper.format,
    when: function (answers) {
        var done = this.async();
        canGenerate().then(function (ok) {
            done(ok);
        });
    },
    message:'Which color do you want for the default icons and splashscreens?'
};
