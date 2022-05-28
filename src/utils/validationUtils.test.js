'use strict';

const { validateArgs } = require('./validationUtils');

test('validateArgs should work properly for null args', () => {
    validateArgs(null, null)
        .catch(e => {
            const { errors } = e;
            expect(errors.length).toBe(2);
        });
});

test('validateArgs should work properly for empty args', () => {
    validateArgs(' ', ' ')
        .catch(e => {
            const { errors } = e;
            expect(errors.length).toBe(2);
        });
});

test('validateArgs should work properly for empty src', () => {
    validateArgs(' ', 'dest')
        .catch(e => {
            const { errors } = e;
            expect(errors.length).toBe(1);
        });
});

test('validateArgs should work properly for empty dest', () => {
    validateArgs('src', '')
        .catch(e => {
            const { errors } = e;
            expect(errors.length).toBe(1);
        });
});
