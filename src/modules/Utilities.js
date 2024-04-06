// Utility functions

export const createElement = (type, properties = {}) =>
    Object.assign(document.createElement(type), properties)
