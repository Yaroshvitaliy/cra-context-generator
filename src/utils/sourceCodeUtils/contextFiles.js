'use strict';

const { getResultData } = require('../../result');
const { toPascalCase, emptyLine, newLine, createIndentation } = require('../stringUtils');
const { createJSDocDescription } = require('./jsDoc');
const { 
    createPropName,
    createSetPropName,
    createStatePropName,
    createSetStatePropName,
    createSetEventHandlerPropName,
    createStateInterfaceName,
    createDefaultStateName,
    createStateName,
    createContextProviderName,
    createContextFileName,
    createProp,
    createHeader,
    createValue,
    concatWithEmptyLineReducer
} = require('./common');

const createStatePropsInterfaceName = (name) => `I${toPascalCase(name)}StateProps`;
const createContextProviderPropsInterfaceName = (name) => `I${toPascalCase(name)}ContextProviderProps`;
const createContextValueInterfaceName = (name) => `I${toPascalCase(name)}ContextValue`;
const createDefaultValueName = (name) => `Default${toPascalCase(name)}`;
const createDefaultContextValueName = (name) => `Default${toPascalCase(name)}ContextValue`;
const createContextName = (name) => `${toPascalCase(name)}Context`;

const createContextHeader = ({ sourceCodeGeneratorInfo }) => {
    const imports = [`import React from 'react';`];
    const header = createHeader(sourceCodeGeneratorInfo, imports);
    return header;
};

const createStatePropsInterface = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createJSDocDescription(createIndentation(0), { description: `The ${toPascalCase(name)} state props interface.` });
    const interfaceName = createStatePropsInterfaceName(name);
    lines.push(`export interface ${interfaceName} {`);
    props.forEach(p => {
        const { name, type, isOptional } = p;
        lines.push(`${createIndentation(1)}${createProp(createPropName(name), type, isOptional)};`);
    });
    lines.push('}');
    return lines;
};

const createStateInterface = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createJSDocDescription(createIndentation(0), { description: `The ${toPascalCase(name)} state interface.` });
    const interfaceName = createStateInterfaceName(name);
    lines.push(`export interface ${interfaceName} {`);
    props.forEach(p => {
        const { name, type, isOptional } = p;
        lines.push(`${createIndentation(1)}${createProp(createStatePropName(name), type, isOptional)};`);
        lines.push(`${createIndentation(1)}${createProp(createSetStatePropName(name), `React.Dispatch<React.SetStateAction<${type}${isOptional ? ' | undefined' : ''}>>`, true)};`);
    });
    lines.push('}');
    return lines;
};

const createContextProviderPropsInterface = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createJSDocDescription(createIndentation(0), { description: `The ${toPascalCase(name)} context provider props interface.` });
    const interfaceName = createContextProviderPropsInterfaceName(name);
    lines.push(`export interface ${interfaceName} {`);
    lines.push(`${createIndentation(1)}${createProp('children', 'React.ReactNode')};`);
    lines.push(`${createIndentation(1)}${createProp(createStatePropName(name), createStateInterfaceName(name))};`);
    props.forEach(p => {
        const { name, type, isOptional } = p;
        lines.push(`${createIndentation(1)}${createProp(createSetEventHandlerPropName(name), `(${name}${isOptional ? '?' : ''}: ${type}) => void`, true)};`);
    });
    lines.push('}');
    return lines;
};

const createContextValueInterface = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createJSDocDescription(createIndentation(0), { description: `The ${toPascalCase(name)} context value interface.` });
    const interfaceName = createContextValueInterfaceName(name);
    lines.push(`export interface ${interfaceName} {`);
    props.forEach(p => {
        const { name, type, isOptional } = p;
        lines.push(`${createIndentation(1)}${createProp(createPropName(name), type, isOptional)};`);
        lines.push(`${createIndentation(1)}${createProp(createSetPropName(name), `(${name}${isOptional ? '?' : ''}: ${type}) => void;`)}`);
    });
    lines.push('}');
    return lines;
};

const createDefaultValues = ({ typeDef }) => {
    const { props } = typeDef;
    const lines = props.map(p => {
        const { name, type, defaultValue } = p;
        return `export const ${createDefaultValueName(name)} = ${createValue(defaultValue, type)};`;
    });
    return lines;
};

const createDefaultState = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createJSDocDescription(createIndentation(0), { description: `The default ${toPascalCase(name)} state.` });
    const interfaceName = createStateInterfaceName(name);
    const typeName = createDefaultStateName(name);
    lines.push(`export const ${typeName}: ${interfaceName} = {`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${createIndentation(1)}${createProp(createStatePropName(name), createDefaultValueName(name))},`);
        lines.push(`${createIndentation(1)}${createProp(createSetStatePropName(name), 'undefined')},`);
    });
    lines.push('};');
    return lines;
};

const createDefaultContextValue = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createJSDocDescription(createIndentation(0), { description: `The default ${toPascalCase(name)} context value.` });
    const interfaceName = createContextValueInterfaceName(name);
    const typeName = createDefaultContextValueName(name);
    lines.push(`export const ${typeName}: ${interfaceName} = {`);
    props.forEach(p => {
        const { name, type, isOptional } = p;
        lines.push(`${createIndentation(1)}${createProp(createPropName(name), createDefaultValueName(name))},`);
        lines.push(`${createIndentation(1)}${createProp(createSetPropName(name), `(${name}${isOptional ? '?' : ''}: ${type}) => {},`)}`);
    });
    lines.push('};');
    return lines;
};

const createState = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createJSDocDescription(createIndentation(0), { description: `The ${toPascalCase(name)} state.` });
    const interfaceName = createStatePropsInterfaceName(name);
    const typeName = createStateName(name);
    lines.push(`export const ${typeName} = ({`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${createIndentation(3)}${createPropName(name)},`);
    });
    lines.push(`${createIndentation(2)}}: ${interfaceName}) => {`);
    lines.push(emptyLine);
    props.forEach(p => {
        const { name, type, isOptional } = p;
        lines.push(`${createIndentation(1)}const [ ${createStatePropName(name)}, ${createSetStatePropName(name)} ] = React.useState<${type}${isOptional ? ' | undefined' : ''}>(${createPropName(name)} || ${createDefaultValueName(name)});`);
    });
    lines.push(emptyLine);
    lines.push(`${createIndentation(1)}const ${createStatePropName(name)}: ${createStateInterfaceName(name)} = {`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${createIndentation(2)}${createStatePropName(name)},`);
        lines.push(`${createIndentation(2)}${createSetStatePropName(name)},`);
    });
    lines.push(`${createIndentation(1)}};`);
    lines.push(emptyLine);
    lines.push(`${createIndentation(1)}return ${createStatePropName(name)};`);
    lines.push('};');
    return lines;
};

const createContext = ({ typeDef }) => {
    const { name } = typeDef;
    const lines = createJSDocDescription(createIndentation(0), { description: `The ${toPascalCase(name)} context.` });
    const interfaceName = createContextValueInterfaceName(name);
    const typeName = createContextName(name);
    const defaultValueName = createDefaultContextValueName(name);
    lines.push(`export const ${typeName} = React.createContext<${interfaceName}>(${defaultValueName});`);
    return lines;
};

const createContextProvider = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createJSDocDescription(createIndentation(0), { description: `The ${toPascalCase(name)} context provider.` });
    const typeName = createContextProviderName(name);
    lines.push(`export const ${typeName} = ({`);
    lines.push(`${createIndentation(3)}children,`);
    lines.push(`${createIndentation(3)}${createStatePropName(name)},`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${createIndentation(3)}${createSetEventHandlerPropName(name)},`);
    });
    lines.push(`${createIndentation(2)}}: ${createContextProviderPropsInterfaceName(name)}) => {`);
    lines.push(emptyLine);
    lines.push(`${createIndentation(1)}const {`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${createIndentation(2)}${createStatePropName(name)},`);
        lines.push(`${createIndentation(2)}${createSetStatePropName(name)},`);
    });
    lines.push(`${createIndentation(1)}} = ${createStatePropName(name)} || {};`);
    lines.push(emptyLine);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${createIndentation(1)}React.useEffect(() => {`);
        lines.push(`${createIndentation(2)}${createSetEventHandlerPropName(name)} && ${createSetEventHandlerPropName(name)}(${createStatePropName(name)});`);
        lines.push(`${createIndentation(1)}}, [ ${createStatePropName(name)}, ${createSetStatePropName(name)}, ${createSetEventHandlerPropName(name)} ]);`);
        lines.push(emptyLine);
    });
    lines.push(`${createIndentation(1)}const contextValue: ${createContextValueInterfaceName(name)} = {`);
    props.forEach(p => {
        const { name, type, isOptional } = p;
        lines.push(`${createIndentation(2)}${createProp(createPropName(name), createStatePropName(name))},`);
        lines.push(`${createIndentation(2)}${createProp(createSetPropName(name), `(${name}${isOptional ? '?' : ''}: ${type}) => ${createSetStatePropName(name)} && ${createSetStatePropName(name)}(${createPropName(name)}),`)}`);
    });
    lines.push(`${createIndentation(1)}};`);
    lines.push(emptyLine);
    lines.push(`${createIndentation(1)}return (`);
    lines.push(`${createIndentation(2)}<${createContextName(name)}.Provider value={contextValue}>`);
    lines.push(`${createIndentation(3)}{children}`);
    lines.push(`${createIndentation(2)}</${createContextName(name)}.Provider>`);
    lines.push(`${createIndentation(1)});`);
    lines.push(`};`);
    return lines;
};

const createContextFileContent = (typeDef, sourceCodeGeneratorInfo) => {
    const lines = [
        createContextHeader,
        createStatePropsInterface,
        createStateInterface,
        createContextProviderPropsInterface,
        createContextValueInterface,
        createDefaultValues,
        createDefaultState,
        createDefaultContextValue,
        createState,
        createContext,
        createContextProvider
    ]
    .map(x => x({ sourceCodeGeneratorInfo, typeDef }))
    .reduce(concatWithEmptyLineReducer, []);

    const content = lines.join(newLine);
    return content;
};

const createContextFiles = (result, sourceCodeGeneratorInfo) => {
    const { srcData } = getResultData(result);
    const { types } = srcData;

    const files = types
        .map(t => {
            const { name } = t;
            const content = createContextFileContent(t, sourceCodeGeneratorInfo);
            const file = { name: createContextFileName(name), content };
            return file;
        });

    return files;
};

module.exports = {
    createContextFiles
};