'use strict';

const { createOkResult, createErrorResult, getResultData } = require("../result");

const isNotEmptyString = (str) => {
    if (typeof str !== 'string' || str.length === 0) {
        return false;
    } 
    
    return true;
};

const validateArgs = (src, dest) => 
    new Promise((resolve, reject) => {
        const isSrcValid = isNotEmptyString(src);
        const isDestValid = isNotEmptyString(dest);

        if (isSrcValid && isDestValid) {
            resolve(createOkResult({ src, dest }));
        }

        const errors = [];
        if (!isSrcValid) errors.push('src is not specified');
        if (!isDestValid) errors.push('dest is not specified');
        reject(createErrorResult({ errors }));
});

const validateSrc = (result) =>
    new Promise((resolve, reject) => {
        const { srcData } = getResultData(result);

        //todo: implement validator
        const isValid = srcData && srcData.types && srcData.types.length && srcData.sourceCode && srcData.sourceCode.context && srcData.sourceCode.contextBuilder;

        if (isValid) {
            resolve(result);
        } else {
            reject(createErrorResult({ errors: ['source is not valid'] }));
        }
});

module.exports = {
    validateArgs,
    validateSrc
};