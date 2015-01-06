var validator = require('../../../../../lib/helper/validator'),
    validateAppleDeveloperTeam = validator.toInquirerValidateƒ(validator.isAppleDeveloperTeam),
    Configstore = require('configstore'),
    conf = new Configstore('tarifa');

module.exports = {
    dependency: 'ios',
    type:'input',
    name:'apple_developer_team',
    validate: validateAppleDeveloperTeam,
    message:'What is your developer apple team id?',
    default: conf.get('apple_developer_team')
};
