'use strict';

const { createOkResult, createErrorResult, getResultData } = require("../result");

const createHeaderLines = (typeDef, sourceCodeGeneratorInfo) => {
    const { name } = typeDef;
    const { name: generatorName, version: generatorVersion, time } = sourceCodeGeneratorInfo;
    const lines = [];
    lines.push(`// Generated by ${generatorName}@${generatorVersion} on ${time}.`);
    lines.push('// Do not edit this file manually unless you disabled its code generation.');
    lines.push(`// ${name}`);
    lines.push('');
    return lines;
}

const createContextContent = (typeDef, sourceCodeGeneratorInfo) => {
    const { name, props } = typeDef;
    const headerLines = createHeaderLines(typeDef, sourceCodeGeneratorInfo);
    let lines = [];
    lines = lines.concat(headerLines);

    //todo: implement

    const content = lines.join('\r\n');

    return content;
};

const createContextBuilderContent = (typeDef, sourceCodeGeneratorInfo) => {
    const { name, props } = typeDef;
    const headerLines = createHeaderLines(typeDef, sourceCodeGeneratorInfo);
    let lines = [];
    lines = lines.concat(headerLines);

    //todo: implement
    
    const content = lines.join('\r\n');

    return content;
};


const createSourceCodes = (result, sourceCodeGeneratorInfo, printProgress) => 
    new Promise((resolve, reject) => { 
        try {
            const { srcData } = getResultData(result);
            const { types, sourceCode } = srcData;
            const { context: { path: contextPath } } = sourceCode;
            const { contextBuilder: { path: contextBuilderPath } } = sourceCode;
            const files = [];

            types
                .filter(t => {
                    const { ignore = false } = t;
                    return !ignore;
                })
                .forEach(t => {
                    const { name } = t;

                    const contextContent = createContextContent(t, sourceCodeGeneratorInfo);
                    const contextFile = { name: `${name}Context.ts`, path: contextPath, content: contextContent };
                    files.push(contextFile);
                    printProgress(contextFile);

                    const contextBuilderContent = createContextBuilderContent(t, sourceCodeGeneratorInfo);
                    const contextBuilderFile = { name: `${name}ContextBuilder.ts`, path: contextBuilderPath, content: contextBuilderContent };
                    files.push(contextBuilderFile);
                    printProgress(contextBuilderFile);
                });
            resolve(createOkResult({ files }));
        } catch (err) {
            reject(createErrorResult({ errors: [err] }));
        }
});

module.exports = {
    createSourceCodes
};