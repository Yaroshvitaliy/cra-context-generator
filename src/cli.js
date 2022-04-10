#!/usr/bin/env node
'use strict';

const { name, version } = require('./../package.json');
const { getCurrentTime } = require('./utils/dateTimeUtils');
const { mapOkResult } = require('./result');
const { validateArgs, validateSrc } = require('./utils/validationUtils');
const { readSrcFile, saveDestFiles } = require('./utils/fileUtils');
const { createSourceCodes } = require('./utils/sourceCodeUtils');
const { printHeader, printArgs, printReadFileProgress, printSourceCodeProgress, printSaveFileProgress, printFooter, printErrors } = require('./utils/printUtils');

const readSrcFileWithProgress = (argsResult) => readSrcFile(argsResult, printReadFileProgress);
const time = getCurrentTime();
const sourceCodeGeneratorInfo = { name, version, time };
const createSourceCodesWithProgress = (srcResult) => createSourceCodes(srcResult, sourceCodeGeneratorInfo, printSourceCodeProgress);
const saveDestFilesWithProgress = (result) => saveDestFiles(result, printSaveFileProgress);

const [,, src, dest, ...args] = process.argv;

printHeader(src, dest);

// todo: print progresses for all items 

validateArgs(src, dest)
    .then(printArgs)
    .then(readSrcFileWithProgress)
    .then(validateSrc)
    .then(createSourceCodesWithProgress)
    .then(sourceCodesResult => 
        mapOkResult(
            sourceCodesResult, 
            (sourceCodesData) => ({...sourceCodesData, dest})))
    .then(saveDestFilesWithProgress)
    .then(printFooter)
    .catch(printErrors);