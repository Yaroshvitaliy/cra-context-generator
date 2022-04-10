'use strict';

const createOkResult = (data) => ({ isErrorResult: false, data });

const createErrorResult = (data) => ({ isErrorResult: true, data });

const isOkResult = (result) => {
    const { isErrorResult = false } = result;
    return !isErrorResult;
};

const isErrorResult = (result) => !isOkResult(result);

const getResultData = (result) => {
    const { data } = result;
    return data;
};

const mapResultData = (result, mapper) => {
    const oldData = getResultData(result);
    const newData = mapper(oldData);
    return newData;
};

const mapOkResult = (result, mapper) => {
    const data = mapResultData(result, mapper);
    return createOkResult(data);
};

const mapErrorResult = (result, mapper) => {
    const data = mapResultData(result, mapper);
    return createErrorResult(data);
};

module.exports = {
    createOkResult,
    createErrorResult,
    isOkResult,
    isErrorResult,
    getResultData,
    mapOkResult,
    mapErrorResult
};