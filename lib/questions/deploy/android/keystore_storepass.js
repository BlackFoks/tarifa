var validator = require('../../../helper/validator'),
    validateKeystorePassword = validator.toInquirerValidateƒ(validator.isKeystorePassword);

module.exports = {
    dependency: 'android',
    type: 'password',
    name: 'keystore_storepass',
    message: 'What is the storepass?',
    validate: validateKeystorePassword
};
