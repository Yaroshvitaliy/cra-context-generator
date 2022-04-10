'use strict';

const { createOkResult, createErrorResult, isOkResult, getResultData } = require("../result");

const print = console.log;

const printError = console.error;

const printEmptyLine = () => print('');

const printHorizontalLine = () => print('==========================================');

const printHeader = (src, dest) => {
    printEmptyLine();
    printHorizontalLine();
    print('CRA-CONTEXT-GENERATOR');
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

const printReadFileProgress = (src) => {
    printEmptyLine();
    print('read file:');
    print(`- ${src}`);
};

const printSourceCodeProgress = (file) => {
    const { name } = file;
    printEmptyLine();
    print('generated source:');
    print(`- ${name}`);
};

const printSaveFileProgress = (file) => {
    const { path } = file;
    printEmptyLine();
    print('saved file:');
    print(`- ${path}`);
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
        errors.forEach(error => console.error(`- ${error}`));
        printHorizontalLine();
    }
};

module.exports = {
    printHeader,
    printArgs,
    printReadFileProgress,
    printSourceCodeProgress,
    printSaveFileProgress,
    printFooter,
    printErrors
};