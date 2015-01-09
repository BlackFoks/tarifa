var validator = require('../../../helper/validator'),
    validateKeystoreAlias = validator.toInquirerValidateƒ(validator.isKeystoreAlias);

module.exports = {
    dependency: 'android',
    type: 'input',
    name: 'keystore_alias',
    validate: validateKeystoreAlias,
    message: 'What is the alias?'
};
