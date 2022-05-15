'use strict';

const path = require('path');
const { getResultData } = require('../../result');
const { toPascalCase, toCamelCase, toWords, emptyLine, newLine, createIndentation } = require('../stringUtils');
const { createJSDocDescription } = require('./jsDoc');
const { contextBuilderUtilFile } = require('./utilFiles');
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

const createContextBuilderHeader = ({ sourceCodeGeneratorInfo, typeDef }) => {
    const { name } = typeDef;

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
        `import ReactDOM from 'react-dom';`,
        `import { Router, Route, useHistory } from 'react-router-dom';`,
        `import { History, Location } from 'history';`,
        `import { ${contextImports} } from './${contextFileName}';`,
        `import { createChildren, getHistory, deserializePathname, serializePathname } from './${contextBuilderUtilsFileName}';`
    ];
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
    const { name, props } = typeDef;
    const lines = [];
    lines.push(`interface ${componentPropsInterfaceName} {`);
    lines.push(`${createIndentation(1)}${createProp('children', 'React.ReactNode')};`);
    lines.push(`${createIndentation(1)}${createProp(createStatePropName(name), createStateInterfaceName(name))};`);
    props.forEach(p => {
        const { name, type, isOptional } = p;
        lines.push(`${createIndentation(1)}${createProp(createPropName(name), `${type}`, isOptional)};`);
        lines.push(`${createIndentation(1)}${createProp(createUrlParamPropName(name), 'string', isOptional)};`);
        lines.push(`${createIndentation(1)}${createProp(createSetEventHandlerPropName(name), `(${name}: ${type}) => void`, isOptional)};`);
    });
    lines.push('}');
    return lines;
};

const createContextBuilderPropsVariable = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = [];
    lines.push(`${createIndentation(1)}private props: ${componentPropsInterfaceName} = {`);
    lines.push(`${createIndentation(2)}${createProp('children', 'undefined')},`);
    lines.push(`${createIndentation(2)}${createProp(createStatePropName(name), createDefaultStateName(name))},`);
    props.forEach(p => {
        const { name } = p;
        lines.push(`${createIndentation(2)}${createProp(createPropName(name), 'undefined')},`);
        lines.push(`${createIndentation(2)}${createProp(createSetEventHandlerPropName(name), 'undefined')},`);
        lines.push(`${createIndentation(2)}${createProp(createUrlParamPropName(name), 'undefined')},`);
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
        `location: Location<any>) => {`);
        lines.push(`${createIndentation(3)}const {`);
        props.forEach(p => {
            const { name } = p;
            lines.push(`${createIndentation(4)}${createSetStatePropName(name)},`);
        });
        lines.push(`${createIndentation(3)}} = ${createStatePropName(name)};`);
        lines.push(`${createIndentation(3)}const pathname = deserializePathname(location.pathname);`);
        props.forEach(p => {
            const { name } = p;
            const urlParamName = createUrlParamPropName(name);
            //todo: cast to the type of a property
            lines.push(`${createIndentation(3)}const ${createPropName(name)} = ${urlParamName} && ` + 
                `pathname[${urlParamName}] && ` + 
                `decodeURIComponent(pathname[${urlParamName}]);`);
        });
        props.forEach(p => {
            const { name } = p;
            const setStateName = createSetStatePropName(name);
            lines.push(`${createIndentation(3)}${createPropName(name)} && ${setStateName} && ${setStateName}(${createPropName(name)});`);
        });
    lines.push(`${createIndentation(2)}};`);
    return lines;
};

const createBuildSyncHistoryWithState = ({ typeDef }) => {
    const { name, props } = typeDef;
    const lines = [];
    lines.push(`${createIndentation(2)}const syncHistoryWithState = (${createStatePropName(name)}: ${createStateInterfaceName(name)}, ` + 
        `history: History<any>) => {`);
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
    lines.push(`${createIndentation(3)}history.replace({ pathname:  serializedPathname});`);
    lines.push(`${createIndentation(2)}};`);
    return lines;
};

const createBuildRouteComponent = ({ typeDef }) => {
    const { name, props } = typeDef;
    const statePropName = createStatePropName(name);
    const lines = [];
    lines.push(`${createIndentation(2)}const RouteComponent  = () => {`);
    lines.push(`${createIndentation(3)}const history = useHistory();`);
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
    lines.push(`${createIndentation(4)}...rest`);
    lines.push(`${createIndentation(3)}} = this.props;`);
    lines.push(`${createIndentation(3)}React.useEffect(() => ${syncStateWithLocationName}(${statePropName}, history.location), []);`);
    lines.push(`${createIndentation(3)}React.useEffect(() => syncHistoryWithState(${statePropName}, history), [${statePropName}, history]);`);
    lines.push(`${createIndentation(3)}this.props.${statePropName} = ${statePropName};`);
    lines.push(`${createIndentation(3)}return (`);
    lines.push(`${createIndentation(4)}<${createContextProviderName(name)} {...rest} ${statePropName}={${statePropName}}>`);
    lines.push(`${createIndentation(5)}{ children }`);
    lines.push(`${createIndentation(4)}</${createContextProviderName(name)}>`);
    lines.push(`${createIndentation(3)});`);
    lines.push(`${createIndentation(2)}};`);
    return lines;
};

const createBuildComponent = ({ typeDef }) => {
    const lines = [];
    lines.push(`${createIndentation(2)}const Component = () => (`);
    lines.push(`${createIndentation(3)}<Router history={getHistory()}>`);
    lines.push(`${createIndentation(4)}<Route>`);
    lines.push(`${createIndentation(5)}<RouteComponent />`);
    lines.push(`${createIndentation(4)}</Route>`);
    lines.push(`${createIndentation(3)}</Router>`);
    lines.push(`${createIndentation(2)});`);
    return lines;
};

const createBuildRender = ({ typeDef }) => {
    const lines = [];
    lines.push(`${createIndentation(2)}const render = (container: Element | DocumentFragment | null) =>`);
    lines.push(`${createIndentation(3)}ReactDOM.render(`);
    lines.push(`${createIndentation(4)}<React.StrictMode>`);
    lines.push(`${createIndentation(5)}<Component />`);
    lines.push(`${createIndentation(4)}</React.StrictMode>,`);
    lines.push(`${createIndentation(4)}container || document.createElement('div')`);
    lines.push(`${createIndentation(3)});`);
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

const createContextBuilderBuild = ({ typeDef }) => {
    const { name } = typeDef;
    const lines = createJSDocDescription(createIndentation(1), {
        description: `Builds the ${toPascalCase(name)} Context.`,
        returns: { type: `${createContextInterfaceName(name)}`, description: `The ${toPascalCase(name)} Context Interface.` }
    });

    lines.push(`${createIndentation(1)}build() {`);

    [
        createBuildVarDeclarations,
        createBuildSyncStateWithLocation,
        createBuildSyncHistoryWithState,
        createBuildRouteComponent,
        createBuildComponent,
        createBuildRender,
        createBuildProps,
        createBuildContext
    ]
    .map(x => x({ typeDef }))
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
    const { props } = typeDef;
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

const createContextBuilder = ({ typeDef }) => {
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
    .map(x => x({ typeDef }))
    .reduce(concatWithEmptyLineButFirstReducer, [])
    .forEach(line => lines.push(line));

    lines.push('};');

    lines.push(emptyLine);
    lines.push(`export default ${createContextBuilderName(name)};`);

    return lines;
};

const createContextBuilderFileContent = (typeDef, sourceCodeGeneratorInfo) => {
    const lines = [
        createContextBuilderHeader,
        createContextInterface,
        createComponentPropsInterface,
        createContextBuilder
    ]
    .map(x => x({ sourceCodeGeneratorInfo, typeDef }))
    .reduce(concatWithEmptyLineReducer, []);

    const content = lines.join(newLine);
    return content;
};

const createContextBuilderFiles = (result, sourceCodeGeneratorInfo) => {
    const { srcData } = getResultData(result);
    const { types } = srcData;

    const files = types
        .filter(t => !t.disableContextBuilder)
        .map(t => {
            const { name } = t;
            const content = createContextBuilderFileContent(t, sourceCodeGeneratorInfo);
            const file = { name: createContextBuilderFileName(name), content };
            return file;
        });

    return files;
};

module.exports = {
    createContextBuilderFiles
};