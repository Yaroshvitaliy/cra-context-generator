'use strict';

const getCurrentTime = () => {
    const now = new Date();
    return now.toUTCString();
};

module.exports = {
    getCurrentTime
};