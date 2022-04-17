'use strict';

const { createOkResult, createErrorResult, getResultData } = require('../result');
const { toPascalCase, toCamelCase } = require('./stringUtils');

const emptyLine = '';
const newLine = '\r\n';

const createHeader = ({ sourceCodeGeneratorInfo }) => {
    const { name: generatorName, version: generatorVersion, time } = sourceCodeGeneratorInfo;
    const lines = [];
    lines.push(`// Generated by ${generatorName}@${generatorVersion} on ${time}.`);
    lines.push('// Do not edit this file manually unless you disabled its code generation.');
    lines.push('');
    lines.push("import React from 'react';");
    return lines;
};

const createCodeDocumentation = (description) => {
    const lines = [];
    lines.push('/**');
    lines.push(` * ${description}`);
    lines.push(' */');
    return lines;
};

const createPropName = (name) => toCamelCase(name);
const createSetPropName = (name) => `set${toPascalCase(name)}`;    
const createStatePropName = (name) => `${toCamelCase(name)}State`;    
const createSetStatePropName = (name) => `set${toPascalCase(name)}State`;    
const createSetEventHandlerPropName = (name) => `${toCamelCase(name)}SetEventHandler`;   

const createProp = (name, typeOrValue, isOptional, canBeUndefined) => 
    `${name}${isOptional ? '?' : ''}: ${canBeUndefined ? `undefined | ${typeOrValue}` : typeOrValue }`;

const indentation1 = '    ';
const indentation2 = indentation1 + indentation1;
const indentation3 = indentation1 + indentation1 + indentation1;

const createStatePropsInterfaceName = (name) => `I${toPascalCase(name)}StateProps`;

const createStatePropsInterface = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createCodeDocumentation(`The ${toPascalCase(name)} state props interface.`);
    const interfaceName = createStatePropsInterfaceName(name);
    lines.push(`export interface ${interfaceName} {`);
    props.forEach(p => {
        const { name, type, isOptional } = p;
        lines.push(`${indentation1}${createProp(createPropName(name), type, isOptional)};`);
    });
    lines.push('};');
    return lines;
};

const createStateInterfaceName = (name) => `I${toPascalCase(name)}State`;

const createStateInterface = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createCodeDocumentation(`The ${toPascalCase(name)} state interface.`);
    const interfaceName = createStateInterfaceName(name);
    lines.push(`export interface ${interfaceName} {`);
    props.forEach(p => {
        const { name, type, isOptional } = p;
        lines.push(`${indentation1}${createProp(createStatePropName(name), type)};`);
        lines.push(`${indentation1}${createProp(createSetStatePropName(name), `React.Dispatch<React.SetStateAction<${type}>>`, false, isOptional)};`);
    });
    lines.push('};');
    return lines;
};

const createContextProviderPropsInterfaceName = (name) => `I${toPascalCase(name)}ContextProviderProps`;

const createContextProviderPropsInterface = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createCodeDocumentation(`The ${toPascalCase(name)} context provider props interface.`);
    const interfaceName = createContextProviderPropsInterfaceName(name);
    lines.push(`export interface ${interfaceName} {`);
    lines.push(`${indentation1}${createProp('children', 'React.ReactNode')};`);
    lines.push(`${indentation1}${createProp(createStatePropName(name), createStateInterfaceName(name))};`);
    props.forEach(p => {
        const { name, type, isOptional } = p;
        lines.push(`${indentation1}${createProp(createSetEventHandlerPropName(name), `(${name}: ${type}) => void`, isOptional)};`);
    });
    lines.push('};');
    return lines;
};

const createContextValueInterfaceName = (name) => `I${toPascalCase(name)}ContextValue`;

const createContextValueInterface = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createCodeDocumentation(`The ${toPascalCase(name)} context value interface.`);
    const interfaceName = createContextValueInterfaceName(name);
    lines.push(`export interface ${interfaceName} {`);
    props.forEach(p => {
        const { name, type } = p;
        lines.push(`${indentation1}${createProp(createPropName(name), type)};`);
        lines.push(`${indentation1}${createProp(createSetPropName(name), `(${name}: ${type}) => void;`)}`);
    });
    lines.push('};');
    return lines;
};

const createDefaultValueName = (name) => `Default${toPascalCase(name)}`;

const createValue = (value, type) => {
    if (type === 'string') {
        return `'${value}'`;
    }

    return value;
};

const createDefaultValues = ({ typeDef }) => {
    const { props } = typeDef;
    const lines = props.map(p => {
        const { name, type, defaultValue } = p;
        return `export const ${createDefaultValueName(name)} = ${createValue(defaultValue, type)};`;
    });
    return lines;
};

const createDefaultStateName = (name) => `Default${toPascalCase(name)}State`;

const createDefaultState = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createCodeDocumentation(`The default ${toPascalCase(name)} state.`);
    const interfaceName = createStateInterfaceName(name);
    const typeName = createDefaultStateName(name);
    lines.push(`export const ${typeName}: ${interfaceName} = {`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${indentation1}${createProp(createStatePropName(name), createDefaultValueName(name))},`);
        lines.push(`${indentation1}${createProp(createSetStatePropName(name), 'undefined')},`);
    });
    lines.push('};');
    return lines;
};

const createDefaultContextValueName = (name) => `Default${toPascalCase(name)}ContextValue`;

const createDefaultContextValue = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createCodeDocumentation(`The default ${toPascalCase(name)} context value.`);
    const interfaceName = createContextValueInterfaceName(name);
    const typeName = createDefaultContextValueName(name);
    lines.push(`export const ${typeName}: ${interfaceName} = {`);
    props.forEach(p => {
        const { name, type } = p;
        lines.push(`${indentation1}${createProp(createPropName(name), createDefaultValueName(name))},`);
        lines.push(`${indentation1}${createProp(createSetPropName(name), `(${name}: ${type}) => {},`)}`);
    });
    lines.push('};');
    return lines;
};

const createStateName = (name) => `${toPascalCase(name)}State`;

const createState = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createCodeDocumentation(`The ${toPascalCase(name)} state.`);
    const interfaceName = createStatePropsInterfaceName(name);
    const typeName = createStateName(name);
    lines.push(`export const ${typeName} = ({`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${indentation3}${createPropName(name)},`);
    });
    lines.push(`${indentation2}}: ${interfaceName}) => {`);
    lines.push(emptyLine);
    props.forEach(p => {
        const { name, type } = p;
        lines.push(`${indentation1}const [ ${createStatePropName(name)}, ${createSetStatePropName(name)} ] = React.useState<${type}>(${createPropName(name)} || ${createDefaultValueName(name)});`);
    });
    lines.push(emptyLine);
    lines.push(`${indentation1}const ${createStatePropName(name)} = {`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${indentation2}${createStatePropName(name)},`);
        lines.push(`${indentation2}${createSetStatePropName(name)},`);
    });
    lines.push(`${indentation1}};`);
    lines.push(emptyLine);
    lines.push(`${indentation1}return ${createStatePropName(name)}`);
    lines.push('};');
    return lines;
};

 const createContextName = (name) => `${toPascalCase(name)}Context`;

const createContext = ({ typeDef }) => {
    const { name } = typeDef;
    const lines = createCodeDocumentation(`The ${toPascalCase(name)} context.`);
    const interfaceName = createContextValueInterfaceName(name);
    const typeName = createContextName(name);
    const defaultValueName = createDefaultContextValueName(name);
    lines.push(`export const ${typeName} = React.createContext<${interfaceName}>(${defaultValueName});`);
    return lines;
};

const createContextProviderName = (name) => `${toPascalCase(name)}ContextProvider`;

const createContextProvider = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createCodeDocumentation(`The ${toPascalCase(name)} context provider.`);
    const typeName = createContextProviderName(name);
    lines.push(`export const ${typeName} = ({`);
    lines.push(`${indentation3}children,`);
    lines.push(`${indentation3}${createStatePropName(name)},`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${indentation3}${createSetEventHandlerPropName(name)},`);
    });
    lines.push(`${indentation2}}: ${createContextProviderPropsInterfaceName(name)}) => {`);
    lines.push(emptyLine);
    lines.push(`${indentation1}const {`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${indentation2}${createStatePropName(name)},`);
        lines.push(`${indentation2}${createSetStatePropName(name)},`);
    });
    lines.push(`${indentation1}} = ${createStatePropName(name)} || {};`);
    lines.push(emptyLine);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${indentation1}React.useEffect(() => {`);
        lines.push(`${indentation2}${createSetEventHandlerPropName(name)} && ${createSetEventHandlerPropName(name)}(${createStatePropName(name)});`);
        lines.push(`${indentation1}}, [ ${createStatePropName(name)}, ${createSetStatePropName(name)}, ${createSetEventHandlerPropName(name)} ]);`);
        lines.push(emptyLine);
    });
    lines.push(`${indentation1}const contextValue: ${createContextValueInterfaceName(name)} = {`);
    props.forEach(p => {
        const { name, type } = p;
        lines.push(`${indentation2}${createProp(createPropName(name), createStatePropName(name))},`);
        lines.push(`${indentation2}${createProp(createSetPropName(name), `(${name}: ${type}) => ${createSetStatePropName(name)} && ${createSetStatePropName(name)}(${createPropName(name)}),`)}`);
    });
    lines.push(`${indentation1}};`);
    lines.push(emptyLine);
    lines.push(`${indentation1}return (`);
    lines.push(`${indentation2}<${createContextName(name)}.Provider value={contextValue}>`);
    lines.push(`${indentation3}{children}`);
    lines.push(`${indentation2}</${createContextName(name)}.Provider>`);
    lines.push(`${indentation1});`);
    lines.push(`};`);
    return lines;
};

const createFileContent = (typeDef, sourceCodeGeneratorInfo) => {
    const lines = [
        createHeader,
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
    .reduce((acc, currentValue) => 
        acc = acc.concat(currentValue).concat([emptyLine]), []);

    const content = lines.join(newLine);
    return content;
};

const createSourceCodes = (result, sourceCodeGeneratorInfo) => 
    new Promise((resolve, reject) => { 
        try {
            const { srcData } = getResultData(result);
            const { types } = srcData;

            const files = types
                .map(t => {
                    const { name } = t;
                    const content = createFileContent(t, sourceCodeGeneratorInfo);
                    const file = { name: `${toCamelCase(name)}Context.ts`, content: content };
                    return file;
                });

            resolve(createOkResult({ files }));
        } catch (err) {
            reject(createErrorResult({ errors: [err] }));
        }
});

module.exports = {
    createSourceCodes
};