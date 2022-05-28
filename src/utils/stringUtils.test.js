'use strict';

const { toPascalCase, toCamelCase, toWords, createIndentation } = require('./stringUtils');

test('toPascalCase for camelCase to be CamelCase', () => {
    expect(toPascalCase('camelCase')).toBe('CamelCase');
});

test('toPascalCase for PascalCase to be PascalCase', () => {
    expect(toPascalCase('PascalCase')).toBe('PascalCase');
});

test('toCamelCase for camelCase to be camelCase', () => {
    expect(toCamelCase('camelCase')).toBe('camelCase');
});

test('toCamelCase for PascalCase to be pascalCase', () => {
    expect(toCamelCase('PascalCase')).toBe('pascalCase');
});

test('toWords for Oneword to be oneword', () => {
    expect(toWords('Oneword')).toBe('oneword');
});

test('toWords for twoWords to be two words', () => {
    expect(toWords('twoWords')).toBe('two words');
});

test('toWords for ABC to be ABC', () => {
    expect(toWords('ABC')).toBe('abc');
});

test('createIndentation for 2 to be "        "', () => {
    expect(createIndentation(2)).toBe('        ');
});