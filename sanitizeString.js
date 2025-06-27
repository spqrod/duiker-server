const validator = require("validator");

function sanitizeString(dirtyString) {
    let cleanString = validator.blacklist(dirtyString, /<>\/\\\|`"'~/);
    cleanString = validator.escape(cleanString);
    cleanString = validator.trim(cleanString);
    cleanString = validator.stripLow(cleanString);
    return cleanString;
}

exports.sanitizeString = sanitizeString;