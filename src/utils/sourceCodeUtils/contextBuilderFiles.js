'use strict';

const path = require('path');
const { getResultData } = require('../../result');
const { toPascalCase, toCamelCase, toWords, emptyLine, newLine, createIndentation } = require('../stringUtils');
const { createJSDocDescription } = require('./jsDoc');
const { contextBuilderUtilFile } = require('./commonFiles');
const { 
    createPropName,
    createSetPropName,
    createGetPropName,
    createStatePropName,
    createSetEventHandlerPropName,
    createUrlParamPropName,
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
    concatWithEmptyLineButFirstReducer,
    createSetStatePropName
} = require('./common');

const createContextInterfaceName = (name) => `I${toPascalCase(name)}Context`;
const componentPropsInterfaceName = 'IComponentProps';
const createContextBuilderName = (name) => `${toPascalCase(name)}ContextBuilder`;
const createContextBuilderFileName = (name) => `${toCamelCase(name)}ContextBuilder.tsx`;
const syncStateWithLocationName = 'syncStateWithLocation';

const getReactRouterDomVersion = (options) => {
    const { majorVersion = {} } = options;
    const { 'react-router-dom': reactRouterDomVersion = 6 } = majorVersion;
    return reactRouterDomVersion;
};

const createContextBuilderHeader = ({ options, sourceCodeGeneratorInfo, typeDef }) => {
    const { name, contextBuilder = {} } = typeDef;
    const { imports: contextBuilderImports = [] } = contextBuilder

    const reactRouterDomVersion = getReactRouterDomVersion(options);
    const reactDOMImport = reactRouterDomVersion <= 5 ? `import ReactDOM from 'react-dom';` : `import ReactDOM from 'react-dom/client';`;

    const contextImports = [
        createContextProviderName,
        createStateInterfaceName,
        createStateName,
        createDefaultStateName
    ]
    .map(x => x(name))
    .join(', ');

    const contextFileName = path.parse(createContextFileName(name)).name;
    const contextBuilderUtilsFileName = path.parse(contextBuilderUtilFile.name).name;

    const imports = [
        `import React from 'react';`,
        `${reactDOMImport}`,
        `import { History, Location } from 'history';`,
        `import { ${contextImports} } from './${contextFileName}';`,
        `import { createChildren, getHistory, deserializePathname, serializePathname } from './${contextBuilderUtilsFileName}';`
    ]
    .concat(contextBuilderImports);

    const header = createHeader(sourceCodeGeneratorInfo, imports);
    return header;
};

const createContextInterface = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = createJSDocDescription(createIndentation(0), { description: `The ${toPascalCase(name)} context interface.` });
    const interfaceName = createContextInterfaceName(name);
    lines.push(`export interface ${interfaceName} {`);
    
    createJSDocDescription(createIndentation(1), { description: 'The component to be rendered.' })
    .forEach(line => lines.push(line));
    
    lines.push(`${createIndentation(1)}${createProp('Component', '() => JSX.Element')};`);
    lines.push(emptyLine);

    createJSDocDescription(createIndentation(1), {
        description: 'Renderes the component.', 
        params: [
            { type: 'Element | DocumentFragment | null', name: 'container', description: 'The container. Optional parameter.' }
        ]})
    .forEach(line => lines.push(line));

    lines.push(`${createIndentation(1)}${createProp('render', '(container: Element | DocumentFragment | null) => void')};`);
    props.forEach(p => {
        const { name, type } = p;
        lines.push(emptyLine);

        createJSDocDescription(createIndentation(1), { description: `Gets the ${createPropName(name)}.` })
        .forEach(line => lines.push(line));

        lines.push(`${createIndentation(1)}${createProp(createGetPropName(name), `() => ${type}`)};`);
        lines.push(emptyLine);
        
        createJSDocDescription(createIndentation(1), { description: `Sets the ${createPropName(name)}.` })
        .forEach(line => lines.push(line));

        lines.push(`${createIndentation(1)}${createProp(createSetPropName(name), `(${createPropName(name)}: ${type}) => void;`)}`);
    });
    lines.push('}');
    return lines;
};

const createComponentPropsInterface = ({ typeDef }) => {
    const { name, props, contextBuilder = {} } = typeDef;
    const { props: contextBuilderProps = [] } = contextBuilder;
    const lines = [];
    lines.push(`interface ${componentPropsInterfaceName} {`);
    lines.push(`${createIndentation(1)}${createProp('children', 'React.ReactNode')};`);
    lines.push(`${createIndentation(1)}${createProp(createStatePropName(name), createStateInterfaceName(name))};`);
    props.forEach(p => {
        const { name, type, isOptional } = p;
        lines.push(`${createIndentation(1)}${createProp(createPropName(name), `${type}`, isOptional)};`);
        lines.push(`${createIndentation(1)}${createProp(createUrlParamPropName(name), 'string', true)};`);
        lines.push(`${createIndentation(1)}${createProp(createSetEventHandlerPropName(name), `(${name}: ${type}) => void`, true)};`);
    });
    contextBuilderProps.forEach(p => {
        const { name, type, isOptional } = p;
        lines.push(`${createIndentation(1)}${createProp(createPropName(name), `${type}`, isOptional)};`);
    });
    lines.push('}');
    return lines;
};

const createContextBuilderPropsVariable = ({ typeDef }) => {
    const { name, props, contextBuilder = {} } = typeDef;
    const { props: contextBuilderProps = [] } = contextBuilder;
    const defaultStateName = createDefaultStateName(name);
    const lines = [];
    lines.push(`${createIndentation(1)}private props: ${componentPropsInterfaceName} = {`);
    lines.push(`${createIndentation(2)}${createProp('children', 'undefined')},`);
    lines.push(`${createIndentation(2)}${createProp(createStatePropName(name), defaultStateName)},`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${createIndentation(2)}${createProp(createPropName(name), `${defaultStateName}.${createStatePropName(name)}`)},`);
        lines.push(`${createIndentation(2)}${createProp(createSetEventHandlerPropName(name), 'undefined')},`);
        lines.push(`${createIndentation(2)}${createProp(createUrlParamPropName(name), 'undefined')},`);
    });
    contextBuilderProps.forEach(p => {
        const { name, defaultValue = 'undefined' } = p;
        lines.push(`${createIndentation(2)}${createProp(createPropName(name), defaultValue)},`);
    });
    lines.push(`${createIndentation(1)}};`);
    return lines;
};

const createBuildVarDeclarations = ({ typeDef }) => {
    const { props } = typeDef;
    const lines = [];
    lines.push(`${createIndentation(2)}const {`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${createIndentation(3)}${createProp(createPropName(name), createInitialPropName(name))},`);
        lines.push(`${createIndentation(3)}${createUrlParamPropName(name)},`);
    });
    lines.push(`${createIndentation(2)}} = this.props;`);
    return lines;
};

const createBuildSyncStateWithLocation = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = [];
    lines.push(`${createIndentation(2)}const ${syncStateWithLocationName} = ` + 
        `(${createStatePropName(name)}: ${createStateInterfaceName(name)}, ` + 
        `location: Location) => {`);
        lines.push(`${createIndentation(3)}const {`);
        props.forEach(p => {
            const { name } = p;
            lines.push(`${createIndentation(4)}${createSetStatePropName(name)},`);
        });
        lines.push(`${createIndentation(3)}} = ${createStatePropName(name)};`);
        lines.push(`${createIndentation(3)}const pathname = deserializePathname(location.pathname);`);
        props.forEach(p => {
            const { name, type } = p;
            const urlParamName = createUrlParamPropName(name);
            const isParsingNeeded = type.indexOf('string') < 0;
            lines.push(`${createIndentation(3)}const ${createPropName(name)} = ${urlParamName} && ` + 
                `pathname[${urlParamName}] && ` + 
                (isParsingNeeded ? 'JSON.parse(' : '') +
                `decodeURIComponent(pathname[${urlParamName}])` + 
                (isParsingNeeded ? ')' : '') +
                `;`);
        });
        props.forEach(p => {
            const { name } = p;
            const setStateName = createSetStatePropName(name);
            lines.push(`${createIndentation(3)}${createPropName(name)} && ${setStateName} && ${setStateName}(${createPropName(name)});`);
        });
    lines.push(`${createIndentation(2)}};`);
    return lines;
};

const createBuildSyncLocationWithState = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = [];
    lines.push(`${createIndentation(2)}const syncLocationWithState = (${createStatePropName(name)}: ${createStateInterfaceName(name)}, ` + 
        `history: History) => {`);
    lines.push(`${createIndentation(3)}const {`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${createIndentation(4)}${createStatePropName(name)},`);
    });
    lines.push(`${createIndentation(3)}} = ${createStatePropName(name)};`);
    lines.push(`${createIndentation(3)}const pathname = deserializePathname(history.location.pathname);`);
    props.forEach(p => {
        const { name } = p;
        const urlParamName = createUrlParamPropName(name);
        lines.push(`${createIndentation(3)}${urlParamName} && (pathname[${urlParamName}] = encodeURIComponent(${createStatePropName(name)}));`);
    });
    lines.push(`${createIndentation(3)}const serializedPathname = serializePathname(pathname);`);
    lines.push(`${createIndentation(3)}history.replace({ pathname: serializedPathname});`);
    lines.push(`${createIndentation(2)}};`);
    return lines;
};

const createBuildComponent = ({ typeDef }) => {
    const { name, props, contextBuilder = {} } = typeDef;
    const { props: contextBuilderProps = [], contextProviderContent = ['{children}'] } = contextBuilder;
    const statePropName = createStatePropName(name);
    const lines = [];
    lines.push(`${createIndentation(2)}const Component = () => {`);
    lines.push(`${createIndentation(3)}const history = getHistory();`);
    lines.push(`${createIndentation(3)}const ${statePropName} = ${createStateName(name)}({`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${createIndentation(4)}${createProp(createPropName(name), createInitialPropName(name))},`);
    });
    lines.push(`${createIndentation(3)}});`);
    lines.push(`${createIndentation(3)}const {`);
    lines.push(`${createIndentation(4)}children,`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${createIndentation(4)}${createPropName(name)},`);
        lines.push(`${createIndentation(4)}${createUrlParamPropName(name)},`);
    });
    contextBuilderProps.forEach(p => {
        const { name } = p;
        lines.push(`${createIndentation(4)}${createPropName(name)},`);
    });
    lines.push(`${createIndentation(4)}...rest`);
    lines.push(`${createIndentation(3)}} = this.props;`);
    lines.push(`${createIndentation(3)}React.useEffect(() => ${syncStateWithLocationName}(${statePropName}, history.location), []);`);
    lines.push(`${createIndentation(3)}React.useEffect(() => syncLocationWithState(${statePropName}, history), [${statePropName}, history]);`);
    lines.push(`${createIndentation(3)}this.props.${statePropName} = ${statePropName};`);
    lines.push(`${createIndentation(3)}return (`);
    lines.push(`${createIndentation(4)}<${createContextProviderName(name)} {...rest} ${statePropName}={${statePropName}}>`);
    contextProviderContent.map(x => `${createIndentation(5)}${x}`).forEach(line => lines.push(line));
    lines.push(`${createIndentation(4)}</${createContextProviderName(name)}>`);
    lines.push(`${createIndentation(3)});`);
    lines.push(`${createIndentation(2)}};`);
    return lines;
};

const createBuildRender = ({ options, typeDef }) => {
    const lines = [];
    const reactRouterDomVersion = getReactRouterDomVersion(options);
    
    if (reactRouterDomVersion <= 5) {
        lines.push(`${createIndentation(2)}const render = (container: Element | DocumentFragment | null) =>`);
        lines.push(`${createIndentation(3)}ReactDOM.render(`);
        lines.push(`${createIndentation(4)}<React.StrictMode>`);
        lines.push(`${createIndentation(5)}<Component />`);
        lines.push(`${createIndentation(4)}</React.StrictMode>,`);
        lines.push(`${createIndentation(4)}container || document.createElement('div')`);
        lines.push(`${createIndentation(3)});`);
    } else {
        lines.push(`${createIndentation(2)}const render = (container: Element | DocumentFragment | null) =>`);
        lines.push(`${createIndentation(3)}ReactDOM`);
        lines.push(`${createIndentation(4)}.createRoot((container || document.createElement('div')) as HTMLElement)`);
        lines.push(`${createIndentation(4)}.render(`);
        lines.push(`${createIndentation(5)}<React.StrictMode>`);
        lines.push(`${createIndentation(6)}<Component />`);
        lines.push(`${createIndentation(5)}</React.StrictMode>`);
        lines.push(`${createIndentation(4)});`);
    }

    return lines;
};

const createBuildPropGetter = ({ typeDef, prop }) => {
    const { name: typeName } = typeDef;
    const { name: propName } = prop;
    const lines = [];
    lines.push(`${createIndentation(2)}const ${createGetPropName(propName)} = () => {`);
    lines.push(`${createIndentation(3)}const { ${createStatePropName(propName)} } = this.props.${createStatePropName(typeName)} || {};`);
    lines.push(`${createIndentation(3)}return ${createStatePropName(propName)};`);
    lines.push(`${createIndentation(2)}};`);
    return lines;
};

const createBuildPropSetter = ({ typeDef, prop }) => {
    const { name: typeName } = typeDef;
    const { name: propName, type: propType } = prop;
    const lines = [];
    lines.push(`${createIndentation(2)}const ${createSetPropName(propName)} = (${createPropName(propName)}: ${propType}) => {`);
    lines.push(`${createIndentation(3)}const { ${createSetStatePropName(propName)} } = this.props.${createStatePropName(typeName)} || {};`);
    lines.push(`${createIndentation(3)}${createSetStatePropName(propName)} && ${createSetStatePropName(propName)}(${createPropName(propName)});`);
    lines.push(`${createIndentation(2)}};`);
    return lines;
};

const createBuildProps = ({ typeDef }) => {
    const { props } = typeDef;

    const lines = props.map(prop => [
            createBuildPropGetter,
            createBuildPropSetter
        ]
        .map(x => x({ typeDef, prop }))
        .reduce(concatWithEmptyLineButFirstReducer, []) 
    )
    .reduce(concatReducer, []);

    return lines;
};

const createBuildContext = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = [];
    lines.push(`${createIndentation(2)}const context: ${createContextInterfaceName(name)} = {`);
    lines.push(`${createIndentation(3)}Component,`);
    lines.push(`${createIndentation(3)}render,`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${createIndentation(3)}${createGetPropName(name)},`);
        lines.push(`${createIndentation(3)}${createSetPropName(name)},`);
    });
    lines.push(`${createIndentation(2)}};`);
    lines.push(emptyLine);
    lines.push(`${createIndentation(2)}return context;`);
    return lines;
};

const createContextBuilderBuild = ({ options, typeDef }) => {
    const { name } = typeDef;
    const lines = createJSDocDescription(createIndentation(1), {
        description: `Builds the ${toPascalCase(name)} Context.`,
        returns: { type: `${createContextInterfaceName(name)}`, description: `The ${toPascalCase(name)} Context Interface.` }
    });

    lines.push(`${createIndentation(1)}build() {`);

    [
        createBuildVarDeclarations,
        createBuildSyncStateWithLocation,
        createBuildSyncLocationWithState,
        createBuildComponent,
        createBuildRender,
        createBuildProps,
        createBuildContext
    ]
    .map(x => x({ options, typeDef }))
    .reduce(concatWithEmptyLineButFirstReducer, [])
    .forEach(line => lines.push(line));

    lines.push(`${createIndentation(1)}}`);
    return lines;
};

const createContextBuilderWithProperty = ({ prop, valueFunc }) => {
    const { name, type } = prop;
    const lines = [];
    const value = valueFunc ? `${valueFunc}(${createPropName(name)})` : createPropName(name);
    lines.push(`${createIndentation(1)}${createWithPropName(name)}(${createPropName(name)}: ${type}) {`);
    lines.push(`${createIndentation(2)}this.props.${createPropName(name)} = ${value};`)
    lines.push(`${createIndentation(2)}return this;`)
    lines.push(`${createIndentation(1)}}`);
    return lines;
};

const createContextBuilderWithProperties = ({ typeDef }) => {
    const { props, contextBuilder = {} } = typeDef;
    const { props: contextBuilderProps = [] } = contextBuilder;
    const lines = [];
    const childrenPropName = 'children';
    const childrenPropType = '(() => JSX.Element) | (Array<() => JSX.Element>)';

    createJSDocDescription(createIndentation(1), { 
        description: [
            `Sets the ${childrenPropName}.`,
            `All the children within the context will have the same state.`
        ],
        params: [
            { type: childrenPropType, name: childrenPropName, description: `The ${childrenPropName}.` }
        ]
    })
    .forEach(line => lines.push(line));

    createContextBuilderWithProperty({ 
        prop: { name: childrenPropName, type: childrenPropType }, 
        valueFunc: 'createChildren' 
    })
    .forEach(line => lines.push(line));

    props.map(p => {
        const { name, type, defaultValue } = p;
        return [
            { ...p, description: `. Default value: ${createValue(defaultValue, type)}` },
            { name: createUrlParamPropName(name), type: 'string', description: ` to be synchronized with the ${createPropName(name)} state` },
            { name: createSetEventHandlerPropName(name), type: `(${createPropName(name)}: ${type}) => void` }
        ];
    })
    .concat(
        contextBuilderProps.map(p => {
            const { name, type, defaultValue } = p;
            return [
                { ...p, description: `. Default value: ${createValue(defaultValue, type)}` },
            ];
        })
    )
    .reduce(concatReducer, [])
    .forEach(p => {
        const { name, type, description = '' } = p;
        lines.push(emptyLine);

        createJSDocDescription(createIndentation(1), { 
            description: `Sets the ${toWords(createPropName(name))}${description}.`,
            params: [
                { type, name, description: `The ${toWords(name)}.` }
            ]
        })
        .forEach(line => lines.push(line));

        createContextBuilderWithProperty({ prop: p })
        .forEach(line => lines.push(line));
    });

    return lines;
};

const createContextBuilder = ({ options, typeDef }) => {
    const { name } = typeDef;
    const lines = createJSDocDescription(createIndentation(0), {
        description: [
            `The ${toPascalCase(name)} context builder.`,
            `Helps to build the ${toPascalCase(name)} context and manage its state.`
        ]
    });
    const className = createContextBuilderName(name);
    lines.push(`export class ${className} {`);

    [
        createContextBuilderPropsVariable,
        createContextBuilderBuild,
        createContextBuilderWithProperties
    ]
    .map(x => x({ options, typeDef }))
    .reduce(concatWithEmptyLineButFirstReducer, [])
    .forEach(line => lines.push(line));

    lines.push('};');

    lines.push(emptyLine);
    lines.push(`export default ${createContextBuilderName(name)};`);

    return lines;
};

const createContextBuilderFileContent = (options, typeDef, sourceCodeGeneratorInfo) => {
    const lines = [
        createContextBuilderHeader,
        createContextInterface,
        createComponentPropsInterface,
        createContextBuilder
    ]
    .map(x => x({ options, sourceCodeGeneratorInfo, typeDef }))
    .reduce(concatWithEmptyLineReducer, []);

    const content = lines.join(newLine);
    return content;
};

const createContextBuilderFiles = (result, sourceCodeGeneratorInfo) => {
    const { srcData } = getResultData(result);
    const { options = {}, types } = srcData;

    const files = types
        .filter(t => !t.disableContextBuilder)
        .map(t => {
            const { name } = t;
            const content = createContextBuilderFileContent(options, t, sourceCodeGeneratorInfo);
            const file = { name: createContextBuilderFileName(name), content };
            return file;
        });

    return files;
};

module.exports = {
    createContextBuilderFiles
};