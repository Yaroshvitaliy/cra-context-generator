'use strict';

const emptyLine = '';
const newLine = '\r\n';

const toPascalCase = (str) => str.replace(/(?:^\w|[a-z]|\b\w)/g, (word, index) => 
    index === 0 ? word.toUpperCase() : word.toLowerCase()
).replace(/\s+/g, '');

const toCamelCase = (str) => str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
    index === 0 ? word.toLowerCase() : word.toUpperCase()
  ).replace(/\s+/g, '');

const toWords = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();

const createIndentation = (level) => {
    let indentation = '';
    const indentation1 = '    ';
    for (let i = 0; i < level; i++) {
        indentation += indentation1;
    }
    return indentation;
};

module.exports = {
    emptyLine,
    newLine,
    toPascalCase,
    toCamelCase,
    toWords,
    createIndentation
};            