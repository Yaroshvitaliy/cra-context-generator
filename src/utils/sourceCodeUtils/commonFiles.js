'use strict';

const contextBuilderUtilsContent = 
`import React from 'react';
import { createHashHistory } from 'history';

const createKey = () => Math.random().toString(36).substr(2, 5);

const createChild = (type: () => JSX.Element) => React.createElement(type);

const createChildWithKey = (type: () => JSX.Element) => React.createElement(type, { key: createKey() });

export const createChildren = (content: (() => JSX.Element) | (Array<() => JSX.Element>)) => {
    let children: React.ReactNode;
    
    if (Array.isArray(content)) {
        children = (content as Array<() => JSX.Element>).map(createChildWithKey)
    } else {
        children = createChild(content as () => JSX.Element);
    }

    return children;
};

const history = createHashHistory();

export const getHistory = () => history;

export const deserializePathname = (pathname: string) => {
    const normalizedPathname = (pathname ? (pathname[0] === '/' ? pathname.substr(1) : pathname) : '');
    const deserializedPathname = normalizedPathname.length
        ? normalizedPathname
            .split('&')
            .reduce((acc, kv) => {
                const [key, value] = kv.split('=');
                acc[key] = value;
                return acc;
            }, {} as any)
        : {};
    return deserializedPathname;
};

export const serializePathname = (pathname: any) =>
    Object.keys(pathname)
        .map(key => ` + '`' + '${key}=${pathname[key]}' + '`' + `)
        .sort()
        .join('&');`;

const createCustomRouterContent = (options) => {
    const { majorVersion = {}} = options || {};
    const { 'react-router-dom': reactRouterDom = 6 } = majorVersion;
    let historyListener;
    let routerComponent;    
    if (reactRouterDom < 6) {
        historyListener = 'React.useLayoutEffect(() => history.listen((location, action) => setState({ location, action })), [history]);';
        routerComponent =  '<Router {...props} history={history} />';
    } else {
        historyListener = 'React.useLayoutEffect(() => history.listen(setState), [history]);';
        routerComponent = '<Router {...props} location={state.location} navigationType={state.action} navigator={history} />';
    }

    const content =
`
import React from 'react';
import { Router } from 'react-router-dom';
import { History } from 'history'

export interface ICustomRouterProps {
    children: React.ReactNode;
    history: History;
}
        
export const CustomRouter = ({ history, ...props }: ICustomRouterProps) => {
    const [state, setState] = React.useState({
        action: history.action,
        location: history.location
    });
    
    ${historyListener}
    
    return (
        ${routerComponent}
    );
};

export default CustomRouter;`;

    return content;
};

const contextBuilderUtilFile = { name: 'contextBuilderUtils.ts', content: contextBuilderUtilsContent };

const createCustomRouterFile = (options) => ({ name: 'CustomRouter.tsx', content: createCustomRouterContent(options) });

module.exports = {
    contextBuilderUtilFile,
    createCustomRouterFile
};