'use strict';

const fs = require('fs');
const path = require('path');

const { createOkResult, createErrorResult, getResultData } = require('../result');

const readSrcFile = (result) => 
    new Promise((resolve, reject) => {      
        try {
            const { src } = getResultData(result);
            fs.readFile(src, 'utf8', (err, srcRawData) => {
                if (err) {
                    const errorMsg = `An error has occurred while reading a file: ${err}`;
                    reject(createErrorResult({ errors: [errorMsg] }));
                } else {
                    const srcData = JSON.parse(srcRawData);
                    resolve(createOkResult({ src, srcData }));
                }
            });
        } catch (err) {
            reject(createErrorResult({ errors: [err] }));
        }
});

const saveDestFile = (file, dest) =>
    new Promise((resolve, reject) => {
        const { name: fileName, content } = file;
        const destPath = path.join(dest, fileName);
        fs.writeFile(destPath, content, (err) => {
            if (err) {
                reject(`An error has occurred while writing a file: ${err}`);
            } else {
                resolve({ path: destPath });
            }
        });                
});

const saveDestFiles = (result) => 
    new Promise((resolve, reject) => {      
        try {
            const { dest, files } = getResultData(result);
            const saveDestFileWithProgress = (file) => saveDestFile(file, dest);
            const promises = files.map(saveDestFileWithProgress);

            Promise.all(promises)
                .then((files) => resolve(createOkResult({ files })))
                .catch(err => reject(createErrorResult({ errors: [err] })));
        } catch (err) {
            reject(createErrorResult({ errors: [err] }));
        }
});

module.exports = {
    readSrcFile,
    saveDestFiles
};