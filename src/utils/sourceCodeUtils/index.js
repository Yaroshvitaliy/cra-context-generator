'use strict';

const { getResultData, createOkResult, createErrorResult } = require('../../result');
const { createContextFiles } = require('./contextFiles');
const { createContextBuilderFiles } = require('./contextBuilderFiles');
const { contextBuilderUtilFile, createCustomRouterFile } = require('./commonFiles');

const createSourceCodes = (result, sourceCodeGeneratorInfo) => 
    new Promise((resolve, reject) => { 
        try {
            const { srcData } = getResultData(result);
            const { options } = srcData;
            const contextFiles = createContextFiles(result, sourceCodeGeneratorInfo);
            const contextBuilderFiles = createContextBuilderFiles(result, sourceCodeGeneratorInfo);
            const utilsFiles = contextBuilderFiles.length > 0 ? [contextBuilderUtilFile, createCustomRouterFile(options)] : [];
            const files = contextFiles.concat(contextBuilderFiles).concat(utilsFiles);
            resolve(createOkResult({ files }));
        } catch (err) {
            reject(createErrorResult({ errors: [err] }));
        }
});

module.exports = {
    createSourceCodes
};