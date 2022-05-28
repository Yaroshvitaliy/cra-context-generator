'use strict';

const { createOkResult, createErrorResult } = require('../../result');
const { createContextFiles } = require('./contextFiles');
const { createContextBuilderFiles } = require('./contextBuilderFiles');
const { contextBuilderUtilFile } = require('./utilFiles');

const createSourceCodes = (result, sourceCodeGeneratorInfo) => 
    new Promise((resolve, reject) => { 
        try {
            const contextFiles = createContextFiles(result, sourceCodeGeneratorInfo);
            const contextBuilderFiles = createContextBuilderFiles(result, sourceCodeGeneratorInfo);
            const utilsFiles = contextBuilderFiles.length > 0 ? [contextBuilderUtilFile] : [];
            const files = contextFiles.concat(contextBuilderFiles).concat(utilsFiles);
            resolve(createOkResult({ files }));
        } catch (err) {
            reject(createErrorResult({ errors: [err] }));
        }
});

module.exports = {
    createSourceCodes
};