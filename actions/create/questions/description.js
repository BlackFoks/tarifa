var validator = require('../../../lib/helper/validator'),
    validateDescription = validator.toInquirerValidateƒ(validator.isDescription);

module.exports = {
    type:'input',
    name:'description',
    validate: validateDescription,
    message:'What\'s your project about?'
};
