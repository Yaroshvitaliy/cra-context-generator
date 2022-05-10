// Generated by cra-context-generator@1.0.0 on Mon, 09 May 2022 12:22:07 GMT.
// Do not edit this file manually unless you disabled its code generation.
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, useHistory } from 'react-router-dom';
import { History, Location } from 'history';
import { AppContextProvider, IAppState, AppState, DefaultAppState } from './appContext';
import { createChildren, getHistory, deserializePathname, serializePathname } from './contextBuilderUtils';

/**
 * The App context interface.
 */
export interface IAppContext {
    /**
     * The component to be rendered.
     */
    Component: () => JSX.Element;

    /**
     * Renderes the component.
     *
     * @param {Element | DocumentFragment | null} container The container. Optional parameter.
     */
    render: (container: Element | DocumentFragment | null) => void;

    /**
     * Gets the language.
     */
    getLanguage: () => string;

    /**
     * Sets the language.
     */
    setLanguage: (language: string) => void;

    /**
     * Gets the theme.
     */
    getTheme: () => string;

    /**
     * Sets the theme.
     */
    setTheme: (theme: string) => void;
};

export interface IComponentProps  {
    children: React.ReactNode;
    appState: IAppState;
    language?: string;
    languageUrlParam?: string;
    languageSetEventHandler?: (language: string) => void;
    theme?: string;
    themeUrlParam?: string;
    themeSetEventHandler?: (theme: string) => void;
};

/**
 * The App context builder.
 * Helps to build the App context and manage its state.
 */
export class AppContextBuilder {
    private props: IComponentProps  = {
        children: undefined,
        appState: DefaultAppState,
        language: undefined,
        languageUrlParam: undefined,
        languageSetEventHandler: undefined,
        theme: undefined,
        themeUrlParam: undefined,
        themeSetEventHandler: undefined,
    };

    /**
     * Builds the App Context.
     *
     * @returns {IAppContext} The App Context Interface.
     */
    build() {
    }

    /**
     * Sets the children.
     * All the children within the context will have the same state.
     *
     * @param {(() => JSX.Element) | (Array<() => JSX.Element>)} children The children.
     */
    withChildren(children: (() => JSX.Element) | (Array<() => JSX.Element>)) {
        this.props.children = createChildren(children);
        return this;
    }

    /**
     * Sets the language. Default value: 'en'.
     *
     * @param {string} language The language.
     */
    withLanguage(language: string) {
        this.props.language = language;
        return this;
    }

    /**
     * Sets the language url param to be synchronized with the language state.
     *
     * @param {string} languageUrlParam The language url param.
     */
    withLanguageUrlParam(languageUrlParam: string) {
        this.props.languageUrlParam = languageUrlParam;
        return this;
    }

    /**
     * Sets the language set event handler.
     *
     * @param {(language: string) => void} languageSetEventHandler The language set event handler.
     */
    withLanguageSetEventHandler(languageSetEventHandler: (language: string) => void) {
        this.props.languageSetEventHandler = languageSetEventHandler;
        return this;
    }

    /**
     * Sets the theme. Default value: 'default'.
     *
     * @param {string} theme The theme.
     */
    withTheme(theme: string) {
        this.props.theme = theme;
        return this;
    }

    /**
     * Sets the theme url param to be synchronized with the theme state.
     *
     * @param {string} themeUrlParam The theme url param.
     */
    withThemeUrlParam(themeUrlParam: string) {
        this.props.themeUrlParam = themeUrlParam;
        return this;
    }

    /**
     * Sets the theme set event handler.
     *
     * @param {(theme: string) => void} themeSetEventHandler The theme set event handler.
     */
    withThemeSetEventHandler(themeSetEventHandler: (theme: string) => void) {
        this.props.themeSetEventHandler = themeSetEventHandler;
        return this;
    }
};

export default AppContextBuilder;
