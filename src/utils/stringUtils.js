'use strict';

const toPascalCase = (str) => str.replace(/(\w)(\w*)/g, (g0,g1,g2) => 
    g1.toUpperCase() + g2.toLowerCase());

const toCamelCase = (str) => str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
    index === 0 ? word.toLowerCase() : word.toUpperCase()
  ).replace(/\s+/g, '');

module.exports = {
    toPascalCase,
    toCamelCase
};            