#!/usr/bin/env node
'use strict';

const { name, version } = require('./../package.json');
const { getCurrentTime } = require('./utils/dateTimeUtils');
const { mapOkResult } = require('./result');
const { validateArgs, validateSrc } = require('./utils/validationUtils');
const { readSrcFile, saveDestFiles } = require('./utils/fileUtils');
const { createSourceCodes } = require('./utils/sourceCodeUtils');
const { 
    printHeader, printArgs, printReadSrcFile, printCreatedSourceCodes, printSavedFiles, printFooter, printErrors 
} = require('./utils/printUtils');

const time = getCurrentTime();
const sourceCodeGeneratorInfo = { name, version, time };
const createSourceCodesByResult = (result) => createSourceCodes(result, sourceCodeGeneratorInfo);

const [,, src, dest, ...args] = process.argv;

printHeader(sourceCodeGeneratorInfo);

validateArgs(src, dest)
    .then(printArgs)
    .then(readSrcFile)
    .then(printReadSrcFile)
    .then(validateSrc)
    .then(createSourceCodesByResult)
    .then(printCreatedSourceCodes)
    .then(result => mapOkResult(result, (data) => ({...data, dest})))
    .then(saveDestFiles)
    .then(printSavedFiles)
    .then(printFooter)
    .catch(printErrors);