'use strict';

const createJSDocDescription = (indetation, data) => {
    const { description, params, returns } = data;
    const lines = [];
    lines.push(`${indetation}/**`);

    if (Array.isArray(description)) {
        description.forEach(line => lines.push(`${indetation} * ${line}`));
    } else {
        lines.push(`${indetation} * ${description}`);
    }

    if (params && params.length && params.length > 0) {
        lines.push(`${indetation} *`);
        params.forEach(param => {
            const { type, name, description } = param;
            lines.push(`${indetation} * @param {${type}} ${name} ${description}`);
        });
    }

    if (returns) {
        const { type: returnType, description: returnDescription } = returns;
        lines.push(`${indetation} *`);
        lines.push(`${indetation} * @returns {${returnType}} ${returnDescription}`);
    }

    lines.push(`${indetation} */`);
    return lines;
};

module.exports = {
    createJSDocDescription
};