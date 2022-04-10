'use strict';

const { getResultData } = require("../result");

const print = console.log;
const printError = console.error;
const printWarn = console.warn;
const printEmptyLine = () => print('');
const printHorizontalLine = () => print('==========================================');

const printHeader = (sourceCodeGeneratorInfo) => {
    const { name, version, time } = sourceCodeGeneratorInfo;
    printEmptyLine();
    printHorizontalLine();
    print(`${name.toUpperCase()}@${version}`);
    printEmptyLine();
    print(time);
    printEmptyLine();
};

const printArgs = (result) => 
    new Promise((resolve) => {
        const { src, dest } = getResultData(result);
        print('args:');
        print(`- src: ${src}`);
        print(`- dest: ${dest}`);
        resolve(result);
});

const printReadSrcFile = (result) => {
    const { src } = getResultData(result);
    printEmptyLine();
    print('source:');
    print(`- ${src}`);
    return result;
};

const printCreatedSourceCodes = (result) => {
    const { files } = getResultData(result);
    printEmptyLine();

    if (files.length > 0) {
        print('generated source code:');
        files.forEach(({name}) => print(`- ${name}`));
    } else {
        printWarn('generated source code: none');
    }

    return result;
};

const printSavedFiles = (result) => {
    const { files } = getResultData(result);
    printEmptyLine();

    if (files.length > 0) {
        print('saved files:');
        files.forEach(({path}) => print(`- ${path}`));
    } else {
        printWarn('saved file: none');
    }

    return result;
};

const printFooter = (result) => 
    new Promise((resolve) => {
        printEmptyLine();
        print('done')
        printHorizontalLine();
        resolve(result);
});

const printErrors = (errorResult) => {
    const { errors } = getResultData(errorResult);
    if (errors.length > 0) {
        printEmptyLine();
        printError('errors:');
        errors.forEach(error => printError(`- ${error}`));
        printHorizontalLine();
    }
    return errorResult;
};

module.exports = {
    printHeader,
    printArgs,
    printReadSrcFile,
    printCreatedSourceCodes,
    printSavedFiles,
    printFooter,
    printErrors
};