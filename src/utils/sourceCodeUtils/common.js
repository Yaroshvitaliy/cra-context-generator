'use strict';

const { toCamelCase, toPascalCase, emptyLine } = require('../stringUtils');

const createPropName = (name) => toCamelCase(name);
const createSetPropName = (name) => `set${toPascalCase(name)}`;    
const createGetPropName = (name) => `get${toPascalCase(name)}`;    
const createStatePropName = (name) => `${toCamelCase(name)}State`;    
const createSetStatePropName = (name) => `set${toPascalCase(name)}State`;    
const createSetEventHandlerPropName = (name) => `${toCamelCase(name)}SetEventHandler`;   
const createUrlParamPropName = (name) => `${toCamelCase(name)}UrlParam`;   
const createCustomLocationFromStatePropName = (name) => `customLocationFrom${toPascalCase(name)}`;   
const createCustomStateFromLocationPropName = (name) => `custom${toPascalCase(name)}FromLocation`;   
const createWithPropName = (name) => `with${toPascalCase(name)}`;
const createInitialPropName = (name) => `initial${toPascalCase(name)}`;

const createStateInterfaceName = (name) => `I${toPascalCase(name)}State`;
const createDefaultStateName = (name) => `Default${toPascalCase(name)}State`;
const createStateName = (name) => `${toPascalCase(name)}State`;
const createContextProviderName = (name) => `${toPascalCase(name)}ContextProvider`;

const createContextFileName = (name) => `${toCamelCase(name)}Context.tsx`;

const createProp = (name, typeOrValue, isOptional, canBeUndefined) => 
    `${name}${isOptional ? '?' : ''}: ${canBeUndefined ? `undefined | ${typeOrValue}` : typeOrValue }`;

const createHeader = (sourceCodeGeneratorInfo, imports) => {
    const { name: generatorName, version: generatorVersion, time } = sourceCodeGeneratorInfo;
    const lines = [];
    lines.push(`// Generated by ${generatorName}@${generatorVersion} on ${time}.`);
    lines.push('// Do not edit this file manually unless you disabled its code generation.');
    imports.forEach(x => lines.push(x));
    return lines;
};

const createValue = (value, type) => {
    if (typeof value === 'undefined') {
        return value;
    }

    if (type === 'string') {
        return `'${value}'`;
    }

    if (type === 'object' || Array.isArray(value)) {
        return JSON.stringify(value);
    }

    return value;
};

const concatReducer = (acc, currentValue) => acc = acc.concat(currentValue);

const concatWithEmptyLineReducer = (acc, currentValue) => acc = acc.concat(currentValue).concat([emptyLine]);

const concatWithEmptyLineButFirstReducer = (acc, currentValue, i) => {
    i > 0 && (acc = acc.concat([emptyLine]));
    acc = acc.concat(currentValue);
    return acc;
};

module.exports = {
    createPropName,
    createSetPropName,
    createGetPropName,
    createStatePropName,
    createSetStatePropName,
    createSetEventHandlerPropName,
    createUrlParamPropName,
    createCustomLocationFromStatePropName,
    createCustomStateFromLocationPropName,
    createWithPropName,
    createInitialPropName,
    createStateInterfaceName,
    createDefaultStateName,
    createStateName,
    createContextProviderName,
    createContextFileName,
    createProp,
    createHeader,
    createValue,
    concatReducer,
    concatWithEmptyLineReducer,
    concatWithEmptyLineButFirstReducer
};