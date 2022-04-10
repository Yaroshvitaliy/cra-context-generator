'use strict';

const fs = require('fs');
const path = require('path');

const { createOkResult, createErrorResult, getResultData } = require("../result");

const readSrcFile = (result, printProgress) => 
    new Promise((resolve, reject) => {      
        try {
            const { src } = getResultData(result);
            fs.readFile(src, 'utf8', (err, srcRawData) => {
                if (err) {
                    reject(createErrorResult({ errors: [err] }));
                } else {
                    const srcData = JSON.parse(srcRawData);
                    printProgress(src);
                    resolve(createOkResult({ srcData }));
                }
            });
        } catch (err) {
            reject(createErrorResult({ errors: [err] }));
        }
});

const saveDestFile = (file, dest, printProgress) =>
    new Promise((resolve, reject) => {
        const { name: fileName, path: filePath, content } = file;
        const destPath = path.join(dest, filePath, fileName);
        fs.writeFile(destPath, content, (err) => {
            if (err) {
                reject(err);
            } else {
                printProgress({ path: destPath });
                resolve(file);
            }
        });                
    });

const saveDestFiles = (result, printProgress) => 
    new Promise((resolve, reject) => {      
        try {
            const { dest, files } = getResultData(result);
            const saveDestFileWithProgress = (file) => saveDestFile(file, dest, printProgress);
            const promises = files.map(saveDestFileWithProgress);

            Promise.all(promises)
                .then(() => resolve(createOkResult({ files })))
                .catch(err => reject(createErrorResult({ errors: [err] })));
        } catch (err) {
            reject(createErrorResult({ errors: [err] }));
        }
    });

module.exports = {
    readSrcFile,
    saveDestFiles
};